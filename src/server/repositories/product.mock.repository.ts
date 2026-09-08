import {
  IProductRepository,
  InsuranceProduct,
  ProductCategoryKey,
  ProductPricingRuleDTO,
  ProductQuestionDTO,
  ProductQuestionnaireDTO,
  QuestionnaireStepGroupDTO,
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

    const questions: ProductQuestionDTO[] = [
      // STEP 1: IDENTITAS DUKCAPIL
      {
        id: 'q_id_nik',
        questionnaire_id: `quest_${slug}`,
        step_number: 1,
        pillar_type: 'identity_verified',
        code: 'nik',
        label: 'Nomor Induk Kependudukan (NIK e-KTP)',
        help_text: '16 digit NIK tertera pada kartu e-KTP fisik Anda',
        input_type: 'text',
        placeholder: 'Contoh: 3174051208940003',
        order_index: 1,
        validation_rules: { required: true, min_length: 16, max_length: 16, pattern: '^[0-9]{16}$' },
        is_active: true,
      },
      {
        id: 'q_id_full_name',
        questionnaire_id: `quest_${slug}`,
        step_number: 1,
        pillar_type: 'identity_verified',
        code: 'full_name',
        label: 'Nama Lengkap (Sesuai e-KTP)',
        help_text: 'Nama lengkap nasabah tanpa singkatan gelar',
        input_type: 'text',
        placeholder: 'Contoh: Bayu Pratama Kusuma',
        order_index: 2,
        validation_rules: { required: true, min_length: 2, max_length: 120 },
        is_active: true,
      },
      {
        id: 'q_id_birth_date',
        questionnaire_id: `quest_${slug}`,
        step_number: 1,
        pillar_type: 'identity_verified',
        code: 'birth_date',
        label: 'Tanggal Lahir',
        help_text: 'Sesuai tanggal lahir pada e-KTP (usia 18 - 65 tahun)',
        input_type: 'date',
        order_index: 3,
        validation_rules: { required: true },
        is_active: true,
      },
      {
        id: 'q_id_gender',
        questionnaire_id: `quest_${slug}`,
        step_number: 1,
        pillar_type: 'identity_verified',
        code: 'gender',
        label: 'Jenis Kelamin',
        input_type: 'radio',
        order_index: 4,
        pricing_rule_id: `pr_${slug}_gender`,
        affects_pricing_field: 'gender',
        validation_rules: { required: true },
        is_active: true,
        options: [
          { value: 'male', label: 'Pria', multiplier: product.genderFactors?.male ?? 1.05 },
          { value: 'female', label: 'Wanita', multiplier: product.genderFactors?.female ?? 1.0 },
        ],
      },
      {
        id: 'q_id_phone',
        questionnaire_id: `quest_${slug}`,
        step_number: 1,
        pillar_type: 'identity_verified',
        code: 'phone',
        label: 'Nomor WhatsApp / Seluler Aktif',
        help_text: 'Untuk pengiriman notifikasi polis & autentikasi',
        input_type: 'text',
        placeholder: 'Contoh: 081234567890',
        order_index: 5,
        validation_rules: { required: true, min_length: 7, max_length: 32, pattern: '^[0-9+ ]{7,32}$' },
        is_active: true,
      },
      {
        id: 'q_id_email',
        questionnaire_id: `quest_${slug}`,
        step_number: 1,
        pillar_type: 'identity_verified',
        code: 'email',
        label: 'Alamat Email Korespondensi',
        help_text: 'Dokumen e-Policy resmi akan dikirimkan ke alamat email ini',
        input_type: 'text',
        placeholder: 'nama@domain.com',
        order_index: 6,
        validation_rules: { required: true, format: 'email' },
        is_active: true,
      },

      // STEP 2: FINANSIAL & PEKERJAAN
      {
        id: 'q_fin_occupation',
        questionnaire_id: `quest_${slug}`,
        step_number: 2,
        pillar_type: 'income_verified',
        code: 'occupation',
        label: 'Pekerjaan / Bidang Profesi',
        help_text: 'Profesi utama sumber penghasilan rutin',
        input_type: 'text',
        placeholder: 'Contoh: Software Architect / IT Specialist',
        order_index: 1,
        validation_rules: { required: true, min_length: 2 },
        is_active: true,
      },
      {
        id: 'q_fin_occupation_class',
        questionnaire_id: `quest_${slug}`,
        step_number: 2,
        pillar_type: 'income_verified',
        code: 'occupation_class',
        label: 'Kategori Risiko Pekerjaan',
        help_text: 'Klasifikasi risiko lingkungan kerja sesuai aktuaria',
        input_type: 'select',
        order_index: 2,
        pricing_rule_id: `pr_${slug}_occupation`,
        affects_pricing_field: 'occupation_class',
        validation_rules: { required: true },
        is_active: true,
        options: [
          { value: 'low', label: 'Rendah (Pekerjaan Kantor / Non-Fisik)', multiplier: product.occupationFactors?.low ?? 0.95 },
          { value: 'standard', label: 'Standar (Mobilitas Normal / Supervisi Lapangan)', multiplier: product.occupationFactors?.standard ?? 1.0 },
          { value: 'high', label: 'Tinggi (Operasional Alat Berat / Tambang / Pabrik)', multiplier: product.occupationFactors?.high ?? 1.25 },
        ],
      },
      {
        id: 'q_fin_monthly_income',
        questionnaire_id: `quest_${slug}`,
        step_number: 2,
        pillar_type: 'income_verified',
        code: 'monthly_income',
        label: 'Penghasilan Tetap Bulanan (Rp)',
        help_text: 'Pendapatan rutin per bulan untuk dasar perhitungan Debt Service Ratio (DSR)',
        input_type: 'currency',
        placeholder: '15000000',
        order_index: 3,
        validation_rules: { required: true, min: 1000000 },
        is_active: true,
      },
      {
        id: 'q_fin_company_name',
        questionnaire_id: `quest_${slug}`,
        step_number: 2,
        pillar_type: 'income_verified',
        code: 'company_name',
        label: 'Nama Perusahaan / Institusi',
        help_text: 'Nama tempat Anda bekerja saat ini',
        input_type: 'text',
        placeholder: 'Contoh: PT Teknologi Bangsa Indonesia',
        order_index: 4,
        validation_rules: { required: true },
        is_active: true,
      },

      // STEP 3: SKRINING MEDIS / RISIKO OBJEK
      ...(isVehicle
        ? [
            {
              id: 'q_vehicle_usage',
              questionnaire_id: `quest_${slug}`,
              step_number: 3,
              pillar_type: 'medical_required',
              code: 'occupation_class',
              label: 'Penggunaan Utama Kendaraan',
              help_text: 'Tentukan intensitas dan keperluan operasional kendaraan',
              input_type: 'radio',
              order_index: 1,
              pricing_rule_id: `pr_${slug}_occupation`,
              affects_pricing_field: 'occupation_class',
              is_active: true,
              validation_rules: { required: true },
              options: [
                { value: 'low', label: 'Pribadi / Komuter Santai', multiplier: 0.95 },
                { value: 'standard', label: 'Harian Operasional Kota', multiplier: 1.0 },
                { value: 'high', label: 'Komersial / Antar Barang Ekspedisi', multiplier: 1.15 },
              ],
            },
            {
              id: 'q_vehicle_plate',
              questionnaire_id: `quest_${slug}`,
              step_number: 3,
              pillar_type: 'medical_required',
              code: 'vehicle_plate',
              label: 'Nomor Plat Polisi Kendaraan',
              help_text: 'Contoh: B 1234 ABC',
              input_type: 'text',
              placeholder: 'B 1234 ABC',
              order_index: 2,
              validation_rules: { required: true },
              is_active: true,
            },
          ]
        : [
            {
              id: 'q_med_weight',
              questionnaire_id: `quest_${slug}`,
              step_number: 3,
              pillar_type: 'medical_required',
              code: 'weight_kg',
              label: 'Berat Badan (kg)',
              input_type: 'number',
              placeholder: '68',
              order_index: 1,
              validation_rules: { required: true, min: 30, max: 250 },
              is_active: true,
            },
            {
              id: 'q_med_height',
              questionnaire_id: `quest_${slug}`,
              step_number: 3,
              pillar_type: 'medical_required',
              code: 'height_cm',
              label: 'Tinggi Badan (cm)',
              input_type: 'number',
              placeholder: '175',
              order_index: 2,
              validation_rules: { required: true, min: 100, max: 250 },
              is_active: true,
            },
            {
              id: 'q_med_smoker',
              questionnaire_id: `quest_${slug}`,
              step_number: 3,
              pillar_type: 'medical_required',
              code: 'is_smoker',
              label: 'Kebiasaan Merokok & Tembakau',
              help_text: 'Termasuk rokok konvensional maupun elektrik (vape) 12 bulan terakhir',
              input_type: 'radio',
              order_index: 3,
              pricing_rule_id: `pr_${slug}_smoker`,
              affects_pricing_field: 'smoker',
              validation_rules: { required: true },
              is_active: true,
              options: [
                { value: 'no', label: 'Bukan Perokok', multiplier: product.smokerFactors?.no ?? 1.0 },
                { value: 'yes', label: 'Perokok Aktif', multiplier: product.smokerFactors?.yes ?? 1.35 },
              ],
            },
            {
              id: 'q_med_critical_illness',
              questionnaire_id: `quest_${slug}`,
              step_number: 3,
              pillar_type: 'medical_required',
              code: 'has_critical_illness',
              label: 'Riwayat Penyakit Kritis',
              help_text: 'Pernahkah didiagnosis kanker, jantung, stroke, ginjal, atau diabetes?',
              input_type: 'radio',
              order_index: 4,
              pricing_rule_id: 'pr_life_critical_illness',
              affects_pricing_field: 'critical_illness',
              validation_rules: { required: true },
              is_active: true,
              options: [
                { value: 'no', label: 'Tidak Pernah', multiplier: 1.0 },
                { value: 'yes', label: 'Pernah', multiplier: 1.30, risk_impact: 'high', rfi_required: true },
              ],
            },
            {
              id: 'q_med_critical_illness_details',
              questionnaire_id: `quest_${slug}`,
              step_number: 3,
              pillar_type: 'medical_required',
              code: 'critical_illness_details',
              label: 'Rincian Riwayat Penyakit Kritis',
              help_text: 'Sebutkan nama penyakit, tahun diagnosa, dan penanganan medis yang dilakukan',
              input_type: 'text',
              placeholder: 'Contoh: Diabetes tipe 2 terkontrol tahun 2023',
              order_index: 5,
              parent_question_id: 'q_med_critical_illness',
              show_if_parent_value: 'yes',
              validation_rules: { required: true, min_length: 5 },
              is_active: true,
            },
            {
              id: 'q_med_hospitalization',
              questionnaire_id: `quest_${slug}`,
              step_number: 3,
              pillar_type: 'medical_required',
              code: 'has_hospitalization_2y',
              label: 'Riwayat Rawat Inap (Opname) 2 Tahun Terakhir',
              help_text: 'Apakah pernah menjalani rawat inap di rumah sakit dalam 24 bulan terakhir?',
              input_type: 'radio',
              order_index: 6,
              pricing_rule_id: 'pr_life_hospitalization',
              affects_pricing_field: 'hospitalization',
              validation_rules: { required: true },
              is_active: true,
              options: [
                { value: 'no', label: 'Tidak Pernah', multiplier: 1.0 },
                { value: 'yes', label: 'Pernah', multiplier: 1.20, risk_impact: 'high', rfi_required: true },
              ],
            },
            {
              id: 'q_med_hospitalization_details',
              questionnaire_id: `quest_${slug}`,
              step_number: 3,
              pillar_type: 'medical_required',
              code: 'hospitalization_details',
              label: 'Rincian Alasan Rawat Inap & Nama RS',
              help_text: 'Sebutkan tindakan medis, tanggal rawat, dan status kesembuhan saat ini',
              input_type: 'text',
              placeholder: 'Contoh: Operasi usus buntu tahun 2025 di RS Siloam, sembuh total',
              order_index: 7,
              parent_question_id: 'q_med_hospitalization',
              show_if_parent_value: 'yes',
              validation_rules: { required: true, min_length: 5 },
              is_active: true,
            },
          ]),

      // STEP 4: LEGALITAS & AHLI WARIS
      {
        id: 'q_ben_name',
        questionnaire_id: `quest_${slug}`,
        step_number: 4,
        pillar_type: 'documents_complete',
        code: 'beneficiary_name',
        label: 'Nama Lengkap Ahli Waris (Penerima Manfaat)',
        help_text: 'Nama sesuai e-KTP penerima hak klaim pertanggungan',
        input_type: 'text',
        placeholder: 'Contoh: Ratna Dewi Kusuma',
        order_index: 1,
        validation_rules: { required: true, min_length: 2 },
        is_active: true,
      },
      {
        id: 'q_ben_relationship',
        questionnaire_id: `quest_${slug}`,
        step_number: 4,
        pillar_type: 'documents_complete',
        code: 'beneficiary_relationship',
        label: 'Hubungan Keluarga Ahli Waris dengan Tertanggung',
        input_type: 'select',
        order_index: 2,
        validation_rules: { required: true },
        is_active: true,
        options: [
          { value: 'spouse', label: 'Suami / Istri Sah' },
          { value: 'child', label: 'Anak Kandung' },
          { value: 'parent', label: 'Orang Tua Kandung' },
          { value: 'sibling', label: 'Saudara Kandung' },
        ],
      },
      {
        id: 'q_ben_nik',
        questionnaire_id: `quest_${slug}`,
        step_number: 4,
        pillar_type: 'documents_complete',
        code: 'beneficiary_nik',
        label: 'Nomor KTP / NIK Ahli Waris',
        help_text: 'Nomor identitas kependudukan 16 digit penerima manfaat',
        input_type: 'text',
        placeholder: 'Contoh: 3174055609950002',
        order_index: 3,
        validation_rules: { required: true, min_length: 16, max_length: 16, pattern: '^[0-9]{16}$' },
        is_active: true,
      },
      {
        id: 'q_legal_truth',
        questionnaire_id: `quest_${slug}`,
        step_number: 4,
        pillar_type: 'documents_complete',
        code: 'agree_truth_declaration',
        label: 'Pernyataan Kebenaran Data Underwriting',
        help_text:
          'Saya menyatakan seluruh data identitas, profil finansial, dan deklarasi kesehatan di atas adalah benar dan sesuai kenyataan sesungguhnya.',
        input_type: 'checkbox',
        order_index: 4,
        validation_rules: { required: true },
        is_active: true,
      },
      {
        id: 'q_legal_terms',
        questionnaire_id: `quest_${slug}`,
        step_number: 4,
        pillar_type: 'documents_complete',
        code: 'agree_policy_terms',
        label: 'Persetujuan Klausul & Syarat Ketentuan Polis Resmi',
        help_text:
          'Saya telah membaca, memahami, dan menyetujui seluruh Ketentuan Polis, klausul pengecualian, masa tunggu, serta proses evaluasi underwriting otomatis.',
        input_type: 'checkbox',
        order_index: 5,
        validation_rules: { required: true },
        is_active: true,
      },
    ];

    const stepPillars = [
      { step: 1, pillar: 'identity_verified', title: '01. Identitas KTP', desc: 'Validasi Dukcapil & Biometrik' },
      { step: 2, pillar: 'income_verified', title: '02. Finansial & DSR', desc: 'Kapasitas Pembayaran Premi' },
      { step: 3, pillar: 'medical_required', title: '03. Skrining Risiko', desc: 'Evaluasi Kesehatan & Gaya Hidup' },
      { step: 4, pillar: 'documents_complete', title: '04. Legalitas & Ahli Waris', desc: 'Penerima Manfaat & Klausul Polis' },
    ];

    const steps: QuestionnaireStepGroupDTO[] = stepPillars.map((sp) => ({
      step_number: sp.step,
      pillar_type: sp.pillar,
      title: sp.title,
      description: sp.desc,
      questions: questions.filter((q) => q.step_number === sp.step),
    }));

    return {
      id: `quest_${slug}`,
      product_id: product.id,
      product_slug: slug,
      category: product.categoryKey,
      title: `Formulir Kuesioner Underwriting 4 Pilar - ${product.title}`,
      description: 'Formulir standar underwriting otomatis berbasis regulasi OJK',
      version: 1,
      is_active: true,
      steps,
      questions,
    };
  }
}

