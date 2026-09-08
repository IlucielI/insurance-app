import {
  InsuranceProduct,
  IProductRepository,
  QuoteCalculationRequest,
} from '@/server/repositories/product.repository.interface';
import {
  ISimulationService,
} from './simulation.service.interface';
import {
  SimulationInput,
  SimulationResult,
  RiderCostItem,
  ActuarialBreakdown,
} from '@/types/simulation.types';

import { calculatePureSimulation } from '@/lib/simulation-calc';

export class SimulationService implements ISimulationService {
  constructor(private readonly productRepo?: IProductRepository) {}

  public calculate(input: SimulationInput, product: InsuranceProduct): SimulationResult {
    return calculatePureSimulation(input, product);
  }

  public async calculateAsync(
    input: SimulationInput,
    product: InsuranceProduct
  ): Promise<SimulationResult> {
    if (this.productRepo) {
      const slug = product.slug || product.id;
      const minAge = product.minAge || 18;
      const maxAge = product.maxAge || 60;
      const normalizedAge = Math.max(minAge, Math.min(maxAge, input.applicantAge));

      const answers = input.answers || {};
      let isSmoker = Boolean(input.isSmoker);
      if (answers['is_smoker'] !== undefined) {
        isSmoker = answers['is_smoker'] === 'yes';
      } else if (answers['smoker'] !== undefined) {
        isSmoker = answers['smoker'] === 'yes';
      }

      let gender = input.gender || 'male';
      if (answers['gender'] === 'male' || answers['gender'] === 'female') {
        gender = answers['gender'];
      }

      let occupationRisk = input.occupationRisk || 'standard';
      if (
        answers['occupation_class'] === 'low' ||
        answers['occupation_class'] === 'standard' ||
        answers['occupation_class'] === 'high'
      ) {
        occupationRisk = answers['occupation_class'];
      }

      const answersList = input.answers
        ? Object.entries(input.answers).map(([code, val]) => ({
            rule_code: code,
            value: String(val),
          }))
        : undefined;

      const quoteReq: QuoteCalculationRequest = {
        age: normalizedAge,
        gender,
        sum_assured: input.sumAssured,
        payment_term: input.termYears,
        payment_frequency: input.frequency === 'annually' ? 'annual' : 'monthly',
        smoker: isSmoker ? 'yes' : 'no',
        occupation_class: occupationRisk,
        health_risk: 'low',
        answers: answersList,
      };

      const quoteResult = await this.productRepo.calculateQuote(slug, quoteReq);

      const selectedRiders: RiderCostItem[] = [];
      let ridersAnnualTotal = 0;
      if (product.riders && product.riders.length > 0) {
        const selectedSet = new Set(input.selectedRiderIds || []);
        for (const rider of product.riders) {
          if (selectedSet.has(rider.id)) {
            const numericMatch = (rider.extraPrice || '').replace(/[^0-9]/g, '');
            const monthlyCost = numericMatch ? parseInt(numericMatch, 10) : 50_000;
            const annualCost = monthlyCost * 12;

            ridersAnnualTotal += annualCost;
            selectedRiders.push({
              id: rider.id,
              name: rider.name,
              extraPriceLabel: rider.extraPrice || '',
              annualCost,
              monthlyCost,
            });
          }
        }
      }

      const ridersMonthlyTotal = selectedRiders.reduce(
        (acc, r) => acc + r.monthlyCost,
        0
      );

      const baseAnnualPremium = quoteResult.estimated_annual_premium;
      const annualPremium = baseAnnualPremium + ridersAnnualTotal;

      let monthlyPremium: number;
      if (input.frequency === 'monthly') {
        monthlyPremium = quoteResult.estimated_premium + ridersMonthlyTotal;
      } else {
        monthlyPremium = Math.round(((annualPremium / 12) * 1.1) / 1000) * 1000;
      }

      const activePremium =
        input.frequency === 'monthly' ? monthlyPremium : annualPremium;

      const annualSavings = Math.max(0, monthlyPremium * 12 - annualPremium);

      let underwritingTier:
        | 'guaranteed_issue'
        | 'simplified'
        | 'full_underwriting' = 'simplified';
      let underwritingDescription =
        'Simplified Issue (Kuesioner Kesehatan Digital & Verifikasi Tele-Underwriting OJK)';

      if (
        input.sumAssured <= 500_000_000 &&
        normalizedAge <= 45 &&
        !isSmoker
      ) {
        underwritingTier = 'guaranteed_issue';
        underwritingDescription =
          'Instant Approval (Persetujuan Otomatis tanpa Pemeriksaan Medis atau Dokumen Finansial)';
      } else if (
        input.sumAssured > 1_500_000_000 ||
        normalizedAge > 55 ||
        (isSmoker && input.sumAssured > 1_000_000_000)
      ) {
        underwritingTier = 'full_underwriting';
        underwritingDescription =
          'Full Underwriting (Pemeriksaan Medis Rekanan & Verifikasi Bukti Penghasilan Finansial)';
      }

      const monthlyLoading =
        product.frequencyLoading?.monthly ?? quoteResult.breakdown.frequency_loading ?? 1.06;
      const annualLoading = product.frequencyLoading?.annual ?? 1.0;
      const annualDiscountPercent = Number(
        (((monthlyLoading - annualLoading) / monthlyLoading) * 100).toFixed(1)
      );

      const dynamicFactors = quoteResult.breakdown.factors?.map((f) => ({
        ruleCode: f.rule_code,
        ruleName: f.rule_name,
        factor: f.factor,
      }));

      const breakdown: ActuarialBreakdown = {
        baseRate: quoteResult.breakdown.base_rate,
        ageFactor: quoteResult.breakdown.age_factor,
        smokerFactor: quoteResult.breakdown.smoker_factor,
        genderFactor: quoteResult.breakdown.gender_factor,
        occupationFactor: quoteResult.breakdown.occupation_factor,
        termFactor: quoteResult.breakdown.term_factor ?? 1.0,
        annualDiscountPercent,
        baseAnnualPremium,
        ridersAnnualTotal,
        ridersBreakdown: selectedRiders,
        adminFee: 0,
        underwritingTier,
        underwritingDescription,
        dynamicFactors,
      };

      return {
        product,
        sumAssured: input.sumAssured,
        termYears: input.termYears,
        applicantAge: normalizedAge,
        isSmoker,
        frequency: input.frequency,
        gender,
        occupationRisk,
        monthlyPremium,
        annualPremium,
        annualSavings,
        activePremium,
        selectedRiders,
        breakdown,
        ojkTableReference: `Core API Actuarial Engine (Ref: ${quoteResult.product_slug})`,
        answers: input.answers,
      };
    }

    return this.calculate(input, product);
  }
}

