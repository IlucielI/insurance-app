import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductService } from './product.service';
import type {
  IProductRepository,
  InsuranceProduct,
} from '../repositories/product.repository.interface';

describe('ProductService', () => {
  let repository: IProductRepository;
  let service: ProductService;

  const mockProduct: InsuranceProduct = {
    id: 'prod-term-life',
    slug: 'prod-term-life',
    categoryKey: 'life',
    category: 'Asuransi Jiwa Berjangka',
    title: 'Term Life Guard Plus',
    description: 'Proteksi finansial komprehensif.',
    startingPrice: 'Rp 150.000 / bln',
    coverageAmount: 'Hingga Rp 2.500.000.000',
    coverageTerm: '10 Tahun',
    badge: 'Populer',
    badgeVariant: 'emerald',
    features: ['Fitur 1', 'Fitur 2'],
    isPopular: true,
    isFeatured: true,
    baseRate: 0.0035,
    minAge: 18,
    maxAge: 60,
    minSumAssured: 100_000_000,
    maxSumAssured: 2_500_000_000,
    waitingPeriodDays: 0,
    claimMethod: 'instant_transfer',
    underwritingNote: 'Otomatis',
    benefitsDetailed: [{ title: 'Manfaat', description: 'Deskripsi' }],
    riders: [],
  };

  beforeEach(() => {
    repository = {
      getFeaturedProducts: vi.fn().mockResolvedValue([mockProduct]),
      getProducts: vi.fn().mockResolvedValue([mockProduct]),
      getProductBySlug: vi.fn().mockResolvedValue(mockProduct),
      getProductById: vi.fn().mockResolvedValue(mockProduct),
    };
    service = new ProductService(repository);
  });

  describe('getFeaturedProducts', () => {
    it('delegates to repository getFeaturedProducts', async () => {
      const result = await service.getFeaturedProducts();

      expect(repository.getFeaturedProducts).toHaveBeenCalledOnce();
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('getProducts', () => {
    it('delegates to repository getProducts with categoryKey and trimmed search', async () => {
      const result = await service.getProducts('life', '  guard  ');

      expect(repository.getProducts).toHaveBeenCalledWith('life', 'guard');
      expect(result).toEqual([mockProduct]);
    });

    it('passes undefined when search is not provided or empty whitespace', async () => {
      await service.getProducts('all', '   ');

      expect(repository.getProducts).toHaveBeenCalledWith('all', undefined);
    });
  });

  describe('getProductBySlug', () => {
    it('delegates to repository getProductBySlug with trimmed slug', async () => {
      const result = await service.getProductBySlug('  prod-term-life  ');

      expect(repository.getProductBySlug).toHaveBeenCalledWith('prod-term-life');
      expect(result).toEqual(mockProduct);
    });

    it('returns null if slug is empty or whitespace without calling repository', async () => {
      const result = await service.getProductBySlug('   ');

      expect(result).toBeNull();
      expect(repository.getProductBySlug).not.toHaveBeenCalled();
    });
  });

  describe('getProductById', () => {
    it('delegates to repository getProductById with trimmed id', async () => {
      const result = await service.getProductById('  prod-term-life  ');

      expect(repository.getProductById).toHaveBeenCalledWith('prod-term-life');
      expect(result).toEqual(mockProduct);
    });

    it('returns null if id is empty or whitespace without calling repository', async () => {
      const result = await service.getProductById('   ');

      expect(result).toBeNull();
      expect(repository.getProductById).not.toHaveBeenCalled();
    });
  });
});
