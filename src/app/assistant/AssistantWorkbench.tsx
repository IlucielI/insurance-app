'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ChatSession,
  ChatMessage,
  ChatMessageCitation,
  PopularTopic,
  KnowledgeEngineStatus,
  ChatAction,
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
  initialQuery?: string;
}

function getHumanReadableToolName(toolName: string): string {
  switch (toolName) {
    case 'calculate_quote':
      return 'Kalkulator Premi Aktuaria';
    case 'list_products':
      return 'Katalog Produk Proteksi';
    case 'get_product_detail':
      return 'Spesifikasi Manfaat Polis';
    case 'track_claim_status':
      return 'Pelacakan Status Klaim';
    case 'create_lead_consultation':
      return 'Jadwal Konsultasi Underwriting';
    default:
      return `Tool Engine (${toolName})`;
  }
}

function formatInlineBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function renderFormattedContent(text: string) {
  if (!text) return null;

  const trimmed = text.trim();
  if (trimmed.startsWith('[{') && trimmed.endsWith('}]')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name) {
        return (
          <div className="space-y-2 text-left my-1">
            <p className="font-semibold text-slate-800">Daftar produk asuransi yang tersedia:</p>
            <div className="grid grid-cols-1 gap-2 mt-1">
              {parsed.map((p: { name: string; category?: string; description?: string; min_sum_assured?: number; max_sum_assured?: number; min_payment_term?: number; max_payment_term?: number }, idx: number) => (
                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-700 text-xs">{idx + 1}. {p.name}</span>
                    {p.category && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {p.category}
                      </span>
                    )}
                  </div>
                  {p.description && <p className="text-[11px] text-slate-600 mt-1">{p.description}</p>}
                  <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 mt-1.5 pt-1 border-t border-slate-100">
                    {p.min_sum_assured && (
                      <span>UP: Rp {Number(p.min_sum_assured).toLocaleString('id-ID')} - Rp {Number(p.max_sum_assured).toLocaleString('id-ID')}</span>
                    )}
                    {p.min_payment_term && (
                      <span>• Tenor: {p.min_payment_term}-{p.max_payment_term} thn</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
    } catch {
      // Fallback
    }
  }

  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-left leading-relaxed">
      {lines.map((line, lineIdx) => {
        const lineTrim = line.trim();
        if (!lineTrim) return <div key={lineIdx} className="h-1" />;

        if (lineTrim.startsWith('### ') || lineTrim.startsWith('## ')) {
          const headerText = lineTrim.replace(/^#+\s*/, '');
          return (
            <h4 key={lineIdx} className="font-bold text-slate-900 text-xs sm:text-sm mt-2 mb-1">
              {formatInlineBold(headerText)}
            </h4>
          );
        }

        if (lineTrim.startsWith('- ') || lineTrim.startsWith('* ') || lineTrim.startsWith('• ')) {
          const bulletText = lineTrim.replace(/^[-*•]\s*/, '');
          return (
            <div key={lineIdx} className="flex items-start gap-1.5 pl-1 text-xs sm:text-[13px]">
              <span className="text-blue-600 font-bold leading-none mt-1">•</span>
              <span className="flex-1">{formatInlineBold(bulletText)}</span>
            </div>
          );
        }

        return (
          <p key={lineIdx} className="text-xs sm:text-[13px]">
            {formatInlineBold(line)}
          </p>
        );
      })}
    </div>
  );
}

export const AssistantWorkbench: React.FC<AssistantWorkbenchProps> = ({
  initialSessions,
  initialPopularTopics,
  initialEngineStatus,
  initialQuery,
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string>(
    initialSessions[0]?.id || ''
  );
  const [inputText, setInputText] = useState<string>(initialQuery || '');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState<boolean>(false);
  const [isClearingChat, setIsClearingChat] = useState<boolean>(false);
  const [clearNotice, setClearNotice] = useState<string | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<ChatMessageCitation | null>(null);

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

  // 1. Hydrate sessions from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bayu_insurance_assistant_sessions_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          queueMicrotask(() => {
            setSessions(parsed);
            setActiveSessionId(parsed[0].id);
          });
        }
      }
    } catch {
      // ignore storage parsing error
    }
  }, []);

  // 2. Persist sessions to localStorage on state changes
  useEffect(() => {
    try {
      if (sessions.length > 0) {
        localStorage.setItem(
          'bayu_insurance_assistant_sessions_v1',
          JSON.stringify(sessions.slice(0, 15))
        );
      }
    } catch {
      // ignore storage write errors
    }
  }, [sessions]);

  const handleCreateNewSession = async () => {
    try {
      const created = await assistantService.startNewSession();
      const uniqueId = created?.id || `conv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      messageCounterRef.current += 1;
      const initialMessages: ChatMessage[] =
        created?.messages && created.messages.length > 0
          ? created.messages
          : [
              {
                id: `msg-welcome-${messageCounterRef.current}`,
                sender: 'assistant',
                content:
                  'Halo! Saya asisten AI resmi Bayu Insurance yang diawasi OJK. Saya siap membantu Anda melakukan simulasi premi aktuaria, memeriksa klausul polis, memahami syarat klaim, atau menjawab pertanyaan proteksi lainnya. Apa yang ingin Anda tanyakan?',
                timestamp: 'Baru saja',
              },
            ];

      const newSession: ChatSession = {
        ...created,
        id: uniqueId,
        title: created?.title || '💬 Percakapan Baru',
        lastActive: 'Baru saja',
        previewText: 'Mulai tanyakan seputar proteksi...',
        messages: initialMessages,
      };

      setSessions((prev) => [newSession, ...prev.filter((s) => s.id !== uniqueId)]);
      setActiveSessionId(newSession.id);
    } catch (error) {
      console.error('Failed to create new session', error);
    }
  };

  const handleSelectSession = async (session: ChatSession) => {
    setActiveSessionId(session.id);
    // If session messages are empty, attempt to lazy-load from BFF conversations route
    if (session.messages.length === 0 && !session.id.startsWith('temp-')) {
      try {
        const res = await fetch(`/api/assistant/conversations/${encodeURIComponent(session.id)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data?.messages && Array.isArray(json.data.messages)) {
            const loadedMessages: ChatMessage[] = json.data.messages.map(
              (m: { id: string; role: string; content: string; created_at?: string }) => ({
                id: m.id,
                sender: m.role === 'user' ? 'user' : 'assistant',
                content: m.content,
                timestamp: 'Riwayat Percakapan',
              })
            );
            setSessions((prev) =>
              prev.map((s) => (s.id === session.id ? { ...s, messages: loadedMessages } : s))
            );
          }
        }
      } catch (err) {
        console.warn('[AssistantWorkbench] Failed to lazy-load session details:', err);
      }
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

    messageCounterRef.current += 1;
    const streamAssistantId = `ai-stream-${messageCounterRef.current}`;
    let streamSuccess = false;

    // 1. Attempt SSE Real-Time Streaming via /api/assistant/chat/stream
    try {
      const convIdParam =
        activeSession.id.startsWith('temp-') || activeSession.id.startsWith('sess-')
          ? undefined
          : activeSession.id;

      const streamUrl = '/api/assistant/chat/stream';

      const res = await fetch(streamUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          conversation_id: convIdParam,
        }),
      });

      if (res.ok && res.body) {
        // Append initial empty assistant message for streaming
        const initialAiMsg: ChatMessage = {
          id: streamAssistantId,
          sender: 'assistant',
          content: '',
          timestamp: 'Sedang mengetik...',
        };

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === activeSession.id) {
              return {
                ...s,
                messages: [...s.messages, initialAiMsg],
              };
            }
            return s;
          })
        );

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        const accumulatedTokens: string[] = [];
        let doneCitations: Array<{ id: string; source: string; score?: number; excerpt?: string }> = [];
        let doneToolsUsed: string[] = [];
        let capturedConvId: string | null = null;
        let currentToolCall: { toolName: string; label: string; status: 'calling' | 'completed' } | null = null;

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            try {
              const event = JSON.parse(trimmed.slice(6));
              if (event.type === 'tool_call' && event.tool_name) {
                const label = getHumanReadableToolName(event.tool_name);
                currentToolCall = { toolName: event.tool_name, label, status: 'calling' };
                setSessions((prev) =>
                  prev.map((s) => {
                    if (s.id === activeSession.id) {
                      return {
                        ...s,
                        messages: s.messages.map((m) =>
                          m.id === streamAssistantId
                            ? {
                                ...m,
                                toolCall: { ...currentToolCall! },
                              }
                            : m
                        ),
                      };
                    }
                    return s;
                  })
                );
              } else if (event.type === 'tool_result' && event.tool_name) {
                const label = getHumanReadableToolName(event.tool_name);
                currentToolCall = { toolName: event.tool_name, label, status: 'completed' };
                setSessions((prev) =>
                  prev.map((s) => {
                    if (s.id === activeSession.id) {
                      return {
                        ...s,
                        messages: s.messages.map((m) =>
                          m.id === streamAssistantId
                            ? {
                                ...m,
                                toolCall: { ...currentToolCall! },
                              }
                            : m
                        ),
                      };
                    }
                    return s;
                  })
                );
              } else if (event.type === 'token' && typeof event.content === 'string') {
                accumulatedTokens.push(event.content);
                const nextContent = accumulatedTokens.join('');
                setSessions((prev) =>
                  prev.map((s) => {
                    if (s.id === activeSession.id) {
                      return {
                        ...s,
                        messages: s.messages.map((m) =>
                          m.id === streamAssistantId
                            ? {
                                ...m,
                                content: nextContent,
                                timestamp: 'Sedang mengetik...',
                                toolCall: currentToolCall ? { ...currentToolCall } : m.toolCall,
                              }
                            : m
                        ),
                      };
                    }
                    return s;
                  })
                );
              } else if (event.type === 'done') {
                if (event.conversation_id && typeof event.conversation_id === 'string') {
                  capturedConvId = event.conversation_id;
                }
                if (event.tools_used && Array.isArray(event.tools_used)) {
                  doneToolsUsed = event.tools_used;
                }
                if (event.sources && Array.isArray(event.sources)) {
                  doneCitations = event.sources.map((s: { title: string; score?: number; excerpt?: string }, idx: number) => ({
                    id: `cit-${idx + 1}`,
                    source: s.title,
                    score: s.score,
                    excerpt: s.excerpt,
                  }));
                }
              }
            } catch {
              // ignore partial event parsing
            }
          }
        }

        // Finalize streaming message state
        const finalContent = accumulatedTokens.join('');
        if (finalContent.trim()) {
          streamSuccess = true;
          const targetSessionId = activeSession.id;
          const nextSessionId = capturedConvId || targetSessionId;
          const isInitialTitle =
            activeSession.title === '💬 Percakapan Baru' ||
            activeSession.title.includes('Percakapan Baru');
          const nextTitle = isInitialTitle
            ? `💬 ${textToSend.slice(0, 30)}${textToSend.length > 30 ? '...' : ''}`
            : activeSession.title;

          // Contextual Action Buttons based on tools used or topics
          const contextualActions: ChatAction[] = [];
          if (
            doneToolsUsed.includes('calculate_quote') ||
            finalContent.toLowerCase().includes('premi') ||
            finalContent.toLowerCase().includes('simulasi')
          ) {
            contextualActions.push({
              label: 'Buka Kalkulator Simulasi 🧮',
              actionType: 'navigate',
              target: '/simulation',
            });
          }
          if (
            doneToolsUsed.includes('track_claim_status') ||
            finalContent.toLowerCase().includes('klaim')
          ) {
            contextualActions.push({
              label: 'Ajukan & Lacak Klaim →',
              actionType: 'navigate',
              target: '/tracking',
            });
          }

          setSessions((prev) =>
            prev.map((s) => {
              if (s.id === targetSessionId) {
                return {
                  ...s,
                  id: nextSessionId,
                  title: nextTitle,
                  lastActive: 'Sesi Aktif',
                  previewText: finalContent.slice(0, 60) + '...',
                  messages: s.messages.map((m) =>
                    m.id === streamAssistantId
                      ? {
                          ...m,
                          content: finalContent,
                          timestamp: 'Baru saja • Selesai Disintesis',
                          citations: doneCitations.length > 0 ? doneCitations : m.citations,
                          toolsUsed: doneToolsUsed.length > 0 ? doneToolsUsed : m.toolsUsed,
                          actionButtons:
                            contextualActions.length > 0
                              ? contextualActions
                              : m.actionButtons,
                          toolCall: currentToolCall
                            ? { ...currentToolCall, status: 'completed' }
                            : m.toolCall,
                        }
                      : m
                  ),
                };
              }
              return s;
            })
          );

          if (nextSessionId !== targetSessionId) {
            setActiveSessionId(nextSessionId);
          }
        } else {
          // Remove empty stream message if no tokens arrived
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id === activeSession.id) {
                return {
                  ...s,
                  messages: s.messages.filter((m) => m.id !== streamAssistantId),
                };
              }
              return s;
            })
          );
        }
      }
    } catch (streamErr: unknown) {
      console.warn('[AssistantWorkbench] Stream fetch error, falling back to service:', streamErr);
      // Remove placeholder if exists
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              messages: s.messages.filter((m) => m.id !== streamAssistantId),
            };
          }
          return s;
        })
      );
    }

    // 2. Fallback to assistantService.sendMessage if streaming did not produce content
    if (!streamSuccess) {
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
      }
    }

    setIsSending(false);
  };

  const handleOpenClearModal = () => {
    setShowClearConfirmModal(true);
  };

  const handleConfirmClear = async () => {
    if (!activeSession || isClearingChat) return;
    setIsClearingChat(true);
    try {
      const oldSessionId = activeSession.id;
      // 1. Call BFF Route Handler DELETE /api/assistant/conversations/[id]
      if (!oldSessionId.startsWith('temp-') && !oldSessionId.startsWith('sess-')) {
        await fetch(`/api/assistant/conversations/${encodeURIComponent(oldSessionId)}`, {
          method: 'DELETE',
        }).catch((err) => {
          console.warn('[AssistantWorkbench] Core API DELETE call failed:', err);
        });
      }

      // 2. Call local service reset
      await assistantService.resetSessionMessages(oldSessionId).catch(() => {});

      // 3. Generate a fresh new unique session ID
      const newSessionId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      messageCounterRef.current += 1;
      const cleanMsg: ChatMessage = {
        id: `msg-cleared-${messageCounterRef.current}`,
        sender: 'assistant',
        content:
          'Percakapan telah dibersihkan. Silakan tanyakan hal lain seputar produk, syarat klaim, atau verifikasi underwriting.',
        timestamp: 'Baru saja dibersihkan',
      };

      const updatedSession: ChatSession = {
        id: newSessionId,
        title: '💬 Percakapan Baru',
        lastActive: 'Baru saja dibersihkan',
        previewText: 'Percakapan telah dibersihkan.',
        messages: [cleanMsg],
      };

      setSessions((prev) =>
        prev.map((s) => (s.id === oldSessionId ? updatedSession : s))
      );
      setActiveSessionId(newSessionId);

      setClearNotice('Riwayat percakapan berhasil dibersihkan.');
      setShowClearConfirmModal(false);
    } catch (error) {
      console.error('Failed to reset session', error);
    } finally {
      setIsClearingChat(false);
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
          const origin =
            typeof window !== 'undefined' && window.location?.origin
              ? window.location.origin
              : undefined;
          const parsed = origin ? new URL(target, origin) : new URL(target);
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
                    onClick={() => handleSelectSession(session)}
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
                onClick={handleOpenClearModal}
                variant="outline"
                size="sm"
                className="text-xs bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 rounded-md font-semibold shrink-0"
              >
                Bersihkan Chat 🔄
              </Button>
            </div>

            {/* Notification banner if action performed */}
            {clearNotice && (
              <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between animate-in fade-in">
                <span>✓ {clearNotice}</span>
                <button
                  type="button"
                  aria-label="Tutup notifikasi pembersihan"
                  onClick={() => setClearNotice(null)}
                  className="text-emerald-700 font-bold hover:text-emerald-900"
                >
                  ✕
                </button>
              </div>
            )}

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

                        {/* Live Tool Calling Status Badge */}
                        {msg.toolCall && (
                          <div
                            className={`mb-2.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                              msg.toolCall.status === 'calling'
                                ? 'bg-blue-100/70 border border-blue-200 text-blue-800 animate-pulse'
                                : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                            }`}
                          >
                            {msg.toolCall.status === 'calling' ? (
                              <>
                                <Spinner size="sm" />
                                <span>⚡ Memanggil Engine: {msg.toolCall.label}...</span>
                              </>
                            ) : (
                              <span>✓ Selesai: {msg.toolCall.label} (Tereksekusi)</span>
                            )}
                          </div>
                        )}

                        {msg.content ? (
                          renderFormattedContent(msg.content)
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
                            <Spinner size="sm" />
                            <span>Sedang mensintesis rujukan polis OJK...</span>
                          </div>
                        )}

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
                                <Link
                                  key={i}
                                  href={btn.target}
                                  className="inline-flex items-center justify-center h-9 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                                >
                                  {btn.label}
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
                              <button
                                key={cit.id}
                                type="button"
                                onClick={() => setSelectedCitation(cit)}
                                className="inline-flex items-center gap-1.5 text-[11px] text-blue-700 hover:text-blue-900 font-semibold bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 px-2.5 py-1 rounded-md transition-all cursor-pointer text-left shadow-2xs hover:shadow-xs group"
                                title="Klik untuk membaca rincian cuplikan dokumen resmi"
                              >
                                <span>📚</span>
                                <span>{cit.source.startsWith('Rujukan Resmi:') ? cit.source : `Rujukan Resmi: ${cit.source}`}</span>
                                <span className="text-[9px] bg-blue-100 group-hover:bg-blue-200 text-blue-800 px-1 py-0.2 rounded font-mono">Buka ↗</span>
                              </button>
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

              {isSending && !activeSession?.messages.some((m) => m.id.startsWith('ai-stream-')) && (
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

      {/* Clear Chat Confirmation Modal */}
      {showClearConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-modal-title"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 text-lg shrink-0">
                ⚠️
              </div>
              <div>
                <h3 id="clear-modal-title" className="text-base font-bold text-slate-900">
                  Bersihkan Riwayat Percakapan?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Seluruh pesan dalam sesi percakapan ini akan dihapus dari server Core API dan memori lokal browser. Anda akan memulai kembali percakapan dengan konteks baru yang bersih.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isClearingChat}
                onClick={() => setShowClearConfirmModal(false)}
                className="text-xs rounded-lg text-slate-700 border-slate-300"
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={isClearingChat}
                onClick={handleConfirmClear}
                className="text-xs rounded-lg font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
              >
                {isClearingChat ? <Spinner size="sm" /> : 'Ya, Bersihkan Chat 🔄'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Rincian Rujukan Resmi */}
      {selectedCitation && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedCitation(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-left"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📚</span>
                <h3 className="text-base font-bold text-slate-900">
                  Rincian Rujukan Resmi OJK & SOP
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCitation(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg cursor-pointer"
                aria-label="Tutup rincian rujukan"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-100 space-y-1.5">
              <h4 className="text-sm font-bold text-blue-950">
                {selectedCitation.source}
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                {selectedCitation.sourceType && (
                  <span className="inline-block text-[10px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded uppercase tracking-wider">
                    Kategori: {selectedCitation.sourceType}
                  </span>
                )}
                {typeof selectedCitation.score === 'number' && (
                  <span className="text-[11px] text-blue-600 font-medium">
                    Skor Relevansi: {(selectedCitation.score * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 block">
                Kutipan / Cuplikan Resmi Dokumen:
              </span>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                {selectedCitation.excerpt || 'Dokumen rujukan ini diverifikasi oleh sistem RAG underwriting berlisensi OJK.'}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedCitation(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
