import {
  healthController,
  productService,
  simulationService,
  applicationRepository,
  applicationService,
} from './registry';
import { HealthController } from '../controllers/health.controller';
import { ProductService } from '../services/product.service';
import { SimulationService } from '../services/simulation.service';
import { ApplicationMockRepository } from '../repositories/application.mock.repository';
import { ApplicationService } from '../services/application.service';

describe('DI Registry', () => {
  it('should export initialized services and controller instances', () => {
    expect(healthController).toBeDefined();
    expect(healthController).toBeInstanceOf(HealthController);
    expect(productService).toBeDefined();
    expect(productService).toBeInstanceOf(ProductService);
    expect(simulationService).toBeDefined();
    expect(simulationService).toBeInstanceOf(SimulationService);
    expect(applicationRepository).toBeDefined();
    expect(applicationRepository).toBeInstanceOf(ApplicationMockRepository);
    expect(applicationService).toBeDefined();
    expect(applicationService).toBeInstanceOf(ApplicationService);
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
