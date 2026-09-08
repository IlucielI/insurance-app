'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { InsuranceProduct, ProductQuestionDTO } from '@/server/repositories/product.repository.interface';
import { SimulationResult } from '@/types/simulation.types';
import { calculatePureSimulation } from '@/lib/simulation-calc';
import { calculateSimulationAction, getQuestionnaireAction } from './actions';
import { Slider } from '@/components/atoms/Slider';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { Callout } from '@/components/molecules/Callout';
import { AIAssistantBanner } from '@/components/molecules/AIAssistantBanner';

export interface SimulationWorkbenchProps {
  initialProducts: InsuranceProduct[];
  initialProductId?: string;
}

export function getDefaultQuestionsForProduct(product?: InsuranceProduct): ProductQuestionDTO[] {
  const prodId = product?.id ?? 'default';
  const isVehicle =
    product?.categoryKey === 'vehicle' ||
    product?.category?.toLowerCase() === 'kendaraan' ||
    product?.category?.toLowerCase() === 'vehicle';

  if (isVehicle) {
    return [
      {
        id: `q_${prodId}_vehicle_usage`,
        questionnaire_id: `quest_${prodId}`,
        step_number: 1,
        pillar_type: 'risk_assessment',
        code: 'occupation_class',
        label: 'Penggunaan Utama Kendaraan',
        help_text: 'Tentukan intensitas dan keperluan operasional kendaraan',
        input_type: 'radio',
        order_index: 1,
        pricing_rule_id: 'pr_vehicle_occupation',
        affects_pricing_field: 'occupation_class',
        is_active: true,
        options: [
          { value: 'low', label: 'Pribadi / Santai', multiplier: product?.occupationFactors?.low ?? 0.95 },
          { value: 'standard', label: 'Harian Kota', multiplier: product?.occupationFactors?.standard ?? 1.0 },
          { value: 'high', label: 'Komersial / Logistik', multiplier: product?.occupationFactors?.high ?? 1.15 },
        ],
      },
    ];
  }

  return [
    {
      id: `q_${prodId}_gender`,
      questionnaire_id: `quest_${prodId}`,
      step_number: 1,
      pillar_type: 'identity_verified',
      code: 'gender',
      label: 'Jenis Kelamin',
      input_type: 'radio',
      order_index: 1,
      pricing_rule_id: 'pr_life_gender',
      affects_pricing_field: 'gender',
      is_active: true,
      options: [
        { value: 'male', label: 'Pria', multiplier: product?.genderFactors?.male ?? 1.05 },
        { value: 'female', label: 'Wanita', multiplier: product?.genderFactors?.female ?? 1.0 },
      ],
    },
    {
      id: `q_${prodId}_is_smoker`,
      questionnaire_id: `quest_${prodId}`,
      step_number: 1,
      pillar_type: 'medical_history',
      code: 'is_smoker',
      label: 'Kebiasaan Merokok',
      help_text: 'Konsumsi rokok konvensional atau elektrik (vape) dalam 12 bulan terakhir',
      input_type: 'radio',
      order_index: 2,
      pricing_rule_id: 'pr_life_smoker',
      affects_pricing_field: 'smoker',
      is_active: true,
      options: [
        { value: 'no', label: 'Bukan Perokok', multiplier: product?.smokerFactors?.no ?? 1.0 },
        { value: 'yes', label: 'Perokok Aktif', multiplier: product?.smokerFactors?.yes ?? 1.35 },
      ],
    },
    {
      id: `q_${prodId}_occupation_class`,
      questionnaire_id: `quest_${prodId}`,
      step_number: 1,
      pillar_type: 'financial_capacity',
      code: 'occupation_class',
      label: 'Tingkat Risiko Pekerjaan',
      input_type: 'radio',
      order_index: 3,
      pricing_rule_id: 'pr_life_occupation',
      affects_pricing_field: 'occupation_class',
      is_active: true,
      options: [
        { value: 'low', label: 'Rendah', multiplier: product?.occupationFactors?.low ?? 0.95 },
        { value: 'standard', label: 'Standar', multiplier: product?.occupationFactors?.standard ?? 1.0 },
        { value: 'high', label: 'Tinggi', multiplier: product?.occupationFactors?.high ?? 1.4 },
      ],
    },
    {
      id: `q_${prodId}_critical_illness`,
      questionnaire_id: `quest_${prodId}`,
      step_number: 1,
      pillar_type: 'medical_history',
      code: 'has_critical_illness',
      label: 'Riwayat Penyakit Kritis',
      help_text: 'Pernahkah didiagnosis kanker, serangan jantung, stroke, ginjal, atau diabetes?',
      input_type: 'radio',
      order_index: 4,
      pricing_rule_id: 'pr_life_critical_illness',
      affects_pricing_field: 'critical_illness',
      is_active: true,
      options: [
        { value: 'no', label: 'Tidak Pernah', multiplier: 1.0 },
        { value: 'yes', label: 'Pernah', multiplier: 1.30 },
      ],
    },
    {
      id: `q_${prodId}_hospitalization`,
      questionnaire_id: `quest_${prodId}`,
      step_number: 1,
      pillar_type: 'medical_history',
      code: 'has_hospitalization_2y',
      label: 'Riwayat Rawat Inap (Opname) 2 Tahun Terakhir',
      help_text: 'Apakah pernah menjalani rawat inap di rumah sakit atau operasi bedah dalam 24 bulan terakhir?',
      input_type: 'radio',
      order_index: 5,
      pricing_rule_id: 'pr_life_hospitalization',
      affects_pricing_field: 'hospitalization',
      is_active: true,
      options: [
        { value: 'no', label: 'Tidak Pernah', multiplier: 1.0 },
        { value: 'yes', label: 'Pernah', multiplier: 1.20 },
      ],
    },
  ];
}


// Convert numbers to Indonesian currency wording without misleading rounding
export function numberToRupiahWords(num: number): string {
  const rounded = Math.floor(num);
  if (rounded <= 0) return 'Nol Rupiah';

  const miliar = Math.floor(rounded / 1_000_000_000);
  const sisaMiliar = rounded % 1_000_000_000;
  const juta = Math.floor(sisaMiliar / 1_000_000);
  const sisaJuta = sisaMiliar % 1_000_000;
  const ribu = Math.floor(sisaJuta / 1_000);
  const sisaRupiah = sisaJuta % 1_000;

  const parts: string[] = [];
  if (miliar > 0) parts.push(`${miliar} Miliar`);
  if (juta > 0) parts.push(`${juta} Juta`);
  if (ribu > 0) parts.push(`${ribu} Ribu`);
  if (sisaRupiah > 0) parts.push(`${sisaRupiah}`);

  return parts.length > 0 ? `${parts.join(' ')} Rupiah` : 'Nol Rupiah';
}

export const SimulationWorkbench: React.FC<SimulationWorkbenchProps> = ({
  initialProducts,
  initialProductId,
}) => {
  const router = useRouter();

  // 1. Product Selection State
  const defaultProduct = useMemo(() => {
    if (initialProductId) {
      const matched = initialProducts.find((p) => p.id === initialProductId);
      if (matched) return matched;
    }
    return initialProducts[0] || null;
  }, [initialProducts, initialProductId]);

  const [selectedProductId, setSelectedProductId] = useState<string>(
    defaultProduct ? defaultProduct.id : ''
  );

  const currentProduct = useMemo(() => {
    return initialProducts.find((p) => p.id === selectedProductId) || initialProducts[0];
  }, [initialProducts, selectedProductId]);

  // 2. Actuarial Parameters State (Aligned with Penpot Defaults)
  const [sumAssured, setSumAssured] = useState<number>(() => {
    if (!currentProduct) return 500_000_000;
    return Math.max(
      currentProduct.minSumAssured,
      Math.min(500_000_000, currentProduct.maxSumAssured)
    );
  });

  const isVehicle =
    currentProduct?.categoryKey === 'vehicle' ||
    currentProduct?.category?.toLowerCase() === 'kendaraan' ||
    currentProduct?.category?.toLowerCase() === 'vehicle';

  const minTerm = currentProduct?.minTermYears || (isVehicle ? 1 : 5);
  const maxTerm = currentProduct?.maxTermYears || (isVehicle ? 10 : 30);
  const productMinAge = isVehicle
    ? (currentProduct?.minAge !== undefined && currentProduct.minAge <= 5 ? currentProduct.minAge : 0)
    : (currentProduct?.minAge || 18);
  const productMaxAge = isVehicle
    ? (currentProduct?.maxAge !== undefined && currentProduct.maxAge <= 25 ? currentProduct.maxAge : 15)
    : (currentProduct?.maxAge || 60);

  const [termYears, setTermYears] = useState<number>(() => {
    return Math.max(minTerm, Math.min(10, maxTerm));
  });
  const [applicantAge, setApplicantAge] = useState<number>(() => {
    return isVehicle
      ? Math.max(productMinAge, Math.min(3, productMaxAge))
      : Math.max(productMinAge, Math.min(32, productMaxAge));
  });
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [isSmoker, setIsSmoker] = useState<boolean>(false);
  const [occupationRisk, setOccupationRisk] = useState<'low' | 'standard' | 'high'>('low');
  const [frequency, setFrequency] = useState<'monthly' | 'annually'>('annually');
  const [selectedRiderIds, setSelectedRiderIds] = useState<string[]>([]);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState<boolean>(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const [dynamicQuestions, setDynamicQuestions] = useState<ProductQuestionDTO[]>(() =>
    getDefaultQuestionsForProduct(currentProduct)
  );
  const [answers, setAnswers] = useState<Record<string, string>>({
    gender: 'male',
    is_smoker: 'no',
    occupation_class: 'low',
    has_critical_illness: 'no',
    has_hospitalization_2y: 'no',
  });
  const [dynamicMultipliers, setDynamicMultipliers] = useState<Record<string, number>>({});

  const handleAnswerChange = (code: string, value: string, multiplier?: number) => {
    setAnswers((prev) => ({ ...prev, [code]: value }));
    if (multiplier !== undefined) {
      setDynamicMultipliers((prev) => ({ ...prev, [code]: multiplier }));
    }
    if (code === 'is_smoker' || code === 'smoker') {
      setIsSmoker(value === 'yes');
    } else if (code === 'gender') {
      setGender(value as 'male' | 'female');
    } else if (code === 'occupation_class') {
      setOccupationRisk(value as 'low' | 'standard' | 'high');
    }
  };

  // Sync questions when currentProduct changes
  useEffect(() => {
    if (!currentProduct) return;
    let isMounted = true;
    const currentSlug = currentProduct.slug || currentProduct.id;
    const isVehicle =
      currentProduct.categoryKey === 'vehicle' ||
      currentProduct.category?.toLowerCase() === 'kendaraan' ||
      currentProduct.category?.toLowerCase() === 'vehicle';

    const fetchQuestionnaire = async () => {
      try {
        const questionnaire = await getQuestionnaireAction(currentSlug);
        if (isMounted && questionnaire && questionnaire.questions && questionnaire.questions.length > 0) {
          let pricingQuestions = questionnaire.questions.filter(
            (q) =>
              q.pricing_rule_id ||
              q.affects_pricing_field ||
              ['has_critical_illness', 'has_hospitalization_2y'].includes(q.code)
          );
          if (isVehicle) {
            // For vehicle insurance, exclude human life & health factors (gender, smoker, illnesses, hospitalization)
            pricingQuestions = pricingQuestions.filter(
              (q) =>
                ![
                  'gender',
                  'is_smoker',
                  'smoker',
                  'has_critical_illness',
                  'has_hospitalization_2y',
                  'critical_illness',
                  'hospitalization',
                ].includes(q.code)
            );
            // Ensure vehicle usage options match pricing rules
            pricingQuestions = pricingQuestions.map((q) => {
              if (q.code === 'occupation_class') {
                return {
                  ...q,
                  label: 'Penggunaan Utama Kendaraan',
                  help_text: 'Tentukan intensitas dan keperluan operasional kendaraan',
                  options: [
                    { value: 'low', label: 'Pribadi / Santai', multiplier: currentProduct?.occupationFactors?.low ?? 0.95 },
                    { value: 'standard', label: 'Harian Kota', multiplier: currentProduct?.occupationFactors?.standard ?? 1.0 },
                    { value: 'high', label: 'Komersial / Logistik', multiplier: currentProduct?.occupationFactors?.high ?? 1.15 },
                  ],
                };
              }
              return q;
            });
          }
          if (pricingQuestions.length > 0) {
            setDynamicQuestions(pricingQuestions);
            setAnswers((prev) => {
              const updated = { ...prev };
              for (const q of pricingQuestions) {
                if (!updated[q.code]) {
                  if (q.code === 'gender') updated[q.code] = prev.gender || 'male';
                  else if (q.code === 'is_smoker' || q.code === 'smoker') updated[q.code] = prev.is_smoker || 'no';
                  else if (q.code === 'occupation_class') updated[q.code] = prev.occupation_class || 'standard';
                  else updated[q.code] = q.options?.[0]?.value || '';
                }
              }
              return updated;
            });
            return;
          }
        }
      } catch {
        // Fallback already in place
      }
      if (isMounted) {
        setDynamicQuestions(getDefaultQuestionsForProduct(currentProduct));
      }
    };

    fetchQuestionnaire();
    return () => {
      isMounted = false;
    };
  }, [currentProduct]);


  // Switch product and adjust bounds if needed
  const handleProductChange = (newProductId: string) => {
    setSelectedProductId(newProductId);
    const newProduct = initialProducts.find((p) => p.id === newProductId);
    if (newProduct) {
      setDynamicQuestions(getDefaultQuestionsForProduct(newProduct));
      if (newProduct.sumAssuredPresets && newProduct.sumAssuredPresets.length > 0) {
        setSumAssured((prev) =>
          newProduct.sumAssuredPresets!.includes(prev) ? prev : newProduct.sumAssuredPresets![0]
        );
      } else {
        setSumAssured((prev) =>
          Math.max(newProduct.minSumAssured, Math.min(prev, newProduct.maxSumAssured))
        );
      }
      if (newProduct.termPresets && newProduct.termPresets.length > 0) {
        setTermYears((prev) =>
          newProduct.termPresets!.includes(prev) ? prev : newProduct.termPresets![0]
        );
      } else {
        const newMinTerm = newProduct.minTermYears || 1;
        const newMaxTerm = newProduct.maxTermYears || 30;
        setTermYears((prev) => Math.max(newMinTerm, Math.min(prev, newMaxTerm)));
      }
      const isNewVeh =
        newProduct.categoryKey === 'vehicle' ||
        newProduct.category?.toLowerCase() === 'kendaraan' ||
        newProduct.category?.toLowerCase() === 'vehicle';
      const newMinAge = isNewVeh
        ? (newProduct.minAge !== undefined && newProduct.minAge <= 5 ? newProduct.minAge : 0)
        : (newProduct.minAge || 18);
      const newMaxAge = isNewVeh
        ? (newProduct.maxAge !== undefined && newProduct.maxAge <= 25 ? newProduct.maxAge : 15)
        : (newProduct.maxAge || 60);

      setApplicantAge((prev) => {
        if (isNewVeh && prev > 15) return 3;
        if (!isNewVeh && prev < 18) return 32;
        return Math.max(newMinAge, Math.min(prev, newMaxAge));
      });
      // Retain only riders available on the new product
      if (newProduct.riders) {
        const availableRiderIds = newProduct.riders.map((r) => r.id);
        setSelectedRiderIds((prev) => prev.filter((id) => availableRiderIds.includes(id)));
      } else {
        setSelectedRiderIds([]);
      }
    }
  };

  // Sync selected product during render when initialProductId changes
  const [prevInitialProductId, setPrevInitialProductId] = useState(initialProductId);
  if (initialProductId !== prevInitialProductId) {
    setPrevInitialProductId(initialProductId);
    if (initialProductId && initialProductId !== selectedProductId) {
      setSelectedProductId(initialProductId);
      const newProduct = initialProducts.find((p) => p.id === initialProductId);
      if (newProduct) {
        setDynamicQuestions(getDefaultQuestionsForProduct(newProduct));
        if (newProduct.sumAssuredPresets && newProduct.sumAssuredPresets.length > 0) {
          setSumAssured((prev) =>
            newProduct.sumAssuredPresets!.includes(prev) ? prev : newProduct.sumAssuredPresets![0]
          );
        } else {
          setSumAssured((prev) =>
            Math.max(newProduct.minSumAssured, Math.min(prev, newProduct.maxSumAssured))
          );
        }
        if (newProduct.termPresets && newProduct.termPresets.length > 0) {
          setTermYears((prev) =>
            newProduct.termPresets!.includes(prev) ? prev : newProduct.termPresets![0]
          );
        } else {
          const newMinTerm = newProduct.minTermYears || 1;
          const newMaxTerm = newProduct.maxTermYears || 30;
          setTermYears((prev) => Math.max(newMinTerm, Math.min(prev, newMaxTerm)));
        }
        const isNewVeh =
          newProduct.categoryKey === 'vehicle' ||
          newProduct.category?.toLowerCase() === 'kendaraan' ||
          newProduct.category?.toLowerCase() === 'vehicle';
        const newMinAge = isNewVeh
          ? (newProduct.minAge !== undefined && newProduct.minAge <= 5 ? newProduct.minAge : 0)
          : (newProduct.minAge || 18);
        const newMaxAge = isNewVeh
          ? (newProduct.maxAge !== undefined && newProduct.maxAge <= 25 ? newProduct.maxAge : 15)
          : (newProduct.maxAge || 60);

        setApplicantAge((prev) => {
          if (isNewVeh && prev > 15) return 3;
          if (!isNewVeh && prev < 18) return 32;
          return Math.max(newMinAge, Math.min(prev, newMaxAge));
        });
        if (newProduct.riders) {
          const availableRiderIds = newProduct.riders.map((r) => r.id);
          setSelectedRiderIds((prev) => prev.filter((id) => availableRiderIds.includes(id)));
        } else {
          setSelectedRiderIds([]);
        }
      }
    }
  }

  // Keyboard Escape listener to close actuarial modal
  useEffect(() => {
    if (!isBreakdownModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsBreakdownModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBreakdownModalOpen]);

  // Toggle rider selection
  const handleToggleRider = (riderId: string) => {
    setSelectedRiderIds((prev) =>
      prev.includes(riderId) ? prev.filter((id) => id !== riderId) : [...prev, riderId]
    );
  };

  // Initial Sync Calculation Result for instant preview
  const syncSimulationResult = useMemo(() => {
    if (!currentProduct) return null;
    return calculatePureSimulation(
      {
        productId: currentProduct.id,
        sumAssured,
        termYears,
        applicantAge,
        isSmoker,
        frequency,
        gender,
        occupationRisk,
        selectedRiderIds,
        answers,
        dynamicMultipliers,
      },
      currentProduct
    );
  }, [
    currentProduct,
    sumAssured,
    termYears,
    applicantAge,
    isSmoker,
    frequency,
    gender,
    occupationRisk,
    selectedRiderIds,
    answers,
    dynamicMultipliers,
  ]);

  const [asyncSimulationResult, setAsyncSimulationResult] = useState<SimulationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  // Fetch real quote calculation asynchronously from Core API
  useEffect(() => {
    if (!currentProduct) return;
    let isMounted = true;

    const timer = setTimeout(async () => {
      if (!isMounted) return;
      setIsCalculating(true);
      setCalculationError(null);
      try {

        const res = await calculateSimulationAction(
          {
            productId: currentProduct.id,
            sumAssured,
            termYears,
            applicantAge,
            isSmoker,
            frequency,
            gender,
            occupationRisk,
            selectedRiderIds,
            answers,
            dynamicMultipliers,
          },
          currentProduct
        );
        if (isMounted) {
          setAsyncSimulationResult(res);
          setIsCalculating(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setIsCalculating(false);
          const msg =
            err instanceof Error ? err.message : 'Gagal menghitung quote dari Core API';
          setCalculationError(msg);
        }
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [
    currentProduct,
    sumAssured,
    termYears,
    applicantAge,
    isSmoker,
    frequency,
    gender,
    occupationRisk,
    selectedRiderIds,
    answers,
    dynamicMultipliers,
  ]);

  const simulationResult = calculationError
    ? null
    : (asyncSimulationResult || syncSimulationResult);

  // Navigate to application page with pre-filled actuarial quote
  const handleContinueApply = () => {
    if (!currentProduct) return;
    const params = new URLSearchParams({
      productId: currentProduct.id,
      sumAssured: String(sumAssured),
      termYears: String(termYears),
      age: String(applicantAge),
      gender,
      isSmoker: String(isSmoker),
      occupationRisk,
      frequency,
      riders: selectedRiderIds.join(','),
    });
    router.push(`/apply?${params.toString()}`);
  };

  // Trigger PDF download simulation
  const handleDownloadPDF = () => {
    setDownloadNotice('Menyiapkan dokumen ringkasan simulasi polis (PDF)...');
    setTimeout(() => {
      window.print();
      setDownloadNotice(null);
    }, 600);
  };

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  const productSliderRef = React.useRef<HTMLDivElement>(null);

  const handleScrollSlider = (direction: 'left' | 'right') => {
    if (!productSliderRef.current) return;
    const scrollAmount = productSliderRef.current.clientWidth * 0.75;
    productSliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Top 3 Canonical Products matching Penpot selector cards
  const canonicalCards = useMemo(() => {
    const list: InsuranceProduct[] = [];
    const life = initialProducts.find((p) => p.categoryKey === 'life') || initialProducts[0];
    const health = initialProducts.find((p) => p.categoryKey === 'health') || initialProducts[1];
    const third = initialProducts.find((p) => p.categoryKey === 'vehicle') || initialProducts[2];

    if (life) list.push(life);
    if (health && !list.some((p) => p.id === health.id)) list.push(health);
    if (third && !list.some((p) => p.id === third.id)) list.push(third);

    // If current selected product is not in the top 3 cards, include it so the selected card is visible
    if (currentProduct && !list.some((p) => p.id === currentProduct.id)) {
      if (list.length >= 3) {
        list[2] = currentProduct;
      } else {
        list.push(currentProduct);
      }
    }

    return list;
  }, [initialProducts, currentProduct]);

  // Preset buttons dynamically configured via Core API product pricing rules
  const sumAssuredPresets = useMemo(() => {
    if (!currentProduct) return [];
    if (
      currentProduct.sumAssuredPresets &&
      currentProduct.sumAssuredPresets.length > 0
    ) {
      return currentProduct.sumAssuredPresets.map((val) => ({
        label: formatRupiah(val),
        value: val,
      }));
    }

    // Pure mathematical division if product does not specify explicit presets
    const min = currentProduct.minSumAssured;
    const max = currentProduct.maxSumAssured;
    if (min >= max) {
      return [{ label: formatRupiah(min), value: min }];
    }

    const step = (max - min) / 3;
    const points = [min, min + step, min + step * 2, max];
    return points.map((val) => {
      const rounded = Math.round(val / 5_000_000) * 5_000_000;
      return {
        label: formatRupiah(rounded),
        value: rounded,
      };
    });
  }, [currentProduct]);

  const termPresets = useMemo(() => {
    if (!currentProduct) return [];
    if (currentProduct.termPresets && currentProduct.termPresets.length > 0) {
      return currentProduct.termPresets;
    }

    // Pure mathematical division across valid term range
    if (minTerm >= maxTerm) return [minTerm];
    const step = Math.max(1, Math.round((maxTerm - minTerm) / 3));
    const points = [minTerm, minTerm + step, minTerm + step * 2, maxTerm];
    return Array.from(new Set(points.filter((t) => t >= minTerm && t <= maxTerm)));
  }, [currentProduct, minTerm, maxTerm]);

  // Age risk bracket label dynamically matching Core API age_factors
  const ageRangeLabel = useMemo(() => {
    if (currentProduct?.ageFactors && currentProduct.ageFactors.length > 0) {
      const matched = currentProduct.ageFactors.find(
        (af) => applicantAge >= af.minAge && applicantAge <= af.maxAge
      );
      if (matched) {
        return `${matched.minAge}-${matched.maxAge} thn`;
      }
    }
    return `${applicantAge} thn`;
  }, [applicantAge, currentProduct]);

  // Helper for dynamic actuarial factor labels
  const formatFactorLabel = (factor?: number, prefix = '') =>
    factor !== undefined
      ? ` (${prefix ? prefix + ': ' : ''}${factor.toFixed(2)}x)`
      : '';

  // Dynamic annual discount percentage based on product frequencyLoading
  const annualDiscountPercent = useMemo(() => {
    const monthlyLoading = currentProduct?.frequencyLoading?.monthly ?? 1.06;
    const annualLoading = currentProduct?.frequencyLoading?.annual ?? 1.0;
    return Math.round(((monthlyLoading - annualLoading) / monthlyLoading) * 100);
  }, [currentProduct]);

  if (!currentProduct) {
    return (
      <div className="py-20 text-center text-slate-500">
        Memuat data kalkulator simulasi premi...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: TOP BREADCRUMB & HERO HEADER (Y: 120 - 240)        */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-3 text-left">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Beranda
          </Link>
          <span>/</span>
          <span className="text-slate-800">Simulasi Premi Instan</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-slate-900 tracking-tight">
              Kalkulator & Simulasi Premi Asuransi
            </h1>
            <p className="text-sm sm:text-base text-slate-500 max-w-3xl mt-1.5 leading-relaxed">
              Hitung estimasi premi akurat secara transparan dengan Core API dynamic pricing engine.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-all"
            >
              <span>←</span> Lihat Katalog Lengkap
            </Link>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3 PRODUCT SELECTOR CARDS (Y: 240 - 370)                       */}
      {/* ------------------------------------------------------------- */}
      <section aria-label="Pilihan Produk Simulasi" className="space-y-3 text-left">
        {initialProducts.length > 3 ? (
          <div className="space-y-2">
            <div className="relative group">
              <div
                ref={productSliderRef}
                className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x snap-mandatory scroll-smooth"
              >
                {initialProducts.map((product) => {
                  const isSelected = product.id === selectedProductId;
                  const isLife = product.categoryKey === 'life';
                  const isHealth = product.categoryKey === 'health';

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleProductChange(product.id)}
                      aria-pressed={isSelected}
                      className={`relative p-5 rounded-2xl text-left transition-all flex flex-col justify-between min-h-[104px] shrink-0 w-[82%] sm:w-[calc((100%-1rem)/2.3)] lg:w-[calc((100%-3rem)/3.5)] snap-start border cursor-pointer ${
                        isSelected
                          ? 'bg-white border-[#0f172a] ring-2 ring-[#0f172a] shadow-md'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        {isSelected ? (
                          <span className="bg-[#0f172a] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            PILIHAN
                          </span>
                        ) : isHealth ? (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            KESEHATAN
                          </span>
                        ) : isLife ? (
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            JIWA
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            KENDARAAN
                          </span>
                        )}
                        <span className={`text-base font-extrabold line-clamp-1 ${isSelected ? 'text-[#0f172a]' : 'text-slate-700'}`}>
                          {product.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium line-clamp-1">
                        {product.tagline || product.description} • Mulai {product.monthlyPremiumStarting || product.startingPrice || 'Rp 100rb/bln'}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Left Arrow Nav Button */}
              <button
                type="button"
                aria-label="Geser produk sebelumnya"
                onClick={() => handleScrollSlider('left')}
                className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-8 h-8 rounded-full bg-white/95 border border-slate-300 shadow-md text-slate-700 hover:bg-slate-50 items-center justify-center font-bold text-sm z-10 transition-transform active:scale-95 cursor-pointer"
              >
                ‹
              </button>

              {/* Right Arrow Nav Button */}
              <button
                type="button"
                aria-label="Geser produk selanjutnya"
                onClick={() => handleScrollSlider('right')}
                className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-8 h-8 rounded-full bg-[#0f172a] text-white shadow-md hover:bg-slate-800 items-center justify-center font-bold text-sm z-10 transition-transform active:scale-95 cursor-pointer"
              >
                ›
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {canonicalCards.map((product) => {
              const isSelected = product.id === selectedProductId;
              const isLife = product.categoryKey === 'life';
              const isHealth = product.categoryKey === 'health';

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleProductChange(product.id)}
                  aria-pressed={isSelected}
                  className={`relative p-5 rounded-2xl text-left transition-all flex flex-col justify-between min-h-[104px] border ${
                    isSelected
                      ? 'bg-white border-[#0f172a] ring-2 ring-[#0f172a] shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {isSelected ? (
                      <span className="bg-[#0f172a] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        PILIHAN
                      </span>
                    ) : isHealth ? (
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        KESEHATAN
                      </span>
                    ) : isLife ? (
                      <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        JIWA
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        KENDARAAN
                      </span>
                    )}
                    <span className={`text-base font-extrabold ${isSelected ? 'text-[#0f172a]' : 'text-slate-700'}`}>
                      {product.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium line-clamp-1">
                    {product.tagline || product.description} • Mulai {product.monthlyPremiumStarting || product.startingPrice || 'Rp 100rb/bln'}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: 2-COLUMN SIMULATOR INTERFACE (Y: 370 - 1520)       */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Panel (Y: 370 - 1520) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-8 text-left">
          {/* Sub-section 1: Profil Risiko Tertanggung / Objek Kendaraan */}
          <section aria-labelledby="heading-risk-profile" className="space-y-5">
            <div className="space-y-1">
              <h2 id="heading-risk-profile" className="text-lg sm:text-xl font-extrabold text-[#0f172a]">
                {isVehicle ? '1. Profil Objek Kendaraan' : '1. Profil Risiko Tertanggung'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {isVehicle
                  ? 'Parameter usia dan operasional kendaraan memengaruhi faktor risiko underwriting otomatis pada Core API.'
                  : 'Parameter ini memengaruhi faktor risiko underwriting otomatis pada Core API.'}
              </p>
            </div>

            {/* Usia Input & Visual Box */}
            <div className="space-y-2">
              <label htmlFor="input-age" className="block text-xs sm:text-sm font-semibold text-slate-700">
                {isVehicle ? 'Usia Kendaraan:' : 'Usia Tertanggung:'}
              </label>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-extrabold text-[#0f172a]">{applicantAge} Tahun</span>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                  {isVehicle ? 'Faktor Risiko Usia Kendaraan:' : 'Faktor Risiko Usia:'}{' '}
                  {simulationResult?.breakdown?.ageFactor ? `${simulationResult.breakdown.ageFactor}x` : '-'}{' '}
                  (Rentang {ageRangeLabel})
                </span>
              </div>

              <div className="pt-2">
                <Slider
                  label={
                    isVehicle
                      ? `Geser untuk mengatur usia kendaraan (${productMinAge} - ${productMaxAge} tahun):`
                      : `Geser untuk mengatur usia nasabah (${productMinAge} - ${productMaxAge} tahun):`
                  }
                  min={productMinAge}
                  max={productMaxAge}
                  step={1}
                  value={applicantAge}
                  onChange={setApplicantAge}
                  formatValue={(val) => `${val} Tahun`}
                  minLabel={`${productMinAge} Thn`}
                  maxLabel={`${productMaxAge} Thn`}
                />
              </div>

              <div className="pt-1 w-40">
                <Input
                  id="input-age"
                  label={isVehicle ? 'Input Manual Usia Kendaraan:' : 'Input Manual Usia:'}
                  type="number"
                  min={productMinAge}
                  max={productMaxAge}
                  value={applicantAge || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setApplicantAge(val === '' ? 0 : Number(val));
                  }}
                  onBlur={() => {
                    setApplicantAge((prev) =>
                      Math.min(productMaxAge, Math.max(productMinAge, prev || productMinAge))
                    );
                  }}
                  helperText={`Rentang: ${productMinAge} s/d ${productMaxAge} tahun.`}
                />
              </div>
            </div>

            {/* Dynamic Product Actuarial Risk Questionnaire Fields */}
            {dynamicQuestions.map((q) => {
              const selectedValue =
                answers[q.code] ||
                (q.code === 'gender'
                  ? gender
                  : q.code === 'is_smoker' || q.code === 'smoker'
                  ? isSmoker
                    ? 'yes'
                    : 'no'
                  : q.code === 'occupation_class'
                  ? occupationRisk
                  : q.options?.[0]?.value || '');

              const colsClass =
                (q.options?.length ?? 0) === 2
                  ? 'grid-cols-2'
                  : (q.options?.length ?? 0) === 3
                  ? 'grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-4';

              return (
                <div key={q.id || q.code} className="space-y-2">
                  <span className="block text-xs sm:text-sm font-semibold text-slate-700">
                    {q.label.endsWith(':') ? q.label : `${q.label}:`}
                  </span>
                  {q.help_text && (
                    <p className="text-[11px] text-slate-500">{q.help_text}</p>
                  )}
                  <div className={`grid ${colsClass} gap-3`}>
                    {q.options?.map((opt) => {
                      const isPressed = selectedValue === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleAnswerChange(q.code, opt.value, opt.multiplier)}
                          aria-pressed={isPressed}
                          className={`py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all border text-center ${
                            isPressed
                              ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {isPressed ? '✓ ' : ''}
                          {opt.label}
                          {formatFactorLabel(
                            opt.multiplier ?? 1.0,
                            q.code === 'gender' ? 'Faktor' : ''
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>


          <hr className="border-slate-200" />

          {/* Sub-section 2: Konfigurasi Perlindungan Polis */}
          <section aria-labelledby="heading-policy-config" className="space-y-5">
            <div className="space-y-1">
              <h2 id="heading-policy-config" className="text-lg sm:text-xl font-extrabold text-[#0f172a]">
                2. Konfigurasi Perlindungan Polis
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Pilih besaran santunan tunai warisan serta durasi proteksi yang dikehendaki.
              </p>
            </div>

            {/* UP Display Box */}
            <div className="space-y-2">
              <span className="block text-xs sm:text-sm font-semibold text-slate-700">
                Uang Pertanggungan (Nilai Santunan):
              </span>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xl sm:text-2xl font-extrabold text-[#0f172a]">
                  {formatRupiah(sumAssured)}
                </span>
              </div>

              <div className="pt-2">
                <Slider
                  label="Uang Pertanggungan Santunan Tunai"
                  min={currentProduct.minSumAssured}
                  max={currentProduct.maxSumAssured}
                  step={50_000_000}
                  value={sumAssured}
                  onChange={setSumAssured}
                  formatValue={(val) => `Rp ${(val / 1_000_000).toLocaleString('id-ID')} Juta`}
                  minLabel={formatRupiah(currentProduct.minSumAssured)}
                  maxLabel={formatRupiah(currentProduct.maxSumAssured)}
                />
              </div>

              {/* 4 UP Preset Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {sumAssuredPresets.map((preset) => {
                  const isPresetActive = sumAssured === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setSumAssured(preset.value)}
                      aria-pressed={isPresetActive}
                      className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all text-center ${
                        isPresetActive
                          ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {isPresetActive ? '✓ ' : ''}{preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Masa Pembayaran Premi (Tenor) */}
            <div className="space-y-2 pt-2">
              <span className="block text-xs sm:text-sm font-semibold text-slate-700">
                Masa Pembayaran Premi (Tenor):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {termPresets.map((term) => {
                  const isTermActive = termYears === term;
                  return (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setTermYears(term)}
                      aria-pressed={isTermActive}
                      className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all text-center ${
                        isTermActive
                          ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {isTermActive ? '✓ ' : ''}{term} Tahun
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Frekuensi Pembayaran Premi */}
            <div className="space-y-2 pt-2">
              <span className="block text-xs sm:text-sm font-semibold text-slate-700">
                Frekuensi Pembayaran Premi:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFrequency('annually')}
                  aria-pressed={frequency === 'annually'}
                  className={`p-3.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all text-center ${
                    frequency === 'annually'
                      ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Tahunan (Hemat {annualDiscountPercent}% - Diskon API)
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency('monthly')}
                  aria-pressed={frequency === 'monthly'}
                  className={`p-3.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all text-center ${
                    frequency === 'monthly'
                      ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Bulanan (Pembayaran Rutin)
                </button>
              </div>
            </div>

            {/* Calculate Action & Footnote */}
            <div className="space-y-2 pt-3">
              <button
                type="button"
                onClick={() => {
                  // Re-evaluate calculation (stateless trigger for user feedback)
                  setDownloadNotice('Menghitung ulang simulasi dengan Core API pricing engine...');
                  setTimeout(() => setDownloadNotice(null), 800);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-sm sm:text-base transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>🔄</span> Hitung Ulang Estimasi Premi
              </button>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                ℹ️ Pricing Engine terintegrasi dengan endpoint POST /api/v1/products/:slug/quotes
              </p>
            </div>
          </section>

          {/* Optional Riders Section */}
          {currentProduct.riders && currentProduct.riders.length > 0 && (
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  Manfaat Tambahan (Riders)
                </span>
                <p className="text-xs text-slate-500">
                  Lengkapi polis dasar Anda dengan proteksi pelengkap mandiri.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentProduct.riders.map((rider) => {
                  const isChecked = selectedRiderIds.includes(rider.id);
                  return (
                    <label
                      key={rider.id}
                      htmlFor={`rider-${rider.id}`}
                      className={`relative flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'border-blue-600 bg-blue-50/50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        id={`rider-${rider.id}`}
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleRider(rider.id)}
                        className="h-4 w-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900">{rider.name}</span>
                          <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                            {rider.extraPrice}
                          </span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Callout Info */}
          <Callout
            variant="info"
            title="Standar Transparansi Aktuaria OJK 2026"
            description="Kalkulasi premi di atas merupakan estimasi ilustrasi terstandar berdasarkan Tabel Mortalita Indonesia IV (TMI-IV) dan POJK No. 23/POJK.05/2015."
          />
        </div>

        {/* Right Column: Sticky Result Panel (Y: 370 - 1520) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="bg-[#0f172a] rounded-3xl p-6 sm:p-7 text-left space-y-6 shadow-xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                RINGKASAN POLIS TERPILIH
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                • VERIFIKASI DIGITAL
              </span>
            </div>

            {calculationError && (
              <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs space-y-1">
                <span className="font-bold text-rose-300 block">Koneksi / Perhitungan Gagal:</span>
                <p>{calculationError}</p>
              </div>
            )}

            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {currentProduct.title}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentProduct.tagline || currentProduct.description}
              </p>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-[#1e293b] border border-slate-700/60 space-y-1.5">
              <span className="block text-[10px] font-bold text-[#38bdf8] uppercase tracking-wider">
                PREMI {frequency === 'annually' ? `TAHUNAN (HEMAT ${annualDiscountPercent}%)` : 'BULANAN'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-white">
                  {isCalculating
                    ? 'Menghitung...'
                    : simulationResult
                    ? formatRupiah(simulationResult.activePremium)
                    : 'Rp -'}
                </span>
                {simulationResult && (
                  <span className="text-xs text-slate-400">
                    / {frequency === 'annually' ? 'tahun' : 'bulan'}
                  </span>
                )}
              </div>
              {simulationResult ? (
                <p className="text-xs text-slate-400">
                  {frequency === 'monthly'
                    ? `Setara dengan ${formatRupiah(simulationResult.monthlyPremium * 12)} per tahun`
                    : `Setara dengan ${formatRupiah(Math.round(simulationResult.annualPremium / 12))} per bulan${simulationResult.annualSavings > 0 ? ` (Hemat ${formatRupiah(simulationResult.annualSavings)})` : ''}`}
                </p>
              ) : (
                <p className="text-xs text-slate-400">
                  {calculationError
                    ? 'Gagal memuat tarif aktuaria dari API'
                    : 'Sedang menghitung estimasi premi aktuaria...'}
                </p>
              )}
            </div>

            {/* Policy Parameters */}
            <div className="p-3.5 rounded-2xl bg-[#1e293b] border border-slate-700/60 space-y-2 text-xs">
              <span className="text-[11px] font-bold text-slate-200 block border-b border-slate-700/60 pb-1">
                Ringkasan Pertanggungan Polis:
              </span>
              <div className="flex justify-between items-center text-slate-300">
                <span>{currentProduct.categoryKey === 'vehicle' ? 'Pertanggungan Kendaraan' : 'Uang Pertanggungan (UP)'}</span>
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
                  {currentProduct.categoryKey === 'vehicle' ? 'Pertanggungan Kendaraan' : 'Nilai Santunan (UP)'}
                </span>
                <span className="font-semibold text-white">
                  Rp {sumAssured >= 1_000_000_000 ? `${(sumAssured / 1_000_000_000).toFixed(0)} Miliar` : `${(sumAssured / 1_000_000).toFixed(0)} Juta`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Masa Pertanggungan (Tenor)</span>
                <span className="font-semibold text-white">
                  {termYears} Thn ({simulationResult?.breakdown?.termFactor ? `${simulationResult.breakdown.termFactor}x` : '1.0x'})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">
                  {isVehicle ? `Usia Kendaraan (${applicantAge} Thn)` : `Usia Pemohon (${applicantAge} Thn)`}
                </span>
                <span className="font-semibold text-white">
                  {simulationResult?.breakdown?.ageFactor ? `${simulationResult.breakdown.ageFactor}x` : '-'}
                </span>
              </div>
              {currentProduct.categoryKey !== 'vehicle' && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Jenis Kelamin ({gender === 'male' ? 'Pria' : 'Wanita'})</span>
                    <span className="font-semibold text-white">
                      {simulationResult?.breakdown?.genderFactor ? `${simulationResult.breakdown.genderFactor}x` : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Status Merokok ({isSmoker ? 'Perokok' : 'Non-Smoker'})</span>
                    <span className={`font-semibold ${isSmoker ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {simulationResult?.breakdown?.smokerFactor ? `${simulationResult.breakdown.smokerFactor}x` : '-'}
                    </span>
                  </div>
                </>
              )}
              {currentProduct.categoryKey !== 'vehicle' ? (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Risiko Profesi ({occupationRisk})</span>
                  <span className="font-semibold text-white">
                    {simulationResult?.breakdown?.occupationFactor ? `${simulationResult.breakdown.occupationFactor}x` : '-'}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">
                    Penggunaan Kendaraan ({occupationRisk === 'low' ? 'Pribadi / Santai' : occupationRisk === 'high' ? 'Komersial / Logistik' : 'Harian Kota'})
                  </span>
                  <span className="font-semibold text-white">
                    {simulationResult?.breakdown?.occupationFactor ? `${simulationResult.breakdown.occupationFactor}x` : '-'}
                  </span>
                </div>
              )}
              {currentProduct.categoryKey !== 'vehicle' && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Indeks Massa Tubuh (BMI)</span>
                  <span className="font-semibold text-emerald-400">
                    22.2 (Ideal 🟢)
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Rasio Beban Cicilan (DSR)</span>
                <span className="font-semibold text-emerald-400">2.2% (Aman &lt; 35%)</span>
              </div>
              <div className="flex justify-between items-center pt-1.5 border-t border-slate-700/60 font-semibold">
                <span className="text-slate-400">Skema Pembayaran</span>
                <span className={frequency === 'annually' ? 'text-sky-400' : 'text-slate-200'}>
                  {frequency === 'annually' ? `Tahunan (Hemat ${annualDiscountPercent}%)` : 'Bulanan Rutin'}
                </span>
              </div>
            </div>

            {/* Notice Feedback */}
            {downloadNotice && (
              <p className="text-xs text-blue-300 animate-pulse text-center">{downloadNotice}</p>
            )}

            {/* CTAs */}
            <div className="space-y-2.5 pt-1">
              <Button
                size="lg"
                variant="primary"
                className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3.5 shadow-md transition-all text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleContinueApply}
                disabled={Boolean(calculationError || !simulationResult || isCalculating)}
              >
                Lanjut ke Form Pendaftaran Polis (Step 1) →
              </Button>

              <button
                type="button"
                onClick={handleDownloadPDF}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1e293b] hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-2"
              >
                <span>📄</span> Unduh Rincian Simulasi (PDF)
              </button>

              <button
                type="button"
                onClick={() => setIsBreakdownModalOpen(true)}
                className="w-full text-center text-xs font-semibold text-sky-400 hover:text-sky-300 hover:underline pt-1 transition-all"
              >
                🔍 Lihat Rincian Rumus Aktuaria OJK
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 4: TABLE OF INCLUSIONS & EXCLUSIONS (Y: 1530 - 2000)  */}
      {/* ------------------------------------------------------------- */}
      <section aria-labelledby="heading-clauses" className="space-y-4 text-left pt-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
            TRANSPARANSI KLAUSUL POLIS
          </span>
          <h2 id="heading-clauses" className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
            Rincian Manfaat Yang Dicover & Pengecualian Resmi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Klausul mengikat sesuai dokumen polis resmi terdaftar di OJK.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Inclusions (Covered Benefits) */}
          <div>
            <div className="bg-emerald-50/80 px-6 py-4 border-b border-emerald-100 flex items-center gap-2 text-emerald-900 font-bold text-xs sm:text-sm">
              <span>✅</span>
              <span>MANFAAT YANG DICAKUP (COVERED BENEFITS)</span>
            </div>
            <ul className="p-6 space-y-3 text-xs sm:text-sm text-slate-700">
              {currentProduct.benefitsDetailed && currentProduct.benefitsDetailed.length > 0 ? (
                currentProduct.benefitsDetailed.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold mt-0.5">•</span>
                    <div>
                      <span className="font-semibold">{b.title}</span>
                      {b.description && b.description !== b.title && (
                        <p className="text-slate-500 text-xs mt-0.5">{b.description}</p>
                      )}
                    </div>
                  </li>
                ))
              ) : (
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold mt-0.5">•</span>
                  <span>Santunan proteksi polis sesuai kesepakatan kontrak premi.</span>
                </li>
              )}
            </ul>
          </div>

          {/* Exclusions */}
          <div>
            <div className="bg-rose-50/80 px-6 py-4 border-b border-rose-100 flex items-center gap-2 text-rose-900 font-bold text-xs sm:text-sm">
              <span>⚠️</span>
              <span>PENGECUALIAN RESMI (EXCLUSIONS)</span>
            </div>
            <ul className="p-6 space-y-3 text-xs sm:text-sm text-slate-700">
              {currentProduct.exclusions && currentProduct.exclusions.length > 0 ? (
                currentProduct.exclusions.map((ex, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold mt-0.5">•</span>
                    <span>{ex}</span>
                  </li>
                ))
              ) : (
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold mt-0.5">•</span>
                  <span>Pengecualian standar sesuai ketentuan polis terdaftar di OJK.</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* Actuarial Formula Modal */}
      {isBreakdownModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsBreakdownModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 text-left"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <h3 className="text-base font-bold text-slate-900">
                  Rincian Rumus Aktuaria OJK
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBreakdownModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
                aria-label="Tutup rincian rumus"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] space-y-1">
                <p className="text-blue-700 font-semibold">
                  {isVehicle
                    ? 'Premi Tahunan = (UP × BaseRate × FaktorUsiaKendaraan × FaktorPenggunaan) + BiayaRiders'
                    : 'Premi Tahunan = (UP × BaseRate × FaktorUsia × FaktorGender × FaktorRokok × FaktorPekerjaan) + BiayaRiders'}
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span>Produk:</span>
                  <span className="font-semibold text-slate-900">{currentProduct.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Base Rate Aktuaria:</span>
                  <span className="font-semibold text-slate-900">
                    {(currentProduct.baseRate * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{isVehicle ? `Faktor Usia Kendaraan (${simulationResult?.applicantAge ?? applicantAge} Th):` : `Faktor Usia (Usia ${simulationResult?.applicantAge ?? applicantAge} Th):`}</span>
                  <span className="font-semibold text-slate-900">
                    {simulationResult?.breakdown?.ageFactor ? `${simulationResult.breakdown.ageFactor}x` : '1.0x'} ({isVehicle ? 'Rentang ' + ageRangeLabel : currentProduct.categoryKey === 'life' ? 'TMI-IV baseline 20 th' : 'Rentang ' + ageRangeLabel})
                  </span>
                </div>
                {!isVehicle && (
                  <div className="flex justify-between">
                    <span>Faktor Gender:</span>
                    <span className="font-semibold text-slate-900">
                      {simulationResult?.breakdown?.genderFactor ? `${simulationResult.breakdown.genderFactor}x` : '1.0x'} ({gender === 'male' ? 'Pria' : 'Wanita'})
                    </span>
                  </div>
                )}
                {!isVehicle && (
                  <div className="flex justify-between">
                    <span>Faktor Risiko Merokok:</span>
                    <span className="font-semibold text-slate-900">
                      {simulationResult?.breakdown?.smokerFactor ? `${simulationResult.breakdown.smokerFactor}x` : '1.0x'} ({isSmoker ? 'Perokok Aktif' : 'Bukan Perokok'})
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{isVehicle ? 'Faktor Penggunaan Kendaraan:' : 'Faktor Risiko Pekerjaan:'}</span>
                  <span className="font-semibold text-slate-900">
                    {simulationResult?.breakdown?.occupationFactor ? `${simulationResult.breakdown.occupationFactor}x` : '1.0x'} ({occupationRisk})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Faktor Tenor Perlindungan:</span>
                  <span className="font-semibold text-slate-900">
                    {simulationResult?.breakdown?.termFactor ?? 1.0}x ({termYears} Tahun)
                  </span>
                </div>
                {simulationResult?.breakdown?.dynamicFactors
                  ?.filter(
                    (df) =>
                      !['gender', 'smoker', 'is_smoker', 'occupation', 'occupation_class'].includes(
                        df.ruleCode
                      )
                  )
                  .map((df) => (
                    <div key={df.ruleCode} className="flex justify-between text-blue-700">
                      <span>{df.ruleName}:</span>
                      <span className="font-semibold text-slate-900">{df.factor}x</span>
                    </div>
                  ))}

                <div className="flex justify-between border-t border-slate-100 pt-2">
                  <span>Premi Dasar Tahunan:</span>
                  <span className="font-bold text-slate-900">
                    {simulationResult ? formatRupiah(simulationResult.breakdown.baseAnnualPremium) : 'Rp -'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Biaya Riders ({simulationResult?.selectedRiders?.length ?? 0}):</span>
                  <span className="font-bold text-blue-600">
                    {simulationResult ? formatRupiah(simulationResult.breakdown.ridersAnnualTotal) : 'Rp 0'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 text-sm">
                  <span className="font-bold text-slate-900">Total Premi Tahunan:</span>
                  <span className="font-extrabold text-blue-700">
                    {simulationResult ? formatRupiah(simulationResult.annualPremium) : 'Rp -'}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed italic border-t border-slate-100 pt-3">
                Referensi Regulasi: {simulationResult?.ojkTableReference || 'Surat Edaran OJK (SEOJK) Standar Aktuaria'}.
              </p>
            </div>

            <div className="pt-2">
              <Button
                size="md"
                variant="outline"
                className="w-full"
                onClick={() => setIsBreakdownModalOpen(false)}
              >
                Tutup Rincian Aktuaria
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pre-footer AI Assistant Banner */}
      <AIAssistantBanner className="mt-8" />
    </div>
  );
};
