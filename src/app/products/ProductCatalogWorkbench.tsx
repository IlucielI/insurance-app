'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  InsuranceProduct,
  ProductCategoryKey,
} from '@/server/repositories/product.repository.interface';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { AIAssistantBanner } from '@/components/molecules/AIAssistantBanner';
import { ProductCard } from '@/components/molecules/ProductCard';

export interface ProductCatalogWorkbenchProps {
  initialProducts: InsuranceProduct[];
}

export interface CanonicalProductItem {
  id: string;
  slug: string;
  categoryKey: ProductCategoryKey;
  category: string;
  title: string;
  tagline: string;
  startingPrice: string;
  coverageAmount: string;
  coverageTerm: string;
  features: string[];
  isPopular?: boolean;
  badge?: string;
  badgeVariant?: 'emerald' | 'blue' | 'amber' | 'purple' | 'slate';
  baseRate: number;
  minAge: number;
  maxAge: number;
  minSumAssured: number;
  maxSumAssured: number;
  waitingPeriodDays: number;
  claimMethod: 'cashless' | 'instant_transfer' | 'reimbursement';
  underwritingNote: string;
  apiEndpoint: string;
  benefitsDetailed: { title: string; description: string }[];
  riders: { id: string; name: string; extraPrice: string; description?: string }[];
}

export const PENPOT_CANONICAL_PRODUCTS: CanonicalProductItem[] = [
  {
    id: 'secure-life-plus',
    slug: 'secure-life-plus',
    categoryKey: 'life',
    category: 'ASURANSI JIWA',
    title: 'Secure Life Plus',
    tagline:
      'Perlindungan finansial penuh bagi keluarga tercinta dengan jaminan warisan pasti.',
    startingPrice: 'Mulai Rp 250.000 / bln',
    coverageAmount: 'Uang Pertanggungan s/d Rp 2 Miliar',
    coverageTerm: '10, 20 Tahun atau s/d Usia 75',
    isPopular: true,
    badge: 'PALING POPULER',
    badgeVariant: 'blue',
    features: [
      'Santunan meninggal dunia 100% UP tunai',
      'Tambahan 100% UP untuk kecelakaan transportasi',
      'Bebas premi jika terdiagnosa sakit kritis',
      'Underwriting instan tanpa MCU (UP < 1M)',
    ],
    baseRate: 0.0035,
    minAge: 18,
    maxAge: 60,
    minSumAssured: 100_000_000,
    maxSumAssured: 2_000_000_000,
    waitingPeriodDays: 0,
    claimMethod: 'instant_transfer',
    underwritingNote: 'Verifikasi KTP Dukcapil & DSR finansial otomatis < 15 menit.',
    apiEndpoint: 'POST /products/secure-life-plus/quotes',
    benefitsDetailed: [
      {
        title: 'Santunan Meninggal Dunia 100% UP Tunai',
        description:
          'Pembayaran tunai 100% Uang Pertanggungan langsung ke rekening ahli waris tanpa pemotongan biaya.',
      },
      {
        title: 'Tambahan 100% UP Kecelakaan Transportasi',
        description:
          'Kompensasi ganda (Double Indemnity) jika tertanggung mengalami musibah pada moda transportasi berizin.',
      },
      {
        title: 'Pembebasan Pembayaran Premi',
        description:
          'Seluruh sisa premi dibebaskan bila tertanggung didiagnosa salah satu dari 49 kondisi penyakit kritis.',
      },
      {
        title: 'Underwriting Instan Tanpa Medical Check-Up',
        description:
          'Persetujuan otomatis berbasis algoritma scoring risiko untuk UP hingga batas Rp 1 Miliar.',
      },
    ],
    riders: [
      {
        id: 'rider-accidental-death',
        name: 'Accidental Death & Dismemberment',
        extraPrice: 'Rp 35.000 / bln',
        description: 'Santunan cacat tetap total atau meninggal akibat kecelakaan kerja/lalu lintas.',
      },
      {
        id: 'rider-terminal-illness',
        name: 'Terminal Illness Early Payout',
        extraPrice: 'Rp 25.000 / bln',
        description: 'Pencairan darurat 50% UP jika terdiagnosa penyakit terminal.',
      },
    ],
  },
  {
    id: 'health-guard-essential',
    slug: 'health-guard-essential',
    categoryKey: 'health',
    category: 'ASURANSI KESEHATAN',
    title: 'Health Guard Essential',
    tagline:
      'Perlindungan rawat inap dan pembedahan cashless di 2,000+ RS rekanan terkemuka.',
    startingPrice: 'Mulai Rp 350.000 / bln',
    coverageAmount: 'Limit Tahunan s/d Rp 1 Miliar',
    coverageTerm: 'Tahunan (Dapat Diperpanjang Seumur Hidup)',
    isPopular: false,
    features: [
      'Cashless di 2,000+ RS di seluruh Indonesia',
      'Kamar 1 pasien 1 bed (privat & nyaman)',
      'Cover rawat jalan pra & pasca rawat inap',
      'Garansi perpanjangan polis seumur hidup',
    ],
    baseRate: 0.005,
    minAge: 0,
    maxAge: 65,
    minSumAssured: 100_000_000,
    maxSumAssured: 1_000_000_000,
    waitingPeriodDays: 30,
    claimMethod: 'cashless',
    underwritingNote: 'Digital card langsung aktif di sistem kasir RS rekanan.',
    apiEndpoint: 'POST /products/health-guard-essential/quotes',
    benefitsDetailed: [
      {
        title: 'Fasilitas Cashless di 2.000+ Rumah Sakit',
        description:
          'Tunjukkan e-Card pada aplikasi untuk rawat inap tanpa uang muka di seluruh jaringan Siloam, Mitra Keluarga, dan RSUD.',
      },
      {
        title: 'Privilege Kamar 1 Bed Privat',
        description:
          'Jaminan kamar isolasi atau VIP 1 tempat tidur untuk kenyamanan pemulihan maksimal pasien.',
      },
      {
        title: 'Rawat Jalan Pra & Pasca Rawat Inap',
        description:
          'Penggantian biaya konsultasi dokter spesialis dan laboratorium 30 hari sebelum dan 60 hari sesudah rawat inap.',
      },
      {
        title: 'Garansi Keterbaruan Polis (Guaranteed Renewable)',
        description:
          'Polis dijamin dapat terus diperpanjang tahunan tanpa risiko pembatalan sepihak akibat riwayat klaim tinggi.',
      },
    ],
    riders: [
      {
        id: 'rider-dental-care',
        name: 'Dental Care Comprehensive',
        extraPrice: 'Rp 65.000 / bln',
        description: 'Perawatan gigi pencegahan, penambalan, dan pembersihan karang gigi dua kali setahun.',
      },
      {
        id: 'rider-maternity',
        name: 'Maternity & Newborn Care',
        extraPrice: 'Rp 120.000 / bln',
        description: 'Santunan biaya persalinan normal maupun caesar dan perawatan inkubator bayi baru lahir.',
      },
    ],
  },
  {
    id: 'auto-shield-comprehensive',
    slug: 'auto-shield-comprehensive',
    categoryKey: 'vehicle',
    category: 'ASURANSI KENDARAAN',
    title: 'Auto Shield Comprehensive',
    tagline:
      'Proteksi komprehensif all-risk kendaraan Anda dari kerusakan, banjir, dan kehilangan.',
    startingPrice: 'Tarif 1.85% OTR / thn',
    coverageAmount: 'Sesuai Nilai Pasar Kendaraan',
    coverageTerm: '1 Tahun Polis Komprehensif',
    isPopular: false,
    features: [
      'Perbaikan di 450+ bengkel authorized resmi',
      'Sparepart original bergaransi 6 bulan',
      'Emergency Roadside Assistance (Derek 24/7)',
      'Tanggung Jawab Pihak Ketiga (TJH III s/d 50 Jt)',
    ],
    baseRate: 0.0185,
    minAge: 18,
    maxAge: 70,
    minSumAssured: 50_000_000,
    maxSumAssured: 1_500_000_000,
    waitingPeriodDays: 0,
    claimMethod: 'instant_transfer',
    underwritingNote: 'Inspeksi fisik mandiri via video recording AI dalam aplikasi.',
    apiEndpoint: 'POST /products/auto-shield-comprehensive/quotes',
    benefitsDetailed: [
      {
        title: 'Bengkel Rekanan Resmi Authorized',
        description:
          'Perbaikan dilakukan oleh teknisi tersertifikasi ATPM (Astra, Honda, Toyota, Hyundai) dengan garansi pengerjaan.',
      },
      {
        title: 'Jaminan Suku Cadang Asli',
        description:
          'Penggantian spare part 100% Genuine OEM dengan masa garansi mutu komponen selama 6 bulan.',
      },
      {
        title: 'Layanan Derek & Emergency Roadside 24/7',
        description:
          'Bantuan derek darurat, jumper aki, penggantian ban bocor, dan pengantaran bensin darurat di seluruh jalur tol & kota.',
      },
      {
        title: 'Tanggung Jawab Hukum Pihak Ketiga (TJH III)',
        description:
          'Kompensasi ganti rugi materiil dan medis terhadap pihak ketiga akibat risiko benturan hingga limit Rp 50 Juta.',
      },
    ],
    riders: [
      {
        id: 'rider-huru-hara',
        name: 'Perlindungan Huru-Hara & Bencana Alam',
        extraPrice: 'Rp 20.000 / bln',
        description: 'Perluasan pertanggungan risiko banjir, gempa bumi, angin topan, huru-hara, dan kerusuhan (SRCC).',
      },
      {
        id: 'rider-personal-accident',
        name: 'Personal Accident Penumpang',
        extraPrice: 'Rp 15.000 / bln',
        description: 'Santunan kecelakaan diri bagi pengemudi dan hingga 4 orang penumpang terdaftar.',
      },
    ],
  },
];

export const ProductCatalogWorkbench: React.FC<ProductCatalogWorkbenchProps> = ({
  initialProducts,
}) => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<CanonicalProductItem | null>(null);
  const [showComparisonTable, setShowComparisonTable] = useState<boolean>(false);

  // Combine Penpot canonical products with any server-provided initial products
  const allProducts: CanonicalProductItem[] = useMemo(() => {
    if (!Array.isArray(initialProducts) || initialProducts.length === 0) {
      return PENPOT_CANONICAL_PRODUCTS;
    }

    // Pre-index canonical IDs, slugs, and lowercase titles into O(1) Sets
    const existingIds = new Set(
      PENPOT_CANONICAL_PRODUCTS.flatMap((c) => [c.id, c.slug])
    );
    const existingTitles = new Set(
      PENPOT_CANONICAL_PRODUCTS.map((c) => c.title.toLowerCase())
    );

    // Eager batch filter and transform non-duplicate initial products
    const additionalProducts: CanonicalProductItem[] = initialProducts
      .filter((p) => !existingIds.has(p.id) && !existingTitles.has(p.title.toLowerCase()))
      .map((p) => ({
        id: p.id,
        slug: p.slug || p.id,
        categoryKey: p.categoryKey,
        category: p.category.toUpperCase(),
        title: p.title,
        tagline: p.description,
        startingPrice: p.startingPrice,
        coverageAmount: p.coverageAmount,
        coverageTerm: p.coverageTerm,
        features: p.features,
        isPopular: p.isPopular,
        badge: p.badge,
        badgeVariant: p.badgeVariant,
        baseRate: p.baseRate,
        minAge: p.minAge,
        maxAge: p.maxAge,
        minSumAssured: p.minSumAssured,
        maxSumAssured: p.maxSumAssured,
        waitingPeriodDays: p.waitingPeriodDays,
        claimMethod: p.claimMethod,
        underwritingNote: p.underwritingNote,
        apiEndpoint: `POST /products/${p.id}/quotes`,
        benefitsDetailed: p.benefitsDetailed || [],
        riders: p.riders || [],
      }));

    return [...PENPOT_CANONICAL_PRODUCTS, ...additionalProducts];
  }, [initialProducts]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    let result = allProducts;

    if (activeCategory !== 'all') {
      result = result.filter((p) => p.categoryKey === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.features.some((f) => f.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allProducts, activeCategory, searchQuery]);

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

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* 1. BREADCRUMBS & HERO HEADER (100% Penpot Canvas Spec) */}
      <section className="space-y-3 pt-2 text-left">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Beranda
          </Link>
          <span className="text-slate-300" aria-hidden="true">/</span>
          <span className="text-slate-600 font-semibold" aria-current="page">Katalog Produk Asuransi</span>
        </nav>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          Pilihan Produk Proteksi Unggulan
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-3xl">
          Seluruh produk terintegrasi langsung ke Core API engine untuk kalkulasi premi transparan dan
          underwriting instan.
        </p>
      </section>

      {/* 2. CATEGORY FILTER PILLS & SEARCH CONTROLS (Penpot Canvas Spec) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Semua Produk ({allProducts.length})
          </button>
          <button
            type="button"
            aria-pressed={activeCategory === 'life'}
            onClick={() => setActiveCategory('life')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'life'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Asuransi Jiwa
          </button>
          <button
            type="button"
            aria-pressed={activeCategory === 'health'}
            onClick={() => setActiveCategory('health')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'health'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Asuransi Kesehatan
          </button>
          <button
            type="button"
            aria-pressed={activeCategory === 'vehicle'}
            onClick={() => setActiveCategory('vehicle')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'vehicle'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Asuransi Kendaraan
          </button>
        </div>

        {/* Search & Reset */}
        <div className="relative min-w-[220px]">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
            🔍
          </span>
          <input
            type="text"
            aria-label="Cari produk asuransi"
            placeholder="Cari produk proteksi..."
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
      </div>

      {/* 3. PRODUCT CARDS GRID (100% Penpot Canvas Dimensions & Layout) */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <div className="text-4xl">🔍</div>
          <h3 className="text-base font-bold text-slate-900">Produk Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tidak ada produk asuransi yang cocok dengan filter atau kata kunci pencarian Anda.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {filteredProducts.map((product) => (
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
              onDetails={() => setSelectedProduct(product)}
            />
          ))}
        </div>
      )}

      {/* 4. CORE API GUARANTEE BANNER (100% Penpot Canvas Spec) */}
      <section className="rounded-3xl bg-slate-900 border border-slate-800 text-white p-6 sm:p-8 shadow-xl space-y-5 text-left">
        <div className="space-y-2">
          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-800 text-sky-400 text-[10px] font-bold tracking-wider uppercase border border-slate-700/60">
            CORE API GUARANTEE
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Perhitungan Presisi &amp; Lifecycle Terintegrasi
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Semua data produk, kalkulasi faktor risiko, serta review checks diproses langsung oleh Core API.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
          <div className="space-y-1">
            <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              <span>⚡</span>
              <span>Pricing Rules Dinamis</span>
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Faktor risiko &amp; usia dihitung real-time dengan formula underwriting terkalibrasi OJK.
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              <span>⚡</span>
              <span>4 Checks Underwriting</span>
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Cek otomatis identitas Dukcapil, rasio income DSR, validitas dokumen, &amp; pilar medis.
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              <span>⚡</span>
              <span>AI Assistant Siaga 24/7</span>
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Tanya klausul produk, unduh polis resmi, &amp; panduan simulasi polis instan.
            </p>
          </div>
        </div>
      </section>

      {/* 5. PRE-FOOTER AI ASSISTANT BANNER */}
      <AIAssistantBanner />

      {/* 6. COMPARISON MATRIX TOGGLE & TABLE */}
      <div className="pt-2 text-left">
        <button
          type="button"
          onClick={() => setShowComparisonTable((prev) => !prev)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
        >
          <span>⚖️</span>
          <span>{showComparisonTable ? 'Sembunyikan' : 'Tampilkan'} Matriks Komparasi Fitur Polis</span>
          <span className="text-slate-400">{showComparisonTable ? '▲' : '▼'}</span>
        </button>

        {showComparisonTable && (
          <div className="mt-4 overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-xs animate-in fade-in duration-200">
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
        )}
      </div>

      {/* 7. PRODUCT DETAIL & BENEFITS MODAL */}
      {selectedProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-detail-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedProduct(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 text-left">
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
                <h3 id="product-detail-modal-title" className="text-xl font-extrabold text-slate-900">
                  {selectedProduct.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-lg">
                  {selectedProduct.tagline}
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
              {/* Parameters Grid */}
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
                    {selectedProduct.waitingPeriodDays === 0
                      ? '0 Hari (Langsung Aktif)'
                      : `${selectedProduct.waitingPeriodDays} Hari`}
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
