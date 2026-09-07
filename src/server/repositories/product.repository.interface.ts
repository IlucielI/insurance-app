export type ProductCategoryKey = 'life' | 'health' | 'vehicle' | 'education' | 'critical_illness';

export interface ProductBenefitDetail {
  title: string;
  description: string;
}

export interface ProductRider {
  id: string;
  name: string;
  extraPrice: string;
  description?: string;
}

export interface ProductAgeFactor {
  minAge: number;
  maxAge: number;
  factor: number;
}

export interface InsuranceProduct {
  id: string;
  slug: string;
  categoryKey: ProductCategoryKey;
  category: string;
  title: string;
  tagline?: string;
  description: string;
  startingPrice: string;
  monthlyPremiumStarting?: number | string;
  coverageAmount: string;
  coverageTerm: string;
  badge?: string;
  badgeVariant?: 'emerald' | 'blue' | 'amber' | 'purple' | 'slate';
  features: string[];
  isPopular?: boolean;
  isFeatured?: boolean;
  baseRate: number;
  minAge: number;
  maxAge: number;
  minSumAssured: number;
  maxSumAssured: number;
  minTermYears?: number;
  maxTermYears?: number;
  benefitsDetailed: ProductBenefitDetail[];
  waitingPeriodDays: number;
  claimMethod: 'cashless' | 'instant_transfer' | 'reimbursement';
  underwritingNote: string;
  riders?: ProductRider[];
  ageFactors?: ProductAgeFactor[];
  sumAssuredPresets?: number[];
  termPresets?: number[];
  genderFactors?: Record<string, number>;
  smokerFactors?: Record<string, number>;
  occupationFactors?: Record<string, number>;
  healthFactors?: Record<string, number>;
  frequencyLoading?: Record<string, number>;
  exclusions?: string[];
}

export interface QuoteCalculationFactorItem {
  rule_code: string;
  rule_name: string;
  factor: number;
}

export interface QuoteCalculationRequest {
  age: number;
  gender: 'male' | 'female';
  sum_assured: number;
  payment_term: number;
  payment_frequency: 'annual' | 'semi_annual' | 'quarterly' | 'monthly';
  smoker?: 'yes' | 'no';
  occupation_class?: 'low' | 'standard' | 'high';
  health_risk?: 'low' | 'medium' | 'high';
  answers?: {
    rule_code?: string;
    rule_id?: string;
    value: string;
  }[];
}

export interface QuoteCalculationBreakdown {
  base_rate: number;
  age_factor: number;
  gender_factor: number;
  smoker_factor: number;
  occupation_factor: number;
  health_factor: number;
  term_factor: number;
  frequency_loading: number;
  factors?: QuoteCalculationFactorItem[];
}

export interface QuoteCalculationResult {
  product_id: string;
  product_name: string;
  product_slug: string;
  currency: string;
  age: number;
  gender: string;
  sum_assured: number;
  payment_term: number;
  payment_frequency: string;
  estimated_premium: number;
  estimated_annual_premium: number;
  breakdown: QuoteCalculationBreakdown;
  notes: string[];
}

export interface QuestionOptionDTO {
  value: string;
  label: string;
  multiplier?: number;
  risk_weight?: number;
  risk_impact?: string;
  rfi_required?: boolean;
}

export interface ProductQuestionDTO {
  id: string;
  questionnaire_id: string;
  step_number: number;
  pillar_type: string;
  code: string;
  label: string;
  help_text?: string;
  input_type: string;
  placeholder?: string;
  order_index: number;
  options?: QuestionOptionDTO[];
  parent_question_id?: string;
  pricing_rule_id?: string;
  affects_pricing_field?: string;
  is_active: boolean;
}

export interface ProductQuestionnaireDTO {
  id: string;
  product_id?: string;
  category: string;
  title: string;
  description?: string;
  version: number;
  is_active: boolean;
  questions: ProductQuestionDTO[];
}

export interface ProductPricingRuleDTO {
  id: string;
  product_id: string;
  rule_code: string;
  rule_name: string;
  rule_type: string;
  factors: Record<string, unknown>;

  is_active: boolean;
  order_index: number;
}

export interface IProductRepository {
  getFeaturedProducts(): Promise<InsuranceProduct[]>;
  getProducts(
    categoryKey?: ProductCategoryKey | 'all',
    search?: string
  ): Promise<InsuranceProduct[]>;
  getProductBySlug(slug: string): Promise<InsuranceProduct | null>;
  getProductById(id: string): Promise<InsuranceProduct | null>;
  calculateQuote(
    slug: string,
    request: QuoteCalculationRequest
  ): Promise<QuoteCalculationResult>;
  getPricingRules(slug: string): Promise<ProductPricingRuleDTO[]>;
  getQuestionnaire(slug: string): Promise<ProductQuestionnaireDTO | null>;
}

