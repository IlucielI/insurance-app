export type ProductCategoryKey = 'life' | 'health' | 'education' | 'critical_illness';

export interface ProductBenefitDetail {
  title: string;
  description: string;
}

export interface ProductRider {
  id: string;
  name: string;
  extraPrice: string;
  description: string;
}

export interface InsuranceProduct {
  id: string;
  categoryKey: ProductCategoryKey;
  category: string;
  title: string;
  description: string;
  startingPrice: string;
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
  benefitsDetailed: ProductBenefitDetail[];
  waitingPeriodDays: number;
  claimMethod: 'cashless' | 'instant_transfer' | 'reimbursement';
  underwritingNote: string;
  riders: ProductRider[];
}

export interface IProductRepository {
  getFeaturedProducts(): Promise<InsuranceProduct[]>;
  getProducts(
    categoryKey?: ProductCategoryKey | 'all',
    search?: string
  ): Promise<InsuranceProduct[]>;
  getProductById(id: string): Promise<InsuranceProduct | null>;
}
