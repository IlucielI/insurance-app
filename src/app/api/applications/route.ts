import { NextRequest, NextResponse } from 'next/server';
import { applicationService } from '@/server/di';
import { CreateApplicationDTO } from '@/types/application.types';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateApplicationDTO;
    if (!body || !body.productId || !body.identity?.fullName) {
      return NextResponse.json(
        { error: 'Data pengajuan aplikasi tidak lengkap atau tidak valid.' },
        { status: 400 }
      );
    }

    const result = await applicationService.submitApplication(body);
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
