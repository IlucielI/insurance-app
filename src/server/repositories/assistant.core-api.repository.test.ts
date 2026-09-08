import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CoreApiAssistantRepository } from './assistant.core-api.repository';

describe('CoreApiAssistantRepository', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('resolveBaseUrl', () => {
    it('uses injected baseUrl when provided', () => {
      const repo = new CoreApiAssistantRepository('http://api.insurance.internal');
      expect(repo.getBaseUrl()).toBe('http://api.insurance.internal');
    });

    it('resolves from CORE_API_URL when available', () => {
      process.env.CORE_API_URL = 'http://backend-service:8080';
      const repo = new CoreApiAssistantRepository();
      expect(repo.getBaseUrl()).toBe('http://backend-service:8080');
    });

    it('falls back to empty string when no env var is configured', () => {
      delete process.env.CORE_API_URL;
      const repo = new CoreApiAssistantRepository();
      expect(repo.getBaseUrl()).toBe('');
    });
  });

  describe('getSessionById', () => {
    it('returns null if baseUrl is empty', async () => {
      const repo = new CoreApiAssistantRepository('');
      const res = await repo.getSessionById('c-123');
      expect(res).toBeNull();
    });

    it('fetches and maps conversation from Core API', async () => {
      const mockResponse = {
        data: {
          id: 'c-123',
          title: '💬 Tanya Klaim',
          created_at: '2026-09-07T10:00:00Z',
          updated_at: '2026-09-07T10:05:00Z',
          messages: [
            {
              id: 'm-1',
              role: 'user',
              content: 'Halo AI',
              created_at: '2026-09-07T10:00:00Z',
            },
            {
              id: 'm-2',
              role: 'assistant',
              content: 'Halo, ada yang bisa dibantu?',
              created_at: '2026-09-07T10:00:02Z',
            },
          ],
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const repo = new CoreApiAssistantRepository('http://api.test');
      const session = await repo.getSessionById('c-123');

      expect(session).not.toBeNull();
      expect(session?.id).toBe('c-123');
      expect(session?.title).toBe('💬 Tanya Klaim');
      expect(session?.messages).toHaveLength(2);
      expect(session?.messages[0].sender).toBe('user');
      expect(session?.messages[1].sender).toBe('assistant');
    });

    it('returns null on 404', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const repo = new CoreApiAssistantRepository('http://api.test');
      const session = await repo.getSessionById('not-found');
      expect(session).toBeNull();
    });

    it('catches network error and returns null', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network offline'));
      const repo = new CoreApiAssistantRepository('http://api.test');
      const session = await repo.getSessionById('c-error');
      expect(session).toBeNull();
    });
  });

  describe('createSession', () => {
    it('creates a fresh session with given title', async () => {
      const repo = new CoreApiAssistantRepository('http://api.test');
      const session = await repo.createSession('Konsultasi Premi');
      expect(session.id).toMatch(/^conv_\d+_[a-z0-9]+$/);
      expect(session.title).toBe('Konsultasi Premi');
      expect(session.messages).toEqual([]);
    });
  });

  describe('addMessage', () => {
    it('throws error if baseUrl is empty', async () => {
      const repo = new CoreApiAssistantRepository('');
      await expect(
        repo.addMessage('c-1', { sender: 'user', content: 'Halo' })
      ).rejects.toThrow('CORE_API_URL belum dikonfigurasi');
    });

    it('sends message and maps answer with citations', async () => {
      const mockChatRes = {
        conversation_id: 'c-1',
        answer: 'Premi mulai Rp 150rb/bln.',
        sources: [
          {
            title: 'Polis Baku Bab II',
            source_type: 'policy',
            score: 0.95,
            excerpt: 'Tarif dasar mengikat.',
          },
        ],
        tools_used: ['calculate_quote'],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockChatRes,
      });

      const repo = new CoreApiAssistantRepository('http://api.test');
      const msg = await repo.addMessage('c-1', {
        sender: 'user',
        content: 'Berapa premi termurah?',
      });

      expect(msg.sender).toBe('assistant');
      expect(msg.content).toBe('Premi mulai Rp 150rb/bln.');
      expect(msg.citations).toHaveLength(1);
      expect(msg.citations?.[0].source).toBe('Polis Baku Bab II');
      expect(msg.citations?.[0].score).toBe(0.95);
    });

    it('throws error if Core API returns non-ok status', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Database failure',
      });

      const repo = new CoreApiAssistantRepository('http://api.test');
      await expect(
        repo.addMessage('c-1', { sender: 'user', content: 'Halo' })
      ).rejects.toThrow(/Core API Chat failed/);
    });
  });

  describe('clearSession', () => {
    it('calls DELETE /conversations/:id', async () => {
      const fetchSpy = vi.fn().mockResolvedValueOnce({ ok: true, status: 204 });
      global.fetch = fetchSpy;

      const repo = new CoreApiAssistantRepository('http://api.test');
      await repo.clearSession('c-123');

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://api.test/api/v1/assistant/conversations/c-123',
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('swallows network errors without crashing', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));
      const repo = new CoreApiAssistantRepository('http://api.test');
      await expect(repo.clearSession('c-123')).resolves.not.toThrow();
    });
  });

  describe('getPopularTopics', () => {
    it('returns array of 5 popular topics matching design', async () => {
      const repo = new CoreApiAssistantRepository('http://api.test');
      const topics = await repo.getPopularTopics();
      expect(topics).toHaveLength(5);
      expect(topics[0].title).toBe('Syarat Dokumen Klaim');
      expect(topics[1].title).toBe('Garansi Pencairan 3 Hari');
    });
  });

  describe('getEngineStatus', () => {
    it('returns online when health ping succeeds', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, status: 200 });
      const repo = new CoreApiAssistantRepository('http://api.test');
      const status = await repo.getEngineStatus();
      expect(status.status).toBe('online');
      expect(status.avgSlaMs).toBeGreaterThan(0);
    });

    it('returns offline when health ping fails or baseUrl empty', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Down'));
      const repo = new CoreApiAssistantRepository('http://api.test');
      const status = await repo.getEngineStatus();
      expect(status.status).toBe('offline');

      const repoEmpty = new CoreApiAssistantRepository('');
      const statusEmpty = await repoEmpty.getEngineStatus();
      expect(statusEmpty.status).toBe('offline');
    });
  });
});
