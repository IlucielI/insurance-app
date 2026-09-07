import {
  InsuranceProduct,
  ProductCategoryKey,
  ProductPricingRuleDTO,
  ProductQuestionnaireDTO,
} from '../repositories/product.repository.interface';

export interface IProductService {
  getFeaturedProducts(): Promise<InsuranceProduct[]>;
  getProducts(
    categoryKey?: ProductCategoryKey | 'all',
    search?: string
  ): Promise<InsuranceProduct[]>;
  getProductBySlug(slug: string): Promise<InsuranceProduct | null>;
  getProductById(id: string): Promise<InsuranceProduct | null>;
  getPricingRules(slug: string): Promise<ProductPricingRuleDTO[]>;
  getQuestionnaire(slug: string): Promise<ProductQuestionnaireDTO | null>;
}

