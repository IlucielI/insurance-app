import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AssistantPage from './page';
import { AssistantWorkbench } from './AssistantWorkbench';
import { assistantService, assistantRepository } from '@/server/di';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('AssistantPage & AssistantWorkbench', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    (assistantRepository as unknown as { reset?: () => void }).reset?.();
  });

  it('renders Server Component AssistantPage with header, sidebar, and initial active session', async () => {
    const Component = await AssistantPage();
    render(Component);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Asisten AI Konsultasi Polis & Panduan Klaim/i,
      })
    ).toBeDefined();

    // Check sidebar elements
    expect(screen.getByRole('button', { name: /\+ Percakapan Baru/i })).toBeDefined();
    expect(screen.getByText(/RIWAYAT PERCAKAPAN/i)).toBeDefined();
    expect(screen.getByText(/TOPIK BANTUAN POPULER/i)).toBeDefined();
    expect(screen.getByText(/Basis Pengetahuan Resmi OJK/i)).toBeDefined();

    // Check chat elements
    expect(screen.getByText(/Bayu Insurance AI Underwriting Assistant/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Ketik pertanyaan seputar produk/i)).toBeDefined();
  });

  it('switches active session when clicking a session card in the sidebar', async () => {
    const sessions = await assistantService.getChatSessions();
    const topics = await assistantService.getPopularTopics();
    const status = await assistantService.getEngineStatus();

    render(
      <AssistantWorkbench
        initialSessions={sessions}
        initialPopularTopics={topics}
        initialEngineStatus={status}
      />
    );

    // Click second session: "💬 Simulasi UP Usia 30 Tahun"
    const session2Btn = screen.getByRole('button', { name: /Simulasi UP Usia 30 Tahun/i });
    fireEvent.click(session2Btn);

    await waitFor(() => {
      expect(screen.getByText(/Berapa estimasi premi untuk usia 30 tahun/i)).toBeDefined();
    });
  });

  it('creates a new chat session when clicking "+ Percakapan Baru"', async () => {
    const sessions = await assistantService.getChatSessions();
    const topics = await assistantService.getPopularTopics();
    const status = await assistantService.getEngineStatus();

    render(
      <AssistantWorkbench
        initialSessions={sessions}
        initialPopularTopics={topics}
        initialEngineStatus={status}
      />
    );

    const newChatBtn = screen.getByRole('button', { name: /\+ Percakapan Baru/i });
    fireEvent.click(newChatBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/Percakapan Baru/i).length).toBeGreaterThan(0);
    });
  });

  it('clears chat messages when confirming in the "Bersihkan Chat 🔄" modal', async () => {
    const sessions = await assistantService.getChatSessions();
    const topics = await assistantService.getPopularTopics();
    const status = await assistantService.getEngineStatus();

    render(
      <AssistantWorkbench
        initialSessions={sessions}
        initialPopularTopics={topics}
        initialEngineStatus={status}
      />
    );

    const clearBtn = screen.getByRole('button', { name: /Bersihkan Chat 🔄/i });
    fireEvent.click(clearBtn);

    // Modal is opened
    expect(screen.getByText(/Bersihkan Riwayat Percakapan\?/i)).toBeDefined();

    // Click confirm in modal
    const confirmBtn = screen.getByRole('button', { name: /Ya, Bersihkan Chat 🔄/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/Percakapan telah dibersihkan/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Baru saja dibersihkan/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Riwayat percakapan berhasil dibersihkan/i)).toBeDefined();
    });
  });

  it('cancels clear chat when clicking Batal in the confirmation modal', async () => {
    const sessions = await assistantService.getChatSessions();
    const topics = await assistantService.getPopularTopics();
    const status = await assistantService.getEngineStatus();

    render(
      <AssistantWorkbench
        initialSessions={sessions}
        initialPopularTopics={topics}
        initialEngineStatus={status}
      />
    );

    const clearBtn = screen.getByRole('button', { name: /Bersihkan Chat 🔄/i });
    fireEvent.click(clearBtn);

    expect(screen.getByText(/Bersihkan Riwayat Percakapan\?/i)).toBeDefined();

    const cancelBtn = screen.getByRole('button', { name: /Batal/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Bersihkan Riwayat Percakapan\?/i)).toBeNull();
      // Chat messages remain intact
      expect(screen.queryByText(/Percakapan telah dibersihkan/i)).toBeNull();
    });
  });

  it('sends user message and displays synthesized AI response with rich checklist and citations', async () => {
    const sessions = await assistantService.getChatSessions();
    const topics = await assistantService.getPopularTopics();
    const status = await assistantService.getEngineStatus();

    render(
      <AssistantWorkbench
        initialSessions={sessions}
        initialPopularTopics={topics}
        initialEngineStatus={status}
      />
    );

    const input = screen.getByPlaceholderText(/Ketik pertanyaan seputar produk/i);
    fireEvent.change(input, { target: { value: 'Berapa batas usia tertanggung asuransi?' } });

    const sendBtn = screen.getByRole('button', { name: /Kirim ➔/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText(/18 hingga 60 tahun/i)).toBeDefined();
    });
  });

  it('sends prompt when clicking a popular topic card', async () => {
    const sessions = await assistantService.getChatSessions();
    const topics = await assistantService.getPopularTopics();
    const status = await assistantService.getEngineStatus();

    render(
      <AssistantWorkbench
        initialSessions={sessions}
        initialPopularTopics={topics}
        initialEngineStatus={status}
      />
    );

    const topicBtn = screen.getByRole('button', { name: /Garansi Pencairan 3 Hari/i });
    fireEvent.click(topicBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/komitmen SLA garansi pencairan klaim/i).length).toBeGreaterThan(0);
    });
  });

  it('sends prompt when clicking a prompt suggestion chip', async () => {
    const sessions = await assistantService.getChatSessions();
    const topics = await assistantService.getPopularTopics();
    const status = await assistantService.getEngineStatus();

    render(
      <AssistantWorkbench
        initialSessions={sessions}
        initialPopularTopics={topics}
        initialEngineStatus={status}
      />
    );

    const chipBtn = screen.getByRole('button', { name: /💡 Ubah persentase ahli waris\?/i });
    fireEvent.click(chipBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/Penunjukan ahli waris wajib memiliki hubungan keluarga/i).length).toBeGreaterThan(0);
    });
  });

  it('handles action button download feedback correctly', async () => {
    const sessions = await assistantService.getChatSessions();
    const topics = await assistantService.getPopularTopics();
    const status = await assistantService.getEngineStatus();

    render(
      <AssistantWorkbench
        initialSessions={sessions}
        initialPopularTopics={topics}
        initialEngineStatus={status}
      />
    );

    // Switch to claim session first
    const claimSessionBtn = screen.getByRole('button', { name: /Syarat Klaim Meninggal Dunia/i });
    fireEvent.click(claimSessionBtn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Unduh Formulir Klaim \(PDF\) 📄/i })).toBeDefined();
    });

    const downloadBtn = screen.getByRole('button', { name: /Unduh Formulir Klaim \(PDF\) 📄/i });
    fireEvent.click(downloadBtn);

    await waitFor(() => {
      expect(screen.getByText(/Formulir Klaim Resmi \(PDF\) berhasil diunduh/i)).toBeDefined();
    });
  });


  it('handles service errors gracefully when sending message or creating session', async () => {
    const sessions = await assistantService.getChatSessions();
    const topics = await assistantService.getPopularTopics();
    const status = await assistantService.getEngineStatus();

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AssistantWorkbench
        initialSessions={sessions}
        initialPopularTopics={topics}
        initialEngineStatus={status}
      />
    );

    vi.spyOn(assistantService, 'startNewSession').mockRejectedValueOnce(
      new Error('API failed')
    );

    const newChatBtn = screen.getByRole('button', { name: /\+ Percakapan Baru/i });
    fireEvent.click(newChatBtn);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to create new session', expect.any(Error));
    });

    // Test send message failure
    vi.spyOn(assistantService, 'sendMessage').mockRejectedValueOnce(
      new Error('Network drop')
    );

    const input = screen.getByPlaceholderText(/Ketik pertanyaan seputar produk/i);
    fireEvent.change(input, { target: { value: 'Halo test error' } });
    const sendBtn = screen.getByRole('button', { name: /Kirim ➔/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to send message', expect.any(Error));
    });

    // Verify optimistic user message was rolled back from UI
    expect(screen.queryByText('Halo test error')).toBeNull();

    // Test send message succeeds but getChatSession fails (resilient fallback)
    vi.spyOn(assistantService, 'sendMessage').mockResolvedValueOnce({
      id: 'msg-success-fallback',
      sender: 'assistant',
      content: 'Respon AI berhasil via fallback langsung',
      timestamp: 'Baru saja',
    });
    vi.spyOn(assistantService, 'getChatSession').mockRejectedValueOnce(
      new Error('Failed to refresh session')
    );

    fireEvent.change(input, { target: { value: 'Pertanyaan fallback' } });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText('Respon AI berhasil via fallback langsung')).toBeDefined();
    });

    consoleSpy.mockRestore();
  });

  it('blocks unsafe URL schemes (e.g. javascript:) on download action buttons', async () => {
    const maliciousSession = {
      id: 'sess-malicious',
      title: '💬 Sesi Keamanan',
      lastActive: 'Aktif',
      previewText: 'Uji keamanan skema URL',
      messages: [
        {
          id: 'msg-sec-01',
          sender: 'assistant' as const,
          content: 'Peringatan keamanan dokumen',
          timestamp: 'Baru saja',
          actionButtons: [
            {
              label: 'Unduh Dokumen Berbahaya',
              actionType: 'download' as const,
              target: 'javascript:alert(document.cookie)',
            },
          ],
        },
      ],
    };

    const topics = await assistantService.getPopularTopics();
    const status = await assistantService.getEngineStatus();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AssistantWorkbench
        initialSessions={[maliciousSession]}
        initialPopularTopics={topics}
        initialEngineStatus={status}
      />
    );

    const maliciousBtn = screen.getByRole('button', { name: /Unduh Dokumen Berbahaya/i });
    fireEvent.click(maliciousBtn);

    // Verify invalid scheme was blocked and no download notice was rendered
    expect(consoleSpy).toHaveBeenCalledWith('Invalid URL scheme blocked:', 'javascript:');
    expect(screen.queryByText(/berhasil diunduh/i)).toBeNull();

    consoleSpy.mockRestore();
  });

  it('streams response tokens in real-time and renders RAG citations when SSE stream is received', async () => {
    const sessions = await assistantService.getChatSessions();
    const topics = await assistantService.getPopularTopics();
    const status = await assistantService.getEngineStatus();

    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"type":"token","content":"Halo streaming"}\n\n'));
        controller.enqueue(
          new TextEncoder().encode(
            'data: {"type":"done","conversation_id":"conv-stream-123","sources":[{"title":"Polis Baku Bab I","score":0.97}]}\n\n'
          )
        );
        controller.close();
      },
    });

    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      body: mockStream,
    });
    global.fetch = fetchMock;

    render(
      <AssistantWorkbench
        initialSessions={sessions}
        initialPopularTopics={topics}
        initialEngineStatus={status}
      />
    );

    const input = screen.getByPlaceholderText(/Ketik pertanyaan seputar produk/i);
    const sendBtn = screen.getByRole('button', { name: /Kirim ➔/i });

    fireEvent.change(input, { target: { value: 'Tes real-time streaming' } });
    fireEvent.click(sendBtn);

    expect(fetchMock).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText(/Halo streaming/i)).toBeDefined();
      expect(screen.getByText(/Rujukan Resmi: Polis Baku Bab I/i)).toBeDefined();
    });
  });

  it('creates a new clean conversation session when clicking + Percakapan Baru button', async () => {
    const sessions = await assistantService.getChatSessions();
    const topics = await assistantService.getPopularTopics();
    const status = await assistantService.getEngineStatus();

    render(
      <AssistantWorkbench
        initialSessions={sessions}
        initialPopularTopics={topics}
        initialEngineStatus={status}
      />
    );

    const newChatBtn = screen.getByRole('button', { name: /\+ Percakapan Baru/i });
    fireEvent.click(newChatBtn);

    await waitFor(() => {
      expect(screen.getByText(/Asisten AI.*Bayu Insurance/i)).toBeDefined();
      expect(screen.getAllByText(/💬 Percakapan Baru/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('captures conversation_id from first response and propagates it in multi-turn follow-up message', async () => {
    const sessions = await assistantService.getChatSessions();
    const topics = await assistantService.getPopularTopics();
    const status = await assistantService.getEngineStatus();

    const firstStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"type":"token","content":"Jawaban pertama"}\n\n'));
        controller.enqueue(
          new TextEncoder().encode(
            'data: {"type":"done","conversation_id":"conv-multiturn-888","sources":[]}\n\n'
          )
        );
        controller.close();
      },
    });

    const secondStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"type":"token","content":"Jawaban kedua multi-turn"}\n\n'));
        controller.enqueue(
          new TextEncoder().encode(
            'data: {"type":"done","conversation_id":"conv-multiturn-888","sources":[]}\n\n'
          )
        );
        controller.close();
      },
    });

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, body: firstStream })
      .mockResolvedValueOnce({ ok: true, body: secondStream });

    global.fetch = fetchMock;

    render(
      <AssistantWorkbench
        initialSessions={sessions}
        initialPopularTopics={topics}
        initialEngineStatus={status}
      />
    );

    const input = screen.getByPlaceholderText(/Ketik pertanyaan seputar produk/i);
    const sendBtn = screen.getByRole('button', { name: /Kirim ➔/i });

    // Turn 1
    fireEvent.change(input, { target: { value: 'Hitung premi' } });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText(/Jawaban pertama/i)).toBeDefined();
    });

    // Turn 2
    fireEvent.change(input, { target: { value: 'Kenapa harganya segitu?' } });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText(/Jawaban kedua multi-turn/i)).toBeDefined();
    });

    // Verify second request propagated conversation_id: "conv-multiturn-888"
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const secondCallBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(secondCallBody.conversation_id).toBe('conv-multiturn-888');
    expect(secondCallBody.message).toBe('Kenapa harganya segitu?');
  });

  it('switches conversation session when clicking a session in the sidebar', async () => {
    const customSessions = [
      {
        id: 'sess-alpha',
        title: 'Percakapan Alpha',
        lastActive: '10 menit lalu',
        previewText: 'Isi alpha',
        messages: [
          {
            id: 'm-alpha',
            sender: 'user' as const,
            content: 'Pesan rahasia alpha',
            timestamp: '10:00 WIB',
          },
        ],
      },
      {
        id: 'sess-beta',
        title: 'Percakapan Beta',
        lastActive: '5 menit lalu',
        previewText: 'Isi beta',
        messages: [
          {
            id: 'm-beta',
            sender: 'user' as const,
            content: 'Pesan rahasia beta',
            timestamp: '10:05 WIB',
          },
        ],
      },
    ];

    const topics = await assistantService.getPopularTopics();
    const status = await assistantService.getEngineStatus();

    render(
      <AssistantWorkbench
        initialSessions={customSessions}
        initialPopularTopics={topics}
        initialEngineStatus={status}
      />
    );

    // Alpha is active by default
    expect(screen.getByText(/Pesan rahasia alpha/i)).toBeDefined();
    expect(screen.queryByText(/Pesan rahasia beta/i)).toBeNull();

    // Click Beta in sidebar
    const betaBtn = screen.getByRole('button', { name: /Percakapan Beta/i });
    fireEvent.click(betaBtn);

    await waitFor(() => {
      expect(screen.getByText(/Pesan rahasia beta/i)).toBeDefined();
      expect(screen.queryByText(/Pesan rahasia alpha/i)).toBeNull();
    });
  });

  it('displays live tool calling badge and renders contextual action buttons upon tool execution', async () => {
    const sessions = await assistantService.getChatSessions();
    const topics = await assistantService.getPopularTopics();
    const status = await assistantService.getEngineStatus();

    const toolStream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode('data: {"type":"tool_call","tool_name":"calculate_quote"}\n\n')
        );
        controller.enqueue(
          new TextEncoder().encode('data: {"type":"tool_result","tool_name":"calculate_quote"}\n\n')
        );
        controller.enqueue(
          new TextEncoder().encode('data: {"type":"token","content":"Hasil simulasi premi untuk UP 500jt adalah Rp 350.000/bln."}\n\n')
        );
        controller.enqueue(
          new TextEncoder().encode(
            'data: {"type":"done","conversation_id":"conv-tool-123","tools_used":["calculate_quote"],"sources":[]}\n\n'
          )
        );
        controller.close();
      },
    });

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      body: toolStream,
    });

    render(
      <AssistantWorkbench
        initialSessions={sessions}
        initialPopularTopics={topics}
        initialEngineStatus={status}
      />
    );

    const input = screen.getByPlaceholderText(/Ketik pertanyaan seputar produk/i);
    const sendBtn = screen.getByRole('button', { name: /Kirim ➔/i });

    fireEvent.change(input, { target: { value: 'Hitung simulasi premi 500jt' } });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText(/✓ Selesai: Kalkulator Premi Aktuaria \(Tereksekusi\)/i)).toBeDefined();
      expect(screen.getByText(/Hasil simulasi premi untuk UP 500jt/i)).toBeDefined();
      const actionLink = screen.getByRole('link', { name: /Buka Kalkulator Simulasi 🧮/i });
      expect(actionLink).toBeDefined();
      expect(actionLink.getAttribute('href')).toBe('/simulation');
    });
  });

  it('populates initial input from deep-link query parameters (?q=...)', async () => {
    const Component = await AssistantPage({
      searchParams: Promise.resolve({ q: 'Berapa premi asuransi usia 28 tahun?' }),
    });
    render(Component);

    const input = screen.getByPlaceholderText(/Ketik pertanyaan seputar produk/i) as HTMLInputElement;
    expect(input.value).toBe('Berapa premi asuransi usia 28 tahun?');
  });

  it('populates initial input from fallback prompt parameter (?prompt=...)', async () => {
    const Component = await AssistantPage({
      searchParams: Promise.resolve({ prompt: 'Simulasi produk jiwa murni' }),
    });
    render(Component);

    const input = screen.getByPlaceholderText(/Ketik pertanyaan seputar produk/i) as HTMLInputElement;
    expect(input.value).toBe('Simulasi produk jiwa murni');
  });
});
