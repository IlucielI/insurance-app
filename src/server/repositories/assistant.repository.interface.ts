import {
  ChatSession,
  ChatMessage,
  PopularTopic,
  KnowledgeEngineStatus,
} from '@/types/assistant.types';

export interface IAssistantRepository {
  getSessions(): Promise<ChatSession[]>;
  getSessionById(id: string): Promise<ChatSession | null>;
  createSession(title?: string): Promise<ChatSession>;
  addMessage(
    sessionId: string,
    message: Omit<ChatMessage, 'id' | 'timestamp'>
  ): Promise<ChatMessage>;
  clearSession(sessionId: string): Promise<void>;
  getPopularTopics(): Promise<PopularTopic[]>;
  getEngineStatus(): Promise<KnowledgeEngineStatus>;
}
