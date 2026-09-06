import { describe, it, expect, beforeEach } from 'vitest';
import { AssistantMockRepository } from './assistant.mock.repository';

describe('AssistantMockRepository', () => {
  let repository: AssistantMockRepository;

  beforeEach(() => {
    repository = new AssistantMockRepository();
  });

  it('retrieves all initial seeded chat sessions', async () => {
    const sessions = await repository.getSessions();
    expect(sessions.length).toBeGreaterThanOrEqual(3);
    expect(sessions[0].id).toBe('sess-klaim-01');
    expect(sessions[0].title).toContain('Syarat Klaim Meninggal Dunia');
    expect(sessions[0].messages.length).toBeGreaterThanOrEqual(4);
  });

  it('retrieves session by valid ID and returns null for non-existent ID', async () => {
    const session = await repository.getSessionById('sess-klaim-01');
    expect(session).not.toBeNull();
    expect(session?.title).toContain('Klaim');

    const notFound = await repository.getSessionById('invalid-sess-id');
    expect(notFound).toBeNull();
  });

  it('creates a new session and prepends it to the list', async () => {
    const newSession = await repository.createSession('Pertanyaan Khusus Klaim');
    expect(newSession.id).toBeDefined();
    expect(newSession.title).toContain('Pertanyaan Khusus Klaim');

    const sessions = await repository.getSessions();
    expect(sessions[0].id).toBe(newSession.id);
  });

  it('adds a message to an existing session with immutability', async () => {
    const addedMsg = await repository.addMessage('sess-klaim-01', {
      sender: 'user',
      content: 'Berapa persen santunan untuk cacat total tetap?',
    });

    expect(addedMsg.id).toBeDefined();
    expect(addedMsg.content).toContain('cacat total tetap');

    const session = await repository.getSessionById('sess-klaim-01');
    expect(session?.messages.some((m) => m.id === addedMsg.id)).toBe(true);
  });

  it('throws an error when adding message to non-existent session', async () => {
    await expect(
      repository.addMessage('nonexistent-session', {
        sender: 'user',
        content: 'Halo?',
      })
    ).rejects.toThrow('tidak ditemukan');
  });

  it('clears session messages and leaves a welcome reset message', async () => {
    await repository.clearSession('sess-klaim-01');
    const session = await repository.getSessionById('sess-klaim-01');
    expect(session?.messages.length).toBe(1);
    expect(session?.messages[0].content).toContain('telah dibersihkan');
    expect(session?.lastActive).toBe('Baru saja dibersihkan');
    expect(session?.previewText).toBe('Percakapan telah dibersihkan.');
  });

  it('retrieves popular topics and engine status', async () => {
    const topics = await repository.getPopularTopics();
    expect(topics.length).toBe(5);
    expect(topics[0].title).toBe('Syarat Dokumen Klaim');

    const status = await repository.getEngineStatus();
    expect(status.version).toBe('CORE API ENGINE v1.2');
    expect(status.status).toBe('online');
  });
});
