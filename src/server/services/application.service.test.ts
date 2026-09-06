import { describe, it, expect, beforeEach } from 'vitest';
import { ApplicationService } from './application.service';
import { ApplicationMockRepository } from '../repositories/application.mock.repository';
import { CreateApplicationDTO } from '@/types/application.types';

describe('ApplicationService', () => {
  let repository: ApplicationMockRepository;
  let service: ApplicationService;

  const validDTO: CreateApplicationDTO = {
    productId: 'prod-term-life',
    productName: 'Term Life Guard Plus',
    sumAssured: 500_000_000,
    termYears: 10,
    monthlyPremium: 160_000,
    annualPremium: 1_750_000,
    frequency: 'monthly',
    selectedRiderIds: ['rider-ci'],
    identity: {
      nik: '3201123456780001',
      fullName: 'Ahmad Dahlan',
      birthDate: '1996-05-15',
      gender: 'male',
      phoneNumber: '081234567890',
      email: 'ahmad@example.com',
      ktpImageName: 'ktp-ahmad.png',
    },
    financial: {
      occupation: 'Akuntan Publik',
      monthlyIncome: 15_000_000,
      monthlyExpenses: 5_000_000,
      existingDebtsMonthly: 1_000_000,
    },
    medical: {
      weightKg: 68,
      heightCm: 172,
      hasCriticalIllnessHistory: false,
      hasHospitalizationLast2Years: false,
      isSmoker: false,
      hasFamilyHistory: false,
    },
    beneficiary: {
      fullName: 'Nur Aini',
      relationship: 'spouse',
      nik: '3201123456780002',
      sharePercentage: 100,
    },
    payment: {
      method: 'va_bca',
      autoDebet: true,
    },
  };

  beforeEach(() => {
    repository = new ApplicationMockRepository();
    service = new ApplicationService(repository);
  });

  it('evaluates all 4 pillars as PASSED for an ideal applicant', () => {
    const checks = service.evaluatePillars(validDTO);

    expect(checks.length).toBe(4);
    expect(checks[0].status).toBe('PASSED'); // Dukcapil
    expect(checks[1].status).toBe('PASSED'); // DSR
    expect(checks[2].status).toBe('PASSED'); // Medis
    expect(checks[3].status).toBe('PASSED'); // Beneficiary
  });

  it('flags Pilar 1 if NIK is invalid or incomplete', () => {
    const invalidNikDTO: CreateApplicationDTO = {
      ...validDTO,
      identity: {
        ...validDTO.identity,
        nik: '123', // Invalid length
      },
    };

    const checks = service.evaluatePillars(invalidNikDTO);
    expect(checks[0].status).toBe('FLAGGED');
    expect(checks[0].statusText).toContain('Belum Lengkap');
  });

  it('flags Pilar 2 if DSR ratio exceeds safe thresholds', () => {
    const highDsrDTO: CreateApplicationDTO = {
      ...validDTO,
      financial: {
        ...validDTO.financial,
        monthlyIncome: 5_000_000,
        existingDebtsMonthly: 2_500_000, // 2.5jt debt + 160rb prem / 5jt = 53.2%
      },
    };

    const checks = service.evaluatePillars(highDsrDTO);
    expect(checks[1].status).toBe('FLAGGED');
    expect(checks[1].statusText).toContain('Melebihi Rasio Aman');
  });

  it('flags Pilar 3 if medical history has critical illness or high BMI', () => {
    const criticalMedDTO: CreateApplicationDTO = {
      ...validDTO,
      medical: {
        ...validDTO.medical,
        hasCriticalIllnessHistory: true,
      },
    };

    const checks = service.evaluatePillars(criticalMedDTO);
    expect(checks[2].status).toBe('FLAGGED');
    expect(checks[2].statusText).toContain('Review Dokter');
  });

  it('flags Pilar 4 if beneficiary data is incomplete', () => {
    const incompleteBeneficiaryDTO: CreateApplicationDTO = {
      ...validDTO,
      beneficiary: {
        ...validDTO.beneficiary,
        fullName: '',
        sharePercentage: 50,
      },
    };

    const checks = service.evaluatePillars(incompleteBeneficiaryDTO);
    expect(checks[3].status).toBe('FLAGGED');
  });

  it('submits application successfully with Instant Approval for all-passed profile', async () => {
    const result = await service.submitApplication(validDTO);

    expect(result.applicationId).toMatch(/^APP-2026-\d{4}$/);
    expect(result.isInstantApproval).toBe(true);
    expect(result.application.overallStatus).toBe('approved');
    expect(result.application.underwritingTier).toBe('guaranteed_issue');
    expect(result.application.slaRemainingMinutes).toBe(0);

    const saved = await service.getApplicationById(result.applicationId);
    expect(saved).not.toBeNull();
    expect(saved?.identity.fullName).toBe('Ahmad Dahlan');
  });

  it('submits application with Under Review status if any pillar is FLAGGED', async () => {
    const flaggedDTO: CreateApplicationDTO = {
      ...validDTO,
      medical: {
        ...validDTO.medical,
        hasHospitalizationLast2Years: true,
      },
    };

    const result = await service.submitApplication(flaggedDTO);

    expect(result.isInstantApproval).toBe(false);
    expect(result.application.overallStatus).toBe('under_review');
    expect(result.application.underwritingTier).toBe('simplified');
    expect(result.application.slaRemainingMinutes).toBe(60);
  });
});
