import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductsPage from './page';
import { ProductCatalogWorkbench } from './ProductCatalogWorkbench';
import { productService } from '@/server/di';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('ProductsPage & ProductCatalogWorkbench', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Server Component ProductsPage correctly with Penpot hero and canonical products', async () => {
    const Component = await ProductsPage();
    render(Component);

    // 1. Breadcrumb & Heading
    expect(screen.getByText('Katalog Produk Asuransi')).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 1, name: /Pilihan Produk Proteksi Unggulan/i })
    ).toBeDefined();

    // 2. Canonical Penpot Products
    expect(screen.getAllByText('Secure Life Plus').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Health Guard Essential').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Auto Shield Comprehensive').length).toBeGreaterThan(0);

    // 3. Core API Guarantee Banner
    expect(screen.getByText('CORE API GUARANTEE')).toBeDefined();
    expect(screen.getByText('Perhitungan Presisi & Lifecycle Terintegrasi')).toBeDefined();
    expect(screen.getByText('Pricing Rules Dinamis')).toBeDefined();
    expect(screen.getByText('4 Checks Underwriting')).toBeDefined();

    // 4. Pre-Footer AI Assistant Card
    expect(screen.getByText('Konsultasi Asuransi Cerdas dengan AI')).toBeDefined();
    expect(
      screen.getByRole('button', { name: /Buka Chat AI Asisten →/i })
    ).toBeDefined();
  });

  it('passes category and search searchParams to productService.getProducts', async () => {
    const spy = vi.spyOn(productService, 'getProducts');
    const Component = await ProductsPage({
      searchParams: Promise.resolve({ category: 'life', search: 'secure' }),
    });
    render(Component);

    expect(spy).toHaveBeenCalledWith('life', 'secure');
  });

  it('filters products by category pills (Jiwa, Kesehatan, Kendaraan, Semua)', async () => {
    const products = await productService.getProducts();
    render(<ProductCatalogWorkbench initialProducts={products} />);

    // Click 'Asuransi Jiwa'
    const lifeBtn = screen.getByRole('button', { name: /Asuransi Jiwa/i });
    fireEvent.click(lifeBtn);
    expect(lifeBtn.getAttribute('aria-pressed')).toBe('true');

    expect(screen.getAllByText('Secure Life Plus').length).toBeGreaterThan(0);
    expect(screen.queryByText('Health Guard Essential')).toBeNull();
    expect(screen.queryByText('Auto Shield Comprehensive')).toBeNull();

    // Click 'Asuransi Kesehatan'
    const healthBtn = screen.getByRole('button', { name: /Asuransi Kesehatan/i });
    fireEvent.click(healthBtn);
    expect(healthBtn.getAttribute('aria-pressed')).toBe('true');

    expect(screen.getAllByText('Health Guard Essential').length).toBeGreaterThan(0);
    expect(screen.queryByText('Secure Life Plus')).toBeNull();

    // Click 'Asuransi Kendaraan'
    const vehicleBtn = screen.getByRole('button', { name: /Asuransi Kendaraan/i });
    fireEvent.click(vehicleBtn);
    expect(vehicleBtn.getAttribute('aria-pressed')).toBe('true');

    expect(screen.getAllByText('Auto Shield Comprehensive').length).toBeGreaterThan(0);
    expect(screen.queryByText('Health Guard Essential')).toBeNull();

    // Switch back to 'Semua Produk'
    const allBtn = screen.getByRole('button', { name: /Semua Produk/i });
    fireEvent.click(allBtn);
    expect(allBtn.getAttribute('aria-pressed')).toBe('true');

    expect(screen.getAllByText('Secure Life Plus').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Health Guard Essential').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Auto Shield Comprehensive').length).toBeGreaterThan(0);
  });

  it('searches products with search query and handles empty search state', async () => {
    const products = await productService.getProducts();
    render(<ProductCatalogWorkbench initialProducts={products} />);

    const searchInput = screen.getByRole('textbox', { name: 'Cari produk asuransi' });
    fireEvent.change(searchInput, { target: { value: 'Kendaraan' } });

    expect(screen.getAllByText('Auto Shield Comprehensive').length).toBeGreaterThan(0);
    expect(screen.queryByText('Health Guard Essential')).toBeNull();

    // Clear search with X button
    const clearBtn = screen.getByRole('button', { name: 'Hapus pencarian' });
    fireEvent.click(clearBtn);

    expect(screen.getAllByText('Health Guard Essential').length).toBeGreaterThan(0);

    // Search unmatched string
    fireEvent.change(searchInput, { target: { value: 'NONEXISTENT_QUERY_XYZ' } });
    expect(screen.getByText('Produk Tidak Ditemukan')).toBeDefined();

    // Click 'Tampilkan Semua Produk'
    const resetBtn = screen.getByRole('button', { name: 'Tampilkan Semua Produk' });
    fireEvent.click(resetBtn);

    expect(screen.getAllByText('Secure Life Plus').length).toBeGreaterThan(0);
  });

  it('opens product detail modal, views benefits & riders, and closes via X button, Escape key, or backdrop click', async () => {
    const products = await productService.getProducts();
    render(<ProductCatalogWorkbench initialProducts={products} />);

    // Breadcrumb semantic check
    const breadcrumbCurrent = screen.getByText('Katalog Produk Asuransi');
    expect(breadcrumbCurrent.getAttribute('aria-current')).toBe('page');

    // Open modal via first Rincian button
    const rincianButtons = screen.getAllByRole('button', { name: /Rincian/i });
    fireEvent.click(rincianButtons[0]);

    // Dialog opens with proper ARIA roles
    const dialog = await screen.findByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(screen.getByText('Cakupan Manfaat Utama Polis')).toBeDefined();

    // 1. Close via Escape key
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    // 2. Re-open and close via backdrop click
    fireEvent.click(rincianButtons[0]);
    const reOpenedDialog = await screen.findByRole('dialog');
    fireEvent.click(reOpenedDialog);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    // 3. Re-open and close via Close button
    fireEvent.click(rincianButtons[0]);
    await screen.findByRole('dialog');
    const closeBtn = screen.getByRole('button', { name: 'Tutup Detail Produk' });
    fireEvent.click(closeBtn);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('navigates to simulation page from Simulasi button and apply page from Daftar button', async () => {
    const products = await productService.getProducts();
    render(<ProductCatalogWorkbench initialProducts={products} />);

    // 1. Click 'Simulasi Premi' on first product (Secure Life Plus)
    const simButtons = screen.getAllByRole('button', { name: /Simulasi premi/i });
    fireEvent.click(simButtons[0]);
    expect(mockPush).toHaveBeenCalledWith('/simulation?productId=secure-life-plus');

    // 2. Click 'Daftar Sekarang' on second product (Health Guard Essential)
    const applyButtons = screen.getAllByRole('button', { name: /Daftar sekarang/i });
    fireEvent.click(applyButtons[1]);
    expect(mockPush).toHaveBeenCalledWith('/apply?productId=health-guard-essential');
  });

  it('toggles the comparison table visibility and navigates from table action', async () => {
    const products = await productService.getProducts();
    render(<ProductCatalogWorkbench initialProducts={products} />);

    // Toggle button
    const toggleBtn = screen.getByRole('button', { name: /Matriks Komparasi Fitur Polis/i });
    expect(screen.queryByText('Uang Pertanggungan Maksimal')).toBeNull();

    // Open table
    fireEvent.click(toggleBtn);
    expect(screen.getByText('Uang Pertanggungan Maksimal')).toBeDefined();

    // Click table simulate button
    const tableSimulateBtns = screen.getAllByRole('button', { name: 'Simulasi →' });
    fireEvent.click(tableSimulateBtns[0]);
    expect(mockPush).toHaveBeenCalledWith('/simulation?productId=secure-life-plus');

    // Close table
    fireEvent.click(toggleBtn);
    expect(screen.queryByText('Uang Pertanggungan Maksimal')).toBeNull();
  });
});
