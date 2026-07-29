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