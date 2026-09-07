import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

describe('POST /api/assistant/chat/stream', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('returns 400 when message is empty or missing', async () => {
    const req = new NextRequest('http://localhost:3001/api/assistant/chat/stream', {
      method: 'POST',
      body: JSON.stringify({ message: '   ' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Pesan pertanyaan wajib diisi.');
  });

  it('forwards upstream SSE stream from Core API when live mode is configured', async () => {
    process.env.CORE_API_URL = 'http://core-api.internal';
    process.env.MOCK_CORE_API = 'false';
    process.env.USE_MOCK_DATA = 'false';

    const mockUpstreamStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"type":"token","content":"Halo"}\n\n'));
        controller.close();
      },
    });

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      body: mockUpstreamStream,
    });

    const req = new NextRequest('http://localhost:3001/api/assistant/chat/stream', {
      method: 'POST',
      body: JSON.stringify({ message: 'Halo AI' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/event-stream');

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let text = '';
    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value);
    }

    expect(text).toContain('Halo');
  });

  it('streams simulated SSE events in mock mode', async () => {
    process.env.MOCK_CORE_API = 'true';

    const req = new NextRequest('http://localhost:3001/api/assistant/chat/stream', {
      method: 'POST',
      body: JSON.stringify({ message: 'Berapa premi asuransi jiwa?' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/event-stream');

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let text = '';
    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value);
    }

    expect(text).toContain('"type":"token"');
    expect(text).toContain('"type":"done"');
    expect(text).toContain('Tabel Tarif Premi');
  });
});
