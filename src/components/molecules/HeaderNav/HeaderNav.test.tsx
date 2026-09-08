import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { HeaderNav } from './HeaderNav';
import { InsuranceProduct } from '@/server/repositories/product.repository.interface';

const mockProducts: InsuranceProduct[] = [
  {
    id: 'prod-life-1',
    slug: 'secure-life-plus',
    categoryKey: 'life',
    category: 'Asuransi Jiwa',
    title: 'Secure Life Plus',
    tagline: 'Santunan tutup usia hingga Rp 1 Miliar & Terminal Illness.',
    description: 'Proteksi jiwa berjangka.',
    startingPrice: 'Mulai Rp 185.000 / bln',
    coverageAmount: 'Hingga Rp 1.000.000.000',
    coverageTerm: '10 Tahun',
    features: ['Proteksi Jiwa', 'Santunan Terminal Illness'],
    isPopular: true,
    isFeatured: true,
    baseRate: 0.0035,
    minAge: 18,
    maxAge: 60,
    minSumAssured: 100000000,
    maxSumAssured: 1000000000,
    minTermYears: 5,
    maxTermYears: 20,
    waitingPeriodDays: 0,
    claimMethod: 'cashless',
    underwritingNote: 'Digital underwriting',
    benefitsDetailed: [],
    exclusions: [],
  },
  {
    id: 'prod-ci-1',
    slug: 'flexi-critical-care',
    categoryKey: 'critical_illness',
    category: 'Penyakit Kritis',
    title: 'Flexi Critical Care',
    tagline: 'Proteksi 50+ kondisi kritis tahap awal.',
    description: 'Proteksi penyakit kritis.',
    startingPrice: 'Mulai Rp 210.000 / bln',
    coverageAmount: 'Hingga Rp 1.500.000.000',
    coverageTerm: 'Hingga Usia 65 Tahun',
    features: ['Proteksi 50+ Kondisi Kritis', 'Klaim Cashless'],
    isPopular: false,
    isFeatured: true,
    baseRate: 0.0048,
    minAge: 21,
    maxAge: 55,
    minSumAssured: 100000000,
    maxSumAssured: 1500000000,
    minTermYears: 5,
    maxTermYears: 20,
    waitingPeriodDays: 90,
    claimMethod: 'cashless',
    underwritingNote: 'Underwriting instan',
    benefitsDetailed: [],
    exclusions: [],
  },
];

describe('HeaderNav Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders brand identity and primary nav links', () => {
    render(<HeaderNav currentPath="/" initialProducts={mockProducts} />);

    expect(screen.getByText('Bayu Insurance')).toBeDefined();
    expect(screen.getByText('BI')).toBeDefined();
    expect(screen.getByText('Insurtech Indonesia')).toBeDefined();
    expect(screen.getByText('Beranda')).toBeDefined();
    expect(screen.getByText('Produk')).toBeDefined();
    expect(screen.getByText('Simulasi')).toBeDefined();
    expect(screen.getByText('Pendaftaran')).toBeDefined();
  });

  it('toggles dropdown and dark backdrop on clicking Pendaftaran button', async () => {
    render(<HeaderNav currentPath="/" initialProducts={mockProducts} />);

    const menuButton = screen.getByRole('button', { name: /pendaftaran/i });
    expect(screen.queryByText('PILIH PRODUK ASURANSI UNTUK DAFTAR')).toBeNull();

    // Open dropdown
    fireEvent.click(menuButton);
    expect(screen.getByText('PILIH PRODUK ASURANSI UNTUK DAFTAR')).toBeDefined();
    expect(screen.getByTestId('navbar-backdrop')).toBeDefined();
    expect(screen.getByText('Secure Life Plus')).toBeDefined();
    expect(screen.getByText('Flexi Critical Care')).toBeDefined();

    // Close on backdrop click
    fireEvent.click(screen.getByTestId('navbar-backdrop'));
    expect(screen.queryByText('PILIH PRODUK ASURANSI UNTUK DAFTAR')).toBeNull();
  });

  it('closes dropdown when pressing Escape key', async () => {
    render(<HeaderNav currentPath="/" initialProducts={mockProducts} />);

    const menuButton = screen.getByRole('button', { name: /pendaftaran/i });
    fireEvent.click(menuButton);
    expect(screen.getByText('PILIH PRODUK ASURANSI UNTUK DAFTAR')).toBeDefined();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByText('PILIH PRODUK ASURANSI UNTUK DAFTAR')).toBeNull();
  });

  it('renders product links pointing to /apply with productId query param', () => {
    render(<HeaderNav currentPath="/" initialProducts={mockProducts} />);

    const menuButton = screen.getByRole('button', { name: /pendaftaran/i });
    fireEvent.click(menuButton);

    const applyLinks = screen.getAllByRole('link', { name: /daftar →/i });
    expect(applyLinks.length).toBe(2);
    expect(applyLinks[0].getAttribute('href')).toBe('/apply?productId=secure-life-plus');
    expect(applyLinks[1].getAttribute('href')).toBe('/apply?productId=flexi-critical-care');
  });

  it('fetches products dynamically from /api/products when initialProducts is not provided', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      json: async () => ({ data: mockProducts }),
    });
    global.fetch = fetchSpy as any;

    render(<HeaderNav currentPath="/" />);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    });

    const menuButton = screen.getByRole('button', { name: /pendaftaran/i });
    fireEvent.click(menuButton);

    expect(screen.getByText('Secure Life Plus')).toBeDefined();
  });

  it('renders continuous spinner and no fallback cards when unable to connect to Core API', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      json: async () => ({ data: [] }),
    });
    global.fetch = fetchSpy as any;

    render(<HeaderNav currentPath="/" />);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    });

    const menuButton = screen.getByRole('button', { name: /pendaftaran/i });
    fireEvent.click(menuButton);

    // Assert continuous spinner is active
    expect(screen.getByTestId('core-api-spinner')).toBeDefined();
    expect(screen.getByText('Menghubungkan ke Core API...')).toBeDefined();

    // Assert strictly NO hardcoded fallback cards
    expect(screen.queryByText('Secure Life Plus')).toBeNull();
    expect(screen.queryByText('Flexi Critical Care')).toBeNull();
    expect(screen.queryByText('AutoShield Prime')).toBeNull();
  });
});
