'use server';

import { simulationService, productRepository } from '@/server/di';
import {
  InsuranceProduct,
  ProductQuestionnaireDTO,
} from '@/server/repositories/product.repository.interface';
import { SimulationInput, SimulationResult } from '@/types/simulation.types';

/**
 * Server Action to calculate quote asynchronously via Core API.
 */
export async function calculateSimulationAction(
  input: SimulationInput,
  product: InsuranceProduct
): Promise<SimulationResult> {
  return await simulationService.calculateAsync(input, product);
}

/**
 * Server Action to fetch product questionnaire via Core API.
 */
export async function getQuestionnaireAction(
  slug: string
): Promise<ProductQuestionnaireDTO | null> {
  return await productRepository.getQuestionnaire(slug);
}
