import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
  });

  it('renders Server Component SimulationPage correctly with initial products', async () => {
    const Component = await SimulationPage({});
    render(Component);

    expect(
      screen.getByRole('heading', { level: 1, name: /Simulasi Premi & Perencanaan Proteksi/i })
    ).toBeDefined();

    expect(screen.getByText(/Kalkulator Aktuaria OJK 2026/i)).toBeDefined();
    expect(screen.getByText(/Hasil Estimasi Aktuaria/i)).toBeDefined();
  });

  it('pre-selects product specified in searchParams', async () => {
    const products = await productService.getProducts();
    const targetProduct = products[1]; // prod-ci-shield

    const Component = await SimulationPage({
      searchParams: Promise.resolve({ productId: targetProduct.id }),
    });
    render(Component);

    // Snapshot card should show the target product's title
    expect(screen.getAllByText(targetProduct.title).length).toBeGreaterThan(0);
  });

  it('switches product via dropdown selector and updates boundaries', async () => {
    const products = await productService.getProducts();
    render(<SimulationWorkbench initialProducts={products} />);

    const select = screen.getByLabelText(/Katalog Produk Pilihan/i);
    fireEvent.change(select, { target: { value: products[2].id } });

    expect(screen.getAllByText(products[2].title).length).toBeGreaterThan(0);
  });

  it('adjusts sum assured using quick preset buttons', async () => {
    const products = await productService.getProducts();
    render(<SimulationWorkbench initialProducts={products} initialProductId={products[0].id} />);

    const preset1M = screen.queryByRole('button', { name: 'Rp 1 Miliar' });
    if (preset1M) {
      fireEvent.click(preset1M);
      expect(screen.getByText('Rp 1.000.000.000')).toBeDefined();
    }
  });

  it('adjusts term years using preset buttons', async () => {
    const products = await productService.getProducts();
    render(<SimulationWorkbench initialProducts={products} initialProductId={products[0].id} />);

    const termBtn = screen.queryByRole('button', { name: '15 Tahun' });
    if (termBtn) {
      fireEvent.click(termBtn);
      expect(screen.getByText('15 Tahun Polis Aktif')).toBeDefined();
    }
  });

  it('updates applicant age and toggles smoker status', async () => {
    const products = await productService.getProducts();
    render(<SimulationWorkbench initialProducts={products} initialProductId={products[0].id} />);

    const ageInput = screen.getByLabelText(/Usia Tertanggung Saat Masuk/i);
    fireEvent.change(ageInput, { target: { value: '35' } });

    const smokerCheckbox = screen.getByLabelText(/Status Perokok Aktif/i);
    fireEvent.click(smokerCheckbox);

    // Underwriting status or breakdown should react
    expect(screen.getByText(/Kategori Underwriting/i)).toBeDefined();
  });

  it('toggles payment frequency and displays annual discount savings', async () => {
    const products = await productService.getProducts();
    render(<SimulationWorkbench initialProducts={products} initialProductId={products[0].id} />);

    const annualRadio = screen.getByRole('radio', { name: /Tahunan \(Annual\)/i });
    fireEvent.click(annualRadio);

    // Should display discount badge
    expect(screen.getByText(/Diskon 10%/i)).toBeDefined();
    expect(screen.getAllByText(/Hemat/i).length).toBeGreaterThan(0);
  });

  it('toggles optional riders and updates premium', async () => {
    const products = await productService.getProducts();
    // Choose product with riders
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

      // Verify that rider count updates in breakdown
      expect(screen.getByText(/1 rider/i)).toBeDefined();

      // Uncheck rider
      fireEvent.click(riderCheckbox);
      expect(screen.getByText(/Rp 0 \(Tidak Ada Rider\)/i)).toBeDefined();
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
    expect(screen.getByText(/Premi Tahunan = \(UP × BaseRate × FaktorUsia × FaktorRokok\) \+ BiayaRiders/i)).toBeDefined();

    const closeModalBtn = screen.getByRole('button', { name: /Tutup rincian rumus/i });
    fireEvent.click(closeModalBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Premi Tahunan = \(UP × BaseRate × FaktorUsia × FaktorRokok\) \+ BiayaRiders/i)).toBeNull();
    });

    // Reopen and close using Escape key
    fireEvent.click(openModalBtn);
    expect(screen.getByRole('heading', { level: 3, name: /Rincian Rumus Aktuaria OJK/i })).toBeDefined();

    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('heading', { level: 3, name: /Rincian Rumus Aktuaria OJK/i })).toBeNull();
    });
  });

  it('clamps age input on blur to [18, 65] range', async () => {
    const products = await productService.getProducts();
    render(<SimulationWorkbench initialProducts={products} initialProductId={products[0].id} />);

    const ageInput = screen.getByLabelText(/Usia Tertanggung Saat Masuk/i) as HTMLInputElement;

    // Type empty then blur
    fireEvent.change(ageInput, { target: { value: '' } });
    fireEvent.blur(ageInput);
    expect(ageInput.value).toBe('18');

    // Type 99 then blur -> clamps to 65
    fireEvent.change(ageInput, { target: { value: '99' } });
    fireEvent.blur(ageInput);
    expect(ageInput.value).toBe('65');
  });

  it('syncs selected product when initialProductId prop updates', async () => {
    const products = await productService.getProducts();
    const { rerender } = render(
      <SimulationWorkbench initialProducts={products} initialProductId={products[0].id} />
    );

    expect(screen.getAllByText(products[0].title).length).toBeGreaterThan(0);

    rerender(
      <SimulationWorkbench initialProducts={products} initialProductId={products[1].id} />
    );

    expect(screen.getAllByText(products[1].title).length).toBeGreaterThan(0);
  });

  it('navigates to apply page when clicking continue CTA', async () => {
    const products = await productService.getProducts();
    render(<SimulationWorkbench initialProducts={products} initialProductId={products[0].id} />);

    const continueBtn = screen.getByRole('button', { name: /Lanjutkan Pendaftaran Polis 📝/i });
    fireEvent.click(continueBtn);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush.mock.calls[0][0]).toContain('/apply?productId=');
    expect(mockPush.mock.calls[0][0]).toContain('sumAssured=');
    expect(mockPush.mock.calls[0][0]).toContain('termYears=');
  });

  it('renders loading placeholder if initialProducts is empty', () => {
    render(<SimulationWorkbench initialProducts={[]} />);
    expect(screen.getByText(/Memuat data katalog produk simulasi.../i)).toBeDefined();
  });
});
