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
});
