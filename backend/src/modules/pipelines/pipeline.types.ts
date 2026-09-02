export enum PipelineStageColor {
  DEFAULT = "default",
  BRAND = "brand",
  INFO = "info",
  WARNING = "warning",
  SUCCESS = "success",
  ERROR = "error",
}

export interface PipelineStage {
  id: string;
  name: string;
  color: PipelineStageColor;
  position: number;
  probability: number;
  isClosed: boolean;
  isWon: boolean;
}

/** Canonical lifecycle for brokerage onboarding. The CRM owns this workflow;
 * order execution and settlement remain in the core brokerage system. */
export const brokeragePipelineStages: ReadonlyArray<PipelineStage> = [
  { id: "prospect", name: "Prospect", color: PipelineStageColor.DEFAULT, position: 0, probability: 10, isClosed: false, isWon: false },
  { id: "kyc-pending", name: "KYC Pending", color: PipelineStageColor.WARNING, position: 1, probability: 20, isClosed: false, isWon: false },
  { id: "documents-review", name: "Documents Review", color: PipelineStageColor.INFO, position: 2, probability: 35, isClosed: false, isWon: false },
  { id: "account-approved", name: "Account Approved", color: PipelineStageColor.BRAND, position: 3, probability: 55, isClosed: false, isWon: false },
  { id: "funding-pending", name: "Funding Pending", color: PipelineStageColor.WARNING, position: 4, probability: 70, isClosed: false, isWon: false },
  { id: "active-client", name: "Active Client", color: PipelineStageColor.SUCCESS, position: 5, probability: 100, isClosed: false, isWon: true },
  { id: "dormant", name: "Dormant", color: PipelineStageColor.DEFAULT, position: 6, probability: 0, isClosed: false, isWon: false },
  { id: "closed", name: "Closed", color: PipelineStageColor.ERROR, position: 7, probability: 0, isClosed: true, isWon: false },
];
