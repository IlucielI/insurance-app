import {
  ChatSession,
  ChatMessage,
  PopularTopic,
  KnowledgeEngineStatus,
  ChatMessageCitation,
} from '@/types/assistant.types';
import { IAssistantRepository } from './assistant.repository.interface';

interface CoreApiSource {
  title: string;
  source_type: string;
  score: number;
  excerpt: string;
}

interface CoreApiChatResponse {
  conversation_id: string;
  answer: string;
  sources: CoreApiSource[];
  tools_used?: string[];
}

interface CoreApiMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

interface CoreApiConversationResponse {
  data: {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
    messages: CoreApiMessage[];
  };
}

export class CoreApiAssistantRepository implements IAssistantRepository {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl !== undefined ? baseUrl : this.resolveBaseUrl();
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  private resolveBaseUrl(): string {
    return (
      process.env.CORE_API_INTERNAL_URL?.trim() ||
      process.env.CORE_API_URL?.trim() ||
      process.env.NEXT_PUBLIC_CORE_API_URL?.trim() ||
      ''
    );
  }

  public async getSessions(): Promise<ChatSession[]> {
    return [];
  }

  public async getSessionById(id: string): Promise<ChatSession | null> {
    if (!this.baseUrl) {
      return null;
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/v1/assistant/conversations/${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.status === 404) {
        return null;
      }

      if (!res.ok) {
        throw new Error(`Failed to load conversation (${res.status}): ${res.statusText}`);
      }

      const json = (await res.json()) as CoreApiConversationResponse;
      const conv = json.data;
      if (!conv) return null;

      const messages: ChatMessage[] = (conv.messages || []).map((m) => ({
        id: m.id,
        sender: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
        timestamp: this.formatTimestamp(m.created_at),
      }));

      return {
        id: conv.id,
        title: conv.title || '💬 Percakapan Asuransi',
        lastActive: 'Sesi Aktif',
        previewText: messages[messages.length - 1]?.content || 'Percakapan baru.',
        messages,
      };
    } catch (err: unknown) {
      console.error('[CoreApiAssistantRepository] getSessionById error:', err);
      return null;
    }
  }

  public async createSession(title?: string): Promise<ChatSession> {
    const id = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      id,
      title: title || '💬 Percakapan Baru',
      lastActive: 'Baru saja',
      previewText: 'Mulai tanyakan seputar proteksi...',
      messages: [],
    };
  }

  public async addMessage(
    sessionId: string,
    message: Omit<ChatMessage, 'id' | 'timestamp'>
  ): Promise<ChatMessage> {
    if (!this.baseUrl) {
      throw new Error('CORE_API_URL belum dikonfigurasi.');
    }

    const payload = {
      conversation_id: sessionId.startsWith('temp-') ? undefined : sessionId,
      message: message.content,
    };

    const res = await fetch(`${this.baseUrl}/api/v1/assistant/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`Core API Chat failed (${res.status}): ${errBody || res.statusText}`);
    }

    const json = (await res.json()) as CoreApiChatResponse;

    const citations: ChatMessageCitation[] = (json.sources || []).map((s, idx) => ({
      id: `cit-${idx + 1}`,
      source: s.title,
      title: s.title,
      sourceType: s.source_type,
      score: s.score,
      excerpt: s.excerpt,
    }));

    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      content: json.answer,
      timestamp: 'Baru saja • Selesai Disintesis',
      citations: citations.length > 0 ? citations : undefined,
    };
  }

  public async clearSession(sessionId: string): Promise<void> {
    if (!this.baseUrl) return;

    try {
      await fetch(`${this.baseUrl}/api/v1/assistant/conversations/${encodeURIComponent(sessionId)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (err: unknown) {
      console.error('[CoreApiAssistantRepository] clearSession error:', err);
    }
  }

  public async getPopularTopics(): Promise<PopularTopic[]> {
    return [
      {
        id: 'topic-1',
        icon: '📋',
        title: 'Syarat Dokumen Klaim',
        prompt: 'Apa saja dokumen yang wajib disiapkan untuk klaim meninggal dunia?',
      },
      {
        id: 'topic-2',
        icon: '⚡',
        title: 'Garansi Pencairan 3 Hari',
        prompt: 'Bagaimana alur SLA garansi pencairan klaim santunan 3 hari kerja?',
      },
      {
        id: 'topic-3',
        icon: '🩺',
        title: 'Skrining Riwayat Penyakit',
        prompt: 'Apakah riwayat hipertensi atau pre-existing condition di-cover?',
      },
      {
        id: 'topic-4',
        icon: '📄',
        title: 'Unduh Polis & Sertifikat',
        prompt: 'Bagaimana cara mengunduh e-polis dan sertifikat asuransi resmi?',
      },
      {
        id: 'topic-5',
        icon: '💳',
        title: 'Metode Bayar VA / QRIS',
        prompt: 'Apa saja kanal pembayaran premi yang tersedia (BCA, Mandiri, QRIS)?',
      },
    ];
  }

  public async getEngineStatus(): Promise<KnowledgeEngineStatus> {
    if (!this.baseUrl) {
      return {
        version: '1.2.0',
        indexedDocsCount: 150,
        vectorDimension: 1024,
        avgSlaMs: 0,
        status: 'offline',
      };
    }

    try {
      const startTime = Date.now();
      const res = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const latency = Date.now() - startTime;

      return {
        version: '1.2.0',
        indexedDocsCount: 150,
        vectorDimension: 1024,
        avgSlaMs: res.ok ? Math.max(10, latency) : 0,
        status: res.ok ? 'online' : 'offline',
      };
    } catch {
      return {
        version: '1.2.0',
        indexedDocsCount: 150,
        vectorDimension: 1024,
        avgSlaMs: 0,
        status: 'offline',
      };
    }
  }

  private formatTimestamp(isoDateStr?: string): string {
    if (!isoDateStr) return 'Baru saja';
    try {
      const d = new Date(isoDateStr);
      if (isNaN(d.getTime())) return 'Baru saja';
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes} WIB`;
    } catch {
      return 'Baru saja';
    }
  }
}
