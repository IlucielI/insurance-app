import { describe, it, expect } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

describe('POST /api/applications route handler', () => {
  it('returns 400 when body is empty or invalid', async () => {
    const req = new NextRequest('http://localhost:3001/api/applications', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('tidak lengkap');
  });

  it('submits valid application and returns 201', async () => {
    const validBody = {
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
    };

    const req = new NextRequest('http://localhost:3001/api/applications', {
      method: 'POST',
      body: JSON.stringify(validBody),
    });

    const response = await POST(req);
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.data).toBeDefined();
    expect(json.data.applicationId).toBeDefined();
  });
});
