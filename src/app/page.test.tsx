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

  it('renders Server Component HomePage correctly with products from productService', async () => {
    const Component = await HomePage();
    render(Component);

    // Hero Section
    expect(screen.getByText(/Teknologi Underwriting AI Berkecepatan Tinggi/i)).toBeDefined();
    expect(screen.getByText('Term Life Guard Plus')).toBeDefined();
    expect(screen.getByText('Critical Illness Shield')).toBeDefined();
    expect(screen.getByText('EduCare Future')).toBeDefined();

    // 4 Pillars
    expect(screen.getByText('1. Identitas Dukcapil')).toBeDefined();
    expect(screen.getByText('2. Finansial & DSR')).toBeDefined();
    expect(screen.getByText('3. Riwayat Medis')).toBeDefined();
    expect(screen.getByText('4. Legalitas Polis')).toBeDefined();
  });

  it('navigates to simulation page when a product is selected', async () => {
    const featured = await productService.getFeaturedProducts();
    render(<HomeWorkbench initialFeaturedProducts={featured} />);

    const selectButtons = screen.getAllByRole('button', { name: /Pilih & Simulasi Premi →/i });
    expect(selectButtons.length).toBeGreaterThan(0);

    fireEvent.click(selectButtons[0]);
    expect(mockPush).toHaveBeenCalledWith(`/simulation?productId=${featured[0].id}`);
  });

  it('opens and closes the AI Assistant Drawer via the floating trigger', async () => {
    const featured = await productService.getFeaturedProducts();
    render(<HomeWorkbench initialFeaturedProducts={featured} />);

    // FAB button
    const fabButton = screen.getByRole('button', { name: /Tanya AI InsuRisk/i });
    expect(fabButton).toBeDefined();

    fireEvent.click(fabButton);

    // Drawer header should appear
    await waitFor(() => {
      expect(screen.getByText('AI Insurance Assistant')).toBeDefined();
    });

    // Close button on drawer
    const closeBtn = screen.getByRole('button', { name: 'Tutup Asisten' });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText('AI Insurance Assistant')).toBeNull();
    });
  });
});
