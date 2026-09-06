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

  it('renders Server Component ProductsPage correctly with all initial products', async () => {
    const Component = await ProductsPage();
    render(Component);

    expect(
      screen.getByRole('heading', { level: 1, name: /Pilihan Lengkap Asuransi Digital Masa Depan/i })
    ).toBeDefined();

    expect(screen.getAllByText('Term Life Guard Plus').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Critical Illness Shield').length).toBeGreaterThan(0);
    expect(screen.getAllByText('EduCare Future').length).toBeGreaterThan(0);
    expect(screen.getAllByText('HealthCare Prime Cashless').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Senior Heritage Life').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Family Hospital Protection').length).toBeGreaterThan(0);

    // Comparison Table
    expect(screen.getByText('Matriks Komparasi Fitur & Benefit Polis')).toBeDefined();
  });

  it('filters products by category tabs', async () => {
    const products = await productService.getProducts();
    render(<ProductCatalogWorkbench initialProducts={products} />);

    // Click 'Asuransi Jiwa'
    const lifeTab = screen.getByRole('button', { name: /Asuransi Jiwa/i });
    fireEvent.click(lifeTab);

    expect(screen.getAllByText('Term Life Guard Plus').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Senior Heritage Life').length).toBeGreaterThan(0);
    expect(screen.queryByText('Critical Illness Shield')).toBeNull();

    // Click 'Penyakit Kritis'
    const criticalTab = screen.getByRole('button', { name: /Penyakit Kritis/i });
    fireEvent.click(criticalTab);

    expect(screen.getAllByText('Critical Illness Shield').length).toBeGreaterThan(0);
    expect(screen.queryByText('Term Life Guard Plus')).toBeNull();

    // Switch back to 'Semua Produk'
    const allTab = screen.getByRole('button', { name: /Semua Produk/i });
    fireEvent.click(allTab);

    expect(screen.getAllByText('Term Life Guard Plus').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Family Hospital Protection').length).toBeGreaterThan(0);
  });

  it('searches products with search query and handles empty search state', async () => {
    const products = await productService.getProducts();
    render(<ProductCatalogWorkbench initialProducts={products} />);

    const searchInput = screen.getByRole('textbox', { name: 'Cari produk asuransi' });
    fireEvent.change(searchInput, { target: { value: 'Senior' } });

    expect(screen.getAllByText('Senior Heritage Life').length).toBeGreaterThan(0);
    expect(screen.queryByText('Critical Illness Shield')).toBeNull();

    // Clear search with X button
    const clearBtn = screen.getByRole('button', { name: 'Hapus pencarian' });
    fireEvent.click(clearBtn);

    expect(screen.getAllByText('Critical Illness Shield').length).toBeGreaterThan(0);

    // Search unmatched string
    fireEvent.change(searchInput, { target: { value: 'NONEXISTENT_QUERY_XYZ' } });
    expect(screen.getByText('Produk Tidak Ditemukan')).toBeDefined();

    // Click 'Tampilkan Semua Produk'
    const resetBtn = screen.getByRole('button', { name: 'Tampilkan Semua Produk' });
    fireEvent.click(resetBtn);

    expect(screen.getAllByText('Term Life Guard Plus').length).toBeGreaterThan(0);
  });

  it('sorts products by sort dropdown', async () => {
    const products = await productService.getProducts();
    render(<ProductCatalogWorkbench initialProducts={products} />);

    const sortSelect = screen.getByRole('combobox', { name: 'Urutkan produk' });

    // Sort by price-asc
    fireEvent.change(sortSelect, { target: { value: 'price-asc' } });
    // Sort by price-desc
    fireEvent.change(sortSelect, { target: { value: 'price-desc' } });
    // Sort by coverage-desc
    fireEvent.change(sortSelect, { target: { value: 'coverage-desc' } });
    // Sort by popular
    fireEvent.change(sortSelect, { target: { value: 'popular' } });

    expect(screen.getAllByText('Term Life Guard Plus').length).toBeGreaterThan(0);
  });

  it('opens product detail modal, views benefits & riders, and closes modal', async () => {
    const products = await productService.getProducts();
    render(<ProductCatalogWorkbench initialProducts={products} />);

    const detailButtons = screen.getAllByRole('button', { name: /Lihat Rincian Manfaat & Riders/i });
    fireEvent.click(detailButtons[0]);

    // Modal opens
    await waitFor(() => {
      expect(screen.getByText('Cakupan Manfaat Utama Polis')).toBeDefined();
      expect(screen.getByText('Santunan Meninggal Dunia 100%')).toBeDefined();
    });

    // Close via X button
    const closeBtn = screen.getByRole('button', { name: 'Tutup Detail Produk' });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText('Cakupan Manfaat Utama Polis')).toBeNull();
    });
  });

  it('navigates to simulation page from ProductCard, Modal CTA, and Comparison Table', async () => {
    const products = await productService.getProducts();
    render(<ProductCatalogWorkbench initialProducts={products} />);

    // 1. From ProductCard
    const cardSelectBtns = screen.getAllByRole('button', { name: /Pilih & Simulasi Premi →/i });
    fireEvent.click(cardSelectBtns[0]);
    expect(mockPush).toHaveBeenCalledWith(`/simulation?productId=${products[0].id}`);

    // 2. From Detail Modal CTA
    const detailButtons = screen.getAllByRole('button', { name: /Lihat Rincian Manfaat & Riders/i });
    fireEvent.click(detailButtons[1]);

    const modalSimulateBtn = await screen.findByRole('button', { name: /Lanjut ke Simulasi Premi 🧮/i });
    fireEvent.click(modalSimulateBtn);
    expect(mockPush).toHaveBeenCalledWith(`/simulation?productId=${products[1].id}`);

    // 3. From Comparison Table
    const tableSimulateBtns = screen.getAllByRole('button', { name: 'Simulasi →' });
    fireEvent.click(tableSimulateBtns[2]);
    expect(mockPush).toHaveBeenCalledWith(`/simulation?productId=${products[2].id}`);
  });
});
