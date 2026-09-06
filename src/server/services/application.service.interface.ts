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
}
