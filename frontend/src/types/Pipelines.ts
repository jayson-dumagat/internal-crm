export type PipelineViewId = string;
export type PipelineStageId = string;

export type StageColor =
  | "default"
  | "brand"
  | "info"
  | "warning"
  | "success"
  | "error";

export type PipelineStage = {
  id: PipelineStageId;
  name: string;
  color: StageColor;
  order: number;
};

export type PipelineLead = {
  id: string;
  viewId: PipelineViewId;
  stageId: PipelineStageId;
  name: string;
  avatar: string;
  role: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  owner: { name: string; avatar: string };
  assignedTo: { name: string; avatar: string };
  progress: number;
  dateCreated: string;
  lastActivity: string;
  address: string;
};

export type PipelineView = {
  id: PipelineViewId;
  name: string;
  stages: PipelineStage[];
};

export type DraggedPipelineLead = {
  type: "PIPELINE_LEAD";
  leadId: string;
  sourceStageId: string;
};
