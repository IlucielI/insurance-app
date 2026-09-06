'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { InsuranceProduct } from '@/server/repositories/product.repository.interface';
import { ProductCard } from '@/components/molecules/ProductCard';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
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

  const handleSelectProduct = (productId: string) => {
    router.push(`/simulation?productId=${encodeURIComponent(productId)}`);
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-xl shadow-blue-950/20 border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            Teknologi Underwriting AI Berkecepatan Tinggi
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Perlindungan Masa Depan Keluarga Anda,{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-300">
              Tanpa Kerumitan Birokrasi.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Ajukan asuransi digital dengan verifikasi 4 Pilar otomatis (Dukcapil, DSR Finansial,
            Medical History, dan Legalitas Dokumen). Transparan, aman, dan berizin resmi OJK.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link href="/simulation">
              <Button size="lg" variant="primary" className="shadow-lg shadow-blue-500/30">
                Hitung Simulasi Premi 🧮
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                Jelajahi Semua Produk 🛡️
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative Grid Background */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
          <svg width="400" height="400" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="48" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="50" cy="50" r="32" stroke="white" strokeWidth="2" />
            <circle cx="50" cy="50" r="16" stroke="white" strokeWidth="2" strokeDasharray="2 2" />
          </svg>
        </div>
      </section>

      {/* 4 Pillars Underwriting Assurance */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg mb-3">
            🪪
          </div>
          <h3 className="text-sm font-bold text-slate-900">1. Identitas Dukcapil</h3>
          <p className="text-xs text-slate-500 mt-1">
            Ekstraksi OCR e-KTP dan verifikasi biometrik liveness instan ke server Kemendagri.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg mb-3">
            📊
          </div>
          <h3 className="text-sm font-bold text-slate-900">2. Finansial & DSR</h3>
          <p className="text-xs text-slate-500 mt-1">
            Analisis kemampuan bayar premi berbasis rasio Debt-to-Service Ratio (DSR) otomatis.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg mb-3">
            🩺
          </div>
          <h3 className="text-sm font-bold text-slate-900">3. Riwayat Medis</h3>
          <p className="text-xs text-slate-500 mt-1">
            Kuesioner kesehatan pintar tanpa perlu Medical Check-Up untuk UP hingga Rp 1 Miliar.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg mb-3">
            📜
          </div>
          <h3 className="text-sm font-bold text-slate-900">4. Legalitas Polis</h3>
          <p className="text-xs text-slate-500 mt-1">
            Penerbitan sertifikat digital e-Policy berkekuatan hukum dengan enkripsi SHA-256.
          </p>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Produk Pilihan Nasabah
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
              Pilihan Paket Perlindungan Terbaik
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Pilih paket proteksi yang disesuaikan secara presisi dengan kebutuhan finansial dan profil risiko Anda.
            </p>
          </div>

          <Link href="/products">
            <Button size="sm" variant="outline" className="shrink-0 font-semibold">
              Lihat Katalog Lengkap →
            </Button>
          </Link>
        </div>

        {/* Dynamic Product Cards */}
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
      </section>

      {/* Trust & Compliance Banner */}
      <section className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl shrink-0">
            🏛️
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Kepatuhan Regulasi & Standar Keamanan Data</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Seluruh transaksi polis, enkripsi identitas KTP, dan komunikasi data diproses menggunakan protokol TLS 1.3 serta mematuhi regulasi ketat OJK dan asosiasi industri asuransi (AAJI).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Badge variant="emerald" size="md">ISO 27001 Certified</Badge>
          <Badge variant="blue" size="md">OJK Standard</Badge>
        </div>
      </section>

      {/* Floating AI Assistant FAB Button */}
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
