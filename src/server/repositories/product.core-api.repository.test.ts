import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  CoreApiProductRepository,
  CoreApiProduct,
} from './product.core-api.repository';

describe('CoreApiProductRepository', () => {
  const originalFetch = global.fetch;
  const mockBaseUrl = 'https://core-api.example.com';

  const mockCoreProduct: CoreApiProduct = {
    id: 'prod_secure_life_plus',
    name: 'Secure Life Plus',
    slug: 'secure-life-plus',
    category: 'life',
    short_description: 'Asuransi jiwa berjangka untuk proteksi keluarga.',
    description: 'Deskripsi lengkap perlindungan finansial jiwa.',
    target_customer: 'Keluarga muda',
    min_sum_assured: 100_000_000,
    max_sum_assured: 2_000_000_000,
    min_payment_term: 5,
    max_payment_term: 20,
    starting_premium: 185_000,
    pricing_rules: {
      base_rate: 0.0035,
      age_factors: [
        { min_age: 18, max_age: 30, factor: 1.0 },
        { min_age: 31, max_age: 60, factor: 2.0 },
      ],
    },
    benefits: ['Santunan meninggal dunia', 'Bebas premi penyakit kritis'],
    exclusions: ['Klaim fiktif'],
    is_featured: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('Configuration & URL resolution', () => {
    it('throws descriptive error if Core API URL is missing', async () => {
      const repo = new CoreApiProductRepository('');
      await expect(repo.getProducts()).rejects.toThrow(
        'Core API URL is not configured. Please set CORE_API_URL or NEXT_PUBLIC_CORE_API_URL, or enable MOCK_CORE_API=true.'
      );
      await expect(repo.getFeaturedProducts()).rejects.toThrow(
        'Core API URL is not configured. Please set CORE_API_URL or NEXT_PUBLIC_CORE_API_URL, or enable MOCK_CORE_API=true.'
      );
      await expect(repo.getProductBySlug('test')).rejects.toThrow(
        'Core API URL is not configured. Please set CORE_API_URL or NEXT_PUBLIC_CORE_API_URL, or enable MOCK_CORE_API=true.'
      );
    });

    it('resolves baseUrl from environment variables', () => {
      const origEnv = process.env.CORE_API_URL;
      process.env.CORE_API_URL = 'https://custom-core-api.com';
      const repo = new CoreApiProductRepository();
      expect((repo as unknown as { baseUrl: string }).baseUrl).toBe(
        'https://custom-core-api.com'
      );
      process.env.CORE_API_URL = origEnv;
    });
  });

  describe('getProducts', () => {
    it('fetches products without filters', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: [mockCoreProduct] }),
      });

      const repo = new CoreApiProductRepository(mockBaseUrl);
      const products = await repo.getProducts();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://core-api.example.com/api/v1/products',
        expect.objectContaining({ cache: 'no-store' })
      );
      expect(products).toHaveLength(1);
      expect(products[0].slug).toBe('secure-life-plus');
      expect(products[0].title).toBe('Secure Life Plus');
      expect(products[0].categoryKey).toBe('life');
      expect(products[0].category).toBe('Asuransi Jiwa');
      expect(products[0].startingPrice).toContain('185.000');
      expect(products[0].isFeatured).toBe(true);
      expect(products[0].minAge).toBe(18);
      expect(products[0].maxAge).toBe(60);
    });

    it('passes category and search parameters correctly', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: [mockCoreProduct] }),
      });

      const repo = new CoreApiProductRepository(mockBaseUrl);
      await repo.getProducts('life', 'secure');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://core-api.example.com/api/v1/products?category=life&search=secure',
        expect.anything()
      );
    });

    it('omits category when all is passed', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: [mockCoreProduct] }),
      });

      const repo = new CoreApiProductRepository(mockBaseUrl);
      await repo.getProducts('all', 'life');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://core-api.example.com/api/v1/products?search=life',
        expect.anything()
      );
    });

    it('throws error when API returns non-OK status', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      const repo = new CoreApiProductRepository(mockBaseUrl);
      await expect(repo.getProducts()).rejects.toThrow(
        'Core API error fetching products: HTTP 500'
      );
    });
  });

  describe('getFeaturedProducts', () => {
    it('fetches featured products with featured=true query', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: [mockCoreProduct] }),
      });

      const repo = new CoreApiProductRepository(mockBaseUrl);
      const featured = await repo.getFeaturedProducts();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://core-api.example.com/api/v1/products?featured=true',
        expect.anything()
      );
      expect(featured).toHaveLength(1);
      expect(featured[0].isFeatured).toBe(true);
    });

    it('throws error when API fails on featured query', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
      });

      const repo = new CoreApiProductRepository(mockBaseUrl);
      await expect(repo.getFeaturedProducts()).rejects.toThrow(
        'Core API error fetching featured products: HTTP 502'
      );
    });
  });

  describe('getProductBySlug', () => {
    it('returns null on empty slug without calling fetch', async () => {
      global.fetch = vi.fn();
      const repo = new CoreApiProductRepository(mockBaseUrl);
      const result = await repo.getProductBySlug('   ');

      expect(result).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('fetches product by slug and maps attributes', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: mockCoreProduct }),
      });

      const repo = new CoreApiProductRepository(mockBaseUrl);
      const product = await repo.getProductBySlug('secure-life-plus');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://core-api.example.com/api/v1/products/secure-life-plus',
        expect.objectContaining({ cache: 'no-store' })
      );
      expect(product).not.toBeNull();
      expect(product?.slug).toBe('secure-life-plus');
      expect(product?.title).toBe('Secure Life Plus');
    });

    it('returns null when product is not found (404)', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const repo = new CoreApiProductRepository(mockBaseUrl);
      const product = await repo.getProductBySlug('non-existent');

      expect(product).toBeNull();
    });

    it('throws error on internal server error (500)', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      const repo = new CoreApiProductRepository(mockBaseUrl);
      await expect(repo.getProductBySlug('server-error')).rejects.toThrow(
        'Core API error fetching product server-error: HTTP 500'
      );
    });

    it('getProductById delegates to getProductBySlug', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: mockCoreProduct }),
      });

      const repo = new CoreApiProductRepository(mockBaseUrl);
      const product = await repo.getProductById('secure-life-plus');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://core-api.example.com/api/v1/products/secure-life-plus',
        expect.anything()
      );
      expect(product?.slug).toBe('secure-life-plus');
    });
  });
});
