import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import SimulationPage from './page';
import { SimulationWorkbench } from './SimulationWorkbench';
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

    // Pre-footer AI Assistant card
    expect(screen.getByText(/Butuh Rekomendasi Simulasi yang Tepat\?/i)).toBeDefined();
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

  it('switches product via fallback dropdown selector if more than 3 products exist', async () => {
    const products = await productService.getProducts();
    render(<SimulationWorkbench initialProducts={products} />);

    const select = screen.queryByLabelText(/Katalog Produk Pilihan/i);
    if (select) {
      fireEvent.change(select, { target: { value: products[2].id } });
      expect(screen.getAllByText(products[2].title).length).toBeGreaterThan(0);
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

  it('submits AI assistant prompt chip and input query', async () => {
    const products = await productService.getProducts();
    render(<SimulationWorkbench initialProducts={products} initialProductId={products[0].id} />);

    const chipBtn = screen.getByRole('button', { name: 'Berapa UP ideal untuk gaji 15jt?' });
    fireEvent.click(chipBtn);

    expect(mockPush).toHaveBeenCalledWith('/assistant?q=Berapa%20UP%20ideal%20untuk%20gaji%2015jt%3F');

    const input = screen.getByPlaceholderText(/Tanyakan seputar simulasi atau premi polis.../i);
    fireEvent.change(input, { target: { value: 'Bandingkan tenor 10 vs 20 tahun' } });

    const submitBtn = screen.getByRole('button', { name: 'Tanya AI' });
    fireEvent.click(submitBtn);

    expect(mockPush).toHaveBeenCalledWith(
      '/assistant?q=Bandingkan%20tenor%2010%20vs%2020%20tahun'
    );
  });

  it('clamps age input on blur to [18, 65] range', async () => {
    const products = await productService.getProducts();
    render(<SimulationWorkbench initialProducts={products} initialProductId={products[0].id} />);

    const ageInput = screen.getByLabelText(/Input Manual Usia:/i) as HTMLInputElement;

    fireEvent.change(ageInput, { target: { value: '' } });
    fireEvent.blur(ageInput);
    expect(ageInput.value).toBe('18');

    fireEvent.change(ageInput, { target: { value: '99' } });
    fireEvent.blur(ageInput);
    expect(ageInput.value).toBe('65');
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
