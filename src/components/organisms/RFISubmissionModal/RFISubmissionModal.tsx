'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/atoms/Button';
import { FileUpload } from '@/components/atoms/FileUpload';
import { Badge } from '@/components/atoms/Badge';
import { Callout } from '@/components/molecules/Callout';

export interface RequestedDocument {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

export interface RFISubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId?: string;
  applicantName?: string;
  deadlineDate?: string;
  requestedDocs?: RequestedDocument[];
  onSubmitUploads?: (uploadedFiles: Record<string, File>) => void;
  className?: string;
}

export const RFISubmissionModal: React.FC<RFISubmissionModalProps> = ({
  isOpen,
  onClose,
  applicationId = 'APP-2026-8819',
  applicantName = 'Bayu Pratama',
  deadlineDate = '10 September 2026',
  requestedDocs = [
    {
      id: 'rekening-koran',
      name: 'Rekening Koran 3 Bulan Terakhir (Legalisir Bank)',
      description: 'Menampilkan riwayat transfer gaji masuk dari pemberi kerja untuk verifikasi rasio DSR.',
      required: true,
    },
    {
      id: 'ktp-hd',
      name: 'Foto Fisik e-KTP Resolusi Tinggi',
      description: 'Hasil pemindaian OCR sebelumnya terdeteksi buram atau memiliki pantulan cahaya.',
      required: true,
    },
  ],
  onSubmitUploads,
  className = '',
}) => {
  const [uploadedMap, setUploadedMap] = useState<Record<string, File>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsSubmitting(false);
    onClose();
  };

  const handleFileChange = (docId: string, file: File) => {
    setUploadedMap((prev) => ({
      ...prev,
      [docId]: file,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      onSubmitUploads?.(uploadedMap);
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  if (!isOpen) return null;

  const totalRequired = requestedDocs.filter((d) => d.required).length;
  const uploadedCount = Object.keys(uploadedMap).length;
  const canSubmit = uploadedCount >= totalRequired;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs ${className}`}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="amber" size="sm">Permintaan Dokumen (RFI)</Badge>
              <span className="text-xs text-slate-400 font-semibold">#{applicationId}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Unggah Dokumen Tambahan Underwriting</h3>
            <p className="text-xs text-slate-500">
              Halo <strong>{applicantName}</strong>, mohon unggah berkas berikut sebelum <strong>{deadlineDate}</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content / Upload List */}
        <div className="p-6 overflow-y-auto space-y-6">
          <Callout variant="warning" title="Batas Waktu Pengunggahan Berkas:">
            Pengajuan akan diproses kembali secara otomatis setelah seluruh dokumen terunggah.
            Keterlambatan unggah melebihi batas waktu dapat menyebabkan pengajuan kedaluwarsa sesuai SLA OJK.
          </Callout>

          <div className="space-y-4">
            {requestedDocs.map((doc) => {
              const isUploaded = Boolean(uploadedMap[doc.id]);
              return (
                <div key={doc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{doc.name}</span>
                        {doc.required && (
                          <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                            Wajib
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{doc.description}</p>
                    </div>

                    {isUploaded && (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                        ✓ Terunggah
                      </span>
                    )}
                  </div>

                  <FileUpload
                    onFileSelect={(f) => handleFileChange(doc.id, f)}
                    helperText="Tarik berkas PDF atau JPG hasil scan yang jelas (Maksimal 10MB)"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-medium">
            {uploadedCount} dari {totalRequired} dokumen wajib terpilih
          </span>

          <div className="flex items-center gap-3">
            <Button size="md" variant="outline" type="button" onClick={handleClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button
              size="md"
              variant="primary"
              disabled={!canSubmit || isSubmitting}
              onClick={handleSubmit}
              className="bg-amber-600 hover:bg-amber-700 shadow-sm"
            >
              {isSubmitting ? 'Mengirim Berkas...' : 'Kirim Berkas Verifikasi 📤'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
