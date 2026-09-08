import { NextRequest, NextResponse } from 'next/server';

function resolveCoreApiBaseUrl(): string {
  return (
    process.env.CORE_API_INTERNAL_URL?.trim() ||
    process.env.CORE_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_CORE_API_URL?.trim() ||
    ''
  );
}

function getMockResponse(query: string): {
  answer: string;
  toolName?: string;
  sources: Array<{ title: string; source_type: string; score: number; excerpt: string }>;
  toolsUsed?: string[];
} {
  const q = query.toLowerCase();

  if (q.includes('premi') || q.includes('hitung') || q.includes('simulasi')) {
    return {
      toolName: 'calculate_quote',
      toolsUsed: ['calculate_quote'],
      answer:
        'Berdasarkan kalkulasi aktuaria Core API, untuk Uang Pertanggungan Rp 500.000.000 dengan tenor 10 tahun, estimasi premi mulai dari Rp 161.000 per bulan atau Rp 1.750.000 per tahun (hemat diskon tahunan 10%). Perlindungan mencakup santunan tutup usia 100% UP.',
      sources: [
        {
          title: 'Tabel Tarif Premi Aktuaria Secure Life Plus (SK Direksi No. 018/2026)',
          source_type: 'rate_table',
          score: 0.96,
          excerpt: 'Tarif dasar 0.35% per Rp 1.000 UP dengan diskon frekuensi tahunan 10%.',
        },
      ],
    };
  }

  if (q.includes('klaim') || q.includes('syarat') || q.includes('meninggal')) {
    return {
      toolsUsed: ['list_products'],
      answer:
        'Berdasarkan Ketentuan Polis Baku Bab IV Pasal 14, klaim santunan duka memiliki Garansi SLA Pencairan Maksimal 3 Hari Kerja ke rekening ahli waris setelah berkas dinyatakan lengkap dan terverifikasi oleh tim underwriting kami.',
      sources: [
        {
          title: 'Polis Baku Pasal 14 Ayat 2 & Surat Edaran OJK SEOJK.05/2022',
          source_type: 'policy',
          score: 0.98,
          excerpt: 'Klaim meninggal dunia diselesaikan maksimal 3 hari kerja sejak kelengkapan dokumen disetujui.',
        },
      ],
    };
  }

  return {
    answer:
      'Halo! Saya asisten AI resmi Bayu Insurance yang diawasi OJK. Saya dapat membantu Anda menghitung simulasi premi, pendaftaran asuransi, memahami klausul polis baku, serta persyaratan dokumen.',
    sources: [
      {
        title: 'Ringkasan Informasi Produk dan Layanan (RIPLAY) Umum',
        source_type: 'product_summary',
        score: 0.89,
        excerpt: 'Informasi umum kepesertaan asuransi digital berizin dan diawasi OJK.',
      },
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversation_id, product_slug, quote } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'Pesan pertanyaan wajib diisi.' },
        { status: 400 }
      );
    }

    const useMock =
      process.env.MOCK_CORE_API === 'true' ||
      process.env.NEXT_PUBLIC_MOCK_CORE_API === 'true' ||
      process.env.USE_MOCK_DATA === 'true';

    const baseUrl = resolveCoreApiBaseUrl();

    // Live Core API Streaming Path
    if (!useMock && baseUrl) {
      try {
        const upstreamRes = await fetch(`${baseUrl}/api/v1/assistant/chat/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message.trim(),
            conversation_id: conversation_id || undefined,
            product_slug: product_slug || undefined,
            quote: quote || undefined,
          }),
        });

        if (upstreamRes.ok && upstreamRes.body) {
          return new Response(upstreamRes.body, {
            headers: {
              'Content-Type': 'text/event-stream; charset=utf-8',
              'Cache-Control': 'no-cache, no-transform',
              'Connection': 'keep-alive',
              'X-Accel-Buffering': 'no',
            },
          });
        }
      } catch (upstreamErr: unknown) {
        console.warn(
          '[Route /api/assistant/chat/stream] Upstream Core API stream failed, using mock stream fallback:',
          upstreamErr
        );
      }
    }

    // Simulated SSE Stream Path (Mock mode or fallback)
    const mockData = getMockResponse(message);
    const resolvedConvId =
      conversation_id || `conv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        const sendEvent = (eventData: unknown) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`));
        };

        // 1. Emit tool_call if applicable
        if (mockData.toolName) {
          sendEvent({ type: 'tool_call', tool_name: mockData.toolName });
          await new Promise((r) => setTimeout(r, 60));
          sendEvent({ type: 'tool_result', tool_name: mockData.toolName });
          await new Promise((r) => setTimeout(r, 30));
        }

        // 2. Stream tokens word by word
        const words = mockData.answer.split(' ');
        for (let i = 0; i < words.length; i++) {
          const wordWithSpace = i === 0 ? words[i] : ` ${words[i]}`;
          sendEvent({ type: 'token', content: wordWithSpace });
          await new Promise((r) => setTimeout(r, 20));
        }

        // 3. Emit done event
        sendEvent({
          type: 'done',
          conversation_id: resolvedConvId,
          sources: mockData.sources,
          tools_used: mockData.toolsUsed || [],
        });

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err: unknown) {
    console.error('[Route /api/assistant/chat/stream] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
