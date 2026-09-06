import { InsuranceProduct } from '@/server/repositories/product.repository.interface';

export interface SimulationInput {
  productId: string;
  sumAssured: number;
  termYears: number;
  applicantAge: number;
  isSmoker: boolean;
  frequency: 'monthly' | 'annually';
  selectedRiderIds: string[];
}

export interface RiderCostItem {
  id: string;
  name: string;
  extraPriceLabel: string;
  annualCost: number;
  monthlyCost: number;
}

export interface ActuarialBreakdown {
  baseRate: number;
  ageFactor: number;
  smokerFactor: number;
  baseAnnualPremium: number;
  ridersAnnualTotal: number;
  ridersBreakdown: RiderCostItem[];
  adminFee: number;
  underwritingTier: 'guaranteed_issue' | 'simplified' | 'full_underwriting';
  underwritingDescription: string;
}

export interface SimulationResult {
  product: InsuranceProduct;
  sumAssured: number;
  termYears: number;
  applicantAge: number;
  isSmoker: boolean;
  frequency: 'monthly' | 'annually';
  monthlyPremium: number;
  annualPremium: number;
  annualSavings: number;
  activePremium: number;
  selectedRiders: RiderCostItem[];
  breakdown: ActuarialBreakdown;
  ojkTableReference: string;
}
