import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/server/di';
import { ProductCategoryKey } from '@/server/repositories/product.repository.interface';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as ProductCategoryKey | 'all' | null;
    const search = searchParams.get('search') || undefined;

    const products = await productService.getProducts(category || undefined, search);
    return NextResponse.json({ data: products }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch products';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
