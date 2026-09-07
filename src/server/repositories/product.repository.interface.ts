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

export interface QuoteCalculationRequest {
  age: number;
  gender: 'male' | 'female';
  sum_assured: number;
  payment_term: number;
  payment_frequency: 'annual' | 'semi_annual' | 'quarterly' | 'monthly';
  smoker: 'yes' | 'no';
  occupation_class: 'low' | 'standard' | 'high';
  health_risk?: 'low' | 'medium' | 'high';
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
}
