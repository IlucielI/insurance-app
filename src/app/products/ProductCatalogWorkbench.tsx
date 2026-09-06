'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { InsuranceProduct, ProductCategoryKey } from '@/server/repositories/product.repository.interface';
import { ProductCard } from '@/components/molecules/ProductCard';
import { Tabs } from '@/components/atoms/Tabs';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Callout } from '@/components/molecules/Callout';

export interface ProductCatalogWorkbenchProps {
  initialProducts: InsuranceProduct[];
}

type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'coverage-desc';

export const ProductCatalogWorkbench: React.FC<ProductCatalogWorkbenchProps> = ({
  initialProducts,
}) => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [selectedProduct, setSelectedProduct] = useState<InsuranceProduct | null>(null);

  // Tab definitions with dynamic counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: initialProducts.length,
      life: 0,
      critical_illness: 0,
      education: 0,
      health: 0,
    };
    initialProducts.forEach((p) => {
      if (counts[p.categoryKey] !== undefined) {
        counts[p.categoryKey]++;
      }
    });
    return counts;
  }, [initialProducts]);

  const tabs = [
    { id: 'all', label: 'Semua Produk', icon: '🛡️', badgeCount: categoryCounts.all },
    { id: 'life', label: 'Asuransi Jiwa', icon: '🕊️', badgeCount: categoryCounts.life },
    { id: 'critical_illness', label: 'Penyakit Kritis', icon: '🩺', badgeCount: categoryCounts.critical_illness },
    { id: 'education', label: 'Dana Pendidikan', icon: '🎓', badgeCount: categoryCounts.education },
    { id: 'health', label: 'Kesehatan Cashless', icon: '🏥', badgeCount: categoryCounts.health },
  ];

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Filter by Category
    if (activeCategory !== 'all') {
      result = result.filter((p) => p.categoryKey === activeCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.features.some((f) => f.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
        case 'price-asc':
          return a.baseRate - b.baseRate;
        case 'price-desc':
          return b.baseRate - a.baseRate;
        case 'coverage-desc':
          return b.maxSumAssured - a.maxSumAssured;
        default:
          return 0;
      }
    });

    return result;
  }, [initialProducts, activeCategory, searchQuery, sortBy]);

  const handleSelectSimulation = (productId: string) => {
    router.push(`/simulation?productId=${encodeURIComponent(productId)}`);
  };

  return (
    <div className="space-y-12">
      {/* Header Banner */}
      <section className="text-center max-w-3xl mx-auto space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <span>🛡️</span>
          <span>Katalog Polis Resmi Berizin OJK</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Pilihan Lengkap Asuransi Digital Masa Depan
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Temukan proteksi jiwa, santunan penyakit kritis, dana pendidikan kuliah anak, dan
          fasilitas rawat inap cashless yang terintegrasi verifikasi underwriting 4 pilar.
        </p>
      </section>

      {/* Filter and Search Controls */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Category Tabs */}
          <Tabs
            tabs={tabs}
            activeTab={activeCategory}
            onChange={(tabId) => setActiveCategory(tabId as ProductCategoryKey | 'all')}
          />

          {/* Search & Sort Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1 sm:flex-initial">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
                🔍
              </span>
              <input
                type="text"
                aria-label="Cari produk asuransi"
                placeholder="Cari produk, santunan, atau fitur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Hapus pencarian"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Select */}
            <select
              aria-label="Urutkan produk"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="popular">Paling Populer</option>
              <option value="price-asc">Premi Terendah</option>
              <option value="price-desc">Premi Tertinggi</option>
              <option value="coverage-desc">Uang Pertanggungan Maksimal</option>
            </select>
          </div>
        </div>

        {/* Results Counter Info */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Menampilkan <strong className="text-slate-800">{filteredProducts.length}</strong> dari{' '}
            <strong className="text-slate-800">{initialProducts.length}</strong> produk proteksi
          </span>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <div className="text-4xl">🔍</div>
          <h3 className="text-base font-bold text-slate-900">Produk Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tidak ada produk asuransi yang cocok dengan kata kunci &quot;{searchQuery}&quot;. Coba ganti
            kata kunci pencarian atau reset filter kategori.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
          >
            Tampilkan Semua Produk
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="flex flex-col">
              <ProductCard
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
                onSelect={handleSelectSimulation}
              />
              <button
                type="button"
                onClick={() => setSelectedProduct(product)}
                className="mt-2 text-center text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline py-1.5 cursor-pointer"
              >
                Lihat Rincian Manfaat & Riders 🔍
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Product Comparison Table */}
      <section className="space-y-4 pt-6 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>⚖️</span>
              <span>Matriks Komparasi Fitur & Benefit Polis</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Bandingkan plafon santunan, masa tunggu, dan mekanisme klaim antar paket asuransi.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Nama Produk</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Uang Pertanggungan Maksimal</th>
                <th className="py-3.5 px-4">Masa Tunggu</th>
                <th className="py-3.5 px-4">Metode Klaim</th>
                <th className="py-3.5 px-4">Seleksi Medis</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProducts.map((p) => (
                <tr key={`comp-${p.id}`} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                    {p.title}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-[11px] font-semibold text-blue-600">{p.category}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                    {p.coverageAmount}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {p.waitingPeriodDays === 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Tanpa Tunggu (0 Hari)
                      </span>
                    ) : (
                      <span>{p.waitingPeriodDays} Hari</span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {p.claimMethod === 'cashless' ? (
                      <span className="font-semibold text-emerald-600">🏥 Cashless RS</span>
                    ) : (
                      <span className="font-semibold text-blue-600">⚡ Transfer Tunai</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {p.underwritingNote}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleSelectSimulation(p.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      Simulasi →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Regulatory & Underwriting Callout */}
      <Callout
        variant="info"
        title="Jaminan Underwriting Otomatis 4 Pilar InsuRisk"
      >
        Setiap pengajuan polis asuransi pada portal ini diproses menggunakan mesin *Automated Underwriting Engine*
        yang memverifikasi keabsahan KTP melalui gateway Dukcapil, kalkulasi Debt Service Ratio (DSR) finansial,
        dan deklarasi riwayat kesehatan tanpa membutuhkan pemeriksaan laboratorium untuk uang pertanggungan hingga Rp 1 Miliar.
      </Callout>

      {/* Product Detail & Benefits Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    {selectedProduct.category}
                  </span>
                  {selectedProduct.badge && (
                    <Badge variant={selectedProduct.badgeVariant || 'blue'} size="sm">
                      {selectedProduct.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {selectedProduct.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-lg">
                  {selectedProduct.description}
                </p>
              </div>

              <button
                type="button"
                aria-label="Tutup Detail Produk"
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200/70 transition-colors cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              {/* Core Parameters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Premi Mulai Dari</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                    {selectedProduct.startingPrice}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Uang Pertanggungan</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                    {selectedProduct.coverageAmount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Masa Pertanggungan</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                    {selectedProduct.coverageTerm}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Batas Usia Masuk</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {selectedProduct.minAge} - {selectedProduct.maxAge} Tahun
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Masa Tunggu</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {selectedProduct.waitingPeriodDays === 0 ? '0 Hari (Langsung Aktif)' : `${selectedProduct.waitingPeriodDays} Hari`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Metode Klaim</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block capitalize">
                    {selectedProduct.claimMethod.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Detailed Benefits List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span>✨</span>
                  <span>Cakupan Manfaat Utama Polis</span>
                </h4>
                <div className="space-y-2.5">
                  {selectedProduct.benefitsDetailed.map((b, idx) => (
                    <div
                      key={`modal-b-${idx}`}
                      className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-1"
                    >
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>{b.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 pl-4 leading-relaxed">
                        {b.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional Riders */}
              {selectedProduct.riders.length > 0 && (
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
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                Tutup
              </button>

              <Button
                size="md"
                variant="primary"
                onClick={() => {
                  const id = selectedProduct.id;
                  setSelectedProduct(null);
                  handleSelectSimulation(id);
                }}
                className="shadow-sm shadow-blue-500/20"
              >
                Lanjut ke Simulasi Premi 🧮
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
