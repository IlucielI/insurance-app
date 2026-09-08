import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    testTimeout: 15000,
    env: {
      MOCK_CORE_API: 'true',
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/server/repositories/product.mock.repository.ts',
        'src/server/repositories/product.core-api.repository.ts',
        'src/server/repositories/application.mock.repository.ts',
        'src/server/repositories/assistant.mock.repository.ts',
        'src/server/services/product.service.ts',
        'src/server/services/simulation.service.ts',
        'src/server/services/application.service.ts',
        'src/server/services/assistant.service.ts',
        'src/server/di/registry.ts',
        'src/app/page.tsx',
        'src/app/HomeWorkbench.tsx',
        'src/app/products/page.tsx',
        'src/app/products/ProductCatalogWorkbench.tsx',
        'src/app/simulation/page.tsx',
        'src/app/simulation/SimulationWorkbench.tsx',
        'src/app/apply/page.tsx',
        'src/app/apply/ApplicationWorkbench.tsx',
        'src/app/tracking/page.tsx',
        'src/app/tracking/TrackingWorkbench.tsx',
        'src/app/assistant/page.tsx',
        'src/app/assistant/AssistantWorkbench.tsx',
      ],


      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
