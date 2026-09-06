import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';

export interface ProductCardProps {
  id: string;
  category: string;
  title: string;
  description: string;
  startingPrice: string;
  coverageAmount: string;
  coverageTerm: string;
  badge?: string;
  badgeVariant?: 'emerald' | 'blue' | 'amber' | 'purple' | 'slate';
  features: string[];
  isPopular?: boolean;
  onSelect?: (productId: string) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  category,
  title,
  description,
  startingPrice,
  coverageAmount,
  coverageTerm,
  badge,
  badgeVariant = 'blue',
  features,
  isPopular = false,
  onSelect,
  className = '',
}) => {
  return (
    <Card
      variant={isPopular ? 'bordered' : 'default'}
      className={`relative flex flex-col justify-between hover:shadow-lg transition-all ${
        isPopular ? 'border-blue-500 shadow-md shadow-blue-500/10' : ''
      } ${className}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
          ⭐ Paling Diminati
        </div>
      )}

      <CardHeader>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
            {category}
          </span>
          {badge && (
            <Badge variant={badgeVariant} size="sm">
              {badge}
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pricing Summary Box */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-slate-500 font-medium">Mulai dari</span>
            <span className="text-base font-extrabold text-slate-900">{startingPrice}</span>
          </div>
          <div className="h-px bg-slate-200/60" />
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Uang Pertanggungan</span>
              <span className="font-bold text-slate-800">{coverageAmount}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Masa Polis</span>
              <span className="font-bold text-slate-800">{coverageTerm}</span>
            </div>
          </div>
        </div>

        {/* Benefits Checklist */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
            Keunggulan Utama:
          </span>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {features.map((feat, idx) => (
              <li key={`${id}-feat-${idx}`} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold shrink-0">✓</span>
                <span className="leading-snug">{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          size="md"
          variant={isPopular ? 'primary' : 'outline'}
          className="w-full font-semibold"
          onClick={() => onSelect?.(id)}
        >
          Pilih & Simulasi Premi →
        </Button>
      </CardFooter>
    </Card>
  );
};
