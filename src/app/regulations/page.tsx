import React from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/templates';

export const metadata = {
  title: 'Regulasi & Kepatuhan OJK | Bayu Insurance',
  description: 'Informasi legalitas, izin operasional OJK, kepatuhan POJK, dan keanggotaan asosiasi resmi PT Bayu Insurance Digital Indonesia.',
};

export default function RegulationsPage() {
  return (
    <AppLayout currentPath="/regulations">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Beranda
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Regulasi OJK</span>
        </nav>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6">
          <div className="border-b border-slate-100 pb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
              Terdaftar &amp; Diawasi oleh OJK
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Informasi Regulasi &amp; Kepatuhan Hukum
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Beroperasi di bawah pengawasan Otoritas Jasa Keuangan Republik Indonesia
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Izin Usaha Perasuransian</h2>
              <p>
                PT Bayu Insurance Digital Indonesia beroperasi secara sah berdasarkan Keputusan Dewan Komisioner Otoritas Jasa Keuangan (OJK) No. KEP-782/NB.11/2024 tentang Izin Usaha di Bidang Asuransi Jiwa &amp; Umum Digital.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Kepatuhan POJK</h2>
              <p>
                Seluruh produk proteksi asuransi, aturan penetapan premi aktuaria, dan tata kelola digital kami tunduk pada:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>POJK No. 23/POJK.05/2015:</strong> Produk Asuransi dan Pemasaran Produk Asuransi.</li>
                <li><strong>POJK No. 69/POJK.05/2016:</strong> Penyelenggaraan Usaha Perusahaan Asuransi.</li>
                <li><strong>POJK No. 13/POJK.02/2018:</strong> Inovasi Keuangan Digital di Sektor Jasa Keuangan.</li>
                <li><strong>SEOJK No. 19/SEOJK.05/2020:</strong> Saluran Pemasaran Produk Asuransi Melalui Media Elektronik.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Keanggotaan Asosiasi</h2>
              <p>
                Bayu Insurance merupakan anggota aktif dari:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Asosiasi Asuransi Jiwa Indonesia (AAJI)</li>
                <li>Asosiasi Fintech Indonesia (AFTECH)</li>
                <li>Lembaga Alternatif Penyelesaian Sengketa Sektor Jasa Keuangan (LAPS SJK)</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">4. Layanan Konsumen OJK</h2>
              <p>
                Jika Anda memiliki pertanyaan mengenai legalitas atau penanganan pengaduan konsumen yang belum terselesaikan, Anda dapat menghubungi Kontak OJK 157 melalui telepon <code className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-bold">157</code> atau WhatsApp resmi OJK <code className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-bold">081-157-157-157</code>.
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
              href="/privacy"
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Kebijakan Privasi Data →
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
