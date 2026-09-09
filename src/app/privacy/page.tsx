import React from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/templates';

export const metadata = {
  title: 'Kebijakan Privasi | Bayu Insurance',
  description: 'Kebijakan privasi dan perlindungan data pribadi nasabah PT Bayu Insurance Digital Indonesia sesuai Undang-Undang Pelindungan Data Pribadi (UU PDP).',
};

export default function PrivacyPage() {
  return (
    <AppLayout currentPath="/privacy">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Beranda
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Kebijakan Privasi</span>
        </nav>

        {/* Content Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6">
          <div className="border-b border-slate-100 pb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              Kepatuhan UU PDP No. 27/2022
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Kebijakan Privasi &amp; Pelindungan Data Nasabah
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Terakhir diperbarui: 1 September 2026 • Berlaku efektif untuk seluruh layanan digital Bayu Insurance
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Pendahuluan</h2>
              <p>
                PT Bayu Insurance Digital Indonesia (&ldquo;Bayu Insurance&rdquo; atau &ldquo;Kami&rdquo;) berkomitmen tinggi untuk melindungi kerahasiaan, integritas, dan keamanan data pribadi calon nasabah serta pemegang polis kami. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, memproses, menyimpan, dan melindungi informasi pribadi Anda sesuai dengan ketentuan perundang-undangan Republik Indonesia.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Data yang Kami Kumpulkan</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Data Identitas:</strong> Nama lengkap, NIK e-KTP, tanggal lahir, jenis kelamin, dan foto kartu identitas.</li>
                <li><strong>Data Kontak:</strong> Alamat email, nomor telepon/WhatsApp, dan alamat domisili lengkap.</li>
                <li><strong>Data Finansial &amp; Pekerjaan:</strong> Penghasilan bulanan, pengeluaran rutin bulanan, dan jenis pekerjaan.</li>
                <li><strong>Data Deklarasi Kesehatan:</strong> Jawaban kuesioner medis underwriting untuk penilaian risiko polis.</li>
                <li><strong>Data Penerima Manfaat (Beneficiary):</strong> Nama lengkap ahli waris dan hubungan kekeluargaan.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Tujuan Pemrosesan Data</h2>
              <p>
                Seluruh data yang Anda berikan diproses secara ketat untuk keperluan:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Evaluasi risiko aktuaria dan underwriting digital (STP &amp; manual review).</li>
                <li>Penerbitan dokumen kontrak polis asuransi resmi dan sertifikat e-polis.</li>
                <li>Pengiriman notifikasi status pengajuan polis dan bukti pembayaran premi.</li>
                <li>Kepatuhan terhadap regulasi Otoritas Jasa Keuangan (OJK) dan pencegahan pencucian uang (APU-PPT).</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">4. Hak Pemilik Data Pribadi</h2>
              <p>
                Sesuai UU Pelindungan Data Pribadi, Anda berhak mengakses, memperbaiki, menarik persetujuan, atau meminta penghapusan data pribadi Anda sesuai dengan batasan masa retensi dokumen keuangan yang diatur undang-undang perasuransian.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">5. Hubungi Tim Pelindungan Data</h2>
              <p>
                Apabila Anda memiliki pertanyaan, keluhan, atau ingin menggunakan hak terkait data pribadi Anda, silakan hubungi Data Protection Officer (DPO) kami melalui email: <code className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">dpo@bayuinsurance.co.id</code>.
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
              href="/terms"
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Baca Syarat &amp; Ketentuan →
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
