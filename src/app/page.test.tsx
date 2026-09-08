import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from './page';
import { HomeWorkbench } from './HomeWorkbench';
import { productService } from '@/server/di';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('HomePage & HomeWorkbench', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('renders Server Component HomePage correctly with Penpot sections and products', async () => {
    const Component = await HomePage();
    render(Component);

    // 1. Hero Section
    expect(screen.getByText(/PLATFORM ASURANSI DIGITAL MODERN/i)).toBeDefined();
    expect(screen.getByText(/Perlindungan Masa Depan,/i)).toBeDefined();
    expect(screen.getByText(/Instant Approval Engine/i)).toBeDefined();
    expect(screen.getByText(/Disetujui Otomatis dalam 45 Detik/i)).toBeDefined();

    // 2. 4 Value Props Strip
    expect(screen.getByText('3 Kategori Polis')).toBeDefined();
    expect(screen.getByText('Smart Pricing Engine')).toBeDefined();
    expect(screen.getByText('Digital Underwriting')).toBeDefined();
    expect(screen.getByText('RAG AI Assistant')).toBeDefined();

    // 3. Featured Products
    expect(screen.getByText(/Pilihan Perlindungan Terbaik Dari Core API/i)).toBeDefined();
    expect(screen.getByText('Term Life Guard Plus')).toBeDefined();
    expect(screen.getByText('Critical Illness Shield')).toBeDefined();
    expect(screen.getByText('EduCare Future')).toBeDefined();

    // 4. 4-Tahap Workflow Underwriting
    expect(screen.getByText('Verifikasi KTP Dukcapil')).toBeDefined();
    expect(screen.getByText('Analisis Kemampuan UP')).toBeDefined();
    expect(screen.getByText('Validasi Berkas Digital')).toBeDefined();
    expect(screen.getByText('Kuesioner Kesehatan')).toBeDefined();
    expect(screen.getByText(/95% Aplikasi Disetujui Secara Otomatis dalam 5 Menit/i)).toBeDefined();

    // 5. FAQ Accordion
    expect(screen.getByText(/Semua Hal yang Perlu Anda Ketahui/i)).toBeDefined();

    // 8. Pre-Footer Banner
    expect(screen.getByText(/Butuh Rekomendasi Polis yang Tepat\?/i)).toBeDefined();

    // 9. Official Penpot Footer
    expect(screen.getByText(/Menara Bayu Lt\. 18/i)).toBeDefined();
    expect(screen.getByText(/TERDAFTAR & DIAWASI OJK/i)).toBeDefined();
    expect(screen.getByText(/ISO 27001 SECURITY/i)).toBeDefined();
  });

  it('navigates to simulation page when a product is selected', async () => {
    const featured = await productService.getFeaturedProducts();
    render(<HomeWorkbench initialFeaturedProducts={featured} />);

    const selectButtons = screen.getAllByRole('button', { name: /Pilih & Simulasi Premi →/i });
    expect(selectButtons.length).toBeGreaterThan(0);

    fireEvent.click(selectButtons[0]);
    expect(mockPush).toHaveBeenCalledWith(`/simulation?productId=${featured[0].id}`);
  });

  it('toggles FAQ accordion items when clicked', async () => {
    const featured = await productService.getFeaturedProducts();
    render(<HomeWorkbench initialFeaturedProducts={featured} />);

    // First FAQ is open by default
    expect(screen.getByText(/tabel mortalita resmi TMI IV OJK/i)).toBeDefined();

    // Click second FAQ
    const secondFaq = screen.getByText('Berapa lama proses persetujuan underwriting?');
    fireEvent.click(secondFaq);
    expect(screen.getByText(/45 detik hingga 5 menit/i)).toBeDefined();

    // Click second FAQ again to close it
    fireEvent.click(secondFaq);
    expect(screen.queryByText(/45 detik hingga 5 menit/i)).toBeNull();
  });
});
