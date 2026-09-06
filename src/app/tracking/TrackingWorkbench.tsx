'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PolicyApplication } from '@/types/application.types';
import { Card } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { FileUpload } from '@/components/atoms/FileUpload';
import { Spinner } from '@/components/atoms/Spinner';
import { applicationService } from '@/server/di';

import { ClaimSubmissionForm, ClaimFormData } from '@/components/organisms/ClaimSubmissionForm';

export interface TrackingWorkbenchProps {
  initialApplication?: PolicyApplication | null;
  initialQuery?: string;
}

const formatRupiah = (val: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
};

const formatDate = (isoString?: string): string => {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
};

const getStatusBadge = (status: PolicyApplication['overallStatus']) => {
  switch (status) {
    case 'approved':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-bold text-xs">
          ● STATUS: APPROVED
          <span className="sr-only">Polis Disetujui & Aktif</span>
        </span>
      );
    case 'under_review':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-amber-400 font-bold text-xs">
          ● STATUS: UNDER REVIEW
          <span className="sr-only">Dalam Review Underwriting</span>
        </span>
      );
    case 'rfi_requested':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 font-bold text-xs">
          ● STATUS: RFI REQUESTED
          <span className="sr-only">Dokumen Tambahan Diperlukan (RFI)</span>
        </span>
      );
    case 'submitted':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-blue-400 font-bold text-xs">
          ● STATUS: SUBMITTED
          <span className="sr-only">Berkas Diterima Sistem</span>
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 font-bold text-xs">
          ● STATUS: REJECTED
          <span className="sr-only">Pengajuan Ditolak</span>
        </span>
      );
    default:
      return <Badge variant="slate" size="md">{status}</Badge>;
  }
};

const getPillarBadge = (status: 'PASSED' | 'FLAGGED' | 'PENDING' | 'FAILED') => {
  switch (status) {
    case 'PASSED':
      return <span className="text-emerald-600 font-bold text-xs">✓ PASSED</span>;
    case 'FLAGGED':
      return <span className="text-amber-600 font-bold text-xs">⚠️ FLAGGED (RFI)</span>;
    case 'PENDING':
      return <span className="text-blue-600 font-bold text-xs">⏳ PENDING</span>;
    case 'FAILED':
      return <span className="text-rose-600 font-bold text-xs">✕ FAILED</span>;
  }
};

export const TrackingWorkbench: React.FC<TrackingWorkbenchProps> = ({
  initialApplication = null,
  initialQuery = '',
}) => {
  const [activeTab, setActiveTab] = useState<'tracking' | 'claim'>('tracking');
  const [query, setQuery] = useState<string>(initialQuery);
  const [currentApp, setCurrentApp] = useState<PolicyApplication | null>(initialApplication);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(Boolean(initialApplication || initialQuery));
  const [searchError, setSearchError] = useState<string | null>(null);

  // RFI state
  const [selectedPillar, setSelectedPillar] = useState<number>(2);
  const [documentType, setDocumentType] = useState<string>('Slip Gaji / Rekening Koran (3 Bulan Terakhir)');
  const [rfiFile, setRfiFile] = useState<File | null>(null);
  const [isSubmittingRfi, setIsSubmittingRfi] = useState<boolean>(false);
  const [rfiSuccessMsg, setRfiSuccessMsg] = useState<string | null>(null);
  const [rfiErrorMsg, setRfiErrorMsg] = useState<string | null>(null);
  const [rfiAgreed, setRfiAgreed] = useState<boolean>(true);

  // Mock e-policy download state
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Claim Submission state
  const [claimSuccess, setClaimSuccess] = useState<ClaimFormData | null>(null);

  const handleSearch = async (targetQuery?: string) => {
    const q = (targetQuery ?? query).trim();
    if (!q) {
      setSearchError('Silakan masukkan nomor pengajuan atau NIK.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);
    setRfiSuccessMsg(null);
    setRfiErrorMsg(null);

    try {
      const result = await applicationService.trackApplication(q);
      setCurrentApp(result);
      if (!result) {
        setSearchError(`Data pengajuan tidak ditemukan untuk pencarian "${q}".`);
      } else {
        const flaggedPillar = result.pillarChecks.find((p) => p.status === 'FLAGGED');
        if (flaggedPillar) {
          setSelectedPillar(flaggedPillar.pillarNumber);
        }
      }
    } catch {
      setSearchError('Terjadi kesalahan koneksi saat melacak pengajuan. Silakan coba kembali.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickSearch = (id: string) => {
    setQuery(id);
    handleSearch(id);
  };

  const handleSubmitRfi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentApp) return;

    if (!rfiFile) {
      setRfiErrorMsg('Harap pilih berkas dokumen yang ingin diunggah.');
      return;
    }

    setIsSubmittingRfi(true);
    setRfiErrorMsg(null);
    setRfiSuccessMsg(null);

    try {
      const response = await applicationService.submitRfiDocument(
        currentApp.id,
        selectedPillar,
        documentType,
        rfiFile.name
      );

      setCurrentApp(response.application);
      setRfiSuccessMsg(`Dokumen "${rfiFile.name}" berhasil diunggah! Tim Underwriter akan memverifikasi dalam 1x24 jam.`);
      setRfiFile(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengunggah dokumen susulan.';
      setRfiErrorMsg(message);
    } finally {
      setIsSubmittingRfi(false);
    }
  };

  const handleDownloadEPolicy = () => {
    setIsDownloading(true);
    setDownloadNotice(null);
    setTimeout(() => {
      setIsDownloading(false);
      setDownloadNotice('Sertifikat E-Polis resmi berformat PDF berhasil dibuat & diunduh.');
    }, 800);
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Header Title */}
      <div className="space-y-2 text-left">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Beranda
          </Link>
          <span>/</span>
          <span>Portal Nasabah</span>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Pelacakan & Klaim</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          Portal Status Aplikasi & Klaim Online
          <span className="sr-only"> - Cek Status Polis & Dokumen RFI</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Pantau evaluasi underwriting aplikasi polis secara realtime dan ajukan klaim asuransi
          digital tanpa antre.
        </p>
      </div>

      {/* 2-Tab Navigation Bar */}
      <div role="tablist" aria-label="Portal Mode" className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-xl max-w-md">
        <button
          role="tab"
          aria-selected={activeTab === 'tracking'}
          type="button"
          onClick={() => setActiveTab('tracking')}
          className={`flex-1 py-2 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'tracking'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          🔍 Lacak Status Aplikasi
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'claim'}
          type="button"
          onClick={() => setActiveTab('claim')}
          className={`flex-1 py-2 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'claim'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          ⚡ Pengajuan Klaim Baru
        </button>
      </div>

      {/* TAB 1: TRACKING & RFI PORTAL */}
      {activeTab === 'tracking' && (
        <div className="space-y-8">
          {/* Search Filter Box */}
          <Card className="p-6 sm:p-8 bg-white shadow-sm border border-slate-200 rounded-xl text-left">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="space-y-4"
            >
              <label htmlFor="search-input" className="block text-sm font-bold text-slate-800">
                Nomor Aplikasi Polis atau NIK e-KTP
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    id="search-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Contoh: APP-2026-8821 atau APP-2026-8819 atau NIK e-KTP"
                    className="text-sm h-11 border-slate-300 rounded-lg"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSearching}
                  className="h-11 px-6 shadow-md shadow-blue-500/20 font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  {isSearching ? <Spinner size="sm" /> : 'Lacak Aplikasi ➔'}
                  <span className="sr-only">Lacak Status</span>
                </Button>
              </div>

              {/* Quick Sample Queries */}
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-600">Sampel Cepat:</span>
                <button
                  type="button"
                  onClick={() => handleQuickSearch('APP-2026-8821')}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors border border-slate-200"
                >
                  APP-2026-8821 (Disetujui/Aktif)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSearch('APP-2026-7492')}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors border border-slate-200"
                >
                  APP-2026-7492 (Dalam Review)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSearch('APP-2026-3109')}
                  className="px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium transition-colors border border-amber-200"
                >
                  APP-2026-3109 (RFI Diperlukan)
                </button>
              </div>

              {searchError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {searchError}
                </div>
              )}
            </form>
          </Card>

      {/* Result Section */}
      {hasSearched && !isSearching && !currentApp && !searchError && (
        <Card className="p-12 text-center space-y-4 bg-white border border-slate-200 rounded-xl">
          <div className="text-4xl">🔍</div>
          <h3 className="text-base font-bold text-slate-800">Aplikasi Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Pastikan format ID aplikasi sesuai (misal: APP-2026-XXXX) atau periksa kembali nomor NIK 16-digit Anda.
          </p>
        </Card>
      )}

      {currentApp && (
        <div className="space-y-8 animate-fadeIn">
          {/* Main Status & Summary Banner (Dark Card) */}
          <div className="p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-xl text-white shadow-xl space-y-6 text-left">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/80 px-2.5 py-1 rounded-md border border-sky-800/60">
                    ID: {currentApp.id}
                  </span>
                  {getStatusBadge(currentApp.overallStatus)}
                  <span className="px-2.5 py-1 rounded-md bg-purple-950/80 border border-purple-800 text-purple-300 text-xs font-bold">
                    Tier: {currentApp.underwritingTier.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {currentApp.productName}
                </h2>
                <p className="text-xs text-slate-400">
                  Nomor Polis: POL-SLP-20260906-0042 • Tertanggung: {currentApp.identity.fullName} • Diajukan: {formatDate(currentApp.createdAt)}
                </p>
              </div>

              {/* Right Summary Metrics */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2 shrink-0">
                <div className="text-left lg:text-right">
                  <span className="text-xs text-slate-400 block">Premi Berkala</span>
                  <span className="text-sm sm:text-base font-bold text-sky-400">
                    Premi: {formatRupiah(currentApp.frequency === 'monthly' ? currentApp.monthlyPremium : currentApp.annualPremium)} / {currentApp.frequency === 'monthly' ? 'bln' : 'thn'}
                  </span>
                </div>
                <div className="text-left lg:text-right">
                  <span className="text-xs text-slate-400 block">Uang Pertanggungan</span>
                  <span className="text-sm sm:text-base font-bold text-white">
                    UP: {formatRupiah(currentApp.sumAssured)}
                  </span>
                </div>
              </div>
            </div>

            {downloadNotice && (
              <div className="p-3.5 rounded-lg bg-emerald-950/90 border border-emerald-700 text-emerald-300 text-xs font-medium flex items-center justify-between">
                <span>✓ {downloadNotice}</span>
                <button
                  type="button"
                  onClick={() => setDownloadNotice(null)}
                  className="text-emerald-400 hover:text-emerald-200 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-left">
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">Uang Pertanggungan</span>
                <span className="text-sm sm:text-base font-extrabold text-white">
                  {formatRupiah(currentApp.sumAssured)}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">Premi Berkala</span>
                <span className="text-sm sm:text-base font-extrabold text-sky-400">
                  {formatRupiah(currentApp.frequency === 'monthly' ? currentApp.monthlyPremium : currentApp.annualPremium)}
                  <span className="text-[10px] font-normal text-slate-400">/{currentApp.frequency === 'monthly' ? 'bln' : 'thn'}</span>
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">Masa Perlindungan</span>
                <span className="text-sm sm:text-base font-extrabold text-white">
                  {currentApp.termYears} Tahun
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">Ahli Waris Utama</span>
                <span className="text-sm sm:text-base font-bold text-white truncate block">
                  {currentApp.beneficiary.fullName} ({currentApp.beneficiary.sharePercentage}%)
                </span>
              </div>
            </div>
          </div>

          {/* 4-Pillar Verification Grid */}
          <div className="space-y-4 text-left">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Rincian Hasil Evaluasi Automated Underwriting (insurance-core-api):
                <span className="sr-only">Pemeriksaan 4-Pilar Underwriting OJK</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluasi otomatis terhadap identitas kependudukan, solvabilitas finansial, kesehatan, dan legalitas dokumen.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentApp.pillarChecks.map((pillar) => (
                <Card
                  key={pillar.pillarNumber}
                  className={`p-5 rounded-xl border transition-all text-left ${
                    pillar.status === 'FLAGGED'
                      ? 'border-amber-300 bg-amber-50/20 shadow-xs'
                      : pillar.status === 'PENDING'
                      ? 'border-blue-300 bg-blue-50/20 shadow-xs'
                      : 'border-slate-200 bg-white shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                        PILAR 0{pillar.pillarNumber}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{pillar.title}</h4>
                    </div>
                    {getPillarBadge(pillar.status)}
                  </div>

                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">{pillar.description}</p>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800">
                    {pillar.statusText}
                  </div>
                </Card>
              ))}
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {currentApp.overallStatus === 'approved' && (
                <Button
                  onClick={handleDownloadEPolicy}
                  disabled={isDownloading}
                  variant="primary"
                  size="md"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-lg h-10 px-5 shadow-sm"
                >
                  {isDownloading ? <Spinner size="sm" /> : '📄 Unduh E-Polis Resmi (PDF Terenkripsi)'}
                  <span className="sr-only">Unduh Sertifikat E-Polis</span>
                </Button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab('claim')}
                className="h-10 px-5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm shadow-2xs transition-colors"
              >
                ⚡ Ajukan Klaim Baru
              </button>
              <Link href="/assistant">
                <button
                  type="button"
                  className="h-10 px-5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm shadow-2xs transition-colors"
                >
                  💬 Konsultasi Polis ke AI Assistant
                </button>
              </Link>
            </div>
          </div>

          {/* RFI (Request for Information) Interactive Upload Section */}
          {(currentApp.overallStatus === 'rfi_requested' ||
            currentApp.overallStatus === 'under_review' ||
            currentApp.pillarChecks.some((p) => p.status === 'FLAGGED')) && (
            <Card className="p-6 sm:p-8 bg-linear-to-br from-amber-50/40 via-white to-white border-2 border-amber-300 shadow-sm rounded-xl space-y-6 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-200">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold">
                      STATUS: MENUNGGU BERKAS
                    </span>
                    <span className="text-xs font-bold text-amber-700">
                      ⏱️ Sisa Waktu: 2 Hari 14 Jam (Batas: 09 Sep 2026, 23:59 WIB)
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 pt-1">
                    Unggah Dokumen Tambahan (RFI)
                  </h3>
                  <p className="text-xs text-slate-600 max-w-2xl">
                    Aplikasi #{currentApp.id} • Produk: {currentApp.productName} • Pemohon: {currentApp.identity.fullName}
                  </p>
                </div>
              </div>

              {/* Underwriter Note Callout */}
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs space-y-1">
                <span className="font-bold text-slate-900 block">💬 Catatan Khusus Underwriter untuk Anda:</span>
                <p className="text-slate-700 italic leading-relaxed">
                  &quot;Mohon bantuannya untuk mengunggah dokumen tambahan yang diperlukan sesuai arahan di bawah ini. Dokumen ini diperlukan agar kami dapat segera memproses polis Anda.&quot;
                </p>
              </div>

              {rfiSuccessMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium">
                  {rfiSuccessMsg}
                </div>
              )}

              {rfiErrorMsg && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-medium">
                  {rfiErrorMsg}
                </div>
              )}

              <form onSubmit={handleSubmitRfi} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="select-pillar" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Pilar Tujuan Dokumen
                    </label>
                    <Select
                      id="select-pillar"
                      value={String(selectedPillar)}
                      onChange={(e) => setSelectedPillar(Number(e.target.value))}
                      options={[
                        { label: 'Pilar 1: Identitas Dukcapil (e-KTP/KK)', value: '1' },
                        { label: 'Pilar 2: Finansial & DSR (Slip Gaji/Rekening)', value: '2' },
                        { label: 'Pilar 3: Skrining Medis (Surat Dokter/MCU)', value: '3' },
                        { label: 'Pilar 4: Legalitas & Formulir Persetujuan', value: '4' },
                        { label: 'Pilar 5: Formulir Klaim & Resume Medis', value: '5' },
                      ]}
                    />
                  </div>

                  <div>
                    <label htmlFor="select-doctype" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Jenis Dokumen
                    </label>
                    <Select
                      id="select-doctype"
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      options={[
                        { label: 'Slip Gaji / Rekening Koran (3 Bulan Terakhir)', value: 'Slip Gaji / Rekening Koran (3 Bulan Terakhir)' },
                        { label: 'Surat Keterangan Dokter Spesialis / Resume Medis', value: 'Surat Keterangan Dokter Spesialis' },
                        { label: 'Hasil Laboratorium / Medical Check-up (MCU)', value: 'Hasil MCU Terakhir' },
                        { label: 'Foto Ulang Fisik e-KTP Asli', value: 'Foto e-KTP Asli' },
                        { label: 'Surat Pernyataan / Dokumen Lainnya', value: 'Dokumen Pendukung Lainnya' },
                      ]}
                    />
                  </div>
                </div>

                <FileUpload
                  label="Pilih Berkas Dokumen Pendukung"
                  helperText="Format didukung: PDF, JPG, PNG (Maksimal 10MB)"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onFileSelect={(file) => setRfiFile(file)}
                />

                {/* Agreement Checkbox */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="rfi-agreement"
                    checked={rfiAgreed}
                    onChange={(e) => setRfiAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="rfi-agreement" className="text-xs text-slate-600 leading-normal">
                    Saya menyatakan dengan sesungguhnya bahwa seluruh dokumen tambahan yang saya unggah adalah asli, sah secara hukum, dan milik saya pribadi untuk keperluan pemrosesan polis asuransi.
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmittingRfi || !rfiFile || !rfiAgreed}
                    className="h-11 shadow-md shadow-blue-500/20 px-6 font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    {isSubmittingRfi ? <Spinner size="sm" /> : 'Kirim Dokumen Tambahan ke Tim Underwriter 🚀'}
                    <span className="sr-only">Kirim Dokumen RFI</span>
                  </Button>
                </div>
              </form>

              {/* Uploaded Documents List */}
              {currentApp.rfiDocuments && currentApp.rfiDocuments.length > 0 && (
                <div className="pt-4 border-t border-amber-200/60 space-y-2 text-left">
                  <h4 className="text-xs font-bold text-slate-700">
                    Dokumen yang Telah Diunggah ({currentApp.rfiDocuments.length})
                  </h4>
                  <div className="space-y-2">
                    {currentApp.rfiDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">📄</span>
                          <div>
                            <span className="font-semibold text-slate-900 block">{doc.documentName}</span>
                            <span className="text-[10px] text-slate-500">
                              {doc.documentType} • Pilar {doc.pillarNumber} • Diunggah {formatDate(doc.uploadedAt)}
                            </span>
                          </div>
                        </div>
                        <Badge variant="blue" size="sm">
                          {doc.status.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Audit Trail & Timeline Stepper */}
          <Card className="p-6 sm:p-8 bg-white border border-slate-200 shadow-sm rounded-xl space-y-6 text-left">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Timeline Riwayat Pemrosesan (Audit Trail)
              </h3>
              <p className="text-xs text-slate-500">
                Catatan kronologis transparansi setiap langkah underwriting dan verifikasi dokumen polis.
              </p>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {(currentApp.timelineEvents && currentApp.timelineEvents.length > 0
                ? currentApp.timelineEvents
                : [
                    {
                      title: 'Aplikasi Diterima Sistem',
                      timestamp: currentApp.createdAt,
                      description: 'Pengajuan aplikasi polis baru berhasil tersimpan.',
                      status: 'completed' as const,
                    },
                  ]
              ).map((event, idx) => (
                <div key={idx} className="relative group">
                  {/* Indicator Dot */}
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] shadow-sm ${
                      event.status === 'completed'
                        ? 'bg-emerald-500 text-white'
                        : event.status === 'in_progress'
                        ? 'bg-blue-500 text-white animate-pulse'
                        : event.status === 'action_required'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-300 text-slate-600'
                    }`}
                  >
                    {event.status === 'completed' ? '✓' : '•'}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{event.title}</h4>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(event.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )}

  {/* TAB 2: KLAIM DIGITAL INSTAN */}
  {activeTab === 'claim' && (
    <div className="space-y-8 animate-fadeIn text-left">
      <div className="p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-xl text-white shadow-xl space-y-2">
        <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase block">
          KLAIM DIGITAL INSTAN
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Pengajuan Klaim Asuransi 100% Online
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          Unggah kuitansi dan dokumen medis dari rumah sakit untuk verifikasi klaim cepat dalam 1x24 jam kerja.
        </p>
      </div>

      {claimSuccess ? (
        <Card className="p-8 bg-white border border-emerald-300 rounded-xl shadow-sm text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold">
            ✓
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Pengajuan Klaim Berhasil Dikirim ke Tim Underwriter Medis
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Nomor registrasi klaim Anda adalah <span className="font-bold text-blue-600 font-mono">CLM-2026-9042</span>. Status evaluasi dan pencairan santunan dapat dipantau langsung melalui portal ini.
          </p>

          <div className="max-w-md mx-auto p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-left space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Nomor Polis:</span>
              <span className="font-semibold text-slate-900">{claimSuccess.policyNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kategori:</span>
              <span className="font-semibold text-slate-900">{claimSuccess.claimType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Fasilitas Kesehatan:</span>
              <span className="font-semibold text-slate-900">{claimSuccess.hospitalName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Nominal Diajukan:</span>
              <span className="font-bold text-emerald-600">{formatRupiah(claimSuccess.claimedAmount)}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <Button
              onClick={() => {
                setClaimSuccess(null);
                setActiveTab('tracking');
              }}
              variant="primary"
              size="md"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs"
            >
              Kembali ke Status Polis
            </Button>
          </div>
        </Card>
      ) : (
        <ClaimSubmissionForm
          initialPolicyNumber={currentApp?.id || 'POL-SLP-20260906-0042'}
          onSubmitSuccess={(data) => setClaimSuccess(data)}
        />
      )}
    </div>
  )}

  {/* Help & Support Footer Card */}
  <Card className="p-6 bg-slate-100 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-left">
    <div className="flex items-center gap-3">
      <span className="text-2xl">💬</span>
      <div>
        <h4 className="font-bold text-slate-900">Perlu Bantuan dengan Polis Anda?</h4>
        <p className="text-slate-500">
          Tim Customer Care Bayu Insurance siap membantu melalui WhatsApp atau Hotline 24/7.
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Link href="/">
        <Button size="sm" variant="outline" className="rounded-lg text-xs font-semibold bg-white border-slate-300">
          Kembali ke Beranda
        </Button>
      </Link>
    </div>
  </Card>
</div>
  );
};
