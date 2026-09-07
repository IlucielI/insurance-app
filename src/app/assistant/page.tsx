import React from 'react';
import { AppLayout } from '@/components/templates';
import { assistantService } from '@/server/di';
import { AssistantWorkbench } from './AssistantWorkbench';

interface AssistantPageProps {
  searchParams?: Promise<{
    q?: string;
    prompt?: string;
  }>;
}

export default async function AssistantPage({ searchParams }: AssistantPageProps = {}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const initialQuery = resolvedParams.q?.trim() || resolvedParams.prompt?.trim() || '';

  const [sessions, popularTopics, engineStatus] = await Promise.all([
    assistantService.getChatSessions(),
    assistantService.getPopularTopics(),
    assistantService.getEngineStatus(),
  ]);

  return (
    <AppLayout currentPath="/assistant">
      <AssistantWorkbench
        initialSessions={sessions}
        initialPopularTopics={popularTopics}
        initialEngineStatus={engineStatus}
        initialQuery={initialQuery}
      />
    </AppLayout>
  );
}
