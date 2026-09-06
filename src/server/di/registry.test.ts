import { describe, it, expect } from 'vitest';
import { healthController, productService, simulationService } from './registry';
import { HealthController } from '../controllers/health.controller';
import { ProductService } from '../services/product.service';
import { SimulationService } from '../services/simulation.service';

describe('DI Registry', () => {
  it('should export initialized services and controller instances', () => {
    expect(healthController).toBeDefined();
    expect(healthController).toBeInstanceOf(HealthController);
    expect(productService).toBeDefined();
    expect(productService).toBeInstanceOf(ProductService);
    expect(simulationService).toBeDefined();
    expect(simulationService).toBeInstanceOf(SimulationService);
  });

  it('should allow productService to successfully fetch data through injected mock repository', async () => {
    const featured = await productService.getFeaturedProducts();
    expect(featured).toBeDefined();
    expect(featured.length).toBeGreaterThan(0);
    expect(featured[0].title).toBeDefined();

    const all = await productService.getProducts();
    expect(all.length).toBeGreaterThanOrEqual(featured.length);
  });
});
