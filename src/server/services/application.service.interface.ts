import {
  CreateApplicationDTO,
  ApplicationSubmissionResult,
  PolicyApplication,
  PillarCheck,
} from '@/types/application.types';

export interface IApplicationService {
  submitApplication(dto: CreateApplicationDTO): Promise<ApplicationSubmissionResult>;
  getApplicationById(id: string): Promise<PolicyApplication | null>;
  evaluatePillars(dto: CreateApplicationDTO): PillarCheck[];
  trackApplication(query: string): Promise<PolicyApplication | null>;
  submitRfiDocument(
    applicationId: string,
    pillarNumber: number,
    documentType: string,
    fileName: string
  ): Promise<{ success: boolean; application: PolicyApplication }>;
}

