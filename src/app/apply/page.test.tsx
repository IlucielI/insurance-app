import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ApplyPage from './page';
import { ApplicationWorkbench } from './ApplicationWorkbench';
import { productService } from '@/server/di';
import { InsuranceProduct } from '@/server/repositories/product.repository.interface';

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

  afterEach(() => {
    cleanup();
  });

  it('renders Server Component ApplyPage with Step 1 (Identitas KTP) as initial step', async () => {
    const Component = await ApplyPage({});
    render(Component);

    expect(
      screen.getByRole('heading', { level: 1, name: /Pengajuan Aplikasi Polis Digital/i })
    ).toBeDefined();

    expect(screen.getAllByText(/01\. Identitas KTP/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Nomor Induk Kependudukan/i)).toBeDefined();
    expect(screen.getByText(/✓ Terverifikasi Dukcapil Online/i)).toBeDefined();
  });

  it('blocks navigation to step 2 when Step 1 fields are empty or invalid', async () => {
    const products = await productService.getProducts();
    render(<ApplicationWorkbench initialProducts={products} />);

    // Clear NIK & Name to trigger validation
    const nikInput = screen.getByLabelText(/Nomor Induk Kependudukan/i);
    fireEvent.change(nikInput, { target: { value: '' } });

    const nameInput = screen.getByLabelText(/Nama Lengkap \(Sesuai KTP/i);
    fireEvent.change(nameInput, { target: { value: '' } });

    const nextBtn = screen.getByRole('button', { name: /Lanjut ke Step 2: Finansial & Kerja →/i });
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
          frequency: 'annually',
          applicantAge: 32,
          isSmoker: false,
          selectedRiders: ['rider-ci'],
        }}
      />
    );

    // STEP 1: IDENTITAS KTP
    fireEvent.change(screen.getByLabelText(/Nomor Induk Kependudukan/i), {
      target: { value: '3174051208940003' },
    });
    fireEvent.change(screen.getByLabelText(/Nama Lengkap \(Sesuai KTP/i), {
      target: { value: 'Bayu Pratama Kusuma' },
    });
    fireEvent.change(screen.getByLabelText(/Nomor Handphone \(Aktif\):/i), {
      target: { value: '+62 812-3456-7890' },
    });
    fireEvent.change(screen.getByLabelText(/Alamat Email Terdaftar:/i), {
      target: { value: 'bayu.pratama@email.com' },
    });

    // Advance to Step 2
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Step 2: Finansial & Kerja →/i }));

    // STEP 2: FINANSIAL & KERJA
    expect(screen.getByText(/Pilar 2: Profil Pekerjaan & Kapasitas Finansial/i)).toBeDefined();
    expect(screen.getByText(/Analisis Rasio Beban Premi/i)).toBeDefined();

    // Advance to Step 3
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Step 3: Skrining Medis →/i }));

    // STEP 3: MEDIS & GAYA HIDUP
    expect(screen.getByText(/Pilar 3: Skrining Medis & Deklarasi Kesehatan Mandiri/i)).toBeDefined();
    expect(screen.getAllByText(/Indeks Massa Tubuh \(BMI\)/i).length).toBeGreaterThanOrEqual(1);

    // Advance to Step 4
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Step 4: Review & Polis →/i }));

    // STEP 4: REVIEW & POLIS
    expect(screen.getByText(/Pilar 4: Review & Persetujuan Polis/i)).toBeDefined();
    expect(screen.getByText(/Penerima Manfaat Utama \(Ahli Waris Polis\):/i)).toBeDefined();

    // Fill Ahli Waris fields
    fireEvent.change(screen.getByLabelText(/Nama Lengkap Ahli Waris:/i), {
      target: { value: 'Ratna Dewi Kusuma' },
    });
    fireEvent.change(screen.getByLabelText(/NIK Ahli Waris \(16 Digit\):/i), {
      target: { value: '3174055609950002' },
    });

    // Check legal statements
    fireEvent.click(screen.getByLabelText(/Pernyataan Kebenaran Data Underwriting/i));
    fireEvent.click(screen.getByLabelText(/Persetujuan Klausul Polis & Izin Autodebet/i));

    // Submit form
    const submitBtn = screen.getByRole('button', {
      name: /Kirim Pengajuan & Terbitkan Polis Instan/i,
    });
    fireEvent.click(submitBtn);

    // Wait for Success Screen
    await waitFor(() => {
      expect(screen.getByText(/Selamat! Polis Elektronik Anda Siap Diterbitkan/i)).toBeDefined();
    });

    // Check Receipt Content
    expect(screen.getByText(/Nomor Referensi Aplikasi/i)).toBeDefined();
    expect(screen.getByText(/APPROVED & ACTIVE/i)).toBeDefined();

    // Check Kembali ke Beranda button/link
    const homeLink = screen.getByRole('link', { name: /Kembali ke Beranda/i });
    expect(homeLink).toBeDefined();
    expect(homeLink.getAttribute('href')).toBe('/');
  });

  it('allows user to navigate back to previous steps using the back button', async () => {
    const products = await productService.getProducts();
    render(<ApplicationWorkbench initialProducts={products} />);

    // Advance to Step 2
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Step 2: Finansial & Kerja →/i }));
    expect(screen.getByText(/Pilar 2: Profil Pekerjaan & Kapasitas Finansial/i)).toBeDefined();

    // Click Back to Step 1
    fireEvent.click(screen.getByRole('button', { name: /Kembali ke Step 1/i }));
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
        gender: 'female',
        isSmoker: 'true',
        occupationRisk: 'high',
        riders: 'rider-ci,rider-hospital',
      }),
    });
    render(Component);

    expect(screen.getAllByText(/Critical Illness Shield/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Tahunan/i).length).toBeGreaterThan(0);
  });

  it('validates step 2, step 3, and step 4 field requirements', async () => {
    const products = await productService.getProducts();
    render(<ApplicationWorkbench initialProducts={products} />);

    // Step 1: Valid initial identity -> Go to Step 2
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Step 2: Finansial & Kerja →/i }));

    // Step 2: Clear company name and attempt next
    fireEvent.change(screen.getByLabelText(/Nama Perusahaan \/ Institusi:/i), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Step 3: Skrining Medis →/i }));
    expect(screen.getByText(/Nama institusi\/perusahaan wajib diisi/i)).toBeDefined();

    // Fix Step 2
    fireEvent.change(screen.getByLabelText(/Nama Perusahaan \/ Institusi:/i), {
      target: { value: 'PT Teknologi Solusi Bangsa' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Step 3: Skrining Medis →/i }));

    // Step 3: Set invalid height and weight
    fireEvent.change(screen.getByLabelText(/Tinggi Badan \(cm\):/i), {
      target: { value: '50' },
    });
    fireEvent.change(screen.getByLabelText(/Berat Badan \(kg\):/i), {
      target: { value: '10' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Step 4: Review & Polis →/i }));
    expect(screen.getByText(/Tinggi badan harus antara 100 cm s\/d 250 cm/i)).toBeDefined();
    expect(screen.getByText(/Berat badan harus antara 30 kg s\/d 200 kg/i)).toBeDefined();

    // Fix Step 3
    fireEvent.change(screen.getByLabelText(/Tinggi Badan \(cm\):/i), {
      target: { value: '175' },
    });
    fireEvent.change(screen.getByLabelText(/Berat Badan \(kg\):/i), {
      target: { value: '68' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Step 4: Review & Polis →/i }));

    // Step 4: Clear beneficiary name and attempt submit
    fireEvent.change(screen.getByLabelText(/Nama Lengkap Ahli Waris:/i), {
      target: { value: '' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: /Kirim Pengajuan & Terbitkan Polis Instan/i })
    );
    expect(screen.getByText(/Nama lengkap ahli waris wajib diisi/i)).toBeDefined();
    expect(screen.getByText(/Pernyataan kebenaran data wajib disetujui/i)).toBeDefined();
    expect(screen.getByText(/Persetujuan ketentuan polis wajib dicentang/i)).toBeDefined();
  });

  it('handles empty products array gracefully', () => {
    render(<ApplicationWorkbench initialProducts={[]} />);
    expect(screen.getByText(/Memuat data pendaftaran polis asuransi.../i)).toBeDefined();
  });

  it('passes comprehensive 4-pillar questionnaire answers to submitAction', async () => {
    const products = await productService.getProducts();
    const mockSubmitAction = vi.fn().mockResolvedValue({
      applicationId: 'APP-TEST-999',
      isInstantApproval: true,
      message: 'Success',
      application: {
        id: 'APP-TEST-999',
        productId: products[0].id,
        productName: products[0].title,
        sumAssured: 500_000_000,
        termYears: 10,
        monthlyPremium: 450_000,
        annualPremium: 5_000_000,
        frequency: 'annually',
        selectedRiderIds: [],
        identity: {
          nik: '3174051208940003',
          fullName: 'Bayu Pratama Kusuma',
          birthDate: '1992-05-12',
          gender: 'male',
          phoneNumber: '+62 812-3456-7890',
          email: 'bayu.pratama@email.com',
        },
        financial: {
          occupation: 'Lead Architect',
          monthlyIncome: 25_000_000,
          monthlyExpenses: 10_000_000,
          existingDebtsMonthly: 2_500_000,
          calculatedDsr: 12.0,
        },
        medical: {
          heightCm: 175,
          weightKg: 68,
          bmi: 22.2,
          isSmoker: false,
          hasCriticalIllnessHistory: false,
          hasHospitalizationLast2Years: false,
          hasFamilyHistory: false,
        },
        beneficiary: {
          fullName: 'Ratna Dewi Kusuma',
          relationship: 'spouse',
          nik: '3174055609950002',
          sharePercentage: 100,
        },
        pillarChecks: [],
        overallStatus: 'approved',
        underwritingTier: 'guaranteed_issue',
        slaRemainingMinutes: 0,
        createdAt: new Date().toISOString(),
      },
    });

    render(
      <ApplicationWorkbench
        initialProducts={products}
        initialQuote={{
          productId: products[0].id,
          sumAssured: 500_000_000,
          termYears: 10,
          frequency: 'annually',
          applicantAge: 32,
          occupationRisk: 'standard',
        }}
        submitAction={mockSubmitAction}
      />
    );

    // Step 1: Identity
    fireEvent.change(screen.getByLabelText(/Nomor Induk Kependudukan/i), {
      target: { value: '3174051208940003' },
    });
    fireEvent.change(screen.getByLabelText(/Nama Lengkap \(Sesuai KTP/i), {
      target: { value: 'Bayu Pratama Kusuma' },
    });
    fireEvent.change(screen.getByLabelText(/Nomor Handphone \(Aktif\):/i), {
      target: { value: '+62 812-3456-7890' },
    });
    fireEvent.change(screen.getByLabelText(/Alamat Email Terdaftar:/i), {
      target: { value: 'bayu.pratama@email.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Step 2: Finansial & Kerja →/i }));

    // Step 2: Financial
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Step 3: Skrining Medis →/i }));

    // Step 3: Medical
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Step 4: Review & Polis →/i }));

    // Step 4: Beneficiary & Agreements
    fireEvent.change(screen.getByLabelText(/Nama Lengkap Ahli Waris:/i), {
      target: { value: 'Ratna Dewi Kusuma' },
    });
    fireEvent.change(screen.getByLabelText(/NIK Ahli Waris \(16 Digit\):/i), {
      target: { value: '3174055609950002' },
    });
    fireEvent.click(screen.getByLabelText(/Pernyataan Kebenaran Data Underwriting/i));
    fireEvent.click(screen.getByLabelText(/Persetujuan Klausul Polis & Izin Autodebet/i));

    // Submit
    fireEvent.click(
      screen.getByRole('button', { name: /Kirim Pengajuan & Terbitkan Polis Instan/i })
    );

    await waitFor(() => {
      expect(mockSubmitAction).toHaveBeenCalledTimes(1);
    });

    const submittedPayload = mockSubmitAction.mock.calls[0][0];
    const answerCodes = submittedPayload.answers.map((a: { code: string }) => a.code);

    // Verify key 4-pillar questionnaire fields are in answers
    expect(answerCodes).toContain('nik');
    expect(answerCodes).toContain('full_name');
    expect(answerCodes).toContain('occupation');
    expect(answerCodes).toContain('occupation_class');
    expect(answerCodes).toContain('monthly_income');
    expect(answerCodes).toContain('monthly_expenses');
    expect(answerCodes).toContain('existing_debts_monthly');
    expect(answerCodes).toContain('weight_kg');
    expect(answerCodes).toContain('height_cm');
    expect(answerCodes).toContain('is_smoker');
    expect(answerCodes).toContain('has_critical_illness');
    expect(answerCodes).toContain('has_hospitalization_2y');
    expect(answerCodes).toContain('beneficiary_name');
    expect(answerCodes).toContain('beneficiary_nik');
    expect(answerCodes).toContain('agree_truth_declaration');
    expect(answerCodes).toContain('agree_policy_terms');
  });

  it('displays specific error message when submission fails', async () => {
    const products = await productService.getProducts();
    const failingSubmitAction = vi
      .fn()
      .mockRejectedValue(new Error('Koneksi ke sistem Core API underwriting gagal terhubung.'));

    render(
      <ApplicationWorkbench
        initialProducts={products}
        submitAction={failingSubmitAction}
      />
    );

    // Step 1: Valid identity
    fireEvent.change(screen.getByLabelText(/Nomor Induk Kependudukan/i), {
      target: { value: '3174051208940003' },
    });
    fireEvent.change(screen.getByLabelText(/Nama Lengkap \(Sesuai KTP/i), {
      target: { value: 'Bayu Pratama Kusuma' },
    });
    fireEvent.change(screen.getByLabelText(/Nomor Handphone \(Aktif\):/i), {
      target: { value: '+62 812-3456-7890' },
    });
    fireEvent.change(screen.getByLabelText(/Alamat Email Terdaftar:/i), {
      target: { value: 'bayu.pratama@email.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Step 2: Finansial & Kerja →/i }));

    // Step 2 -> Step 3 -> Step 4
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Step 3: Skrining Medis →/i }));
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Step 4: Review & Polis →/i }));

    // Fill Step 4
    fireEvent.change(screen.getByLabelText(/Nama Lengkap Ahli Waris:/i), {
      target: { value: 'Ratna Dewi Kusuma' },
    });
    fireEvent.change(screen.getByLabelText(/NIK Ahli Waris \(16 Digit\):/i), {
      target: { value: '3174055609950002' },
    });
    fireEvent.click(screen.getByLabelText(/Pernyataan Kebenaran Data Underwriting/i));
    fireEvent.click(screen.getByLabelText(/Persetujuan Klausul Polis & Izin Autodebet/i));

    fireEvent.click(
      screen.getByRole('button', { name: /Kirim Pengajuan & Terbitkan Polis Instan/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Koneksi ke sistem Core API underwriting gagal terhubung/i)
      ).toBeDefined();
    });
  });

  it('renders Step 1 gender toggle and Step 4 preview cards with policy configuration, beneficiary, and payment method preferences matching Penpot', async () => {
    const products = await productService.getProducts();
    render(<ApplicationWorkbench initialProducts={products} />);

    // Step 1: Check gender buttons
    const maleBtn = screen.getByRole('button', { name: /Pria \(Laki-laki\)/i });
    const femaleBtn = screen.getByRole('button', { name: /Wanita \(Perempuan\)/i });
    expect(maleBtn).toBeDefined();
    expect(femaleBtn).toBeDefined();
    fireEvent.click(femaleBtn);
    expect(femaleBtn.getAttribute('aria-pressed')).toBe('true');

    // Proceed through steps to Step 4
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Step 2: Finansial & Kerja →/i }));
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Step 3: Skrining Medis →/i }));
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Step 4: Review & Polis →/i }));

    // Verify 3 Top Preview/Snapshot cards
    expect(screen.getByText(/Identitas Pemohon/i)).toBeDefined();
    expect(screen.getByText(/Kapasitas Finansial/i)).toBeDefined();
    expect(screen.getAllByText(/Skrining Medis/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Dukcapil OCR Lolos 99.8%/i)).toBeDefined();
    expect(screen.getByText(/Rasio DSR:/i)).toBeDefined();

    // Verify Section 1: Pilihan Paket & Konfigurasi Perlindungan
    expect(screen.getByText(/1. Pilihan Paket & Konfigurasi Perlindungan:/i)).toBeDefined();
    expect(screen.getByText(/Uang Pertanggungan \(Nilai Santunan\):/i)).toBeDefined();
    expect(screen.getByText(/Masa Pembayaran Premi \(Tenor\):/i)).toBeDefined();
    expect(screen.getByText(/Frekuensi Pembayaran Premi:/i)).toBeDefined();

    // Verify Section 2: Penerima Manfaat Utama (Ahli Waris Polis)
    expect(screen.getByText(/2. Penerima Manfaat Utama \(Ahli Waris Polis\):/i)).toBeDefined();
    expect(screen.getByLabelText(/Nama Lengkap Ahli Waris:/i)).toBeDefined();
    expect(screen.getByLabelText(/NIK Ahli Waris \(16 Digit\):/i)).toBeDefined();

    // Verify Section 3: Pernyataan Hukum & Persetujuan Klausul Polis
    expect(screen.getByText(/3. Pernyataan Hukum & Persetujuan Klausul Polis:/i)).toBeDefined();

    // Ensure payment method options are NOT implemented
    expect(screen.queryByText(/Metode Pembayaran Premi Pertama/i)).toBeNull();
    expect(screen.queryByRole('button', { name: /Virtual Account BCA/i })).toBeNull();

    // Verify Real-time Calculation Breakdown for each field in right-hand column
    expect(screen.getByText(/Rincian Faktor Perhitungan Premi:/i)).toBeDefined();
    expect(screen.getByText(/Nilai Santunan \(UP\)/i)).toBeDefined();
    expect(screen.getAllByText(/Masa Pertanggungan \(Tenor\)/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Usia Pemohon/i)).toBeDefined();
    expect(screen.getByText(/Status Merokok/i)).toBeDefined();
    expect(screen.getByText(/Indeks Massa Tubuh \(BMI\)/i)).toBeDefined();
    expect(screen.getByText(/Rasio Beban Cicilan \(DSR\)/i)).toBeDefined();
    expect(screen.getByText(/Skema Pembayaran/i)).toBeDefined();

    // Verify changing tenor updates the breakdown
    const tenor5Btn = screen.getByRole('button', { name: /^5 Tahun$/i });
    fireEvent.click(tenor5Btn);
    expect(screen.getByText(/5 Thn \(1x\)/i)).toBeDefined();

    const tenor20Btn = screen.getByRole('button', { name: /^20 Tahun$/i });
    fireEvent.click(tenor20Btn);
    expect(screen.getByText(/20 Thn \(1.15x\)/i)).toBeDefined();
  });

  it('correctly clamps sumAssured and termYears when switching from Secure Life Plus to Auto Shield Comprehensive', async () => {
    const mockProducts: InsuranceProduct[] = [
      {
        id: 'prod_secure_life_plus',
        slug: 'secure-life-plus',
        categoryKey: 'life',
        category: 'Asuransi Jiwa',
        title: 'Secure Life Plus',
        description: 'Proteksi jiwa komprehensif',
        startingPrice: 'Rp 185.000 / bln',
        coverageAmount: 'Hingga Rp 1.000.000.000',
        coverageTerm: '5 - 20 Tahun',
        baseRate: 0.0035,
        minAge: 18,
        maxAge: 60,
        minSumAssured: 100_000_000,
        maxSumAssured: 1_000_000_000,
        minTermYears: 5,
        maxTermYears: 20,
        sumAssuredPresets: [100_000_000, 250_000_000, 500_000_000, 1_000_000_000],
        termPresets: [5, 10, 15, 20],
        waitingPeriodDays: 0,
        claimMethod: 'instant_transfer',
        underwritingNote: '',
        features: ['Proteksi jiwa komprehensif'],
        benefitsDetailed: [],
        riders: [],
      },
      {
        id: 'prod_auto_shield_comprehensive',
        slug: 'auto-shield-comprehensive',
        categoryKey: 'vehicle',
        category: 'Asuransi Kendaraan',
        title: 'Auto Shield Comprehensive',
        description: 'Proteksi all-risk kendaraan',
        startingPrice: 'Rp 95.000 / bln',
        coverageAmount: 'Hingga Rp 750.000.000',
        coverageTerm: '1 - 5 Tahun',
        baseRate: 0.012,
        minAge: 18,
        maxAge: 60,
        minSumAssured: 75_000_000,
        maxSumAssured: 750_000_000,
        minTermYears: 1,
        maxTermYears: 5,
        sumAssuredPresets: [75_000_000, 150_000_000, 300_000_000, 750_000_000],
        termPresets: [1, 2, 3, 5],
        waitingPeriodDays: 0,
        claimMethod: 'cashless',
        underwritingNote: '',
        features: ['Proteksi all-risk kendaraan'],
        benefitsDetailed: [],
        riders: [],
      },
    ];

    render(
      <ApplicationWorkbench
        initialProducts={mockProducts}
        initialQuote={{
          productId: 'prod_secure_life_plus',
          sumAssured: 500_000_000,
          termYears: 10,
          applicantAge: 30,
        }}
      />
    );

    // Initial state with Secure Life Plus
    expect(screen.getAllByText(/Secure Life Plus/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/10 Tahun/i)).toBeDefined();

    // Advance to Step 2
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Step 2: Finansial & Kerja →/i }));

    // Advance to Step 3
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Step 3: Skrining Medis →/i }));
    expect(screen.getByText(/Pilar 3: Skrining Medis & Deklarasi Kesehatan Mandiri/i)).toBeDefined();

    // Now switch product to Auto Shield Comprehensive via product dropdown
    const productSelect = screen.getByLabelText(/Pilih Produk Asuransi/i);
    fireEvent.change(productSelect, { target: { value: 'prod_auto_shield_comprehensive' } });

    // Step 3 should now show vehicle object questions
    await waitFor(() => {
      expect(screen.getByText(/Pilar 3: Objek Pertanggungan Kendaraan/i)).toBeDefined();
    });
    expect(screen.getByLabelText(/Nomor Plat Polisi Kendaraan:/i)).toBeDefined();

    // Right panel should have clamped values for Auto Shield (UP clamped to 300jt preset, tenor clamped to 5 years)
    expect(screen.getAllByText(/5 Tahun/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Rp 300\.000\.000/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/10 Tahun/i)).toBeNull();

    // Fill vehicle plate and advance to Step 4
    fireEvent.change(screen.getByLabelText(/Nomor Plat Polisi Kendaraan:/i), {
      target: { value: 'B 1234 XYZ' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Step 4: Review & Polis →/i }));

    // In Step 4, verify UP Display box and Slider exist
    expect(screen.getByText(/Pilar 4: Review & Persetujuan Polis/i)).toBeDefined();
    expect(screen.getByLabelText(/Uang Pertanggungan Santunan Tunai/i)).toBeDefined();

    // Verify active preset button is 300 Juta with checkmark
    const activeUpBtn = screen.getByRole('button', { name: /✓ Rp 300 Juta/i });
    expect(activeUpBtn).toBeDefined();

    // Verify active tenor button is 5 Tahun with checkmark
    const activeTenorBtn = screen.getByRole('button', { name: /✓ 5 Tahun/i });
    expect(activeTenorBtn).toBeDefined();
  });
});
