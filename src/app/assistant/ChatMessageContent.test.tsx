import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatMessageContent, formatInlineMarkdown } from './ChatMessageContent';

describe('ChatMessageContent', () => {
  it('renders inline bold, italic, inline code, and links correctly', () => {
    const text = 'Halo **Nasabah**, ini _proteksi_ dengan kode `POL-999` dan [Katalog Produk](/products).';
    render(<ChatMessageContent content={text} />);

    // Bold
    const boldEl = screen.getByText('Nasabah');
    expect(boldEl.tagName).toBe('STRONG');

    // Italic
    const italicEl = screen.getByText('proteksi');
    expect(italicEl.tagName).toBe('EM');

    // Code
    const codeEl = screen.getByText('POL-999');
    expect(codeEl.tagName).toBe('CODE');

    // Link
    const linkEl = screen.getByRole('link', { name: 'Katalog Produk' });
    expect(linkEl.getAttribute('href')).toBe('/products');
  });

  it('renders external links with target="_blank" and rel attributes', () => {
    const text = 'Kunjungi [Situs OJK](https://ojk.go.id) untuk info regulasi.';
    render(<ChatMessageContent content={text} />);

    const linkEl = screen.getByRole('link', { name: /Situs OJK/i });
    expect(linkEl.getAttribute('href')).toBe('https://ojk.go.id');
    expect(linkEl.getAttribute('target')).toBe('_blank');
    expect(linkEl.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('renders headings (H1, H2, H3) with proper typography', () => {
    const markdown = `# Judul Utama\n## Sub Judul\n### Poin Detail`;
    render(<ChatMessageContent content={markdown} />);

    expect(screen.getByRole('heading', { level: 3, name: 'Judul Utama' })).toBeDefined();
    expect(screen.getByRole('heading', { level: 4, name: 'Sub Judul' })).toBeDefined();
    expect(screen.getByRole('heading', { level: 5, name: 'Poin Detail' })).toBeDefined();
  });

  it('renders styled numbered lists with order badges', () => {
    const markdown = `1. **Pilih Produk**: Tentukan jenis asuransi.\n2. **Isi Data**: Lengkapi identitas dan kuesioner.\n3. **Verifikasi**: Tunggu underwriting.`;
    render(<ChatMessageContent content={markdown} />);

    expect(screen.getByText('1')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByText('Pilih Produk')).toBeDefined();
  });

  it('renders bullet lists with modern styling', () => {
    const markdown = `- Manfaat Rawat Inap\n* Santunan Tunai Harian\n• Penggantian Obat`;
    render(<ChatMessageContent content={markdown} />);

    expect(screen.getByText('Manfaat Rawat Inap')).toBeDefined();
    expect(screen.getByText('Santunan Tunai Harian')).toBeDefined();
    expect(screen.getByText('Penggantian Obat')).toBeDefined();
  });

  it('renders markdown tables with headers and rows properly', () => {
    const markdown = `
| Produk | Kategori | Uang Pertanggungan |
| --- | --- | --- |
| Jiwa Berjangka | Jiwa | Rp 500 Juta |
| Mobil Prima | Kendaraan | Rp 250 Juta |
`;
    render(<ChatMessageContent content={markdown} />);

    expect(screen.getByRole('table')).toBeDefined();
    expect(screen.getByText('Produk')).toBeDefined();
    expect(screen.getByText('Kategori')).toBeDefined();
    expect(screen.getByText('Uang Pertanggungan')).toBeDefined();
    expect(screen.getByText('Jiwa Berjangka')).toBeDefined();
    expect(screen.getByText('Mobil Prima')).toBeDefined();
  });

  it('renders blockquotes as styled callouts', () => {
    const markdown = `> **Catatan OJK**: Polis asuransi resmi tunduk pada regulasi POJK No. 23/2015.`;
    render(<ChatMessageContent content={markdown} />);

    expect(screen.getByText(/Polis asuransi resmi tunduk pada regulasi POJK/i)).toBeDefined();
  });

  it('renders horizontal divider rule', () => {
    const markdown = `Poin A\n---\nPoin B`;
    const { container } = render(<ChatMessageContent content={markdown} />);

    expect(container.querySelector('hr')).toBeDefined();
    expect(screen.getByText('Poin A')).toBeDefined();
    expect(screen.getByText('Poin B')).toBeDefined();
  });

  it('renders code blocks properly', () => {
    const markdown = "Berikut kode simulasi:\n```json\n{\"product\": \"life\", \"premium\": 150000}\n```";
    render(<ChatMessageContent content={markdown} />);

    expect(screen.getByText(/json/i)).toBeDefined();
    expect(screen.getByText(/\"product\": \"life\"/i)).toBeDefined();
  });

  it('transforms embedded raw JSON product list into interactive product cards', () => {
    const mixedContent = `Berikut adalah produk yang tersedia:
[
  {
    "name": "Asuransi Jiwa Berjangka Plus",
    "category": "life",
    "description": "Perlindungan finansial terbaik untuk keluarga tercinta.",
    "slug": "jiwa-berjangka-plus",
    "min_sum_assured": 100000000,
    "max_sum_assured": 5000000000,
    "min_payment_term": 5,
    "max_payment_term": 20
  }
]
Silakan pilih produk untuk memulai simulasi.`;

    render(<ChatMessageContent content={mixedContent} />);

    expect(screen.getByText(/Rekomendasi Produk Terverifikasi OJK:/i)).toBeDefined();
    expect(screen.getByText(/1. Asuransi Jiwa Berjangka Plus/i)).toBeDefined();
    expect(screen.getByText(/LIFE/i)).toBeDefined();
    expect(screen.getByText(/Perlindungan finansial terbaik/i)).toBeDefined();
    expect(screen.getByText(/UP: Rp 100.000.000 - Rp 5.000.000.000/i)).toBeDefined();

    const simLink = screen.getByRole('link', { name: /Simulasi Premi →/i });
    expect(simLink.getAttribute('href')).toBe('/simulation?product=jiwa-berjangka-plus');
  });

  it('returns null safely for empty or null content', () => {
    const { container } = render(<ChatMessageContent content="" />);
    expect(container.firstChild).toBeNull();
  });
});
