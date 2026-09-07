import { describe, it, expect } from 'vitest';
import { submitApplicationAction } from './actions';
import { CreateApplicationDTO } from '@/types/application.types';

describe('submitApplicationAction Server Action', () => {
  it('submits application payload and returns submission result', async () => {
    const mockPayload: CreateApplicationDTO = {
      productId: 'prod-life-001',
      productName: 'Asuransi Jiwa Proteksi Sejahtera',
      sumAssured: 500_000_000,
      termYears: 10,
      frequency: 'annually',
      monthlyPremium: 450_000,
      annualPremium: 5_000_000,
      selectedRiderIds: [],
      identity: {
        nik: '3174051208940003',
        fullName: 'Budi Santoso',
        birthDate: '1992-05-12',
        gender: 'male',
        phoneNumber: '+628123456789',
        email: 'budi.santoso@example.com',
      },
      financial: {
        occupation: 'Software Engineer',
        monthlyIncome: 25_000_000,
        monthlyExpenses: 10_000_000,
        existingDebtsMonthly: 2_500_000,
      },
      medical: {
        heightCm: 175,
        weightKg: 70,
        isSmoker: false,
        hasCriticalIllnessHistory: false,
        hasHospitalizationLast2Years: false,
        hasFamilyHistory: false,
      },
      beneficiary: {
        fullName: 'Siti Rahma',
        relationship: 'spouse',
        nik: '3174055208950004',
        sharePercentage: 100,
      },
      answers: [
        { code: 'nik', value: '3174051208940003' },
        { code: 'full_name', value: 'Budi Santoso' },
      ],
    };

    const result = await submitApplicationAction(mockPayload);

    expect(result).toBeDefined();
    expect(result.applicationId).toBeDefined();
    expect(result.application.identity.fullName).toBe('Budi Santoso');
    expect(result.isInstantApproval).toBe(true);
    expect(result.application.pillarChecks).toHaveLength(4);
  });

  it('handles multiple answer items batched in a single payload without per-item overhead', async () => {
    const batchedAnswers = Array.from({ length: 25 }, (_, i) => ({
      code: `question_${i + 1}`,
      value: `answer_${i + 1}`,
    }));

    const mockPayload: CreateApplicationDTO = {
      productId: 'prod-life-001',
      productName: 'Asuransi Jiwa Proteksi Sejahtera',
      sumAssured: 300_000_000,
      termYears: 5,
      frequency: 'monthly',
      monthlyPremium: 200_000,
      annualPremium: 2_400_000,
      selectedRiderIds: [],
      identity: {
        nik: '3174051208940003',
        fullName: 'Ratna Dewi',
        birthDate: '1995-08-20',
        gender: 'female',
        phoneNumber: '+628198765432',
        email: 'ratna.dewi@example.com',
      },
      financial: {
        occupation: 'Analyst',
        monthlyIncome: 18_000_000,
        monthlyExpenses: 6_000_000,
        existingDebtsMonthly: 1_500_000,
      },
      medical: {
        heightCm: 165,
        weightKg: 55,
        isSmoker: false,
        hasCriticalIllnessHistory: false,
        hasHospitalizationLast2Years: false,
        hasFamilyHistory: false,
      },
      beneficiary: {
        fullName: 'Budi Santoso',
        relationship: 'spouse',
        nik: '3174055208950004',
        sharePercentage: 100,
      },
      answers: batchedAnswers,
    };

    const result = await submitApplicationAction(mockPayload);
    expect(result.application.answers).toHaveLength(25);
    expect(result.applicationId).toBeDefined();
  });

  it('handles empty answers array safely', async () => {
    const mockPayload: CreateApplicationDTO = {
      productId: 'prod-life-001',
      productName: 'Asuransi Jiwa Proteksi Sejahtera',
      sumAssured: 300_000_000,
      termYears: 5,
      frequency: 'monthly',
      monthlyPremium: 200_000,
      annualPremium: 2_400_000,
      selectedRiderIds: [],
      identity: {
        nik: '3174051208940003',
        fullName: 'Ratna Dewi',
        birthDate: '1995-08-20',
        gender: 'female',
        phoneNumber: '+628198765432',
        email: 'ratna.dewi@example.com',
      },
      financial: {
        occupation: 'Analyst',
        monthlyIncome: 18_000_000,
        monthlyExpenses: 6_000_000,
        existingDebtsMonthly: 1_500_000,
      },
      medical: {
        heightCm: 165,
        weightKg: 55,
        isSmoker: false,
        hasCriticalIllnessHistory: false,
        hasHospitalizationLast2Years: false,
        hasFamilyHistory: false,
      },
      beneficiary: {
        fullName: 'Budi Santoso',
        relationship: 'spouse',
        nik: '3174055208950004',
        sharePercentage: 100,
      },
      answers: [],
    };

    const result = await submitApplicationAction(mockPayload);
    expect(result.applicationId).toBeDefined();
    expect(result.application.answers).toEqual([]);
  });
});
