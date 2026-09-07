import {
  ChatSession,
  ChatMessage,
  PopularTopic,
  KnowledgeEngineStatus,
} from '@/types/assistant.types';
import { IAssistantRepository } from '../repositories/assistant.repository.interface';
import { IAssistantService } from './assistant.service.interface';

export class AssistantService implements IAssistantService {
  constructor(private readonly repository: IAssistantRepository) {}

  public async getChatSessions(): Promise<ChatSession[]> {
    return this.repository.getSessions();
  }

  public async getChatSession(sessionId: string): Promise<ChatSession | null> {
    return this.repository.getSessionById(sessionId);
  }

  public async startNewSession(title?: string): Promise<ChatSession> {
    return this.repository.createSession(title);
  }

  public async resetSessionMessages(sessionId: string): Promise<void> {
    return this.repository.clearSession(sessionId);
  }

  public async getPopularTopics(): Promise<PopularTopic[]> {
    return this.repository.getPopularTopics();
  }

  public async getEngineStatus(): Promise<KnowledgeEngineStatus> {
    return this.repository.getEngineStatus();
  }

  public async sendMessage(sessionId: string, query: string): Promise<ChatMessage> {
    const trimmed = query.trim();
    if (!trimmed) {
      throw new Error('Pertanyaan tidak boleh kosong.');
    }

    // 1. Add user message
    const res = await this.repository.addMessage(sessionId, {
      sender: 'user',
      content: trimmed,
    });

    // If repository is live Core API, it directly returns the assistant response
    if (res && res.sender === 'assistant') {
      return res;
    }

    // 2. Synthesize AI RAG response for mock repository
    const aiResponse = this.synthesizeResponse(trimmed);

    // 3. Add AI message
    return this.repository.addMessage(sessionId, aiResponse);
  }

  private synthesizeResponse(
    query: string
  ): Omit<ChatMessage, 'id' | 'timestamp'> {
    const q = query.toLowerCase();

    // 1. Syarat Dokumen Klaim / Meninggal Dunia
    if (q.includes('klaim') && (q.includes('meninggal') || q.includes('syarat') || q.includes('berkas') || q.includes('dokumen'))) {
      return {
        sender: 'assistant',
        content:
          'Berdasarkan Ketentuan Polis Baku Bab IV Pasal 14, klaim santunan duka memiliki Garansi SLA Pencairan Maksimal 3 Hari Kerja ke rekening ahli waris setelah berkas dinyatakan lengkap dan terverifikasi oleh tim underwriting.',
        checklistCard: {
          title: '📋 4 DOKUMEN WAJIB PENGAJUAN KLAIM RESMI:',
          items: [
            '1. Surat / Akta Kematian asli dari Disdukcapil atau resume dokter RS',
            '2. Formulir Pengajuan Klaim Resmi bertanda tangan Ahli Waris',
            '3. e-KTP Ahli Waris & KTP Tertanggung terdaftar',
            '4. Buku Tabungan / Rekening Koran Ahli Waris tujuan transfer santunan UP',
          ],
        },
        actionButtons: [
          {
            label: 'Ajukan Klaim Sekarang →',
            actionType: 'navigate',
            target: '/tracking',
          },
          {
            label: 'Unduh Formulir Klaim (PDF) 📄',
            actionType: 'download',
            target: 'https://s3.ap-southeast-3.amazonaws.com/bayu-insurance-storage/forms/formulir-klaim-resmi.pdf',
          },
        ],
        citations: [
          {
            id: 'cit-klaim',
            source: 'Polis Baku Pasal 14 Ayat 2 & Surat Edaran OJK SEOJK.05/2022',
          },
        ],
      };
    }

    // 2. Masa Tunggu Kecelakaan
    if (q.includes('kecelakaan') || (q.includes('masa tunggu') && q.includes('aktif'))) {
      return {
        sender: 'assistant',
        content:
          'Perlindungan risiko kecelakaan aktif seketika (0 hari masa tunggu) tanpa periode eliminasi, terhitung saat pembayaran premi pertama berhasil divalidasi sistem payment gateway.',
        tags: ['⚡ Langsung Aktif Seketika (0 Hari)'],
        citations: [
          {
            id: 'cit-acc',
            source: 'Ketentuan Pertanggungan Kecelakaan Diri Pasal 7',
          },
        ],
      };
    }

    // 3. Batas Usia
    if (q.includes('usia') || q.includes('umur')) {
      return {
        sender: 'assistant',
        content:
          'Batas usia masuk calon tertanggung untuk produk Term Life Guard Plus adalah 18 hingga 60 tahun dengan masa perlindungan maksimum hingga usia 70 tahun. Bagi produk asuransi anak, usia masuk mulai dari 1 bulan.',
        citations: [
          {
            id: 'cit-age',
            source: 'Buku Pedoman Produk Term Life Guard Bab II Pasal 3',
          },
        ],
      };
    }

    // 4. Ahli Waris / Beneficiary
    if (q.includes('ahli waris') || q.includes('beneficiary') || q.includes('persen')) {
      return {
        sender: 'assistant',
        content:
          'Penunjukan ahli waris wajib memiliki hubungan keluarga yang sah (Pasangan, Anak, Orang Tua, atau Saudara Kandung) dengan akumulasi persentase pembagian hak santunan genap 100% demi kepatuhan hukum waris OJK.',
        citations: [
          {
            id: 'cit-beneficiary',
            source: 'Ketentuan Penunjukan Penerima Manfaat OJK POJK.05/2015',
          },
        ],
      };
    }

    // 5. Premi / Simulasi
    if (q.includes('premi') || q.includes('simulasi') || q.includes('biaya') || q.includes('murah') || q.includes('terendah')) {
      return {
        sender: 'assistant',
        content:
          'Premi dasar kami dihitung menggunakan Tabel Mortalita Indonesia IV (TMI IV) 2019 OJK dengan tarif mulai dari Rp 100.000/bulan untuk UP Rp 300 Juta pada kelompok usia muda non-smoker.',
        actionButtons: [
          {
            label: 'Hitung Simulasi Premi Interaktif 🧮',
            actionType: 'navigate',
            target: '/simulation',
          },
        ],
        citations: [
          {
            id: 'cit-tmi',
            source: 'Tabel Mortalita Indonesia IV (TMI IV) Dewan Aktuaris OJK',
          },
        ],
      };
    }

    // 6. Garansi Pencairan SLA 3 Hari
    if (q.includes('garansi') || q.includes('pencairan') || q.includes('sla')) {
      return {
        sender: 'assistant',
        content:
          'Bayu Insurance memberikan Garansi SLA Pencairan Klaim maksimal 3 hari kerja sejak berkas dinyatakan lengkap dan lolos verifikasi fraud audit OJK. Nasabah dapat memantau progres secara real-time di Tracking Workbench.',
        actionButtons: [
          {
            label: 'Lacak Status Klaim Anda 🔍',
            actionType: 'navigate',
            target: '/tracking',
          },
        ],
        citations: [
          {
            id: 'cit-sla',
            source: 'Piagam Layanan Nasabah Bayu Insurance & Standar OJK',
          },
        ],
      };
    }

    // 7. Unduh Polis & Sertifikat
    if (q.includes('unduh') || q.includes('sertifikat') || q.includes('e-polis') || q.includes('download')) {
      return {
        sender: 'assistant',
        content:
          'E-Polis resmi bersertifikat digital dapat diunduh langsung setelah proses verifikasi underwriting 4-Pilar disetujui dan autodebet premi pertama terkonfirmasi.',
        actionButtons: [
          {
            label: 'Unduh Ringkasan Polis Baku (PDF) 📄',
            actionType: 'download',
            target: 'https://s3.ap-southeast-3.amazonaws.com/bayu-insurance-storage/forms/ringkasan-polis-baku.pdf',
          },
          {
            label: 'Akses Portal Dokumen & Status 🔍',
            actionType: 'navigate',
            target: '/tracking',
          },
        ],
        citations: [
          {
            id: 'cit-download',
            source: 'Ketentuan Penerbitan Polis Digital SEOJK.05/2022',
          },
        ],
      };
    }

    // 8. Skrining Riwayat Medis & Pre-Existing Condition
    if (q.includes('skrining') || q.includes('penyakit') || q.includes('pre-existing') || q.includes('medis')) {
      return {
        sender: 'assistant',
        content:
          'Riwayat penyakit terdahulu (pre-existing condition) wajib diungkapkan secara jujur (utmost good faith). Kondisi tertentu dapat di-cover dengan penyesuaian premi aktuaria atau masa tunggu khusus.',
        actionButtons: [
          {
            label: 'Pelajari Skrining Medis 4-Pilar 🩺',
            actionType: 'navigate',
            target: '/apply',
          },
        ],
        citations: [
          {
            id: 'cit-medis',
            source: 'Buku Pedoman Underwriting Medis InsuRisk v2.4',
          },
        ],
      };
    }

    // 9. Metode Bayar VA / QRIS / Autodebet
    if (q.includes('bayar') || q.includes('metode') || q.includes('qris') || q.includes('va') || q.includes('autodebet')) {
      return {
        sender: 'assistant',
        content:
          'Kami mendukung pembayaran premi melalui Virtual Account semua bank nasional (BCA, Mandiri, BRI, BNI), QRIS instan, kartu kredit berlogo Visa/Mastercard, serta autodebet perbankan berhadiah diskon premi 2 bulan.',
        actionButtons: [
          {
            label: 'Simulasi Premi & Opsi Bayar 💳',
            actionType: 'navigate',
            target: '/simulation',
          },
        ],
        citations: [
          {
            id: 'cit-payment',
            source: 'Panduan Transaksi Pembayaran Premi Digital OJK',
          },
        ],
      };
    }

    // 10. Registrasi / Pendaftaran Aplikasi Baru
    if (q.includes('daftar') || q.includes('registrasi') || q.includes('pengajuan') || q.includes('beli')) {
      return {
        sender: 'assistant',
        content:
          'Pendaftaran aplikasi polis dapat dilakukan 100% online melalui 4-Pilar verifikasi: Identitas KTP Dukcapil, Profil Finansial & Pekerjaan, Skrining Medis, serta Penunjukan Ahli Waris.',
        actionButtons: [
          {
            label: 'Buka Formulir Pendaftaran 📝',
            actionType: 'navigate',
            target: '/apply',
          },
        ],
        citations: [
          {
            id: 'cit-apply',
            source: 'SOP Pendaftaran Asuransi Digital Mandiri OJK',
          },
        ],
      };
    }

    // 11. Katalog Produk
    if (q.includes('produk') || q.includes('katalog') || q.includes('pilihan')) {
      return {
        sender: 'assistant',
        content:
          'Bayu Insurance menyediakan berbagai produk proteksi jiwa unggulan seperti Term Life Guard Plus, Critical Care Protection, dan EduSave Future dengan manfaat klaim terpadu.',
        actionButtons: [
          {
            label: 'Lihat Katalog Produk Lengkap 🛡️',
            actionType: 'navigate',
            target: '/products',
          },
        ],
        citations: [
          {
            id: 'cit-catalog',
            source: 'Brosur Produk Resmi Terdaftar OJK',
          },
        ],
      };
    }

    // Fallback Default
    return {
      sender: 'assistant',
      content: `Terima kasih atas pertanyaan Anda mengenai "${query}". Seluruh ketentuan perlindungan, tata kelola klaim, dan persyaratan verifikasi 4-Pilar InsuRisk dirancang transparan sesuai regulasi OJK untuk melindungi hak nasabah secara penuh.`,
      citations: [
        {
          id: 'cit-default',
          source: 'Ketentuan Polis Baku OJK SEOJK.05/2022',
        },
      ],
    };
  }
}
