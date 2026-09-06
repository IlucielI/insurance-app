import React from 'react';
import type { Metadata } from 'next';
import { AppLayout } from '@/components/templates';
import { applicationService } from '@/server/di';
import { RFIPortalWorkbench } from './RFIPortalWorkbench';

export const metadata: Metadata = {
  title: 'Portal Unggah Aman Dokumen RFI | Bayu Insurance',
  description:
    'Portal resmi unggah dokumen persyaratan tambahan (RFI) nasabah Bayu Insurance terenkripsi SSL 256-bit langsung ke antrean tim underwriter.',
};

interface RFIPortalPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function RFIPortalPage({ params }: RFIPortalPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const applicationId = resolvedParams.id;

  // Query mock application
  let application = await applicationService.getApplicationById(applicationId);
  if (!application) {
    // Fallback: try track query
    application = await applicationService.trackApplication(applicationId);
  }

  // If still not found and user opened demo without id, fallback to APP-2026-8819
  if (!application && applicationId.toLowerCase() === 'demo') {
    application = await applicationService.getApplicationById('APP-2026-8819');
  }

  return (
    <AppLayout currentPath="/portal/rfi">
      <RFIPortalWorkbench
        initialApplication={application}
        applicationId={applicationId}
      />
    </AppLayout>
  );
}
