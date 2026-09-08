import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

describe('GET /api/products', () => {
  it('returns products from productService successfully', async () => {
    const req = new NextRequest('http://localhost:3000/api/products');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
  });

  it('filters by category query param', async () => {
    const req = new NextRequest('http://localhost:3000/api/products?category=life');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.every((p: any) => p.categoryKey === 'life')).toBe(true);
  });
});
