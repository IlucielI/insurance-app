import React from 'react';
import { AppLayout } from '@/components/templates';
import { productService } from '@/server/di';
import { ProductCategoryKey } from '@/server/repositories/product.repository.interface';
import { ProductCatalogWorkbench } from './ProductCatalogWorkbench';

export const dynamic = 'force-dynamic';

interface ProductsPageProps {
  searchParams?: Promise<{ category?: string; search?: string }> | { category?: string; search?: string };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps = {}) {
  const resolvedParams = searchParams ? await Promise.resolve(searchParams) : undefined;
  const categoryKey = (resolvedParams?.category as ProductCategoryKey | 'all') || undefined;
  const search = resolvedParams?.search;

  const products = await productService.getProducts(categoryKey, search);

  return (
    <AppLayout currentPath="/products">
      <ProductCatalogWorkbench initialProducts={products} />
    </AppLayout>
  );
}
