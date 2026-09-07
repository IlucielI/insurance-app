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

export class SimulationService implements ISimulationService {
  constructor(private readonly productRepo?: IProductRepository) {}

  public calculate(input: SimulationInput, product: InsuranceProduct): SimulationResult {
    const {
      sumAssured,
      termYears,
      applicantAge,
      frequency,
      selectedRiderIds = [],
    } = input;

    const answers = input.answers || {};

    let isSmoker = Boolean(input.isSmoker);
    if (answers['is_smoker'] !== undefined) {
      isSmoker = answers['is_smoker'] === 'yes';
    } else if (answers['smoker'] !== undefined) {
      isSmoker = answers['smoker'] === 'yes';
    }

    let gender = input.gender;
    if (answers['gender'] === 'male' || answers['gender'] === 'female') {
      gender = answers['gender'];
    }

    let occupationRisk = input.occupationRisk;
    if (
      answers['occupation_class'] === 'low' ||
      answers['occupation_class'] === 'standard' ||
      answers['occupation_class'] === 'high'
    ) {
      occupationRisk = answers['occupation_class'];
    }

    // 1. Age Factor based on Indonesian Mortality Table or product configuration
    const minAge = product.minAge || 18;
    const maxAge = product.maxAge || 60;
    const normalizedAge = Math.max(minAge, Math.min(maxAge, applicantAge));
    const ageFactor = Number((1 + Math.max(0, (normalizedAge - 20) * 0.025)).toFixed(3));

    // 2. Smoker Risk Multiplier dynamically from product pricing rules
    const smokerFactor = isSmoker
      ? product.smokerFactors?.yes ?? 1.35
      : product.smokerFactors?.no ?? 1.0;

    // 3. Gender Multiplier dynamically from product pricing rules
    const genderFactor =
      gender === 'male'
        ? product.genderFactors?.male ?? 1.05
        : product.genderFactors?.female ?? 1.0;

    // 4. Occupation Risk Multiplier dynamically from product pricing rules
    const occupationFactor =
      occupationRisk === 'low'
        ? product.occupationFactors?.low ?? 0.95
        : occupationRisk === 'high'
        ? product.occupationFactors?.high ?? 1.4
        : product.occupationFactors?.standard ?? 1.0;


    // Dynamic Extra Multipliers if provided
    let dynamicExtraMultiplier = 1.0;
    const dynamicFactorsList: { ruleCode: string; ruleName: string; factor: number }[] = [];
    if (input.dynamicMultipliers) {
      for (const [code, mult] of Object.entries(input.dynamicMultipliers)) {
        dynamicExtraMultiplier *= mult;
        dynamicFactorsList.push({
          ruleCode: code,
          ruleName: code,
          factor: mult,
        });
      }
    }

    // 5. Base Annual Premium calculation
    const rawAnnualBase =
      sumAssured *
      product.baseRate *
      ageFactor *
      smokerFactor *
      genderFactor *
      occupationFactor *
      dynamicExtraMultiplier;
    const baseAnnualPremium = Math.round(rawAnnualBase / 10_000) * 10_000;

    // 6. Riders Calculation
    const selectedRiders: RiderCostItem[] = [];
    let ridersAnnualTotal = 0;

    if (product.riders && product.riders.length > 0) {
      const selectedSet = new Set(selectedRiderIds);
      for (const rider of product.riders) {
        if (selectedSet.has(rider.id)) {
          // Parse price from string e.g. "+Rp 45.000/bln" -> 45000 (with defensive null/undefined guard)
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

    // 7. Total Annual Premium
    const annualPremium = baseAnnualPremium + ridersAnnualTotal;

    // 8. Monthly Premium (with 10% operational margin compared to annual prepay)
    const monthlyPremium = Math.round(((annualPremium / 12) * 1.1) / 1_000) * 1_000;

    // 9. Annual Savings
    const annualSavings = Math.max(0, monthlyPremium * 12 - annualPremium);

    // 10. Active Premium based on chosen frequency
    const activePremium = frequency === 'monthly' ? monthlyPremium : annualPremium;

    // 11. Underwriting Tier Assessment
    let underwritingTier: 'guaranteed_issue' | 'simplified' | 'full_underwriting' = 'simplified';
    let underwritingDescription =
      'Simplified Issue (Kuesioner Kesehatan Digital & Verifikasi Tele-Underwriting OJK)';

    if (sumAssured <= 500_000_000 && normalizedAge <= 45 && !isSmoker) {
      underwritingTier = 'guaranteed_issue';
      underwritingDescription =
        'Instant Approval (Persetujuan Otomatis tanpa Pemeriksaan Medis atau Dokumen Finansial)';
    } else if (sumAssured > 1_500_000_000 || normalizedAge > 55 || (isSmoker && sumAssured > 1_000_000_000)) {
      underwritingTier = 'full_underwriting';
      underwritingDescription =
        'Full Underwriting (Pemeriksaan Medis Rekanan & Verifikasi Bukti Penghasilan Finansial)';
    }

    const monthlyLoading = product.frequencyLoading?.monthly ?? 1.06;
    const annualLoading = product.frequencyLoading?.annual ?? 1.0;
    const annualDiscountPercent = Number(
      (((monthlyLoading - annualLoading) / monthlyLoading) * 100).toFixed(1)
    );

    let ojkTableReference = 'Standar Aktuaria OJK & POJK No. 23/POJK.05/2015';
    if (product.categoryKey === 'life' || product.categoryKey === 'critical_illness') {
      ojkTableReference = 'Tabel Mortalita Indonesia IV (TMI-IV) & SE OJK No. 19/SEOJK.05/2020';
    } else if (product.categoryKey === 'health') {
      ojkTableReference = 'Standar Aktuaria Asuransi Kesehatan OJK & POJK No. 23/POJK.05/2015';
    } else if (product.categoryKey === 'vehicle') {
      ojkTableReference = 'Tarif Premi Asuransi Kendaraan Bermotor OJK (SEOJK No. 06/D.05/2017)';
    }

    const breakdown: ActuarialBreakdown = {
      baseRate: product.baseRate,
      ageFactor,
      smokerFactor,
      genderFactor,
      occupationFactor,
      annualDiscountPercent,
      baseAnnualPremium,
      ridersAnnualTotal,
      ridersBreakdown: selectedRiders,
      adminFee: 0, // 100% Free digital processing
      underwritingTier,
      underwritingDescription,
      dynamicFactors: dynamicFactorsList.length > 0 ? dynamicFactorsList : undefined,
    };

    return {
      product,
      sumAssured,
      termYears,
      applicantAge: normalizedAge,
      isSmoker,
      frequency,
      gender: gender || 'female',
      occupationRisk: occupationRisk || 'standard',
      monthlyPremium,

      annualPremium,
      annualSavings,
      activePremium,
      selectedRiders,
      breakdown,
      ojkTableReference,
      answers: input.answers,
    };
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

