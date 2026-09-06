import React from 'react';
import { Badge } from '@/components/atoms/Badge';

export type ApplicationStatus =
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'ACTION_REQUIRED'
  | 'APPROVED'
  | 'REJECTED';

export interface StatusPillProps {
  status: ApplicationStatus;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, className = '' }) => {
  const configMap: Record<
    ApplicationStatus,
    { label: string; variant: 'slate' | 'blue' | 'emerald' | 'amber' | 'rose' }
  > = {
    DRAFT: { label: 'Draft Pengajuan', variant: 'slate' },
    UNDER_REVIEW: { label: 'Evaluasi Underwriting', variant: 'blue' },
    ACTION_REQUIRED: { label: 'Perlu Unggah Dokumen (RFI)', variant: 'amber' },
    APPROVED: { label: 'Polis Terbit Aktif', variant: 'emerald' },
    REJECTED: { label: 'Pengajuan Ditolak', variant: 'rose' },
  };

  const config = configMap[status] || { label: status, variant: 'slate' };

  return (
    <Badge variant={config.variant} size="md" className={className}>
      {config.label}
    </Badge>
  );
};
