import {
  ChatSession,
  ChatMessage,
  PopularTopic,
  KnowledgeEngineStatus,
} from '@/types/assistant.types';

export interface IAssistantService {
  getChatSessions(): Promise<ChatSession[]>;
  getChatSession(sessionId: string): Promise<ChatSession | null>;
  startNewSession(title?: string): Promise<ChatSession>;
  sendMessage(sessionId: string, query: string): Promise<ChatMessage>;
  resetSessionMessages(sessionId: string): Promise<void>;
  getPopularTopics(): Promise<PopularTopic[]>;
  getEngineStatus(): Promise<KnowledgeEngineStatus>;
}
