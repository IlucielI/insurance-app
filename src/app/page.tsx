import React from 'react';
import { AppLayout } from '@/components/templates';
import { productService } from '@/server/di';
import { HomeWorkbench } from './HomeWorkbench';

export default async function HomePage() {
  const featuredProducts = await productService.getFeaturedProducts();

  return (
    <AppLayout currentPath="/">
      <HomeWorkbench initialFeaturedProducts={featuredProducts} />
    </AppLayout>
  );
}
