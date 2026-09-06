import React from 'react';
import { AppLayout } from '@/components/templates';
import { productService } from '@/server/di';
import { ProductCatalogWorkbench } from './ProductCatalogWorkbench';

export default async function ProductsPage() {
  const products = await productService.getProducts();

  return (
    <AppLayout currentPath="/products">
      <ProductCatalogWorkbench initialProducts={products} />
    </AppLayout>
  );
}
