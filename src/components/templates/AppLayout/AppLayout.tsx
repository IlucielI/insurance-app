import React from 'react';
import Link from 'next/link';
import { HeaderNav } from '@/components/molecules/HeaderNav';
import { InsuranceProduct } from '@/server/repositories/product.repository.interface';

export interface AppLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
  initialProducts?: InsuranceProduct[];
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentPath = '/',
  initialProducts,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <HeaderNav currentPath={currentPath} initialProducts={initialProducts} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {children}
      </main>

      <footer className="w-full border-t border-slate-200 bg-white pt-12 pb-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Main Footer Info */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Brand & Mission */}
            <div className="md:col-span-6 space-y-4 text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-blue-500/20">
                  BI
                </div>
                <div>
                  <span className="font-extrabold text-base text-slate-900 tracking-tight block">
                    Bayu Insurance
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold tracking-wider block uppercase">
                    Insurtech Indonesia
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                Platform asuransi digital terdepan di Indonesia. Melindungi masa depan keluarga Anda dengan teknologi cerdas, transparan, dan terpercaya.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                  🏛️ TERDAFTAR & DIAWASI OJK
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[10px]">
                  🔒 ISO 27001 SECURITY
                </span>
              </div>
            </div>

            {/* Headquarters & Contacts */}
            <div className="md:col-span-6 space-y-3 text-left md:text-right">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                KANTOR PUSAT
              </span>
              <p className="text-xs text-slate-600 max-w-sm ml-auto leading-relaxed">
                Menara Bayu Lt. 18, Jl. Jend. Sudirman Kav. 21, Jakarta Selatan 12920
              </p>
              <p className="text-xs text-slate-600 max-w-sm ml-auto">
                Telepon: <span className="font-semibold text-slate-800">(021) 555-0192</span> &nbsp;|&nbsp; Email: <span className="font-semibold text-slate-800">support@bayuinsurance.co.id</span>
              </p>
            </div>
          </div>

          {/* Bottom Copyright & Legal Links */}
          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <p>
              &copy; {new Date().getFullYear()} PT Bayu Insurance Digital Indonesia. Seluruh hak cipta dilindungi undang-undang.
            </p>
            <nav aria-label="Informasi Legalitas & Regulasi" className="flex flex-wrap items-center gap-3 font-medium">
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">
                Kebijakan Privasi
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-blue-600 transition-colors">
                Syarat &amp; Ketentuan
              </Link>
              <span>•</span>
              <Link href="/security" className="hover:text-blue-600 transition-colors">
                Keamanan Data
              </Link>
              <span>•</span>
              <Link href="/regulations" className="hover:text-blue-600 transition-colors">
                Regulasi OJK
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
};
