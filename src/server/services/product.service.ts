import {
  IProductRepository,
  InsuranceProduct,
  ProductCategoryKey,
} from '../repositories/product.repository.interface';
import { IProductService } from './product.service.interface';

export class ProductService implements IProductService {
  constructor(private readonly repository: IProductRepository) {}

  async getFeaturedProducts(): Promise<InsuranceProduct[]> {
    return this.repository.getFeaturedProducts();
  }

  async getProducts(
    categoryKey?: ProductCategoryKey | 'all',
    search?: string
  ): Promise<InsuranceProduct[]> {
    const trimmedSearch = search?.trim() || undefined;
    return this.repository.getProducts(categoryKey, trimmedSearch);
  }

  async getProductById(id: string): Promise<InsuranceProduct | null> {
    const trimmedId = id?.trim();
    if (!trimmedId) {
      return null;
    }
    return this.repository.getProductById(trimmedId);
  }
}
