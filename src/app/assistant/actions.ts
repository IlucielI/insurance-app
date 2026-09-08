'use server';

import { assistantService } from '@/server/di';
import { ChatSession, ChatMessage } from '@/types/assistant.types';

/**
 * Server Action to initialize a new assistant chat session.
 */
export async function startNewSessionAction(): Promise<ChatSession> {
  return await assistantService.startNewSession();
}

/**
 * Server Action to send a chat message and receive AI response (fallback if SSE unavailable).
 */
export async function sendAssistantMessageAction(
  sessionId: string,
  content: string
): Promise<ChatMessage> {
  return await assistantService.sendMessage(sessionId, content);
}

/**
 * Server Action to get chat session history and metadata.
 */
export async function getChatSessionAction(
  sessionId: string
): Promise<ChatSession | null> {
  return await assistantService.getChatSession(sessionId);
}

/**
 * Server Action to reset session messages.
 */
export async function resetSessionAction(
  sessionId: string
): Promise<void> {
  await assistantService.resetSessionMessages(sessionId);
}
