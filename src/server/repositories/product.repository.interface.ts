export type ProductCategoryKey = 'life' | 'health' | 'education' | 'critical_illness';

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
}

export interface IProductRepository {
  getFeaturedProducts(): Promise<InsuranceProduct[]>;
  getProducts(categoryKey?: ProductCategoryKey | 'all'): Promise<InsuranceProduct[]>;
  getProductById(id: string): Promise<InsuranceProduct | null>;
}
