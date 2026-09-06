'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { InsuranceProduct } from '@/server/repositories/product.repository.interface';
import { simulationService } from '@/server/di';
import { Slider } from '@/components/atoms/Slider';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Checkbox } from '@/components/atoms/Checkbox';
import { RadioCard } from '@/components/atoms/RadioCard';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/atoms/Card';
import { Callout } from '@/components/molecules/Callout';

export interface SimulationWorkbenchProps {
  initialProducts: InsuranceProduct[];
  initialProductId?: string;
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

  // 2. Actuarial Parameters State
  const [sumAssured, setSumAssured] = useState<number>(() => {
    if (!currentProduct) return 500_000_000;
    return Math.max(
      currentProduct.minSumAssured,
      Math.min(500_000_000, currentProduct.maxSumAssured)
    );
  });

  const minTerm = 5;
  const maxTerm = 20;

  const [termYears, setTermYears] = useState<number>(() => {
    return 10;
  });

  const [applicantAge, setApplicantAge] = useState<number>(28);
  const [isSmoker, setIsSmoker] = useState<boolean>(false);
  const [frequency, setFrequency] = useState<'monthly' | 'annually'>('monthly');
  const [selectedRiderIds, setSelectedRiderIds] = useState<string[]>([]);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState<boolean>(false);

  // Switch product and adjust bounds if needed
  const handleProductChange = (newProductId: string) => {
    setSelectedProductId(newProductId);
    const newProduct = initialProducts.find((p) => p.id === newProductId);
    if (newProduct) {
      setSumAssured((prev) =>
        Math.max(newProduct.minSumAssured, Math.min(prev, newProduct.maxSumAssured))
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

  // Sync selected product during render when initialProductId changes (official React pattern)
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

  // 3. Dynamic Calculation Result via Clean Actuarial Service
  const simulationResult = useMemo(() => {
    if (!currentProduct) return null;
    return simulationService.calculate(
      {
        productId: currentProduct.id,
        sumAssured,
        termYears,
        applicantAge,
        isSmoker,
        frequency,
        selectedRiderIds,
      },
      currentProduct
    );
  }, [currentProduct, sumAssured, termYears, applicantAge, isSmoker, frequency, selectedRiderIds]);

  // Navigate to application page with pre-filled actuarial quote
  const handleContinueApply = () => {
    if (!currentProduct) return;
    const params = new URLSearchParams({
      productId: currentProduct.id,
      sumAssured: String(sumAssured),
      termYears: String(termYears),
      age: String(applicantAge),
      isSmoker: String(isSmoker),
      frequency,
      riders: selectedRiderIds.join(','),
    });
    router.push(`/apply?${params.toString()}`);
  };

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  const productOptions = useMemo(() => {
    return initialProducts.map((p) => ({
      value: p.id,
      label: `${p.title} (${p.category}) - Mulai ${p.startingPrice}`,
    }));
  }, [initialProducts]);

  // Preset buttons
  const sumAssuredPresets = [
    { label: 'Rp 250 Jt', value: 250_000_000 },
    { label: 'Rp 500 Jt', value: 500_000_000 },
    { label: 'Rp 1 Miliar', value: 1_000_000_000 },
    { label: 'Rp 2 Miliar', value: 2_000_000_000 },
  ].filter(
    (preset) =>
      currentProduct &&
      preset.value >= currentProduct.minSumAssured &&
      preset.value <= currentProduct.maxSumAssured
  );

  const termPresets = [5, 10, 15, 20].filter(
    (term) => term >= minTerm && term <= maxTerm
  );

  if (!currentProduct || !simulationResult) {
    return (
      <div className="py-20 text-center text-slate-500">
        Memuat data katalog produk simulasi...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Breadcrumbs */}
      <div className="space-y-3 text-left">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-blue-600 transition-colors">
            Katalog Produk
          </Link>
          <span>/</span>
          <span className="text-blue-600">Simulasi Premi</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
              <span>🧮</span> Kalkulator Aktuaria OJK 2026
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Simulasi Premi & Perencanaan Proteksi
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl mt-1">
              Sesuaikan nilai perlindungan, durasi tenor, dan opsi rider secara transparan tanpa
              biaya tersembunyi berdasarkan Tabel Mortalita Indonesia (TMI-IV).
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/60 hover:bg-blue-100/60 px-3.5 py-2 rounded-xl transition-all self-start md:self-auto"
          >
            <span>←</span> Pilih Produk Lain di Katalog
          </Link>
        </div>
      </div>

      {/* Main Grid: Parameters (Left) vs Sticky Result Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Parameter Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Product Selection & Highlights Card */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-left">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                Langkah 1
              </span>
              <h2 className="text-lg font-bold text-slate-900">Pilih Produk Asuransi Jiwa & Kesehatan</h2>
            </div>

            <Select
              label="Katalog Produk Pilihan"
              value={selectedProductId}
              options={productOptions}
              onChange={(e) => handleProductChange(e.target.value)}
            />

            {/* Selected Product Snapshot Card */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{currentProduct.title}</span>
                  <Badge variant="blue" size="sm">
                    {currentProduct.category}
                  </Badge>
                  {currentProduct.isPopular && (
                    <Badge variant="emerald" size="sm">
                      Terpopuler
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-600">{currentProduct.description}</p>
              </div>

              <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Metode Klaim
                </span>
                <span className="text-xs font-bold text-slate-800 capitalize">
                  {currentProduct.claimMethod === 'cashless'
                    ? '💳 Cashless Digital'
                    : currentProduct.claimMethod === 'instant_transfer'
                    ? '⚡ Transfer Instan 24 Jam'
                    : '📄 Reimbursement'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Sum Assured & Protection Term Sliders */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-left">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                Langkah 2
              </span>
              <h2 className="text-lg font-bold text-slate-900">Uang Pertanggungan & Masa Perlindungan</h2>
              <p className="text-xs text-slate-500">
                Tentukan nilai santunan tunai yang diwariskan kepada keluarga dan durasi kontrak polis.
              </p>
            </div>

            {/* Sum Assured Slider */}
            <div className="space-y-2">
              <Slider
                label="Uang Pertanggungan (Santunan Tunai)"
                min={currentProduct.minSumAssured}
                max={currentProduct.maxSumAssured}
                step={50_000_000}
                value={sumAssured}
                onChange={setSumAssured}
                formatValue={(val) => `Rp ${(val / 1_000_000).toLocaleString('id-ID')} Juta`}
                minLabel={formatRupiah(currentProduct.minSumAssured)}
                maxLabel={formatRupiah(currentProduct.maxSumAssured)}
              />

              {sumAssuredPresets.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-medium text-slate-400">Pilihan Cepat:</span>
                  {sumAssuredPresets.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setSumAssured(p.value)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                        sumAssured === p.value
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Protection Term Slider */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Slider
                label="Masa Perlindungan Polis (Tenor Garansi)"
                min={minTerm}
                max={maxTerm}
                step={5}
                value={termYears}
                onChange={setTermYears}
                formatValue={(val) => `${val} Tahun`}
                minLabel={`${minTerm} Th`}
                maxLabel={`${maxTerm} Th`}
              />

              {termPresets.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-medium text-slate-400">Pilihan Durasi:</span>
                  {termPresets.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setTermYears(term)}
                      className={`text-[11px] font-bold px-3 py-1 rounded-lg border transition-all ${
                        termYears === term
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {term} Tahun
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. Applicant Profile & Risk Factor */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-left">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                Langkah 3
              </span>
              <h2 className="text-lg font-bold text-slate-900">Profil Risiko & Usia Tertanggung</h2>
              <p className="text-xs text-slate-500">
                Tabel mortalita aktuaria mengukur risiko berdasarkan usia masuk dan gaya hidup merokok.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <Input
                label="Usia Tertanggung Saat Masuk (Tahun)"
                type="number"
                min={18}
                max={65}
                value={applicantAge || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setApplicantAge(val === '' ? 0 : Number(val));
                }}
                onBlur={() => {
                  setApplicantAge((prev) => Math.min(65, Math.max(18, prev || 18)));
                }}
                helperText="Rentang usia masuk nasabah: 18 s/d 65 tahun."
              />

              <div className="pt-2">
                <Checkbox
                  label="Status Perokok Aktif"
                  description="Mengonsumsi rokok konvensional atau vape dalam 12 bulan terakhir (faktor risiko OJK 1.35x)."
                  checked={isSmoker}
                  onChange={(e) => setIsSmoker(e.target.checked)}
                />
              </div>
            </div>

            {/* Payment Frequency RadioCards */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 select-none">
                Frekuensi Pembayaran Premi
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <RadioCard
                  name="simulation-frequency"
                  value="monthly"
                  title="Bulanan (Monthly)"
                  description="Autodebet fleksibel setiap bulan via kartu debit/kredit & e-wallet."
                  selected={frequency === 'monthly'}
                  onChange={() => setFrequency('monthly')}
                />
                <RadioCard
                  name="simulation-frequency"
                  value="annually"
                  title="Tahunan (Annual)"
                  badgeText="Diskon 10%"
                  badgeVariant="emerald"
                  description="Bayar 1 tahun di muka, hemat setara 1.2 bulan premi proteksi."
                  selected={frequency === 'annually'}
                  onChange={() => setFrequency('annually')}
                />
              </div>
            </div>
          </div>

          {/* 4. Add-on Riders (Optional Protections) */}
          {currentProduct.riders && currentProduct.riders.length > 0 && (
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-left">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  Langkah 4 (Opsional)
                </span>
                <h2 className="text-lg font-bold text-slate-900">Manfaat Tambahan (Riders)</h2>
                <p className="text-xs text-slate-500">
                  Lengkapi polis dasar Anda dengan proteksi pelengkap komprehensif.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentProduct.riders.map((rider) => {
                  const isChecked = selectedRiderIds.includes(rider.id);
                  return (
                    <label
                      key={rider.id}
                      htmlFor={`rider-${rider.id}`}
                      className={`relative flex items-start gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        isChecked
                          ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/10 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
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
                          <span className="text-[11px] font-extrabold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                            {rider.extraPrice}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Proteksi klaim mandiri tanpa mengurangi santunan tunai dasar polis.
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Underwriting & Regulatory Callout */}
          <Callout
            variant="info"
            title="Standar Transparansi Aktuaria OJK 2026"
            description="Kalkulasi premi di atas merupakan estimasi ilustrasi terstandar berdasarkan Tabel Mortalita Indonesia IV (TMI-IV) dan POJK No. 23/POJK.05/2015. Seluruh polis dijamin oleh regulasi asuransi digital berizin resmi."
          />
        </div>

        {/* Right Column: Sticky Result Card */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <Card
            variant="elevated"
            className="border-blue-100 bg-linear-to-b from-white to-blue-50/20 text-left shadow-lg shadow-blue-900/5"
          >
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <Badge variant="blue" size="sm">
                  Hasil Estimasi Aktuaria
                </Badge>
                <span className="text-[11px] font-semibold text-slate-500">
                  Usia {simulationResult.applicantAge} Th • Masa {simulationResult.termYears} Th
                </span>
              </div>
              <CardTitle className="text-xl text-slate-900 mt-1">
                {currentProduct.title}
              </CardTitle>
              <CardDescription>
                Simulasi premi terverifikasi formula tabel mortalita OJK 2026.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Main Price Highlight Box */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-md shadow-slate-900/10 space-y-1 text-left">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Estimasi Kontribusi Premi ({frequency === 'monthly' ? 'Bulanan' : 'Tahunan'})</span>
                  {frequency === 'annually' && simulationResult.annualSavings > 0 && (
                    <span className="text-emerald-400 font-bold text-[11px]">
                      Hemat {formatRupiah(simulationResult.annualSavings)}/th
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold tracking-tight text-white">
                    {formatRupiah(simulationResult.activePremium)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    / {frequency === 'monthly' ? 'bulan' : 'tahun'}
                  </span>
                </div>
              </div>

              {/* Underwriting Tier Status */}
              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                  simulationResult.breakdown.underwritingTier === 'guaranteed_issue'
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : simulationResult.breakdown.underwritingTier === 'simplified'
                    ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                    : 'bg-amber-50/70 border-amber-200 text-amber-900'
                }`}
              >
                <span className="text-base leading-none">
                  {simulationResult.breakdown.underwritingTier === 'guaranteed_issue'
                    ? '⚡'
                    : simulationResult.breakdown.underwritingTier === 'simplified'
                    ? '📋'
                    : '🩺'}
                </span>
                <div className="space-y-0.5">
                  <span className="font-bold block">
                    Kategori Underwriting:{' '}
                    {simulationResult.breakdown.underwritingTier === 'guaranteed_issue'
                      ? 'Instant Approval'
                      : simulationResult.breakdown.underwritingTier === 'simplified'
                      ? 'Simplified Issue'
                      : 'Full Underwriting'}
                  </span>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {simulationResult.breakdown.underwritingDescription}
                  </p>
                </div>
              </div>

              {/* Breakdown Items */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Santunan Uang Pertanggungan</span>
                  <span className="font-bold text-slate-900">{formatRupiah(sumAssured)}</span>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Masa Garansi Perlindungan</span>
                  <span className="font-semibold text-slate-800">{termYears} Tahun Polis Aktif</span>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Biaya Manfaat Tambahan (Riders)</span>
                  <span className="font-semibold text-slate-800">
                    {simulationResult.selectedRiders.length > 0
                      ? frequency === 'monthly'
                        ? `${formatRupiah(
                            simulationResult.selectedRiders.reduce((acc, r) => acc + r.monthlyCost, 0)
                          )}/bln (${simulationResult.selectedRiders.length} rider)`
                        : `${formatRupiah(
                            simulationResult.selectedRiders.reduce((acc, r) => acc + r.annualCost, 0)
                          )}/th (${simulationResult.selectedRiders.length} rider)`
                      : 'Rp 0 (Tidak Ada Rider)'}
                  </span>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Biaya Administrasi & Polis Digital</span>
                  <span className="font-semibold text-emerald-600">Gratis (Ditanggung Sistem)</span>
                </div>
              </div>

              {/* Modal Trigger */}
              <button
                type="button"
                onClick={() => setIsBreakdownModalOpen(true)}
                className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline py-1 transition-all"
              >
                🔍 Lihat Rincian Rumus Aktuaria OJK
              </button>

              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                *Angka premi final tunduk pada hasil verifikasi underwriting 4 pilar (kesehatan, riwayat
                merokok, dan validasi debt-to-income).
              </p>
            </CardContent>

            <CardFooter className="pt-2">
              <Button
                size="lg"
                variant="primary"
                className="w-full font-bold shadow-md hover:shadow-lg transition-all"
                onClick={handleContinueApply}
              >
                Lanjutkan Pendaftaran Polis 📝
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

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
                  Premi Tahunan = (UP × BaseRate × FaktorUsia × FaktorRokok) + BiayaRiders
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
                    {simulationResult.breakdown.ageFactor}x (TMI-IV baseline 20 th)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Faktor Risiko Merokok:</span>
                  <span className="font-semibold text-slate-900">
                    {simulationResult.breakdown.smokerFactor}x ({isSmoker ? 'Perokok Aktif' : 'Bukan Perokok'})
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
