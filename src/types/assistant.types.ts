export interface ChatMessageCitation {
  id: string;
  source: string;
  title?: string;
  sourceType?: string;
  page?: number;
  url?: string;
  score?: number;
  excerpt?: string;
}

export type AssistantStreamEventType =
  | 'token'
  | 'tool_call'
  | 'tool_result'
  | 'done'
  | 'error';

export interface AssistantStreamEvent {
  type: AssistantStreamEventType;
  content?: string;
  tool_name?: string;
  conversation_id?: string;
  sources?: Array<{
    title: string;
    source_type?: string;
    score?: number;
    excerpt?: string;
  }>;
  tools_used?: string[];
  error?: string;
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

export interface ToolCallStatus {
  toolName: string;
  label: string;
  status: 'calling' | 'completed';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: ChatMessageCitation[];
  checklistCard?: ChatMessageChecklist;
  actionButtons?: ChatAction[];
  toolCall?: ToolCallStatus;
  toolsUsed?: string[];
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
