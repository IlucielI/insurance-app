import { InsuranceProduct } from '@/server/repositories/product.repository.interface';

export interface QuoteAnswerItem {
  rule_code?: string;
  rule_id?: string;
  value: string;
}

export interface DynamicFactorItem {
  ruleCode: string;
  ruleName: string;
  factor: number;
}

export interface SimulationInput {
  productId: string;
  sumAssured: number;
  termYears: number;
  applicantAge: number;
  isSmoker?: boolean;
  frequency: 'monthly' | 'annually';
  selectedRiderIds: string[];
  gender?: 'male' | 'female';
  occupationRisk?: 'low' | 'standard' | 'high';
  answers?: Record<string, string>;
  dynamicMultipliers?: Record<string, number>;
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
  genderFactor: number;
  occupationFactor: number;
  annualDiscountPercent: number;
  baseAnnualPremium: number;
  ridersAnnualTotal: number;
  ridersBreakdown: RiderCostItem[];
  adminFee: number;
  underwritingTier: 'guaranteed_issue' | 'simplified' | 'full_underwriting';
  underwritingDescription: string;
  dynamicFactors?: DynamicFactorItem[];
}

export interface SimulationResult {
  product: InsuranceProduct;
  sumAssured: number;
  termYears: number;
  applicantAge: number;
  isSmoker: boolean;
  frequency: 'monthly' | 'annually';
  gender: 'male' | 'female';
  occupationRisk: 'low' | 'standard' | 'high';
  monthlyPremium: number;
  annualPremium: number;
  annualSavings: number;
  activePremium: number;
  selectedRiders: RiderCostItem[];
  breakdown: ActuarialBreakdown;
  ojkTableReference: string;
  answers?: Record<string, string>;
}

