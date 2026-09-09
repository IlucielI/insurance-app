import React from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/templates';

export const metadata = {
  title: 'Syarat & Ketentuan | Bayu Insurance',
  description: 'Syarat dan ketentuan umum penggunaan aplikasi dan pengajuan polis asuransi digital di PT Bayu Insurance Digital Indonesia.',
};

export default function TermsPage() {
  return (
    <AppLayout currentPath="/terms">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Beranda
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Syarat &amp; Ketentuan</span>
        </nav>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6">
          <div className="border-b border-slate-100 pb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              Ketentuan Kontrak Polis Resmi
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Syarat &amp; Ketentuan Penggunaan Layanan
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Berlaku efektif sejak 1 September 2026 bagi seluruh pengguna portal nasabah dan pemegang polis
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Ketentuan Umum</h2>
              <p>
                Dengan mengakses, mensimulasikan premi, atau mengajukan aplikasi perlindungan melalui portal Bayu Insurance, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan kontrak hukum yang tertuang di bawah ini.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Prinsip Kejujuran Tertinggi (Utmost Good Faith)</h2>
              <p>
                Calon pemegang polis dan tertanggung wajib memberikan keterangan yang lengkap, akurat, jujur, dan benar dalam seluruh lembar formulir pendaftaran, riwayat medis, dan deklarasi keuangan. Penyembunyian fakta material (non-disclosure of material facts) dapat mengakibatkan pembatalan polis dan penolakan klaim di kemudian hari.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Proses Underwriting Digital &amp; Dokumen Tambahan (RFI)</h2>
              <p>
                Setiap aplikasi polis akan melalui evaluasi underwriting menggunakan engine aktuaria cerdas. Tim underwriting berhak:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Menyetujui aplikasi secara otomatis (Straight-Through Processing).</li>
                <li>Meminta dokumen tambahan (Request for Information / RFI) seperti slip gaji atau hasil pemeriksaan laboratorium.</li>
                <li>Menolak permohonan asuransi apabila profil risiko melampaui toleransi aktuaria produk.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">4. Masa Mempelajari Polis (Free-Look Period)</h2>
              <p>
                Pemegang polis berhak membatalkan polis dalam jangka waktu 14 (empat belas) hari kalender sejak e-polis diterbitkan jika tidak menyetujui ketentuan yang tertera. Premi yang telah dibayarkan akan dikembalikan penuh setelah dipotong biaya administrasi dan pemeriksaan medis (jika ada).
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              ← Kembali ke Beranda
            </Link>
            <Link
              href="/security"
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Standar Keamanan Data →
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
