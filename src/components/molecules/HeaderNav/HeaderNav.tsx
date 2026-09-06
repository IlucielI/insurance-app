import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';

export interface HeaderNavProps {
  currentPath?: string;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ currentPath = '/' }) => {
  const navLinks = [
    { label: 'Beranda', href: '/' },
    { label: 'Katalog Produk', href: '/products' },
    { label: 'Simulasi Premi', href: '/simulation' },
    { label: 'Cek Status Klaim & Polis', href: '/tracking' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            🛡️
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-slate-900 tracking-tight">
                InsuRisk Portal
              </span>
              <Badge variant="blue" size="sm">
                OJK Registered
              </Badge>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              Digital Life & Health Protection
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
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link href="/health" className="hidden sm:inline-block">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              API Online
            </span>
          </Link>
          <Button size="sm" variant="primary">
            Ajukan Polis Sekarang 🚀
          </Button>
        </div>
      </div>
    </header>
  );
};
