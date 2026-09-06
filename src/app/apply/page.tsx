import React from 'react';
import { AppLayout } from '@/components/templates';
import { productService } from '@/server/di';
import { ApplicationWorkbench, InitialQuoteParams } from './ApplicationWorkbench';

interface ApplyPageProps {
  searchParams?: Promise<{
    productId?: string;
    sumAssured?: string;
    termYears?: string;
    frequency?: string;
    age?: string;
    isSmoker?: string;
    riders?: string;
  }> | {
    productId?: string;
    sumAssured?: string;
    termYears?: string;
    frequency?: string;
    age?: string;
    isSmoker?: string;
    riders?: string;
  };
}

export default async function ApplyPage({ searchParams }: ApplyPageProps) {
  const resolvedParams = searchParams ? await Promise.resolve(searchParams) : undefined;
  const products = await productService.getProducts();

  const initialQuote: InitialQuoteParams = {
    productId: resolvedParams?.productId,
    sumAssured: resolvedParams?.sumAssured ? Number(resolvedParams.sumAssured) : undefined,
    termYears: resolvedParams?.termYears ? Number(resolvedParams.termYears) : undefined,
    frequency: (resolvedParams?.frequency as 'monthly' | 'annually') || undefined,
    applicantAge: resolvedParams?.age ? Number(resolvedParams.age) : undefined,
    isSmoker: resolvedParams?.isSmoker === 'true',
    selectedRiders: resolvedParams?.riders ? resolvedParams.riders.split(',').filter(Boolean) : undefined,
  };

  return (
    <AppLayout currentPath="/apply">
      <ApplicationWorkbench initialProducts={products} initialQuote={initialQuote} />
    </AppLayout>
  );
}
