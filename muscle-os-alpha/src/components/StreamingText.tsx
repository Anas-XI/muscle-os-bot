import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface Props {
  content: string;
  onComplete?: () => void;
}

export function StreamingText({ content, onComplete }: Props) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!content) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      if (indexRef.current < content.length) {
        indexRef.current += 3; // 3 chars per tick for speed
        setDisplayed(content.slice(0, indexRef.current));
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        setDisplayed(content);
        onComplete?.();
      }
    }, 15);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [content, onComplete]);

  useEffect(() => {
    if (displayed.length >= content.length && content.length > 0) {
      onComplete?.();
    }
  }, [displayed, content, onComplete]);

  const text = displayed || content;

  return (
    <div className="markdown text-sm leading-relaxed">
      <ReactMarkdown>{text}</ReactMarkdown>
      {text.length < content.length && (
        <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-0.5" />
      )}
    </div>
  );
}
