'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { InsuranceProduct } from '@/server/repositories/product.repository.interface';
import { ProductCard } from '@/components/molecules/ProductCard';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Card } from '@/components/atoms/Card';
import { AIAssistantDrawer } from '@/components/organisms/AIAssistantDrawer';

export interface HomeWorkbenchProps {
  initialFeaturedProducts: InsuranceProduct[];
}

export const HomeWorkbench: React.FC<HomeWorkbenchProps> = ({
  initialFeaturedProducts,
}) => {
  const router = useRouter();
  const [products] = useState<InsuranceProduct[]>(initialFeaturedProducts);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Simulation Teaser State
  const [simCategory, setSimCategory] = useState<'life' | 'health' | 'vehicle'>('life');
  const [simAge, setSimAge] = useState<number>(32);
  const [simGender, setSimGender] = useState<'pria' | 'wanita'>('pria');
  const [simSmoker, setSimSmoker] = useState<boolean>(false);

  const handleSelectProduct = (productId: string) => {
    router.push(`/simulation?productId=${encodeURIComponent(productId)}`);
  };

  const faqItems = [
    {
      question: 'Bagaimana cara menghitung estimasi premi asuransi?',
      answer:
        'Premi dihitung transparan menggunakan smart pricing engine kami berdasarkan usia, profil risiko, status perokok, uang pertanggungan, dan tenor pilihan Anda sesuai tabel mortalita resmi TMI IV OJK.',
    },
    {
      question: 'Berapa lama proses persetujuan underwriting?',
      answer:
        'Untuk aplikasi standar dengan profil risiko rendah, automated underwriting menyetujui dalam 45 detik hingga 5 menit. Aplikasi dengan deklarasi khusus diproses manual oleh underwriter berlisensi maksimal 1x24 jam kerja.',
    },
    {
      question: 'Bagaimana prosedur pengajuan klaim asuransi?',
      answer:
        'Pengajuan klaim 100% digital melalui portal nasabah dengan mengunggah dokumen rumah sakit atau akta kematian. Klaim terverifikasi memiliki Garansi SLA pencairan maksimal 3 hari kerja ke rekening ahli waris.',
    },
    {
      question: 'Apakah data pribadi dan rekam medis saya aman?',
      answer:
        'Seluruh data identitas NIK dan rekam medis Anda dienkripsi end-to-end berstandar global ISO 27001 serta mematuhi Undang-Undang Perlindungan Data Pribadi (UU PDP) dan regulasi OJK.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-10 lg:p-12 shadow-2xl shadow-blue-950/20 border border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              ✨ PLATFORM ASURANSI DIGITAL MODERN
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15]">
              Perlindungan Masa Depan,{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-300">
                Proses Cepat &amp; Transparan.
              </span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm lg:text-base leading-relaxed max-w-2xl">
              Simulasikan premi akurat secara realtime dengan Core API pricing engine,
              ajukan aplikasi polis dalam hitungan menit, dan tanyakan AI Assistant 24/7.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link href="/products">
                <Button size="lg" variant="primary" className="h-12 px-6 font-bold shadow-lg shadow-blue-500/30">
                  Cari &amp; Bandingkan Produk →
                </Button>
              </Link>
              <Link href="/simulation">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 font-bold bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  Hitung Simulasi Premi
                </Button>
              </Link>
            </div>

            {/* Rating and Social Proof */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs text-slate-400">
              <span className="font-semibold text-amber-300">
                ⭐ 4.9/5 Rating Kepuasan Nasabah &nbsp;•&nbsp; 100% Bebas Biaya Tersembunyi
              </span>
              <span className="hidden sm:inline text-slate-600">|</span>
              <span className="text-slate-400">
                Keputusan underwriting otomatis dan transparan berbasis data resmi OJK.
              </span>
            </div>
          </div>

          {/* Hero Right Interactive Preview Card */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-7 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white shadow-xl space-y-5 text-left">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  ● Instant Approval Engine
                </span>
                <span className="text-[10px] text-slate-400 font-mono">SLA &lt; 45s</span>
              </div>

              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Secure Life Plus</h3>
                <p className="text-xs text-slate-300 mt-0.5">Asuransi Jiwa &amp; Perlindungan Keluarga Utama</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Premi Mulai</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg font-extrabold text-white">Rp 185.000</span>
                    <span className="text-[11px] text-slate-400">/ bln</span>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Uang Pertanggungan</span>
                  <span className="text-base font-extrabold text-blue-400 block mt-0.5">Hingga Rp 1 Miliar</span>
                </div>
              </div>

              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Santunan Meninggal Dunia 100% Uang Pertanggungan</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Perlindungan Terminal Illness &amp; Santunan Duka Menyeluruh</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Tanpa Medical Check-up untuk pengajuan standar</span>
                </li>
              </ul>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-300 font-bold">
                <span>✨ Status Underwriting: Disetujui Otomatis dalam 45 Detik</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Grid SVG */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
          <svg width="400" height="400" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="48" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="50" cy="50" r="32" stroke="white" strokeWidth="2" />
            <circle cx="50" cy="50" r="16" stroke="white" strokeWidth="2" strokeDasharray="2 2" />
          </svg>
        </div>
      </section>

      {/* 2. 4-FEATURE VALUE PROPOSITION STRIP */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
            🛡️
          </div>
          <h3 className="text-sm font-extrabold text-slate-900">3 Kategori Polis</h3>
          <p className="text-xs text-slate-600 font-medium">Jiwa, Kesehatan, &amp; Kendaraan</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Berlisensi dan diawasi resmi oleh Otoritas Jasa Keuangan (OJK).
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
            ⚙️
          </div>
          <h3 className="text-sm font-extrabold text-slate-900">Smart Pricing Engine</h3>
          <p className="text-xs text-slate-600 font-medium">8 parameter dinamis premi</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Transparan tanpa biaya siluman berbasis tabel aktuaria TMI IV.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
            ⚡
          </div>
          <h3 className="text-sm font-extrabold text-slate-900">Digital Underwriting</h3>
          <p className="text-xs text-slate-600 font-medium">4 pilar verifikasi instan KTP</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Pencocokan profil finansial, DSR, dan skrining medis otomatis.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-purple-300 transition-all space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg">
            🤖
          </div>
          <h3 className="text-sm font-extrabold text-slate-900">RAG AI Assistant</h3>
          <p className="text-xs text-slate-600 font-medium">Konsultasi polis &amp; klaim 24/7</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Didukung 1024-vector embeddings pgvector OJK SLA respon &lt; 1 detik.
          </p>
        </div>
      </section>

      {/* 3. KATALOG PRODUK UNGGULAN */}
      <section className="space-y-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
              KATALOG UNGGULAN
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Pilihan Perlindungan Terbaik Dari Core API
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Produk terhubung langsung ke database backend dengan rincian manfaat dan tarif transparan.
            </p>
          </div>

          <Link href="/products">
            <Button size="sm" variant="outline" className="shrink-0 font-semibold">
              Lihat Katalog Lengkap →
            </Button>
          </Link>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              category={product.category}
              title={product.title}
              description={product.description}
              startingPrice={product.startingPrice}
              coverageAmount={product.coverageAmount}
              coverageTerm={product.coverageTerm}
              badge={product.badge}
              badgeVariant={product.badgeVariant}
              features={product.features}
              isPopular={product.isPopular}
              onSelect={handleSelectProduct}
            />
          ))}
        </div>

        <div className="text-center pt-2">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Lihat Semua 3+ Produk &amp; Filter Kategori →
          </Link>
        </div>
      </section>

      {/* 4. SIMULASI PREMI INTERAKTIF TEASER */}
      <section className="space-y-6 text-left">
        <div>
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
            SIMULASI PREMI INTERAKTIF
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            Hitung Estimasi Premi Secara Terbuka &amp; Presisi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Pricing rules dihitung secara realtime dari parameter usia, uang pertanggungan, status perokok, dan tenor polis.
          </p>
        </div>

        <Card className="p-6 sm:p-8 bg-white border border-slate-200 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Col: Parameter Input Display */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Pilihan Kategori Produk:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    aria-pressed={simCategory === 'life'}
                    onClick={() => setSimCategory('life')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      simCategory === 'life'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Life (Jiwa)
                  </button>
                  <button
                    type="button"
                    aria-pressed={simCategory === 'health'}
                    onClick={() => setSimCategory('health')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      simCategory === 'health'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Health (Kesehatan)
                  </button>
                  <button
                    type="button"
                    aria-pressed={simCategory === 'vehicle'}
                    onClick={() => setSimCategory('vehicle')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      simCategory === 'vehicle'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Vehicle (Kendaraan)
                  </button>
                </div>
              </div>

              {/* Parameter Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 block">Usia Tertanggung</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-bold text-slate-900">{simAge} Tahun</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="Kurangi Usia"
                        onClick={() => setSimAge((a) => Math.max(18, a - 1))}
                        className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        aria-label="Tambah Usia"
                        onClick={() => setSimAge((a) => Math.min(65, a + 1))}
                        className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 block">Jenis Kelamin</span>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      aria-pressed={simGender === 'pria'}
                      onClick={() => setSimGender('pria')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        simGender === 'pria'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      Pria
                    </button>
                    <button
                      type="button"
                      aria-pressed={simGender === 'wanita'}
                      onClick={() => setSimGender('wanita')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        simGender === 'wanita'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      Wanita
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 block">Uang Pertanggungan (UP)</span>
                  <span className="text-sm font-bold text-slate-900 block mt-1">
                    Rp 500.000.000 (500 Jt)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 block">Masa Perlindungan &amp; Rokok</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-bold text-slate-800">10 Thn • Non-Smoker</span>
                    <button
                      type="button"
                      aria-pressed={simSmoker}
                      onClick={() => setSimSmoker((s) => !s)}
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        simSmoker ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {simSmoker ? 'Perokok' : 'Non-Smoker'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link href="/simulation">
                  <Button size="md" variant="outline" className="font-semibold text-xs">
                    Hitung Ulang Estimasi Premi 🧮
                  </Button>
                </Link>
                <span className="text-[11px] text-slate-400">
                  *Perhitungan menggunakan pricing rules backend: POST /api/v1/products/:slug/quotes
                </span>
              </div>
            </div>

            {/* Right Col: Indicative Quote Card */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-linear-to-br from-slate-900 to-blue-950 text-white shadow-lg space-y-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider bg-blue-500/20 px-2.5 py-0.5 rounded-md border border-blue-400/20">
                  PREMI INDIKATIF TERBAIK
                </span>
                <span className="text-[11px] text-emerald-400 font-bold">Hemat 6% Tahunan</span>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-white">
                    {simSmoker ? 'Rp 310.000' : 'Rp 245.000'}
                  </span>
                  <span className="text-xs text-slate-400">/ bulan</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Estimasi premi final untuk Secure Life Plus UP Rp 500 Jt
                </p>
              </div>

              <div className="border-t border-white/10 pt-3 space-y-2 text-xs text-slate-300">
                <span className="font-bold text-white text-[11px] block">
                  Rincian Faktor Pricing Engine:
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-300">
                  <span>• Faktor Usia {simAge}: 1.25x</span>
                  <span>• Faktor Gender {simGender === 'pria' ? 'Pria' : 'Wanita'}: 1.05x</span>
                  <span>• Status {simSmoker ? 'Smoker: 1.35x' : 'Non-Smoker: 1.00x'}</span>
                  <span>• Frekuensi Tahunan: Diskon 6%</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300 leading-normal">
                ✓ Transparan 100% tanpa markup agen. Premi mengikat setelah verifikasi underwriting.
              </div>

              <Link href="/apply" className="block pt-1">
                <Button size="md" variant="primary" className="w-full justify-center font-bold text-xs shadow-md shadow-blue-500/30">
                  Lanjut Ajukan Aplikasi Polis →
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>

      {/* 5. 4-TAHAP WORKFLOW UNDERWRITING CEPAT */}
      <section className="space-y-6 text-left">
        <div>
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
            WORKFLOW UNDERWRITING CEPAT
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            Aplikasi Polis Selesai Dalam 4 Tahap Mudah
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Sistem automated underwriting kami memvalidasi data Anda secara aman dan transparan tanpa birokrasi berbelit.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tahap 1 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase block">
                TAHAP 01
              </span>
              <h4 className="text-base font-extrabold text-slate-900">Verifikasi KTP Dukcapil</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pencocokan NIK otomatis dengan database kependudukan nasional untuk validitas tertanggung resmi.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <Badge variant="emerald" size="sm">✓ Status: Identity Validated</Badge>
            </div>
          </div>

          {/* Tahap 2 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase block">
                TAHAP 02
              </span>
              <h4 className="text-base font-extrabold text-slate-900">Analisis Kemampuan UP</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kalkulasi rasio pendapatan dan uang pertanggungan agar polis tepat sasaran dan terjangkau.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <Badge variant="emerald" size="sm">✓ Status: Income Verified</Badge>
            </div>
          </div>

          {/* Tahap 3 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase block">
                TAHAP 03
              </span>
              <h4 className="text-base font-extrabold text-slate-900">Validasi Berkas Digital</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Unggah foto KTP dan bukti pendukung secara instan melalui kamera ponsel dengan enkripsi TLS 1.3.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <Badge variant="emerald" size="sm">✓ Status: Docs Approved</Badge>
            </div>
          </div>

          {/* Tahap 4 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase block">
                TAHAP 04
              </span>
              <h4 className="text-base font-extrabold text-slate-900">Kuesioner Kesehatan</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Jawaban deklarasi kesehatan singkat dianalisis oleh medical risk rule engine tanpa perlu MCU.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <Badge variant="emerald" size="sm">✓ Status: Medical Cleared</Badge>
            </div>
          </div>
        </div>

        {/* Highlight 95% Approval Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
          <div className="space-y-1">
            <span className="text-sm font-extrabold text-blue-950 flex items-center gap-1.5">
              ⚡ 95% Aplikasi Disetujui Secara Otomatis dalam 5 Menit
            </span>
            <p className="text-xs text-slate-600">
              Jika memerlukan review khusus, tim underwriter berlisensi kami memproses manual dalam 1x24 jam kerja.
            </p>
          </div>
          <Link href="/apply" className="shrink-0">
            <Button size="sm" variant="primary" className="font-bold text-xs">
              Mulai Pendaftaran ➔
            </Button>
          </Link>
        </div>
      </section>

      {/* 6. RAG AI ASSISTANT EMBEDDINGS SECTION */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-6 text-left">
        <div className="max-w-3xl space-y-2">
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
            🤖 RAG AI ASSISTANT EMBEDDINGS
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Bingung Memilih Polis atau Cara Klaim? Tanya AI Kami Kapan Saja.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Dilatih langsung dengan seluruh klausul polis, aturan underwriting, dan panduan klaim resmi berstandar OJK.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Quick Prompt Suggestions */}
          <div className="lg:col-span-5 space-y-2.5">
            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
              Contoh Pertanyaan Populer:
            </span>
            <div className="space-y-2">
              <Link
                href="/assistant"
                className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-blue-400 hover:bg-slate-800 text-xs text-slate-200 block transition-all"
              >
                💬 &quot;Apa saja syarat pengajuan klaim meninggal dunia?&quot;
              </Link>
              <Link
                href="/assistant"
                className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-blue-400 hover:bg-slate-800 text-xs text-slate-200 block transition-all"
              >
                💬 &quot;Berapa UP ideal untuk usia 30 tahun?&quot;
              </Link>
              <Link
                href="/assistant"
                className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-blue-400 hover:bg-slate-800 text-xs text-slate-200 block transition-all"
              >
                💬 &quot;Apakah penyakit kritis langsung ter-cover?&quot;
              </Link>
            </div>
            <div className="pt-2">
              <Link href="/assistant">
                <Button size="sm" variant="primary" className="font-bold text-xs">
                  Buka Halaman Konsultasi AI Penuh ➔
                </Button>
              </Link>
            </div>
          </div>

          {/* Interactive Chat Bubble Mockup */}
          <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span>🤖 Bayu AI Assistant</span>
                <span className="text-[10px] text-slate-500">• Terdaftar OJK</span>
              </span>
              <span className="text-[11px] text-slate-500">Respon SLA: 420ms</span>
            </div>

            {/* User Message */}
            <div className="flex gap-2.5 max-w-md ml-auto flex-row-reverse text-right">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shrink-0">
                👤
              </div>
              <div className="p-3 rounded-2xl bg-blue-600 text-white text-xs leading-relaxed rounded-tr-xs">
                &quot;Apakah ada masa tunggu untuk klaim penyakit kritis?&quot;
              </div>
            </div>

            {/* AI Response Message */}
            <div className="flex gap-2.5 max-w-lg mr-auto text-left">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs shrink-0">
                ✨
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 text-xs leading-relaxed rounded-tl-xs space-y-2">
                <p>
                  Untuk produk Secure Life Plus, masa tunggu rawat inap 30 hari kalender, dan perlindungan kecelakaan aktif seketika (0 hari masa tunggu).
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                    📚 Polis Baku Bab IV &amp; SEOJK.05/2022
                  </span>
                </div>
              </div>
            </div>

            {/* Simulated Input Bar */}
            <div className="pt-2 flex items-center gap-2">
              <input
                type="text"
                readOnly
                onClick={() => router.push('/assistant')}
                placeholder="Tanyakan seputar produk, syarat klaim, atau simulasi..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-400 cursor-pointer"
              />
              <Link href="/assistant">
                <Button size="sm" variant="primary" className="font-bold text-xs">
                  Kirim
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PERTANYAAN UMUM (FAQ ACCORDION) */}
      <section className="space-y-6 text-left">
        <div>
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
            PERTANYAAN UMUM
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            Semua Hal yang Perlu Anda Ketahui
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Jawaban transparan seputar produk, perhitungan premi, dan pengajuan klaim asuransi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqItems.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all space-y-2 cursor-pointer"
                onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
              >
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                    {item.question}
                  </h4>
                  <span className="text-slate-400 font-bold text-sm shrink-0">
                    {isOpen ? '−' : '+'}
                  </span>
                </div>
                {isOpen && (
                  <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. PRE-FOOTER AI CONSULTATION BANNER */}
      <section className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border border-blue-800 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 text-left">
        <div className="space-y-2 max-w-xl">
          <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block">
            AI ASSISTANT
          </span>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Butuh Rekomendasi Polis yang Tepat?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Konsultasikan kebutuhan proteksi keluarga Anda dengan AI Assistant kami yang siap 24/7.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex flex-wrap gap-2 text-[11px]">
            <Link
              href="/assistant"
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 font-semibold transition-all"
            >
              Rekomendasi usia 30
            </Link>
            <Link
              href="/assistant"
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 font-semibold transition-all"
            >
              Cara klaim kesehatan
            </Link>
          </div>
          <Link href="/assistant">
            <Button size="md" variant="primary" className="h-10 px-5 font-bold text-xs shadow-md shadow-blue-500/30 whitespace-nowrap">
              Tanya AI Sekarang ➔
            </Button>
          </Link>
        </div>
      </section>

      {/* 9. FLOATING AI ASSISTANT FAB BUTTON */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-blue-600 text-white font-bold text-xs shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20 cursor-pointer"
        >
          <span className="text-base">🤖</span>
          <span>Tanya AI InsuRisk</span>
        </button>
      </div>

      {/* AI Assistant Drawer Modal */}
      <AIAssistantDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};
