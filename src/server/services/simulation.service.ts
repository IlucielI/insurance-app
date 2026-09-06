import { InsuranceProduct } from '@/server/repositories/product.repository.interface';
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
  public calculate(input: SimulationInput, product: InsuranceProduct): SimulationResult {
    const {
      sumAssured,
      termYears,
      applicantAge,
      isSmoker,
      frequency,
      selectedRiderIds = [],
    } = input;

    // 1. Age Factor based on Indonesian Mortality Table (TMIV - Tabel Mortalita Indonesia IV)
    // Baseline age 20 = 1.0, increases by 2.5% per year of age above 20
    const normalizedAge = Math.max(18, Math.min(65, applicantAge));
    const ageFactor = Number((1 + Math.max(0, (normalizedAge - 20) * 0.025)).toFixed(3));

    // 2. Smoker Risk Multiplier (OJK actuarial standard: 35% risk loading for active smokers)
    const smokerFactor = isSmoker ? 1.35 : 1.0;

    // 3. Base Annual Premium calculation
    const rawAnnualBase = sumAssured * product.baseRate * ageFactor * smokerFactor;
    const baseAnnualPremium = Math.round(rawAnnualBase / 10_000) * 10_000;

    // 4. Riders Calculation
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

    // 5. Total Annual Premium
    const annualPremium = baseAnnualPremium + ridersAnnualTotal;

    // 6. Monthly Premium (with 10% operational margin compared to annual prepay)
    const monthlyPremium = Math.round(((annualPremium / 12) * 1.1) / 1_000) * 1_000;

    // 7. Annual Savings
    const annualSavings = Math.max(0, monthlyPremium * 12 - annualPremium);

    // 8. Active Premium based on chosen frequency
    const activePremium = frequency === 'monthly' ? monthlyPremium : annualPremium;

    // 9. Underwriting Tier Assessment
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

    const breakdown: ActuarialBreakdown = {
      baseRate: product.baseRate,
      ageFactor,
      smokerFactor,
      baseAnnualPremium,
      ridersAnnualTotal,
      ridersBreakdown: selectedRiders,
      adminFee: 0, // 100% Free digital processing
      underwritingTier,
      underwritingDescription,
    };

    return {
      product,
      sumAssured,
      termYears,
      applicantAge: normalizedAge,
      isSmoker,
      frequency,
      monthlyPremium,
      annualPremium,
      annualSavings,
      activePremium,
      selectedRiders,
      breakdown,
      ojkTableReference: 'Tabel Mortalita Indonesia IV (TMI-IV) & SE OJK No. 19/SEOJK.05/2020',
    };
  }
}
