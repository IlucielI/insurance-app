import React from 'react';

export interface ProductCardProps {
  id: string;
  slug?: string;
  category: string;
  title: string;
  tagline?: string;
  description?: string;
  startingPrice: string;
  coverageAmount?: string;
  coverageTerm?: string;
  badge?: string;
  badgeVariant?: 'emerald' | 'blue' | 'amber' | 'purple' | 'slate';
  features?: string[];
  isPopular?: boolean;
  apiEndpoint?: string;
  onSimulate?: (productId: string) => void;
  onApply?: (productId: string) => void;
  onSelect?: (productId: string) => void;
  onDetails?: () => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  slug,
  category,
  title,
  tagline,
  description,
  startingPrice,
  coverageAmount,
  coverageTerm,
  badge,
  badgeVariant = 'blue',
  features = [],
  isPopular = false,
  apiEndpoint,
  onSimulate,
  onApply,
  onSelect,
  onDetails,
  className = '',
}) => {
  const isHighlight = Boolean(isPopular);
  const displayTagline = tagline || description || '';
  const displayCoverage = coverageAmount || coverageTerm || 'Uang Pertanggungan s/d Rp 1 Miliar';
  const targetId = slug || id;
  const endpointText = apiEndpoint || `POST /products/${targetId}/quotes`;

  const handleSimulation = () => {
    if (onSimulate) {
      onSimulate(targetId);
    } else if (onSelect) {
      onSelect(targetId);
    }
  };

  const handleApply = () => {
    if (onApply) {
      onApply(targetId);
    } else if (onSelect) {
      onSelect(targetId);
    }
  };

  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl bg-white p-6 sm:p-7 transition-all hover:shadow-xl ${
        isHighlight
          ? 'border-2 border-blue-600 shadow-md shadow-blue-500/10'
          : 'border border-slate-200 shadow-xs'
      } ${className}`}
    >
      {/* Header & Badges */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase">
            {category}
          </span>

          {isHighlight && (
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-200 uppercase tracking-wider">
              {badge || 'PALING POPULER'}
            </span>
          )}
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h3>

        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          {displayTagline}
        </p>

        {/* Rate Box (Penpot Spec: #f8fafc bg, #e2e8f0 border) */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
          <div className="text-sm sm:text-base font-extrabold text-slate-900">
            {startingPrice}
          </div>
          <div className="text-[11px] font-bold text-emerald-600">
            {displayCoverage}
          </div>
        </div>

        {/* Features List with Checkmark */}
        <div className="mt-5 space-y-2.5">
          <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block">
            Fitur &amp; Manfaat Unggulan:
          </span>
          <ul className="space-y-2 text-xs text-slate-600">
            {features.map((feat, idx) => (
              <li key={`${id}-feat-${idx}`} className="flex items-start gap-2 leading-relaxed">
                <span className="text-slate-800 font-bold shrink-0">✓</span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Actions & Core API Integration */}
      <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
        {/* Two Buttons Side by Side */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            aria-label={`Simulasi premi untuk ${title}`}
            onClick={handleSimulation}
            className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors text-center cursor-pointer shadow-xs"
          >
            Simulasi Premi ↗
          </button>
          <button
            type="button"
            aria-label={`Daftar sekarang untuk ${title}`}
            onClick={handleApply}
            className="w-full py-2.5 px-3 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors text-center cursor-pointer shadow-xs shadow-blue-500/20"
          >
            Daftar Sekarang →
          </button>
        </div>

        {/* Footnote Core API Integration */}
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span className="font-mono truncate">
            Terintegrasi Core API: {endpointText}
          </span>
          {onDetails && (
            <button
              type="button"
              aria-label={`Lihat rincian manfaat dan riders untuk ${title}`}
              onClick={onDetails}
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline shrink-0 ml-2 cursor-pointer"
            >
              Rincian 🔍
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
