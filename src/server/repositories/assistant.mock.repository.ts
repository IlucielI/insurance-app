import {
  ChatSession,
  ChatMessage,
  PopularTopic,
  KnowledgeEngineStatus,
} from '@/types/assistant.types';
import { IAssistantRepository } from './assistant.repository.interface';

export class AssistantMockRepository implements IAssistantRepository {
  private sessions: ChatSession[] = [
    {
      id: 'sess-klaim-01',
      title: '💬 Syarat Klaim Meninggal Dunia',
      lastActive: 'Sesi Aktif • Garansi SLA 3 Hari',
      previewText: 'Garansi pencairan 3 hari kerja setelah berkas lengkap.',
      messages: [
        {
          id: 'msg-01',
          sender: 'user',
          content:
            'Halo AI, saya mau tanya: berapa hari batas pencairan klaim meninggal dunia dan apa saja berkas yang wajib diunggah?',
          timestamp: '09:41 WIB • Terkirim',
        },
        {
          id: 'msg-02',
          sender: 'assistant',
          content:
            'Berdasarkan Ketentuan Polis Baku Bab IV Pasal 14, klaim meninggal dunia memiliki Garansi SLA Pencairan Maksimal 3 Hari Kerja ke rekening ahli waris setelah berkas diverifikasi lengkap oleh tim underwriting kami.',
          timestamp: '09:41 WIB • Selesai Disintesis',
          checklistCard: {
            title: '📋 4 DOKUMEN WAJIB PENGAJUAN KLAIM MENINGGAL DUNIA:',
            items: [
              '1. Surat Kematian / Akta Kematian asli dari Disdukcapil atau resume dokter RS',
              '2. Formulir Pengajuan Klaim Resmi bertanda tangan Ahli Waris',
              '3. KTP Ahli Waris & KTP Tertanggung terdaftar (terverifikasi sistem Dukcapil)',
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
              id: 'cit-1',
              source: 'Polis Baku Pasal 14 Ayat 2 & Surat Edaran OJK SEOJK.05/2022',
            },
          ],
        },
        {
          id: 'msg-03',
          sender: 'user',
          content: 'Apakah ada masa tunggu sebelum klaim kecelakaan dapat diajukan?',
          timestamp: '09:43 WIB • Terkirim',
        },
        {
          id: 'msg-04',
          sender: 'assistant',
          content:
            'Tidak ada masa tunggu untuk risiko kecelakaan. Perlindungan aktif seketika (0 hari) begitu pembayaran premi pertama Anda terkonfirmasi oleh gateway pembayaran.',
          timestamp: '09:43 WIB • Selesai Disintesis',
          tags: ['⚡ Langsung Aktif Seketika (0 Hari)'],
          citations: [
            {
              id: 'cit-2',
              source: 'Ketentuan Pertanggungan Kecelakaan Diri Pasal 7',
            },
          ],
        },
      ],
    },
    {
      id: 'sess-simulasi-02',
      title: '💬 Simulasi UP Usia 30 Tahun',
      lastActive: 'Kemarin • Premi Rp 230rb/bln',
      previewText: 'Simulasi premi untuk Uang Pertanggungan Rp 500 Juta.',
      messages: [
        {
          id: 'msg-sim-01',
          sender: 'user',
          content: 'Berapa estimasi premi untuk usia 30 tahun non-smoker dengan UP 500 juta?',
          timestamp: 'Kemarin 14:15 WIB',
        },
        {
          id: 'msg-sim-02',
          sender: 'assistant',
          content:
            'Untuk usia 30 tahun non-smoker dengan Uang Pertanggungan Rp 500.000.000 dan tenor 10 tahun, premi mulai dari Rp 161.000 per bulan atau Rp 1.750.000 per tahun (hemat 2 bulan premi).',
          timestamp: 'Kemarin 14:15 WIB',
          citations: [
            {
              id: 'cit-sim',
              source: 'Tabel Mortalita Indonesia IV (TMI IV) 2019 OJK',
            },
          ],
          actionButtons: [
            {
              label: 'Buka Kalkulator Simulasi 🧮',
              actionType: 'navigate',
              target: '/simulation?sumAssured=500000000&age=30',
            },
          ],
        },
      ],
    },
    {
      id: 'sess-preexisting-03',
      title: '💬 Ketentuan Pre-Existing Condition',
      lastActive: '3 hari lalu • Selesai',
      previewText: 'Masa tunggu 12 bulan untuk kondisi penyakit bawaan.',
      messages: [
        {
          id: 'msg-pre-01',
          sender: 'user',
          content: 'Apakah riwayat penyakit yang sudah ada sebelumnya (pre-existing) ditanggung?',
          timestamp: '3 hari lalu',
        },
        {
          id: 'msg-pre-02',
          sender: 'assistant',
          content:
            'Pre-existing condition dilindungi setelah melewati masa tunggu (waiting period) selama 12 bulan sejak polis aktif, dengan syarat telah dideklarasikan secara jujur pada kuesioner Pilar 3 Medis saat pengajuan.',
          timestamp: '3 hari lalu',
          citations: [
            {
              id: 'cit-pre',
              source: 'Pedoman Underwriting Jiwa & Kesehatan OJK POJK.05/2016',
            },
          ],
        },
      ],
    },
  ];

  private popularTopics: PopularTopic[] = [
    {
      id: 'topic-1',
      icon: '📋',
      title: 'Syarat Dokumen Klaim',
      prompt: 'Apa saja syarat dokumen wajib untuk pengajuan klaim meninggal dunia dan rawat inap?',
    },
    {
      id: 'topic-2',
      icon: '⚡',
      title: 'Garansi Pencairan 3 Hari',
      prompt: 'Bagaimana komitmen SLA garansi pencairan klaim maksimal 3 hari kerja ke rekening nasabah?',
    },
    {
      id: 'topic-3',
      icon: '🩺',
      title: 'Skrining Riwayat Penyakit',
      prompt: 'Bagaimana evaluasi indeks massa tubuh (BMI) dan riwayat penyakit kritis pada pilar medis?',
    },
    {
      id: 'topic-4',
      icon: '📄',
      title: 'Unduh Polis & Sertifikat',
      prompt: 'Bagaimana cara memeriksa status dan mengunduh sertifikat e-Polis resmi berstandar OJK?',
    },
    {
      id: 'topic-5',
      icon: '💳',
      title: 'Metode Bayar VA / QRIS',
      prompt: 'Apa saja opsi pembayaran premi yang didukung dan bagaimana aktivasi autodebet perbankan?',
    },
  ];

  private engineStatus: KnowledgeEngineStatus = {
    version: 'CORE API ENGINE v1.2',
    indexedDocsCount: 150,
    vectorDimension: 1024,
    avgSlaMs: 420,
    status: 'online',
  };

  public async getSessions(): Promise<ChatSession[]> {
    return structuredClone(this.sessions);
  }

  public async getSessionById(id: string): Promise<ChatSession | null> {
    const session = this.sessions.find((s) => s.id === id);
    if (!session) return null;
    return structuredClone(session);
  }

  public async createSession(title?: string): Promise<ChatSession> {
    const newSessionId = `sess-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: title ? `💬 ${title}` : '💬 Percakapan Baru',
      lastActive: 'Baru saja dibuat',
      previewText: 'Mulai tanyakan seputar polis atau klaim.',
      messages: [
        {
          id: `msg-welcome-${Date.now()}`,
          sender: 'assistant',
          content:
            'Halo! Saya Asisten AI Konsultasi Polis Bayu Insurance. Saya siap membantu menjawab pertanyaan Anda terkait polis, klausul santunan, perhitungan premi aktuaria, dan tata cara klaim resmi OJK. Ada yang bisa saya bantu?',
          timestamp: 'Baru saja',
          citations: [
            {
              id: 'cit-welcome',
              source: 'Ketentuan Polis Baku OJK SEOJK.05/2022',
            },
          ],
        },
      ],
    };

    this.sessions.unshift(newSession);
    return structuredClone(newSession);
  }

  public async addMessage(
    sessionId: string,
    message: Omit<ChatMessage, 'id' | 'timestamp'>
  ): Promise<ChatMessage> {
    const session = this.sessions.find((s) => s.id === sessionId);
    if (!session) {
      throw new Error(`Sesi percakapan ${sessionId} tidak ditemukan.`);
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: 'Baru saja',
      ...message,
    };

    session.messages.push(newMsg);
    session.lastActive = 'Aktif baru saja';
    session.previewText =
      newMsg.content.length > 50 ? `${newMsg.content.slice(0, 50)}...` : newMsg.content;

    if (session.title === '💬 Percakapan Baru' && message.sender === 'user') {
      const trimmedText = message.content.trim();
      const snippet = trimmedText.length > 32 ? `${trimmedText.slice(0, 32)}...` : trimmedText;
      session.title = `💬 ${snippet}`;
    }

    return structuredClone(newMsg);
  }

  public async clearSession(sessionId: string): Promise<void> {
    const session = this.sessions.find((s) => s.id === sessionId);
    if (!session) return;
    session.messages = [
      {
        id: `msg-reset-${Date.now()}`,
        sender: 'assistant',
        content:
          'Percakapan telah dibersihkan. Silakan tanyakan hal lain seputar produk, syarat klaim, atau verifikasi underwriting.',
        timestamp: 'Baru saja',
      },
    ];
  }

  public async getPopularTopics(): Promise<PopularTopic[]> {
    return structuredClone(this.popularTopics);
  }

  public async getEngineStatus(): Promise<KnowledgeEngineStatus> {
    return structuredClone(this.engineStatus);
  }
}
