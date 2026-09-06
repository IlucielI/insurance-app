import React, { useRef, useState } from 'react';

export interface FileUploadProps {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  accept?: string;
  maxSizeMb?: number;
  onFileSelect?: (file: File) => void;
  disabled?: boolean;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  helperText = 'Format JPG, PNG, atau PDF (Maksimal 10MB)',
  errorMessage,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSizeMb = 10,
  onFileSelect,
  disabled = false,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > maxSizeMb * 1024 * 1024) {
      setLocalError(`Ukuran berkas melebihi batas ${maxSizeMb}MB.`);
      return;
    }

    setLocalError(null);
    setSelectedFileName(file.name);
    onFileSelect?.(file);
  };

  const error = errorMessage || localError;

  return (
    <div className={`w-full space-y-1.5 text-left ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 select-none">
          {label}
        </label>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
            : isDragging
            ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
            : error
            ? 'border-rose-300 bg-rose-50/20 hover:bg-rose-50/40'
            : selectedFileName
            ? 'border-emerald-400 bg-emerald-50/30'
            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/60'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
              selectedFileName
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-blue-50 text-blue-600'
            }`}
          >
            {selectedFileName ? '📄' : '📤'}
          </div>

          <div>
            {selectedFileName ? (
              <p className="text-xs font-semibold text-emerald-700 truncate max-w-xs">
                {selectedFileName}
              </p>
            ) : (
              <p className="text-xs font-semibold text-slate-700">
                Klik atau tarik berkas ke area ini
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
          </div>
        </div>
      </div>

      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
    </div>
  );
};
