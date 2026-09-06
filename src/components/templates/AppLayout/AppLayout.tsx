import React from 'react';
import { HeaderNav } from '@/components/molecules/HeaderNav';

export interface AppLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, currentPath = '/' }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <HeaderNav currentPath={currentPath} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {children}
      </main>

      <footer className="w-full border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">InsuRisk Digital Portal</span>
            <span>•</span>
            <span>Terdaftar dan diawasi oleh Otoritas Jasa Keuangan (OJK).</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>&copy; {new Date().getFullYear()} InsuRisk ID. Seluruh hak cipta dilindungi.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
