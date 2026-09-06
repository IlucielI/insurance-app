'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Textarea } from '@/components/atoms/Textarea';
import { FileUpload } from '@/components/atoms/FileUpload';
import { Button } from '@/components/atoms/Button';
import { Callout } from '@/components/molecules/Callout';

export interface ClaimFormData {
  policyNumber: string;
  claimType: string;
  incidentDate: string;
  hospitalName: string;
  claimedAmount: number;
  description: string;
  medicalProofFile: File | null;
}

export interface ClaimSubmissionFormProps {
  initialPolicyNumber?: string;
  onSubmitSuccess?: (data: ClaimFormData) => void;
  className?: string;
}

export const ClaimSubmissionForm: React.FC<ClaimSubmissionFormProps> = ({
  initialPolicyNumber = 'POL-SLP-20260906-0042',
  onSubmitSuccess,
  className = '',
}) => {
  const [policyNumber, setPolicyNumber] = useState(initialPolicyNumber);
  const [claimType, setClaimType] = useState('RAWAT_INAP');
  const [incidentDate, setIncidentDate] = useState('2026-09-01');
  const [hospitalName, setHospitalName] = useState('RS Medika Jakarta Pusat');
  const [claimedAmount, setClaimedAmount] = useState(15_000_000);
  const [description, setDescription] = useState(
    'Rawat inap 3 hari akibat demam berdarah dengue (DBD) di ruang perawatan VIP.'
  );
  const [medicalProofFile, setMedicalProofFile] = useState<File | null>(null);
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
    setIsSubmitting(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setIsSubmitting(false);
      onSubmitSuccess?.({
        policyNumber,
        claimType,
        incidentDate,
        hospitalName,
        claimedAmount,
        description,
        medicalProofFile,
      });
    }, 500);
  };

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-left ${className}`}
    >
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900">Formulir Pengajuan Klaim Asuransi Online</h3>
        <p className="text-xs text-slate-500">
          Proses klaim cepat berbasis OCR dokumen medis dengan SLA persetujuan 1x24 jam kerja.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Nomor Polis Asuransi Aktif*"
          value={policyNumber}
          onChange={(e) => setPolicyNumber(e.target.value)}
          placeholder="POL-xxx-xxx"
        />

        <Select
          label="Kategori / Jenis Manfaat Klaim*"
          value={claimType}
          options={[
            { value: 'RAWAT_INAP', label: 'Penggantian Biaya Rawat Inap Rumah Sakit' },
            { value: 'PENYAKIT_KRITIS', label: 'Santunan Diagnosis Penyakit Kritis Tahap Awal' },
            { value: 'SANTUNAN_DUKA', label: 'Klaim Manfaat Meninggal Dunia (Ahli Waris)' },
          ]}
          onChange={(e) => setClaimType(e.target.value)}
        />

        <Input
          label="Tanggal Kejadian / Masuk Rawat Inap*"
          type="date"
          value={incidentDate}
          onChange={(e) => setIncidentDate(e.target.value)}
        />

        <Input
          label="Nama Rumah Sakit / Klinik Rujukan*"
          value={hospitalName}
          onChange={(e) => setHospitalName(e.target.value)}
          placeholder="Nama fasilitas kesehatan..."
        />

        <div className="sm:col-span-2">
          <Input
            label="Nominal Total Biaya Klaim yang Diajukan*"
            type="number"
            step={500000}
            value={claimedAmount}
            onChange={(e) => setClaimedAmount(Number(e.target.value) || 0)}
            helperText={`Terbaca: ${formatRupiah(claimedAmount)}`}
          />
        </div>
      </div>

      <Textarea
        label="Uraian Kronologis Kejadian & Diagnosa*"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />

      <FileUpload
        label="Unggah Resume Medis / Kwitansi Rumah Sakit (Wajib)"
        helperText="Format berkas PDF atau foto kwitansi/surat diagnosa dokter yang dilegalisir RS (Maks. 10MB)"
        onFileSelect={setMedicalProofFile}
      />

      <Callout variant="info" title="SLA Pemrosesan Klaim Cepat:">
        Klaim di bawah Rp 25 Juta diproses otomatis dengan verifikasi OCR Rumah Sakit rekanan dalam waktu 1 hari kerja.
      </Callout>

      <div className="pt-2 flex justify-end">
        <Button size="lg" variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Mengirim Data Klaim...' : 'Kirim Pengajuan Klaim Digital ⚡'}
        </Button>
      </div>
    </form>
  );
};
