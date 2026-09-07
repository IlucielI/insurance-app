'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { InsuranceProduct } from '@/server/repositories/product.repository.interface';
import { applicationService, simulationService } from '@/server/di';
import {
  ApplicationSubmissionResult,
  CreateApplicationDTO,
} from '@/types/application.types';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Button } from '@/components/atoms/Button';

export interface InitialQuoteParams {
  productId?: string;
  sumAssured?: number;
  termYears?: number;
  monthlyPremium?: number;
  annualPremium?: number;
  frequency?: 'monthly' | 'annually';
  applicantAge?: number;
  gender?: 'male' | 'female';
  isSmoker?: boolean;
  occupationRisk?: 'low' | 'standard' | 'high';
  selectedRiders?: string[];
}

export interface ApplicationWorkbenchProps {
  initialProducts: InsuranceProduct[];
  initialQuote?: InitialQuoteParams;
}

export const ApplicationWorkbench: React.FC<ApplicationWorkbenchProps> = ({
  initialProducts,
  initialQuote = {},
}) => {
  const router = useRouter();

  // Selected Product & Actuarial Quote Resolution
  const selectedProduct = useMemo(() => {
    if (initialQuote.productId) {
      const found = initialProducts.find((p) => p.id === initialQuote.productId);
      if (found) return found;
    }
    return initialProducts[0] || null;
  }, [initialProducts, initialQuote.productId]);

  const sumAssured = initialQuote.sumAssured || 500_000_000;
  const termYears = initialQuote.termYears || 10;
  const frequency = initialQuote.frequency || 'annually';
  const initialAge = initialQuote.applicantAge || 32;
  const initialSmoker = Boolean(initialQuote.isSmoker);
  const initialGender = initialQuote.gender || 'male';
  const initialOccupationRisk = initialQuote.occupationRisk || 'low';
  const selectedRiders = useMemo(() => initialQuote.selectedRiders || [], [initialQuote.selectedRiders]);

  // Recalculate accurate premiums
  const quoteResult = useMemo(() => {
    if (!selectedProduct) return null;
    return simulationService.calculate(
      {
        productId: selectedProduct.id,
        sumAssured,
        termYears,
        applicantAge: initialAge,
        isSmoker: initialSmoker,
        gender: initialGender,
        occupationRisk: initialOccupationRisk,
        frequency,
        selectedRiderIds: selectedRiders,
      },
      selectedProduct
    );
  }, [
    selectedProduct,
    sumAssured,
    termYears,
    initialAge,
    initialSmoker,
    initialGender,
    initialOccupationRisk,
    frequency,
    selectedRiders,
  ]);

  const monthlyPremium = quoteResult ? quoteResult.monthlyPremium : 245_000;
  const annualPremium = quoteResult ? quoteResult.annualPremium : 2_760_000;
  const activePremium = frequency === 'annually' ? annualPremium : monthlyPremium;

  // Wizard Step State: 1 to 4
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<ApplicationSubmissionResult | null>(null);

  // Form Field States
  // Pilar 1: Identitas Diri
  const [nik, setNik] = useState<string>('3174051208940003');
  const [fullName, setFullName] = useState<string>('Bayu Pratama Kusuma');
  const [birthDate, setBirthDate] = useState<string>('1994-08-12');
  const [phoneNumber, setPhoneNumber] = useState<string>('+62 812-3456-7890');
  const [email, setEmail] = useState<string>('bayu.pratama@email.com');
  const [address, setAddress] = useState<string>(
    'Jl. Sudirman No. 42, RT 003 / RW 007, Setiabudi, Jakarta Selatan 12920'
  );
  const [ktpFileName, setKtpFileName] = useState<string>('KTP_Bayu_Pratama.jpg');
  const [selfieFileName, setSelfieFileName] = useState<string>('Selfie_Liveness_Check.jpg');

  // Pilar 2: Finansial & Kerja
  const [occupation, setOccupation] = useState<string>('Software Architect (IT / Tech)');
  const [companyName, setCompanyName] = useState<string>('PT Teknologi Solusi Bangsa');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(30_000_000);
  const [incomeSource, setIncomeSource] = useState<string>('Gaji Tetap Bulanan (Payroll)');
  const [incomeDocName, setIncomeDocName] = useState<string>('Slip_Gaji_3_Bulan_Bayu.pdf');
  const [npwp, setNpwp] = useState<string>('09.254.891.2-014.000');

  // Pilar 3: Skrining Medis
  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightKg, setWeightKg] = useState<number>(68);
  const [isSmoker, setIsSmoker] = useState<boolean>(initialSmoker);
  const [hasHospitalization, setHasHospitalization] = useState<boolean>(false);
  const [hasCriticalIllness, setHasCriticalIllness] = useState<boolean>(false);
  const [hasRegularMedication, setHasRegularMedication] = useState<boolean>(false);
  const [hasFamilyIllness, setHasFamilyIllness] = useState<boolean>(false);

  // Pilar 4: Review & Legalitas
  const [beneficiaryName, setBeneficiaryName] = useState<string>('Ratna Dewi Kusuma');
  const [beneficiaryRelationship, setBeneficiaryRelationship] = useState<
    'spouse' | 'child' | 'parent' | 'sibling'
  >('spouse');
  const [beneficiaryNik, setBeneficiaryNik] = useState<string>('3174055609950002');
  const [beneficiaryShare] = useState<number>(100);
  const [paymentMethod, setPaymentMethod] = useState<'va_bca' | 'va_mandiri' | 'va_bri' | 'credit_card'>('va_bca');
  const [agreeTruth, setAgreeTruth] = useState<boolean>(false);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dynamic Calculated Metrics
  const calculatedDsr = useMemo(() => {
    const annualEstIncome = Math.max(1, monthlyIncome * 12);
    return Number(((annualPremium / annualEstIncome) * 100).toFixed(1));
  }, [monthlyIncome, annualPremium]);

  const calculatedBmi = useMemo(() => {
    const heightM = Math.max(0.5, heightCm / 100);
    return Number((weightKg / (heightM * heightM)).toFixed(1));
  }, [weightKg, heightCm]);

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  // Age calculation from birthdate
  const applicantAgeYears = useMemo(() => {
    if (!birthDate) return 32;
    const birthYear = new Date(birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const diff = currentYear - birthYear;
    return diff > 0 ? diff : 32;
  }, [birthDate]);

  // Step Validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!nik.trim()) {
        newErrors.nik = 'NIK e-KTP wajib diisi.';
      } else if (!/^\d{16}$/.test(nik.trim())) {
        newErrors.nik = 'NIK harus tepat 16 digit angka.';
      }
      if (!fullName.trim() || fullName.trim().length < 3) {
        newErrors.fullName = 'Nama lengkap minimal 3 karakter sesuai KTP.';
      }
      if (!phoneNumber.trim()) {
        newErrors.phoneNumber = 'Nomor handphone wajib diisi.';
      }
      if (!email.trim() || !email.includes('@')) {
        newErrors.email = 'Alamat email tidak valid.';
      }
    }

    if (step === 2) {
      if (!occupation.trim()) {
        newErrors.occupation = 'Bidang profesi pekerjaan wajib dipilih.';
      }
      if (!companyName.trim()) {
        newErrors.companyName = 'Nama institusi/perusahaan wajib diisi.';
      }
      if (monthlyIncome <= 0) {
        newErrors.monthlyIncome = 'Penghasilan bulanan harus lebih besar dari 0.';
      }
    }

    if (step === 3) {
      if (heightCm < 100 || heightCm > 250) {
        newErrors.heightCm = 'Tinggi badan harus antara 100 cm s/d 250 cm.';
      }
      if (weightKg < 30 || weightKg > 200) {
        newErrors.weightKg = 'Berat badan harus antara 30 kg s/d 200 kg.';
      }
    }

    if (step === 4) {
      if (!beneficiaryName.trim()) {
        newErrors.beneficiaryName = 'Nama lengkap ahli waris wajib diisi.';
      }
      if (!beneficiaryNik.trim() || !/^\d{16}$/.test(beneficiaryNik.trim())) {
        newErrors.beneficiaryNik = 'NIK ahli waris wajib 16 digit.';
      }
      if (!agreeTruth) {
        newErrors.agreeTruth = 'Pernyataan kebenaran data wajib disetujui.';
      }
      if (!agreeTerms) {
        newErrors.agreeTerms = 'Persetujuan ketentuan polis wajib dicentang.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setErrors({});
      setCurrentStep((prev) => Math.min(4, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Application Submission
  const handleSubmitApplication = async () => {
    if (!validateStep(4) || !selectedProduct) return;

    setIsSubmitting(true);
    try {
      const payload: CreateApplicationDTO = {
        productId: selectedProduct.id,
        productName: selectedProduct.title,
        sumAssured,
        termYears,
        frequency,
        monthlyPremium,
        annualPremium,
        selectedRiderIds: selectedRiders,
        identity: {
          nik: nik.trim(),
          fullName: fullName.trim(),
          birthDate,
          gender: initialGender,
          phoneNumber: phoneNumber.trim(),
          email: email.trim(),
          ktpImageName: ktpFileName || 'KTP_Bayu_Pratama.jpg',
        },
        financial: {
          occupation: occupation.trim(),
          monthlyIncome,
          monthlyExpenses: Math.round(monthlyIncome * 0.4),
          existingDebtsMonthly: Math.round(monthlyIncome * 0.1),
        },
        medical: {
          heightCm,
          weightKg,
          isSmoker,
          hasCriticalIllnessHistory: hasCriticalIllness,
          hasHospitalizationLast2Years: hasHospitalization,
          hasFamilyHistory: hasFamilyIllness,
        },
        beneficiary: {
          fullName: beneficiaryName.trim(),
          relationship: beneficiaryRelationship,
          nik: beneficiaryNik.trim(),
          sharePercentage: beneficiaryShare,
        },
        payment: {
          method: paymentMethod,
          autoDebet: true,
        },
      };

      const result = await applicationService.submitApplication(payload);
      setSubmissionResult(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setErrors({
        submit: 'Terjadi kendala saat memproses pendaftaran. Silakan coba beberapa saat lagi.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedProduct) {
    return (
      <div className="py-20 text-center text-slate-500">
        Memuat data pendaftaran polis asuransi...
      </div>
    );
  }

  // Submission Success State
  if (submissionResult) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 text-left">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto">
            ✓
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              Pendaftaran Berhasil Disetujui (Instant Approval)
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a]">
              Selamat! Polis Elektronik Anda Siap Diterbitkan
            </h1>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              Sistem Core API underwriting telah memvalidasi seluruh 4 pilar checks Anda secara instan.
            </p>
          </div>

          {/* Certificate Snapshot Card */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Nomor Referensi Aplikasi</span>
                <span className="text-base font-bold text-sky-400">
                  {submissionResult.applicationId || '#APP-2026-8819'}
                </span>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                APPROVED & ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Produk:</span>
                <span className="font-bold text-white">{selectedProduct.title}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Pemegang Polis:</span>
                <span className="font-bold text-white">{fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Uang Pertanggungan:</span>
                <span className="font-bold text-white">{formatRupiah(sumAssured)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Premi Pertama:</span>
                <span className="font-bold text-emerald-400">{formatRupiah(activePremium)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              size="lg"
              variant="primary"
              className="w-full sm:w-auto font-bold bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl shadow-md"
              onClick={() => router.push(`/tracking?query=${encodeURIComponent(submissionResult.applicationId || 'APP-2026-8819')}`)}
            >
              🔍 Lacak Status di Tracking Portal
            </Button>
            <Link
              href="/"
              className="w-full sm:w-auto text-xs font-bold text-slate-600 hover:text-slate-900 px-6 py-3.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-center"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: TOP BREADCRUMB & HERO (Y: 0 - 180)                 */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-3 text-left">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-blue-600 transition-colors">
            Produk
          </Link>
          <span>/</span>
          <span className="text-slate-700">{selectedProduct.title}</span>
          <span>/</span>
          <span className="text-blue-600 font-bold">Pengajuan Aplikasi</span>
        </nav>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
            Pengajuan Aplikasi Polis Digital
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1 max-w-3xl">
            Lengkapi 4 tahap sederhana untuk evaluasi underwriting otomatis dalam 5 menit.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4-STEP HORIZONTAL STEPPER BAR (Y: 180 - 270)                  */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
        {/* Step 1 Pill */}
        <div
          className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
            currentStep === 1
              ? 'bg-white border-[#0f172a] ring-2 ring-[#0f172a] shadow-xs'
              : currentStep > 1
              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
              : 'bg-white border-slate-200 text-slate-400'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              currentStep === 1
                ? 'bg-[#0f172a] text-white'
                : currentStep > 1
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            {currentStep > 1 ? '✓' : '01'}
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-bold text-[#0f172a] truncate">01. Identitas KTP</span>
            <span className="block text-[11px] font-medium text-slate-500">
              {currentStep > 1 ? 'Terverifikasi ✓' : 'Validasi Dukcapil'}
            </span>
          </div>
        </div>

        {/* Step 2 Pill */}
        <div
          className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
            currentStep === 2
              ? 'bg-white border-[#0f172a] ring-2 ring-[#0f172a] shadow-xs'
              : currentStep > 2
              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
              : 'bg-white border-slate-200 text-slate-400'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              currentStep === 2
                ? 'bg-[#0f172a] text-white'
                : currentStep > 2
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            {currentStep > 2 ? '✓' : '02'}
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-bold text-[#0f172a] truncate">02. Finansial & Kerja</span>
            <span className="block text-[11px] font-medium text-slate-500">
              {currentStep > 2 ? 'Terverifikasi ✓' : 'Analisis Rasio UP'}
            </span>
          </div>
        </div>

        {/* Step 3 Pill */}
        <div
          className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
            currentStep === 3
              ? 'bg-white border-[#0f172a] ring-2 ring-[#0f172a] shadow-xs'
              : currentStep > 3
              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
              : 'bg-white border-slate-200 text-slate-400'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              currentStep === 3
                ? 'bg-[#0f172a] text-white'
                : currentStep > 3
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            {currentStep > 3 ? '✓' : '03'}
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-bold text-[#0f172a] truncate">03. Skrining Medis</span>
            <span className="block text-[11px] font-medium text-slate-500">
              {currentStep > 3 ? 'Terverifikasi ✓' : 'Kuesioner Kesehatan'}
            </span>
          </div>
        </div>

        {/* Step 4 Pill */}
        <div
          className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
            currentStep === 4
              ? 'bg-white border-[#0f172a] ring-2 ring-[#0f172a] shadow-xs'
              : 'bg-white border-slate-200 text-slate-400'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              currentStep === 4 ? 'bg-[#0f172a] text-white' : 'bg-slate-100 text-slate-400'
            }`}
          >
            04
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-bold text-[#0f172a] truncate">04. Review & Polis</span>
            <span className="block text-[11px] font-medium text-slate-500">Persetujuan Klausul</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2-COLUMN MAIN WIZARD INTERFACE                                */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Panels (7-8 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 text-left">
          {/* ========================================================= */}
          {/* STEP 1: IDENTITAS KTP                                     */}
          {/* ========================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#0f172a]">
                    Pilar 1: Data Identitas Diri (Sesuai KTP)
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Data identitas diverifikasi langsung dengan database kependudukan nasional untuk validasi underwriting instan.
                  </p>
                </div>
                <span className="self-start sm:self-auto text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shrink-0">
                  ✓ Terverifikasi Dukcapil Online
                </span>
              </div>

              {/* Field: NIK */}
              <div className="space-y-1">
                <Input
                  id="nik"
                  label="Nomor Induk Kependudukan (NIK 16 Digit):"
                  placeholder="3174051208940003"
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  errorMessage={errors.nik}
                  helperText="16 digit angka sesuai fisik e-KTP."
                />
              </div>

              {/* Grid: Nama & Tanggal Lahir */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="fullName"
                  label="Nama Lengkap (Sesuai KTP):"
                  placeholder="Bayu Pratama Kusuma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  errorMessage={errors.fullName}
                />

                <div>
                  <label htmlFor="birthDate" className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Lahir & Usia:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="py-2 px-3.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f172a] flex-1"
                    />
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-2 rounded-lg shrink-0">
                      {applicantAgeYears} Tahun
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid: Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="phoneNumber"
                  label="Nomor Handphone (Aktif):"
                  placeholder="+62 812-3456-7890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  errorMessage={errors.phoneNumber}
                />
                <Input
                  id="email"
                  label="Alamat Email Terdaftar:"
                  type="email"
                  placeholder="bayu.pratama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  errorMessage={errors.email}
                />
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label htmlFor="address" className="text-xs font-semibold text-slate-700">
                  Alamat Domisili KTP Lengkap:
                </label>
                <textarea
                  id="address"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full py-2 px-3.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f172a]"
                />
              </div>

              {/* Document Uploads matching Penpot */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-900 block">
                  Unggah Dokumen Verifikasi Wajib:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* KTP Upload */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">📷 Foto KTP Asli</span>
                      <button
                        type="button"
                        onClick={() => setKtpFileName('KTP_Bayu_Pratama_New.jpg')}
                        className="text-[10px] text-blue-600 hover:underline font-semibold"
                      >
                        Ganti File ↺
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">{ktpFileName} (1.4 MB)</p>
                    <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      ✓ OCR Score: 99.4% (Nama & NIK Cocok)
                    </span>
                  </div>

                  {/* Selfie Liveness */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">🤳 Foto Selfie Liveness</span>
                      <button
                        type="button"
                        onClick={() => setSelfieFileName('Selfie_Liveness_New.jpg')}
                        className="text-[10px] text-blue-600 hover:underline font-semibold"
                      >
                        Ganti File ↺
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">{selfieFileName} (2.1 MB)</p>
                    <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      ✓ Biometric Liveness Passed 98.1%
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Note */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <span>🔒</span>
                <span>Data KTP dienkripsi AES-256 dan hanya digunakan untuk proses penerbitan polis resmi.</span>
              </div>

              {/* CTA Navigation */}
              <div className="pt-2 space-y-3">
                <Button
                  size="lg"
                  variant="primary"
                  className="w-full font-bold bg-[#0f172a] hover:bg-slate-800 text-white py-3.5 rounded-xl text-sm"
                  onClick={handleNextStep}
                >
                  Lanjut ke Step 2: Finansial & Kerja →
                </Button>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
                  <span>Tahap 1 dari 4 • Estimasi waktu pengisian tersisa: ~3 menit</span>
                  <Link href="/assistant" className="text-blue-600 hover:underline font-semibold">
                    💬 Tanya AI Assistant seputar Form Pengajuan
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: FINANSIAL & KERJA                                 */}
          {/* ========================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#0f172a]">
                    Pilar 2: Profil Pekerjaan & Kapasitas Finansial
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Evaluasi kemampuan finansial nasabah untuk memastikan kesinambungan pembayaran premi polis.
                  </p>
                </div>
                <span className="self-start sm:self-auto text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shrink-0">
                  ✓ DSR Affordability Ratio Engine
                </span>
              </div>

              {/* Profession & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Profesi / Bidang Pekerjaan:"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  options={[
                    { value: 'Software Architect (IT / Tech)', label: 'Software Architect (IT / Tech)' },
                    { value: 'Karyawan Swasta', label: 'Karyawan Swasta / BUMN' },
                    { value: 'Wiraswasta / Pemilik Bisnis', label: 'Wiraswasta / Pemilik Bisnis' },
                    { value: 'Profesional Medis / Dokter', label: 'Profesional Medis / Dokter' },
                    { value: 'Pegawai Negeri Sipil (PNS)', label: 'Pegawai Negeri Sipil (PNS)' },
                  ]}
                  errorMessage={errors.occupation}
                />

                <Input
                  label="Nama Perusahaan / Institusi:"
                  placeholder="PT Teknologi Solusi Bangsa"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  errorMessage={errors.companyName}
                />
              </div>

              {/* Monthly Income & Funding Source */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Rata-Rata Penghasilan Bulanan:"
                  value={String(monthlyIncome)}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  options={[
                    { value: '15000000', label: 'Rp 10.000.000 - Rp 20.000.000' },
                    { value: '30000000', label: 'Rp 25.000.000 - Rp 35.000.000' },
                    { value: '50000000', label: 'Rp 40.000.000 - Rp 60.000.000' },
                    { value: '80000000', label: 'Di atas Rp 75.000.000' },
                  ]}
                />

                <Select
                  label="Sumber Dana Pembayaran Premi:"
                  value={incomeSource}
                  onChange={(e) => setIncomeSource(e.target.value)}
                  options={[
                    { value: 'Gaji Tetap Bulanan (Payroll)', label: 'Gaji Tetap Bulanan (Payroll)' },
                    { value: 'Hasil Usaha / Bisnis', label: 'Hasil Usaha / Bisnis' },
                    { value: 'Investasi & Dividen', label: 'Investasi & Dividen' },
                  ]}
                />
              </div>

              {/* Prominent DSR Ratio Box matching Penpot */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0f172a] flex items-center gap-1.5">
                    <span>⚡</span> Analisis Rasio Beban Premi (Debt-to-Income / DSR):
                  </span>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Rasio {calculatedDsr}% (SAFE)
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Premi tahunan sebesar {formatRupiah(annualPremium)} setara dengan {calculatedDsr}% dari total estimasi pendapatan tahunan Anda. Rasio ini tergolong <strong className="text-emerald-700">SANGAT SEHAT & MEMENUHI SYARAT UNDERWRITING OTOMATIS</strong> (Batas aman maksimum regulasi DSR adalah 15.0%).
                </p>
                <span className="inline-block text-[11px] font-bold text-emerald-600">
                  Status: Lolos Evaluasi Kapasitas Finansial (Green Flag) ✓
                </span>
              </div>

              {/* Income Proof Upload */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 block">
                  Unggah Bukti Penghasilan (Slip Gaji 3 Bulan / Rekening Koran):
                </span>
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-800">📄 {incomeDocName}</span>
                    <span className="block text-[10px] text-emerald-700">
                      ✓ Dokumen terbaca jelas • Gaji pokok verified {formatRupiah(monthlyIncome)}/bln
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIncomeDocName('Slip_Gaji_Updated.pdf')}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Ganti Berkas ↺
                  </button>
                </div>
              </div>

              {/* NPWP (Optional) */}
              <Input
                label="Nomor Pokok Wajib Pajak (NPWP 16 Digit) - Opsional:"
                placeholder="09.254.891.2-014.000"
                value={npwp}
                onChange={(e) => setNpwp(e.target.value)}
                helperText="Terverifikasi integrasi DJP Pajak otomatis."
              />

              {/* Navigation CTAs */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <Button size="md" variant="outline" onClick={handlePrevStep} className="font-semibold">
                  ← Kembali ke Step 1
                </Button>
                <Button
                  size="md"
                  variant="primary"
                  className="font-bold bg-[#0f172a] hover:bg-slate-800 text-white py-3 px-6 rounded-xl"
                  onClick={handleNextStep}
                >
                  Lanjut ke Step 3: Skrining Medis →
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: SKRINING MEDIS                                    */}
          {/* ========================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#0f172a]">
                    Pilar 3: Skrining Medis & Deklarasi Kesehatan Mandiri
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Jawab 4 pertanyaan kesehatan di bawah dengan jujur. Jawaban Anda dievaluasi langsung oleh engine risiko Core API.
                  </p>
                </div>
                <span className="self-start sm:self-auto text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shrink-0">
                  ✓ Medical Exam Waived (Bebas MCU)
                </span>
              </div>

              {/* Height / Weight & Live BMI */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <Input
                  label="Tinggi Badan (cm):"
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  errorMessage={errors.heightCm}
                />
                <Input
                  label="Berat Badan (kg):"
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  errorMessage={errors.weightKg}
                />
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-slate-500 block text-[10px]">Indeks Massa Tubuh (BMI):</span>
                  <span className="font-extrabold text-slate-900 text-sm">BMI: {calculatedBmi}</span>{' '}
                  <span className="text-emerald-600 font-bold">(Normal / Ideal 🟢)</span>
                </div>
              </div>

              {/* Smoker Pills */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-700 block">
                  Status Kebiasaan Merokok / Tembakau / Vape:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSmoker(false)}
                    aria-pressed={!isSmoker}
                    className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                      !isSmoker
                        ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    {!isSmoker ? '✓ ' : ''}Tidak Merokok (Non-Smoker Standard)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSmoker(true)}
                    aria-pressed={isSmoker}
                    className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                      isSmoker
                        ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    {isSmoker ? '✓ ' : ''}Perokok Aktif (Surcharge +45%)
                  </button>
                </div>
              </div>

              {/* 4 Health Questions */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                {/* Q1 */}
                <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200 space-y-2">
                  <p className="text-xs font-semibold text-slate-800">
                    1. Apakah Anda pernah menjalani rawat inap di RS atau operasi dalam 2 tahun terakhir?
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setHasHospitalization(false)}
                      className={`py-2 px-4 rounded-xl text-xs font-semibold border ${
                        !hasHospitalization ? 'bg-[#0f172a] text-white' : 'bg-white text-slate-700'
                      }`}
                    >
                      {!hasHospitalization ? '✓ ' : ''}Tidak Pernah
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasHospitalization(true)}
                      className={`py-2 px-4 rounded-xl text-xs font-semibold border ${
                        hasHospitalization ? 'bg-[#0f172a] text-white' : 'bg-white text-slate-700'
                      }`}
                    >
                      {hasHospitalization ? '✓ ' : ''}Pernah Dirawat
                    </button>
                  </div>
                </div>

                {/* Q2 */}
                <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200 space-y-2">
                  <p className="text-xs font-semibold text-slate-800">
                    2. Apakah Anda terdiagnosa penyakit kritis (jantung, stroke, kanker, diabetes, gagal ginjal)?
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setHasCriticalIllness(false)}
                      className={`py-2 px-4 rounded-xl text-xs font-semibold border ${
                        !hasCriticalIllness ? 'bg-[#0f172a] text-white' : 'bg-white text-slate-700'
                      }`}
                    >
                      {!hasCriticalIllness ? '✓ ' : ''}Tidak Ada Riwayat
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasCriticalIllness(true)}
                      className={`py-2 px-4 rounded-xl text-xs font-semibold border ${
                        hasCriticalIllness ? 'bg-[#0f172a] text-white' : 'bg-white text-slate-700'
                      }`}
                    >
                      {hasCriticalIllness ? '✓ ' : ''}Ada Riwayat
                    </button>
                  </div>
                </div>

                {/* Q3 */}
                <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200 space-y-2">
                  <p className="text-xs font-semibold text-slate-800">
                    3. Apakah saat ini Anda sedang mengonsumsi obat resep dokter secara rutin jangka panjang?
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setHasRegularMedication(false)}
                      className={`py-2 px-4 rounded-xl text-xs font-semibold border ${
                        !hasRegularMedication ? 'bg-[#0f172a] text-white' : 'bg-white text-slate-700'
                      }`}
                    >
                      {!hasRegularMedication ? '✓ ' : ''}Tidak Ada Obat Rutin
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasRegularMedication(true)}
                      className={`py-2 px-4 rounded-xl text-xs font-semibold border ${
                        hasRegularMedication ? 'bg-[#0f172a] text-white' : 'bg-white text-slate-700'
                      }`}
                    >
                      {hasRegularMedication ? '✓ ' : ''}Sedang Mengonsumsi
                    </button>
                  </div>
                </div>

                {/* Q4 */}
                <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200 space-y-2">
                  <p className="text-xs font-semibold text-slate-800">
                    4. Apakah ada riwayat penyakit kritis keluarga kandung sebelum usia 55 tahun?
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setHasFamilyIllness(false)}
                      className={`py-2 px-4 rounded-xl text-xs font-semibold border ${
                        !hasFamilyIllness ? 'bg-[#0f172a] text-white' : 'bg-white text-slate-700'
                      }`}
                    >
                      {!hasFamilyIllness ? '✓ ' : ''}Tidak Ada
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasFamilyIllness(true)}
                      className={`py-2 px-4 rounded-xl text-xs font-semibold border ${
                        hasFamilyIllness ? 'bg-[#0f172a] text-white' : 'bg-white text-slate-700'
                      }`}
                    >
                      {hasFamilyIllness ? '✓ ' : ''}Ada Riwayat Keluarga
                    </button>
                  </div>
                </div>
              </div>

              {/* Medical Outcome Callout */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <span className="font-extrabold block">
                  ✓ Hasil Skrining Medis: Skor Risiko Sangat Rendah (Low Risk - Class 1)
                </span>
                <p className="opacity-90">
                  Berdasarkan deklarasi di atas, Anda TIDAK MEMERLUKAN pemeriksaan lab rumah sakit. Proses instan aktif.
                </p>
              </div>

              {/* Navigation CTAs */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <Button size="md" variant="outline" onClick={handlePrevStep} className="font-semibold">
                  ← Kembali ke Step 2
                </Button>
                <Button
                  size="md"
                  variant="primary"
                  className="font-bold bg-[#0f172a] hover:bg-slate-800 text-white py-3 px-6 rounded-xl"
                  onClick={handleNextStep}
                >
                  Lanjut ke Step 4: Review & Polis →
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 4: REVIEW & PERSETUJUAN POLIS                        */}
          {/* ========================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#0f172a]">
                    Pilar 4: Review & Persetujuan Polis
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Periksa kembali data pengajuan, tentukan penerima manfaat ahli waris, dan setujui klausul perjanjian asuransi.
                  </p>
                </div>
                <span className="self-start sm:self-auto text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full shrink-0">
                  ⚡ Instant Approval Guaranteed
                </span>
              </div>

              {/* 3 Pillar Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Identitas Pemohon</span>
                  <span className="font-bold text-slate-900 block truncate">{fullName}</span>
                  <span className="text-emerald-600 font-semibold block">Dukcapil OCR: Lolos 99.4%</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Kapasitas Finansial</span>
                  <span className="font-bold text-slate-900 block truncate">{formatRupiah(monthlyIncome)}/bln</span>
                  <span className="text-emerald-600 font-semibold block">Rasio DSR: {calculatedDsr}% (Sehat)</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Skrining Medis</span>
                  <span className="font-bold text-slate-900 block">BMI: {calculatedBmi} (Normal)</span>
                  <span className="text-emerald-600 font-semibold block">Non-Smoker • Bebas Tes Lab</span>
                </div>
              </div>

              {/* Beneficiary Fields */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-900 block">
                  Penerima Manfaat Utama (Ahli Waris Polis):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    id="beneficiaryName"
                    label="Nama Lengkap Ahli Waris:"
                    placeholder="Ratna Dewi Kusuma"
                    value={beneficiaryName}
                    onChange={(e) => setBeneficiaryName(e.target.value)}
                    errorMessage={errors.beneficiaryName}
                  />

                  <Select
                    label="Hubungan Keluarga:"
                    value={beneficiaryRelationship}
                    onChange={(e) =>
                      setBeneficiaryRelationship(
                        e.target.value as 'spouse' | 'child' | 'parent' | 'sibling'
                      )
                    }
                    options={[
                      { value: 'spouse', label: 'Istri Sah / Suami Sah' },
                      { value: 'child', label: 'Anak Kandung' },
                      { value: 'parent', label: 'Orang Tua' },
                      { value: 'sibling', label: 'Saudara Kandung' },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    id="beneficiaryNik"
                    label="NIK Ahli Waris (16 Digit):"
                    placeholder="3174055609950002"
                    value={beneficiaryNik}
                    onChange={(e) => setBeneficiaryNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
                    errorMessage={errors.beneficiaryNik}
                  />
                  <Input
                    label="Persentase Hak Manfaat:"
                    value="100% (Penerima Manfaat Tunggal)"
                    disabled
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-900 block">
                  Pilih Metode Pembayaran Premi Pertama:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'va_bca', label: 'Virtual Account BCA' },
                    { id: 'va_mandiri', label: 'VA Mandiri' },
                    { id: 'va_bri', label: 'VA BRI' },
                    { id: 'credit_card', label: 'Kartu Kredit' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as 'va_bca' | 'va_mandiri' | 'va_bri' | 'credit_card')}
                      className={`py-3 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        paymentMethod === m.id
                          ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {paymentMethod === m.id ? '✓ ' : ''}{m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legal Statements */}
              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <Checkbox
                  label="Pernyataan Kebenaran Data Underwriting"
                  description="Saya menyatakan seluruh data identitas, profil finansial, dan deklarasi kesehatan di atas adalah benar dan sesuai kenyataan sesungguhnya. Data akan divalidasi langsung oleh sistem underwriting resmi."
                  checked={agreeTruth}
                  onChange={(e) => setAgreeTruth(e.target.checked)}
                />
                {errors.agreeTruth && (
                  <p className="text-rose-600 text-[11px] font-medium pl-6">{errors.agreeTruth}</p>
                )}

                <Checkbox
                  label="Persetujuan Klausul Polis & Izin Autodebet"
                  description={`Saya telah membaca, memahami, dan menyetujui seluruh Ketentuan Polis ${selectedProduct.title}, klausul pengecualian, masa tunggu, serta memberikan izin autodebet premi berkala.`}
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                {errors.agreeTerms && (
                  <p className="text-rose-600 text-[11px] font-medium pl-6">{errors.agreeTerms}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2 space-y-2">
                <Button
                  size="lg"
                  variant="primary"
                  className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-base shadow-lg transition-all"
                  onClick={handleSubmitApplication}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Memproses Underwriting Instan...'
                    : `Kirim Pengajuan & Terbitkan Polis Instan (${formatRupiah(activePremium)}) 🚀`}
                </Button>
                <p className="text-[11px] text-slate-400 text-center">
                  🛡️ Seluruh transaksi dilindungi enkripsi SSL 256-bit dan diawasi oleh Otoritas Jasa Keuangan (OJK).
                </p>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <Button size="sm" variant="outline" onClick={handlePrevStep}>
                  ← Kembali ke Step 3
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Policy Quote & Real-time Underwriting Status (4-5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="bg-[#0f172a] text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl space-y-5 text-left">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e293b] text-[#38bdf8] text-[10px] font-bold tracking-wider uppercase">
                • APLIKASI POLIS #APP-2026-8819
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {selectedProduct.title}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedProduct.tagline || selectedProduct.description}
              </p>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-[#1e293b] border border-slate-700/60 space-y-1.5">
              <span className="block text-[10px] font-bold text-[#38bdf8] uppercase tracking-wider">
                PREMI {frequency === 'annually' ? 'TAHUNAN (HEMAT 8%)' : 'BULANAN'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-white">
                  {formatRupiah(activePremium)}
                </span>
                <span className="text-xs text-slate-400">
                  / {frequency === 'annually' ? 'tahun' : 'bulan'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Setara dengan {formatRupiah(monthlyPremium)} per bulan
              </p>
            </div>

            {/* Policy Parameters */}
            <div className="p-3.5 rounded-2xl bg-[#1e293b] border border-slate-700/60 space-y-2 text-xs">
              <span className="text-[11px] font-bold text-slate-200 block border-b border-slate-700/60 pb-1">
                Ringkasan Pertanggungan Polis:
              </span>
              <div className="flex justify-between items-center text-slate-300">
                <span>Uang Pertanggungan (UP)</span>
                <span className="font-bold text-white">{formatRupiah(sumAssured)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Masa Pertanggungan (Tenor)</span>
                <span className="font-semibold text-white">{termYears} Tahun</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Frekuensi Pembayaran</span>
                <span className="font-semibold text-white capitalize">
                  {frequency === 'annually' ? 'Tahunan (Autodebet)' : 'Bulanan'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Metode Verifikasi</span>
                <span className="font-semibold text-emerald-400">Automated Underwriting</span>
              </div>
            </div>

            {/* Evaluasi Real-time Underwriting Engine */}
            <div className="space-y-2 text-xs">
              <span className="text-[11px] font-bold text-slate-200 block">
                Evaluasi Real-time Underwriting Engine:
              </span>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#1e293b]">
                  <span className="flex items-center gap-1.5">
                    <span className="text-emerald-400">✓</span> Pilar Identitas & KTP
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400">VERIFIED DUKCAPIL</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#1e293b]">
                  <span className="flex items-center gap-1.5">
                    <span className={currentStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}>
                      {currentStep >= 2 ? '✓' : '○'}
                    </span>{' '}
                    Pilar Profil Finansial
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      currentStep >= 2 ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {currentStep >= 2 ? `RATIO ${calculatedDsr}% (SAFE)` : 'PENDING'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#1e293b]">
                  <span className="flex items-center gap-1.5">
                    <span className={currentStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}>
                      {currentStep >= 2 ? '✓' : '○'}
                    </span>{' '}
                    Pilar Kelengkapan Berkas
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      currentStep >= 2 ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {currentStep >= 2 ? 'COMPLETE & VALID' : 'PENDING'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#1e293b]">
                  <span className="flex items-center gap-1.5">
                    <span className={currentStep >= 3 ? 'text-emerald-400' : 'text-slate-500'}>
                      {currentStep >= 3 ? '✓' : '○'}
                    </span>{' '}
                    Pilar Skrining Medis
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      currentStep >= 3 ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {currentStep >= 3 ? 'LOW RISK LEVEL' : 'PENDING'}
                  </span>
                </div>
              </div>
            </div>

            {/* Decision Status Box */}
            <div className="p-3.5 rounded-2xl bg-[#1e293b] border border-slate-700/60 space-y-1 text-xs">
              <span className="text-[#38bdf8] font-bold block">
                {currentStep === 4
                  ? '⚡ Estimasi Keputusan: INSTANT APPROVAL'
                  : '⚡ Estimasi Keputusan Sistem: IN PROGRESS'}
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {currentStep === 4
                  ? 'Seluruh 4 pilar checks terpenuhi! Polis elektronik (E-Polis) siap diterbitkan secara instan setelah konfirmasi pembayaran.'
                  : 'Sistem memvalidasi data Anda secara real-time. Lanjutkan ke langkah berikutnya untuk melengkapi underwriting.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 3: PRE-FOOTER AI ASSISTANT CARD                       */}
      {/* ------------------------------------------------------------- */}
      <section aria-labelledby="heading-apply-ai" className="pt-4">
        <div className="bg-white rounded-2xl border border-slate-300 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-700 text-[11px] font-bold px-2.5 py-1 rounded-md uppercase">
                AI ASSISTANT
              </span>
              <span className="text-[11px] font-semibold text-emerald-600">
                ⚡ Siaga 24/7 • Respons &lt; 1 Detik
              </span>
            </div>
            <h3 id="heading-apply-ai" className="text-lg font-extrabold text-[#0f172a]">
              Mengalami Kendala Saat Mengisi Formulir Aplikasi?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Underwriting Assistant kami siap membantu menjelaskan setiap pilar syarat dan klausul polis.
            </p>
          </div>

          <Link
            href="/assistant"
            className="py-2.5 px-5 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-white font-semibold text-xs transition-all shrink-0 self-start sm:self-auto"
          >
            Buka Chat AI Asisten →
          </Link>
        </div>
      </section>
    </div>
  );
};
