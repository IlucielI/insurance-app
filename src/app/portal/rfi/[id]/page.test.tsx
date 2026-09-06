import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RFIPortalPage from './page';
import { RFIPortalWorkbench } from './RFIPortalWorkbench';
import { applicationService } from '@/server/di';
import { PolicyApplication } from '@/types/application.types';

const createMockApplication = (overrides?: Partial<PolicyApplication>): PolicyApplication => ({
  id: 'APP-2026-8819',
  productId: 'prod-secure-life-plus',
  productName: 'Secure Life Plus',
  sumAssured: 1_000_000_000,
  termYears: 20,
  monthlyPremium: 350_000,
  annualPremium: 3_850_000,
  frequency: 'monthly',
  selectedRiderIds: ['rider-ci', 'rider-waiver'],
  identity: {
    nik: '3273011205920003',
    fullName: 'Bayu Pratama',
    birthDate: '1992-05-12',
    gender: 'male',
    phoneNumber: '081234567899',
    email: 'bayu.pratama@example.com',
  },
  financial: {
    occupation: 'Product Manager & Business Owner',
    monthlyIncome: 35_000_000,
    monthlyExpenses: 12_000_000,
    existingDebtsMonthly: 5_000_000,
    calculatedDsr: 14.3,
  },
  medical: {
    weightKg: 72,
    heightCm: 176,
    bmi: 23.2,
    hasCriticalIllnessHistory: false,
    hasHospitalizationLast2Years: false,
    isSmoker: false,
    hasFamilyHistory: false,
  },
  beneficiary: {
    fullName: 'Dian Sastro',
    relationship: 'spouse',
    nik: '3273011205920004',
    sharePercentage: 100,
  },
  payment: {
    method: 'va_bca',
    autoDebet: true,
  },
  pillarChecks: [
    {
      pillarNumber: 1,
      pillarType: 'identity_verified',
      title: 'Identitas Dukcapil',
      description: 'Foto fisik e-KTP buram dan sudut terpotong saat proses pendaftaran.',
      status: 'FLAGGED',
      statusText: '⚠️ Unggah Ulang e-KTP (Resolusi Tinggi)',
    },
    {
      pillarNumber: 2,
      pillarType: 'income_verified',
      title: 'Finansial & Rasio DSR',
      description: 'Verifikasi slip gaji 3 bulan terakhir untuk mendukung kapasitas pengajuan premi.',
      status: 'FLAGGED',
      statusText: '⚠️ Diperlukan Slip Gaji 3 Bulan Terakhir',
    },
  ],
  overallStatus: 'rfi_requested',
  underwritingTier: 'full_underwriting',
  slaRemainingMinutes: 3720,
  createdAt: '2026-09-07T01:30:00.000Z',
  underwriterNotes:
    'Mohon bantuannya untuk mengunggah ulang foto e-KTP Anda dengan pencahayaan yang jelas dan seluruh sudut kartu terlihat, serta melampirkan file slip gaji 3 bulan terakhir untuk mendukung kapasitas keuangan pengajuan premi tahunan Anda.',
  rfiDeadline: '2026-09-09T23:59:00.000Z',
  ...overrides,
});

describe('RFIPortalPage & RFIPortalWorkbench (Flow RFI Tahap 2 & 3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Server Component RFIPortalPage with APP-2026-8819 in Tahap 2 (Upload Stage)', async () => {
    const Component = await RFIPortalPage({ params: { id: 'APP-2026-8819' } });
    render(Component);

    // Header & SSL Security Badge
    expect(screen.getByText(/Portal Unggah Aman Dokumen Nasabah/i)).toBeDefined();
    expect(screen.getByText(/Enkripsi End-to-End SSL 256-bit/i)).toBeDefined();

    // Status Banner & SLA
    expect(screen.getByText(/STATUS: MENUNGGU BERKAS TAMBAHAN/i)).toBeDefined();
    expect(screen.getByText(/Sisa Waktu: 2 Hari 14 Jam/i)).toBeDefined();

    // Application details
    expect(screen.getByText(/#APP-2026-8819/i)).toBeDefined();
    expect(screen.getByText(/Secure Life Plus/i)).toBeDefined();
    expect(screen.getByText(/Bayu Pratama/i)).toBeDefined();

    // Catatan Underwriter
    expect(screen.getByText(/Catatan dari Tim Underwriter:/i)).toBeDefined();
    expect(
      screen.getByText(/Mohon bantuannya untuk mengunggah ulang foto e-KTP/i)
    ).toBeDefined();

    // Dual Upload Slots
    expect(screen.getByText(/1\. FOTO FISIK E-KTP/i)).toBeDefined();
    expect(screen.getByText(/2\. SLIP GAJI 3 BULAN \/ REKENING KORAN/i)).toBeDefined();

    // Legal Agreement & Submit Button
    expect(screen.getByLabelText(/Saya menyatakan dengan sesungguhnya/i)).toBeDefined();
    const submitBtn = screen.getByRole('button', {
      name: /Kirim Dokumen Tambahan ke Tim Underwriter/i,
    });
    expect(submitBtn).toBeDefined();
    expect(submitBtn.hasAttribute('disabled')).toBe(true);
  });

  it('renders not found state if application id does not exist', async () => {
    const Component = await RFIPortalPage({ params: { id: 'APP-UNKNOWN-999' } });
    render(Component);

    expect(screen.getByText(/Aplikasi Tidak Ditemukan/i)).toBeDefined();
    expect(screen.getByText(/APP-UNKNOWN-999/i)).toBeDefined();
  });

  it('enables submit button only when file is selected and agreement is checked', async () => {
    const app = createMockApplication();
    render(<RFIPortalWorkbench initialApplication={app} applicationId={app.id} />);

    const submitBtn = screen.getByRole('button', {
      name: /Kirim Dokumen Tambahan ke Tim Underwriter/i,
    });
    const agreementCheckbox = screen.getByLabelText(/Saya menyatakan dengan sesungguhnya/i);

    expect(submitBtn.hasAttribute('disabled')).toBe(true);

    // Mock file input selection
    const fileInputs = document.querySelectorAll<HTMLInputElement>('input[type="file"]');
    expect(fileInputs.length).toBeGreaterThanOrEqual(2);
    const fakeKtpFile = new File(['fake ktp'], 'ktp-bayu-hd.png', { type: 'image/png' });

    fireEvent.change(fileInputs[0], { target: { files: [fakeKtpFile] } });

    // File selected, but checkbox still unchecked
    expect(screen.getAllByText(/ktp-bayu-hd\.png/i).length).toBeGreaterThanOrEqual(1);
    expect(submitBtn.hasAttribute('disabled')).toBe(true);

    // Now check agreement checkbox
    fireEvent.click(agreementCheckbox);

    // Button should now be enabled
    expect(submitBtn.hasAttribute('disabled')).toBe(false);
  });

  it('submits RFI documents and transitions to Tahap 3 (Success State) with 4-stage stepper', async () => {
    const app = createMockApplication();
    render(<RFIPortalWorkbench initialApplication={app} applicationId={app.id} />);

    const fileInputs = document.querySelectorAll<HTMLInputElement>('input[type="file"]');
    expect(fileInputs.length).toBeGreaterThanOrEqual(2);

    const fakeKtpFile = new File(['fake ktp content'], 'ktp-bayu-clear.png', {
      type: 'image/png',
    });
    const fakeSalaryFile = new File(['fake salary content'], 'slip-gaji-3bulan.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(fileInputs[0], { target: { files: [fakeKtpFile] } });
    fireEvent.change(fileInputs[1], { target: { files: [fakeSalaryFile] } });

    const agreementCheckbox = screen.getByLabelText(/Saya menyatakan dengan sesungguhnya/i);
    fireEvent.click(agreementCheckbox);

    const submitBtn = screen.getByRole('button', {
      name: /Kirim Dokumen Tambahan ke Tim Underwriter/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      // Tahap 3 elements
      expect(screen.getByTestId('rfi-stage-3-success')).toBeDefined();
      expect(screen.getByText(/Dokumen Berhasil Diterima!/i)).toBeDefined();
      expect(
        screen.getByText(/Dokumen tambahan Anda telah berhasil diunggah/i)
      ).toBeDefined();
    });

    // Verify 4-Stage Stepper
    expect(screen.getByText(/Status Pengajuan Terbaru:/i)).toBeDefined();
    expect(screen.getByText(/Pengajuan Awal/i)).toBeDefined();
    expect(screen.getByText(/Pengunggahan Dokumen/i)).toBeDefined();
    expect(screen.getByText(/Peninjauan Underwriter/i)).toBeDefined();
    expect(screen.getByText(/Penerbitan E-Polis/i)).toBeDefined();

    // Verify CMS Queue Real-time sync callout
    expect(
      screen.getByText(/Sinkronisasi Otomatis ke CMS 02 Underwriting Queue:/i)
    ).toBeDefined();
    expect(screen.getAllByText(/DOCUMENTS_RECEIVED/i).length).toBeGreaterThanOrEqual(1);

    // Verify Action Buttons
    expect(
      screen.getByRole('button', { name: /Kembali ke Beranda Aplikasi Nasabah/i })
    ).toBeDefined();
    expect(
      screen.getByRole('button', { name: /Pantau di Portal Lacak Aplikasi/i })
    ).toBeDefined();
  });

  it('handles submission error gracefully', async () => {
    vi.spyOn(applicationService, 'submitRfiDocument').mockRejectedValueOnce(
      new Error('Simulated network error during RFI document upload')
    );

    const app = createMockApplication();
    render(<RFIPortalWorkbench initialApplication={app} applicationId={app.id} />);

    const fileInputs = document.querySelectorAll<HTMLInputElement>('input[type="file"]');
    expect(fileInputs.length).toBeGreaterThanOrEqual(2);
    const fakeKtpFile = new File(['fake ktp content'], 'ktp-bayu.png', { type: 'image/png' });

    fireEvent.change(fileInputs[0], { target: { files: [fakeKtpFile] } });

    const agreementCheckbox = screen.getByLabelText(/Saya menyatakan dengan sesungguhnya/i);
    fireEvent.click(agreementCheckbox);

    const submitBtn = screen.getByRole('button', {
      name: /Kirim Dokumen Tambahan ke Tim Underwriter/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Simulated network error during RFI document upload/i)
      ).toBeDefined();
    });
  });
});
