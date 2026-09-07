import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Callout } from './Callout';

describe('Callout', () => {
  it('renders children="Product available" when both children and description are provided', () => {
    render(
      <Callout description="Fallback text">
        Product available
      </Callout>
    );

    expect(screen.getByText('Product available')).toBeDefined();
    expect(screen.queryByText('Fallback text')).toBeNull();
  });

  it('renders numeric 0 correctly when children={0} and description="Fallback text"', () => {
    render(
      <Callout description="Fallback text">
        {0}
      </Callout>
    );

    expect(screen.getByText('0')).toBeDefined();
    expect(screen.queryByText('Fallback text')).toBeNull();
  });

  it('renders description when children is undefined', () => {
    render(
      <Callout description="Fallback text" />
    );

    expect(screen.getByText('Fallback text')).toBeDefined();
  });

  it('renders title and applies variant styles correctly', () => {
    render(
      <Callout variant="warning" title="Peringatan Penting">
        Data belum lengkap
      </Callout>
    );

    expect(screen.getByText('Peringatan Penting')).toBeDefined();
    expect(screen.getByText('Data belum lengkap')).toBeDefined();
    expect(screen.getByText('⚠️')).toBeDefined();
  });
});
