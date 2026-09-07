import { NextRequest, NextResponse } from 'next/server';

function resolveCoreApiBaseUrl(): string {
  return (
    process.env.CORE_API_INTERNAL_URL?.trim() ||
    process.env.CORE_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_CORE_API_URL?.trim() ||
    ''
  );
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const conversationId = id?.trim();

    if (!conversationId) {
      return NextResponse.json(
        { error: 'ID percakapan wajib diisi.' },
        { status: 400 }
      );
    }

    const useMock =
      process.env.MOCK_CORE_API === 'true' ||
      process.env.NEXT_PUBLIC_MOCK_CORE_API === 'true' ||
      process.env.USE_MOCK_DATA === 'true';

    const baseUrl = resolveCoreApiBaseUrl();

    // 1. Live Core API Fetch
    if (!useMock && baseUrl) {
      try {
        const upstreamRes = await fetch(
          `${baseUrl}/api/v1/assistant/conversations/${encodeURIComponent(conversationId)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (upstreamRes.status === 404) {
          return NextResponse.json(
            { error: 'Percakapan tidak ditemukan.' },
            { status: 404 }
          );
        }

        if (upstreamRes.ok) {
          const data = await upstreamRes.json();
          return NextResponse.json(data);
        }
      } catch (upstreamErr: unknown) {
        console.warn(
          '[Route /api/assistant/conversations/[id]] Core API call failed, falling back to mock:',
          upstreamErr
        );
      }
    }

    // 2. Mock Fallback
    if (conversationId.startsWith('sess-klaim') || conversationId === 'conv-demo-1') {
      return NextResponse.json({
        data: {
          id: conversationId,
          title: '💬 Syarat Klaim Meninggal Dunia',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          messages: [
            {
              id: 'msg-01',
              role: 'user',
              content:
                'Halo AI, saya mau tanya: berapa hari batas pencairan klaim meninggal dunia dan apa saja berkas yang wajib diunggah?',
              created_at: new Date(Date.now() - 3600000).toISOString(),
            },
            {
              id: 'msg-02',
              role: 'assistant',
              content:
                'Berdasarkan Ketentuan Polis Baku Bab IV Pasal 14, klaim meninggal dunia memiliki Garansi SLA Pencairan Maksimal 3 Hari Kerja ke rekening ahli waris setelah berkas diverifikasi lengkap oleh tim underwriting kami.',
              created_at: new Date(Date.now() - 3500000).toISOString(),
            },
          ],
        },
      });
    }

    return NextResponse.json(
      { error: 'Percakapan tidak ditemukan.' },
      { status: 404 }
    );
  } catch (err: unknown) {
    console.error('[Route /api/assistant/conversations/[id]] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
