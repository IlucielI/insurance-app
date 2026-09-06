import { PolicyApplication } from '@/types/application.types';

export interface IApplicationRepository {
  create(application: PolicyApplication): Promise<PolicyApplication>;
  findById(id: string): Promise<PolicyApplication | null>;
  findAll(): Promise<PolicyApplication[]>;
}
