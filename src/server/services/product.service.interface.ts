import {
  InsuranceProduct,
  ProductCategoryKey,
} from '../repositories/product.repository.interface';

export interface IProductService {
  getFeaturedProducts(): Promise<InsuranceProduct[]>;
  getProducts(
    categoryKey?: ProductCategoryKey | 'all',
    search?: string
  ): Promise<InsuranceProduct[]>;
  getProductById(id: string): Promise<InsuranceProduct | null>;
}
