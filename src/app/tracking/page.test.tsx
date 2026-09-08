import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TrackingPage from './page';
import { TrackingWorkbench } from './TrackingWorkbench';
import { applicationService } from '@/server/di';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('TrackingPage & TrackingWorkbench', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Server Component TrackingPage with search bar when no query is provided', async () => {
    const Component = await TrackingPage({});
    render(Component);

    expect(
      screen.getByRole('heading', { level: 1, name: /Cek Status Polis & Dokumen RFI/i })
    ).toBeDefined();
    expect(screen.getByPlaceholderText(/Contoh: APP-2026-8821/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Lacak Status/i })).toBeDefined();
  });

  it('renders Server Component TrackingPage with preloaded application when query is in searchParams', async () => {
    const Component = await TrackingPage({ searchParams: { q: 'APP-2026-8821' } });
    render(Component);

    expect(screen.getByText(/ID: APP-2026-8821/i)).toBeDefined();
    expect(screen.getByText(/Term Life Guard Plus/i)).toBeDefined();
    expect(screen.getByText(/Polis Disetujui & Aktif/i)).toBeDefined();
  });

  it('displays validation error when searching with empty input', async () => {
    render(<TrackingWorkbench />);

    const searchBtn = screen.getByRole('button', { name: /Lacak Status/i });
    fireEvent.click(searchBtn);

    expect(screen.getByText(/Silakan masukkan nomor pengajuan atau NIK/i)).toBeDefined();
  });

  it('displays not found message when searching for non-existent application', async () => {
    render(<TrackingWorkbench />);

    const searchInput = screen.getByPlaceholderText(/Contoh: APP-2026-8821/i);
    fireEvent.change(searchInput, { target: { value: 'APP-NOTFOUND-999' } });

    const searchBtn = screen.getByRole('button', { name: /Lacak Status/i });
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(screen.getByText(/Data pengajuan tidak ditemukan/i)).toBeDefined();
    });
  });

  it('searches and displays application details via quick sample button', async () => {
    render(<TrackingWorkbench />);

    const sampleBtn = screen.getByRole('button', { name: /APP-2026-8821/i });
    fireEvent.click(sampleBtn);

    await waitFor(() => {
      expect(screen.getByText(/ID: APP-2026-8821/i)).toBeDefined();
      expect(screen.getAllByText(/Term Life Guard Plus/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Budi Santoso/i)).toBeDefined();
      expect(screen.getByText(/Siti Rahayu/i)).toBeDefined();
    });

    // Verify 4-pillar checks are rendered
    expect(screen.getByText(/Pemeriksaan 4-Pilar Underwriting OJK/i)).toBeDefined();
    expect(screen.getByText(/Identitas Dukcapil/i)).toBeDefined();
    expect(screen.getByText(/Finansial & Rasio DSR/i)).toBeDefined();
    expect(screen.getByText(/Skrining Medis & Gaya Hidup/i)).toBeDefined();
    expect(screen.getByText(/Legalitas & Beneficiary/i)).toBeDefined();

    // Verify timeline events
    expect(screen.getByText(/Timeline Riwayat Pemrosesan/i)).toBeDefined();
    expect(screen.getByText(/Polis Aktif & E-Certificate Terbit/i)).toBeDefined();
  });

  it('allows downloading e-policy certificate for approved application', async () => {
    render(<TrackingWorkbench />);

    const sampleBtn = screen.getByRole('button', { name: /APP-2026-8821/i });
    fireEvent.click(sampleBtn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Unduh Sertifikat E-Polis/i })).toBeDefined();
    });

    const downloadBtn = screen.getByRole('button', { name: /Unduh Sertifikat E-Polis/i });
    fireEvent.click(downloadBtn);

    await waitFor(() => {
      expect(screen.getByText(/Sertifikat E-Polis resmi berformat PDF/i)).toBeDefined();
    });
  });

  it('loads application with RFI requirement and submits additional RFI document', async () => {
    render(<TrackingWorkbench />);

    const rfiSampleBtn = screen.getByRole('button', { name: /APP-2026-3109/i });
    fireEvent.click(rfiSampleBtn);

    await waitFor(() => {
      expect(screen.getByText(/ID: APP-2026-3109/i)).toBeDefined();
      expect(screen.getAllByText(/Hospital Cash Plan/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Dokumen Tambahan Diperlukan \(RFI\)/i)).toBeDefined();
    });

    // Verify RFI form is displayed
    expect(screen.getByText(/Unggah Dokumen Tambahan \(RFI\)/i)).toBeDefined();

    // Try submitting without file
    const submitRfiBtn = screen.getByRole('button', { name: /Kirim Dokumen RFI/i }) as HTMLButtonElement;
    expect(submitRfiBtn.disabled).toBe(true);

    // Select file using file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).not.toBeNull();

    const mockFile = new File(['mock content'], 'surat-keterangan-sehat.pdf', {
      type: 'application/pdf',
    });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText('surat-keterangan-sehat.pdf')).toBeDefined();
    });

    // Now submit button should be enabled
    expect(submitRfiBtn.disabled).toBe(false);
    fireEvent.click(submitRfiBtn);


    await waitFor(() => {
      expect(screen.getByText(/Dokumen "surat-keterangan-sehat.pdf" berhasil diunggah/i)).toBeDefined();
      expect(screen.getByText(/Dokumen yang Telah Diunggah/i)).toBeDefined();
    });
  });

  it('handles service errors gracefully during search', async () => {
    vi.spyOn(applicationService, 'trackApplication').mockRejectedValueOnce(
      new Error('Database network timeout')
    );

    render(<TrackingWorkbench />);

    const searchInput = screen.getByPlaceholderText(/Contoh: APP-2026-8821/i);
    fireEvent.change(searchInput, { target: { value: 'APP-2026-8821' } });
    fireEvent.click(screen.getByRole('button', { name: /Lacak Status/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Terjadi kesalahan koneksi saat melacak pengajuan/i)
      ).toBeDefined();
    });
  });

  it('handles service errors gracefully during RFI submission', async () => {
    render(<TrackingWorkbench />);
    const sampleBtn = screen.getByRole('button', { name: /APP-2026-3109/i });
    fireEvent.click(sampleBtn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Kirim Dokumen RFI/i })).toBeDefined();
    });

    vi.spyOn(applicationService, 'submitRfiDocument').mockRejectedValueOnce(
      new Error('Koneksi unggah gagal')
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFile = new File(['doc'], 'sample.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    const submitBtn = screen.getByRole('button', { name: /Kirim Dokumen RFI/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Koneksi unggah gagal/i)).toBeDefined();
    });
  });
});



