import React from 'react';
import { AppLayout } from '@/components/templates';
import { applicationService } from '@/server/di';
import { TrackingWorkbench } from './TrackingWorkbench';

interface TrackingPageProps {
  searchParams?: Promise<{
    q?: string;
    id?: string;
  }> | {
    q?: string;
    id?: string;
  };
}

export default async function TrackingPage({ searchParams }: TrackingPageProps) {
  const resolvedParams = searchParams ? await Promise.resolve(searchParams) : undefined;
  const initialQuery = resolvedParams?.q || resolvedParams?.id || '';

  const initialApplication = initialQuery
    ? await applicationService.trackApplication(initialQuery)
    : null;

  return (
    <AppLayout currentPath="/tracking">
      <TrackingWorkbench
        initialApplication={initialApplication}
        initialQuery={initialQuery}
      />
    </AppLayout>
  );
}
