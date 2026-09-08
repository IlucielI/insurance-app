import React from 'react';
import { AppLayout } from '@/components/templates';
import { productService } from '@/server/di';
import { SimulationWorkbench } from './SimulationWorkbench';

interface SimulationPageProps {
  searchParams?: Promise<{ productId?: string }> | { productId?: string };
}

export default async function SimulationPage({ searchParams }: SimulationPageProps) {
  const resolvedParams = searchParams ? await Promise.resolve(searchParams) : undefined;
  const products = await productService.getProducts();

  return (
    <AppLayout currentPath="/simulation" initialProducts={products}>
      <SimulationWorkbench
        initialProducts={products}
        initialProductId={resolvedParams?.productId}
      />
    </AppLayout>
  );
}
