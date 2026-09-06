import React from 'react';
import { AppLayout } from '@/components/templates';
import { assistantService } from '@/server/di';
import { AssistantWorkbench } from './AssistantWorkbench';

export default async function AssistantPage() {
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
      />
    </AppLayout>
  );
}
