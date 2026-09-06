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
      return <Badge variant="emerald" size="md">✓ Polis Disetujui & Aktif</Badge>;
    case 'under_review':
      return <Badge variant="amber" size="md">⏳ Dalam Review Underwriting</Badge>;
    case 'rfi_requested':
      return <Badge variant="rose" size="md">⚠️ Dokumen Tambahan Diperlukan (RFI)</Badge>;
    case 'submitted':
      return <Badge variant="blue" size="md">📋 Berkas Diterima Sistem</Badge>;
    case 'rejected':
      return <Badge variant="rose" size="md">✕ Pengajuan Ditolak</Badge>;
    default:
      return <Badge variant="slate" size="md">{status}</Badge>;
  }
};

const getPillarBadge = (status: 'PASSED' | 'FLAGGED' | 'PENDING' | 'FAILED') => {
  switch (status) {
    case 'PASSED':
      return <Badge variant="emerald" size="sm">✓ Lolos</Badge>;
    case 'FLAGGED':
      return <Badge variant="amber" size="sm">⚠️ Perlu Review / RFI</Badge>;
    case 'PENDING':
      return <Badge variant="blue" size="sm">⏳ Menunggu Verifikasi</Badge>;
    case 'FAILED':
      return <Badge variant="rose" size="sm">✕ Tidak Memenuhi Syarat</Badge>;
  }
};


export const TrackingWorkbench: React.FC<TrackingWorkbenchProps> = ({
  initialApplication = null,
  initialQuery = '',
}) => {
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

  // Mock e-policy download state
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

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
        // Auto-select first flagged pillar if available
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
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-8 sm:p-10 shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
            <span>🛡️</span>
            Sistem Audit Trail & Tracking Real-time
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Cek Status Polis & Dokumen RFI
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Lacak perjalanan aplikasi asuransi Anda secara transparan. Tinjau progres verifikasi
            4-Pilar otomatis OJK dan lengkapi dokumen tambahan dengan cepat.
          </p>
        </div>
      </section>

      {/* Search Filter Box */}
      <Card className="p-6 sm:p-8 bg-white shadow-md border border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-4"
        >
          <label htmlFor="search-input" className="block text-sm font-bold text-slate-800">
            Cari Berdasarkan Nomor Aplikasi Polis atau NIK e-KTP
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                id="search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Contoh: APP-2026-8821 atau 3201123456780001"
                className="text-sm h-11"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSearching}
              className="h-11 px-6 shadow-md shadow-blue-500/20 font-semibold"
            >
              {isSearching ? <Spinner size="sm" /> : 'Lacak Status 🔍'}
            </Button>
          </div>

          {/* Quick Sample Queries */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-medium">Sampel Cepat:</span>
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
        <Card className="p-12 text-center space-y-4 bg-white border border-slate-200">
          <div className="text-4xl">🔍</div>
          <h3 className="text-base font-bold text-slate-800">Aplikasi Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Pastikan format ID aplikasi sesuai (misal: APP-2026-XXXX) atau periksa kembali nomor NIK 16-digit Anda.
          </p>
        </Card>
      )}

      {currentApp && (
        <div className="space-y-8 animate-fadeIn">
          {/* Main Status & Summary Card */}
          <Card className="p-6 sm:p-8 bg-white border border-slate-200 shadow-lg space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                    ID: {currentApp.id}
                  </span>
                  {getStatusBadge(currentApp.overallStatus)}
                  <Badge variant="purple" size="sm">
                    Tier: {currentApp.underwritingTier.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {currentApp.productName}
                </h2>
                <p className="text-xs text-slate-500">
                  Diajukan pada: {formatDate(currentApp.createdAt)} • Tertanggung: {currentApp.identity.fullName}
                </p>
              </div>

              {/* Action / Certificate Button if Approved */}
              {currentApp.overallStatus === 'approved' && (
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <Button
                    onClick={handleDownloadEPolicy}
                    disabled={isDownloading}
                    variant="primary"
                    size="sm"
                    className="shadow-md shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isDownloading ? <Spinner size="sm" /> : '📄 Unduh Sertifikat E-Polis'}
                  </Button>
                </div>
              )}
            </div>

            {downloadNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
                <span>✓ {downloadNotice}</span>
                <button
                  type="button"
                  onClick={() => setDownloadNotice(null)}
                  className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left">
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Uang Pertanggungan</span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900">
                  {formatRupiah(currentApp.sumAssured)}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Premi Berkala</span>
                <span className="text-sm sm:text-base font-extrabold text-blue-600">
                  {formatRupiah(currentApp.frequency === 'monthly' ? currentApp.monthlyPremium : currentApp.annualPremium)}
                  <span className="text-[10px] font-normal text-slate-500">/{currentApp.frequency === 'monthly' ? 'bln' : 'thn'}</span>
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Masa Perlindungan</span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900">
                  {currentApp.termYears} Tahun
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Ahli Waris Utama</span>
                <span className="text-sm sm:text-base font-bold text-slate-900 truncate block">
                  {currentApp.beneficiary.fullName} ({currentApp.beneficiary.sharePercentage}%)
                </span>
              </div>
            </div>
          </Card>

          {/* 4-Pillar Verification Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Pemeriksaan 4-Pilar Underwriting OJK
                </h3>
                <p className="text-xs text-slate-500">
                  Evaluasi otomatis terhadap identitas, solvabilitas finansial, kesehatan, dan legalitas dokumen.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentApp.pillarChecks.map((pillar) => (
                <Card
                  key={pillar.pillarNumber}
                  className={`p-5 border transition-all text-left ${
                    pillar.status === 'FLAGGED'
                      ? 'border-amber-300 bg-amber-50/20'
                      : pillar.status === 'PENDING'
                      ? 'border-blue-300 bg-blue-50/20'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                        {pillar.pillarNumber}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{pillar.title}</h4>
                    </div>
                    {getPillarBadge(pillar.status)}
                  </div>

                  <p className="text-xs text-slate-600 mb-3">{pillar.description}</p>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800">
                    {pillar.statusText}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* RFI (Request for Information) Interactive Upload Section */}
          {(currentApp.overallStatus === 'rfi_requested' ||
            currentApp.overallStatus === 'under_review' ||
            currentApp.pillarChecks.some((p) => p.status === 'FLAGGED')) && (
            <Card className="p-6 sm:p-8 bg-linear-to-br from-amber-50/40 via-white to-white border-2 border-amber-300 shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-200">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    <span>⚠️</span>
                    Tindakan Nasabah Diperlukan
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Unggah Dokumen Tambahan (RFI)
                  </h3>
                  <p className="text-xs text-slate-600 max-w-2xl">
                    Untuk mempercepat proses persetujuan polis Anda, silakan unggah dokumen verifikasi
                    tambahan sesuai arahan tim underwriter di bawah ini.
                  </p>
                </div>
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
                        { label: 'Slip Gaji / Rekening Koran (3 Bulan)', value: 'Slip Gaji / Rekening Koran (3 Bulan Terakhir)' },
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

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmittingRfi || !rfiFile}
                    className="shadow-md shadow-blue-500/20 px-6 font-semibold"
                  >
                    {isSubmittingRfi ? <Spinner size="sm" /> : 'Kirim Dokumen RFI 📤'}
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
          <Card className="p-6 sm:p-8 bg-white border border-slate-200 shadow-md space-y-6 text-left">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
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

          {/* Help & Support Footer Card */}
          <Card className="p-6 bg-slate-100 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <h4 className="font-bold text-slate-900">Perlu Bantuan dengan Polis Anda?</h4>
                <p className="text-slate-500">
                  Tim Customer Care InsuRisk siap membantu melalui WhatsApp atau Hotline 24/7.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button size="sm" variant="outline">
                  Kembali ke Beranda
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
