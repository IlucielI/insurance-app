'use server';

import { applicationService } from '@/server/di';
import {
  CreateApplicationDTO,
  ApplicationSubmissionResult,
} from '@/types/application.types';

/**
 * Server Action for submitting an insurance policy application.
 * Runs on the Next.js server environment with access to internal network
 * variables (e.g. CORE_API_URL, CORE_API_INTERNAL_URL).
 */
export async function submitApplicationAction(
  payload: CreateApplicationDTO
): Promise<ApplicationSubmissionResult> {
  return await applicationService.submitApplication(payload);
}
