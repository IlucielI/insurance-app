import {
  IProductRepository,
  InsuranceProduct,
  ProductCategoryKey,
  ProductPricingRuleDTO,
  ProductQuestionDTO,
  ProductQuestionnaireDTO,
  QuoteCalculationRequest,
  QuoteCalculationResult,
} from './product.repository.interface';


export class ProductMockRepository implements IProductRepository {
  private products: InsuranceProduct[] = [
    {
      id: 'prod-term-life',
      slug: 'prod-term-life',
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
      minTermYears: 5,
      maxTermYears: 20,
      ageFactors: [
        { minAge: 18, maxAge: 30, factor: 1.0 },
        { minAge: 31, maxAge: 40, factor: 1.25 },
        { minAge: 41, maxAge: 50, factor: 1.75 },
        { minAge: 51, maxAge: 60, factor: 2.5 },
      ],
      sumAssuredPresets: [100_000_000, 250_000_000, 500_000_000, 1_000_000_000],
      termPresets: [5, 10, 15, 20],
      genderFactors: { male: 1.05, female: 1.0 },
      smokerFactors: { yes: 1.35, no: 1.0 },
      occupationFactors: { low: 0.95, standard: 1.0, high: 1.4 },
      healthFactors: { low: 1.0, medium: 1.25, high: 1.75 },
      frequencyLoading: { annual: 1.0, semi_annual: 1.02, quarterly: 1.035, monthly: 1.06 },
      exclusions: [
        'Klaim terindikasi pemalsuan data identitas (fraudulent claims)',
        'Kondisi kesehatan pra-eksisting dalam masa tunggu',
        'Kematian akibat tindakan melanggar hukum atau kejahatan terencana',
      ],
    },
    {
      id: 'prod-critical-illness',
      slug: 'prod-critical-illness',
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
      slug: 'prod-educare',
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
        'Dana tahapan pendidikan terjamin saat anak masuk PTN/PTS',
        'Gratis premi berkelanjutan jika orang tua wafat',
        'Bonus loyalitas kelulusan sarjana tepat waktu',
      ],
      isPopular: false,
      isFeatured: true,
      baseRate: 0.0042,
      minAge: 20,
      maxAge: 50,
      minSumAssured: 100_000_000,
      maxSumAssured: 1_000_000_000,
      waitingPeriodDays: 60,
      claimMethod: 'instant_transfer',
      underwritingNote: 'Verifikasi instan akta kelahiran anak & KTP penanggung otomatis.',
      benefitsDetailed: [
        {
          title: 'Tahapan Pencairan Uang Kuliah Pasti',
          description: 'Pencairan terencana saat anak berusia 18, 19, 20, dan 21 tahun untuk biaya semester kuliah.',
        },
        {
          title: 'Waiver of Premium Total',
          description: 'Seluruh sisa premi hingga anak berusia 22 tahun dibayarkan penuh oleh asuransi.',
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
      slug: 'prod-healthcare-prime',
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
      slug: 'prod-senior-care',
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
      slug: 'prod-family-hospital',
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

  async getProductBySlug(slug: string): Promise<InsuranceProduct | null> {
    const s = slug.trim().toLowerCase();
    const product = this.products.find(
      (p) => p.slug.toLowerCase() === s || p.id.toLowerCase() === s
    );
    if (!product) {
      return Promise.resolve(null);
    }
    return Promise.resolve(structuredClone(product));
  }

  async getProductById(id: string): Promise<InsuranceProduct | null> {
    return this.getProductBySlug(id);
  }

  async calculateQuote(
    slug: string,
    request: QuoteCalculationRequest
  ): Promise<QuoteCalculationResult> {
    const product = await this.getProductBySlug(slug);
    if (!product) {
      throw new Error(`Product not found with slug ${slug}`);
    }

    const baseRate = product.baseRate || 0.0035;
    const ageFactor = Number((1 + Math.max(0, (request.age - 20) * 0.025)).toFixed(3));
    const genderFactor =
      product.genderFactors?.[request.gender] ?? (request.gender === 'male' ? 1.05 : 1.0);
    const smokerKey =
      request.smoker ||
      (request.answers?.find((a) => a.rule_code === 'is_smoker' || a.rule_code === 'smoker')
        ?.value === 'yes'
        ? 'yes'
        : 'no');
    const smokerFactor =
      product.smokerFactors?.[smokerKey] ?? (smokerKey === 'yes' ? 1.35 : 1.0);

    const occKey =
      request.occupation_class ||
      (request.answers?.find((a) => a.rule_code === 'occupation_class')?.value as
        | 'low'
        | 'standard'
        | 'high'
        | undefined) ||
      'standard';
    const occupationFactor =
      product.occupationFactors?.[occKey] ??
      (occKey === 'low'
        ? 0.95
        : occKey === 'high'
        ? 1.4
        : 1.0);

    const healthFactor =
      product.healthFactors?.[request.health_risk || 'low'] ??
      (request.health_risk === 'high'
        ? 1.5
        : request.health_risk === 'medium'
        ? 1.2
        : 1.0);
    const termDelta = Math.max(0, request.payment_term - (product.minTermYears || 5));
    const termFactor = 1 + termDelta * 0.01;

    let frequencyDivisor = 12;
    let frequencyLoading = product.frequencyLoading?.monthly ?? 1.1;
    if (request.payment_frequency === 'annual') {
      frequencyDivisor = 1;
      frequencyLoading = product.frequencyLoading?.annual ?? 1.0;
    } else if (request.payment_frequency === 'semi_annual') {
      frequencyDivisor = 2;
      frequencyLoading = product.frequencyLoading?.semi_annual ?? 1.03;
    } else if (request.payment_frequency === 'quarterly') {
      frequencyDivisor = 4;
      frequencyLoading = product.frequencyLoading?.quarterly ?? 1.06;
    }

    const rawAnnual =
      request.sum_assured *
      baseRate *
      ageFactor *
      genderFactor *
      smokerFactor *
      occupationFactor *
      healthFactor *
      termFactor;

    const estimatedAnnual = Math.ceil(rawAnnual / 1000) * 1000;
    const estimatedPeriodic =
      Math.ceil(((rawAnnual / frequencyDivisor) * frequencyLoading) / 1000) * 1000;

    const factors: { rule_code: string; rule_name: string; factor: number }[] = [
      { rule_code: 'gender', rule_name: 'Faktor Jenis Kelamin', factor: genderFactor },
      { rule_code: 'smoker', rule_name: 'Faktor Status Merokok', factor: smokerFactor },
      { rule_code: 'occupation', rule_name: 'Faktor Tingkat Pekerjaan', factor: occupationFactor },
    ];

    return {
      product_id: product.id,
      product_name: product.title,
      product_slug: product.slug,
      currency: 'IDR',
      age: request.age,
      gender: request.gender,
      sum_assured: request.sum_assured,
      payment_term: request.payment_term,
      payment_frequency: request.payment_frequency,
      estimated_premium: estimatedPeriodic,
      estimated_annual_premium: estimatedAnnual,
      breakdown: {
        base_rate: baseRate,
        age_factor: ageFactor,
        gender_factor: genderFactor,
        smoker_factor: smokerFactor,
        occupation_factor: occupationFactor,
        health_factor: healthFactor,
        term_factor: termFactor,
        frequency_loading: frequencyLoading,
        factors,
      },
      notes: [
        'This is an indicative quote, not a final offer.',
        'Final premium may change after underwriting review.',
      ],
    };
  }

  async getPricingRules(slug: string): Promise<ProductPricingRuleDTO[]> {
    const product = await this.getProductBySlug(slug);
    if (!product) return [];
    return [
      {
        id: `pr_${slug}_gender`,
        product_id: product.id,
        rule_code: 'gender',
        rule_name: 'Faktor Jenis Kelamin',
        rule_type: 'multiplier_map',
        factors: product.genderFactors || { male: 1.05, female: 1.0 },
        is_active: true,
        order_index: 1,
      },
      {
        id: `pr_${slug}_smoker`,
        product_id: product.id,
        rule_code: 'is_smoker',
        rule_name: 'Faktor Status Merokok',
        rule_type: 'multiplier_map',
        factors: product.smokerFactors || { yes: 1.35, no: 1.0 },
        is_active: true,
        order_index: 2,
      },
      {
        id: `pr_${slug}_occupation`,
        product_id: product.id,
        rule_code: 'occupation_class',
        rule_name: 'Faktor Tingkat Risiko Pekerjaan',
        rule_type: 'multiplier_map',
        factors: product.occupationFactors || { low: 0.95, standard: 1.0, high: 1.4 },
        is_active: true,
        order_index: 3,
      },
    ];
  }

  async getQuestionnaire(slug: string): Promise<ProductQuestionnaireDTO | null> {
    const product = await this.getProductBySlug(slug);
    if (!product) return null;

    const isVehicle = product.categoryKey === 'vehicle';

    const questions: ProductQuestionDTO[] = isVehicle
      ? [
          {
            id: 'q_vehicle_usage',
            questionnaire_id: `quest_${slug}`,
            step_number: 1,
            pillar_type: 'risk_assessment',
            code: 'occupation_class',
            label: 'Penggunaan Utama Kendaraan',
            help_text: 'Tentukan intensitas dan keperluan operasional kendaraan',
            input_type: 'radio',
            order_index: 1,
            pricing_rule_id: `pr_${slug}_occupation`,
            affects_pricing_field: 'occupation_class',
            is_active: true,
            options: [
              { value: 'low', label: 'Pribadi / Komuter Santai', multiplier: 0.95 },
              { value: 'standard', label: 'Harian Operasional Kota', multiplier: 1.0 },
              { value: 'high', label: 'Komersial / Antar Barang Ekspedisi', multiplier: 1.15 },
            ],
          },
        ]
      : [
          {
            id: 'q_gender',
            questionnaire_id: `quest_${slug}`,
            step_number: 1,
            pillar_type: 'identity_verified',
            code: 'gender',
            label: 'Jenis Kelamin',
            input_type: 'radio',
            order_index: 1,
            pricing_rule_id: `pr_${slug}_gender`,
            affects_pricing_field: 'gender',
            is_active: true,
            options: [
              { value: 'male', label: 'Pria', multiplier: product.genderFactors?.male ?? 1.05 },
              { value: 'female', label: 'Wanita', multiplier: product.genderFactors?.female ?? 1.0 },
            ],
          },
          {
            id: 'q_is_smoker',
            questionnaire_id: `quest_${slug}`,
            step_number: 1,
            pillar_type: 'medical_history',
            code: 'is_smoker',
            label: 'Kebiasaan Merokok',
            help_text: 'Termasuk rokok konvensional maupun elektrik (vape)',
            input_type: 'radio',
            order_index: 2,
            pricing_rule_id: `pr_${slug}_smoker`,
            affects_pricing_field: 'smoker',
            is_active: true,
            options: [
              { value: 'no', label: 'Bukan Perokok', multiplier: product.smokerFactors?.no ?? 1.0 },
              { value: 'yes', label: 'Perokok Aktif', multiplier: product.smokerFactors?.yes ?? 1.35 },
            ],
          },
          {
            id: 'q_occupation_class',
            questionnaire_id: `quest_${slug}`,
            step_number: 1,
            pillar_type: 'financial_capacity',
            code: 'occupation_class',
            label: 'Tingkat Risiko Pekerjaan',
            input_type: 'radio',
            order_index: 3,
            pricing_rule_id: `pr_${slug}_occupation`,
            affects_pricing_field: 'occupation_class',
            is_active: true,
            options: [
              { value: 'low', label: 'Rendah (Kantor / Non-Fisik)', multiplier: product.occupationFactors?.low ?? 0.95 },
              { value: 'standard', label: 'Standar (Mobilitas Normal)', multiplier: product.occupationFactors?.standard ?? 1.0 },
              { value: 'high', label: 'Tinggi (Operasional Lapangan / Alat Berat)', multiplier: product.occupationFactors?.high ?? 1.4 },
            ],
          },
        ];

    return {
      id: `quest_${slug}`,
      product_id: product.id,
      category: product.categoryKey,
      title: `Formulir Pertanyaan Risiko ${product.title}`,
      description: 'Pertanyaan aktuaria penentu tarif premi',
      version: 1,
      is_active: true,
      questions,
    };
  }
}

