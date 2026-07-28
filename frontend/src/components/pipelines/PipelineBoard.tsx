import {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  DndProvider,
} from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import PipelineColumn from "./PipelineColumn";
import PipelineTabs from "./PipelineTabs";
import StageSheet, {
  AddStageSheet,
} from "./StageSheet";
import ViewSheet from "./ViewSheet";

import {
  initialPipelineLeads,
  initialPipelineViews,
} from "./pipeline-data";

import type {
  PipelineLead,
  PipelineStage,
  PipelineView,
} from "./types";

export default function PipelineBoard() {
  const [views, setViews] = useState<PipelineView[]>(
    initialPipelineViews,
  );

  const [leads, setLeads] = useState<PipelineLead[]>(
    initialPipelineLeads,
  );

  const [activeViewId, setActiveViewId] =
    useState<string>(
      initialPipelineViews[0]?.id ?? "",
    );

  const [isAddStageOpen, setIsAddStageOpen] =
    useState(false);

  const [isCreateViewOpen, setIsCreateViewOpen] =
    useState(false);

  const [selectedStage, setSelectedStage] =
    useState<PipelineStage | null>(null);

  const activeView = useMemo(() => {
    return (
      views.find(
        (view) => view.id === activeViewId,
      ) ?? null
    );
  }, [views, activeViewId]);

  const sortedStages = useMemo(() => {
    if (!activeView) {
      return [];
    }

    return [...activeView.stages].sort(
      (firstStage, secondStage) =>
        firstStage.order - secondStage.order,
    );
  }, [activeView]);

  const activeLeads = useMemo(() => {
    return leads.filter(
      (lead) => lead.viewId === activeViewId,
    );
  }, [leads, activeViewId]);

  const moveLead = useCallback(
    (
      leadId: string,
      destinationStageId: string,
    ) => {
      setLeads((currentLeads) =>
        currentLeads.map((lead) =>
          lead.id === leadId
            ? {
                ...lead,
                stageId: destinationStageId,
                lastActivity: "Just now",
              }
            : lead,
        ),
      );
    },
    [],
  );

  const createView = (view: PipelineView) => {
    setViews((currentViews) => [
      ...currentViews,
      view,
    ]);

    setActiveViewId(view.id);
  };

  const addStage = (stage: PipelineStage) => {
    setViews((currentViews) =>
      currentViews.map((view) =>
        view.id === activeViewId
          ? {
              ...view,
              stages: [...view.stages, stage],
            }
          : view,
      ),
    );
  };

  const updateStage = (
    updatedStage: PipelineStage,
  ) => {
    setViews((currentViews) =>
      currentViews.map((view) =>
        view.id === activeViewId
          ? {
              ...view,
              stages: view.stages.map((stage) =>
                stage.id === updatedStage.id
                  ? updatedStage
                  : stage,
              ),
            }
          : view,
      ),
    );
  };

  const deleteStage = (stageId: string) => {
    if (!activeView || activeView.stages.length <= 1) {
      return;
    }

    const remainingStages = activeView.stages
      .filter((stage) => stage.id !== stageId)
      .sort(
        (firstStage, secondStage) =>
          firstStage.order - secondStage.order,
      )
      .map((stage, index) => ({
        ...stage,
        order: index,
      }));

    const fallbackStageId =
      remainingStages[0]?.id ?? "";

    setViews((currentViews) =>
      currentViews.map((view) =>
        view.id === activeViewId
          ? {
              ...view,
              stages: remainingStages,
            }
          : view,
      ),
    );

    setLeads((currentLeads) =>
      currentLeads.map((lead) =>
        lead.viewId === activeViewId &&
        lead.stageId === stageId
          ? {
              ...lead,
              stageId: fallbackStageId,
            }
          : lead,
      ),
    );
  };

  const moveStage = (
    stageId: string,
    direction: "left" | "right",
  ) => {
    if (!activeView) {
      return;
    }

    const stages = [...activeView.stages].sort(
      (firstStage, secondStage) =>
        firstStage.order - secondStage.order,
    );

    const currentIndex = stages.findIndex(
      (stage) => stage.id === stageId,
    );

    const destinationIndex =
      direction === "left"
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      currentIndex < 0 ||
      destinationIndex < 0 ||
      destinationIndex >= stages.length
    ) {
      return;
    }

    const reorderedStages = [...stages];

    const [movedStage] = reorderedStages.splice(
      currentIndex,
      1,
    );

    reorderedStages.splice(
      destinationIndex,
      0,
      movedStage,
    );

    const normalizedStages = reorderedStages.map(
      (stage, index) => ({
        ...stage,
        order: index,
      }),
    );

    setViews((currentViews) =>
      currentViews.map((view) =>
        view.id === activeViewId
          ? {
              ...view,
              stages: normalizedStages,
            }
          : view,
      ),
    );

    setSelectedStage(
      normalizedStages.find(
        (stage) => stage.id === stageId,
      ) ?? null,
    );
  };

  const handleViewLead = (
    lead: PipelineLead,
  ) => {
    console.log("View lead:", lead);
  };

  const handleEditLead = (
    lead: PipelineLead,
  ) => {
    console.log("Edit lead:", lead);
  };

  if (!activeView) {
    return null;
  }

  const closeView = (viewId: string) => {
  if (views.length <= 1) {
    return;
  }

  const viewIndex = views.findIndex(
    (view) => view.id === viewId,
  );

  if (viewIndex === -1) {
    return;
  }

  const remainingViews = views.filter(
    (view) => view.id !== viewId,
  );

  setViews(remainingViews);

  setLeads((currentLeads) =>
    currentLeads.filter(
      (lead) => lead.viewId !== viewId,
    ),
  );

  if (activeViewId === viewId) {
    const nextView =
      remainingViews[viewIndex] ??
      remainingViews[viewIndex - 1] ??
      remainingViews[0];

    setActiveViewId(nextView?.id ?? "");
  }
};

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <PipelineTabs
          views={views}
          activeViewId={activeViewId}
          onChange={setActiveViewId}
          onCreateView={() => setIsCreateViewOpen(true)}
          onCloseView={closeView}
        />

        <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 dark:border-white/[0.05] sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-gray-800 dark:text-white/90">
              {activeView.name} Pipeline
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Drag leads between stages to update their
              progress.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setIsAddStageOpen(true)
            }
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
          >
            <PlusIcon />
            Add Stage
          </button>
        </div>

        <div className="custom-scrollbar overflow-x-auto">
          <div
            className="grid min-w-max divide-x divide-gray-200 border-t border-gray-200 dark:divide-white/[0.05] dark:border-white/[0.05]"
            style={{
              gridTemplateColumns: `repeat(${Math.max(
                sortedStages.length,
                1,
              )}, minmax(320px, 1fr))`,
            }}
          >
            {sortedStages.map((stage) => (
              <PipelineColumn
                key={stage.id}
                stage={stage}
                leads={activeLeads.filter(
                  (lead) =>
                    lead.stageId === stage.id,
                )}
                onMoveLead={moveLead}
                onEditStage={setSelectedStage}
                onViewLead={handleViewLead}
                onEditLead={handleEditLead}
              />
            ))}
          </div>
        </div>
      </div>

      <ViewSheet
        isOpen={isCreateViewOpen}
        onClose={() =>
          setIsCreateViewOpen(false)
        }
        onCreate={createView}
      />

      <AddStageSheet
        isOpen={isAddStageOpen}
        onClose={() =>
          setIsAddStageOpen(false)
        }
        onSave={addStage}
        nextOrder={sortedStages.length}
      />

      <StageSheet
        isOpen={!!selectedStage}
        stage={selectedStage}
        stageCount={sortedStages.length}
        onClose={() => setSelectedStage(null)}
        onSave={updateStage}
        onDelete={deleteStage}
        onMoveLeft={(stageId) =>
          moveStage(stageId, "left")
        }
        onMoveRight={(stageId) =>
          moveStage(stageId, "right")
        }
      />
    </DndProvider>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="size-4"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}