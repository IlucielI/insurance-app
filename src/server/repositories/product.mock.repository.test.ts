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
    it('returns all products when categoryKey is undefined or all', async () => {
      const all1 = await repository.getProducts();
      expect(all1).toHaveLength(4);

      const all2 = await repository.getProducts('all');
      expect(all2).toHaveLength(4);
    });

    it('filters products by categoryKey', async () => {
      const life = await repository.getProducts('life');
      expect(life).toHaveLength(1);
      expect(life[0].id).toBe('prod-term-life');

      const health = await repository.getProducts('health');
      expect(health).toHaveLength(1);
      expect(health[0].id).toBe('prod-healthcare-prime');

      const education = await repository.getProducts('education');
      expect(education).toHaveLength(1);
      expect(education[0].id).toBe('prod-educare');
    });
  });

  describe('getProductById', () => {
    it('returns product when found', async () => {
      const product = await repository.getProductById('prod-term-life');
      expect(product).not.toBeNull();
      expect(product?.id).toBe('prod-term-life');
      expect(product?.title).toBe('Term Life Guard Plus');
    });

    it('returns null when product is not found', async () => {
      const product = await repository.getProductById('non-existent-id');
      expect(product).toBeNull();
    });
  });
});
