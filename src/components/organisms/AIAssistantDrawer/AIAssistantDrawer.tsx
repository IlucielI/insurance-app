'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { ChatMessageBubble, ChatMessageBubbleProps } from '@/components/molecules/ChatMessageBubble';

export interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  className = '',
}) => {
  const [messages, setMessages] = useState<Omit<ChatMessageBubbleProps, 'className'>[]>([
    {
      sender: 'assistant',
      content:
        'Halo! Saya Asisten AI InsuRisk. Saya siap membantu Anda menjelaskan klausul polis, menghitung estimasi premi, atau menjawab pertanyaan seputar verifikasi underwriting 4 pilar. Ada yang bisa saya bantu?',
      timestamp: 'Baru saja',
      citations: [
        { id: 'c1', source: 'Ketentuan Polis Umum OJK No. 23/POJK.05/2015', page: 4 },
      ],
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const scrollToBottom = () => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (text?: string) => {
    const messageToSend = text || inputMessage;
    if (!messageToSend.trim() || isTyping) return;

    const userMsg: Omit<ChatMessageBubbleProps, 'className'> = {
      sender: 'user',
      content: messageToSend,
      timestamp: 'Baru saja',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setIsTyping(false);
      const aiReply: Omit<ChatMessageBubbleProps, 'className'> = {
        sender: 'assistant',
        content:
          'Berdasarkan ketentuan polis standar Term Life Guard Plus, uang pertanggungan hingga Rp 1 Miliar tidak memerlukan pemeriksaan medis di rumah sakit selama indeks massa tubuh (BMI) normal dan tidak ada riwayat rawat inap kritis 2 tahun terakhir.',
        timestamp: 'Baru saja',
        citations: [
          { id: 'c2', source: 'Underwriting Guidelines Term Life v2.4', page: 12 },
          { id: 'c3', source: 'Klausul Bebas Cek Medis OJK', page: 7 },
        ],
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 700);
  };

  const quickPrompts = [
    'Berapa batas premi untuk bebas cek medis?',
    'Apa saja 4 pilar verifikasi underwriting?',
    'Bagaimana jika rasio cicilan (DSR) saya di atas 15%?',
  ];

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs ${className}`}>
      <div className="bg-slate-50 w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 text-left animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">AI Insurance Assistant</h4>
                <Badge variant="emerald" size="sm">Online</Badge>
              </div>
              <p className="text-[11px] text-slate-400">Trained on OJK & AAJI Policy Database</p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Tutup Asisten"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <ChatMessageBubble
              key={`msg-${idx}-${msg.timestamp}`}
              sender={msg.sender}
              content={msg.content}
              timestamp={msg.timestamp}
              citations={msg.citations}
            />
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2 bg-white rounded-xl border border-slate-200 w-fit">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>AI sedang menelusuri database polis...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="p-3 bg-white border-t border-slate-100 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
            Pertanyaan Populer:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={`prompt-${idx}`}
                type="button"
                onClick={() => handleSend(prompt)}
                className="text-[11px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200/80 transition-all text-left cursor-pointer"
              >
                💡 {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Tanyakan hal seputar asuransi, klaim, atau premi..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
            <Button size="sm" variant="primary" type="submit" disabled={!inputMessage.trim() || isTyping}>
              Kirim 🚀
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
