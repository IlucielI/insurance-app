'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { InsuranceProduct } from '@/server/repositories/product.repository.interface';
import { ProductCard } from '@/components/molecules/ProductCard';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { AIAssistantBanner } from '@/components/molecules/AIAssistantBanner';
import {
  PENPOT_CANONICAL_PRODUCTS,
  CanonicalProductItem,
} from '@/app/products/ProductCatalogWorkbench';

export interface HomeWorkbenchProps {
  initialFeaturedProducts: InsuranceProduct[];
}

export const HomeWorkbench: React.FC<HomeWorkbenchProps> = ({
  initialFeaturedProducts,
}) => {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<CanonicalProductItem | null>(null);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    if (!selectedProduct) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProduct]);

  const handleSelectSimulation = (productId: string) => {
    router.push(`/simulation?productId=${encodeURIComponent(productId)}`);
  };

  const handleSelectApply = (productId: string) => {
    router.push(`/apply?productId=${encodeURIComponent(productId)}`);
  };

  const productsToDisplay = useMemo(() => {
    if (!Array.isArray(initialFeaturedProducts) || initialFeaturedProducts.length === 0) {
      return PENPOT_CANONICAL_PRODUCTS;
    }

    return initialFeaturedProducts.map((p) => {
      const canonical = PENPOT_CANONICAL_PRODUCTS.find(
        (cp) =>
          cp.slug === p.slug ||
          cp.id === p.id ||
          cp.slug === p.id ||
          cp.title.toLowerCase() === p.title.toLowerCase()
      );
      if (canonical) {
        return {
          ...canonical,
          id: p.id,
          slug: p.slug || canonical.slug,
        };
      }
      return {
        ...p,
        slug: p.slug || p.id,
        categoryKey: (p.categoryKey || 'life') as any,
        category: p.category.toUpperCase(),
        tagline: p.description,
        startingPrice: p.startingPrice,
        coverageAmount: p.coverageAmount,
        coverageTerm: p.coverageTerm,
        features: p.features,
        isPopular: p.isPopular,
        badge: p.badge,
        badgeVariant: p.badgeVariant,
        baseRate: p.baseRate ?? 0.0035,
        minAge: p.minAge ?? 18,
        maxAge: p.maxAge ?? 60,
        minSumAssured: p.minSumAssured ?? 100_000_000,
        maxSumAssured: p.maxSumAssured ?? 2_000_000_000,
        waitingPeriodDays: p.waitingPeriodDays ?? 0,
        claimMethod: p.claimMethod ?? 'instant_transfer',
        underwritingNote: p.underwritingNote ?? 'Verifikasi otomatis Core API.',
        apiEndpoint: `POST /products/${p.slug || p.id}/quotes`,
        benefitsDetailed: p.benefitsDetailed || [],
        riders: p.riders || [],
      };
    });
  }, [initialFeaturedProducts]);

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
          {productsToDisplay.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              slug={product.slug}
              category={product.category}
              title={product.title}
              tagline={product.tagline}
              description={product.tagline}
              startingPrice={product.startingPrice}
              coverageAmount={product.coverageAmount}
              coverageTerm={product.coverageTerm}
              features={product.features}
              isPopular={Boolean(product.isPopular)}
              badge={product.badge}
              badgeVariant={product.badgeVariant}
              apiEndpoint={product.apiEndpoint}
              onSimulate={handleSelectSimulation}
              onApply={handleSelectApply}
              onDetails={() => setSelectedProduct(product as any)}
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

      {/* 4. 4-TAHAP WORKFLOW UNDERWRITING CEPAT */}
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

      {/* 5. PERTANYAAN UMUM (FAQ ACCORDION) */}
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

      {/* 6. PRE-FOOTER AI CONSULTATION BANNER */}
      <AIAssistantBanner />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="home-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedProduct(null);
            }
          }}
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 text-left">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div>
                <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase">
                  {selectedProduct.category}
                </span>
                <h3 id="home-modal-title" className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                  {selectedProduct.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {selectedProduct.tagline}
                </p>
              </div>
              <button
                type="button"
                aria-label="Tutup Detail Produk"
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors shrink-0 cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Key Specs Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Base Rate</span>
                  <span className="font-extrabold text-slate-900 font-mono">
                    {selectedProduct.baseRate ? `${(selectedProduct.baseRate * 100).toFixed(2)}%` : '0.35%'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Usia Masuk</span>
                  <span className="font-extrabold text-slate-900 font-mono">
                    {selectedProduct.minAge} - {selectedProduct.maxAge} Thn
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Masa Polis</span>
                  <span className="font-bold text-slate-900 truncate block">
                    {selectedProduct.coverageTerm || '10 - 20 Thn'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Klaim</span>
                  <span className="font-bold text-slate-900 uppercase">
                    {selectedProduct.claimMethod ? selectedProduct.claimMethod.replace('_', ' ') : 'Instant'}
                  </span>
                </div>
              </div>

              {/* Benefits Detailed */}
              {selectedProduct.benefitsDetailed && selectedProduct.benefitsDetailed.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🛡️</span>
                    <span>Cakupan Manfaat Utama Polis</span>
                  </h4>
                  <div className="space-y-2.5">
                    {selectedProduct.benefitsDetailed.map((b, idx) => (
                      <div
                        key={`b-${idx}`}
                        className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 text-xs space-y-1"
                      >
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="text-emerald-500 font-bold">✓</span>
                          {b.title}
                        </span>
                        <p className="text-slate-600 pl-4 leading-relaxed text-[11px]">
                          {b.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Riders */}
              {selectedProduct.riders && selectedProduct.riders.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span>➕</span>
                    <span>Asuransi Tambahan (Rider Opsional)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedProduct.riders.map((r) => (
                      <div
                        key={r.id}
                        className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{r.name}</span>
                          <span className="text-[11px] font-semibold text-blue-700">{r.extraPrice}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{r.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Underwriting Assurance */}
              <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 text-[11px] text-emerald-800 flex items-start gap-2.5">
                <span className="text-base shrink-0">🏛️</span>
                <div>
                  <strong className="block text-emerald-900 font-bold mb-0.5">Underwriting OJK Terakreditasi</strong>
                  <span>{selectedProduct.underwritingNote}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                Tutup
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedProduct.slug || selectedProduct.id;
                    setSelectedProduct(null);
                    handleSelectApply(target);
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer shadow-xs shadow-blue-500/20"
                >
                  Daftar Sekarang →
                </button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const target = selectedProduct.slug || selectedProduct.id;
                    setSelectedProduct(null);
                    handleSelectSimulation(target);
                  }}
                  className="font-bold text-xs"
                >
                  Simulasi Premi 🧮
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
