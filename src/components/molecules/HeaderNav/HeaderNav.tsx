'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/atoms/Badge';
import { InsuranceProduct } from '@/server/repositories/product.repository.interface';

export interface HeaderNavProps {
  currentPath?: string;
  initialProducts?: InsuranceProduct[];
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ currentPath = '/', initialProducts }) => {
  const [isApplyMenuOpen, setIsApplyMenuOpen] = useState<boolean>(false);
  const [products, setProducts] = useState<InsuranceProduct[]>(initialProducts || []);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic API Fetching: continuous retry and spinner until connected to Core API
  useEffect(() => {
    if (products.length > 0) return;
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const fetchProducts = () => {
      const fetchUrl =
        typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null'
          ? `${window.location.origin}/api/products`
          : '/api/products';

      try {
        const promise = fetch(fetchUrl);
        if (promise && typeof promise.then === 'function') {
          promise
            .then((res) => (res && typeof res.json === 'function' ? res.json() : null))
            .then((res) => {
              if (isMounted && res?.data && Array.isArray(res.data) && res.data.length > 0) {
                setProducts(res.data);
              } else if (isMounted) {
                timeoutId = setTimeout(fetchProducts, 3000);
              }
            })
            .catch(() => {
              if (isMounted) {
                timeoutId = setTimeout(fetchProducts, 3000);
              }
            });
        }
      } catch {
        // Ignore in environments where fetch is unconfigured
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [products.length]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isApplyMenuOpen) {
        setIsApplyMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isApplyMenuOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsApplyMenuOpen(false);
      }
    };
    if (isApplyMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isApplyMenuOpen]);

  const navLinks = [
    { label: 'Beranda', href: '/' },
    { label: 'Produk', href: '/products' },
    { label: 'Simulasi', href: '/simulation' },
  ];

  // Helper for category styling & icons based on API data
  const getProductCategoryMeta = (catKey: string) => {
    switch (catKey) {
      case 'life':
        return {
          icon: '🛡️',
          iconBg: 'bg-emerald-100 text-emerald-700',
          badgeBg: 'bg-emerald-100 text-emerald-800',
          badgeLabel: 'Jiwa Berjangka',
          cardBorder: 'border-emerald-200/80 bg-emerald-50/30 hover:bg-emerald-50/60',
        };
      case 'critical_illness':
        return {
          icon: '🏥',
          iconBg: 'bg-blue-100 text-blue-700',
          badgeBg: 'bg-slate-100 text-slate-700',
          badgeLabel: 'Penyakit Kritis',
          cardBorder: 'border-slate-200 bg-white hover:bg-slate-50',
        };
      case 'health':
        return {
          icon: '🏥',
          iconBg: 'bg-blue-100 text-blue-700',
          badgeBg: 'bg-slate-100 text-slate-700',
          badgeLabel: 'Kesehatan',
          cardBorder: 'border-slate-200 bg-white hover:bg-slate-50',
        };
      case 'vehicle':
        return {
          icon: '🚗',
          iconBg: 'bg-red-100 text-red-700',
          badgeBg: 'bg-slate-100 text-slate-700',
          badgeLabel: 'Kendaraan Bermotor',
          cardBorder: 'border-slate-200 bg-white hover:bg-slate-50',
        };
      default:
        return {
          icon: '✨',
          iconBg: 'bg-purple-100 text-purple-700',
          badgeBg: 'bg-purple-100 text-purple-800',
          badgeLabel: 'Proteksi',
          cardBorder: 'border-slate-200 bg-white hover:bg-slate-50',
        };
    }
  };

  // Top 3 featured products from API
  const displayedProducts = products.length > 0 ? products.slice(0, 3) : [];

  return (
    <>
      {/* Dark backdrop overlay when dropdown is open */}
      {isApplyMenuOpen && (
        <div
          data-testid="navbar-backdrop"
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-40 transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsApplyMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              BI
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-slate-900 tracking-tight">
                  Bayu Insurance
                </span>
                <Badge variant="blue" size="sm">
                  OJK
                </Badge>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Insurtech Indonesia
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = currentPath === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Pendaftaran ▾ Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                id="pendaftaran-menu-button"
                aria-expanded={isApplyMenuOpen}
                aria-haspopup="true"
                onClick={() => setIsApplyMenuOpen((prev) => !prev)}
                className={`ml-1 px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  isApplyMenuOpen
                    ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-sm'
                    : currentPath === '/apply'
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <span>Pendaftaran</span>
                <span className={`text-[10px] transition-transform duration-200 ${isApplyMenuOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
            </div>
          </nav>

          {/* Floating Mega Dropdown Card (Supports both Desktop and Mobile viewports) */}
          {isApplyMenuOpen && (
            <div
              role="menu"
              ref={dropdownRef}
              aria-labelledby="pendaftaran-menu-button"
              className="fixed sm:absolute top-20 sm:top-full left-4 right-4 sm:left-auto sm:right-6 lg:right-8 mt-2 sm:mt-2.5 w-auto sm:w-[520px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-5 sm:p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[85vh] overflow-y-auto"
            >
              {/* Dropdown Header */}
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    PILIH PRODUK ASURANSI UNTUK DAFTAR
                  </span>
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5">
                    Pilih produk yang ingin Anda ajukan polisnya secara online:
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsApplyMenuOpen(false)}
                  className="sm:hidden text-slate-400 hover:text-slate-600 p-1 text-base font-bold"
                  aria-label="Tutup menu"
                >
                  ✕
                </button>
              </div>

                  {/* Dynamic Product Cards fetched from API */}
                  <div className="space-y-3">
                    {displayedProducts.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center gap-3">
                        <div
                          data-testid="core-api-spinner"
                          className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"
                        />
                        <span className="text-xs font-semibold text-slate-500 animate-pulse">
                          Menghubungkan ke Core API...
                        </span>
                      </div>
                    ) : (
                      displayedProducts.map((p) => {
                        const meta = getProductCategoryMeta(p.categoryKey);
                        const applyUrl = `/apply?productId=${encodeURIComponent(p.slug || p.id)}`;
                        return (
                          <div
                            key={p.id}
                            className={`p-3.5 rounded-2xl transition-all flex items-center justify-between gap-3 border ${meta.cardBorder}`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${meta.iconBg}`}>
                                {meta.icon}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-sm text-slate-900 truncate">
                                    {p.title}
                                  </span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${meta.badgeBg}`}>
                                    {p.category || meta.badgeLabel}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                  {p.tagline || p.description}
                                </p>
                                <span className="text-xs font-bold text-blue-600 mt-1 block">
                                  {p.startingPrice}
                                </span>
                              </div>
                            </div>
                            <Link
                              href={applyUrl}
                              onClick={() => setIsApplyMenuOpen(false)}
                              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 shadow-sm transition-transform active:scale-95"
                            >
                              Daftar →
                            </Link>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer Banner Link */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <Link
                      href="/simulation"
                      onClick={() => setIsApplyMenuOpen(false)}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 text-center text-xs font-bold text-blue-700 block transition-all hover:border-blue-200"
                    >
                      Bandingkan Semua {products.length > 0 ? `${products.length} ` : ''}Produk &amp; Simulasi Lengkap →
                    </Link>
                  </div>
                </div>
              )}

          {/* CTA / Quick Actions */}
          <div className="flex items-center gap-3">
            <Link href="/health" className="hidden sm:inline-block">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                API Online
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setIsApplyMenuOpen((prev) => !prev)}
              className="inline-flex items-center justify-center font-bold text-xs py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
              Ajukan Polis Sekarang 🚀
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
