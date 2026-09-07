'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { InsuranceProduct } from '@/server/repositories/product.repository.interface';
import { SimulationResult } from '@/types/simulation.types';
import { simulationService } from '@/server/di';
import { Slider } from '@/components/atoms/Slider';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Button } from '@/components/atoms/Button';
import { Callout } from '@/components/molecules/Callout';

export interface SimulationWorkbenchProps {
  initialProducts: InsuranceProduct[];
  initialProductId?: string;
}

// Convert numbers to Indonesian currency wording
function numberToRupiahWords(num: number): string {
  if (num <= 0) return 'Nol Rupiah';
  if (num >= 1_000_000_000) {
    const miliar = num / 1_000_000_000;
    const formatted = Number.isInteger(miliar)
      ? miliar.toString()
      : miliar.toFixed(1).replace('.', ',');
    return `${formatted} Miliar Rupiah`;
  }
  if (num >= 1_000_000) {
    const juta = num / 1_000_000;
    const formatted = Number.isInteger(juta)
      ? juta.toString()
      : juta.toFixed(1).replace('.', ',');
    return `${formatted} Juta Rupiah`;
  }
  return `${num.toLocaleString('id-ID')} Rupiah`;
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

  const minTerm = currentProduct?.minTermYears || 5;
  const maxTerm = currentProduct?.maxTermYears || 30;
  const productMinAge = currentProduct?.minAge || 18;
  const productMaxAge = currentProduct?.maxAge || 60;

  const [termYears, setTermYears] = useState<number>(() => {
    return Math.max(minTerm, Math.min(10, maxTerm));
  });
  const [applicantAge, setApplicantAge] = useState<number>(() => {
    return Math.max(productMinAge, Math.min(32, productMaxAge));
  });
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [isSmoker, setIsSmoker] = useState<boolean>(false);
  const [occupationRisk, setOccupationRisk] = useState<'low' | 'standard' | 'high'>('low');
  const [frequency, setFrequency] = useState<'monthly' | 'annually'>('annually');
  const [selectedRiderIds, setSelectedRiderIds] = useState<string[]>([]);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState<boolean>(false);
  const [aiAssistantQuery, setAiAssistantQuery] = useState<string>('');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Switch product and adjust bounds if needed
  const handleProductChange = (newProductId: string) => {
    setSelectedProductId(newProductId);
    const newProduct = initialProducts.find((p) => p.id === newProductId);
    if (newProduct) {
      setSumAssured((prev) =>
        Math.max(newProduct.minSumAssured, Math.min(prev, newProduct.maxSumAssured))
      );
      const newMinTerm = newProduct.minTermYears || 5;
      const newMaxTerm = newProduct.maxTermYears || 30;
      setTermYears((prev) => Math.max(newMinTerm, Math.min(prev, newMaxTerm)));
      setApplicantAge((prev) =>
        Math.max(newProduct.minAge || 18, Math.min(prev, newProduct.maxAge || 60))
      );
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
        setSumAssured((prev) =>
          Math.max(newProduct.minSumAssured, Math.min(prev, newProduct.maxSumAssured))
        );
        const newMinTerm = newProduct.minTermYears || 5;
        const newMaxTerm = newProduct.maxTermYears || 30;
        setTermYears((prev) => Math.max(newMinTerm, Math.min(prev, newMaxTerm)));
        setApplicantAge((prev) =>
          Math.max(newProduct.minAge || 18, Math.min(prev, newProduct.maxAge || 60))
        );
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
    return simulationService.calculate(
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
  ]);

  const [asyncSimulationResult, setAsyncSimulationResult] = useState<SimulationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  // Fetch real quote calculation asynchronously from Core API
  useEffect(() => {
    if (!currentProduct) return;
    let isMounted = true;
    setIsCalculating(true);
    setCalculationError(null);

    const timer = setTimeout(async () => {
      try {
        const res = await simulationService.calculateAsync(
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
  ]);

  const simulationResult = asyncSimulationResult || syncSimulationResult;

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

  // Submit AI Assistant prompt
  const handleAskAI = (promptText?: string) => {
    const query = promptText || aiAssistantQuery;
    if (!query.trim()) return;
    router.push(`/assistant?q=${encodeURIComponent(query.trim())}`);
  };

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

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

  const productOptions = useMemo(() => {
    return initialProducts.map((p) => ({
      value: p.id,
      label: `${p.title} (${p.category}) - Mulai ${p.monthlyPremiumStarting || p.startingPrice || 'Rp 100rb/bln'}`,
    }));
  }, [initialProducts]);

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

  if (!currentProduct || !simulationResult) {
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

        {/* Catalog Fallback Dropdown if more than 3 products */}
        {initialProducts.length > 3 && (
          <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
            <span className="font-medium">Opsi Produk Lainnya di Database:</span>
            <div className="w-full sm:w-80">
              <Select
                label=""
                aria-label="Katalog Produk Pilihan"
                value={selectedProductId}
                options={productOptions}
                onChange={(e) => handleProductChange(e.target.value)}
              />
            </div>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: 2-COLUMN SIMULATOR INTERFACE (Y: 370 - 1520)       */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Panel (Y: 370 - 1520) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-8 text-left">
          {/* Sub-section 1: Profil Risiko Tertanggung */}
          <section aria-labelledby="heading-risk-profile" className="space-y-5">
            <div className="space-y-1">
              <h2 id="heading-risk-profile" className="text-lg sm:text-xl font-extrabold text-[#0f172a]">
                1. Profil Risiko Tertanggung
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Parameter ini memengaruhi faktor risiko underwriting otomatis pada Core API.
              </p>
            </div>

            {/* Usia Input & Visual Box */}
            <div className="space-y-2">
              <label htmlFor="input-age" className="block text-xs sm:text-sm font-semibold text-slate-700">
                Usia Tertanggung:
              </label>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-extrabold text-[#0f172a]">{applicantAge} Tahun</span>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                  Faktor Risiko Usia: {simulationResult.breakdown.ageFactor}x (Rentang {ageRangeLabel})
                </span>
              </div>

              <div className="pt-2">
                <Slider
                  label={`Geser untuk mengatur usia nasabah (${productMinAge} - ${productMaxAge} tahun):`}
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
                  label="Input Manual Usia:"
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

            {/* Jenis Kelamin Selector */}
            <div className="space-y-2">
              <span className="block text-xs sm:text-sm font-semibold text-slate-700">
                Jenis Kelamin:
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  aria-pressed={gender === 'male'}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                    gender === 'male'
                      ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {gender === 'male' ? '✓ ' : ''}Pria{formatFactorLabel(currentProduct?.genderFactors?.male ?? 1.05, 'Faktor')}
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  aria-pressed={gender === 'female'}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                    gender === 'female'
                      ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {gender === 'female' ? '✓ ' : ''}Wanita{formatFactorLabel(currentProduct?.genderFactors?.female ?? 1.00, 'Faktor')}
                </button>
              </div>
            </div>

            {/* Kebiasaan Merokok Selector */}
            <div className="space-y-2">
              <span className="block text-xs sm:text-sm font-semibold text-slate-700">
                Kebiasaan Merokok:
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsSmoker(false)}
                  aria-pressed={!isSmoker}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                    !isSmoker
                      ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {!isSmoker ? '✓ ' : ''}Bukan Perokok{formatFactorLabel(currentProduct?.smokerFactors?.no ?? 1.00)}
                </button>
                <button
                  type="button"
                  onClick={() => setIsSmoker(true)}
                  aria-pressed={isSmoker}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                    isSmoker
                      ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {isSmoker ? '✓ ' : ''}Perokok Aktif{formatFactorLabel(currentProduct?.smokerFactors?.yes ?? 1.35)}
                </button>
              </div>
            </div>

            {/* Tingkat Risiko Pekerjaan Selector */}
            <div className="space-y-2">
              <span className="block text-xs sm:text-sm font-semibold text-slate-700">
                Tingkat Risiko Pekerjaan:
              </span>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setOccupationRisk('low')}
                  aria-pressed={occupationRisk === 'low'}
                  className={`py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all border text-center ${
                    occupationRisk === 'low'
                      ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {occupationRisk === 'low' ? '✓ ' : ''}Rendah{formatFactorLabel(currentProduct?.occupationFactors?.low ?? 0.95)}
                </button>
                <button
                  type="button"
                  onClick={() => setOccupationRisk('standard')}
                  aria-pressed={occupationRisk === 'standard'}
                  className={`py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all border text-center ${
                    occupationRisk === 'standard'
                      ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {occupationRisk === 'standard' ? '✓ ' : ''}Standar{formatFactorLabel(currentProduct?.occupationFactors?.standard ?? 1.00)}
                </button>
                <button
                  type="button"
                  onClick={() => setOccupationRisk('high')}
                  aria-pressed={occupationRisk === 'high'}
                  className={`py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all border text-center ${
                    occupationRisk === 'high'
                      ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {occupationRisk === 'high' ? '✓ ' : ''}Tinggi{formatFactorLabel(currentProduct?.occupationFactors?.high ?? 1.40)}
                </button>
              </div>
            </div>
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
                <span className="text-xs sm:text-sm font-medium text-slate-500">
                  ({numberToRupiahWords(sumAssured)})
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {sumAssuredPresets.map((preset) => {
                  const isPresetActive = sumAssured === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setSumAssured(preset.value)}
                      aria-pressed={isPresetActive}
                      className={`py-2 px-3 rounded-full text-xs font-semibold border transition-all text-center ${
                        isPresetActive
                          ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                          : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
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
          <div className="bg-[#0f172a] text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl space-y-5 text-left">
            {/* Live Tag & Status */}
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e293b] text-[#38bdf8] text-[10px] font-bold tracking-wider uppercase">
                <span className={`w-1.5 h-1.5 rounded-full bg-[#38bdf8] ${isCalculating ? 'animate-ping' : ''}`} />
                LIVE CORE API QUOTE ENGINE
                {isCalculating && (
                  <span className="text-[9px] text-slate-400 font-normal lowercase">
                    (menghitung...)
                  </span>
                )}
              </span>
              {simulationResult?.ojkTableReference && (
                <span className="text-[10px] text-slate-400 truncate max-w-[180px]" title={simulationResult.ojkTableReference}>
                  {simulationResult.ojkTableReference}
                </span>
              )}
            </div>

            {calculationError && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
                <span className="font-semibold">Info:</span> {calculationError}
              </div>
            )}

            {/* Header */}
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Ringkasan Estimasi Premi
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {currentProduct.title} • UP {formatRupiah(sumAssured)}
              </p>
            </div>

            {/* Big Price Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#1e293b] border border-slate-700/60 space-y-2">
              <span className="block text-[11px] font-bold text-[#38bdf8] uppercase tracking-wider">
                ESTIMASI PREMI {frequency === 'monthly' ? 'BULANAN' : 'TAHUNAN'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {formatRupiah(simulationResult.activePremium)}
                </span>
                <span className="text-xs sm:text-sm text-slate-400 font-medium">
                  / {frequency === 'monthly' ? 'bulan' : 'tahun'}
                </span>
              </div>
              <p className="text-xs font-medium text-emerald-300">
                {frequency === 'monthly'
                  ? `atau ${formatRupiah(simulationResult.annualPremium)} / tahun (Hemat ${formatRupiah(simulationResult.annualSavings)})`
                  : `atau setara ${formatRupiah(simulationResult.monthlyPremium)} / bulan`}
              </p>
            </div>

            {/* Pricing Rules Factor Breakdown Box */}
            <div className="p-4 rounded-2xl bg-[#1e293b] border border-slate-700/60 space-y-2.5 text-xs">
              <h3 className="text-xs font-bold text-slate-200 pb-1 border-b border-slate-700/60">
                Rincian Perhitungan Pricing Rules:
              </h3>

              <div className="space-y-2 text-slate-400">
                <div className="flex justify-between items-center">
                  <span>Base Rate Produk ({currentProduct.category})</span>
                  <span className="font-semibold text-white">{currentProduct.baseRate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Faktor Usia ({applicantAge} Tahun)</span>
                  <span className="font-semibold text-white">{simulationResult.breakdown.ageFactor}x</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Faktor Gender ({gender === 'male' ? 'Pria' : 'Wanita'})</span>
                  <span className="font-semibold text-white">{simulationResult.breakdown.genderFactor}x</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Faktor {isSmoker ? 'Perokok Aktif' : 'Non-Smoker'}</span>
                  <span className="font-semibold text-white">{simulationResult.breakdown.smokerFactor}x</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>
                    Faktor Pekerjaan{' '}
                    {occupationRisk === 'low' ? 'Rendah' : occupationRisk === 'high' ? 'Tinggi' : 'Standar'}
                  </span>
                  <span className="font-semibold text-white">{simulationResult.breakdown.occupationFactor}x</span>
                </div>
                <div className="flex justify-between items-center text-emerald-300 font-medium">
                  <span>Diskon Bayar Tahunan</span>
                  <span className="font-bold">-{simulationResult.breakdown.annualDiscountPercent.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center text-[#38bdf8] font-medium pt-1 border-t border-slate-700/60">
                  <span>Status Underwriting Otomatis</span>
                  <span className="font-bold">ELIGIBLE</span>
                </div>
              </div>
            </div>

            {/* Benefits Checklist */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-200">Manfaat yang Langsung Aktif:</h4>
              <ul className="space-y-1.5 text-slate-300">
                {(currentProduct.features && currentProduct.features.length > 0
                  ? currentProduct.features
                  : [
                      `Santunan Proteksi UP (${formatRupiah(sumAssured)})`,
                      'Persetujuan underwriting otomatis dalam 5 menit',
                    ]
                ).map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust Note */}
            <div className="p-3 rounded-xl bg-[#1e293b] border border-slate-700/60 text-xs font-medium text-emerald-300 flex items-center gap-2">
              <span>🔒</span>
              <span>Premi transparan tanpa biaya tersembunyi & tanpa perantara.</span>
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
                className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3.5 shadow-md transition-all text-sm sm:text-base"
                onClick={handleContinueApply}
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

      {/* ------------------------------------------------------------- */}
      {/* SECTION 5: PRE-FOOTER AI ASSISTANT CARD (Y: 1990 - 2150)      */}
      {/* ------------------------------------------------------------- */}
      <section aria-labelledby="heading-ai-card" className="pt-4">
        <div className="bg-white rounded-2xl border border-slate-300 p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-left">
          <div className="space-y-1.5 max-w-xl">
            <span className="bg-indigo-100 text-indigo-700 text-[11px] font-bold px-2.5 py-1 rounded-md inline-block uppercase">
              AI ASSISTANT
            </span>
            <h2 id="heading-ai-card" className="text-lg sm:text-xl font-extrabold text-[#0f172a]">
              Butuh Rekomendasi Simulasi yang Tepat?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Tanyakan langsung perbandingan tenor, frekuensi bayar, atau simulasi khusus ke AI kami.
            </p>
          </div>

          <div className="space-y-3 w-full lg:w-auto shrink-0">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleAskAI('Berapa UP ideal untuk gaji 15jt?')}
                className="py-1.5 px-3.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-medium transition-colors"
              >
                Berapa UP ideal untuk gaji 15jt?
              </button>
              <button
                type="button"
                onClick={() => handleAskAI('Beda bayar tahunan vs bulanan')}
                className="py-1.5 px-3.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-medium transition-colors"
              >
                Beda bayar tahunan vs bulanan
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAI();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={aiAssistantQuery}
                onChange={(e) => setAiAssistantQuery(e.target.value)}
                placeholder="Tanyakan seputar simulasi atau premi polis..."
                className="py-2.5 px-4 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f172a] flex-1 min-w-[240px] sm:min-w-[320px]"
              />
              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-white font-semibold text-xs transition-all shrink-0"
              >
                Tanya AI
              </button>
            </form>
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
                  Premi Tahunan = (UP × BaseRate × FaktorUsia × FaktorGender × FaktorRokok × FaktorPekerjaan) + BiayaRiders
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
                  <span>Faktor Usia (Usia {simulationResult.applicantAge} Th):</span>
                  <span className="font-semibold text-slate-900">
                    {simulationResult.breakdown.ageFactor}x ({currentProduct.categoryKey === 'life' ? 'TMI-IV baseline 20 th' : 'Rentang ' + ageRangeLabel})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Faktor Gender:</span>
                  <span className="font-semibold text-slate-900">
                    {simulationResult.breakdown.genderFactor}x ({gender === 'male' ? 'Pria' : 'Wanita'})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Faktor Risiko Merokok:</span>
                  <span className="font-semibold text-slate-900">
                    {simulationResult.breakdown.smokerFactor}x ({isSmoker ? 'Perokok Aktif' : 'Bukan Perokok'})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Faktor Risiko Pekerjaan:</span>
                  <span className="font-semibold text-slate-900">
                    {simulationResult.breakdown.occupationFactor}x ({occupationRisk})
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2">
                  <span>Premi Dasar Tahunan:</span>
                  <span className="font-bold text-slate-900">
                    {formatRupiah(simulationResult.breakdown.baseAnnualPremium)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Biaya Riders ({simulationResult.selectedRiders.length}):</span>
                  <span className="font-bold text-blue-600">
                    {formatRupiah(simulationResult.breakdown.ridersAnnualTotal)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 text-sm">
                  <span className="font-bold text-slate-900">Total Premi Tahunan:</span>
                  <span className="font-extrabold text-blue-700">
                    {formatRupiah(simulationResult.annualPremium)}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed italic border-t border-slate-100 pt-3">
                Referensi Regulasi: {simulationResult.ojkTableReference}.
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
    </div>
  );
};
