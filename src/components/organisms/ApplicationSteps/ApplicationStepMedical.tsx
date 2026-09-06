'use client';

import React, { useState } from 'react';
import { Input } from '@/components/atoms/Input';
import { RadioCard } from '@/components/atoms/RadioCard';
import { Textarea } from '@/components/atoms/Textarea';
import { Button } from '@/components/atoms/Button';
import { Callout } from '@/components/molecules/Callout';

export interface MedicalFormData {
  heightCm: number;
  weightKg: number;
  hasHospitalization: boolean;
  hospitalizationDetails?: string;
  hasCriticalIllness: boolean;
  criticalIllnessDetails?: string;
  isSmoker: boolean;
}

export interface ApplicationStepMedicalProps {
  initialData?: Partial<MedicalFormData>;
  onBack: () => void;
  onNext: (data: MedicalFormData) => void;
  className?: string;
}

export const ApplicationStepMedical: React.FC<ApplicationStepMedicalProps> = ({
  initialData,
  onBack,
  onNext,
  className = '',
}) => {
  const [heightCm, setHeightCm] = useState(initialData?.heightCm || 172);
  const [weightKg, setWeightKg] = useState(initialData?.weightKg || 68);
  const [hasHospitalization, setHasHospitalization] = useState(initialData?.hasHospitalization || false);
  const [hospitalizationDetails, setHospitalizationDetails] = useState(initialData?.hospitalizationDetails || '');
  const [hasCriticalIllness, setHasCriticalIllness] = useState(initialData?.hasCriticalIllness || false);
  const [criticalIllnessDetails, setCriticalIllnessDetails] = useState(initialData?.criticalIllnessDetails || '');
  const [isSmoker, setIsSmoker] = useState(initialData?.isSmoker || false);

  const heightM = heightCm / 100;
  const bmi = heightM > 0 ? weightKg / (heightM * heightM) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      heightCm,
      weightKg,
      hasHospitalization,
      hospitalizationDetails,
      hasCriticalIllness,
      criticalIllnessDetails,
      isSmoker,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-left ${className}`}
    >
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900">Tahap 3: Kuesioner Kesehatan & Skrining Medis</h3>
        <p className="text-xs text-slate-500">
          Pernyataan riwayat kesehatan ini dilindungi asas iktikad baik (Utmost Good Faith) sesuai regulasi perasuransian OJK.
        </p>
      </div>

      {/* Body Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <Input
          label="Tinggi Badan (cm)*"
          type="number"
          min={100}
          max={230}
          value={heightCm}
          onChange={(e) => setHeightCm(Number(e.target.value) || 0)}
        />

        <Input
          label="Berat Badan (kg)*"
          type="number"
          min={30}
          max={200}
          value={weightKg}
          onChange={(e) => setWeightKg(Number(e.target.value) || 0)}
        />

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Indeks Massa Tubuh (BMI)</span>
          <span className="text-base font-extrabold text-blue-900 block mt-0.5">
            {bmi.toFixed(1)} kg/m²
          </span>
          <span className="text-[11px] text-slate-500 block">
            {bmi < 18.5 ? 'Berat Kurang' : bmi <= 25 ? 'Normal Ideal' : 'Kelebihan Berat'}
          </span>
        </div>
      </div>

      {/* Question 1: Smoker */}
      <div className="space-y-2 pt-2">
        <label className="block text-xs font-semibold text-slate-700 select-none">
          1. Apakah Anda merokok atau menggunakan rokok elektrik dalam 12 bulan terakhir?*
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RadioCard
            name="med-smoker"
            value="no"
            title="Tidak Pernah / Bukan Perokok"
            description="Tidak mengonsumsi produk tembakau/vape dalam 1 tahun terakhir."
            selected={!isSmoker}
            onChange={() => setIsSmoker(false)}
          />
          <RadioCard
            name="med-smoker"
            value="yes"
            title="Ya, Perokok Aktif / Vape"
            description="Tunduk pada penyesuaian aktuaria tarif risiko perokok."
            selected={isSmoker}
            onChange={() => setIsSmoker(true)}
          />
        </div>
      </div>

      {/* Question 2: Hospitalization */}
      <div className="space-y-2 pt-2">
        <label className="block text-xs font-semibold text-slate-700 select-none">
          2. Apakah Anda pernah menjalani rawat inap di rumah sakit dalam 2 tahun terakhir?*
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RadioCard
            name="med-hosp"
            value="no"
            title="Tidak Pernah Rawat Inap"
            description="Kondisi sehat tanpa catatan opname medis."
            selected={!hasHospitalization}
            onChange={() => setHasHospitalization(false)}
          />
          <RadioCard
            name="med-hosp"
            value="yes"
            title="Ya, Pernah Menjalani Rawat Inap"
            description="Memerlukan catatan diagnosa atau resume medis."
            selected={hasHospitalization}
            onChange={() => setHasHospitalization(true)}
          />
        </div>
        {hasHospitalization && (
          <div className="pt-2">
            <Textarea
              label="Keterangan Diagnosa Rawat Inap & Lama Perawatan*"
              placeholder="Sebutkan diagnosa dokter, nama rumah sakit, dan tahun perawatan..."
              value={hospitalizationDetails}
              onChange={(e) => setHospitalizationDetails(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Question 3: Critical Illness */}
      <div className="space-y-2 pt-2">
        <label className="block text-xs font-semibold text-slate-700 select-none">
          3. Apakah Anda didiagnosa memiliki riwayat penyakit jantung, kanker, diabetes, atau gagal ginjal?*
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RadioCard
            name="med-crit"
            value="no"
            title="Tidak Ada Riwayat Kritis"
            description="Bebas dari riwayat penyakit kardiovaskular dan metabolik berat."
            selected={!hasCriticalIllness}
            onChange={() => setHasCriticalIllness(false)}
          />
          <RadioCard
            name="med-crit"
            value="yes"
            title="Ya, Memiliki Riwayat Terdiagnosa"
            description="Memerlukan konfirmasi rekam medis spesialis lanjutan."
            selected={hasCriticalIllness}
            onChange={() => setHasCriticalIllness(true)}
          />
        </div>
        {hasCriticalIllness && (
          <div className="pt-2">
            <Textarea
              label="Rincian Riwayat Diagnosa Penyakit Kritis*"
              placeholder="Jelaskan tahun awal diagnosa dan obat rutin yang sedang dikonsumsi..."
              value={criticalIllnessDetails}
              onChange={(e) => setCriticalIllnessDetails(e.target.value)}
            />
          </div>
        )}
      </div>

      <Callout variant="warning" title="Pentingnya Keterbukaan Informasi:">
        Pernyataan yang tidak akurat dapat membatalkan perlindungan klaim asuransi di kemudian hari sesuai ketentuan Polis Standar AAJI.
      </Callout>

      <div className="pt-4 flex items-center justify-between">
        <Button size="md" variant="outline" type="button" onClick={onBack}>
          ← Kembali ke Profil Finansial
        </Button>
        <Button size="md" variant="primary" type="submit">
          Lanjut ke Ringkasan Akhir →
        </Button>
      </div>
    </form>
  );
};
