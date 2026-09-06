import React from 'react';
import { Badge } from '@/components/atoms/Badge';

export type PillarEvaluationStatus = 'PASSED' | 'FLAGGED' | 'PENDING';

export interface PillarStatusCardProps {
  pillarNumber: number;
  pillarTitle: string;
  description: string;
  status: PillarEvaluationStatus;
  statusText?: string;
  className?: string;
}

export const PillarStatusCard: React.FC<PillarStatusCardProps> = ({
  pillarNumber,
  pillarTitle,
  description,
  status,
  statusText,
  className = '',
}) => {
  const config = {
    PASSED: {
      cardBg: 'bg-emerald-50/50 border-emerald-200/90 text-emerald-900',
      badgeVariant: 'emerald' as const,
      statusLabel: statusText || '✓ PASSED (Automated)',
      statusTextColor: 'text-emerald-700 font-bold',
    },
    FLAGGED: {
      cardBg: 'bg-amber-50/50 border-amber-200/90 text-amber-900',
      badgeVariant: 'amber' as const,
      statusLabel: statusText || '⚠️ FLAGGED (Review)',
      statusTextColor: 'text-amber-700 font-bold',
    },
    PENDING: {
      cardBg: 'bg-slate-50/70 border-slate-200 text-slate-700',
      badgeVariant: 'slate' as const,
      statusLabel: statusText || '⏳ Menunggu Antrean',
      statusTextColor: 'text-slate-500 font-medium',
    },
  }[status];

  return (
    <div
      className={`p-5 rounded-2xl border transition-all text-left flex flex-col justify-between space-y-3 ${config.cardBg} ${className}`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant={config.badgeVariant} size="sm">
            PILAR 0{pillarNumber}
          </Badge>
          <span className="text-[11px] text-slate-400 font-mono font-semibold">Engine v2.4</span>
        </div>

        <h4 className="text-sm font-bold text-slate-900 tracking-tight">{pillarTitle}</h4>
        <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
      </div>

      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
        <span className={`text-xs ${config.statusTextColor}`}>{config.statusLabel}</span>
      </div>
    </div>
  );
};
