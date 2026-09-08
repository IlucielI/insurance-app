import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CoreApiApplicationRepository } from './application.core-api.repository';
import { PolicyApplication } from '@/types/application.types';

describe('CoreApiApplicationRepository', () => {
  const originalFetch = global.fetch;
  const mockBaseUrl = 'https://core-api.example.com';

  const sampleApplication: PolicyApplication = {
    id: 'APP-2026-1234',
    productId: 'prod_life_001',
    productName: 'Secure Life Plus',
    sumAssured: 500_000_000,
    termYears: 10,
    monthlyPremium: 250_000,
    annualPremium: 2_800_000,
    frequency: 'annually',
    selectedRiderIds: [],
    identity: {
      nik: '3174051208940003',
      fullName: 'Bayu Pratama Kusuma',
      birthDate: '1994-08-12',
      gender: 'male',
      phoneNumber: '081234567890',
      email: 'bayu@example.com',
    },
    financial: {
      occupation: 'Software Engineer',
      monthlyIncome: 25_000_000,
      monthlyExpenses: 10_000_000,
      existingDebtsMonthly: 2_000_000,
      calculatedDsr: 9.3,
    },
    medical: {
      weightKg: 68,
      heightCm: 175,
      bmi: 22.2,
      hasCriticalIllnessHistory: false,
      hasHospitalizationLast2Years: false,
      isSmoker: false,
      hasFamilyHistory: false,
    },
    beneficiary: {
      fullName: 'Ratna Dewi',
      relationship: 'spouse',
      nik: '3174055609950002',
      sharePercentage: 100,
    },
    pillarChecks: [],
    overallStatus: 'approved',
    underwritingTier: 'guaranteed_issue',
    slaRemainingMinutes: 0,
    createdAt: '2026-09-07T12:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('creates an application via Core API endpoint successfully', async () => {
    const mockApiResponse = {
      data: {
        id: 'APP-CORE-9999',
        product_id: 'prod_life_001',
        full_name: 'Bayu Pratama Kusuma',
        email: 'bayu@example.com',
        phone: '081234567890',
        age: 32,
        gender: 'male',
        sum_assured: 500_000_000,
        payment_term: 10,
        payment_frequency: 'annually',
        premium: 2_800_000,
        status: 'approved',
        created_at: '2026-09-07T12:00:00Z',
        review_checks: [
          { id: 'rc-1', application_id: 'APP-CORE-9999', check_type: 'identity_verified', status: 'passed' },
          { id: 'rc-2', application_id: 'APP-CORE-9999', check_type: 'income_verified', status: 'passed' },
          { id: 'rc-3', application_id: 'APP-CORE-9999', check_type: 'medical_required', status: 'passed' },
          { id: 'rc-4', application_id: 'APP-CORE-9999', check_type: 'documents_complete', status: 'passed' },
        ],
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    const repo = new CoreApiApplicationRepository(mockBaseUrl);
    const result = await repo.create(sampleApplication);

    expect(result.id).toBe('APP-CORE-9999');
    expect(result.overallStatus).toBe('approved');
    expect(result.pillarChecks).toHaveLength(4);
    expect(global.fetch).toHaveBeenCalledWith(
      `${mockBaseUrl}/api/v1/applications`,
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('throws error if Core API create call encounters network failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network connection error'));

    const repo = new CoreApiApplicationRepository(mockBaseUrl);
    await expect(repo.create(sampleApplication)).rejects.toThrow(/Network connection error/i);
  });

  it('finds application by ID via GET endpoint', async () => {
    const mockApiResponse = {
      data: {
        id: 'APP-2026-1234',
        product_id: 'prod_life_001',
        full_name: 'Bayu Pratama Kusuma',
        email: 'bayu@example.com',
        phone: '081234567890',
        age: 32,
        gender: 'male',
        sum_assured: 500_000_000,
        payment_term: 10,
        payment_frequency: 'annually',
        premium: 2_800_000,
        status: 'approved',
        created_at: '2026-09-07T12:00:00Z',
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    const repo = new CoreApiApplicationRepository(mockBaseUrl);
    const result = await repo.findById('APP-2026-1234');

    expect(result).not.toBeNull();
    expect(result?.id).toBe('APP-2026-1234');
    expect(result?.identity.fullName).toBe('Bayu Pratama Kusuma');
  });

  it('returns null when findById returns 404 or fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    const repo = new CoreApiApplicationRepository(mockBaseUrl);
    const result = await repo.findById('APP-UNKNOWN');

    expect(result).toBeNull();
  });

  it('finds applications by NIK search query', async () => {
    const mockApiResponse = {
      data: [
        {
          id: 'APP-2026-1234',
          product_id: 'prod_life_001',
          full_name: 'Bayu Pratama Kusuma',
          email: 'bayu@example.com',
          phone: '081234567890',
          age: 32,
          gender: 'male',
          sum_assured: 500_000_000,
          payment_term: 10,
          payment_frequency: 'annually',
          premium: 2_800_000,
          status: 'approved',
          created_at: '2026-09-07T12:00:00Z',
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    const repo = new CoreApiApplicationRepository(mockBaseUrl);
    const results = await repo.findByNik('3174051208940003');

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('APP-2026-1234');
  });

  it('adds RFI document to an existing application', async () => {
    const mockApiResponse = {
      data: {
        id: 'APP-2026-1234',
        product_id: 'prod_life_001',
        full_name: 'Bayu Pratama Kusuma',
        email: 'bayu@example.com',
        phone: '081234567890',
        age: 32,
        gender: 'male',
        sum_assured: 500_000_000,
        payment_term: 10,
        payment_frequency: 'annually',
        premium: 2_800_000,
        status: 'under_review',
        created_at: '2026-09-07T12:00:00Z',
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    const repo = new CoreApiApplicationRepository(mockBaseUrl);
    const updated = await repo.addRfiDocument('APP-2026-1234', {
      pillarNumber: 3,
      documentType: 'Medical Resume',
      documentName: 'resume_medis.pdf',
    });

    expect(updated).not.toBeNull();
    expect(updated?.rfiDocuments).toHaveLength(1);
    expect(updated?.rfiDocuments?.[0].documentName).toBe('resume_medis.pdf');
  });

  it('throws structured error message when Core API returns 400', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: 'NIK tidak valid atau sudah terdaftar' }),
    } as Response);

    const repo = new CoreApiApplicationRepository(mockBaseUrl);
    await expect(repo.create(sampleApplication)).rejects.toThrow(
      /Core API application creation failed \(400\): NIK tidak valid atau sudah terdaftar/i
    );
  });

  it('handles Core API HTTP error with null JSON body and throws structured error without TypeError', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => null,
    } as Response);

    const repo = new CoreApiApplicationRepository(mockBaseUrl);
    await expect(repo.create(sampleApplication)).rejects.toThrow(
      /Core API application creation failed \(500\): Internal Server Error/i
    );
  });
});
