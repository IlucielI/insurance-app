import React from 'react';

export interface ChatCitation {
  id: string;
  source: string;
  page?: number;
}

export interface ChatMessageBubbleProps {
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: ChatCitation[];
  className?: string;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  sender,
  content,
  timestamp,
  citations,
  className = '',
}) => {
  const isUser = sender === 'user';

  return (
    <div
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5 ${className}`}
    >
      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium px-1">
        <span>{isUser ? 'Anda' : '🤖 AI Asuransi Cerdas'}</span>
        <span>•</span>
        <span>{timestamp}</span>
      </div>

      <div
        className={`max-w-[85%] sm:max-w-md rounded-2xl px-4 py-3 text-xs leading-relaxed text-left ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs'
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>

        {/* Citations / Source Tags */}
        {!isUser && citations && citations.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Referensi Klausul Resmi:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {citations.map((cite) => (
                <span
                  key={cite.id}
                  className="inline-flex items-center gap-1 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                >
                  <span>📜 {cite.source}</span>
                  {cite.page && <span>(Hal. {cite.page})</span>}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
