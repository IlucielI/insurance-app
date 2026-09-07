import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, DELETE } from './route';

describe('GET /api/assistant/conversations/[id]', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('returns 400 if conversation id is empty', async () => {
    const req = new NextRequest('http://localhost/api/assistant/conversations/');
    const res = await GET(req, { params: Promise.resolve({ id: '   ' }) });
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain('ID percakapan wajib diisi');
  });

  it('proxies conversation data from Core API when live mode is active', async () => {
    process.env.CORE_API_URL = 'http://mock-core-api';
    process.env.MOCK_CORE_API = 'false';
    delete process.env.USE_MOCK_DATA;

    const mockUpstreamData = {
      data: {
        id: 'conv-test-123',
        title: 'Percakapan Live Test',
        created_at: '2026-09-07T10:00:00Z',
        updated_at: '2026-09-07T10:05:00Z',
        messages: [
          {
            id: 'm-1',
            role: 'user',
            content: 'Berapa premi saya?',
            created_at: '2026-09-07T10:00:00Z',
          },
        ],
      },
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockUpstreamData,
    } as unknown as Response);

    const req = new NextRequest('http://localhost/api/assistant/conversations/conv-test-123');
    const res = await GET(req, { params: Promise.resolve({ id: 'conv-test-123' }) });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.id).toBe('conv-test-123');
    expect(json.data.messages).toHaveLength(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://mock-core-api/api/v1/assistant/conversations/conv-test-123',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('returns 404 when upstream Core API returns 404', async () => {
    process.env.CORE_API_URL = 'http://mock-core-api';
    process.env.MOCK_CORE_API = 'false';

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as unknown as Response);

    const req = new NextRequest('http://localhost/api/assistant/conversations/conv-unknown');
    const res = await GET(req, { params: Promise.resolve({ id: 'conv-unknown' }) });

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toContain('tidak ditemukan');
  });

  it('returns mock conversation data when mock mode is enabled', async () => {
    process.env.MOCK_CORE_API = 'true';

    const req = new NextRequest('http://localhost/api/assistant/conversations/sess-klaim-01');
    const res = await GET(req, { params: Promise.resolve({ id: 'sess-klaim-01' }) });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.id).toBe('sess-klaim-01');
    expect(json.data.title).toContain('Syarat Klaim Meninggal Dunia');
    expect(json.data.messages.length).toBeGreaterThanOrEqual(2);
  });
});

describe('DELETE /api/assistant/conversations/[id]', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('returns 400 if conversation id is empty', async () => {
    const req = new NextRequest('http://localhost/api/assistant/conversations/', { method: 'DELETE' });
    const res = await DELETE(req, { params: Promise.resolve({ id: '   ' }) });
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain('ID percakapan wajib diisi');
  });

  it('calls upstream Core API DELETE when live mode is active', async () => {
    process.env.CORE_API_URL = 'http://mock-core-api';
    process.env.MOCK_CORE_API = 'false';
    delete process.env.USE_MOCK_DATA;

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 204,
    } as unknown as Response);

    const req = new NextRequest('http://localhost/api/assistant/conversations/conv-live-del', { method: 'DELETE' });
    const res = await DELETE(req, { params: Promise.resolve({ id: 'conv-live-del' }) });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://mock-core-api/api/v1/assistant/conversations/conv-live-del',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('returns success in mock mode without errors', async () => {
    process.env.MOCK_CORE_API = 'true';

    const req = new NextRequest('http://localhost/api/assistant/conversations/sess-mock-del', { method: 'DELETE' });
    const res = await DELETE(req, { params: Promise.resolve({ id: 'sess-mock-del' }) });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toContain('berhasil dibersihkan');
  });
});
