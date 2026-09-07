import { InsuranceProduct } from '@/server/repositories/product.repository.interface';
import { SimulationInput, SimulationResult } from '@/types/simulation.types';

export interface ISimulationService {
  calculate(input: SimulationInput, product: InsuranceProduct): SimulationResult;
  calculateAsync(input: SimulationInput, product: InsuranceProduct): Promise<SimulationResult>;
}
