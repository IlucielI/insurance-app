import React from 'react';
import { Badge } from '@/components/atoms/Badge';

export interface DocumentUploadItemProps {
  id: string;
  name: string;
  sizeMb: number;
  uploadedAt: string;
  status?: 'verified' | 'pending' | 'rejected';
  statusLabel?: string;
  onRemove?: (id: string) => void;
  className?: string;
}

export const DocumentUploadItem: React.FC<DocumentUploadItemProps> = ({
  id,
  name,
  sizeMb,
  uploadedAt,
  status = 'verified',
  statusLabel,
  onRemove,
  className = '',
}) => {
  const statusConfig = {
    verified: {
      variant: 'emerald' as const,
      label: statusLabel || 'Terverifikasi OCR',
      icon: '✅',
    },
    pending: {
      variant: 'amber' as const,
      label: statusLabel || 'Sedang Dipindai',
      icon: '⏳',
    },
    rejected: {
      variant: 'rose' as const,
      label: statusLabel || 'Dokumen Tidak Jelas',
      icon: '❌',
    },
  }[status];

  return (
    <div
      className={`flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs text-left gap-3 ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-lg shrink-0">
          📄
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-900 truncate">{name}</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
            <span>{sizeMb.toFixed(1)} MB</span>
            <span>•</span>
            <span>{uploadedAt}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <Badge variant={statusConfig.variant} size="sm">
          {statusConfig.icon} {statusConfig.label}
        </Badge>
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Hapus berkas"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
};
