import { describe, it, expect } from 'vitest';
import { SimulationService } from './simulation.service';
import { InsuranceProduct } from '@/server/repositories/product.repository.interface';

describe('SimulationService', () => {
  const service = new SimulationService();

  const sampleProduct: InsuranceProduct = {
    id: 'prod-term-life',
    title: 'Term Life Guard Plus',
    tagline: 'Proteksi Jiwa Murni',
    category: 'Asuransi Jiwa',
    categoryKey: 'life',
    badge: 'Paling Populer',
    isPopular: true,
    description: 'Perlindungan finansial keluarga optimal.',
    monthlyPremiumStarting: 'Rp 150.000',
    baseRate: 0.0035,
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
    expect(underAge.applicantAge).toBe(18);

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
    expect(overAge.applicantAge).toBe(65);
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
});
