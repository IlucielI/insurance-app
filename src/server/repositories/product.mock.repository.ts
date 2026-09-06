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
      waitingPeriodDays: 0,
      claimMethod: 'instant_transfer',
      underwritingNote: 'Verifikasi KTP Dukcapil & DSR finansial otomatis < 15 menit.',
      benefitsDetailed: [
        {
          title: 'Santunan Meninggal Dunia 100%',
          description: 'Pembayaran tunai 100% Uang Pertanggungan langsung ke rekening ahli waris yang ditunjuk.',
        },
        {
          title: 'Santunan Kecelakaan Ganda (Double Indemnity)',
          description: 'Tambahan 100% uang pertanggungan jika terjadi risiko akibat kecelakaan transportasi umum.',
        },
        {
          title: 'Bebas Biaya Administrasi Klaim',
          description: 'Proses klaim digital tanpa potongan biaya administrasi maupun provisi polis.',
        },
      ],
      riders: [
        {
          id: 'rider-accidental-death',
          name: 'Accidental Death & Dismemberment',
          extraPrice: 'Rp 35.000 / bln',
          description: 'Santunan cacat tetap total atau meninggal akibat musibah kecelakaan.',
        },
        {
          id: 'rider-terminal-illness',
          name: 'Terminal Illness Early Payout',
          extraPrice: 'Rp 25.000 / bln',
          description: 'Akselerasi pencairan 50% dana pertanggungan jika terdiagnosa penyakit terminal.',
        },
      ],
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
      waitingPeriodDays: 90,
      claimMethod: 'instant_transfer',
      underwritingNote: 'Kuesioner riwayat medis cerdas tanpa MCU untuk nasabah non-perokok.',
      benefitsDetailed: [
        {
          title: 'Perlindungan Kanker & Tumor Stadium Awal',
          description: 'Pencairan 50% santunan tunai pada diagnosis karsinoma in situ tanpa menunggu stadium lanjut.',
        },
        {
          title: 'Santunan Stroke & Serangan Jantung',
          description: 'Santunan tunai penuh tanpa kewajiban melampirkan kuitansi tagihan rumah sakit.',
        },
        {
          title: 'Second Medical Opinion Internasional',
          description: 'Konsultasi opini medis kedua gratis dari jaringan rumah sakit terkemuka di Singapura & Korea.',
        },
      ],
      riders: [
        {
          id: 'rider-cancer-booster',
          name: 'Cancer Protection Booster',
          extraPrice: 'Rp 45.000 / bln',
          description: 'Tambahan santunan 50% khusus untuk seluruh jenis terapi kanker terarah.',
        },
      ],
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
      waitingPeriodDays: 30,
      claimMethod: 'instant_transfer',
      underwritingNote: 'Penyelarasan profil orang tua sebagai pemegang polis dan anak sebagai tertanggung.',
      benefitsDetailed: [
        {
          title: 'Tahapan Dana Pasti Per Semester',
          description: 'Pencairan terjadwal saat anak memasuki jenjang SMP, SMA, dan Perguruan Tinggi.',
        },
        {
          title: 'Waiver of Premium (Bebas Premi)',
          description: 'Jika orang tua meninggal atau cacat tetap, seluruh sisa premi dibebaskan dan dana pendidikan tetap cair.',
        },
      ],
      riders: [
        {
          id: 'rider-scholarship-topup',
          name: 'Academic Excellence Incentive',
          extraPrice: 'Rp 20.000 / bln',
          description: 'Bonus tunai 10% jika anak lulus universitas dengan predikat cum laude.',
        },
      ],
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
      waitingPeriodDays: 30,
      claimMethod: 'cashless',
      underwritingNote: 'Prioritas akses rawat inap privat VIP dengan garansi verifikasi 30 menit.',
      benefitsDetailed: [
        {
          title: 'Rawat Inap Privat As-Charged',
          description: 'Kamar 1 pasien dengan fasilitas kamar mandi dalam, biaya dokter, dan obat-obatan sesuai tagihan.',
        },
        {
          title: 'Perawatan Kemoterapi & Hemodialisis',
          description: 'Proteksi tindakan kemoterapi modern, imunoterapi, dan cuci darah rawat jalan.',
        },
      ],
      riders: [
        {
          id: 'rider-dental-vision',
          name: 'Dental & Vision Wellness',
          extraPrice: 'Rp 80.000 / bln',
          description: 'Pemeriksaan gigi berkala, tambal gigi, dan subsidi kacamata tahunan.',
        },
      ],
    },
    {
      id: 'prod-senior-care',
      categoryKey: 'life',
      category: 'Asuransi Jiwa Berjangka',
      title: 'Senior Heritage Life',
      description: 'Perlindungan warisan masa tua khusus nasabah senior tanpa syarat cek kesehatan yang memberatkan.',
      startingPrice: 'Rp 280.000 / bln',
      coverageAmount: 'Hingga Rp 750.000.000',
      coverageTerm: 'Hingga Usia 80 Tahun',
      badge: 'Senior 50+',
      badgeVariant: 'slate',
      features: [
        'Diterima pasti tanpa seleksi medis berat',
        'Santunan duka cita & pemakaman instan 24 jam',
        'Pengalihan warisan bebas pajak penghasilan',
      ],
      isPopular: false,
      isFeatured: false,
      baseRate: 0.0062,
      minAge: 50,
      maxAge: 75,
      minSumAssured: 50_000_000,
      maxSumAssured: 750_000_000,
      waitingPeriodDays: 0,
      claimMethod: 'instant_transfer',
      underwritingNote: 'Underwriting simplified issue khusus pendaftar usia perak & emas.',
      benefitsDetailed: [
        {
          title: 'Santunan Duka Cita Seketika',
          description: 'Pencairan 20% dalam 24 jam setelah pengajuan surat kematian untuk kebutuhan mendesak.',
        },
        {
          title: 'Perlindungan Warisan Bebas Pajak',
          description: 'Uang pertanggungan dicairkan utuh kepada penerima manfaat tanpa potongan pajak.',
        },
      ],
      riders: [],
    },
    {
      id: 'prod-family-hospital',
      categoryKey: 'health',
      category: 'Asuransi Kesehatan Murni',
      title: 'Family Hospital Protection',
      description: 'Satu polis perlindungan komprehensif untuk seluruh anggota keluarga (Ayah, Ibu, dan hingga 3 Anak).',
      startingPrice: 'Rp 500.000 / bln',
      coverageAmount: 'Limit Rp 10.000.000.000 / thn',
      coverageTerm: 'Tahunan (Dapat Diperpanjang)',
      badge: 'Paket Keluarga',
      badgeVariant: 'blue',
      features: [
        'Diskon premi keluarga hingga 20%',
        'Limit tahunan bersama (shared family pool)',
        'Fasilitas klaim cashless nasional & regional ASEAN',
      ],
      isPopular: false,
      isFeatured: false,
      baseRate: 0.0058,
      minAge: 1,
      maxAge: 60,
      minSumAssured: 1_000_000_000,
      maxSumAssured: 10_000_000_000,
      waitingPeriodDays: 30,
      claimMethod: 'cashless',
      underwritingNote: 'Pendaftaran kolektif satu Kartu Keluarga (KK) dengan simplifikasi dokumen.',
      benefitsDetailed: [
        {
          title: 'Shared Limit Fleksibel',
          description: 'Plafon limit tahunan Rp 10 Miliar dapat digunakan secara fleksibel oleh siapapun anggota keluarga.',
        },
        {
          title: 'Evakuasi Medis Darurat Internasional',
          description: 'Layanan ambulans udara dan repatriasi medis lintas negara tanpa biaya tambahan.',
        },
      ],
      riders: [
        {
          id: 'rider-maternity',
          name: 'Maternity & Newborn Care',
          extraPrice: 'Rp 150.000 / bln',
          description: 'Proteksi biaya persalinan normal/caesar dan perawatan inkubator bayi baru lahir.',
        },
      ],
    },
  ];

  async getFeaturedProducts(): Promise<InsuranceProduct[]> {
    const featured = this.products.filter((p) => p.isFeatured);
    return Promise.resolve(structuredClone(featured));
  }

  async getProducts(
    categoryKey?: ProductCategoryKey | 'all',
    search?: string
  ): Promise<InsuranceProduct[]> {
    let result = this.products;

    if (categoryKey && categoryKey !== 'all') {
      result = result.filter((p) => p.categoryKey === categoryKey);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.features.some((f) => f.toLowerCase().includes(q))
      );
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
