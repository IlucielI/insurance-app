'use client';

import React, { useState } from 'react';
import { Slider } from '@/components/atoms/Slider';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Checkbox } from '@/components/atoms/Checkbox';
import { RadioCard } from '@/components/atoms/RadioCard';
import { SimulationResultCard } from '@/components/molecules/SimulationResultCard';

export interface PremiumCalculatorProps {
  initialProductId?: string;
  onContinueApplication?: (calculationData: {
    productId: string;
    productName: string;
    sumAssured: number;
    termYears: number;
    applicantAge: number;
    isSmoker: boolean;
    frequency: 'monthly' | 'annually';
    monthlyPremium: number;
    annualPremium: number;
  }) => void;
  className?: string;
}

export const PremiumCalculator: React.FC<PremiumCalculatorProps> = ({
  initialProductId = 'term-life-guard',
  onContinueApplication,
  className = '',
}) => {
  const [productId, setProductId] = useState(initialProductId);
  const [sumAssured, setSumAssured] = useState(500_000_000); // 500 Juta default
  const [termYears, setTermYears] = useState(10); // 10 Tahun default
  const [age, setAge] = useState(28);
  const [isSmoker, setIsSmoker] = useState(false);
  const [frequency, setFrequency] = useState<'monthly' | 'annually'>('monthly');

  const products = [
    { value: 'term-life-guard', label: 'Term Life Guard Plus (Proteksi Jiwa Murni)', baseRate: 0.0035 },
    { value: 'critical-shield', label: 'Critical Illness Shield (50+ Penyakit Kritis)', baseRate: 0.0052 },
    { value: 'educare-future', label: 'EduCare Future (Jaminan Dana Pendidikan)', baseRate: 0.0048 },
  ];

  const currentProduct = products.find((p) => p.value === productId) || products[0];

  // Actuarial formula mock based on OJK mortality tables
  // Monthly rate calculation: sumAssured * baseRate * ageFactor * smokerFactor / 12
  const ageFactor = 1 + Math.max(0, (age - 20) * 0.025);
  const smokerFactor = isSmoker ? 1.35 : 1.0;
  const rawAnnual = sumAssured * currentProduct.baseRate * ageFactor * smokerFactor;
  const annualPremium = Math.round(rawAnnual / 10_000) * 10_000;
  // Monthly has 10% operational margin compared to annual
  const monthlyPremium = Math.round((annualPremium / 12) * 1.1 / 1_000) * 1_000;

  const handleApply = () => {
    onContinueApplication?.({
      productId,
      productName: currentProduct.label,
      sumAssured,
      termYears,
      applicantAge: age,
      isSmoker,
      frequency,
      monthlyPremium,
      annualPremium,
    });
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-start ${className}`}>
      {/* Inputs Column */}
      <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-left">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">Parameter Simulasi Premi Asuransi</h3>
          <p className="text-xs text-slate-500">
            Sesuaikan nilai pertanggungan dan durasi proteksi sesuai profil perencanaan keluarga Anda.
          </p>
        </div>

        {/* Product Selection */}
        <Select
          label="Pilih Produk Asuransi Jiwa"
          value={productId}
          options={products}
          onChange={(e) => setProductId(e.target.value)}
        />

        {/* Sum Assured Slider */}
        <Slider
          label="Uang Pertanggungan (Santunan Tunai)"
          min={100_000_000}
          max={2_500_000_000}
          step={50_000_000}
          value={sumAssured}
          onChange={setSumAssured}
          formatValue={(val) => `Rp ${(val / 1_000_000).toLocaleString('id-ID')} Juta`}
          minLabel="Rp 100 Jt"
          maxLabel="Rp 2.5 M"
        />

        {/* Term Slider */}
        <Slider
          label="Masa Perlindungan Polis"
          min={5}
          max={20}
          step={5}
          value={termYears}
          onChange={setTermYears}
          formatValue={(val) => `${val} Tahun`}
          minLabel="5 Tahun"
          maxLabel="20 Tahun"
        />

        {/* Age and Smoker Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
          <Input
            label="Usia Tertanggung Saat Ini (Tahun)"
            type="number"
            min={18}
            max={65}
            value={age}
            onChange={(e) => setAge(Math.min(65, Math.max(18, Number(e.target.value) || 18)))}
            helperText="Rentang usia masuk nasabah: 18 - 65 tahun."
          />

          <div className="pt-2">
            <Checkbox
              label="Perokok Aktif"
              description="Konsumsi rokok konvensional / vape dalam 12 bulan terakhir."
              checked={isSmoker}
              onChange={(e) => setIsSmoker(e.target.checked)}
            />
          </div>
        </div>

        {/* Payment Frequency Options */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-slate-700 select-none">
            Frekuensi Pembayaran Premi
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <RadioCard
              name="payment-freq"
              value="monthly"
              title="Bulanan (Monthly)"
              description="Autodebet fleksibel setiap bulan via rekening / kartu kredit."
              selected={frequency === 'monthly'}
              onChange={() => setFrequency('monthly')}
            />
            <RadioCard
              name="payment-freq"
              value="annually"
              title="Tahunan (Annual)"
              badgeText="Diskon 10%"
              badgeVariant="emerald"
              description="Bayar 1 tahun di muka, hemat setara 1.2 bulan premi."
              selected={frequency === 'annually'}
              onChange={() => setFrequency('annually')}
            />
          </div>
        </div>
      </div>

      {/* Result Column */}
      <div className="lg:col-span-5 sticky top-24">
        <SimulationResultCard
          productName={currentProduct.label}
          sumAssured={sumAssured}
          monthlyPremium={monthlyPremium}
          annualPremium={annualPremium}
          paymentFrequency={frequency}
          termYears={termYears}
          applicantAge={age}
          onApply={handleApply}
        />
      </div>
    </div>
  );
};
