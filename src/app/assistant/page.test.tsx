import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AssistantPage from './page';
import { AssistantWorkbench } from './AssistantWorkbench';
import { assistantService } from '@/server/di';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('AssistantPage & AssistantWorkbench', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
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

  it('clears chat messages when clicking "Bersihkan Chat 🔄"', async () => {
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

    await waitFor(() => {
      expect(screen.getByText(/Percakapan telah dibersihkan/i)).toBeDefined();
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

    consoleSpy.mockRestore();
  });
});
