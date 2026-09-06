import { PolicyApplication, RfiDocument } from '@/types/application.types';

export interface IApplicationRepository {
  create(application: PolicyApplication): Promise<PolicyApplication>;
  findById(id: string): Promise<PolicyApplication | null>;
  findByNik(nik: string): Promise<PolicyApplication[]>;
  findAll(): Promise<PolicyApplication[]>;
  addRfiDocument(
    applicationId: string,
    doc: Omit<RfiDocument, 'id' | 'uploadedAt' | 'status'>
  ): Promise<PolicyApplication | null>;
}

