import { describe, it, expect, vi } from 'vitest';
import { SimulationService } from './simulation.service';
import { InsuranceProduct } from '@/server/repositories/product.repository.interface';

describe('SimulationService', () => {
  const service = new SimulationService();

  const sampleProduct: InsuranceProduct = {
    id: 'prod-term-life',
    slug: 'prod-term-life',
    title: 'Term Life Guard Plus',
    tagline: 'Proteksi Jiwa Murni',
    category: 'Asuransi Jiwa',
    categoryKey: 'life',
    badge: 'Paling Populer',
    isPopular: true,
    description: 'Perlindungan finansial keluarga optimal.',
    startingPrice: 'Rp 150.000 / bln',
    monthlyPremiumStarting: 'Rp 150.000',
    coverageAmount: 'Hingga Rp 2.500.000.000',
    coverageTerm: '10 Tahun',
    baseRate: 0.0035,
    minAge: 18,
    maxAge: 60,
    minSumAssured: 100_000_000,
    maxSumAssured: 2_500_000_000,
    minTermYears: 5,
    maxTermYears: 20,
    features: ['Uang Pertanggungan hingga Rp 2.5 Miliar', 'Klaim digital 24 jam'],
    benefitsDetailed: [{ title: 'Santunan Jiwa', description: '100% UP cair' }],
    waitingPeriodDays: 0,
    claimMethod: 'instant_transfer',
    underwritingNote: 'Tanpa medical check-up',
    riders: [
      { id: 'rider-ci', name: 'Critical Illness Rider', extraPrice: '+Rp 45.000/bln' },
      { id: 'rider-waiver', name: 'Waiver of Premium', extraPrice: '+Rp 25.000/bln' },
    ],
  };

  it('calculates baseline premium correctly for non-smoker at age 20', () => {
    const result = service.calculate(
      {
        productId: sampleProduct.id,
        sumAssured: 500_000_000,
        termYears: 10,
        applicantAge: 20,
        isSmoker: false,
        frequency: 'monthly',
        selectedRiderIds: [],
      },
      sampleProduct
    );

    expect(result.product.id).toBe('prod-term-life');
    expect(result.breakdown.ageFactor).toBe(1.0);
    expect(result.breakdown.smokerFactor).toBe(1.0);
    expect(result.breakdown.baseAnnualPremium).toBe(500_000_000 * 0.0035);
    expect(result.annualPremium).toBe(1_750_000);
    expect(result.monthlyPremium).toBeGreaterThan(0);
    expect(result.activePremium).toBe(result.monthlyPremium);
    expect(result.breakdown.underwritingTier).toBe('guaranteed_issue');
  });

  it('applies age factor and smoker multiplier correctly', () => {
    const nonSmokerResult = service.calculate(
      {
        productId: sampleProduct.id,
        sumAssured: 1_000_000_000,
        termYears: 10,
        applicantAge: 40,
        isSmoker: false,
        frequency: 'annually',
        selectedRiderIds: [],
      },
      sampleProduct
    );

    const smokerResult = service.calculate(
      {
        productId: sampleProduct.id,
        sumAssured: 1_000_000_000,
        termYears: 10,
        applicantAge: 40,
        isSmoker: true,
        frequency: 'annually',
        selectedRiderIds: [],
      },
      sampleProduct
    );

    expect(nonSmokerResult.breakdown.ageFactor).toBe(1.5);
    expect(smokerResult.breakdown.smokerFactor).toBe(1.35);
    expect(smokerResult.annualPremium).toBeGreaterThan(nonSmokerResult.annualPremium);
    expect(smokerResult.activePremium).toBe(smokerResult.annualPremium);
  });

  it('includes selected riders in total premium calculation', () => {
    const withoutRiders = service.calculate(
      {
        productId: sampleProduct.id,
        sumAssured: 500_000_000,
        termYears: 10,
        applicantAge: 30,
        isSmoker: false,
        frequency: 'monthly',
        selectedRiderIds: [],
      },
      sampleProduct
    );

    const withRiders = service.calculate(
      {
        productId: sampleProduct.id,
        sumAssured: 500_000_000,
        termYears: 10,
        applicantAge: 30,
        isSmoker: false,
        frequency: 'monthly',
        selectedRiderIds: ['rider-ci', 'rider-waiver'],
      },
      sampleProduct
    );

    expect(withRiders.selectedRiders.length).toBe(2);
    // rider-ci: 45.000 * 12 = 540.000
    // rider-waiver: 25.000 * 12 = 300.000
    // Total riders = 840.000
    expect(withRiders.breakdown.ridersAnnualTotal).toBe(840_000);
    expect(withRiders.annualPremium).toBe(withoutRiders.annualPremium + 840_000);
    expect(withRiders.monthlyPremium).toBeGreaterThan(withoutRiders.monthlyPremium);
  });

  it('determines full underwriting tier for high sum assured or older applicants', () => {
    const highSumResult = service.calculate(
      {
        productId: sampleProduct.id,
        sumAssured: 2_000_000_000,
        termYears: 10,
        applicantAge: 40,
        isSmoker: false,
        frequency: 'annually',
        selectedRiderIds: [],
      },
      sampleProduct
    );

    expect(highSumResult.breakdown.underwritingTier).toBe('full_underwriting');
    expect(highSumResult.breakdown.underwritingDescription).toContain('Full Underwriting');

    const olderApplicant = service.calculate(
      {
        productId: sampleProduct.id,
        sumAssured: 400_000_000,
        termYears: 5,
        applicantAge: 60,
        isSmoker: false,
        frequency: 'monthly',
        selectedRiderIds: [],
      },
      sampleProduct
    );

    expect(olderApplicant.breakdown.underwritingTier).toBe('full_underwriting');
  });

  it('calculates annual savings correctly for annual frequency', () => {
    const result = service.calculate(
      {
        productId: sampleProduct.id,
        sumAssured: 500_000_000,
        termYears: 10,
        applicantAge: 25,
        isSmoker: false,
        frequency: 'annually',
        selectedRiderIds: [],
      },
      sampleProduct
    );

    expect(result.annualSavings).toBe(result.monthlyPremium * 12 - result.annualPremium);
    expect(result.annualSavings).toBeGreaterThan(0);
  });

  it('handles product without riders gracefully', () => {
    const productNoRiders: InsuranceProduct = {
      ...sampleProduct,
      riders: undefined,
    };

    const result = service.calculate(
      {
        productId: sampleProduct.id,
        sumAssured: 500_000_000,
        termYears: 10,
        applicantAge: 25,
        isSmoker: false,
        frequency: 'monthly',
        selectedRiderIds: ['rider-ci'],
      },
      productNoRiders
    );

    expect(result.selectedRiders).toEqual([]);
    expect(result.breakdown.ridersAnnualTotal).toBe(0);
  });

  it('clamps age between 18 and 65', () => {
    const underAge = service.calculate(
      {
        productId: sampleProduct.id,
        sumAssured: 500_000_000,
        termYears: 10,
        applicantAge: 16,
        isSmoker: false,
        frequency: 'monthly',
        selectedRiderIds: [],
      },
      sampleProduct
    );
    expect(underAge.applicantAge).toBe(sampleProduct.minAge || 18);

    const overAge = service.calculate(
      {
        productId: sampleProduct.id,
        sumAssured: 500_000_000,
        termYears: 10,
        applicantAge: 75,
        isSmoker: false,
        frequency: 'monthly',
        selectedRiderIds: [],
      },
      sampleProduct
    );
    expect(overAge.applicantAge).toBe(sampleProduct.maxAge || 60);
  });

  it('handles rider with undefined or malformed extraPrice defensively', () => {
    const productMalformedRider: InsuranceProduct = {
      ...sampleProduct,
      riders: [
        {
          id: 'rider-missing-price',
          name: 'Custom Rider',
          extraPrice: undefined as unknown as string,
          description: 'Custom',
        },
      ],
    };

    const result = service.calculate(
      {
        productId: sampleProduct.id,
        sumAssured: 500_000_000,
        termYears: 10,
        applicantAge: 30,
        isSmoker: false,
        frequency: 'monthly',
        selectedRiderIds: ['rider-missing-price'],
      },
      productMalformedRider
    );

    expect(result.selectedRiders.length).toBe(1);
    expect(result.selectedRiders[0].monthlyCost).toBe(50_000);
    expect(result.selectedRiders[0].extraPriceLabel).toBe('');
  });

  describe('calculateAsync', () => {
    it('calls productRepo.calculateQuote when repository is injected', async () => {
      const mockQuoteResult = {
        product_id: 'prod-term-life',
        product_name: 'Term Life Guard Plus',
        product_slug: 'prod-term-life',
        currency: 'IDR',
        age: 32,
        gender: 'male',
        sum_assured: 500_000_000,
        payment_term: 10,
        payment_frequency: 'monthly',
        estimated_premium: 140_000,
        estimated_annual_premium: 1_500_000,
        breakdown: {
          base_rate: 0.0035,
          age_factor: 1.1,
          gender_factor: 1.05,
          smoker_factor: 1.0,
          occupation_factor: 0.95,
          health_factor: 1.0,
          term_factor: 1.05,
          frequency_loading: 1.1,
        },
        notes: ['OJK Note 1'],
      };

      const mockRepo = {
        getFeaturedProducts: vi.fn(),
        getProducts: vi.fn(),
        getProductBySlug: vi.fn(),
        getProductById: vi.fn(),
        calculateQuote: vi.fn().mockResolvedValue(mockQuoteResult),
        getPricingRules: vi.fn(),
        getQuestionnaire: vi.fn(),
      };


      const asyncService = new SimulationService(mockRepo);
      const res = await asyncService.calculateAsync(
        {
          productId: sampleProduct.id,
          sumAssured: 500_000_000,
          termYears: 10,
          applicantAge: 32,
          isSmoker: false,
          frequency: 'monthly',
          gender: 'male',
          occupationRisk: 'low',
          selectedRiderIds: ['rider-ci'],
        },
        sampleProduct
      );

      expect(mockRepo.calculateQuote).toHaveBeenCalledWith(
        'prod-term-life',
        expect.objectContaining({
          age: 32,
          gender: 'male',
          sum_assured: 500_000_000,
          payment_term: 10,
          payment_frequency: 'monthly',
          smoker: 'no',
          occupation_class: 'low',
        })
      );

      expect(res.breakdown.baseRate).toBe(0.0035);
      expect(res.breakdown.ageFactor).toBe(1.1);
      expect(res.breakdown.occupationFactor).toBe(0.95);
      expect(res.selectedRiders).toHaveLength(1);
      expect(res.activePremium).toBe(140_000 + 45_000); // base monthly from Core API + rider monthly
      expect(res.ojkTableReference).toContain('Core API Actuarial Engine');
    });

    it('falls back to sync calculate when productRepo is not provided', async () => {
      const plainService = new SimulationService();
      const res = await plainService.calculateAsync(
        {
          productId: sampleProduct.id,
          sumAssured: 500_000_000,
          termYears: 10,
          applicantAge: 32,
          isSmoker: false,
          frequency: 'monthly',
          selectedRiderIds: [],
        },
        sampleProduct
      );

      expect(res.product.id).toBe('prod-term-life');
      expect(res.activePremium).toBeGreaterThan(0);
    });

    it('passes dynamic answers and maps dynamic factors in calculateAsync', async () => {
      const mockRepo = {
        getFeaturedProducts: vi.fn(),
        getProducts: vi.fn(),
        getProductBySlug: vi.fn(),
        getProductById: vi.fn(),
        getPricingRules: vi.fn(),
        getQuestionnaire: vi.fn(),
        calculateQuote: vi.fn().mockResolvedValue({
          product_id: 'prod-term-life',
          product_name: 'Term Life Guard Plus',
          product_slug: 'prod-term-life',
          currency: 'IDR',
          age: 32,
          gender: 'female',
          sum_assured: 500_000_000,
          payment_term: 10,
          payment_frequency: 'monthly',
          estimated_premium: 155_000,
          estimated_annual_premium: 1_700_000,
          breakdown: {
            base_rate: 0.0035,
            age_factor: 1.1,
            gender_factor: 1.0,
            smoker_factor: 1.25,
            occupation_factor: 1.0,
            health_factor: 1.0,
            term_factor: 1.0,
            frequency_loading: 1.06,
            factors: [
              { rule_code: 'smoker', rule_name: 'Faktor Status Merokok', factor: 1.25 },
              { rule_code: 'hospitalization', rule_name: 'Riwayat Rawat Inap', factor: 1.3 },
            ],
          },
          notes: ['Test quote'],
        }),
      };

      const svc = new SimulationService(mockRepo);
      const res = await svc.calculateAsync(
        {
          productId: sampleProduct.id,
          sumAssured: 500_000_000,
          termYears: 10,
          applicantAge: 32,
          frequency: 'monthly',
          selectedRiderIds: [],
          answers: {
            gender: 'female',
            is_smoker: 'yes',
            hospitalization: 'yes',
          },
        },
        sampleProduct
      );

      expect(mockRepo.calculateQuote).toHaveBeenCalledWith(
        'prod-term-life',
        expect.objectContaining({
          gender: 'female',
          smoker: 'yes',
          answers: expect.arrayContaining([
            { rule_code: 'gender', value: 'female' },
            { rule_code: 'is_smoker', value: 'yes' },
            { rule_code: 'hospitalization', value: 'yes' },
          ]),
        })
      );

      expect(res.breakdown.dynamicFactors).toHaveLength(2);
      expect(res.breakdown.dynamicFactors?.[0].ruleCode).toBe('smoker');
      expect(res.breakdown.dynamicFactors?.[1].ruleCode).toBe('hospitalization');
    });

    it('calculates with dynamic multipliers in synchronous calculate', () => {
      const plainService = new SimulationService();
      const res = plainService.calculate(
        {
          productId: sampleProduct.id,
          sumAssured: 500_000_000,
          termYears: 10,
          applicantAge: 20,
          frequency: 'annually',
          selectedRiderIds: [],
          dynamicMultipliers: {
            extra_hazard: 1.2,
          },
        },
        sampleProduct
      );

      expect(res.breakdown.dynamicFactors).toHaveLength(1);
      expect(res.breakdown.dynamicFactors?.[0].ruleCode).toBe('extra_hazard');
      expect(res.breakdown.dynamicFactors?.[0].factor).toBe(1.2);
      // Base: 500M * 0.0035 * 1.0 * 1.0 * 1.0 * 1.0 * 1.2 = 2.1M
      expect(res.breakdown.baseAnnualPremium).toBe(2_100_000);
    });
  });
});

