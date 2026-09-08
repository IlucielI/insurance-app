import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/atoms/Button';

export interface AIAssistantBannerProps {
  badgeText?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  href?: string;
  className?: string;
}

export const AIAssistantBanner: React.FC<AIAssistantBannerProps> = ({
  badgeText = 'AI ASSISTANT',
  title = 'Butuh Rekomendasi Polis yang Tepat?',
  description = 'Konsultasikan kebutuhan proteksi keluarga Anda dengan AI Assistant kami yang siap 24/7.',
  buttonText = 'Tanya AI Sekarang ➔',
  href = '/assistant',
  className = '',
}) => {
  return (
    <section
      className={`p-6 sm:p-8 rounded-3xl bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border border-blue-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-left ${className}`}
    >
      <div className="space-y-2 max-w-xl">
        <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block">
          {badgeText}
        </span>
        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="shrink-0 w-full sm:w-auto">
        <Link href={href} className="block">
          <Button
            size="md"
            variant="primary"
            className="w-full sm:w-auto h-10 px-5 font-bold text-xs shadow-md shadow-blue-500/30 whitespace-nowrap"
          >
            {buttonText}
          </Button>
        </Link>
      </div>
    </section>
  );
};
