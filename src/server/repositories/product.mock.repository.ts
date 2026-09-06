import {
  IProductRepository,
  InsuranceProduct,
  ProductCategoryKey,
} from './product.repository.interface';

export class ProductMockRepository implements IProductRepository {
  private products: InsuranceProduct[] = [
    {
      id: 'prod-term-life',
      categoryKey: 'life',
      category: 'Asuransi Jiwa Berjangka',
      title: 'Term Life Guard Plus',
      description: 'Proteksi finansial komprehensif tanpa kerumitan medis dengan klaim automated underwriting instan.',
      startingPrice: 'Rp 150.000 / bln',
      coverageAmount: 'Hingga Rp 2.500.000.000',
      coverageTerm: '5, 10, atau 20 Tahun',
      badge: 'Paling Populer',
      badgeVariant: 'emerald',
      features: [
        'Proteksi finansial keluarga tanpa jeda tunggu',
        'Tanpa perlu medical check-up hingga Rp 1 Miliar',
        'Penerbitan e-Policy otomatis dalam hitungan menit',
      ],
      isPopular: true,
      isFeatured: true,
      baseRate: 0.0035,
      minAge: 18,
      maxAge: 60,
      minSumAssured: 100_000_000,
      maxSumAssured: 2_500_000_000,
    },
    {
      id: 'prod-critical-illness',
      categoryKey: 'critical_illness',
      category: 'Penyakit Kritis',
      title: 'Critical Illness Shield',
      description: 'Santunan tunai 100% saat terdiagnosis kondisi kritis tahap awal untuk perlindungan kemandirian finansial.',
      startingPrice: 'Rp 220.000 / bln',
      coverageAmount: 'Hingga Rp 1.500.000.000',
      coverageTerm: 'Hingga Usia 65 Tahun',
      badge: 'Solusi Medis',
      badgeVariant: 'blue',
      features: [
        'Santunan tunai 100% saat diagnosis tahap awal',
        'Melindungi dari 50+ kondisi kritis utama',
        'Dukungan klaim cashless di 250+ RS rekanan',
      ],
      isPopular: false,
      isFeatured: true,
      baseRate: 0.0048,
      minAge: 21,
      maxAge: 55,
      minSumAssured: 100_000_000,
      maxSumAssured: 1_500_000_000,
    },
    {
      id: 'prod-educare',
      categoryKey: 'education',
      category: 'Dana Pendidikan',
      title: 'EduCare Future',
      description: 'Jaminan kepastian dana kuliah anak dan pembebasan premi otomatis jika risiko tutup usia terjadi.',
      startingPrice: 'Rp 300.000 / bln',
      coverageAmount: 'Hingga Rp 1.000.000.000',
      coverageTerm: 'Hingga Anak Usia 22 Tahun',
      badge: 'Keluarga & Anak',
      badgeVariant: 'purple',
      features: [
        'Jaminan kelangsungan jenjang pendidikan sarjana',
        'Pembebasan premi jika orang tua tutup usia',
        'Tahapan dana pasti sesuai kalender akademik',
      ],
      isPopular: false,
      isFeatured: true,
      baseRate: 0.0042,
      minAge: 21,
      maxAge: 50,
      minSumAssured: 50_000_000,
      maxSumAssured: 1_000_000_000,
    },
    {
      id: 'prod-healthcare-prime',
      categoryKey: 'health',
      category: 'Asuransi Kesehatan Murni',
      title: 'HealthCare Prime Cashless',
      description: 'Penggantian biaya rawat inap sesuai tagihan (as-charged) dengan kartu digital cashless di seluruh Indonesia.',
      startingPrice: 'Rp 350.000 / bln',
      coverageAmount: 'Limit Rp 5.000.000.000 / thn',
      coverageTerm: 'Tahunan (Dapat Diperpanjang)',
      badge: 'Kesehatan Prima',
      badgeVariant: 'amber',
      features: [
        'Kamar privat 1 bed dengan sistem cashless',
        'Termasuk biaya pengobatan kanker & cuci darah',
        'Tidak ada batasan tahunan kunjungan dokter spesialis',
      ],
      isPopular: false,
      isFeatured: false,
      baseRate: 0.0055,
      minAge: 1,
      maxAge: 65,
      minSumAssured: 500_000_000,
      maxSumAssured: 5_000_000_000,
    },
  ];

  async getFeaturedProducts(): Promise<InsuranceProduct[]> {
    const featured = this.products.filter((p) => p.isFeatured);
    return Promise.resolve(structuredClone(featured));
  }

  async getProducts(categoryKey?: ProductCategoryKey | 'all'): Promise<InsuranceProduct[]> {
    let result = this.products;
    if (categoryKey && categoryKey !== 'all') {
      result = result.filter((p) => p.categoryKey === categoryKey);
    }
    return Promise.resolve(structuredClone(result));
  }

  async getProductById(id: string): Promise<InsuranceProduct | null> {
    const product = this.products.find((p) => p.id === id);
    if (!product) {
      return Promise.resolve(null);
    }
    return Promise.resolve(structuredClone(product));
  }
}
