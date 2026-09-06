export type PillarType =
  | 'identity_verified'
  | 'income_verified'
  | 'medical_required'
  | 'documents_complete';

export type PillarStatus = 'PASSED' | 'FLAGGED' | 'PENDING' | 'FAILED';

export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'rfi_requested';

export interface PillarCheck {
  pillarNumber: number;
  pillarType: PillarType;
  title: string;
  description: string;
  status: PillarStatus;
  statusText: string;
  score?: number;
}

export interface ApplicantIdentity {
  nik: string;
  fullName: string;
  birthDate: string;
  gender: 'male' | 'female';
  phoneNumber: string;
  email: string;
  ktpImageName?: string;
}

export interface ApplicantFinancial {
  occupation: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  existingDebtsMonthly: number;
  calculatedDsr: number;
}

export interface ApplicantMedical {
  weightKg: number;
  heightCm: number;
  bmi: number;
  hasCriticalIllnessHistory: boolean;
  hasHospitalizationLast2Years: boolean;
  isSmoker: boolean;
  hasFamilyHistory: boolean;
}

export interface Beneficiary {
  fullName: string;
  relationship: 'spouse' | 'child' | 'parent' | 'sibling';
  nik: string;
  sharePercentage: number;
}

export interface PaymentSelection {
  method: 'va_bca' | 'va_mandiri' | 'va_bri' | 'credit_card';
  autoDebet: boolean;
}

export interface PolicyApplication {
  id: string;
  productId: string;
  productName: string;
  sumAssured: number;
  termYears: number;
  monthlyPremium: number;
  annualPremium: number;
  frequency: 'monthly' | 'annually';
  selectedRiderIds: string[];
  identity: ApplicantIdentity;
  financial: ApplicantFinancial;
  medical: ApplicantMedical;
  beneficiary: Beneficiary;
  payment: PaymentSelection;
  pillarChecks: PillarCheck[];
  overallStatus: ApplicationStatus;
  underwritingTier: 'guaranteed_issue' | 'simplified' | 'full_underwriting';
  slaRemainingMinutes: number;
  createdAt: string;
}

export interface CreateApplicationDTO {
  productId: string;
  productName: string;
  sumAssured: number;
  termYears: number;
  monthlyPremium: number;
  annualPremium: number;
  frequency: 'monthly' | 'annually';
  selectedRiderIds: string[];
  identity: ApplicantIdentity;
  financial: Omit<ApplicantFinancial, 'calculatedDsr'>;
  medical: Omit<ApplicantMedical, 'bmi'>;
  beneficiary: Beneficiary;
  payment: PaymentSelection;
}

export interface ApplicationSubmissionResult {
  applicationId: string;
  application: PolicyApplication;
  isInstantApproval: boolean;
  message: string;
}
