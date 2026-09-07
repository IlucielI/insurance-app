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
      gender_factors: { male: 1.05, female: 1.0 },
      smoker_factors: { yes: 1.35, no: 1.0 },
      occupation_factors: { low: 0.95, standard: 1.0, high: 1.4 },
      health_factors: { low: 1.0, medium: 1.25, high: 1.75 },
      frequency_loading: { annual: 1.0, monthly: 1.06 },
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
      expect(product?.minTermYears).toBe(5);
      expect(product?.maxTermYears).toBe(20);
    });
  });

  describe('calculateQuote', () => {
    const sampleRequest = {
      age: 30,
      gender: 'male' as const,
      sum_assured: 500_000_000,
      payment_term: 10,
      payment_frequency: 'annual' as const,
      smoker: 'no' as const,
      occupation_class: 'low' as const,
      health_risk: 'low' as const,
    };

    it('throws error if Core API URL is missing', async () => {
      const repo = new CoreApiProductRepository('');
      await expect(
        repo.calculateQuote('secure-life-plus', sampleRequest)
      ).rejects.toThrow(
        'Core API URL is not configured. Please set CORE_API_URL or NEXT_PUBLIC_CORE_API_URL, or enable MOCK_CORE_API=true.'
      );
    });

    it('throws error if slug is empty', async () => {
      const repo = new CoreApiProductRepository(mockBaseUrl);
      await expect(
        repo.calculateQuote('   ', sampleRequest)
      ).rejects.toThrow('Product slug is required for quote calculation');
    });

    it('successfully calls POST /api/v1/products/:slug/quotes and returns result', async () => {
      const mockResult = {
        product_id: 'prod-1',
        product_name: 'Secure Life Plus',
        product_slug: 'secure-life-plus',
        currency: 'IDR',
        age: 30,
        gender: 'male',
        sum_assured: 500_000_000,
        payment_term: 10,
        payment_frequency: 'annual',
        estimated_premium: 1_500_000,
        estimated_annual_premium: 1_500_000,
        breakdown: {
          base_rate: 0.003,
          age_factor: 1.0,
          gender_factor: 1.0,
          smoker_factor: 1.0,
          occupation_factor: 1.0,
          health_factor: 1.0,
          term_factor: 1.0,
          frequency_loading: 1.0,
        },
        notes: ['Note 1'],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: mockResult }),
      });

      const repo = new CoreApiProductRepository(mockBaseUrl);
      const res = await repo.calculateQuote('secure-life-plus', sampleRequest);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://core-api.example.com/api/v1/products/secure-life-plus/quotes',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(sampleRequest),
        })
      );
      expect(res.product_slug).toBe('secure-life-plus');
      expect(res.estimated_premium).toBe(1_500_000);
    });

    it('throws error on non-ok HTTP response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ error: 'invalid quote request' }),
      });

      const repo = new CoreApiProductRepository(mockBaseUrl);
      await expect(
        repo.calculateQuote('secure-life-plus', sampleRequest)
      ).rejects.toThrow('Core API error calculating quote for product secure-life-plus: HTTP 400');
    });

    it('throws descriptive error when response body is null or non-object without throwing TypeError', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => null,
      });

      const repo = new CoreApiProductRepository(mockBaseUrl);
      await expect(
        repo.calculateQuote('secure-life-plus', sampleRequest)
      ).rejects.toThrow('Invalid response structure from Core API quote calculation');
    });

    it('throws descriptive error when response body is missing data field', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      const repo = new CoreApiProductRepository(mockBaseUrl);
      await expect(
        repo.calculateQuote('secure-life-plus', sampleRequest)
      ).rejects.toThrow('Invalid response structure from Core API quote calculation');
    });
  });

  describe('Defensive parsing on getProducts and getProductBySlug', () => {
    it('handles null body gracefully in getProducts', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => null,
      });

      const repo = new CoreApiProductRepository(mockBaseUrl);
      const products = await repo.getProducts();
      expect(products).toEqual([]);
    });

    it('handles null body gracefully in getProductBySlug', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => null,
      });

      const repo = new CoreApiProductRepository(mockBaseUrl);
      const product = await repo.getProductBySlug('secure-life-plus');
      expect(product).toBeNull();
    });

    it('maps actuarial factor maps and exclusions correctly from Core API product', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: mockCoreProduct }),
      });

      const repo = new CoreApiProductRepository(mockBaseUrl);
      const product = await repo.getProductBySlug('secure-life-plus');
      expect(product).not.toBeNull();
      expect(product?.genderFactors).toEqual({ male: 1.05, female: 1.0 });
      expect(product?.smokerFactors).toEqual({ yes: 1.35, no: 1.0 });
      expect(product?.occupationFactors).toEqual({ low: 0.95, standard: 1.0, high: 1.4 });
      expect(product?.frequencyLoading).toEqual({ annual: 1.0, monthly: 1.06 });
      expect(product?.exclusions).toEqual(['Klaim fiktif']);
    });
  });

  describe('getPricingRules & getQuestionnaire', () => {
    it('fetches pricing rules successfully for a product', async () => {
      const mockRules = [
        {
          id: 'pr_life_smoker',
          product_id: 'prod_1',
          rule_code: 'smoker',
          rule_name: 'Faktor Status Merokok',
          rule_type: 'multiplier_map',
          factors: { yes: 1.35, no: 1.0 },
          is_active: true,
          order_index: 1,
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: mockRules }),
      });

      const repo = new CoreApiProductRepository(mockBaseUrl);
      const rules = await repo.getPricingRules('secure-life-plus');
      expect(rules).toHaveLength(1);
      expect(rules[0].rule_code).toBe('smoker');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://core-api.example.com/api/v1/products/secure-life-plus/pricing-rules',
        expect.any(Object)
      );
    });

    it('returns empty array when pricing rules endpoint returns 404', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const repo = new CoreApiProductRepository(mockBaseUrl);
      const rules = await repo.getPricingRules('unknown-product');
      expect(rules).toEqual([]);
    });

    it('fetches questionnaire successfully for a product', async () => {
      const mockQuest = {
        id: 'quest_1',
        title: 'Formulir Pertanyaan Risiko',
        category: 'life',
        version: 1,
        is_active: true,
        questions: [
          {
            id: 'q_smoker',
            code: 'is_smoker',
            label: 'Kebiasaan Merokok',
            input_type: 'radio',
            pricing_rule_id: 'pr_life_smoker',
            options: [
              { value: 'no', label: 'Bukan Perokok', multiplier: 1.0 },
              { value: 'yes', label: 'Perokok Aktif', multiplier: 1.35 },
            ],
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: mockQuest }),
      });

      const repo = new CoreApiProductRepository(mockBaseUrl);
      const quest = await repo.getQuestionnaire('secure-life-plus');
      expect(quest).not.toBeNull();
      expect(quest?.questions).toHaveLength(1);
      expect(quest?.questions[0].code).toBe('is_smoker');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://core-api.example.com/api/v1/products/secure-life-plus/questionnaire',
        expect.any(Object)
      );
    });

    it('returns null when questionnaire endpoint returns 404', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const repo = new CoreApiProductRepository(mockBaseUrl);
      const quest = await repo.getQuestionnaire('unknown-product');
      expect(quest).toBeNull();
    });
  });
});

