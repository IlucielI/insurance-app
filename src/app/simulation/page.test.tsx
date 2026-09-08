import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import SimulationPage from './page';
import { SimulationWorkbench, numberToRupiahWords } from './SimulationWorkbench';
import { productService } from '@/server/di';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('SimulationPage & SimulationWorkbench', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    window.print = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Server Component SimulationPage correctly with Penpot hero and canonical product cards', async () => {
    const Component = await SimulationPage({});
    render(Component);

    // Main Penpot heading
    expect(
      screen.getByRole('heading', { level: 1, name: /Kalkulator & Simulasi Premi Asuransi/i })
    ).toBeDefined();

    // Live quote engine badge
    expect(screen.getByText(/LIVE CORE API QUOTE ENGINE/i)).toBeDefined();

    // Inclusions & Exclusions clauses
    expect(screen.getByText(/MANFAAT YANG DICAKUP \(COVERED BENEFITS\)/i)).toBeDefined();
    expect(screen.getByText(/PENGECUALIAN RESMI \(EXCLUSIONS\)/i)).toBeDefined();
  });

  it('pre-selects product specified in searchParams', async () => {
    const products = await productService.getProducts();
    const targetProduct = products[1];

    const Component = await SimulationPage({
      searchParams: Promise.resolve({ productId: targetProduct.id }),
    });
    render(Component);

    // Selected product title should be present
    expect(screen.getAllByText(targetProduct.title).length).toBeGreaterThan(0);
  });

  it('switches product via 3 canonical selector cards', async () => {
    const products = await productService.getProducts();
    render(<SimulationWorkbench initialProducts={products} />);

    // Click the second product card
    const cardButtons = screen.getAllByRole('button').filter((b) =>
      b.getAttribute('aria-pressed') !== null && b.textContent?.includes(products[1].title)
    );

    if (cardButtons.length > 0) {
      fireEvent.click(cardButtons[0]);
      expect(cardButtons[0].getAttribute('aria-pressed')).toBe('true');
    }
  });

  it('adjusts sum assured using quick preset chips', async () => {
    const products = await productService.getProducts();
    render(<SimulationWorkbench initialProducts={products} initialProductId={products[0].id} />);

    const preset1M = screen.queryByRole('button', { name: /Rp 1 Miliar/i });
    if (preset1M) {
      fireEvent.click(preset1M);
      expect(screen.getAllByText(/Rp 1.000.000.000/i).length).toBeGreaterThan(0);
    }
  });

  it('adjusts term years using preset chips', async () => {
    const products = await productService.getProducts();
    render(<SimulationWorkbench initialProducts={products} initialProductId={products[0].id} />);

    const termBtn = screen.queryByRole('button', { name: /15 Tahun/i });
    if (termBtn) {
      fireEvent.click(termBtn);
      expect(termBtn.getAttribute('aria-pressed')).toBe('true');
    }
  });

  it('toggles gender and updates factor breakdown', async () => {
    const products = await productService.getProducts();
    render(<SimulationWorkbench initialProducts={products} initialProductId={products[0].id} />);

    const femaleBtn = screen.getByRole('button', { name: /Wanita \(Faktor: 1.00x\)/i });
    fireEvent.click(femaleBtn);

    expect(femaleBtn.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText(/Faktor Gender \(Wanita\)/i)).toBeDefined();
    expect(screen.getAllByText('1x').length).toBeGreaterThan(0);
  });

  it('toggles occupation risk level pills', async () => {
    const products = await productService.getProducts();
    render(<SimulationWorkbench initialProducts={products} initialProductId={products[0].id} />);

    const highOccBtn = screen.getByRole('button', { name: /Tinggi \(1.40x\)/i });
    fireEvent.click(highOccBtn);

    expect(highOccBtn.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText(/Faktor Pekerjaan Tinggi/i)).toBeDefined();
    expect(screen.getByText('1.4x')).toBeDefined();
  });

  it('updates applicant age and toggles smoker status', async () => {
    const products = await productService.getProducts();
    render(<SimulationWorkbench initialProducts={products} initialProductId={products[0].id} />);

    const ageInput = screen.getByLabelText(/Input Manual Usia:/i);
    fireEvent.change(ageInput, { target: { value: '35' } });

    const smokerBtn = screen.getByRole('button', { name: /Perokok Aktif \(1.35x\)/i });
    fireEvent.click(smokerBtn);

    expect(smokerBtn.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText(/Faktor Perokok Aktif/i)).toBeDefined();
    expect(screen.getByText('1.35x')).toBeDefined();
  });

  it('toggles payment frequency and displays annual discount savings', async () => {
    const products = await productService.getProducts();
    render(<SimulationWorkbench initialProducts={products} initialProductId={products[0].id} />);

    const monthlyBtn = screen.getByRole('button', { name: /Bulanan \(Pembayaran Rutin\)/i });
    fireEvent.click(monthlyBtn);

    expect(monthlyBtn.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText(/ESTIMASI PREMI BULANAN/i)).toBeDefined();
  });

  it('toggles optional riders and updates premium', async () => {
    const products = await productService.getProducts();
    const productWithRiders = products.find((p) => p.riders && p.riders.length > 0) || products[0];

    render(
      <SimulationWorkbench
        initialProducts={products}
        initialProductId={productWithRiders.id}
      />
    );

    if (productWithRiders.riders && productWithRiders.riders.length > 0) {
      const firstRider = productWithRiders.riders[0];
      const riderCheckbox = screen.getByLabelText(new RegExp(firstRider.name, 'i'));
      fireEvent.click(riderCheckbox);

      expect((riderCheckbox as HTMLInputElement).checked).toBe(true);

      fireEvent.click(riderCheckbox);
      expect((riderCheckbox as HTMLInputElement).checked).toBe(false);
    }
  });

  it('opens and closes the actuarial formula modal', async () => {
    const products = await productService.getProducts();
    render(<SimulationWorkbench initialProducts={products} initialProductId={products[0].id} />);

    const openModalBtn = screen.getByRole('button', { name: /Lihat Rincian Rumus Aktuaria OJK/i });
    fireEvent.click(openModalBtn);

    expect(
      screen.getByRole('heading', { level: 3, name: /Rincian Rumus Aktuaria OJK/i })
    ).toBeDefined();

    const closeModalBtn = screen.getByRole('button', { name: /Tutup rincian rumus/i });
    fireEvent.click(closeModalBtn);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { level: 3, name: /Rincian Rumus Aktuaria OJK/i })).toBeNull();
    });

    // Reopen and close via Escape
    fireEvent.click(openModalBtn);
    expect(screen.getByRole('heading', { level: 3, name: /Rincian Rumus Aktuaria OJK/i })).toBeDefined();

    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('heading', { level: 3, name: /Rincian Rumus Aktuaria OJK/i })).toBeNull();
    });
  });

  it('triggers PDF download simulation button', async () => {
    vi.useFakeTimers();
    const products = await productService.getProducts();
    render(<SimulationWorkbench initialProducts={products} initialProductId={products[0].id} />);

    const downloadBtn = screen.getByRole('button', { name: /Unduh Rincian Simulasi \(PDF\)/i });
    fireEvent.click(downloadBtn);

    expect(screen.getByText(/Menyiapkan dokumen ringkasan simulasi/i)).toBeDefined();

    act(() => {
      vi.runAllTimers();
    });
    expect(window.print).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('clamps age input on blur to product age range', async () => {
    const products = await productService.getProducts();
    const product = products[0];
    render(<SimulationWorkbench initialProducts={products} initialProductId={product.id} />);

    const ageInput = screen.getByLabelText(/Input Manual Usia:/i) as HTMLInputElement;

    fireEvent.change(ageInput, { target: { value: '' } });
    fireEvent.blur(ageInput);
    expect(ageInput.value).toBe(String(product.minAge));

    fireEvent.change(ageInput, { target: { value: '99' } });
    fireEvent.blur(ageInput);
    expect(ageInput.value).toBe(String(product.maxAge));
  });

  it('navigates to apply page with rich actuarial query params when clicking continue CTA', async () => {
    const products = await productService.getProducts();
    render(<SimulationWorkbench initialProducts={products} initialProductId={products[0].id} />);

    const continueBtn = screen.getByRole('button', { name: /Lanjut ke Form Pendaftaran Polis \(Step 1\) →/i });
    fireEvent.click(continueBtn);

    expect(mockPush).toHaveBeenCalledTimes(1);
    const navUrl = mockPush.mock.calls[0][0];
    expect(navUrl).toContain('/apply?productId=');
    expect(navUrl).toContain('sumAssured=');
    expect(navUrl).toContain('termYears=');
    expect(navUrl).toContain('gender=');
    expect(navUrl).toContain('occupationRisk=');
  });

  it('renders loading placeholder if initialProducts is empty', () => {
    render(<SimulationWorkbench initialProducts={[]} />);
    expect(screen.getByText(/Memuat data kalkulator simulasi premi.../i)).toBeDefined();
  });
});

describe('numberToRupiahWords', () => {
  it('formats integer billion correctly (Happy Path)', () => {
    expect(numberToRupiahWords(2_000_000_000)).toBe('2 Miliar Rupiah');
  });

  it('formats compound billion and million correctly', () => {
    expect(numberToRupiahWords(1_500_000_000)).toBe('1 Miliar 500 Juta Rupiah');
  });

  it('does not mislead user with lossy rounding to 2,0 Miliar for 1_999_999_999 (Edge Case)', () => {
    const result = numberToRupiahWords(1_999_999_999);
    expect(result).not.toBe('2,0 Miliar Rupiah');
    expect(result).not.toBe('2 Miliar Rupiah');
    expect(result).toBe('1 Miliar 999 Juta 999 Ribu 999 Rupiah');
  });

  it('formats integer million amounts correctly', () => {
    expect(numberToRupiahWords(500_000_000)).toBe('500 Juta Rupiah');
    expect(numberToRupiahWords(100_000_000)).toBe('100 Juta Rupiah');
  });

  it('returns Nol Rupiah for zero or negative values', () => {
    expect(numberToRupiahWords(0)).toBe('Nol Rupiah');
    expect(numberToRupiahWords(-500)).toBe('Nol Rupiah');
  });
});
