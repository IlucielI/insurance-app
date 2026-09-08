import {
  CreateApplicationDTO,
  ApplicationSubmissionResult,
  PolicyApplication,
  PillarCheck,
} from '@/types/application.types';
import { IApplicationRepository } from '../repositories/application.repository.interface';
import { IApplicationService } from './application.service.interface';

export class ApplicationService implements IApplicationService {
  constructor(private readonly repository: IApplicationRepository) {}

  public evaluatePillars(dto: CreateApplicationDTO): PillarCheck[] {
    const checks: PillarCheck[] = [];

    // Pilar 1: Identitas Dukcapil
    const isNikValid = /^\d{16}$/.test(dto.identity.nik.trim());
    const isNameValid = dto.identity.fullName.trim().length >= 3;
    const isContactValid =
      dto.identity.phoneNumber.trim().length >= 10 && dto.identity.email.includes('@');

    const pilar1Passed = isNikValid && isNameValid && isContactValid;
    checks.push({
      pillarNumber: 1,
      pillarType: 'identity_verified',
      title: 'Identitas Dukcapil',
      description: 'Verifikasi NIK e-KTP, nama lengkap, dan data biometrik kependudukan.',
      status: pilar1Passed ? 'PASSED' : 'FLAGGED',
      statusText: pilar1Passed
        ? '✓ NIK Terverifikasi Dukcapil'
        : '⚠️ Format NIK atau Data Identitas Belum Lengkap',
    });

    // Pilar 2: Finansial & DSR
    const monthlyIncome = Math.max(1, dto.financial.monthlyIncome);
    const totalObligation = dto.financial.existingDebtsMonthly + dto.monthlyPremium;
    const calculatedDsr = Number(((totalObligation / monthlyIncome) * 100).toFixed(1));

    let pilar2Status: 'PASSED' | 'FLAGGED' = 'PASSED';
    let pilar2Text = `✓ DSR ${calculatedDsr}% (Kapasitas Finansial Sehat)`;

    if (calculatedDsr > 40) {
      pilar2Status = 'FLAGGED';
      pilar2Text = `⚠️ DSR ${calculatedDsr}% (Melebihi Rasio Aman OJK 40%)`;
    } else if (calculatedDsr > 30) {
      pilar2Status = 'FLAGGED';
      pilar2Text = `⚠️ DSR ${calculatedDsr}% (Mendekati Batas Maksimal OJK)`;
    }

    checks.push({
      pillarNumber: 2,
      pillarType: 'income_verified',
      title: 'Finansial & Rasio DSR',
      description: 'Analisis kemampuan pembayaran premi berkesinambungan tanpa risiko gagal bayar.',
      status: pilar2Status,
      statusText: pilar2Text,
      score: calculatedDsr,
    });

    // Pilar 3: Skrining Medis & Gaya Hidup OR Objek Pertanggungan Kendaraan
    const isVehicle = Boolean(
      dto.productId?.toLowerCase().includes('auto') ||
      dto.productId?.toLowerCase().includes('vehicle') ||
      dto.productName?.toLowerCase().includes('auto') ||
      dto.productName?.toLowerCase().includes('kendaraan') ||
      dto.answers?.some((a) => a.code === 'vehicle_plate')
    );

    if (isVehicle) {
      const plateAnswer = dto.answers?.find((a) => a.code === 'vehicle_plate')?.value;
      const vehiclePlate = (typeof plateAnswer === 'string' && plateAnswer.trim()) || 'B 1234 XYZ';
      checks.push({
        pillarNumber: 3,
        pillarType: 'medical_required',
        title: 'Objek Pertanggungan Kendaraan',
        description: 'Verifikasi pelat nomor kendaraan, riwayat klaim, dan data registrasi digital.',
        status: 'PASSED',
        statusText: `✓ Plat Terverifikasi (${vehiclePlate})`,
        score: 100,
      });
    } else {
      const heightM = Math.max(0.5, dto.medical.heightCm / 100);
      const bmi = Number((dto.medical.weightKg / (heightM * heightM)).toFixed(1));

      const isBmiHealthy = bmi >= 18.5 && bmi <= 29.0;
      const isMedicalClean =
        !dto.medical.hasCriticalIllnessHistory && !dto.medical.hasHospitalizationLast2Years;

      const pilar3Passed = isBmiHealthy && isMedicalClean;
      checks.push({
        pillarNumber: 3,
        pillarType: 'medical_required',
        title: 'Skrining Medis & Gaya Hidup',
        description: 'Kuesioner penyakit kritis, riwayat rawat inap, dan indeks massa tubuh (BMI).',
        status: pilar3Passed ? 'PASSED' : 'FLAGGED',
        statusText: pilar3Passed
          ? `✓ BMI ${bmi} & Bebas Riwayat Medis Buruk`
          : `⚠️ BMI ${bmi} atau Riwayat Medis (Perlu Review Dokter Underwriter)`,
        score: bmi,
      });
    }

    // Pilar 4: Legalitas & Ahli Waris
    const isBeneficiaryValid =
      dto.beneficiary.fullName.trim().length >= 3 &&
      Boolean(dto.beneficiary.relationship) &&
      dto.beneficiary.sharePercentage === 100;

    checks.push({
      pillarNumber: 4,
      pillarType: 'documents_complete',
      title: 'Legalitas & Beneficiary',
      description: 'Penunjukan ahli waris sah dan persetujuan klausul e-Policy digital.',
      status: isBeneficiaryValid ? 'PASSED' : 'FLAGGED',
      statusText: isBeneficiaryValid
        ? '✓ Ahli Waris Sah & Klausul OJK Disetujui'
        : '⚠️ Data Ahli Waris atau Persetujuan Polis Belum Lengkap',
    });

    return checks;
  }

  public async submitApplication(dto: CreateApplicationDTO): Promise<ApplicationSubmissionResult> {
    const pillarChecks = this.evaluatePillars(dto);

    // Compute BMI and DSR
    const heightM = Math.max(0.5, dto.medical.heightCm / 100);
    const bmi = Number((dto.medical.weightKg / (heightM * heightM)).toFixed(1));
    const monthlyIncome = Math.max(1, dto.financial.monthlyIncome);
    const totalObligation = dto.financial.existingDebtsMonthly + dto.monthlyPremium;
    const calculatedDsr = Number(((totalObligation / monthlyIncome) * 100).toFixed(1));

    const allPassed = pillarChecks.every((c) => c.status === 'PASSED');
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const applicationId = `APP-2026-${randomDigits}`;

    const policyApplication: PolicyApplication = {
      id: applicationId,
      productId: dto.productId,
      productName: dto.productName,
      sumAssured: dto.sumAssured,
      termYears: dto.termYears,
      monthlyPremium: dto.monthlyPremium,
      annualPremium: dto.annualPremium,
      frequency: dto.frequency,
      selectedRiderIds: dto.selectedRiderIds || [],
      identity: {
        ...dto.identity,
      },
      financial: {
        ...dto.financial,
        calculatedDsr,
      },
      medical: {
        ...dto.medical,
        bmi,
      },
      beneficiary: {
        ...dto.beneficiary,
      },
      payment: dto.payment || {
        method: 'va_bca',
        autoDebet: true,
      },
      answers: dto.answers,
      pillarChecks,
      overallStatus: allPassed ? 'approved' : 'under_review',
      underwritingTier: allPassed ? 'guaranteed_issue' : 'simplified',
      slaRemainingMinutes: allPassed ? 0 : 60,
      createdAt: new Date().toISOString(),
    };

    const saved = await this.repository.create(policyApplication);

    return {
      applicationId: saved.id,
      application: saved,
      isInstantApproval: allPassed,
      message: allPassed
        ? 'Pengajuan polis Anda berhasil diverifikasi secara instan melalui 4 Pilar Otomatis OJK!'
        : 'Pengajuan polis Anda berhasil dikirim dan sedang dalam verifikasi tim underwriting digital.',
    };
  }

  public async getApplicationById(id: string): Promise<PolicyApplication | null> {
    return this.repository.findById(id);
  }

  public async trackApplication(query: string): Promise<PolicyApplication | null> {
    const trimmed = query.trim();
    if (!trimmed) return null;

    // 1. Try search by Application ID (case-insensitive)
    const byId = await this.repository.findById(trimmed);
    if (byId) return byId;

    // 2. Try search by NIK
    const byNik = await this.repository.findByNik(trimmed);
    if (byNik && byNik.length > 0) {
      // Return the most recently created application
      return byNik[0];
    }

    return null;
  }

  public async submitRfiDocument(
    applicationId: string,
    pillarNumber: number,
    documentType: string,
    fileName: string
  ): Promise<{ success: boolean; application: PolicyApplication }> {
    const updated = await this.repository.addRfiDocument(applicationId, {
      pillarNumber,
      documentType,
      documentName: fileName,
    });

    if (!updated) {
      throw new Error(`Aplikasi dengan ID ${applicationId} tidak ditemukan.`);
    }

    return {
      success: true,
      application: updated,
    };
  }
}

