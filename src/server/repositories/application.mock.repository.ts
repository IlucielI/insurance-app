import { PolicyApplication } from '@/types/application.types';
import { IApplicationRepository } from './application.repository.interface';

export class ApplicationMockRepository implements IApplicationRepository {
  private applications: PolicyApplication[] = [
    {
      id: 'APP-2026-8821',
      productId: 'prod-term-life',
      productName: 'Term Life Guard Plus',
      sumAssured: 500_000_000,
      termYears: 10,
      monthlyPremium: 161_000,
      annualPremium: 1_750_000,
      frequency: 'monthly',
      selectedRiderIds: ['rider-ci'],
      identity: {
        nik: '3201123456780001',
        fullName: 'Budi Santoso',
        birthDate: '1995-04-12',
        gender: 'male',
        phoneNumber: '081234567890',
        email: 'budi.santoso@example.com',
        ktpImageName: 'ktp-budi.jpg',
      },
      financial: {
        occupation: 'Software Engineer',
        monthlyIncome: 18_000_000,
        monthlyExpenses: 6_000_000,
        existingDebtsMonthly: 2_000_000,
        calculatedDsr: 12.0,
      },
      medical: {
        weightKg: 70,
        heightCm: 175,
        bmi: 22.9,
        hasCriticalIllnessHistory: false,
        hasHospitalizationLast2Years: false,
        isSmoker: false,
        hasFamilyHistory: false,
      },
      beneficiary: {
        fullName: 'Siti Rahayu',
        relationship: 'spouse',
        nik: '3201123456780002',
        sharePercentage: 100,
      },
      payment: {
        method: 'va_bca',
        autoDebet: true,
      },
      pillarChecks: [
        {
          pillarNumber: 1,
          pillarType: 'identity_verified',
          title: 'Identitas Dukcapil',
          description: 'Validasi NIK e-KTP & data biometrik kependudukan.',
          status: 'PASSED',
          statusText: '✓ NIK Terverifikasi Dukcapil',
        },
        {
          pillarNumber: 2,
          pillarType: 'income_verified',
          title: 'Finansial & Rasio DSR',
          description: 'Rasio kemampuan bayar premi (DSR) di bawah batas aman.',
          status: 'PASSED',
          statusText: '✓ DSR 12.0% (Sehat Finansial)',
        },
        {
          pillarNumber: 3,
          pillarType: 'medical_required',
          title: 'Skrining Medis & Gaya Hidup',
          description: 'Bebas penyakit kritis dan indeks massa tubuh normal.',
          status: 'PASSED',
          statusText: '✓ BMI 22.9 & Bebas Penyakit Kritis',
        },
        {
          pillarNumber: 4,
          pillarType: 'documents_complete',
          title: 'Legalitas & Beneficiary',
          description: 'Penunjukan ahli waris 100% sah dan e-Sign OJK disetujui.',
          status: 'PASSED',
          statusText: '✓ Dokumen Lengkap & Disetujui',
        },
      ],
      overallStatus: 'approved',
      underwritingTier: 'guaranteed_issue',
      slaRemainingMinutes: 0,
      createdAt: '2026-09-01T10:00:00.000Z',
    },
    {
      id: 'APP-2026-7492',
      productId: 'prod-critical-illness',
      productName: 'Critical Illness Shield',
      sumAssured: 1_000_000_000,
      termYears: 15,
      monthlyPremium: 480_000,
      annualPremium: 5_200_000,
      frequency: 'annually',
      selectedRiderIds: [],
      identity: {
        nik: '3171098765430005',
        fullName: 'Ratna Dewi',
        birthDate: '1988-08-20',
        gender: 'female',
        phoneNumber: '081987654321',
        email: 'ratna.dewi@example.com',
      },
      financial: {
        occupation: 'Wiraswasta / Pemilik Usaha',
        monthlyIncome: 25_000_000,
        monthlyExpenses: 12_000_000,
        existingDebtsMonthly: 8_000_000,
        calculatedDsr: 33.7,
      },
      medical: {
        weightKg: 62,
        heightCm: 160,
        bmi: 24.2,
        hasCriticalIllnessHistory: false,
        hasHospitalizationLast2Years: true,
        isSmoker: false,
        hasFamilyHistory: true,
      },
      beneficiary: {
        fullName: 'Ahmad Fauzi',
        relationship: 'child',
        nik: '3171098765430006',
        sharePercentage: 100,
      },
      payment: {
        method: 'va_mandiri',
        autoDebet: true,
      },
      pillarChecks: [
        {
          pillarNumber: 1,
          pillarType: 'identity_verified',
          title: 'Identitas Dukcapil',
          description: 'Validasi NIK e-KTP & data biometrik kependudukan.',
          status: 'PASSED',
          statusText: '✓ NIK Terverifikasi Dukcapil',
        },
        {
          pillarNumber: 2,
          pillarType: 'income_verified',
          title: 'Finansial & Rasio DSR',
          description: 'Rasio kemampuan bayar premi (DSR) mendekati batas aman.',
          status: 'FLAGGED',
          statusText: '⚠️ DSR 33.7% (Perlu Review Tambahan)',
        },
        {
          pillarNumber: 3,
          pillarType: 'medical_required',
          title: 'Skrining Medis & Gaya Hidup',
          description: 'Terdapat riwayat rawat inap dalam 2 tahun terakhir.',
          status: 'FLAGGED',
          statusText: '⚠️ Riwayat Rawat Inap (Review Medis)',
        },
        {
          pillarNumber: 4,
          pillarType: 'documents_complete',
          title: 'Legalitas & Beneficiary',
          description: 'Penunjukan ahli waris 100% sah dan klausul disetujui.',
          status: 'PASSED',
          statusText: '✓ Ahli Waris Sah',
        },
      ],
      overallStatus: 'under_review',
      underwritingTier: 'simplified',
      slaRemainingMinutes: 45,
      createdAt: '2026-09-05T14:30:00.000Z',
    },
  ];

  public async create(application: PolicyApplication): Promise<PolicyApplication> {
    const clone = structuredClone(application);
    this.applications.unshift(clone);
    return structuredClone(clone);
  }

  public async findById(id: string): Promise<PolicyApplication | null> {
    const matched = this.applications.find((app) => app.id === id);
    if (!matched) return null;
    return structuredClone(matched);
  }

  public async findAll(): Promise<PolicyApplication[]> {
    return structuredClone(this.applications);
  }
}
