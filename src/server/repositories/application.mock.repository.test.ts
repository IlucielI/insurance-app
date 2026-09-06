import { describe, it, expect, beforeEach } from 'vitest';
import { ApplicationMockRepository } from './application.mock.repository';
import { PolicyApplication } from '@/types/application.types';

describe('ApplicationMockRepository', () => {
  let repository: ApplicationMockRepository;

  beforeEach(() => {
    repository = new ApplicationMockRepository();
  });

  it('retrieves all initial seeded applications', async () => {
    const apps = await repository.findAll();
    expect(apps.length).toBeGreaterThanOrEqual(2);
    expect(apps[0].id).toBeDefined();
    expect(apps[0].identity.fullName).toBeDefined();
  });

  it('finds an application by valid ID', async () => {
    const app = await repository.findById('APP-2026-8821');
    expect(app).not.toBeNull();
    expect(app?.identity.fullName).toBe('Budi Santoso');
    expect(app?.pillarChecks.length).toBe(4);
  });

  it('returns null when application ID is not found', async () => {
    const app = await repository.findById('APP-NONEXISTENT');
    expect(app).toBeNull();
  });

  it('creates and prepends a new application with immutability', async () => {
    const newApp: PolicyApplication = {
      id: 'APP-2026-9999',
      productId: 'prod-term-life',
      productName: 'Term Life Guard Plus',
      sumAssured: 300_000_000,
      termYears: 10,
      monthlyPremium: 100_000,
      annualPremium: 1_100_000,
      frequency: 'monthly',
      selectedRiderIds: [],
      identity: {
        nik: '3201123456789999',
        fullName: 'Test User',
        birthDate: '1998-01-01',
        gender: 'male',
        phoneNumber: '081299999999',
        email: 'test@example.com',
      },
      financial: {
        occupation: 'Analyst',
        monthlyIncome: 10_000_000,
        monthlyExpenses: 4_000_000,
        existingDebtsMonthly: 1_000_000,
        calculatedDsr: 11.0,
      },
      medical: {
        weightKg: 65,
        heightCm: 170,
        bmi: 22.5,
        hasCriticalIllnessHistory: false,
        hasHospitalizationLast2Years: false,
        isSmoker: false,
        hasFamilyHistory: false,
      },
      beneficiary: {
        fullName: 'Family Member',
        relationship: 'parent',
        nik: '3201123456788888',
        sharePercentage: 100,
      },
      payment: {
        method: 'va_bca',
        autoDebet: false,
      },
      pillarChecks: [],
      overallStatus: 'submitted',
      underwritingTier: 'guaranteed_issue',
      slaRemainingMinutes: 15,
      createdAt: new Date().toISOString(),
    };

    const created = await repository.create(newApp);
    expect(created.id).toBe('APP-2026-9999');

    const fetched = await repository.findById('APP-2026-9999');
    expect(fetched).not.toBeNull();
    expect(fetched?.identity.fullName).toBe('Test User');

    // Mutating created copy does not mutate repository state (structuredClone)
    created.identity.fullName = 'Mutated Name';
    const refetched = await repository.findById('APP-2026-9999');
    expect(refetched?.identity.fullName).toBe('Test User');
  });
});
