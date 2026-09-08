import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';

export interface SimulationResultCardProps {
  productName: string;
  sumAssured: number;
  monthlyPremium: number;
  annualPremium: number;
  paymentFrequency: 'monthly' | 'annually';
  termYears: number;
  applicantAge: number;
  dynamicFactors?: { ruleCode: string; ruleName: string; factor: number }[];
  onApply?: () => void;
  className?: string;
}

export const SimulationResultCard: React.FC<SimulationResultCardProps> = ({
  productName,
  sumAssured,
  monthlyPremium,
  annualPremium,
  paymentFrequency,
  termYears,
  applicantAge,
  dynamicFactors,
  onApply,
  className = '',
}) => {

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  const currentPremium = paymentFrequency === 'monthly' ? monthlyPremium : annualPremium;
  const annualSavings = monthlyPremium * 12 - annualPremium;

  return (
    <Card
      variant="elevated"
      className={`border-blue-100 bg-linear-to-b from-white to-blue-50/20 text-left ${className}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <Badge variant="blue" size="sm">
            Hasil Estimasi Aktuaria
          </Badge>
          <span className="text-[11px] font-semibold text-slate-500">
            Usia {applicantAge} Th • Masa {termYears} Th
          </span>
        </div>
        <CardTitle className="text-xl text-slate-900 mt-1">{productName}</CardTitle>
        <CardDescription>
          Simulasi premi terverifikasi formula tabel mortalita OJK 2026.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Price Highlight Box */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-md shadow-slate-900/10 space-y-1 text-left transition-all duration-300">
          <div
            key={`sim-head-${paymentFrequency}`}
            className="flex items-center justify-between text-xs text-slate-400 animate-badge-fade"
          >
            <span>Estimasi Premi ({paymentFrequency === 'monthly' ? 'Bulanan' : 'Tahunan'})</span>
            {paymentFrequency === 'annually' && annualSavings > 0 && (
              <span className="text-emerald-400 font-bold text-[11px]">
                Hemat {formatRupiah(annualSavings)}/th
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1.5">
            <div
              key={`sim-price-${paymentFrequency}-${currentPremium}`}
              className="flex items-baseline gap-1.5 animate-price-fade"
            >
              <span className="text-3xl font-extrabold tracking-tight text-white">
                {formatRupiah(currentPremium)}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                / {paymentFrequency === 'monthly' ? 'bulan' : 'tahun'}
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown Items */}
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Santunan Meninggal Dunia</span>
            <span className="font-bold text-slate-900">{formatRupiah(sumAssured)}</span>
          </div>
          <div className="h-px bg-slate-100" />
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Masa Pertanggungan</span>
            <span className="font-semibold text-slate-800">{termYears} Tahun Garansi Polis</span>
          </div>
          <div className="h-px bg-slate-100" />
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Biaya Administrasi & Polis</span>
            <span className="font-semibold text-emerald-600">Gratis (Ditanggung Sistem)</span>
          </div>
        </div>

        {dynamicFactors && dynamicFactors.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {dynamicFactors.map((df) => (
              <span
                key={df.ruleCode}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200"
              >
                {df.ruleName}: {df.factor}x
              </span>
            ))}
          </div>
        )}

        <p className="text-[11px] text-slate-400 leading-relaxed italic">

          *Angka premi final tunduk pada hasil verifikasi underwriting 4 pilar (kesehatan, riwayat
          merokok, dan rasio debt-to-income).
        </p>
      </CardContent>

      <CardFooter>
        <Button size="lg" variant="primary" className="w-full font-bold shadow-md" onClick={onApply}>
          Lanjutkan Pendaftaran Sekarang 📝
        </Button>
      </CardFooter>
    </Card>
  );
};
