import { describe, it, expect, beforeEach } from 'vitest';
import { AssistantService } from './assistant.service';
import { AssistantMockRepository } from '../repositories/assistant.mock.repository';

describe('AssistantService', () => {
  let repository: AssistantMockRepository;
  let service: AssistantService;

  beforeEach(() => {
    repository = new AssistantMockRepository();
    service = new AssistantService(repository);
  });

  it('retrieves all chat sessions and specific session by ID', async () => {
    const sessions = await service.getChatSessions();
    expect(sessions.length).toBeGreaterThanOrEqual(3);

    const specific = await service.getChatSession('sess-klaim-01');
    expect(specific).not.toBeNull();
    expect(specific?.title).toContain('Klaim');
  });

  it('starts a new chat session', async () => {
    const created = await service.startNewSession('Pertanyaan Khusus Premi');
    expect(created.id).toBeDefined();
    expect(created.title).toContain('Pertanyaan Khusus Premi');
    expect(created.messages.length).toBe(1);
  });

  it('sends a user message and returns synthesized RAG response for claim inquiries', async () => {
    const aiResponse = await service.sendMessage(
      'sess-klaim-01',
      'Apa saja berkas syarat dokumen klaim meninggal dunia?'
    );

    expect(aiResponse.sender).toBe('assistant');
    expect(aiResponse.content).toContain('3 Hari Kerja');
    expect(aiResponse.checklistCard?.items.length).toBe(4);
    expect(aiResponse.citations?.[0].source).toContain('SEOJK.05/2022');
    expect(aiResponse.actionButtons?.length).toBe(2);
  });

  it('returns appropriate response for accident waiting period query', async () => {
    const aiResponse = await service.sendMessage(
      'sess-klaim-01',
      'Berapa lama masa tunggu perlindungan kecelakaan?'
    );

    expect(aiResponse.content).toContain('0 hari masa tunggu');
    expect(aiResponse.tags?.[0]).toContain('0 Hari');
  });

  it('returns appropriate response for age limit query', async () => {
    const aiResponse = await service.sendMessage(
      'sess-klaim-01',
      'Berapa batas usia calon tertanggung?'
    );

    expect(aiResponse.content).toContain('18 hingga 60 tahun');
  });

  it('returns appropriate response for beneficiary query', async () => {
    const aiResponse = await service.sendMessage(
      'sess-klaim-01',
      'Bagaimana aturan pembagian ahli waris dan persen porsi?'
    );

    expect(aiResponse.content).toContain('100%');
  });

  it('returns appropriate response for premium and simulation queries', async () => {
    const aiResponse = await service.sendMessage(
      'sess-klaim-01',
      'Berapa premi terendah per bulan dan bagaimana simulasi?'
    );

    expect(aiResponse.content).toContain('TMI IV');
    expect(aiResponse.actionButtons?.[0].target).toBe('/simulation');
  });

  it('returns fallback response for general unmapped query', async () => {
    const aiResponse = await service.sendMessage(
      'sess-klaim-01',
      'Selamat pagi kawan'
    );

    expect(aiResponse.content).toContain('Terima kasih atas pertanyaan Anda');
  });

  it('throws error when message query is empty or whitespace', async () => {
    await expect(service.sendMessage('sess-klaim-01', '   ')).rejects.toThrow(
      'Pertanyaan tidak boleh kosong'
    );
  });

  it('resets session messages and retrieves popular topics & engine status', async () => {
    await service.resetSessionMessages('sess-klaim-01');
    const session = await service.getChatSession('sess-klaim-01');
    expect(session?.messages.length).toBe(1);

    const topics = await service.getPopularTopics();
    expect(topics.length).toBe(5);

    const status = await service.getEngineStatus();
    expect(status.status).toBe('online');
  });
});
