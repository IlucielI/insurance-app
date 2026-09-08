'use server';

import { applicationService } from '@/server/di';
import { PolicyApplication } from '@/types/application.types';

/**
 * Server Action to track an application by application ID or policy number.
 */
export async function trackApplicationAction(
  query: string
): Promise<PolicyApplication | null> {
  return await applicationService.trackApplication(query);
}

/**
 * Server Action to upload/submit an RFI supplementary document.
 */
export async function submitRfiDocumentAction(
  applicationId: string,
  pillarNumber: number,
  documentType: string,
  fileName: string
): Promise<{ success: boolean; application: PolicyApplication }> {
  return await applicationService.submitRfiDocument(
    applicationId,
    pillarNumber,
    documentType,
    fileName
  );
}
