import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ApplyPage from './page';
import { ApplicationWorkbench } from './ApplicationWorkbench';
import { productService } from '@/server/di';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('ApplyPage & ApplicationWorkbench', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    window.scrollTo = vi.fn();
  });

  it('renders Server Component ApplyPage with Step 1 (Identitas Dukcapil) as initial step', async () => {
    const Component = await ApplyPage({});
    render(Component);

    expect(
      screen.getByRole('heading', { level: 1, name: /Pendaftaran Polis Asuransi Digital/i })
    ).toBeDefined();

    expect(screen.getAllByText(/Pilar 01/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Nomor Induk Kependudukan/i)).toBeDefined();
  });

  it('blocks navigation to step 2 when Step 1 fields are empty or invalid', async () => {
    const products = await productService.getProducts();
    render(<ApplicationWorkbench initialProducts={products} />);

    const nextBtn = screen.getByRole('button', { name: /Lanjut ke Pilar 02/i });
    fireEvent.click(nextBtn);

    // Validation errors should appear
    expect(screen.getByText(/NIK e-KTP wajib diisi/i)).toBeDefined();
    expect(screen.getByText(/Nama lengkap minimal 3 karakter/i)).toBeDefined();
  });

  it('progresses through all 4 wizard steps and submits application successfully', async () => {
    const products = await productService.getProducts();
    render(
      <ApplicationWorkbench
        initialProducts={products}
        initialQuote={{
          productId: products[0].id,
          sumAssured: 500_000_000,
          termYears: 10,
          frequency: 'monthly',
          applicantAge: 28,
          isSmoker: false,
          selectedRiders: ['rider-ci'],
        }}
      />
    );

    // STEP 1: FILL IDENTITAS
    fireEvent.change(screen.getByLabelText(/Nomor Induk Kependudukan/i), {
      target: { value: '3201123456780001' },
    });
    fireEvent.change(screen.getByLabelText(/Nama Lengkap \(Sesuai KTP/i), {
      target: { value: 'Budi Santoso' },
    });
    fireEvent.change(screen.getByLabelText(/Nomor WhatsApp/i), {
      target: { value: '081234567890' },
    });
    fireEvent.change(screen.getByLabelText(/Alamat Email Korespondensi/i), {
      target: { value: 'budi@example.com' },
    });

    // Advance to Step 2
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Pilar 02/i }));

    // STEP 2: FINANSIAL & DSR
    expect(screen.getByText(/Profil Pekerjaan & Debt-to-Service Ratio/i)).toBeDefined();
    expect(screen.getByText(/Indikator Beban Finansial \(DSR\)/i)).toBeDefined();

    // Advance to Step 3
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Pilar 03/i }));

    // STEP 3: MEDIS & GAYA HIDUP
    expect(screen.getByText(/Indeks Massa Tubuh \(BMI\) & Kuesioner Medis/i)).toBeDefined();
    expect(screen.getByText(/Deklarasi Riwayat Kesehatan Calon Tertanggung/i)).toBeDefined();

    // Advance to Step 4
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Pilar 04/i }));

    // STEP 4: AHLI WARIS & LEGALITAS
    expect(screen.getByText(/Data Ahli Waris & Otorisasi e-Policy/i)).toBeDefined();

    // Fill Step 4
    fireEvent.change(screen.getByLabelText(/Nama Lengkap Ahli Waris Utama/i), {
      target: { value: 'Siti Rahayu' },
    });
    fireEvent.change(screen.getByLabelText(/Nomor KTP \/ NIK Ahli Waris/i), {
      target: { value: '3201123456780002' },
    });

    // Check agreements
    fireEvent.click(screen.getByLabelText(/Persetujuan Pemrosesan Data Pribadi/i));
    fireEvent.click(screen.getByLabelText(/Pernyataan Kebenaran Data Underwriting/i));

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Kirim Pengajuan Polis Digital/i });
    fireEvent.click(submitBtn);

    // Wait for Success Receipt Screen
    await waitFor(() => {
      expect(screen.getByText(/Pengajuan Polis Berhasil Dikirim!/i)).toBeDefined();
    });

    // Check Receipt Content
    expect(screen.getByText(/Hasil Verifikasi 4 Pilar Otomatis OJK/i)).toBeDefined();
    expect(screen.getByText(/Nomor Registrasi Aplikasi/i)).toBeDefined();
    expect(screen.getByText(/PILAR 01/i)).toBeDefined();
    expect(screen.getByText(/PILAR 02/i)).toBeDefined();
    expect(screen.getByText(/PILAR 03/i)).toBeDefined();
    expect(screen.getByText(/PILAR 04/i)).toBeDefined();

    // Click tracking button
    const trackingBtn = screen.getByRole('button', { name: /Lacak Status Polis di Tracking Portal/i });
    fireEvent.click(trackingBtn);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush.mock.calls[0][0]).toContain('/tracking?applicationId=APP-2026-');
  });

  it('allows user to navigate back to previous steps using the back button', async () => {
    const products = await productService.getProducts();
    render(<ApplicationWorkbench initialProducts={products} />);

    // Fill valid Step 1
    fireEvent.change(screen.getByLabelText(/Nomor Induk Kependudukan/i), {
      target: { value: '3201123456780001' },
    });
    fireEvent.change(screen.getByLabelText(/Nama Lengkap \(Sesuai KTP/i), {
      target: { value: 'Budi Santoso' },
    });
    fireEvent.change(screen.getByLabelText(/Nomor WhatsApp/i), {
      target: { value: '081234567890' },
    });
    fireEvent.change(screen.getByLabelText(/Alamat Email Korespondensi/i), {
      target: { value: 'budi@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Pilar 02/i }));
    expect(screen.getByText(/Profil Pekerjaan & Debt-to-Service Ratio/i)).toBeDefined();

    // Click Back to Step 1
    fireEvent.click(screen.getByRole('button', { name: /Kembali ke Pilar 01/i }));
    expect(screen.getByLabelText(/Nomor Induk Kependudukan/i)).toBeDefined();
  });

  it('resolves all searchParams correctly in Server Component ApplyPage', async () => {
    const Component = await ApplyPage({
      searchParams: Promise.resolve({
        productId: 'prod-critical-illness',
        sumAssured: '1000000000',
        termYears: '15',
        frequency: 'annually',
        age: '35',
        isSmoker: 'true',
        riders: 'rider-ci,rider-hospital',
      }),
    });
    render(Component);

    expect(screen.getByText(/Critical Illness Shield/i)).toBeDefined();
    expect(screen.getByText(/Tahunan/i)).toBeDefined();
  });

  it('validates step 2, step 3, and step 4 field requirements', async () => {
    const products = await productService.getProducts();
    render(<ApplicationWorkbench initialProducts={products} />);

    // Step 1: Valid identity
    fireEvent.change(screen.getByLabelText(/Nomor Induk Kependudukan/i), {
      target: { value: '3201123456780001' },
    });
    fireEvent.change(screen.getByLabelText(/Nama Lengkap \(Sesuai KTP/i), {
      target: { value: 'Budi Santoso' },
    });
    fireEvent.change(screen.getByLabelText(/Nomor WhatsApp/i), {
      target: { value: '081234567890' },
    });
    fireEvent.change(screen.getByLabelText(/Alamat Email Korespondensi/i), {
      target: { value: 'budi@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Jenis Kelamin/i), {
      target: { value: 'female' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Pilar 02/i }));

    // Step 2: Set monthlyIncome to 0 and attempt next
    fireEvent.change(screen.getByLabelText(/Penghasilan Bulanan Bersih/i), {
      target: { value: '0' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Pilar 03/i }));
    expect(screen.getByText(/Penghasilan bulanan wajib diisi/i)).toBeDefined();

    // Fix Step 2
    fireEvent.change(screen.getByLabelText(/Penghasilan Bulanan Bersih/i), {
      target: { value: '20000000' },
    });
    fireEvent.change(screen.getByLabelText(/Pekerjaan \/ Bidang Profesi/i), {
      target: { value: 'Profesional' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Pilar 03/i }));

    // Step 3: Set invalid height and weight
    fireEvent.change(screen.getByLabelText(/Tinggi Badan \(cm\)/i), {
      target: { value: '50' },
    });
    fireEvent.change(screen.getByLabelText(/Berat Badan \(kg\)/i), {
      target: { value: '10' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Pilar 04/i }));
    expect(screen.getByText(/Tinggi badan harus di antara/i)).toBeDefined();
    expect(screen.getByText(/Berat badan harus di antara/i)).toBeDefined();

    // Fix Step 3 & toggle medical checkboxes
    fireEvent.change(screen.getByLabelText(/Tinggi Badan \(cm\)/i), {
      target: { value: '175' },
    });
    fireEvent.change(screen.getByLabelText(/Berat Badan \(kg\)/i), {
      target: { value: '70' },
    });
    fireEvent.click(screen.getByLabelText(/Riwayat Penyakit Kritis/i));
    fireEvent.click(screen.getByLabelText(/Riwayat Rawat Inap/i));
    fireEvent.click(screen.getByLabelText(/Status Perokok Aktif/i));
    fireEvent.click(screen.getByLabelText(/Riwayat Herediter Penyakit/i));
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Pilar 04/i }));

    // Step 4: Attempt submit without filling beneficiary and agreements
    fireEvent.click(screen.getByRole('button', { name: /Kirim Pengajuan Polis Digital/i }));
    expect(screen.getByText(/Nama lengkap ahli waris wajib diisi/i)).toBeDefined();
    expect(screen.getByText(/Nomor KTP \/ NIK ahli waris wajib diisi/i)).toBeDefined();
    expect(screen.getByText(/Anda wajib menyetujui kebijakan privasi data/i)).toBeDefined();
    expect(screen.getByText(/Anda wajib menyetujui kebenaran data underwriting/i)).toBeDefined();

    // Change payment method and autodebet
    fireEvent.click(screen.getByRole('radio', { name: /Mandiri Virtual Account/i }));
    fireEvent.click(screen.getByLabelText(/Aktifkan Autodebet Otomatis/i));
  });

  it('handles empty products array gracefully', () => {
    render(<ApplicationWorkbench initialProducts={[]} />);
    expect(screen.getByText(/Memuat data pengajuan polis digital.../i)).toBeDefined();
  });
});
