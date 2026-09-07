import { SystemRepository } from '../repositories/system.repository';
import { HealthService } from '../services/health.service';
import { HealthController } from '../controllers/health.controller';
import { ProductMockRepository } from '../repositories/product.mock.repository';
import { CoreApiProductRepository } from '../repositories/product.core-api.repository';
import { ProductService } from '../services/product.service';
import { SimulationService } from '../services/simulation.service';

import { ApplicationMockRepository } from '../repositories/application.mock.repository';
import { ApplicationService } from '../services/application.service';

import { AssistantMockRepository } from '../repositories/assistant.mock.repository';
import { AssistantService } from '../services/assistant.service';

const systemRepository = new SystemRepository();
const healthService = new HealthService(systemRepository);
export const healthController = new HealthController(healthService);

const useMock =
  process.env.MOCK_CORE_API === 'true' ||
  process.env.NEXT_PUBLIC_MOCK_CORE_API === 'true' ||
  process.env.USE_MOCK_DATA === 'true';

export const productRepository = useMock
  ? new ProductMockRepository()
  : new CoreApiProductRepository();
export const productService = new ProductService(productRepository);

export const simulationService = new SimulationService();

export const applicationRepository = new ApplicationMockRepository();
export const applicationService = new ApplicationService(applicationRepository);

export const assistantRepository = new AssistantMockRepository();
export const assistantService = new AssistantService(assistantRepository);


