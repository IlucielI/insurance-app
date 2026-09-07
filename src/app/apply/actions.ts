'use server';

import { applicationService } from '@/server/di';
import {
  CreateApplicationDTO,
  ApplicationSubmissionResult,
} from '@/types/application.types';

// Server Action for submitting an insurance policy application via Next.js server runtime.
export async function submitApplicationAction(
  payload: CreateApplicationDTO
): Promise<ApplicationSubmissionResult> {
  return await applicationService.submitApplication(payload);
}
