import {
  IProductRepository,
  InsuranceProduct,
  ProductCategoryKey,
  ProductPricingRuleDTO,
  ProductQuestionnaireDTO,
  QuoteCalculationRequest,
  QuoteCalculationResult,
} from './product.repository.interface';


export interface CoreApiProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  short_description?: string;
  description?: string;
  target_customer?: string;
  min_sum_assured: number;
  max_sum_assured: number;
  min_payment_term: number;
  max_payment_term: number;
  starting_premium: number;
  pricing_rules?: {
    base_rate?: number;
    age_factors?: { min_age: number; max_age: number; factor: number }[];
    gender_factors?: Record<string, number>;
    smoker_factors?: Record<string, number>;
    occupation_factors?: Record<string, number>;
    health_factors?: Record<string, number>;
    frequency_loading?: Record<string, number>;
    sum_assured_presets?: number[];
    payment_term_presets?: number[];
  };
  benefits?: string[];
  exclusions?: string[];
  is_featured: boolean;
}

export class CoreApiProductRepository implements IProductRepository {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl !== undefined ? baseUrl : this.resolveBaseUrl();
  }

  private resolveBaseUrl(): string {
    return (
      process.env.CORE_API_URL?.trim() ||
      process.env.CORE_API_INTERNAL_URL?.trim() ||
      ''
    );
  }

  private formatCurrency(amount: number): string {
    return `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`;
  }

  private mapCoreApiProductToInsuranceProduct(p: CoreApiProduct): InsuranceProduct {
    const categoryMap: Record<string, { key: ProductCategoryKey; label: string }> = {
      life: { key: 'life', label: 'Asuransi Jiwa' },
      health: { key: 'health', label: 'Asuransi Kesehatan' },
      vehicle: { key: 'vehicle', label: 'Asuransi Kendaraan' },
      education: { key: 'education', label: 'Dana Pendidikan' },
      critical_illness: { key: 'critical_illness', label: 'Penyakit Kritis' },
    };

    const cat = categoryMap[p.category] || {
      key: 'life' as ProductCategoryKey,
      label: p.category.toUpperCase(),
    };

    const ageFactors = p.pricing_rules?.age_factors;
    const minAge = ageFactors && ageFactors.length > 0 ? ageFactors[0].min_age : 18;
    const maxAge =
      ageFactors && ageFactors.length > 0
        ? ageFactors[ageFactors.length - 1].max_age
        : 60;
    const baseRate = p.pricing_rules?.base_rate ?? 0.0035;

    return {
      id: p.slug || p.id,
      slug: p.slug,
      categoryKey: cat.key,
      category: cat.label,
      title: p.name,
      tagline: p.short_description || p.description || '',
      description: p.short_description || p.description || '',
      startingPrice: `Mulai ${this.formatCurrency(p.starting_premium)} / bln`,
      monthlyPremiumStarting: p.starting_premium,
      coverageAmount: `Hingga ${this.formatCurrency(p.max_sum_assured)}`,
      coverageTerm: `${p.min_payment_term} - ${p.max_payment_term} Tahun`,
      badge: p.is_featured ? 'Unggulan' : undefined,
      badgeVariant: 'blue',
      features:
        p.benefits && p.benefits.length > 0
          ? p.benefits
          : ['Perlindungan terpercaya', 'Klaim terintegrasi'],
      isPopular: p.is_featured,
      isFeatured: p.is_featured,
      baseRate,
      minAge,
      maxAge,
      minSumAssured: p.min_sum_assured,
      maxSumAssured: p.max_sum_assured,
      minTermYears: p.min_payment_term,
      maxTermYears: p.max_payment_term,
      benefitsDetailed: (p.benefits || []).map((b) => ({ title: b, description: b })),
      waitingPeriodDays: 0,
      claimMethod: 'cashless',
      underwritingNote: p.target_customer || '',
      riders: [],
      ageFactors: (p.pricing_rules?.age_factors || []).map((af) => ({
        minAge: af.min_age,
        maxAge: af.max_age,
        factor: af.factor,
      })),
      sumAssuredPresets: p.pricing_rules?.sum_assured_presets,
      termPresets: p.pricing_rules?.payment_term_presets,
      genderFactors: p.pricing_rules?.gender_factors,
      smokerFactors: p.pricing_rules?.smoker_factors,
      occupationFactors: p.pricing_rules?.occupation_factors,
      healthFactors: p.pricing_rules?.health_factors,
      frequencyLoading: p.pricing_rules?.frequency_loading,
      exclusions: p.exclusions || [],
    };
  }

  async getProducts(
    categoryKey?: ProductCategoryKey | 'all',
    search?: string
  ): Promise<InsuranceProduct[]> {
    if (!this.baseUrl) {
      throw new Error(
        'Core API URL is not configured. Please set CORE_API_URL, or enable MOCK_CORE_API=true.'
      );
    }

    const params = new URLSearchParams();
    if (categoryKey && categoryKey !== 'all') {
      params.set('category', categoryKey);
    }
    if (search && search.trim()) {
      params.set('search', search.trim());
    }

    const qs = params.toString();
    const url = `${this.baseUrl}/api/v1/products${qs ? `?${qs}` : ''}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Core API error fetching products: HTTP ${res.status}`);
    }

    const json = await res.json().catch(() => null);
    const rawProducts: CoreApiProduct[] =
      json && typeof json === 'object' && Array.isArray(json.data) ? json.data : [];
    return rawProducts.map((p) => this.mapCoreApiProductToInsuranceProduct(p));
  }

  async getFeaturedProducts(): Promise<InsuranceProduct[]> {
    if (!this.baseUrl) {
      throw new Error(
        'Core API URL is not configured. Please set CORE_API_URL, or enable MOCK_CORE_API=true.'
      );
    }

    const url = `${this.baseUrl}/api/v1/products?featured=true`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(
        `Core API error fetching featured products: HTTP ${res.status}`
      );
    }

    const json = await res.json().catch(() => null);
    const rawProducts: CoreApiProduct[] =
      json && typeof json === 'object' && Array.isArray(json.data) ? json.data : [];
    return rawProducts.map((p) => this.mapCoreApiProductToInsuranceProduct(p));
  }

  async getProductBySlug(slug: string): Promise<InsuranceProduct | null> {
    if (!this.baseUrl) {
      throw new Error(
        'Core API URL is not configured. Please set CORE_API_URL, or enable MOCK_CORE_API=true.'
      );
    }

    const trimmedSlug = slug?.trim();
    if (!trimmedSlug) {
      return null;
    }

    const url = `${this.baseUrl}/api/v1/products/${encodeURIComponent(trimmedSlug)}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      throw new Error(
        `Core API error fetching product ${trimmedSlug}: HTTP ${res.status}`
      );
    }

    const json = await res.json().catch(() => null);
    if (!json || typeof json !== 'object' || !json.data) {
      return null;
    }

    return this.mapCoreApiProductToInsuranceProduct(json.data);
  }

  async getProductById(id: string): Promise<InsuranceProduct | null> {
    return this.getProductBySlug(id);
  }

  async calculateQuote(
    slug: string,
    request: QuoteCalculationRequest
  ): Promise<QuoteCalculationResult> {
    if (!this.baseUrl) {
      throw new Error(
        'Core API URL is not configured. Please set CORE_API_URL, or enable MOCK_CORE_API=true.'
      );
    }

    const trimmedSlug = slug?.trim();
    if (!trimmedSlug) {
      throw new Error('Product slug is required for quote calculation');
    }

    const url = `${this.baseUrl}/api/v1/products/${encodeURIComponent(trimmedSlug)}/quotes`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(request),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => '');
      throw new Error(
        `Core API error calculating quote for product ${trimmedSlug}: HTTP ${res.status}${
          errorBody ? ` - ${errorBody}` : ''
        }`
      );
    }

    const json = await res.json().catch(() => null);
    if (!json || typeof json !== 'object' || !json.data) {
      throw new Error('Invalid response structure from Core API quote calculation');
    }

    return json.data as QuoteCalculationResult;
  }

  async getPricingRules(slug: string): Promise<ProductPricingRuleDTO[]> {
    if (!this.baseUrl) {
      throw new Error(
        'Core API URL is not configured. Please set CORE_API_URL, or enable MOCK_CORE_API=true.'
      );
    }

    const trimmedSlug = slug?.trim();
    if (!trimmedSlug) {
      return [];
    }

    const url = `${this.baseUrl}/api/v1/products/${encodeURIComponent(trimmedSlug)}/pricing-rules`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (res.status === 404) {
      return [];
    }

    if (!res.ok) {
      throw new Error(
        `Core API error fetching pricing rules for product ${trimmedSlug}: HTTP ${res.status}`
      );
    }

    const json = await res.json().catch(() => null);
    if (!json || typeof json !== 'object' || !Array.isArray(json.data)) {
      return [];
    }

    return json.data as ProductPricingRuleDTO[];
  }

  async getQuestionnaire(slug: string): Promise<ProductQuestionnaireDTO | null> {
    if (!this.baseUrl) {
      throw new Error(
        'Core API URL is not configured. Please set CORE_API_URL, or enable MOCK_CORE_API=true.'
      );
    }

    const trimmedSlug = slug?.trim();
    if (!trimmedSlug) {
      return null;
    }

    const url = `${this.baseUrl}/api/v1/products/${encodeURIComponent(trimmedSlug)}/questionnaire`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      throw new Error(
        `Core API error fetching questionnaire for product ${trimmedSlug}: HTTP ${res.status}`
      );
    }

    const json = await res.json().catch(() => null);
    if (!json || typeof json !== 'object' || !json.data) {
      return null;
    }

    return json.data as ProductQuestionnaireDTO;
  }
}

