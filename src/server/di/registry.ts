import { SystemRepository } from '../repositories/system.repository';
import { HealthService } from '../services/health.service';
import { HealthController } from '../controllers/health.controller';
import { ProductMockRepository } from '../repositories/product.mock.repository';
import { ProductService } from '../services/product.service';
import { SimulationService } from '../services/simulation.service';

import { ApplicationMockRepository } from '../repositories/application.mock.repository';
import { ApplicationService } from '../services/application.service';

const systemRepository = new SystemRepository();
const healthService = new HealthService(systemRepository);
export const healthController = new HealthController(healthService);

const productRepository = new ProductMockRepository();
export const productService = new ProductService(productRepository);

export const simulationService = new SimulationService();

export const applicationRepository = new ApplicationMockRepository();
export const applicationService = new ApplicationService(applicationRepository);

