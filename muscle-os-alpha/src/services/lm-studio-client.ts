import { LM_STUDIO_CONFIG } from '../config/lm-studio';

interface ChatMessageInput {
  role: string;
  content: string;
}

interface ModelInfo {
  id: string;
  name: string;
  path?: string;
}

export class LmStudioError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LmStudioError';
  }
}

let detectedModel: string | null = null;
let lastError: string | null = null;

export function getLastError(): string | null {
  return lastError;
}

export function resetConnectionState(): void {
  detectedModel = null;
  lastError = null;
}

export async function detectModel(): Promise<string | null> {
  try {
    const response = await fetch(`${LM_STUDIO_CONFIG.baseUrl}/models`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const body = await response.json();
    const models: ModelInfo[] = body?.data ?? [];
    if (models.length === 0) return null;
    detectedModel = models[0].id;
    return detectedModel;
  } catch {
    return null;
  }
}

export function getActiveModel(): string {
  return detectedModel ?? LM_STUDIO_CONFIG.model;
}

/**
 * Test the chat endpoint with a minimal request to verify the model works.
 * Returns null on success, or an error message string on failure.
 */
export async function testChatEndpoint(): Promise<string | null> {
  try {
    const response = await fetch(`${LM_STUDIO_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        model: getActiveModel(),
        messages: [{ role: 'user', content: 'Say hello' }],
        max_tokens: 10,
        stream: false,
      }),
    });

    if (!response.ok) {
      let text = await response.text().catch(() => '');
      // Try JSON error body first
      try {
        const errBody = JSON.parse(text);
        text = errBody?.error?.message || errBody?.message || text;
      } catch {
        // plain text
      }
      return cleanLmStudioError(text || `HTTP ${response.status}`);
    }

    const body = await response.json();
    const content = body?.choices?.[0]?.message?.content;
    if (!content) return 'Model returned empty response';
    return null; // success
  } catch (err: unknown) {
    if (err instanceof Error) return err.message;
    return 'Unknown connection error';
  }
}

export async function* streamChat(
  messages: ChatMessageInput[],
  options?: { temperature?: number; maxTokens?: number }
): AsyncGenerator<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  const safeMessages = messages.map((m) => ({
    role: m.role,
    content: typeof m.content === 'string' ? m.content : String(m.content),
  }));

  try {
    const response = await fetch(`${LM_STUDIO_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: getActiveModel(),
        messages: safeMessages,
        temperature: options?.temperature ?? LM_STUDIO_CONFIG.defaultTemperature,
        max_tokens: options?.maxTokens ?? LM_STUDIO_CONFIG.maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      let errorMsg: string;
      try {
        const errBody = await response.json();
        errorMsg = errBody?.error?.message || errBody?.message || JSON.stringify(errBody);
      } catch {
        errorMsg = await response.text().catch(() => '');
      }

      // Handle known LM Studio error patterns
      errorMsg = cleanLmStudioError(errorMsg);
      lastError = errorMsg;
      throw new LmStudioError(errorMsg);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new LmStudioError('No response body from LM Studio.');

    const decoder = new TextDecoder();
    let buffer = '';
    lastError = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);

          if (parsed.error) {
            const errMsg = cleanLmStudioError(parsed.error.message || JSON.stringify(parsed.error));
            lastError = errMsg;
            throw new LmStudioError(errMsg);
          }

          const content = parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.text || '';
          if (content) yield content;
        } catch (err) {
          if (err instanceof LmStudioError) throw err;
        }
      }
    }
  } finally {
    clearTimeout(timeout);
  }
}

function cleanLmStudioError(msg: string): string {
  if (!msg) return 'Unknown LM Studio error';

  if (msg.includes('Cannot read') && msg.includes('image')) {
    return `LM Studio cannot read the model file. This usually means the model file was moved or deleted.

To fix:
1. Open LM Studio
2. Go to the "Models" tab
3. Find gemma-4-4b-it in your list
4. If it shows "file not found", remove it and re-download
5. Then go to "Local Inference Server" and click "Start Server"

If the problem persists, try loading a different model or restarting LM Studio.`;
  }

  if (msg.includes('model not found') || msg.includes('does not exist')) {
    return `Model "${getActiveModel()}" not found in LM Studio. 

To fix:
1. Open LM Studio
2. Go to the "Models" tab
3. Make sure gemma-4-4b-it is downloaded and loaded
4. Go to "Local Inference Server" and click "Start Server"`;
  }

  if (msg.includes('not support')) {
    return `The loaded model "${getActiveModel()}" does not support this type of request. Make sure you have loaded a text-only GGUF model, not a vision/multimodal model.`;
  }

  return msg;
}

export async function checkConnection(): Promise<{
  connected: boolean;
  modelName: string | null;
  error: string | null;
}> {
  // Step 1: Check if LM Studio server is reachable
  let serverReachable = false;
  let serverError: string | null = null;

  // Try /v1/models first (standard OpenAI-compat endpoint)
  try {
    const resp = await fetch(`${LM_STUDIO_CONFIG.baseUrl}/models`, {
      signal: AbortSignal.timeout(5000),
    });
    serverReachable = resp.ok || resp.status === 404;
    if (!resp.ok && resp.status !== 404) {
      serverError = `Server returned status ${resp.status}`;
    }
  } catch {
    serverReachable = false;
    serverError = 'Connection refused';
  }

  if (!serverReachable) {
    return {
      connected: false,
      modelName: null,
      error: serverError,
    };
  }

  // Step 2: Detect loaded model
  const model = await detectModel();

  if (!model) {
    return {
      connected: true,
      modelName: null,
      error: 'Server is running but no model is loaded. Open LM Studio → "My Models" → Load gemma-4-4b-it → "Start Server".',
    };
  }

  // Step 3: Test the model actually works
  const chatError = await testChatEndpoint();
  if (chatError) {
    return {
      connected: true,
      modelName: model,
      error: chatError,
    };
  }

  return { connected: true, modelName: model, error: null };
}
