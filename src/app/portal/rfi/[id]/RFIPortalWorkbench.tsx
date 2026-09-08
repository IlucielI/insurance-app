'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Badge, Button, FileUpload, Spinner } from '@/components/atoms';
import { PolicyApplication } from '@/types/application.types';
import { submitRfiDocumentAction } from '@/app/tracking/actions';

export interface RFIPortalWorkbenchProps {
  initialApplication: PolicyApplication | null;
  applicationId: string;
}

export const RFIPortalWorkbench: React.FC<RFIPortalWorkbenchProps> = ({
  initialApplication,
  applicationId,
}) => {
  const [currentApp, setCurrentApp] = useState<PolicyApplication | null>(initialApplication);
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [incomeFile, setIncomeFile] = useState<File | null>(null);
  const [isAgreed, setIsAgreed] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // State: 'upload' (Tahap 2) or 'success' (Tahap 3)
  // If the application already has RFI documents submitted AND is no longer in rfi_requested status
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(
    Boolean(
      currentApp?.overallStatus !== 'rfi_requested' &&
      currentApp?.rfiDocuments &&
      currentApp.rfiDocuments.length > 0
    )
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSubmitDocuments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentApp) return;

    if (!ktpFile && !incomeFile) {
      setErrorMessage('Harap unggah minimal salah satu dokumen yang diminta (Foto e-KTP atau Slip Gaji).');
      return;
    }

    if (!isAgreed) {
      setErrorMessage('Anda harus menyetujui pernyataan keabsahan dokumen sebelum melanjutkan.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let updatedApp = currentApp;

      // 1. Submit e-KTP if selected
      if (ktpFile) {
        const resKtp = await submitRfiDocumentAction(
          currentApp.id,
          1,
          'Foto Fisik e-KTP (Resolusi Tinggi)',
          ktpFile.name
        );
        updatedApp = resKtp.application;
      }

      // 2. Submit Income document if selected
      if (incomeFile) {
        const resIncome = await submitRfiDocumentAction(
          currentApp.id,
          2,
          'Slip Gaji 3 Bulan / Rekening Koran Legalisir',
          incomeFile.name
        );
        updatedApp = resIncome.application;
      }

      setCurrentApp(updatedApp);
      setIsSubmittedSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengunggah dokumen.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Not found state
  if (!currentApp) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-3xl">
          ⚠️
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Aplikasi Tidak Ditemukan</h1>
          <p className="text-sm text-slate-500">
            ID Aplikasi <span className="font-mono font-bold text-slate-700">{applicationId}</span> tidak terdaftar dalam sistem verifikasi kami.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Link href="/tracking">
            <Button variant="outline" size="sm">
              🔍 Cek di Portal Tracking
            </Button>
          </Link>
          <Link href="/">
            <Button variant="primary" size="sm">
              Beranda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      {/* Top Breadcrumb & Back Link */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Beranda
        </Link>
        <span>/</span>
        <Link href={`/tracking?id=${currentApp.id}`} className="hover:text-blue-600 transition-colors">
          Lacak Status
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold">Portal Dokumen RFI</span>
      </nav>

      {/* Header Banner Portal Keamanan */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-lg shadow-lg shadow-blue-500/30 ring-2 ring-white/20">
              BI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-blue-300 font-bold">
                  Bayu Insurance Digital Portal
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Portal Unggah Aman Dokumen Nasabah
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold tracking-wide">
              🔒 Enkripsi End-to-End SSL 256-bit
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAHAP 3: KONFIRMASI DOKUMEN BERHASIL DIKIRIM (SUCCESS STATE)              */}
      {/* ========================================================================= */}
      {isSubmittedSuccess ? (
        <div className="space-y-6" data-testid="rfi-stage-3-success">
          <Card className="p-8 sm:p-10 border-emerald-200 bg-white shadow-lg space-y-8">
            {/* Success Header */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-md shadow-emerald-500/10 animate-bounce">
                ✓
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Dokumen Berhasil Diterima!
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Terima kasih <span className="font-bold text-slate-800">Bapak {currentApp.identity.fullName}</span>. Dokumen tambahan Anda telah berhasil diunggah dan tersimpan aman di repository terenkripsi kami.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                <span>Aplikasi: <span className="font-mono text-blue-600">#{currentApp.id}</span></span>
                <span>•</span>
                <span>Status: <span className="text-emerald-700 font-bold">DOCUMENTS_RECEIVED</span></span>
                <span>•</span>
                <span>Waktu Unggah: Hari Ini</span>
              </div>
            </div>

            {/* 4-Stage Stepper: STATUS PENGAJUAN TERBARU */}
            <div className="border border-slate-200 rounded-xl p-5 sm:p-6 bg-slate-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Status Pengajuan Terbaru:
                </h3>
                <Badge variant="blue" size="sm">
                  Progres 75%
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Step 1 */}
                <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Tahap 1</span>
                    <Badge variant="emerald" size="sm">SELESAI ✓</Badge>
                  </div>
                  <p className="text-sm font-bold text-slate-800">Pengajuan Awal</p>
                  <p className="text-xs text-slate-500 leading-snug">
                    Data nasabah & deklarasi kesehatan awal diterima sistem.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="bg-white p-4 rounded-xl border border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700">Tahap 2</span>
                    <Badge variant="emerald" size="sm">DITERIMA HARI INI ✓</Badge>
                  </div>
                  <p className="text-sm font-bold text-slate-800">Pengunggahan Dokumen</p>
                  <p className="text-xs text-slate-500 leading-snug">
                    Berkas fisik e-KTP & slip gaji terenkripsi SHA-256 tersimpan.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-300 shadow-xs space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-full bg-blue-500" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700">Tahap 3</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white animate-pulse">
                      SEDANG BERJALAN ⏳
                    </span>
                  </div>
                  <p className="text-sm font-bold text-blue-950">Peninjauan Underwriter</p>
                  <p className="text-xs text-blue-800/80 leading-snug">
                    Tim underwriter sedang memvalidasi kesesuaian dokumen & rasio DSR.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2 opacity-75">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Tahap 4</span>
                    <Badge variant="slate" size="sm">ESTIMASI 1 HARI KERJA</Badge>
                  </div>
                  <p className="text-sm font-bold text-slate-700">Penerbitan E-Polis</p>
                  <p className="text-xs text-slate-500 leading-snug">
                    Polis resmi disetujui & sertifikat digital OJK diterbitkan.
                  </p>
                </div>
              </div>
            </div>

            {/* Callout Sinkronisasi CMS Underwriting */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 sm:p-6 text-left space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔄</span>
                <h4 className="text-sm font-bold text-blue-950">
                  Sinkronisasi Otomatis ke CMS 02 Underwriting Queue:
                </h4>
              </div>
              <p className="text-xs text-blue-900/80 leading-relaxed pl-7">
                Di sisi internal, status aplikasi langsung berganti dari <span className="font-mono font-bold text-amber-700 bg-amber-100/60 px-1.5 py-0.5 rounded">REQUIRE_DOCUMENTS</span> menjadi <span className="font-mono font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">DOCUMENTS_RECEIVED</span>. Lead Underwriter (<span className="font-bold text-blue-950">Bayu Pratama</span>) akan menerima notifikasi lonceng 🔔 untuk segera menyelesaikan evaluasi 4 pilar.
              </p>
            </div>

            {/* Uploaded Documents List */}
            {currentApp.rfiDocuments && currentApp.rfiDocuments.length > 0 && (
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Berkas Tambahan yang Telah Terkirim ({currentApp.rfiDocuments.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentApp.rfiDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="text-base">📄</span>
                        <div className="truncate">
                          <p className="font-bold text-slate-800 truncate">{doc.documentName}</p>
                          <p className="text-[11px] text-slate-500">{doc.documentType}</p>
                        </div>
                      </div>
                      <Badge variant="emerald" size="sm">TERVERIFIKASI</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="primary" size="md" className="w-full sm:w-auto shadow-sm">
                  Kembali ke Beranda Aplikasi Nasabah 🏠
                </Button>
              </Link>
              <Link href={`/tracking?id=${currentApp.id}`} className="w-full sm:w-auto">
                <Button variant="outline" size="md" className="w-full sm:w-auto">
                  Pantau di Portal Lacak Aplikasi 🔍
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="md"
                onClick={() => setIsSubmittedSuccess(false)}
                className="w-full sm:w-auto text-xs text-slate-500"
              >
                Unggah Dokumen Lain
              </Button>
            </div>

            {/* Support Footnote */}
            <p className="text-center text-xs text-slate-400 pt-2 border-t border-slate-100">
              Pertanyaan seputar polis? Hubungi Layanan Nasabah di <span className="font-bold text-slate-600">1500-888</span> atau email <span className="font-bold text-slate-600">care@bayuinsurance.co.id</span>
            </p>
          </Card>
        </div>
      ) : (
        /* ========================================================================= */
        /* TAHAP 2: PORTAL WEB UNGGAH DOKUMEN NASABAH                                */
        /* ========================================================================= */
        <div className="space-y-6" data-testid="rfi-stage-2-form">
          {/* Status & SLA Deadline Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                STATUS: MENUNGGU BERKAS TAMBAHAN
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100/70 px-3 py-1 rounded-lg border border-amber-200">
              <span>⏱️ Sisa Waktu: 2 Hari 14 Jam</span>
              <span className="text-amber-600 font-normal">(Batas: 09 Sep 2026, 23:59 WIB)</span>
            </div>
          </div>

          {/* Application Summary Card */}
          <Card className="p-6 border-slate-200 bg-white shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Nomor Registrasi Aplikasi
                </span>
                <p className="text-xl font-black text-slate-900 font-mono">
                  #{currentApp.id}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="blue" size="md">
                  {currentApp.productName}
                </Badge>
                <Badge variant="purple" size="md">
                  UP: {formatCurrency(currentApp.sumAssured)}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Nama Pemohon:</span>
                <p className="font-bold text-slate-800 mt-0.5">{currentApp.identity.fullName}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Premi:</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {formatCurrency(currentApp.monthlyPremium)} / bulan
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Jangka Waktu Pertanggungan:</span>
                <p className="font-bold text-slate-800 mt-0.5">{currentApp.termYears} Tahun</p>
              </div>
            </div>

            {/* Catatan dari Underwriter */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base">📝</span>
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-900">
                  Catatan dari Tim Underwriter:
                </h3>
              </div>
              <p className="text-xs text-amber-950/90 leading-relaxed pl-6">
                {currentApp.underwriterNotes ||
                  'Mohon bantuannya untuk mengunggah ulang foto e-KTP Anda dengan pencahayaan yang jelas dan seluruh sudut kartu terlihat, serta melampirkan file slip gaji 3 bulan terakhir untuk mendukung kapasitas keuangan pengajuan premi tahunan Anda.'}
              </p>
            </div>
          </Card>

          {/* Form Unggah Dokumen RFI */}
          <form onSubmit={handleSubmitDocuments} className="space-y-6">
            <Card className="p-6 sm:p-8 border-slate-200 bg-white shadow-xs space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Unggah Berkas Persyaratan Tambahan
                </h3>
                <p className="text-xs text-slate-500">
                  Pilih berkas dokumen dengan format PDF, JPG, atau PNG (maksimal 10MB per berkas).
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2"
                >
                  <span>⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Dual File Upload Slots */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SLOT 1: FOTO FISIK E-KTP */}
                <div className="space-y-2 p-4 rounded-xl bg-slate-50/80 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-tight">
                      1. FOTO FISIK E-KTP
                    </span>
                    <Badge variant="amber" size="sm">RESOLUSI TINGGI</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Pastikan seluruh sudut e-KTP terlihat utuh, tidak blur, dan NIK terbaca tajam tanpa pantulan flash.
                  </p>
                  <FileUpload
                    label=""
                    helperText="Format JPG, PNG, atau PDF (Maks. 10MB)"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onFileSelect={(file) => setKtpFile(file)}
                    disabled={isSubmitting}
                  />
                  {ktpFile && (
                    <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span>✓</span> Berkas terpilih: {ktpFile.name} ({(ktpFile.size / 1024).toFixed(0)} KB)
                    </p>
                  )}
                </div>

                {/* SLOT 2: SLIP GAJI 3 BULAN TERAKHIR */}
                <div className="space-y-2 p-4 rounded-xl bg-slate-50/80 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-tight">
                      2. SLIP GAJI 3 BULAN / REKENING KORAN
                    </span>
                    <Badge variant="blue" size="sm">LEGALISIR BANK</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Unggah dokumen PDF atau foto legalisir bank untuk verifikasi kapasitas DSR (Debt Service Ratio).
                  </p>
                  <FileUpload
                    label=""
                    helperText="Format PDF, JPG, atau PNG (Maks. 10MB)"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onFileSelect={(file) => setIncomeFile(file)}
                    disabled={isSubmitting}
                  />
                  {incomeFile && (
                    <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span>✓</span> Berkas terpilih: {incomeFile.name} ({(incomeFile.size / 1024).toFixed(0)} KB)
                    </p>
                  )}
                </div>
              </div>

              {/* Legal Declaration Checkbox */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="rfi-legal-agreement"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    disabled={isSubmitting}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 leading-relaxed">
                    Saya menyatakan dengan sesungguhnya bahwa seluruh dokumen tambahan yang saya unggah adalah asli, sah secara hukum, dan milik saya pribadi untuk keperluan pemrosesan polis asuransi <span className="font-bold text-slate-900">Bayu Insurance</span>.
                  </span>
                </label>
              </div>

              {/* Submit CTA Button */}
              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting || (!ktpFile && !incomeFile) || !isAgreed}
                  className="w-full text-sm font-bold shadow-md shadow-blue-500/20 py-3.5"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner size="sm" />
                      <span>Mengenkripsi & Mengunggah Berkas ke Underwriter...</span>
                    </span>
                  ) : (
                    'Kirim Dokumen Tambahan ke Tim Underwriter 🚀'
                  )}
                </Button>

                <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                  <span>🔒</span>
                  <span>Berkas Anda akan langsung dienkripsi dengan SHA-256 dan diteruskan ke antrean workbench underwriter.</span>
                </p>
              </div>
            </Card>
          </form>
        </div>
      )}
    </div>
  );
};
