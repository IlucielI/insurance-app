import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';

export interface PolicyCardProps {
  policyNumber: string;
  applicationId: string;
  insuredName: string;
  productName: string;
  sumAssured: string;
  premiumText: string;
  status?: 'ACTIVE' | 'PENDING' | 'EXPIRED';
  issuedDate?: string;
  onDownloadPolicy?: () => void;
  onViewSchedule?: () => void;
  className?: string;
}

export const PolicyCard: React.FC<PolicyCardProps> = ({
  policyNumber,
  applicationId,
  insuredName,
  productName,
  sumAssured,
  premiumText,
  status = 'ACTIVE',
  issuedDate = '06 September 2026',
  onDownloadPolicy,
  onViewSchedule,
  className = '',
}) => {
  return (
    <Card variant="bordered" className={`border-slate-800 bg-slate-900 text-white text-left ${className}`}>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <Badge variant="emerald" size="sm">
              ● STATUS: {status}
            </Badge>
            <span className="text-[11px] text-slate-400 font-mono font-semibold">
              App: #{applicationId}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Terbit: {issuedDate}</span>
        </div>

        <CardTitle className="text-xl text-white font-extrabold">{productName}</CardTitle>
        <CardDescription className="text-slate-400 text-xs">
          Nomor Polis: <span className="font-mono text-white font-bold">{policyNumber}</span> • Tertanggung: <strong className="text-white">{insuredName}</strong>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Uang Pertanggungan (UP)
            </span>
            <span className="text-lg font-extrabold text-white mt-0.5 block">{sumAssured}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Premi Terdaftar
            </span>
            <span className="text-lg font-extrabold text-sky-400 mt-0.5 block">{premiumText}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-slate-800 flex flex-col sm:flex-row gap-3">
        <Button
          size="md"
          variant="primary"
          onClick={onDownloadPolicy}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 font-semibold"
        >
          📄 Unduh E-Polis Resmi (PDF)
        </Button>
        <Button
          size="md"
          variant="outline"
          onClick={onViewSchedule}
          className="w-full sm:w-auto bg-transparent border-slate-700 text-slate-200 hover:bg-slate-800"
        >
          💳 Jadwal Pembayaran Premi
        </Button>
      </CardFooter>
    </Card>
  );
};
