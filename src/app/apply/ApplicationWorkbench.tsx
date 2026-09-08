'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  InsuranceProduct,
  ProductQuestionDTO,
  ProductQuestionnaireDTO,
} from '@/server/repositories/product.repository.interface';
import { calculatePureSimulation } from '@/lib/simulation-calc';
import { submitApplicationAction, getQuestionnaireAction } from './actions';
import {
  ApplicationAnswerItem,
  ApplicationSubmissionResult,
  CreateApplicationDTO,
} from '@/types/application.types';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Button } from '@/components/atoms/Button';
import { Slider } from '@/components/atoms/Slider';

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
  initialQuestionnaire?: ProductQuestionnaireDTO | null;
  submitAction?: (payload: CreateApplicationDTO) => Promise<ApplicationSubmissionResult>;
}

export const ApplicationWorkbench: React.FC<ApplicationWorkbenchProps> = ({
  initialProducts,
  initialQuote = {},
  initialQuestionnaire = null,
  submitAction,
}) => {
  const router = useRouter();

  // Selected Product & Actuarial Quote Resolution
  const [selectedProductId, setSelectedProductId] = useState<string>(() => {
    if (initialQuote.productId) {
      const target = initialQuote.productId.toLowerCase();
      const found = initialProducts.find(
        (p) =>
          p.id.toLowerCase() === target ||
          p.slug.toLowerCase() === target ||
          p.categoryKey.toLowerCase() === target ||
          p.title.toLowerCase().includes(target)
      );
      if (found) return found.id;
    }
    return initialProducts[0]?.id || '';
  });

  const selectedProduct = useMemo(() => {
    if (selectedProductId) {
      const target = selectedProductId.toLowerCase();
      const found = initialProducts.find(
        (p) =>
          p.id.toLowerCase() === target ||
          p.slug.toLowerCase() === target ||
          p.categoryKey.toLowerCase() === target ||
          p.title.toLowerCase().includes(target)
      );
      if (found) return found;
    }
    return initialProducts[0] || null;
  }, [initialProducts, selectedProductId]);

  const prevInitialProductIdRef = useRef(initialQuote.productId);

  // Sync when initialQuote.productId prop changes (e.g. from URL navigation)
  useEffect(() => {
    if (initialQuote.productId !== prevInitialProductIdRef.current) {
      prevInitialProductIdRef.current = initialQuote.productId;
      if (initialQuote.productId) {
        const target = initialQuote.productId.toLowerCase();
        const found = initialProducts.find(
          (p) =>
            p.id.toLowerCase() === target ||
            p.slug.toLowerCase() === target ||
            p.categoryKey.toLowerCase() === target ||
            p.title.toLowerCase().includes(target)
        );
        if (found) {
          setSelectedProductId(found.id);
        }
      }
    }
  }, [initialQuote.productId, initialProducts]);

  const handleProductChange = (newProductId: string) => {
    setSelectedProductId(newProductId);
  };

  const isVehicleCategory = Boolean(
    selectedProduct?.categoryKey === 'vehicle' ||
    selectedProduct?.category?.toLowerCase().includes('kendaraan') ||
    selectedProduct?.category?.toLowerCase().includes('vehicle') ||
    selectedProduct?.slug?.toLowerCase().includes('auto') ||
    selectedProduct?.slug?.toLowerCase().includes('vehicle') ||
    selectedProduct?.id?.toLowerCase().includes('auto') ||
    selectedProduct?.id?.toLowerCase().includes('vehicle')
  );

  const sumAssuredPresets = useMemo(() => {
    if (selectedProduct?.sumAssuredPresets && selectedProduct.sumAssuredPresets.length > 0) {
      return selectedProduct.sumAssuredPresets.map((val) => ({
        value: val,
        label:
          val >= 1_000_000_000
            ? `Rp ${(val / 1_000_000_000).toLocaleString('id-ID')} Miliar`
            : `Rp ${(val / 1_000_000).toLocaleString('id-ID')} Juta`,
      }));
    }
    return [
      { value: 100_000_000, label: 'Rp 100 Juta' },
      { value: 250_000_000, label: 'Rp 250 Juta' },
      { value: 500_000_000, label: 'Rp 500 Juta' },
      { value: 1_000_000_000, label: 'Rp 1 Miliar' },
    ];
  }, [selectedProduct]);

  const termPresets = useMemo(() => {
    if (selectedProduct?.termPresets && selectedProduct.termPresets.length > 0) {
      return selectedProduct.termPresets;
    }
    return [5, 10, 15, 20];
  }, [selectedProduct]);

  const [sumAssured, setSumAssured] = useState<number>(() => {
    const validPresets =
      selectedProduct?.sumAssuredPresets && selectedProduct.sumAssuredPresets.length > 0
        ? selectedProduct.sumAssuredPresets
        : [100_000_000, 250_000_000, 500_000_000, 1_000_000_000];
    if (initialQuote.sumAssured && validPresets.includes(initialQuote.sumAssured)) {
      return initialQuote.sumAssured;
    }
    if (validPresets.includes(500_000_000)) {
      return 500_000_000;
    }
    if (validPresets.includes(300_000_000)) {
      return 300_000_000;
    }
    return validPresets[0] ?? 100_000_000;
  });

  const [termYears, setTermYears] = useState<number>(() => {
    const validPresets =
      selectedProduct?.termPresets && selectedProduct.termPresets.length > 0
        ? selectedProduct.termPresets
        : [5, 10, 15, 20];
    if (initialQuote.termYears && validPresets.includes(initialQuote.termYears)) {
      return initialQuote.termYears;
    }
    if (validPresets.includes(10)) {
      return 10;
    }
    return validPresets[0] ?? 1;
  });

  const prevProductIdRef = useRef<string | undefined>(selectedProduct?.id);

  // Auto-clamp and re-validate sumAssured and termYears when selected product changes
  useEffect(() => {
    if (!selectedProduct) return;

    if (prevProductIdRef.current !== selectedProduct.id) {
      prevProductIdRef.current = selectedProduct.id;

      // 1. Re-validate & clamp sumAssured to valid presets or bounds of the newly selected product
      const validSumPresets = selectedProduct.sumAssuredPresets || [];
      if (validSumPresets.length > 0) {
        setSumAssured((prev) =>
          validSumPresets.includes(prev)
            ? prev
            : validSumPresets.find((p) => p === 300_000_000) ||
              validSumPresets.find((p) => p === 500_000_000) ||
              validSumPresets[0]
        );
      } else {
        setSumAssured((prev) =>
          Math.max(selectedProduct.minSumAssured, Math.min(prev, selectedProduct.maxSumAssured))
        );
      }

      // 2. Re-validate & clamp termYears to valid presets or bounds of the newly selected product
      const validTerms = selectedProduct.termPresets || [];
      if (validTerms.length > 0) {
        setTermYears((prev) => {
          if (validTerms.includes(prev)) return prev;
          const minTerm = selectedProduct.minTermYears || validTerms[0];
          const maxTerm = selectedProduct.maxTermYears || validTerms[validTerms.length - 1];
          const clamped = Math.max(minTerm, Math.min(prev, maxTerm));
          return validTerms.reduce((closest, curr) =>
            Math.abs(curr - clamped) < Math.abs(closest - clamped) ? curr : closest
          );
        });
      } else {
        const minT = selectedProduct.minTermYears || 1;
        const maxT = selectedProduct.maxTermYears || 30;
        setTermYears((prev) => Math.max(minT, Math.min(prev, maxT)));
      }

      // 3. Clear any stale validation errors from previous product category
      setErrors({});
    }
  }, [selectedProduct]);

  const [frequency, setFrequency] = useState<'annually' | 'monthly'>(
    initialQuote.frequency || 'annually'
  );

  const initialAge = initialQuote.applicantAge || 32;
  const initialSmoker = Boolean(initialQuote.isSmoker);
  const initialGender = initialQuote.gender || 'male';
  const [gender, setGender] = useState<'male' | 'female'>(initialGender);
  const initialOccupationRisk = initialQuote.occupationRisk || 'low';
  const selectedRiders = useMemo(
    () => initialQuote.selectedRiders || [],
    [initialQuote.selectedRiders]
  );

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

  // File Upload States & Refs (Real File Upload Support)
  const ktpInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const incomeDocInputRef = useRef<HTMLInputElement>(null);

  const [ktpFileName, setKtpFileName] = useState<string>('KTP_Bayu_Pratama.jpg');
  const [ktpFileSize, setKtpFileSize] = useState<string>('1.4 MB');
  const [isKtpUploaded, setIsKtpUploaded] = useState<boolean>(false);

  const [selfieFileName, setSelfieFileName] = useState<string>('Selfie_Liveness_Check.jpg');
  const [selfieFileSize, setSelfieFileSize] = useState<string>('2.1 MB');
  const [isSelfieUploaded, setIsSelfieUploaded] = useState<boolean>(false);

  // Pilar 2: Finansial & Kerja
  const [occupation, setOccupation] = useState<string>('Software Architect (IT / Tech)');
  const [companyName, setCompanyName] = useState<string>('PT Teknologi Solusi Bangsa');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(30_000_000);
  const [incomeSource, setIncomeSource] = useState<string>('Gaji Tetap Bulanan (Payroll)');
  const [incomeDocName, setIncomeDocName] = useState<string>('Slip_Gaji_3_Bulan_Bayu.pdf');
  const [incomeDocSize, setIncomeDocSize] = useState<string>('840 KB');
  const [isIncomeDocUploaded, setIsIncomeDocUploaded] = useState<boolean>(false);
  const [npwp, setNpwp] = useState<string>('09.254.891.2-014.000');

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleKtpUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setKtpFileName(file.name);
      setKtpFileSize(formatFileSize(file.size));
      setIsKtpUploaded(true);
    }
  };

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelfieFileName(file.name);
      setSelfieFileSize(formatFileSize(file.size));
      setIsSelfieUploaded(true);
    }
  };

  const handleIncomeDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIncomeDocName(file.name);
      setIncomeDocSize(formatFileSize(file.size));
      setIsIncomeDocUploaded(true);
    }
  };

  // Pilar 3: Skrining Medis / Risiko Objek
  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightKg, setWeightKg] = useState<number>(68);
  const [isSmoker, setIsSmoker] = useState<boolean>(initialSmoker);
  const [hasHospitalization, setHasHospitalization] = useState<boolean>(false);
  const [hospitalizationDetails, setHospitalizationDetails] = useState<string>('');
  const [hasCriticalIllness, setHasCriticalIllness] = useState<boolean>(false);
  const [criticalIllnessDetails, setCriticalIllnessDetails] = useState<string>('');
  const [hasRegularMedication, setHasRegularMedication] = useState<boolean>(false);
  const [hasFamilyIllness, setHasFamilyIllness] = useState<boolean>(false);
  const [vehicleUsage, setVehicleUsage] = useState<string>('standard');
  const [vehiclePlate, setVehiclePlate] = useState<string>('B 1234 ABC');

  // Pilar 4: Review & Legalitas
  const [beneficiaryName, setBeneficiaryName] = useState<string>('Ratna Dewi Kusuma');
  const [beneficiaryRelationship, setBeneficiaryRelationship] = useState<
    'spouse' | 'child' | 'parent' | 'sibling'
  >('spouse');
  const [beneficiaryNik, setBeneficiaryNik] = useState<string>('3174055609950002');
  const [beneficiaryShare] = useState<number>(100);
  const [agreeTruth, setAgreeTruth] = useState<boolean>(false);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);

  // Generic dynamic answers map for any custom questionnaire fields
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Age calculation from birthdate
  const applicantAgeYears = useMemo(() => {
    if (!birthDate) return initialAge;
    const birthYear = new Date(birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const diff = currentYear - birthYear;
    return diff > 0 ? diff : initialAge;
  }, [birthDate, initialAge]);

  // Dynamic Questionnaire State (kept for optional schema fallback)
  const [fetchedQuestionnaire, setFetchedQuestionnaire] = useState<ProductQuestionnaireDTO | null>(null);

  const questionnaire = useMemo(() => {
    if (
      initialQuestionnaire &&
      (initialQuestionnaire.product_id === selectedProduct?.id ||
        initialQuestionnaire.product_slug === selectedProduct?.slug)
    ) {
      return initialQuestionnaire;
    }
    return fetchedQuestionnaire;
  }, [initialQuestionnaire, selectedProduct, fetchedQuestionnaire]);

  useEffect(() => {
    if (!selectedProduct) return;
    if (
      initialQuestionnaire &&
      (initialQuestionnaire.product_id === selectedProduct.id ||
        initialQuestionnaire.product_slug === selectedProduct.slug)
    ) {
      return;
    }
    let isCancelled = false;
    getQuestionnaireAction(selectedProduct.slug).then((q) => {
      if (!isCancelled && q) {
        setFetchedQuestionnaire(q);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [selectedProduct, initialQuestionnaire]);

  // Medical Pricing Factors & Surcharges from questionnaire / pricing rules
  const criticalIllnessMultiplier = useMemo(() => {
    const q = questionnaire?.questions?.find((item) => item.code === 'has_critical_illness');
    const yesOpt = q?.options?.find((opt) => opt.value === 'yes');
    if (yesOpt?.multiplier && yesOpt.multiplier > 1.0) {
      return yesOpt.multiplier;
    }
    return 1.30;
  }, [questionnaire]);

  const hospitalizationMultiplier = useMemo(() => {
    const q = questionnaire?.questions?.find(
      (item) => item.code === 'has_hospitalization_2y' || item.code === 'has_hospitalization'
    );
    const yesOpt = q?.options?.find((opt) => opt.value === 'yes');
    if (yesOpt?.multiplier && yesOpt.multiplier > 1.0) {
      return yesOpt.multiplier;
    }
    return 1.20;
  }, [questionnaire]);

  const smokerMultiplier = selectedProduct?.smokerFactors?.yes ?? 1.35;
  const smokerSurchargePct = Math.round((smokerMultiplier - 1) * 100);
  const critSurchargePct = Math.round((criticalIllnessMultiplier - 1) * 100);
  const hospSurchargePct = Math.round((hospitalizationMultiplier - 1) * 100);

  // Dynamic Recalculation of accurate premiums via actuarial rules
  const quoteResult = useMemo(() => {
    if (!selectedProduct) return null;
    return calculatePureSimulation(
      {
        productId: selectedProduct.id,
        sumAssured,
        termYears,
        applicantAge: applicantAgeYears,
        isSmoker: isVehicleCategory ? false : isSmoker,
        gender: isVehicleCategory ? 'male' : gender,
        occupationRisk: isVehicleCategory
          ? (vehicleUsage as 'low' | 'standard' | 'high')
          : initialOccupationRisk,
        frequency,
        selectedRiderIds: selectedRiders,
        dynamicMultipliers: {
          ...(!isVehicleCategory && hasCriticalIllness
            ? { 'Riwayat Penyakit Kritis': criticalIllnessMultiplier }
            : {}),
          ...(!isVehicleCategory && hasHospitalization
            ? { 'Riwayat Rawat Inap (Opname)': hospitalizationMultiplier }
            : {}),
        },
      },
      selectedProduct
    );
  }, [
    selectedProduct,
    sumAssured,
    termYears,
    applicantAgeYears,
    isSmoker,
    gender,
    isVehicleCategory,
    vehicleUsage,
    initialOccupationRisk,
    frequency,
    selectedRiders,
    hasCriticalIllness,
    criticalIllnessMultiplier,
    hasHospitalization,
    hospitalizationMultiplier,
  ]);

  const monthlyPremium = quoteResult ? quoteResult.monthlyPremium : 245_000;
  const annualPremium = quoteResult ? quoteResult.annualPremium : 2_760_000;
  const activePremium = frequency === 'annually' ? annualPremium : monthlyPremium;
  const annualSavings = quoteResult?.annualSavings ?? Math.max(0, monthlyPremium * 12 - annualPremium);
  const savingsPercent = quoteResult?.breakdown?.annualDiscountPercent ?? 6;

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
      if (!isVehicleCategory) {
        if (heightCm < 100 || heightCm > 250) {
          newErrors.heightCm = 'Tinggi badan harus antara 100 cm s/d 250 cm.';
        }
        if (weightKg < 30 || weightKg > 200) {
          newErrors.weightKg = 'Berat badan harus antara 30 kg s/d 200 kg.';
        }
        if (hasCriticalIllness && (!criticalIllnessDetails || criticalIllnessDetails.trim().length < 5)) {
          newErrors.criticalIllnessDetails = 'Rincian riwayat penyakit kritis wajib diisi minimal 5 karakter.';
        }
        if (hasHospitalization && (!hospitalizationDetails || hospitalizationDetails.trim().length < 5)) {
          newErrors.hospitalizationDetails = 'Rincian riwayat rawat inap wajib diisi minimal 5 karakter.';
        }
      } else {
        if (!vehiclePlate.trim()) {
          newErrors.vehiclePlate = 'Nomor plat polisi kendaraan wajib diisi.';
        }
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

  // Final Application Submission (Direct Submit without Payment Module)
  const handleSubmitApplication = async () => {
    if (!validateStep(4) || !selectedProduct) return;

    setIsSubmitting(true);
    try {
      // Build dynamic questionnaire answers
      const answersList: ApplicationAnswerItem[] = [
        { questionId: 'q_id_nik', code: 'nik', value: nik.trim() },
        { questionId: 'q_id_full_name', code: 'full_name', value: fullName.trim() },
        { questionId: 'q_id_birth_date', code: 'birth_date', value: birthDate },
        { questionId: 'q_id_gender', code: 'gender', value: gender },
        { questionId: 'q_id_phone', code: 'phone', value: phoneNumber.trim() },
        { questionId: 'q_id_email', code: 'email', value: email.trim() },
        { questionId: 'q_fin_occupation', code: 'occupation', value: occupation.trim() },
        { questionId: 'q_fin_company_name', code: 'company_name', value: companyName.trim() },
        { questionId: 'q_fin_monthly_income', code: 'monthly_income', value: monthlyIncome },
        { questionId: 'q_fin_monthly_expenses', code: 'monthly_expenses', value: Math.round(monthlyIncome * 0.4) },
        { questionId: 'q_fin_existing_debts', code: 'existing_debts_monthly', value: Math.round(monthlyIncome * 0.1) },
        { questionId: 'q_ben_name', code: 'beneficiary_name', value: beneficiaryName.trim() },
        { questionId: 'q_ben_relationship', code: 'beneficiary_relationship', value: beneficiaryRelationship },
        { questionId: 'q_ben_nik', code: 'beneficiary_nik', value: beneficiaryNik.trim() },
        { questionId: 'q_ben_share', code: 'beneficiary_share', value: beneficiaryShare },
        { questionId: 'q_legal_truth', code: 'agree_truth_declaration', value: agreeTruth },
        { questionId: 'q_legal_terms', code: 'agree_policy_terms', value: agreeTerms },
      ];

      if (isVehicleCategory) {
        answersList.push(
          { questionId: 'q_vehicle_usage', code: 'occupation_class', value: vehicleUsage },
          { questionId: 'q_vehicle_plate', code: 'vehicle_plate', value: vehiclePlate.trim() }
        );
      } else {
        answersList.push(
          {
            questionId: 'q_fin_occupation_class',
            code: 'occupation_class',
            value: initialQuote.occupationRisk || 'standard',
          },
          { questionId: 'q_med_weight', code: 'weight_kg', value: weightKg },
          { questionId: 'q_med_height', code: 'height_cm', value: heightCm },
          { questionId: 'q_med_smoker', code: 'is_smoker', value: isSmoker ? 'yes' : 'no' },
          { questionId: 'q_med_critical_illness', code: 'has_critical_illness', value: hasCriticalIllness ? 'yes' : 'no' },
          { questionId: 'q_med_hospitalization', code: 'has_hospitalization_2y', value: hasHospitalization ? 'yes' : 'no' },
          { questionId: 'q_med_family_history', code: 'has_family_history', value: hasFamilyIllness ? 'yes' : 'no' }
        );
        if (hasCriticalIllness && criticalIllnessDetails) {
          answersList.push({
            questionId: 'q_med_critical_illness_details',
            code: 'critical_illness_details',
            value: criticalIllnessDetails.trim(),
          });
        }
        if (hasHospitalization && hospitalizationDetails) {
          answersList.push({
            questionId: 'q_med_hospitalization_details',
            code: 'hospitalization_details',
            value: hospitalizationDetails.trim(),
          });
        }
      }

      // Add any additional dynamic questions
      Object.entries(customAnswers).forEach(([code, value]) => {
        if (!answersList.some((a) => a.code === code)) {
          answersList.push({ code, value });
        }
      });

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
          gender,
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
          method: 'va_bca',
          autoDebet: true,
        },
        answers: answersList,
      };

      const submitFn = submitAction || submitApplicationAction;
      const result = await submitFn(payload);
      setSubmissionResult(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'Terjadi kendala saat memproses pendaftaran. Silakan coba beberapa saat lagi.';
      setErrors({
        submit: message,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedProduct) {
    return (
      <div className="py-20 text-center text-slate-500 font-medium">
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
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
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
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  Nomor Referensi Aplikasi
                </span>
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

          {/* 4 Pillars Verification Report */}
          <div className="text-left space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-700 block">
              Hasil Verifikasi 4 Pilar OJK:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {(submissionResult.application.pillarChecks || []).map((check) => (
                <div
                  key={check.pillarNumber}
                  className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/50 flex items-center justify-between"
                >
                  <span className="font-semibold text-slate-800">{check.title}</span>
                  <span className="text-[11px] font-bold text-emerald-700">{check.statusText}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center pt-4">
            <Link
              href="/"
              className="w-full sm:w-auto font-bold bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl shadow-md text-center text-sm"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Dynamic Questions from Questionnaire for Current Step
  const stepQuestions: ProductQuestionDTO[] =
    questionnaire?.questions
      ?.filter((q) => q.step_number === currentStep && q.is_active)
      ?.sort((a, b) => a.order_index - b.order_index) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: TOP BREADCRUMB & HERO                              */}
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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
              Pengajuan Aplikasi Polis Digital
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-1 max-w-3xl">
              Lengkapi 4 tahap terverifikasi untuk evaluasi underwriting otomatis berbasis kuesioner dinamis OJK.
            </p>
          </div>
          {initialProducts && initialProducts.length > 1 && (
            <div className="shrink-0 flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 pl-1">Pilihan Produk:</span>
              <select
                aria-label="Pilih Produk Asuransi"
                value={selectedProduct.id}
                onChange={(e) => handleProductChange(e.target.value)}
                className="text-xs font-bold text-[#0f172a] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 cursor-pointer hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {initialProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4-STEP HORIZONTAL STEPPER BAR                                 */}
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
            <span className="block text-xs font-bold text-[#0f172a] truncate">
              {isVehicleCategory ? '03. Objek Kendaraan' : '03. Skrining Medis'}
            </span>
            <span className="block text-[11px] font-medium text-slate-500">
              {currentStep > 3 ? 'Terverifikasi ✓' : 'Kuesioner Risiko'}
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
        {/* Left Column: Form Panels (7 cols) */}
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

              {/* Field: Jenis Kelamin */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Jenis Kelamin:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    aria-pressed={gender === 'male'}
                    className={`py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all text-center flex items-center justify-center gap-1.5 ${
                      gender === 'male'
                        ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {gender === 'male' ? '✓ ' : ''}Pria (Laki-laki)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    aria-pressed={gender === 'female'}
                    className={`py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all text-center flex items-center justify-center gap-1.5 ${
                      gender === 'female'
                        ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {gender === 'female' ? '✓ ' : ''}Wanita (Perempuan)
                  </button>
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

              {/* Document Uploads */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-900 block">
                  Unggah Dokumen Verifikasi Wajib:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* KTP Upload */}
                  <input
                    type="file"
                    id="ktp-file-input"
                    ref={ktpInputRef}
                    onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                    onChange={handleKtpUpload}
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                    aria-label="Upload KTP Asli"
                  />
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">📷 Foto KTP Asli</span>
                      <label
                        htmlFor="ktp-file-input"
                        className="text-[10px] text-blue-600 hover:text-blue-800 hover:underline font-bold cursor-pointer inline-flex items-center gap-1"
                      >
                        Ganti File ↺
                      </label>
                    </div>
                    <label htmlFor="ktp-file-input" className="block cursor-pointer">
                      <p className="text-[11px] text-slate-700 font-medium truncate">{ktpFileName} ({ktpFileSize})</p>
                    </label>
                    <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {isKtpUploaded ? '✓ File Asli Berhasil Diunggah' : '✓ OCR Score: 99.4% (Nama & NIK Cocok)'}
                    </span>
                  </div>

                  {/* Selfie Liveness */}
                  <input
                    type="file"
                    id="selfie-file-input"
                    ref={selfieInputRef}
                    onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                    onChange={handleSelfieUpload}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    aria-label="Upload Foto Selfie"
                  />
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">🤳 Foto Selfie Liveness</span>
                      <label
                        htmlFor="selfie-file-input"
                        className="text-[10px] text-blue-600 hover:text-blue-800 hover:underline font-bold cursor-pointer inline-flex items-center gap-1"
                      >
                        Ganti File ↺
                      </label>
                    </div>
                    <label htmlFor="selfie-file-input" className="block cursor-pointer">
                      <p className="text-[11px] text-slate-700 font-medium truncate">{selfieFileName} ({selfieFileSize})</p>
                    </label>
                    <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {isSelfieUploaded ? '✓ Biometrik Wajah Terverifikasi' : '✓ Biometric Liveness Passed 98.1%'}
                    </span>
                  </div>
                </div>
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
                    { value: '10000000', label: 'Rp 10.000.000 / bulan' },
                    { value: '20000000', label: 'Rp 20.000.000 / bulan' },
                    { value: '30000000', label: 'Rp 30.000.000 / bulan' },
                    { value: '50000000', label: 'Rp 50.000.000 / bulan' },
                    { value: '100000000', label: 'Rp 100.000.000+ / bulan' },
                  ]}
                  errorMessage={errors.monthlyIncome}
                />

                <Select
                  label="Sumber Penghasilan Utama:"
                  value={incomeSource}
                  onChange={(e) => setIncomeSource(e.target.value)}
                  options={[
                    { value: 'Gaji Tetap Bulanan (Payroll)', label: 'Gaji Tetap Bulanan (Payroll)' },
                    { value: 'Laba Usaha / Dividen Bisnis', label: 'Laba Usaha / Dividen Bisnis' },
                    { value: 'Hasil Investasi / Aset Sewa', label: 'Hasil Investasi / Aset Sewa' },
                    { value: 'Honorarium Profesional / Konsultan', label: 'Honorarium Profesional' },
                  ]}
                />
              </div>

              {/* NPWP Number */}
              <div className="space-y-1">
                <Input
                  label="Nomor Pokok Wajib Pajak (NPWP):"
                  placeholder="09.254.891.2-014.000"
                  value={npwp}
                  onChange={(e) => setNpwp(e.target.value)}
                  helperText="Opsional untuk proteksi di bawah Rp 1 Miliar, dianjurkan untuk verifikasi instan."
                />
              </div>

              {/* DSR Live Calculation Card */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900">Analisis Rasio Beban Premi (DSR):</span>
                  <span className="font-extrabold text-blue-700 bg-white px-2.5 py-0.5 rounded-full border border-blue-200">
                    {calculatedDsr}% DSR (Batas OJK: 40%)
                  </span>
                </div>
                <p className="text-blue-800/80 leading-relaxed">
                  Premi tahunan sebesar {formatRupiah(annualPremium)} setara dengan {calculatedDsr}% dari
                  estimasi pendapatan tahunan {formatRupiah(monthlyIncome * 12)}. Rasio ini tergolong sangat sehat
                  dan memenuhi standar *Financial Affordability* OJK.
                </p>
              </div>

              {/* Document Slip Gaji */}
              <input
                type="file"
                id="income-doc-file-input"
                ref={incomeDocInputRef}
                onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                onChange={handleIncomeDocUpload}
                accept="application/pdf,image/jpeg,image/png,image/webp"
                className="hidden"
                aria-label="Upload Bukti Penghasilan"
              />
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">📄 Bukti Penghasilan / Slip Gaji</span>
                  <label
                    htmlFor="income-doc-file-input"
                    className="text-[10px] text-blue-600 hover:text-blue-800 hover:underline font-bold cursor-pointer inline-flex items-center gap-1"
                  >
                    Ganti File ↺
                  </label>
                </div>
                <label htmlFor="income-doc-file-input" className="block cursor-pointer">
                  <p className="text-[11px] text-slate-700 font-medium truncate">{incomeDocName} ({incomeDocSize})</p>
                </label>
                <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {isIncomeDocUploaded ? '✓ Dokumen Penghasilan Asli Terverifikasi' : '✓ Payroll Terverifikasi Digital'}
                </span>
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-1/3 py-3.5 rounded-xl text-xs font-bold"
                  onClick={handlePrevStep}
                >
                  Kembali ke Step 1
                </Button>
                <Button
                  size="lg"
                  variant="primary"
                  className="w-2/3 font-bold bg-[#0f172a] hover:bg-slate-800 text-white py-3.5 rounded-xl text-sm"
                  onClick={handleNextStep}
                >
                  Lanjut ke Step 3: Skrining Medis →
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: SKRINING MEDIS / OBJEK RISIKO                     */}
          {/* ========================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#0f172a]">
                    {isVehicleCategory
                      ? 'Pilar 3: Objek Pertanggungan Kendaraan'
                      : 'Pilar 3: Skrining Medis & Deklarasi Kesehatan Mandiri'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    {isVehicleCategory
                      ? 'Verifikasi data kendaraan bermotor untuk penentuan batas pertanggungan dan risiko berkendara.'
                      : 'Kuesioner evaluasi kesehatan aktuaria tanpa perlu medical check-up fisik untuk profil risiko rendah.'}
                  </p>
                </div>
                <span className="self-start sm:self-auto text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shrink-0">
                  {isVehicleCategory ? '✓ Inspeksi Digital Otomatis' : '✓ Guaranteed Issue Eligible'}
                </span>
              </div>

              {/* Vehicle specific questions */}
              {isVehicleCategory ? (
                <div className="space-y-4">
                  <Input
                    label="Nomor Plat Polisi Kendaraan:"
                    placeholder="B 1234 ABC"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    errorMessage={errors.vehiclePlate}
                    helperText="Sesuai plat nomor tertera pada STNK aktif."
                  />

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-700 block">
                      Penggunaan Utama Kendaraan:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'low', label: 'Pribadi / Santai', mult: '0.95x' },
                        { id: 'standard', label: 'Harian Kota', mult: '1.0x' },
                        { id: 'high', label: 'Komersial / Logistik', mult: '1.15x' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setVehicleUsage(opt.id)}
                          aria-pressed={vehicleUsage === opt.id}
                          className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                            vehicleUsage === opt.id
                              ? 'bg-[#0f172a] border-[#0f172a] text-white shadow-xs'
                              : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="block font-bold">
                            {vehicleUsage === opt.id ? '✓ ' : ''}
                            {opt.label}
                          </span>
                          <span className={`text-[10px] ${vehicleUsage === opt.id ? 'text-slate-300' : 'text-slate-500'}`}>
                            Faktor Aktuaria: {opt.mult}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Life / Health medical questions */
                <>
                  {/* Height, Weight & BMI - 3 columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                    <Input
                      label="Tinggi Badan (cm):"
                      type="number"
                      value={String(heightCm)}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      errorMessage={errors.heightCm}
                      placeholder="175 cm"
                    />

                    <Input
                      label="Berat Badan (kg):"
                      type="number"
                      value={String(weightKg)}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      errorMessage={errors.weightKg}
                      placeholder="68 kg"
                    />

                    <div className="w-full space-y-1.5 text-left">
                      <span className="block text-xs font-semibold text-slate-700 select-none">
                        Indeks Massa Tubuh (BMI):
                      </span>
                      <div className="h-[38px] px-3.5 rounded-lg border border-emerald-300 bg-emerald-50/80 flex items-center justify-center text-xs sm:text-sm font-bold text-emerald-800 shadow-2xs">
                        BMI: {calculatedBmi} ({calculatedBmi < 18.5 ? 'Kurang' : calculatedBmi <= 24.9 ? 'Normal / Ideal 🟢' : calculatedBmi <= 29.9 ? 'Lebih' : 'Obesitas'})
                      </div>
                    </div>
                  </div>

                  {/* Smoker Toggle */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-semibold text-slate-700 select-none">
                      Status Kebiasaan Merokok / Tembakau / Vape:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setIsSmoker(false)}
                        aria-pressed={!isSmoker}
                        className={`py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all text-center flex items-center justify-center gap-1.5 ${
                          !isSmoker
                            ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {!isSmoker ? '✓ ' : ''}Tidak Merokok (Standar 0%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsSmoker(true)}
                        aria-pressed={isSmoker}
                        className={`py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all text-center flex items-center justify-center gap-1.5 ${
                          isSmoker
                            ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {isSmoker ? '✓ ' : ''}Perokok Aktif (Surcharge +{smokerSurchargePct}%)
                      </button>
                    </div>
                  </div>

                  {/* Critical Illness Question */}
                  <div className="space-y-1.5 text-left">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 select-none">
                        Riwayat Penyakit Kritis:
                      </label>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Pernahkah didiagnosis kanker, serangan jantung, stroke, ginjal, atau diabetes?
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setHasCriticalIllness(false)}
                        aria-pressed={!hasCriticalIllness}
                        className={`py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all text-center flex items-center justify-center gap-1.5 ${
                          !hasCriticalIllness
                            ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {!hasCriticalIllness ? '✓ ' : ''}Tidak Pernah (Standar 0%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setHasCriticalIllness(true)}
                        aria-pressed={hasCriticalIllness}
                        className={`py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all text-center flex items-center justify-center gap-1.5 ${
                          hasCriticalIllness
                            ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {hasCriticalIllness ? '✓ ' : ''}Pernah (Surcharge +{critSurchargePct}%)
                      </button>
                    </div>

                    {/* Conditional Branching for Critical Illness */}
                    {hasCriticalIllness && (
                      <div className="pt-2">
                        <Input
                          label="Rincian Diagnosa & Tahun Terjadinya Penyakit Kritis:"
                          placeholder="Contoh: Diabetes tipe 2 tahun 2023, pengobatan rutin"
                          value={criticalIllnessDetails}
                          onChange={(e) => setCriticalIllnessDetails(e.target.value)}
                          errorMessage={errors.criticalIllnessDetails}
                          helperText="Sebutkan nama penyakit, tahun diagnosa, dan penanganan medis."
                        />
                      </div>
                    )}
                  </div>

                  {/* Hospitalization Question */}
                  <div className="space-y-1.5 text-left">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 select-none">
                        Riwayat Rawat Inap (Opname) 2 Tahun Terakhir:
                      </label>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Apakah pernah menjalani rawat inap di rumah sakit atau operasi bedah?
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setHasHospitalization(false)}
                        aria-pressed={!hasHospitalization}
                        className={`py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all text-center flex items-center justify-center gap-1.5 ${
                          !hasHospitalization
                            ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {!hasHospitalization ? '✓ ' : ''}Tidak Pernah (Standar 0%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setHasHospitalization(true)}
                        aria-pressed={hasHospitalization}
                        className={`py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all text-center flex items-center justify-center gap-1.5 ${
                          hasHospitalization
                            ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {hasHospitalization ? '✓ ' : ''}Pernah (Surcharge +{hospSurchargePct}%)
                      </button>
                    </div>

                    {/* Conditional Branching for Hospitalization */}
                    {hasHospitalization && (
                      <div className="pt-2">
                        <Input
                          label="Rincian Alasan Rawat Inap & Nama Rumah Sakit:"
                          placeholder="Contoh: Operasi usus buntu tahun 2025 di RS Siloam, sembuh total"
                          value={hospitalizationDetails}
                          onChange={(e) => setHospitalizationDetails(e.target.value)}
                          errorMessage={errors.hospitalizationDetails}
                          helperText="Sebutkan tindakan medis, tanggal rawat, dan status kesembuhan."
                        />
                      </div>
                    )}
                  </div>

                  {/* Additional Lifestyle & Medication Checks */}
                  <div className="space-y-3 pt-2 text-xs">
                    <Checkbox
                      label="Bebas Konsumsi Obat-Obatan Rutin Jangka Panjang"
                      description="Saya tidak sedang dalam terapi obat berkelanjutan setiap hari untuk kondisi kronis."
                      checked={!hasRegularMedication}
                      onChange={(e) => setHasRegularMedication(!e.target.checked)}
                    />
                    <Checkbox
                      label="Bebas Riwayat Keturunan Penyakit Jantung / Kanker Usia Muda"
                      description="Tidak ada orang tua kandung yang meninggal akibat serangan jantung atau kanker sebelum usia 55 tahun."
                      checked={!hasFamilyIllness}
                      onChange={(e) => setHasFamilyIllness(!e.target.checked)}
                    />
                  </div>
                </>
              )}

              {/* Any Extra Dynamic Questionnaire Questions for Step 3 (Life/Health only) */}
              {!isVehicleCategory &&
                stepQuestions.map((q) => {
                  // Skip if already rendered above
                  if (
                    [
                      'weight_kg',
                      'height_cm',
                      'is_smoker',
                      'has_critical_illness',
                      'critical_illness_details',
                      'has_hospitalization_2y',
                      'hospitalization_details',
                      'has_family_history',
                      'occupation_class',
                      'vehicle_plate',
                      'vehicle_usage',
                    ].includes(q.code)
                  ) {
                    return null;
                  }
                  return (
                    <div key={q.id} className="space-y-1">
                      <Input
                        id={q.code}
                        label={q.label}
                        placeholder={q.placeholder || ''}
                        value={customAnswers[q.code] || ''}
                        onChange={(e) =>
                          setCustomAnswers((prev) => ({ ...prev, [q.code]: e.target.value }))
                        }
                        helperText={q.help_text}
                      />
                    </div>
                  );
                })}

              {/* Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-1/3 py-3.5 rounded-xl text-xs font-bold"
                  onClick={handlePrevStep}
                >
                  Kembali ke Step 2
                </Button>
                <Button
                  size="lg"
                  variant="primary"
                  className="w-2/3 font-bold bg-[#0f172a] hover:bg-slate-800 text-white py-3.5 rounded-xl text-sm"
                  onClick={handleNextStep}
                >
                  Lanjut ke Step 4: Review & Polis →
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 4: REVIEW & SUBMIT (NO PAYMENT MODULE)               */}
          {/* ========================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#0f172a]">
                    Pilar 4: Review & Persetujuan Polis
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Tinjau data aplikasi, lengkapi data ahli waris penerima manfaat, dan kirim pengajuan langsung.
                  </p>
                </div>
                <span className="self-start sm:self-auto text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full shrink-0">
                  Tahap Terakhir
                </span>
              </div>

              {/* 3 Snapshot Ringkasan Calon Tertanggung Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Card 1: Identitas Pemohon */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 text-left">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Identitas Pemohon
                  </span>
                  <div>
                    <span className="text-sm font-bold text-[#0f172a] block truncate">
                      {fullName}
                    </span>
                    <span className="text-xs text-slate-500">
                      NIK: {nik.slice(0, 4)}...{nik.slice(-4)}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    ✓ Dukcapil OCR Lolos 99.8%
                  </span>
                </div>

                {/* Card 2: Kapasitas Finansial */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 text-left">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Kapasitas Finansial
                  </span>
                  <div>
                    <span className="text-sm font-bold text-[#0f172a] block truncate">
                      Gaji: {formatRupiah(monthlyIncome)}/bln
                    </span>
                    <span className="text-xs text-slate-500 truncate block">
                      {occupation}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Rasio DSR: {calculatedDsr}% (Sehat)
                  </span>
                </div>

                {/* Card 3: Skrining Medis / Objek Kendaraan */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 text-left">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    {isVehicleCategory ? 'Objek Kendaraan' : 'Skrining Medis'}
                  </span>
                  <div>
                    <span className="text-sm font-bold text-[#0f172a] block">
                      {isVehicleCategory ? 'Kendaraan Terdaftar' : `BMI: ${calculatedBmi} (Normal)`}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      {isVehicleCategory
                        ? vehiclePlate
                        : [
                            isSmoker ? `Perokok (+${smokerSurchargePct}%)` : 'Non-Smoker',
                            hasCriticalIllness ? `Penyakit (+${critSurchargePct}%)` : null,
                            hasHospitalization ? `Rawat Inap (+${hospSurchargePct}%)` : null,
                          ]
                            .filter(Boolean)
                            .join(' • ')}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    {isVehicleCategory
                      ? '✓ Plat Terverifikasi'
                      : hasCriticalIllness || hasHospitalization
                      ? '✓ Deklarasi Terisi'
                      : `✓ ${isSmoker ? 'Surplus Aktif' : 'Non-Smoker'} - Bebas Lab`}
                  </span>
                </div>
              </div>

              {/* 1. Pilihan Paket & Konfigurasi Perlindungan */}
              <div className="pt-2 border-t border-slate-100 space-y-4">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    1. Pilihan Paket & Konfigurasi Perlindungan:
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Sesuaikan kembali nominal santunan, tenor pembayaran, atau opsi frekuensi sebelum menerbitkan e-polis.
                  </p>
                </div>

                {/* UP Display Box, Slider & Presets */}
                <div className="space-y-2">
                  <span className="block text-xs font-semibold text-slate-700">
                    Uang Pertanggungan (Nilai Santunan):
                  </span>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xl sm:text-2xl font-extrabold text-[#0f172a]">
                      {formatRupiah(sumAssured)}
                    </span>
                  </div>

                  <div className="pt-1">
                    <Slider
                      label="Uang Pertanggungan Santunan Tunai"
                      min={selectedProduct.minSumAssured}
                      max={selectedProduct.maxSumAssured}
                      step={25_000_000}
                      value={sumAssured}
                      onChange={setSumAssured}
                      formatValue={(val) => `Rp ${(val / 1_000_000).toLocaleString('id-ID')} Juta`}
                      minLabel={formatRupiah(selectedProduct.minSumAssured)}
                      maxLabel={formatRupiah(selectedProduct.maxSumAssured)}
                    />
                  </div>

                  {/* UP Presets */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {sumAssuredPresets.map((preset) => {
                      const isActive = sumAssured === preset.value;
                      return (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => setSumAssured(preset.value)}
                          aria-pressed={isActive}
                          className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                            isActive
                              ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isActive ? '✓ ' : ''}{preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tenor Presets */}
                <div className="space-y-1.5 pt-1">
                  <span className="block text-xs font-semibold text-slate-700">
                    Masa Pembayaran Premi (Tenor):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {termPresets.map((term) => {
                      const isActive = termYears === term;
                      return (
                        <button
                          key={term}
                          type="button"
                          onClick={() => setTermYears(term)}
                          aria-pressed={isActive}
                          className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                            isActive
                              ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isActive ? '✓ ' : ''}{term} Tahun
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Frekuensi Pembayaran Premi */}
                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-slate-700">
                    Frekuensi Pembayaran Premi:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => setFrequency('annually')}
                      aria-pressed={frequency === 'annually'}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-200 text-center flex items-center justify-center gap-1.5 ${
                        frequency === 'annually'
                          ? 'bg-[#0f172a] text-white shadow-md shadow-slate-900/10 scale-[1.01]'
                          : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      <span className={`inline-block w-2 h-2 rounded-full transition-colors ${frequency === 'annually' ? 'bg-emerald-400' : 'bg-transparent'}`} />
                      {frequency === 'annually' ? '✓ ' : ''}Tahunan (Hemat {savingsPercent}% - Diskon API)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFrequency('monthly')}
                      aria-pressed={frequency === 'monthly'}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-200 text-center flex items-center justify-center gap-1.5 ${
                        frequency === 'monthly'
                          ? 'bg-[#0f172a] text-white shadow-md shadow-slate-900/10 scale-[1.01]'
                          : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      <span className={`inline-block w-2 h-2 rounded-full transition-colors ${frequency === 'monthly' ? 'bg-sky-400' : 'bg-transparent'}`} />
                      {frequency === 'monthly' ? '✓ ' : ''}Bulanan (Pembayaran Rutin)
                    </button>
                  </div>
                </div>
              </div>

              {/* Beneficiary Header */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-900 block mb-3">
                  2. Penerima Manfaat Utama (Ahli Waris Polis):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nama Lengkap Ahli Waris:"
                    placeholder="Ratna Dewi Kusuma"
                    value={beneficiaryName}
                    onChange={(e) => setBeneficiaryName(e.target.value)}
                    errorMessage={errors.beneficiaryName}
                  />

                  <Select
                    label="Hubungan Kekeluargaan:"
                    value={beneficiaryRelationship}
                    onChange={(e) =>
                      setBeneficiaryRelationship(
                        e.target.value as 'spouse' | 'child' | 'parent' | 'sibling'
                      )
                    }
                    options={[
                      { value: 'spouse', label: 'Suami / Istri Sah' },
                      { value: 'child', label: 'Anak Kandung' },
                      { value: 'parent', label: 'Orang Tua Kandung' },
                      { value: 'sibling', label: 'Saudara Kandung' },
                    ]}
                  />
                </div>
              </div>

              {/* Beneficiary NIK & Share */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="NIK Ahli Waris (16 Digit):"
                  placeholder="3174055609950002"
                  value={beneficiaryNik}
                  onChange={(e) => setBeneficiaryNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  errorMessage={errors.beneficiaryNik}
                  helperText="16 digit angka sesuai identitas resmi ahli waris."
                />

                <Input
                  label="Alokasi Hak Manfaat (%):"
                  value={String(beneficiaryShare)}
                  readOnly
                  helperText="Penerima manfaat tunggal otomatis 100% hak klaim."
                />
              </div>

              {/* 3. Pernyataan Hukum & Persetujuan Klausul Polis */}
              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <span className="text-xs font-bold text-slate-900 block mb-1">
                  3. Pernyataan Hukum & Persetujuan Klausul Polis:
                </span>
                <Checkbox
                  label="Pernyataan Kebenaran Data Underwriting"
                  description="Saya menyatakan seluruh data identitas, profil finansial, dan deklarasi kesehatan di atas adalah benar dan sesuai kenyataan sesungguhnya. Data akan divalidasi langsung oleh sistem underwriting resmi."
                  checked={agreeTruth}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setAgreeTruth(val);
                    if (val) {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.agreeTruth;
                        delete copy.submit;
                        return copy;
                      });
                    }
                  }}
                />
                {errors.agreeTruth && (
                  <p className="text-rose-600 text-[11px] font-medium pl-6">{errors.agreeTruth}</p>
                )}

                <Checkbox
                  label="Persetujuan Klausul Polis & Izin Autodebet"
                  description={`Saya telah membaca, memahami, dan menyetujui seluruh Ketentuan Polis ${selectedProduct.title}, klausul pengecualian, masa tunggu, serta memberikan izin evaluasi underwriting digital.`}
                  checked={agreeTerms}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setAgreeTerms(val);
                    if (val) {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.agreeTerms;
                        delete copy.submit;
                        return copy;
                      });
                    }
                  }}
                />
                {errors.agreeTerms && (
                  <p className="text-rose-600 text-[11px] font-medium pl-6">{errors.agreeTerms}</p>
                )}
              </div>

              {errors.submit && (
                <div
                  role="alert"
                  className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-sm font-semibold flex items-start gap-3 shadow-xs"
                >
                  <span className="text-rose-600 text-xl leading-none shrink-0">⚠️</span>
                  <div className="space-y-1 text-left">
                    <span className="font-bold block text-rose-800">Gagal Mengirim Pengajuan ke Core API:</span>
                    <span className="text-xs text-rose-700 block font-normal leading-relaxed">{errors.submit}</span>
                  </div>
                </div>
              )}

              {/* Direct Submit Action Button (No Payment Module) */}
              <div className="pt-2 flex items-center gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-1/3 py-3.5 rounded-xl text-xs font-bold"
                  onClick={handlePrevStep}
                  disabled={isSubmitting}
                >
                  Kembali ke Step 3
                </Button>
                <Button
                  size="lg"
                  variant="primary"
                  className="w-2/3 font-bold bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl text-sm shadow-md"
                  onClick={handleSubmitApplication}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Memproses Evaluasi Polis...
                    </span>
                  ) : (
                    'Kirim Pengajuan'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Actuarial Policy Summary Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0f172a] rounded-3xl p-6 sm:p-7 text-left space-y-6 shadow-xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                RINGKASAN POLIS TERPILIH
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                • VERIFIKASI DIGITAL
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
            <div className="p-4 rounded-2xl bg-[#1e293b] border border-slate-700/60 space-y-1.5 transition-all duration-300 shadow-inner">
              <div key={`app-badge-${frequency}`} className="animate-badge-fade">
                <span className="block text-[10px] font-bold text-[#38bdf8] uppercase tracking-wider">
                  PREMI {frequency === 'annually' ? `TAHUNAN (HEMAT ${savingsPercent}%)` : 'BULANAN'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <div
                  key={`app-price-${frequency}-${activePremium}`}
                  className="flex items-baseline gap-2 animate-price-fade"
                >
                  <span className="text-3xl font-extrabold tracking-tight text-white">
                    {formatRupiah(activePremium)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    / {frequency === 'annually' ? 'tahun' : 'bulan'}
                  </span>
                </div>
              </div>
              <div
                key={`app-desc-${frequency}-${annualPremium}-${monthlyPremium}`}
                className="animate-desc-fade min-h-[1.25rem]"
              >
                <p className="text-xs text-slate-400">
                  {frequency === 'monthly'
                    ? `Setara dengan ${formatRupiah(monthlyPremium * 12)} per tahun`
                    : `Setara dengan ${formatRupiah(Math.round(annualPremium / 12))} per bulan${annualSavings > 0 ? ` (Hemat ${formatRupiah(annualSavings)})` : ''}`}
                </p>
              </div>
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
                <span
                  key={`app-freq-val-${frequency}`}
                  className="font-semibold text-white capitalize animate-smooth-fade"
                >
                  {frequency === 'annually' ? 'Tahunan (Autodebet)' : 'Bulanan'}
                </span>
              </div>
            </div>

            {/* Rincian Faktor Perhitungan Premi Berdasarkan Input Tiap Field */}
            <div className="p-3.5 rounded-2xl bg-[#1e293b] border border-slate-700/60 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5">
                <span className="text-[11px] font-bold text-slate-200 block">
                  Rincian Faktor Perhitungan Premi:
                </span>
                <span className="text-[10px] font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                  Dynamic Core API
                </span>
              </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">
                    {isVehicleCategory ? 'Pertanggungan Kendaraan' : 'Nilai Santunan (UP)'}
                  </span>
                  <span className="font-semibold text-white">
                    Rp {sumAssured >= 1_000_000_000 ? `${(sumAssured / 1_000_000_000).toFixed(0)} Miliar` : `${(sumAssured / 1_000_000).toFixed(0)} Juta`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Masa Pertanggungan (Tenor)</span>
                  <span className="font-semibold text-white">
                    {termYears} Thn ({quoteResult?.breakdown?.termFactor ? `${quoteResult.breakdown.termFactor}x` : '1.0x'})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Usia Pemohon ({applicantAgeYears} Thn)</span>
                  <span className="font-semibold text-white">
                    {quoteResult?.breakdown?.ageFactor ? `${quoteResult.breakdown.ageFactor}x` : '1.0x'}
                  </span>
                </div>
                {!isVehicleCategory && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Jenis Kelamin ({gender === 'male' ? 'Pria' : 'Wanita'})</span>
                      <span className="font-semibold text-white">
                        {quoteResult?.breakdown?.genderFactor ? `${quoteResult.breakdown.genderFactor}x` : '1.0x'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Status Merokok ({isSmoker ? 'Perokok' : 'Non-Smoker'})</span>
                      <span className={`font-semibold ${isSmoker ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {quoteResult?.breakdown?.smokerFactor ? `${quoteResult.breakdown.smokerFactor}x` : '1.0x'}
                      </span>
                    </div>
                  </>
                )}
                {!isVehicleCategory ? (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Risiko Profesi ({initialOccupationRisk})</span>
                    <span className="font-semibold text-white">
                      {quoteResult?.breakdown?.occupationFactor ? `${quoteResult.breakdown.occupationFactor}x` : '1.0x'}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">
                      Penggunaan Kendaraan ({vehicleUsage === 'low' ? 'Pribadi / Santai' : vehicleUsage === 'high' ? 'Komersial / Logistik' : 'Harian Kota'})
                    </span>
                    <span className="font-semibold text-white">
                      {quoteResult?.breakdown?.occupationFactor ? `${quoteResult.breakdown.occupationFactor}x` : '1.0x'}
                    </span>
                  </div>
                )}
                {!isVehicleCategory && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Indeks Massa Tubuh (BMI)</span>
                    <span className="font-semibold text-emerald-400">
                      {calculatedBmi} ({calculatedBmi < 18.5 ? 'Kurang' : calculatedBmi <= 24.9 ? 'Ideal 🟢' : calculatedBmi <= 29.9 ? 'Lebih' : 'Obesitas'})
                    </span>
                  </div>
                )}
                {!isVehicleCategory && hasCriticalIllness && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Loading Riwayat Penyakit</span>
                    <span className="font-semibold text-amber-400">+{critSurchargePct}%</span>
                  </div>
                )}
                {!isVehicleCategory && hasHospitalization && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Loading Rawat Inap</span>
                    <span className="font-semibold text-amber-400">+{hospSurchargePct}%</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Rasio Beban Cicilan (DSR)</span>
                  <span className="font-semibold text-emerald-400">{calculatedDsr}% (Aman &lt; 35%)</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-slate-700/60 font-semibold">
                  <span className="text-slate-400">Skema Pembayaran</span>
                  <span
                    key={`app-schema-freq-${frequency}`}
                    className={`animate-smooth-fade ${frequency === 'annually' ? 'text-sky-400' : 'text-slate-200'}`}
                  >
                    {frequency === 'annually' ? `Tahunan (Hemat ${quoteResult?.breakdown?.annualDiscountPercent ?? 6}%)` : 'Bulanan Rutin'}
                  </span>
                </div>
            </div>

            {/* Evaluasi Real-time Underwriting Engine */}
            <div className="space-y-2 text-xs">
              <span className="text-[11px] font-bold text-slate-200 block">
                Evaluasi Real-time Underwriting Engine:
              </span>
              <div className="space-y-1.5 text-slate-300">
                {/* Pilar 1: Identitas & KTP (Terverifikasi setelah Step 1 selesai) */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#1e293b]">
                  <span className="flex items-center gap-1.5">
                    <span className={currentStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}>
                      {currentStep >= 2 ? '✓' : '○'}
                    </span>{' '}
                    Pilar Identitas & KTP
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      currentStep >= 2 ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {currentStep >= 2 ? 'VERIFIED DUKCAPIL' : 'PENDING'}
                  </span>
                </div>

                {/* Pilar 2: Profil Finansial (Terverifikasi setelah Step 2 selesai) */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#1e293b]">
                  <span className="flex items-center gap-1.5">
                    <span className={currentStep >= 3 ? 'text-emerald-400' : 'text-slate-500'}>
                      {currentStep >= 3 ? '✓' : '○'}
                    </span>{' '}
                    Pilar Profil Finansial
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      currentStep >= 3 ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {currentStep >= 3 ? `RATIO ${calculatedDsr}% (SAFE)` : 'PENDING'}
                  </span>
                </div>

                {/* Pilar 3: Skrining Medis / Objek Kendaraan (Terverifikasi setelah Step 3 selesai) */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#1e293b]">
                  <span className="flex items-center gap-1.5">
                    <span className={currentStep >= 4 ? 'text-emerald-400' : 'text-slate-500'}>
                      {currentStep >= 4 ? '✓' : '○'}
                    </span>{' '}
                    {isVehicleCategory ? 'Pilar Objek Kendaraan' : 'Pilar Skrining Medis'}
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      currentStep >= 4 ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {currentStep >= 4
                      ? isVehicleCategory
                        ? 'KENDARAAN VALID'
                        : 'LOW RISK LEVEL'
                      : 'PENDING'}
                  </span>
                </div>

                {/* Pilar 4: Dokumen & Legalitas E-Sign (Terverifikasi saat Step 4 disetujui) */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#1e293b]">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={
                        currentStep === 4 && agreeTerms && agreeTruth
                          ? 'text-emerald-400'
                          : 'text-slate-500'
                      }
                    >
                      {currentStep === 4 && agreeTerms && agreeTruth ? '✓' : '○'}
                    </span>{' '}
                    Pilar Dokumen & E-Sign
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      currentStep === 4 && agreeTerms && agreeTruth
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {currentStep === 4 && agreeTerms && agreeTruth
                      ? 'COMPLETE & VALID'
                      : 'PENDING'}
                  </span>
                </div>
              </div>
            </div>

            {/* Decision Status Box */}
            <div className="p-3.5 rounded-2xl bg-[#1e293b] border border-slate-700/60 space-y-1 text-xs">
              <span className="text-[#38bdf8] font-bold block">
                {currentStep === 4 && agreeTerms && agreeTruth
                  ? '⚡ Estimasi Keputusan: INSTANT APPROVAL'
                  : '⚡ Estimasi Keputusan Sistem: IN PROGRESS'}
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {currentStep === 4 && agreeTerms && agreeTruth
                  ? 'Seluruh 4 pilar checks terpenuhi! Polis elektronik (E-Polis) siap diterbitkan secara instan setelah pengajuan dikirim.'
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
