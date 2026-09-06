import { describe, it, expect, beforeEach } from 'vitest';
import { ProductMockRepository } from './product.mock.repository';

describe('ProductMockRepository', () => {
  let repository: ProductMockRepository;

  beforeEach(() => {
    repository = new ProductMockRepository();
  });

  describe('getFeaturedProducts', () => {
    it('returns only featured products', async () => {
      const featured = await repository.getFeaturedProducts();

      expect(featured).toHaveLength(3);
      expect(featured.every((p) => p.isFeatured)).toBe(true);
      expect(featured.map((p) => p.id)).toEqual([
        'prod-term-life',
        'prod-critical-illness',
        'prod-educare',
      ]);
    });

    it('returns deep copy preventing external mutation', async () => {
      const featured1 = await repository.getFeaturedProducts();
      featured1[0].startingPrice = 'Rp 0';

      const featured2 = await repository.getFeaturedProducts();
      expect(featured2[0].startingPrice).not.toBe('Rp 0');
    });
  });

  describe('getProducts', () => {
    it('returns all 6 products when categoryKey is undefined or all', async () => {
      const all1 = await repository.getProducts();
      expect(all1).toHaveLength(6);

      const all2 = await repository.getProducts('all');
      expect(all2).toHaveLength(6);
    });

    it('filters products by categoryKey', async () => {
      const life = await repository.getProducts('life');
      expect(life).toHaveLength(2);
      expect(life.map((p) => p.id)).toEqual(['prod-term-life', 'prod-senior-care']);

      const health = await repository.getProducts('health');
      expect(health).toHaveLength(2);
      expect(health.map((p) => p.id)).toEqual(['prod-healthcare-prime', 'prod-family-hospital']);

      const education = await repository.getProducts('education');
      expect(education).toHaveLength(1);
      expect(education[0].id).toBe('prod-educare');

      const critical = await repository.getProducts('critical_illness');
      expect(critical).toHaveLength(1);
      expect(critical[0].id).toBe('prod-critical-illness');
    });

    it('filters products by search keyword across title, category, description, and features', async () => {
      const searchTitle = await repository.getProducts(undefined, 'Senior');
      expect(searchTitle).toHaveLength(1);
      expect(searchTitle[0].id).toBe('prod-senior-care');

      const searchFeature = await repository.getProducts(undefined, 'cashless');
      expect(searchFeature.length).toBeGreaterThanOrEqual(2);

      const searchEmpty = await repository.getProducts(undefined, '   ');
      expect(searchEmpty).toHaveLength(6);

      const searchNotFound = await repository.getProducts(undefined, 'NONEXISTENT_QUERY_123');
      expect(searchNotFound).toHaveLength(0);
    });

    it('combines categoryKey and search filter', async () => {
      const combined = await repository.getProducts('health', 'family');
      expect(combined).toHaveLength(1);
      expect(combined[0].id).toBe('prod-family-hospital');
    });
  });

  describe('getProductById', () => {
    it('returns product when found', async () => {
      const product = await repository.getProductById('prod-term-life');
      expect(product).not.toBeNull();
      expect(product?.id).toBe('prod-term-life');
      expect(product?.title).toBe('Term Life Guard Plus');
      expect(product?.benefitsDetailed.length).toBeGreaterThan(0);
    });

    it('returns null when product is not found', async () => {
      const product = await repository.getProductById('non-existent-id');
      expect(product).toBeNull();
    });
  });
});
