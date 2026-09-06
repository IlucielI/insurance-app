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
import { ProgressBar } from '@/components/atoms/ProgressBar';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Checkbox } from '@/components/atoms/Checkbox';
import { RadioCard } from '@/components/atoms/RadioCard';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { FileUpload } from '@/components/atoms/FileUpload';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/atoms/Card';
import { PillarStatusCard } from '@/components/molecules/PillarStatusCard';
import { Callout } from '@/components/molecules/Callout';

export interface InitialQuoteParams {
  productId?: string;
  sumAssured?: number;
  termYears?: number;
  monthlyPremium?: number;
  annualPremium?: number;
  frequency?: 'monthly' | 'annually';
  applicantAge?: number;
  isSmoker?: boolean;
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
  const frequency = initialQuote.frequency || 'monthly';
  const initialAge = initialQuote.applicantAge || 28;
  const initialSmoker = Boolean(initialQuote.isSmoker);
  const selectedRiders = useMemo(() => initialQuote.selectedRiders || [], [initialQuote.selectedRiders]);

  // Recalculate accurate premiums if not explicitly supplied
  const quoteResult = useMemo(() => {
    if (!selectedProduct) return null;
    return simulationService.calculate(
      {
        productId: selectedProduct.id,
        sumAssured,
        termYears,
        applicantAge: initialAge,
        isSmoker: initialSmoker,
        frequency,
        selectedRiderIds: selectedRiders,
      },
      selectedProduct
    );
  }, [selectedProduct, sumAssured, termYears, initialAge, initialSmoker, frequency, selectedRiders]);

  const monthlyPremium = quoteResult ? quoteResult.monthlyPremium : 160_000;
  const annualPremium = quoteResult ? quoteResult.annualPremium : 1_750_000;

  // Wizard Step State: 1 to 4
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<ApplicationSubmissionResult | null>(null);

  // Form Field States
  // Pilar 1: Identitas Diri
  const [nik, setNik] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('1996-05-15');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [ktpFileName, setKtpFileName] = useState<string>('');

  // Pilar 2: Finansial & DSR
  const [occupation, setOccupation] = useState<string>('Karyawan Swasta');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(15_000_000);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(5_000_000);
  const [existingDebtsMonthly, setExistingDebtsMonthly] = useState<number>(1_000_000);

  // Pilar 3: Medis & Gaya Hidup
  const [weightKg, setWeightKg] = useState<number>(68);
  const [heightCm, setHeightCm] = useState<number>(172);
  const [hasCriticalIllnessHistory, setHasCriticalIllnessHistory] = useState<boolean>(false);
  const [hasHospitalizationLast2Years, setHasHospitalizationLast2Years] = useState<boolean>(false);
  const [isSmoker, setIsSmoker] = useState<boolean>(initialSmoker);
  const [hasFamilyHistory, setHasFamilyHistory] = useState<boolean>(false);

  // Pilar 4: Ahli Waris & Legalitas
  const [beneficiaryName, setBeneficiaryName] = useState<string>('');
  const [beneficiaryRelationship, setBeneficiaryRelationship] = useState<
    'spouse' | 'child' | 'parent' | 'sibling'
  >('spouse');
  const [beneficiaryNik, setBeneficiaryNik] = useState<string>('');
  const [beneficiaryShare] = useState<number>(100);
  const [paymentMethod, setPaymentMethod] = useState<
    'va_bca' | 'va_mandiri' | 'va_bri' | 'credit_card'
  >('va_bca');
  const [autoDebet, setAutoDebet] = useState<boolean>(true);
  const [agreePdp, setAgreePdp] = useState<boolean>(false);
  const [agreeUnderwriting, setAgreeUnderwriting] = useState<boolean>(false);

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dynamic Calculated Metrics
  const calculatedDsr = useMemo(() => {
    const totalObligations = existingDebtsMonthly + monthlyPremium;
    const safeIncome = Math.max(1, monthlyIncome);
    return Number(((totalObligations / safeIncome) * 100).toFixed(1));
  }, [existingDebtsMonthly, monthlyPremium, monthlyIncome]);

  const calculatedBmi = useMemo(() => {
    const heightM = Math.max(0.5, heightCm / 100);
    return Number((weightKg / (heightM * heightM)).toFixed(1));
  }, [weightKg, heightCm]);

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  // Step Validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!nik.trim()) {
        newErrors.nik = 'NIK e-KTP wajib diisi.';
      } else if (!/^\d{16}$/.test(nik.trim())) {
        newErrors.nik = 'NIK harus berupa 16 digit angka resmi Dukcapil.';
      }

      if (!fullName.trim() || fullName.trim().length < 3) {
        newErrors.fullName = 'Nama lengkap minimal 3 karakter sesuai e-KTP.';
      }

      if (!phoneNumber.trim() || phoneNumber.trim().length < 10) {
        newErrors.phoneNumber = 'Nomor WhatsApp / HP minimal 10 digit.';
      }

      if (!email.trim() || !email.includes('@')) {
        newErrors.email = 'Alamat email aktif tidak valid.';
      }
    } else if (step === 2) {
      if (monthlyIncome <= 0) {
        newErrors.monthlyIncome = 'Penghasilan bulanan wajib diisi lebih dari 0.';
      }
    } else if (step === 3) {
      if (weightKg < 30 || weightKg > 200) {
        newErrors.weightKg = 'Berat badan harus di antara 30 s/d 200 kg.';
      }
      if (heightCm < 100 || heightCm > 250) {
        newErrors.heightCm = 'Tinggi badan harus di antara 100 s/d 250 cm.';
      }
    } else if (step === 4) {
      if (!beneficiaryName.trim() || beneficiaryName.trim().length < 3) {
        newErrors.beneficiaryName = 'Nama lengkap ahli waris wajib diisi minimal 3 karakter.';
      }
      if (!beneficiaryNik.trim()) {
        newErrors.beneficiaryNik = 'Nomor KTP / NIK ahli waris wajib diisi.';
      }
      if (!agreePdp) {
        newErrors.agreePdp = 'Anda wajib menyetujui kebijakan privasi data UU PDP.';
      }
      if (!agreeUnderwriting) {
        newErrors.agreeUnderwriting = 'Anda wajib menyetujui kebenaran data underwriting OJK.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(4, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Application
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    if (!selectedProduct) return;

    setIsSubmitting(true);
    try {
      const dto: CreateApplicationDTO = {
        productId: selectedProduct.id,
        productName: selectedProduct.title,
        sumAssured,
        termYears,
        monthlyPremium,
        annualPremium,
        frequency,
        selectedRiderIds: selectedRiders,
        identity: {
          nik: nik.trim(),
          fullName: fullName.trim(),
          birthDate,
          gender,
          phoneNumber: phoneNumber.trim(),
          email: email.trim(),
          ktpImageName: ktpFileName || undefined,
        },
        financial: {
          occupation,
          monthlyIncome,
          monthlyExpenses,
          existingDebtsMonthly,
        },
        medical: {
          weightKg,
          heightCm,
          hasCriticalIllnessHistory,
          hasHospitalizationLast2Years,
          isSmoker,
          hasFamilyHistory,
        },
        beneficiary: {
          fullName: beneficiaryName.trim(),
          relationship: beneficiaryRelationship,
          nik: beneficiaryNik.trim(),
          sharePercentage: beneficiaryShare,
        },
        payment: {
          method: paymentMethod,
          autoDebet,
        },
      };

      const result = await applicationService.submitApplication(dto);
      setSubmissionResult(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedProduct) {
    return (
      <div className="py-20 text-center text-slate-500">
        Memuat data pengajuan polis digital...
      </div>
    );
  }

  // SUCCESS RECEIPT SCREEN
  if (submissionResult) {
    const app = submissionResult.application;
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
        {/* Success Header Banner */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm ${
            submissionResult.isInstantApproval
              ? 'bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white border-emerald-500/30'
              : 'bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border-blue-500/30'
          }`}
        >
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold backdrop-blur-xs">
              <span>{submissionResult.isInstantApproval ? '⚡' : '📋'}</span>
              <span>
                {submissionResult.isInstantApproval
                  ? 'INSTANT APPROVAL (DISETUJUI OTOMATIS)'
                  : 'UNDER REVIEW (DALAM PENINJAUAN UNDERWRITER)'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Pengajuan Polis Berhasil Dikirim!
            </h1>
            <p className="text-sm text-slate-200 max-w-xl">{submissionResult.message}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-left sm:text-right shrink-0">
            <span className="text-[11px] uppercase font-bold text-slate-300 block">
              Nomor Registrasi Aplikasi
            </span>
            <span className="text-xl font-mono font-extrabold text-white tracking-wider block">
              {submissionResult.applicationId}
            </span>
            <span className="text-[11px] text-slate-300 block mt-0.5">
              SLA Estimasi: {app.slaRemainingMinutes === 0 ? 'Instan 0 Menit' : `${app.slaRemainingMinutes} Menit`}
            </span>
          </div>
        </div>

        {/* 4 Pillars Underwriting Result Cards */}
        <div className="space-y-4 text-left">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">
              Hasil Verifikasi 4 Pilar Otomatis OJK
            </h2>
            <p className="text-xs text-slate-500">
              Sistem telah mengevaluasi dokumen kependudukan, kapasitas keuangan, profil medis, dan legalitas polis Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {app.pillarChecks.map((check) => (
              <PillarStatusCard
                key={check.pillarNumber}
                pillarNumber={check.pillarNumber}
                pillarTitle={check.title}
                description={check.description}
                status={check.status}
                statusText={check.statusText}
              />
            ))}
          </div>
        </div>

        {/* Policy & Applicant Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Policy Overview */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Rincian Polis Asuransi
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Produk</span>
                <span className="font-bold text-slate-900">{app.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Uang Pertanggungan</span>
                <span className="font-bold text-slate-900">{formatRupiah(app.sumAssured)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Masa Garansi Polis</span>
                <span className="font-semibold text-slate-800">{app.termYears} Tahun</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Frekuensi Pembayaran</span>
                <span className="font-bold text-slate-900 capitalize">
                  {app.frequency === 'monthly' ? 'Bulanan' : 'Tahunan'}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2">
                <span className="text-slate-500 font-medium">Estimasi Kontribusi Premi</span>
                <span className="font-extrabold text-blue-700 text-sm">
                  {formatRupiah(app.frequency === 'monthly' ? app.monthlyPremium : app.annualPremium)}
                  <span className="text-[11px] font-normal text-slate-500">
                    /{app.frequency === 'monthly' ? 'bln' : 'thn'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Applicant & Beneficiary */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Tertanggung & Ahli Waris
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Tertanggung</span>
                <span className="font-bold text-slate-900">{app.identity.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">NIK Tertanggung</span>
                <span className="font-mono text-slate-800">{app.identity.nik}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Ahli Waris</span>
                <span className="font-bold text-slate-900">{app.beneficiary.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hubungan Keluarga</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {app.beneficiary.relationship === 'spouse'
                    ? 'Pasangan (Suami/Istri)'
                    : app.beneficiary.relationship === 'child'
                    ? 'Anak Kandung'
                    : app.beneficiary.relationship === 'parent'
                    ? 'Orang Tua'
                    : 'Saudara Kandung'}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2">
                <span className="text-slate-500">Porsi Hak Santunan</span>
                <span className="font-bold text-emerald-600">
                  {app.beneficiary.sharePercentage}% Santunan Penuh
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto font-semibold">
              Kembali ke Beranda
            </Button>
          </Link>
          <Button
            variant="primary"
            className="w-full sm:w-auto font-bold shadow-md"
            onClick={() => router.push(`/tracking?applicationId=${encodeURIComponent(submissionResult.applicationId)}`)}
          >
            Lacak Status Polis di Tracking Portal 🔍
          </Button>
        </div>
      </div>
    );
  }

  // WIZARD FORM VIEW
  const stepTitles = [
    { number: 1, title: 'Identitas Dukcapil', icon: '🪪' },
    { number: 2, title: 'Profil Finansial & DSR', icon: '📊' },
    { number: 3, title: 'Skrining Medis & Gaya Hidup', icon: '🩺' },
    { number: 4, title: 'Ahli Waris & Legalitas', icon: '📜' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Breadcrumb */}
      <div className="space-y-3 text-left">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-blue-600 transition-colors">
            Katalog
          </Link>
          <span>/</span>
          <Link
            href={`/simulation?productId=${selectedProduct.id}`}
            className="hover:text-blue-600 transition-colors"
          >
            Simulasi
          </Link>
          <span>/</span>
          <span className="text-blue-600">Pengajuan Polis 4-Pilar</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
              <span>🛡️</span> 4-Pillar Automated Underwriting Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pendaftaran Polis Asuransi Digital
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl mt-1">
              Lengkapi 4 pilar pengajuan terpadu untuk verifikasi otomatis tanpa antrean fisik dan terbit instan.
            </p>
          </div>

          <Link
            href={`/simulation?productId=${selectedProduct.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/60 hover:bg-blue-100/60 px-3.5 py-2 rounded-xl transition-all self-start md:self-auto"
          >
            <span>←</span> Sesuaikan Simulasi Premi
          </Link>
        </div>
      </div>

      {/* Wizard Step Progress Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stepTitles.map((step) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            return (
              <div
                key={step.number}
                className={`p-3 rounded-xl border transition-all text-left flex items-center gap-3 ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-500/10'
                    : isCompleted
                    ? 'border-emerald-300 bg-emerald-50/40 text-emerald-900'
                    : 'border-slate-200 bg-slate-50/50 text-slate-400'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : step.number}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                    Pilar 0{step.number}
                  </span>
                  <span
                    className={`text-xs font-bold truncate block ${
                      isCurrent ? 'text-blue-950' : isCompleted ? 'text-emerald-950' : 'text-slate-600'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <ProgressBar
          value={(currentStep / 4) * 100}
          label={`Progres Pendaftaran 4-Pilar: Langkah ${currentStep} dari 4`}
          showPercent
          variant="blue"
          size="sm"
        />
      </div>

      {/* Main Form Layout: Wizard Form (Left) vs Sticky Policy Overview (Right) */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Active Step Form */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: PILAR 1 - IDENTITAS DUKCAPIL */}
          {currentStep === 1 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-left animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="blue" size="sm">
                    Pilar 01
                  </Badge>
                  <span className="text-xs font-bold text-slate-500">Verifikasi Kependudukan</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">Identitas e-KTP & Kontak Nasabah</h2>
                <p className="text-xs text-slate-500">
                  Pastikan NIK dan nama lengkap sesuai dengan data kependudukan resmi Kemendagri Dukcapil.
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  label="Nomor Induk Kependudukan (NIK e-KTP 16 Digit)"
                  placeholder="Contoh: 3201123456780001"
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/[^0-9]/g, ''))}
                  errorMessage={errors.nik}
                  helperText="16 digit angka yang tercantum pada e-KTP fisik Anda."
                />

                <Input
                  label="Nama Lengkap (Sesuai KTP Tanpa Gelar)"
                  placeholder="Contoh: Budi Santoso"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  errorMessage={errors.fullName}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Tanggal Lahir"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    helperText="Usia masuk tertanggung dihitung otomatis."
                  />

                  <Select
                    label="Jenis Kelamin"
                    value={gender}
                    options={[
                      { value: 'male', label: 'Laki-Laki (Male)' },
                      { value: 'female', label: 'Perempuan (Female)' },
                    ]}
                    onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nomor WhatsApp / HP Aktif"
                    placeholder="081234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    errorMessage={errors.phoneNumber}
                    helperText="Untuk pengiriman notifikasi status underwriting & OTP."
                  />

                  <Input
                    label="Alamat Email Korespondensi"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    errorMessage={errors.email}
                    helperText="Sertifikat e-Policy digital akan dikirimkan ke email ini."
                  />
                </div>

                <div className="pt-2">
                  <FileUpload
                    label="Unggah Foto e-KTP Fisik (Opsional untuk Akselerasi OCR)"
                    helperText="Format JPG, PNG, atau PDF (Maksimal 10MB)"
                    onFileSelect={(file) => setKtpFileName(file.name)}
                  />
                </div>

                <Callout
                  variant="info"
                  title="Jaminan Kerahasiaan Identitas"
                  description="Data pribadi Anda dienkripsi dengan standar TLS 1.3 dan diproteksi sesuai amanat UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP)."
                />
              </div>
            </div>
          )}

          {/* STEP 2: PILAR 2 - PROFIL FINANSIAL & DSR */}
          {currentStep === 2 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-left animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="blue" size="sm">
                    Pilar 02
                  </Badge>
                  <span className="text-xs font-bold text-slate-500">Kapasitas Keuangan</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Profil Pekerjaan & Debt-to-Service Ratio (DSR)
                </h2>
                <p className="text-xs text-slate-500">
                  Kriteria aktuaria OJK mewajibkan beban premi dan cicilan tidak membebani arus kas nasabah.
                </p>
              </div>

              <div className="space-y-4">
                <Select
                  label="Pekerjaan / Bidang Profesi"
                  value={occupation}
                  options={[
                    { value: 'Karyawan Swasta', label: 'Karyawan Swasta / BUMN' },
                    { value: 'Pegawai Negeri Sipil (PNS)', label: 'Pegawai Negeri Sipil (PNS) / TNI / Polri' },
                    { value: 'Profesional', label: 'Profesional (Dokter, Pengacara, Notaris, Konsultan)' },
                    { value: 'Wiraswasta', label: 'Wiraswasta / Pemilik Usaha' },
                    { value: 'Freelancer / Digital Creator', label: 'Freelancer / Pekerja Lepas / Kreator Digital' },
                  ]}
                  onChange={(e) => setOccupation(e.target.value)}
                />

                <Input
                  label="Penghasilan Bulanan Bersih (Take Home Pay)"
                  type="number"
                  min={1_000_000}
                  step={500_000}
                  value={monthlyIncome || ''}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  errorMessage={errors.monthlyIncome}
                  helperText={`Format Rupiah: ${formatRupiah(monthlyIncome || 0)}`}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Rata-rata Pengeluaran Rutin Bulanan"
                    type="number"
                    min={0}
                    step={500_000}
                    value={monthlyExpenses || ''}
                    onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                    helperText={`Format: ${formatRupiah(monthlyExpenses || 0)}`}
                  />

                  <Input
                    label="Total Cicilan / Kewajiban Utang Bulanan"
                    type="number"
                    min={0}
                    step={500_000}
                    value={existingDebtsMonthly || ''}
                    onChange={(e) => setExistingDebtsMonthly(Number(e.target.value))}
                    helperText={`Format: ${formatRupiah(existingDebtsMonthly || 0)}`}
                  />
                </div>

                {/* Real-time DSR Assessment Card */}
                <div
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    calculatedDsr <= 30
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : calculatedDsr <= 40
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                      : 'bg-rose-50/70 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                      Indikator Beban Finansial (DSR)
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-extrabold">{calculatedDsr}%</span>
                      <Badge
                        variant={calculatedDsr <= 30 ? 'emerald' : calculatedDsr <= 40 ? 'amber' : 'rose'}
                        size="sm"
                      >
                        {calculatedDsr <= 30
                          ? 'Sehat Finansial'
                          : calculatedDsr <= 40
                          ? 'Mendekati Batas Aman'
                          : 'Rasio Tinggi'}
                      </Badge>
                    </div>
                    <p className="text-xs opacity-90 leading-relaxed">
                      {calculatedDsr <= 30
                        ? 'Rasio cicilan dan premi Anda sangat sehat (di bawah ambang batas OJK 35%).'
                        : calculatedDsr <= 40
                        ? 'Rasio cicilan dan premi mendekati batas toleransi 35-40%.'
                        : 'Beban kewajiban melebihi 40% penghasilan. Mungkin diperlukan bukti penghasilan tambahan.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PILAR 3 - SKRINING MEDIS & GAYA HIDUP */}
          {currentStep === 3 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-left animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="blue" size="sm">
                    Pilar 03
                  </Badge>
                  <span className="text-xs font-bold text-slate-500">Skrining Kesehatan</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Indeks Massa Tubuh (BMI) & Kuesioner Medis
                </h2>
                <p className="text-xs text-slate-500">
                  Deklarasi riwayat kesehatan digital tanpa memerlukan Medical Check-Up fisik untuk perlindungan hingga Rp 1 Miliar.
                </p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Tinggi Badan (cm)"
                    type="number"
                    min={100}
                    max={250}
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    errorMessage={errors.heightCm}
                  />

                  <Input
                    label="Berat Badan (kg)"
                    type="number"
                    min={30}
                    max={200}
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    errorMessage={errors.weightKg}
                  />
                </div>

                {/* BMI Score Display */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold uppercase text-slate-500">
                      Indeks Massa Tubuh (BMI)
                    </span>
                    <p className="text-xs text-slate-600">
                      Status:{' '}
                      <span className="font-bold text-slate-900">
                        {calculatedBmi < 18.5
                          ? 'Underweight (< 18.5)'
                          : calculatedBmi <= 24.9
                          ? 'Ideal / Normal (18.5 - 24.9)'
                          : calculatedBmi <= 29.9
                          ? 'Overweight (25 - 29.9)'
                          : 'Obesitas (≥ 30)'}
                      </span>
                    </p>
                  </div>
                  <span className="text-xl font-extrabold text-blue-600">{calculatedBmi}</span>
                </div>

                {/* Medical Questionnaire */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Deklarasi Riwayat Kesehatan Calon Tertanggung:
                  </span>

                  <Checkbox
                    label="Riwayat Penyakit Kritis"
                    description="Pernah terdiagnosa atau dirawat karena kanker, serangan jantung, stroke, gagal ginjal, atau diabetes kronis."
                    checked={hasCriticalIllnessHistory}
                    onChange={(e) => setHasCriticalIllnessHistory(e.target.checked)}
                  />

                  <Checkbox
                    label="Riwayat Rawat Inap 2 Tahun Terakhir"
                    description="Pernah menjalani tindakan pembedahan / operasi atau opname di rumah sakit lebih dari 3 hari dalam 24 bulan terakhir."
                    checked={hasHospitalizationLast2Years}
                    onChange={(e) => setHasHospitalizationLast2Years(e.target.checked)}
                  />

                  <Checkbox
                    label="Status Perokok Aktif"
                    description="Mengonsumsi rokok tembakau konvensional atau cerutu / vape dalam 12 bulan terakhir."
                    checked={isSmoker}
                    onChange={(e) => setIsSmoker(e.target.checked)}
                  />

                  <Checkbox
                    label="Riwayat Herediter Penyakit Keluarga Inti"
                    description="Terdapat orang tua kandung atau saudara kandung yang terdiagnosa penyakit jantung / kanker sebelum usia 55 tahun."
                    checked={hasFamilyHistory}
                    onChange={(e) => setHasFamilyHistory(e.target.checked)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PILAR 4 - AHLI WARIS & LEGALITAS POLIS */}
          {currentStep === 4 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-left animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="blue" size="sm">
                    Pilar 04
                  </Badge>
                  <span className="text-xs font-bold text-slate-500">Legalitas & Beneficiary</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Data Ahli Waris & Otorisasi e-Policy
                </h2>
                <p className="text-xs text-slate-500">
                  Tentukan penerima manfaat klaim santunan tunai yang sah dan otorisasi pembayaran premi.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nama Lengkap Ahli Waris Utama"
                    placeholder="Contoh: Siti Rahayu"
                    value={beneficiaryName}
                    onChange={(e) => setBeneficiaryName(e.target.value)}
                    errorMessage={errors.beneficiaryName}
                  />

                  <Select
                    label="Hubungan dengan Tertanggung"
                    value={beneficiaryRelationship}
                    options={[
                      { value: 'spouse', label: 'Pasangan Sah (Suami / Istri)' },
                      { value: 'child', label: 'Anak Kandung' },
                      { value: 'parent', label: 'Orang Tua Kandung' },
                      { value: 'sibling', label: 'Saudara Kandung' },
                    ]}
                    onChange={(e) =>
                      setBeneficiaryRelationship(
                        e.target.value as 'spouse' | 'child' | 'parent' | 'sibling'
                      )
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nomor KTP / NIK Ahli Waris"
                    placeholder="Contoh: 3201123456780002"
                    value={beneficiaryNik}
                    onChange={(e) => setBeneficiaryNik(e.target.value.replace(/[^0-9]/g, ''))}
                    errorMessage={errors.beneficiaryNik}
                    helperText="Untuk verifikasi keabsahan saat proses klaim santunan."
                  />

                  <Input
                    label="Porsi Hak Santunan (%)"
                    type="number"
                    disabled
                    value={beneficiaryShare}
                    helperText="Hak santunan penuh 100% dialokasikan kepada ahli waris utama."
                  />
                </div>

                {/* Payment Selection */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700 select-none">
                    Pilihan Metode Pembayaran Premi Pertama
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <RadioCard
                      name="payment-method"
                      value="va_bca"
                      title="BCA Virtual Account"
                      description="Konfirmasi instan via myBCA, BCA mobile, dan ATM."
                      selected={paymentMethod === 'va_bca'}
                      onChange={() => setPaymentMethod('va_bca')}
                    />
                    <RadioCard
                      name="payment-method"
                      value="va_mandiri"
                      title="Mandiri Virtual Account"
                      description="Bayar instan via Livin' by Mandiri."
                      selected={paymentMethod === 'va_mandiri'}
                      onChange={() => setPaymentMethod('va_mandiri')}
                    />
                  </div>

                  <div className="pt-2">
                    <Checkbox
                      label="Aktifkan Autodebet Otomatis"
                      description="Perlindungan polis tidak pernah terputus karena kelupaan tanggal jatuh tempo premi."
                      checked={autoDebet}
                      onChange={(e) => setAutoDebet(e.target.checked)}
                    />
                  </div>
                </div>

                {/* Legal Agreements */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <Checkbox
                    label="Persetujuan Pemrosesan Data Pribadi (UU PDP)"
                    description="Saya menyetujui pemrosesan data identitas untuk verifikasi kepatuhan OJK dan penerbitan e-Policy."
                    checked={agreePdp}
                    onChange={(e) => setAgreePdp(e.target.checked)}
                    errorMessage={errors.agreePdp}
                  />

                  <Checkbox
                    label="Pernyataan Kebenaran Data Underwriting"
                    description="Saya menyatakan seluruh jawaban kuesioner medis dan data keuangan adalah benar dan tidak memuat penipuan / fraud."
                    checked={agreeUnderwriting}
                    onChange={(e) => setAgreeUnderwriting(e.target.checked)}
                    errorMessage={errors.agreeUnderwriting}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Wizard Step Navigation Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={handlePrevStep}>
                ← Kembali ke Pilar 0{currentStep - 1}
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <Button type="button" variant="primary" onClick={handleNextStep}>
                Lanjut ke Pilar 0{currentStep + 1} →
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="font-bold shadow-md"
              >
                {isSubmitting ? 'Memproses Verifikasi 4-Pilar...' : 'Kirim Pengajuan Polis Digital 🚀'}
              </Button>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Policy Overview Sidebar */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <Card
            variant="elevated"
            className="border-blue-100 bg-linear-to-b from-white to-blue-50/20 text-left shadow-lg shadow-blue-900/5"
          >
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <Badge variant="blue" size="sm">
                  Ringkasan Polis
                </Badge>
                <span className="text-[11px] font-semibold text-slate-500">
                  Masa {termYears} Th
                </span>
              </div>
              <CardTitle className="text-lg text-slate-900 mt-1">
                {selectedProduct.title}
              </CardTitle>
              <CardDescription>{selectedProduct.tagline || selectedProduct.category}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
              {/* Premium Box */}
              <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-0.5">
                <span className="text-[11px] text-slate-400 block">
                  Kontribusi Premi ({frequency === 'monthly' ? 'Bulanan' : 'Tahunan'})
                </span>
                <span className="text-2xl font-extrabold tracking-tight">
                  {formatRupiah(frequency === 'monthly' ? monthlyPremium : annualPremium)}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {' '}/ {frequency === 'monthly' ? 'bulan' : 'tahun'}
                </span>
              </div>

              {/* Policy Attributes */}
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Santunan Uang Pertanggungan</span>
                  <span className="font-bold text-slate-900">{formatRupiah(sumAssured)}</span>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Masa Garansi Polis</span>
                  <span className="font-semibold text-slate-800">{termYears} Tahun</span>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Metode Klaim</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {selectedProduct.claimMethod === 'cashless'
                      ? '💳 Cashless Digital'
                      : selectedProduct.claimMethod === 'instant_transfer'
                      ? '⚡ Transfer Instan 24 Jam'
                      : '📄 Reimbursement'}
                  </span>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Riders Terpilih</span>
                  <span className="font-semibold text-blue-600">
                    {selectedRiders.length > 0 ? `${selectedRiders.length} Proteksi Tambahan` : 'Tidak Ada'}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                *Penerbitan polis resmi dilindungi oleh OJK & Dewan Pengawas Syariah / AAJI.
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};
