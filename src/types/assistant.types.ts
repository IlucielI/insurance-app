export interface ChatMessageCitation {
  id: string;
  source: string;
  page?: number;
  url?: string;
}

export interface ChatAction {
  label: string;
  actionType: 'navigate' | 'download';
  target: string;
}

export interface ChatMessageChecklist {
  title: string;
  items: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: ChatMessageCitation[];
  checklistCard?: ChatMessageChecklist;
  actionButtons?: ChatAction[];
  tags?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  lastActive: string;
  previewText: string;
  messages: ChatMessage[];
}

export interface PopularTopic {
  id: string;
  icon: string;
  title: string;
  prompt: string;
}

export interface KnowledgeEngineStatus {
  version: string;
  indexedDocsCount: number;
  vectorDimension: number;
  avgSlaMs: number;
  status: 'online' | 'offline';
}
