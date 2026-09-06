'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Callout } from '@/components/molecules/Callout';
import { Badge } from '@/components/atoms/Badge';

export interface ApplicationReviewData {
  applicantName: string;
  nik: string;
  email: string;
  phone: string;
  productName: string;
  sumAssured: number;
  termYears: number;
  monthlyPremium: number;
  occupation: string;
  monthlyIncome: number;
  monthlyDebt: number;
  isSmoker: boolean;
}

export interface ApplicationStepReviewProps {
  data: ApplicationReviewData;
  onBack: () => void;
  onSubmitSuccess?: () => void;
  className?: string;
}

export const ApplicationStepReview: React.FC<ApplicationStepReviewProps> = ({
  data,
  onBack,
  onSubmitSuccess,
  className = '',
}) => {
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeDataPrivacy, setAgreeDataPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms || !agreeDataPrivacy) return;

    setIsSubmitting(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setIsSubmitting(false);
      onSubmitSuccess?.();
    }, 600);
  };

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-left ${className}`}
    >
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900">Tahap 4: Konfirmasi Ringkasan & Submit Aplikasi</h3>
        <p className="text-xs text-slate-500">
          Tinjau kembali seluruh informasi Anda sebelum dikirimkan ke antrean sistem underwriting digital.
        </p>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Policy Details */}
        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-900">Pilihan Produk Asuransi</span>
            <Badge variant="blue" size="sm">Paket Dipilih</Badge>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-sm text-slate-900 block">{data.productName}</span>
            <div className="flex justify-between text-[11px] text-slate-600 pt-1">
              <span>Uang Pertanggungan:</span>
              <strong className="text-slate-900">{formatRupiah(data.sumAssured)}</strong>
            </div>
            <div className="flex justify-between text-[11px] text-slate-600">
              <span>Masa Perlindungan:</span>
              <strong className="text-slate-900">{data.termYears} Tahun</strong>
            </div>
            <div className="flex justify-between text-[11px] text-slate-600">
              <span>Estimasi Premi Bulanan:</span>
              <strong className="text-blue-700 text-sm font-extrabold">{formatRupiah(data.monthlyPremium)} / bln</strong>
            </div>
          </div>
        </div>

        {/* Applicant Identity */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800">Identitas Pemohon</span>
            <Badge variant="emerald" size="sm">Dukcapil Ready</Badge>
          </div>
          <div className="space-y-1 text-[11px] text-slate-600">
            <div className="flex justify-between">
              <span>Nama Lengkap:</span>
              <strong className="text-slate-900">{data.applicantName}</strong>
            </div>
            <div className="flex justify-between">
              <span>NIK:</span>
              <strong className="text-slate-900">{data.nik}</strong>
            </div>
            <div className="flex justify-between">
              <span>Kontak Email:</span>
              <span className="text-slate-900 font-medium">{data.email}</span>
            </div>
            <div className="flex justify-between">
              <span>No. Handphone:</span>
              <span className="text-slate-900 font-medium">{data.phone}</span>
            </div>
            <div className="flex justify-between">
              <span>Status Merokok:</span>
              <span className="text-slate-900 font-medium">{data.isSmoker ? 'Perokok Aktif' : 'Bukan Perokok'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legal & Compliance Declarations */}
      <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Pernyataan & Persetujuan Pemohon:
        </h4>

        <Checkbox
          label="Kebenaran Data & Asas Iktikad Baik (Utmost Good Faith)"
          description="Saya menyatakan dengan sungguh-sungguh bahwa seluruh data identitas, pekerjaan, dan riwayat kesehatan yang diberikan adalah benar dan akurat."
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
        />

        <Checkbox
          label="Persetujuan Pemrosesan Data Pribadi (UU PDP No. 27/2022)"
          description="Saya menyetujui data saya diproses oleh sistem underwriting otomatis dan diverifikasi dengan instansi berwenang (Dukcapil & AAJI)."
          checked={agreeDataPrivacy}
          onChange={(e) => setAgreeDataPrivacy(e.target.checked)}
        />
      </div>

      <Callout variant="info" title="Langkah Setelah Submit:">
        Aplikasi Anda akan segera diproses oleh Underwriting Engine. Jika verifikasi 4 pilar lengkap,
        polis elektronik (e-Policy PDF) ber-QR Code resmi OJK akan diterbitkan dan dikirimkan langsung ke email Anda.
      </Callout>

      <div className="pt-4 flex items-center justify-between">
        <Button size="md" variant="outline" type="button" onClick={onBack} disabled={isSubmitting}>
          ← Kembali ke Skrining Medis
        </Button>
        <Button
          size="lg"
          variant="primary"
          type="submit"
          disabled={!agreeTerms || !agreeDataPrivacy || isSubmitting}
          className="shadow-md bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Asuransi Sekarang 🚀'}
        </Button>
      </div>
    </form>
  );
};
