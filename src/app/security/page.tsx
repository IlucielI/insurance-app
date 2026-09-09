import React from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/templates';

export const metadata = {
  title: 'Keamanan Data & Enkripsi | Bayu Insurance',
  description: 'Standar arsitektur keamanan siber, enkripsi data TLS 1.3 & AES-256, serta audit trail kepatuhan digital di PT Bayu Insurance Digital Indonesia.',
};

export default function SecurityPage() {
  return (
    <AppLayout currentPath="/security">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Beranda
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Keamanan Data</span>
        </nav>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6">
          <div className="border-b border-slate-100 pb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
              ISO/IEC 27001 &amp; Enkripsi Tingkat Perbankan
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Standar Keamanan Siber &amp; Proteksi Data Nasabah
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Infrastruktur keamanan berlapis menjaga data identitas, rekam medis, dan transaksi finansial Anda
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <span className="text-xl">🔐</span>
                <h3 className="font-bold text-slate-900">Enkripsi Data Transit &amp; At-Rest</h3>
                <p className="text-xs text-slate-600">
                  Seluruh komunikasi jaringan dienkripsi dengan protokol TLS 1.3 cipher suite modern. Data sensitif seperti NIK dan dokumen identitas disimpan dengan enkripsi AES-256-GCM.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <span className="text-xl">🛡️</span>
                <h3 className="font-bold text-slate-900">Jejak Audit Kepatuhan (SHA-256)</h3>
                <p className="text-xs text-slate-600">
                  Setiap tindakan underwriter, perubahan status polis, dan akses berkas diverifikasi serta dicatat dalam audit trail berbasis hashing SHA-256 yang kebal manipulasi (tamper-proof).
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <span className="text-xl">☁️</span>
                <h3 className="font-bold text-slate-900">Penyimpanan Terisolasi MinIO S3</h3>
                <p className="text-xs text-slate-600">
                  Semua berkas pendukung (e-KTP, slip gaji, resume medis) disimpan di storage objek terisolasi dengan akses berbasis token presigned URL berbatas waktu singkat.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <span className="text-xl">⚡</span>
                <h3 className="font-bold text-slate-900">Monitoring Kerentanan 24/7</h3>
                <p className="text-xs text-slate-600">
                  Sistem pemantauan automated runtime audit terus-menerus memindai endpoint, integritas container, dan deteksi anomali akses mencurigakan.
                </p>
              </div>
            </div>

            <section className="space-y-2 pt-2">
              <h2 className="text-base font-bold text-slate-900">Pelaporan Kerentanan Keamanan</h2>
              <p>
                Jika Anda adalah peneliti keamanan independen dan menemukan potensi celah keamanan di platform kami, silakan laporkan secara bertanggung jawab ke tim respons insiden: <code className="text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">security@bayuinsurance.co.id</code>.
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
              href="/regulations"
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Regulasi &amp; Izin OJK →
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
