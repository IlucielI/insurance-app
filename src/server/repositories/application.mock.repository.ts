import { PolicyApplication, RfiDocument } from '@/types/application.types';
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
      timelineEvents: [
        {
          title: 'Polis Aktif & E-Certificate Terbit',
          timestamp: '2026-09-01T10:05:00.000Z',
          description: 'Polis telah resmi aktif dengan penjaminan OJK dan sertifikat digital diterbitkan.',
          status: 'completed',
        },
        {
          title: 'Underwriting Instant Approval Disetujui',
          timestamp: '2026-09-01T10:02:00.000Z',
          description: 'Seluruh 4 pilar underwriting lulus secara otomatis.',
          status: 'completed',
        },
        {
          title: 'Aplikasi Diterima Sistem',
          timestamp: '2026-09-01T10:00:00.000Z',
          description: 'Pengajuan aplikasi polis baru dengan pembayaran VA BCA.',
          status: 'completed',
        },
      ],
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
      timelineEvents: [
        {
          title: 'Pemeriksaan Manual oleh Underwriter',
          timestamp: '2026-09-05T15:00:00.000Z',
          description: 'Underwriter sedang meninjau dokumen riwayat medis rawat inap dan stabilitas pendapatan.',
          status: 'in_progress',
        },
        {
          title: 'Verifikasi Otomatis 4-Pilar',
          timestamp: '2026-09-05T14:32:00.000Z',
          description: 'Pilar 2 dan 3 ditandai untuk review underwriting manual.',
          status: 'completed',
        },
        {
          title: 'Aplikasi Diterima Sistem',
          timestamp: '2026-09-05T14:30:00.000Z',
          description: 'Pengajuan aplikasi Critical Illness Shield.',
          status: 'completed',
        },
      ],
    },
    {
      id: 'APP-2026-3109',
      productId: 'prod-hisa-income',
      productName: 'Hospital Cash Plan',
      sumAssured: 250_000_000,
      termYears: 5,
      monthlyPremium: 125_000,
      annualPremium: 1_350_000,
      frequency: 'monthly',
      selectedRiderIds: [],
      identity: {
        nik: '3302198765430009',
        fullName: 'Hendra Wijaya',
        birthDate: '1990-11-05',
        gender: 'male',
        phoneNumber: '081345678901',
        email: 'hendra.w@example.com',
      },
      financial: {
        occupation: 'Konsultan Independen',
        monthlyIncome: 15_000_000,
        monthlyExpenses: 5_000_000,
        existingDebtsMonthly: 1_000_000,
        calculatedDsr: 7.5,
      },
      medical: {
        weightKg: 85,
        heightCm: 170,
        bmi: 29.4,
        hasCriticalIllnessHistory: false,
        hasHospitalizationLast2Years: false,
        isSmoker: true,
        hasFamilyHistory: true,
      },
      beneficiary: {
        fullName: 'Maya Wijaya',
        relationship: 'spouse',
        nik: '3302198765430010',
        sharePercentage: 100,
      },
      payment: {
        method: 'va_bri',
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
          statusText: '✓ DSR 7.5% (Sehat Finansial)',
        },
        {
          pillarNumber: 3,
          pillarType: 'medical_required',
          title: 'Skrining Medis & Gaya Hidup',
          description: 'Indeks Massa Tubuh (BMI 29.4) & perokok aktif membutuhkan resume medis dokter.',
          status: 'FLAGGED',
          statusText: '⚠️ Diperlukan Dokumen Medis Tambahan (RFI)',
        },
        {
          pillarNumber: 4,
          pillarType: 'documents_complete',
          title: 'Legalitas & Beneficiary',
          description: 'Penunjukan ahli waris 100% sah dan e-Sign disetujui.',
          status: 'PASSED',
          statusText: '✓ Dokumen Sah',
        },
      ],
      overallStatus: 'rfi_requested',
      underwritingTier: 'full_underwriting',
      slaRemainingMinutes: 120,
      createdAt: '2026-09-06T09:15:00.000Z',
      timelineEvents: [
        {
          title: 'Permintaan Dokumen Tambahan (RFI)',
          timestamp: '2026-09-06T09:30:00.000Z',
          description: 'Harap unggah Surat Keterangan Dokter atau Resume Medis terkait BMI & riwayat kesehatan.',
          status: 'action_required',
        },
        {
          title: 'Verifikasi Otomatis 4-Pilar',
          timestamp: '2026-09-06T09:16:00.000Z',
          description: 'Pilar 3 memerlukan verifikasi dokumen medis lanjutan.',
          status: 'completed',
        },
        {
          title: 'Aplikasi Diterima Sistem',
          timestamp: '2026-09-06T09:15:00.000Z',
          description: 'Pengajuan aplikasi Hospital Cash Plan.',
          status: 'completed',
        },
      ],
    },
  ];

  public async create(application: PolicyApplication): Promise<PolicyApplication> {
    const clone = structuredClone(application);
    this.applications.unshift(clone);
    return structuredClone(clone);
  }

  public async findById(id: string): Promise<PolicyApplication | null> {
    const matched = this.applications.find((app) => app.id.toLowerCase() === id.trim().toLowerCase());
    if (!matched) return null;
    return structuredClone(matched);
  }

  public async findByNik(nik: string): Promise<PolicyApplication[]> {
    const cleanNik = nik.trim();
    const matched = this.applications.filter((app) => app.identity.nik === cleanNik);
    return structuredClone(matched);
  }

  public async findAll(): Promise<PolicyApplication[]> {
    return structuredClone(this.applications);
  }

  public async addRfiDocument(
    applicationId: string,
    doc: Omit<RfiDocument, 'id' | 'uploadedAt' | 'status'>
  ): Promise<PolicyApplication | null> {
    const appIndex = this.applications.findIndex(
      (app) => app.id.toLowerCase() === applicationId.trim().toLowerCase()
    );
    if (appIndex === -1) return null;

    const application = this.applications[appIndex];
    const newDoc: RfiDocument = {
      id: `DOC-RFI-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      pillarNumber: doc.pillarNumber,
      documentType: doc.documentType,
      documentName: doc.documentName,
      uploadedAt: new Date().toISOString(),
      status: 'uploaded',
    };

    if (!application.rfiDocuments) {
      application.rfiDocuments = [];
    }
    application.rfiDocuments.push(newDoc);

    const pillar = application.pillarChecks.find((p) => p.pillarNumber === doc.pillarNumber);
    if (pillar && pillar.status === 'FLAGGED') {
      pillar.status = 'PENDING';
      pillar.statusText = `⏳ Dokumen susulan (${doc.documentType}) diterima & dalam verifikasi`;
    }

    if (application.overallStatus === 'rfi_requested') {
      application.overallStatus = 'under_review';
    }

    if (!application.timelineEvents) {
      application.timelineEvents = [];
    }
    application.timelineEvents.unshift({
      title: `Dokumen RFI Diunggah: ${doc.documentType}`,
      timestamp: new Date().toISOString(),
      description: `Dokumen ${doc.documentName} berhasil diunggah untuk verifikasi Pilar ${doc.pillarNumber}.`,
      status: 'completed',
    });

    return structuredClone(application);
  }
}

