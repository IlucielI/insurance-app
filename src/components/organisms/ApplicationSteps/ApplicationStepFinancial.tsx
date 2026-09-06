'use client';

import React, { useState } from 'react';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { FileUpload } from '@/components/atoms/FileUpload';
import { Button } from '@/components/atoms/Button';

export interface FinancialFormData {
  occupation: string;
  companyName: string;
  monthlyIncome: number;
  monthlyDebt: number;
  incomeProofFile: File | null;
}

export interface ApplicationStepFinancialProps {
  initialData?: Partial<FinancialFormData>;
  onBack: () => void;
  onNext: (data: FinancialFormData) => void;
  className?: string;
}

export const ApplicationStepFinancial: React.FC<ApplicationStepFinancialProps> = ({
  initialData,
  onBack,
  onNext,
  className = '',
}) => {
  const [occupation, setOccupation] = useState(initialData?.occupation || 'Karyawan Swasta / IT');
  const [companyName, setCompanyName] = useState(initialData?.companyName || 'PT Teknologi Nusantara');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(initialData?.monthlyIncome || 18_500_000);
  const [monthlyDebt, setMonthlyDebt] = useState<number>(initialData?.monthlyDebt || 1_800_000);
  const [incomeProofFile, setIncomeProofFile] = useState<File | null>(initialData?.incomeProofFile || null);

  const dsrRatio = monthlyIncome > 0 ? (monthlyDebt / monthlyIncome) * 100 : 0;
  const isDsrSafe = dsrRatio <= 15;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      occupation,
      companyName,
      monthlyIncome,
      monthlyDebt,
      incomeProofFile,
    });
  };

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-left ${className}`}
    >
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900">Tahap 2: Profil Finansial & Debt Service Ratio (DSR)</h3>
        <p className="text-xs text-slate-500">
          Underwriting engine memvalidasi kemampuan pembayaran premi dengan batas rasio beban cicilan (DSR &le; 15%).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Bidang Pekerjaan / Profesi*"
          value={occupation}
          options={[
            { value: 'Karyawan Swasta / IT', label: 'Karyawan Swasta / IT' },
            { value: 'Pegawai Negeri Sipil (PNS / BUMN)', label: 'Pegawai Negeri Sipil (PNS / BUMN)' },
            { value: 'Tenaga Medis (Dokter / Perawat)', label: 'Tenaga Medis (Dokter / Perawat)' },
            { value: 'Wiraswasta / Pemilik Usaha', label: 'Wiraswasta / Pemilik Usaha' },
            { value: 'Profesional Mandiri (Konsultan / Advokat)', label: 'Profesional Mandiri (Konsultan / Advokat)' },
          ]}
          onChange={(e) => setOccupation(e.target.value)}
        />

        <Input
          label="Nama Instansi / Perusahaan Pemberi Kerja*"
          placeholder="PT Nama Perusahaan..."
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />

        <Input
          label="Penghasilan Bersih Per Bulan (Take Home Pay)*"
          type="number"
          step={500000}
          value={monthlyIncome}
          onChange={(e) => setMonthlyIncome(Number(e.target.value) || 0)}
          helperText={`Terbaca: ${formatRupiah(monthlyIncome)}`}
        />

        <Input
          label="Total Cicilan Rutin & Kewajiban Bulanan Lainnya*"
          type="number"
          step={100000}
          value={monthlyDebt}
          onChange={(e) => setMonthlyDebt(Number(e.target.value) || 0)}
          helperText={`Terbaca: ${formatRupiah(monthlyDebt)}`}
        />
      </div>

      {/* DSR Live Indicator */}
      <div className={`p-4 rounded-xl border ${isDsrSafe ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-amber-50/60 border-amber-200 text-amber-900'} space-y-1.5`}>
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold">Indikator Estimasi DSR Aplikasi Anda:</span>
          <span className="font-extrabold text-sm">{dsrRatio.toFixed(1)}%</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          {isDsrSafe
            ? '✅ Rasio cicilan Anda di bawah batas aman 15%. Evaluasi pilar 2 underwriting diproyeksikan PASSED.'
            : '⚠️ Rasio cicilan Anda berada di atas ambang batas 15%. Dokumen rekening koran atau slip gaji tambahan akan diperlukan untuk verifikasi manual underwriter.'}
        </p>
      </div>

      {/* Upload Bukti Penghasilan */}
      <div className="pt-1">
        <FileUpload
          label="Unggah Slip Gaji Terbaru / Rekening Koran 3 Bulan"
          helperText="Format PDF atau JPG yang menampilkan mutasi kredit gaji masuk pemberi kerja."
          accept=".pdf,.jpg,.jpeg,.png"
          onFileSelect={setIncomeProofFile}
        />
      </div>

      <div className="pt-4 flex items-center justify-between">
        <Button size="md" variant="outline" type="button" onClick={onBack}>
          ← Kembali ke Data Identitas
        </Button>
        <Button size="md" variant="primary" type="submit">
          Lanjut ke Skrining Medis →
        </Button>
      </div>
    </form>
  );
};
