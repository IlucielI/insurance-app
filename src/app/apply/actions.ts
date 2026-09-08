'use server';

import { applicationService, productService } from '@/server/di';
import {
  CreateApplicationDTO,
  ApplicationSubmissionResult,
} from '@/types/application.types';
import { ProductQuestionnaireDTO } from '@/server/repositories/product.repository.interface';

// Server Action for submitting an insurance policy application via Next.js server runtime.
export async function submitApplicationAction(
  payload: CreateApplicationDTO
): Promise<ApplicationSubmissionResult> {
  return await applicationService.submitApplication(payload);
}

// Server Action for fetching questionnaire definition for a product.
export async function getQuestionnaireAction(
  slug: string
): Promise<ProductQuestionnaireDTO | null> {
  return await productService.getQuestionnaire(slug);
}
