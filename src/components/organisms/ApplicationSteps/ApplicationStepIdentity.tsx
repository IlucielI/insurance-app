'use client';

import React, { useState } from 'react';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { FileUpload } from '@/components/atoms/FileUpload';
import { Button } from '@/components/atoms/Button';
import { Callout } from '@/components/molecules/Callout';

export interface IdentityFormData {
  nik: string;
  fullName: string;
  birthDate: string;
  gender: string;
  phone: string;
  email: string;
  ktpFile: File | null;
}

export interface ApplicationStepIdentityProps {
  initialData?: Partial<IdentityFormData>;
  onNext: (data: IdentityFormData) => void;
  className?: string;
}

export const ApplicationStepIdentity: React.FC<ApplicationStepIdentityProps> = ({
  initialData,
  onNext,
  className = '',
}) => {
  const [nik, setNik] = useState(initialData?.nik || '3171012908980002');
  const [fullName, setFullName] = useState(initialData?.fullName || 'Bayu Pratama');
  const [birthDate, setBirthDate] = useState(initialData?.birthDate || '1998-08-29');
  const [gender, setGender] = useState(initialData?.gender || 'MALE');
  const [phone, setPhone] = useState(initialData?.phone || '081298765432');
  const [email, setEmail] = useState(initialData?.email || 'bayu.pratama@example.com');
  const [ktpFile, setKtpFile] = useState<File | null>(initialData?.ktpFile || null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      nik,
      fullName,
      birthDate,
      gender,
      phone,
      email,
      ktpFile,
    });
  };

  const isFormValid =
    nik.length === 16 &&
    fullName.trim().length > 2 &&
    birthDate &&
    phone.length >= 10 &&
    email.includes('@');

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-left ${className}`}
    >
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900">Tahap 1: Data Identitas Diri & KTP</h3>
        <p className="text-xs text-slate-500">
          Data identitas Anda akan diverifikasi langsung ke basis data Dukcapil via API terenkripsi.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Nomor Induk Kependudukan (NIK 16 Digit)*"
          placeholder="Contoh: 3171012908980002"
          maxLength={16}
          value={nik}
          onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
          helperText="Wajib 16 digit sesuai e-KTP fisik."
        />

        <Input
          label="Nama Lengkap Sesuai KTP*"
          placeholder="Nama lengkap tanpa gelar..."
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <Input
          label="Tanggal Lahir*"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />

        <Select
          label="Jenis Kelamin*"
          value={gender}
          options={[
            { value: 'MALE', label: 'Laki-Laki' },
            { value: 'FEMALE', label: 'Perempuan' },
          ]}
          onChange={(e) => setGender(e.target.value)}
        />

        <Input
          label="Nomor Handphone / WhatsApp*"
          placeholder="0812xxxxxxx"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          helperText="Notifikasi progres polis akan dikirim ke nomor ini."
        />

        <Input
          label="Alamat Email Resmi*"
          placeholder="email@domain.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          helperText="Sertifikat polis (e-Policy PDF) dikirim ke email ini."
        />
      </div>

      {/* Upload KTP */}
      <div className="pt-2">
        <FileUpload
          label="Unggah Foto e-KTP Fisik (Resolusi Tinggi)"
          helperText="Pastikan NIK, foto, dan tanda tangan terlihat jelas tanpa pantulan kilap flash."
          accept=".jpg,.jpeg,.png,.pdf"
          onFileSelect={setKtpFile}
        />
      </div>

      <Callout variant="info" title="Keamanan Enkripsi Dukcapil">
        Seluruh transmisi NIK dan citra e-KTP diamankan menggunakan enkripsi AES-256 dan mematuhi
        regulasi perlindungan data pribadi (UU PDP No. 27/2022).
      </Callout>

      <div className="pt-4 flex justify-end">
        <Button size="md" variant="primary" type="submit" disabled={!isFormValid}>
          Simpan & Lanjut ke Profil Finansial →
        </Button>
      </div>
    </form>
  );
};
