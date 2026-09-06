'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ChatSession,
  ChatMessage,
  PopularTopic,
  KnowledgeEngineStatus,
} from '@/types/assistant.types';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Spinner } from '@/components/atoms/Spinner';
import { assistantService } from '@/server/di';

export interface AssistantWorkbenchProps {
  initialSessions: ChatSession[];
  initialPopularTopics: PopularTopic[];
  initialEngineStatus: KnowledgeEngineStatus;
}

export const AssistantWorkbench: React.FC<AssistantWorkbenchProps> = ({
  initialSessions,
  initialPopularTopics,
  initialEngineStatus,
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string>(
    initialSessions[0]?.id || ''
  );
  const [inputText, setInputText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages, isSending]);

  const messageCounterRef = useRef(0);

  const handleCreateNewSession = async () => {
    try {
      const newSession = await assistantService.startNewSession();
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
    } catch (error) {
      console.error('Failed to create new session', error);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText ?? inputText).trim();
    if (!textToSend || isSending || !activeSession) return;

    setInputText('');
    setIsSending(true);

    messageCounterRef.current += 1;
    const tempId = `temp-${messageCounterRef.current}`;
    // Optimistically append user message to UI
    const tempUserMsg: ChatMessage = {
      id: tempId,
      sender: 'user',
      content: textToSend,
      timestamp: 'Baru saja',
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSession.id) {
          return {
            ...s,
            messages: [...s.messages, tempUserMsg],
          };
        }
        return s;
      })
    );

    try {
      const aiResponse = await assistantService.sendMessage(
        activeSession.id,
        textToSend
      );

      // Attempt to refresh updated session with refreshed metadata (e.g. title)
      try {
        const refreshedSession = await assistantService.getChatSession(
          activeSession.id
        );

        if (refreshedSession) {
          setSessions((prev) =>
            prev.map((s) => (s.id === activeSession.id ? refreshedSession : s))
          );
          return;
        }
      } catch (refreshErr) {
        console.error('Failed to refresh session, applying fallback', refreshErr);
      }

      // Fallback: append response directly if refresh unavailable
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              messages: [...s.messages, aiResponse],
            };
          }
          return s;
        })
      );
    } catch (error) {
      console.error('Failed to send message', error);
      // Rollback optimistic user message to prevent UI inconsistency on failure
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              messages: s.messages.filter((m) => m.id !== tempId),
            };
          }
          return s;
        })
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleClearChat = async () => {
    if (!activeSession) return;
    try {
      await assistantService.resetSessionMessages(activeSession.id);
      const refreshed = await assistantService.getChatSession(activeSession.id);
      if (refreshed) {
        setSessions((prev) =>
          prev.map((s) => (s.id === activeSession.id ? refreshed : s))
        );
      }
    } catch (error) {
      console.error('Failed to reset session', error);
    }
  };

  const handleActionClick = (target: string, actionType: 'navigate' | 'download') => {
    if (actionType === 'download') {
      try {
        // Validate URL scheme against dangerous schemes like javascript:
        let validUrl: string;
        if (target.startsWith('/') || target.startsWith('./')) {
          validUrl = target;
        } else {
          const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
          const parsed = new URL(target, origin);
          if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
            console.error('Invalid URL scheme blocked:', parsed.protocol);
            return;
          }
          validUrl = parsed.toString();
        }

        const fileName = validUrl.split('/').pop()?.split('?')[0] || 'dokumen-resmi.pdf';
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
          const link = document.createElement('a');
          link.href = validUrl;
          link.setAttribute('download', fileName);
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        setDownloadNotice(
          validUrl.includes('klaim')
            ? 'Formulir Klaim Resmi (PDF) berhasil diunduh ke perangkat Anda.'
            : `Dokumen Resmi (${fileName}) berhasil diunduh ke perangkat Anda.`
        );
        setTimeout(() => setDownloadNotice(null), 4000);
      } catch (err) {
        console.error('Failed to process download URL', err);
      }
    }
  };

  const promptChips = [
    '💡 Berapa batas usia tertanggung?',
    '💡 Ubah persentase ahli waris?',
    '💡 Berapa premi terendah per bulan?',
  ];

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Header Title */}
      <div className="space-y-2 text-left">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Beranda
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Konsultasi AI Asisten</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Asisten AI Konsultasi Polis & Panduan Klaim
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Ditenagai oleh RAG pgvector Core API untuk konsultasi polis, simulasi premi, serta panduan
          berkas klaim resmi berstandar OJK.
        </p>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Rail / Sidebar */}
        <aside className="lg:col-span-4 space-y-6 text-left">
          {/* New Chat CTA */}
          <Button
            onClick={handleCreateNewSession}
            variant="primary"
            size="md"
            className="w-full justify-center h-11 font-bold shadow-md shadow-blue-500/20 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            + Percakapan Baru
          </Button>

          {/* Session History & Topics */}
          <Card className="p-4 sm:p-5 bg-white border border-slate-200 shadow-sm rounded-xl space-y-4">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider block uppercase">
              RIWAYAT PERCAKAPAN
            </span>
            <div className="space-y-2">
              {sessions.map((session) => {
                const isActive = session.id === activeSessionId;
                return (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => setActiveSessionId(session.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all border ${
                      isActive
                        ? 'bg-blue-50 border-blue-200 shadow-2xs'
                        : 'bg-slate-50/80 border-slate-100 hover:border-slate-300 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        className={`text-xs truncate block ${
                          isActive ? 'font-bold text-blue-800' : 'font-semibold text-slate-700'
                        }`}
                      >
                        {session.title}
                      </span>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <span
                      className={`text-[11px] block truncate mt-0.5 ${
                        isActive ? 'text-blue-600 font-medium' : 'text-slate-500'
                      }`}
                    >
                      {session.lastActive}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-3">
              <span className="text-[11px] font-bold text-slate-400 tracking-wider block uppercase">
                TOPIK BANTUAN POPULER
              </span>
              <div className="space-y-1.5">
                {initialPopularTopics.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleSendMessage(topic.prompt)}
                    className="w-full text-left py-2 px-3 rounded-md text-xs font-medium text-slate-700 hover:text-blue-700 hover:bg-blue-50/60 transition-colors flex items-center gap-2.5 bg-white border border-slate-100 hover:border-blue-200"
                  >
                    <span className="text-sm shrink-0">{topic.icon}</span>
                    <span className="truncate">{topic.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Grounding Engine Widget */}
          <div className="p-4 sm:p-5 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-sky-400 tracking-wider uppercase">
                {initialEngineStatus.version}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[10px] font-bold">
                🟢 {initialEngineStatus.status === 'online' ? 'Online & Grounded' : 'Offline'}
              </span>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">Basis Pengetahuan Resmi OJK</h4>
              <ul className="text-[11px] text-slate-400 space-y-1.5 mt-2 leading-relaxed">
                <li>• {initialEngineStatus.indexedDocsCount}+ Dokumen Polis Baku Terindeks</li>
                <li>• Semantic Search pgvector (HNSW {initialEngineStatus.vectorDimension}-d)</li>
                <li>• SLA Response: {initialEngineStatus.avgSlaMs}ms (Avg)</li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Right Rail / Main Chat Area */}
        <section className="lg:col-span-8 space-y-4 text-left">
          <Card className="flex flex-col h-[750px] sm:h-[840px] bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-[42px] h-[42px] rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center text-xl shrink-0">
                  🤖
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                      Bayu Insurance AI Underwriting Assistant
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold whitespace-nowrap">
                      🟢 Siaga 24/7 (SLA &lt;1s)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Terdaftar & Diawasi OJK • Grounding Dokumen Polis Baku • SLA Respon &lt; 1 Detik
                  </p>
                </div>
              </div>

              <Button
                onClick={handleClearChat}
                variant="outline"
                size="sm"
                className="text-xs bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 rounded-md font-semibold shrink-0"
              >
                Bersihkan Chat 🔄
              </Button>
            </div>

            {/* Notification banner if action performed */}
            {downloadNotice && (
              <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
                <span>✓ {downloadNotice}</span>
                <button
                  type="button"
                  aria-label="Tutup notifikasi"
                  onClick={() => setDownloadNotice(null)}
                  className="text-emerald-700 font-bold hover:text-emerald-900"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {activeSession?.messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-2xl ${
                      isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    }`}
                  >
                    {/* Avatar Icon */}
                    <div
                      className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-sm shrink-0 ${
                        isUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-50 border border-blue-200 text-blue-600'
                      }`}
                    >
                      {isUser ? '👤' : '✨'}
                    </div>

                    {/* Bubble Content */}
                    <div className="space-y-1.5">
                      <div
                        className={`p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed ${
                          isUser
                            ? 'bg-blue-600 text-white rounded-tr-xs shadow-sm'
                            : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs'
                        }`}
                      >
                        {!isUser && (
                          <div className="flex items-center gap-1.5 font-bold text-xs text-blue-600 mb-1.5">
                            <span>Bayu Insurance AI • Resmi OJK</span>
                          </div>
                        )}
                        <p>{msg.content}</p>

                        {/* Checklist Card */}
                        {msg.checklistCard && (
                          <div className="mt-3 p-3.5 sm:p-4 rounded-lg bg-white border border-slate-300 shadow-2xs space-y-2 text-left">
                            <span className="text-[11px] font-bold text-slate-900 block uppercase tracking-tight">
                              {msg.checklistCard.title}
                            </span>
                            <ul className="text-xs text-slate-700 space-y-1.5 pl-0">
                              {msg.checklistCard.items.map((item, i) => (
                                <li key={i} className="leading-normal">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Tags */}
                        {msg.tags && msg.tags.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {msg.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Action Buttons */}
                        {msg.actionButtons && msg.actionButtons.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2 pt-1">
                            {msg.actionButtons.map((btn, i) =>
                              btn.actionType === 'navigate' ? (
                                <Link key={i} href={btn.target}>
                                  <button
                                    type="button"
                                    className="h-9 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                                  >
                                    {btn.label}
                                  </button>
                                </Link>
                              ) : (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => handleActionClick(btn.target, btn.actionType)}
                                  className="h-9 px-4 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-xs transition-colors"
                                >
                                  {btn.label}
                                </button>
                              )
                            )}
                          </div>
                        )}

                        {/* Citations */}
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-wrap gap-1.5">
                            {msg.citations.map((cit) => (
                              <span
                                key={cit.id}
                                className="inline-flex items-center gap-1 text-[11px] text-blue-700 font-semibold bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md"
                              >
                                📚 {cit.source}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <span
                        className={`text-[10px] text-slate-400 block ${
                          isUser ? 'text-right' : 'text-left'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isSending && (
                <div className="flex gap-3 mr-auto max-w-md items-center">
                  <div className="w-[34px] h-[34px] rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center text-sm shrink-0">
                    ✨
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                    <Spinner size="sm" />
                    <span>Sedang mensintesis rujukan polis OJK...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Prompt Suggestion Chips */}
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-2 shrink-0">
              {promptChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip.replace('💡 ', ''))}
                  className="px-3 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-600 text-[11px] font-semibold transition-all shadow-2xs"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Box Form */}
            <div className="p-4 border-t border-slate-200 bg-white shrink-0 space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <div className="flex-1 relative">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ketik pertanyaan seputar produk, syarat klaim, simulasi premi, atau polis..."
                    className="text-xs sm:text-sm h-11 pr-10 border-slate-300 rounded-xl"
                    disabled={isSending}
                  />
                  <span className="absolute right-3 top-3 text-slate-400 text-sm">
                    📎
                  </span>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSending || !inputText.trim()}
                  className="h-11 px-5 shadow-md shadow-blue-500/20 font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSending ? <Spinner size="sm" /> : 'Kirim ➔'}
                </Button>
              </form>

              <p className="text-[11px] text-slate-400 text-center">
                🔒 Percakapan ini dienkripsi secara aman. Jawaban disintesis langsung dari basis data polis
                resmi Bayu Insurance yang diawasi OJK.
              </p>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};
