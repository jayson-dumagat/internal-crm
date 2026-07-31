import {
  useCallback,
  useMemo,
  useState,
} from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";

import PipelineColumn from "./PipelineColumn";
import PipelineTabs from "./PipelineTabs";
import Sheet from "../ui/sheet/Sheet";
import StageSheet, {
  AddStageSheet,
} from "./StageSheet";
import ViewSheet from "./ViewSheet";
import AddCardSheet, {
  type NewPipelineCard,
} from "./AddCardSheet";

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
  const [isEditViewOpen, setIsEditViewOpen] =
    useState(false);
  const [isFilterOpen, setIsFilterOpen] =
    useState(false);
  const [leadSearch, setLeadSearch] = useState("");
  const [viewNameDraft, setViewNameDraft] =
    useState("");

  const [selectedStage, setSelectedStage] =
    useState<PipelineStage | null>(null);
  const [cardStage, setCardStage] =
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
    const term = leadSearch.trim().toLowerCase();
    return leads.filter(
      (lead) =>
        lead.viewId === activeViewId &&
        (!term ||
          [lead.name, lead.company, lead.source, lead.owner.name]
            .join(" ")
            .toLowerCase()
            .includes(term)),
    );
  }, [leads, activeViewId, leadSearch]);

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

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over) {
      moveLead(String(active.id), String(over.id));
    }
  };

  const createView = (view: PipelineView) => {
    if (views.length >= 6) {
      return;
    }

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

  const updateActiveViewName = () => {
    const trimmedName = viewNameDraft.trim();

    if (!trimmedName) {
      return;
    }

    setViews((currentViews) =>
      currentViews.map((view) =>
        view.id === activeViewId
          ? { ...view, name: trimmedName }
          : view,
      ),
    );
    setIsEditViewOpen(false);
  };

  const addCard = (card: NewPipelineCard) => {
    if (!cardStage) {
      return;
    }

    const newLead: PipelineLead = {
      id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      viewId: activeViewId,
      stageId: cardStage.id,
      name: card.name,
      avatar: "/images/user/user-01.jpg",
      role: card.role || "Contact",
      email: card.email,
      phone: card.phone,
      company: card.company || "Individual",
      source: "Manual",
      owner: {
        name: "Unassigned",
        avatar: "/images/user/user-01.jpg",
      },
      assignedTo: {
        name: "Unassigned",
        avatar: "/images/user/user-01.jpg",
      },
      progress: 0,
      dateCreated: new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date()),
      lastActivity: "Just now",
      address: "",
    };

    setLeads((currentLeads) => [...currentLeads, newLead]);
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
    <DndContext onDragEnd={handleDragEnd}>
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <PipelineTabs
          views={views}
          activeViewId={activeViewId}
          onChange={setActiveViewId}
          onCreateView={() => setIsCreateViewOpen(true)}
          onCloseView={closeView}
          canCreateView={views.length < 6}
          actions={
            <>
              <button
                type="button"
                onClick={() => {
                  setViewNameDraft(activeView.name);
                  setIsEditViewOpen(true);
                }}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                <EditIcon />
                Edit Pipeline
              </button>
              <button
                type="button"
                onClick={() => setIsFilterOpen(true)}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                <FilterIcon />
                Filter
              </button>
              <button
                type="button"
                onClick={() => setIsAddStageOpen(true)}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                <PlusIcon />
                Add Stage
              </button>
            </>
          }
        />

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
                onEditStage={setSelectedStage}
                onAddCard={setCardStage}
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

      <Sheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Pipeline"
        description="Filter cards in the active pipeline."
        side="right"
        className="w-full sm:max-w-lg"
      >
        <div className="space-y-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search cards
            </span>
            <input
              value={leadSearch}
              onChange={(event) => setLeadSearch(event.target.value)}
              placeholder="Name, company, source, or owner"
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs outline-none transition placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </label>
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-white/[0.05]">
            <button
              type="button"
              onClick={() => setLeadSearch("")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setIsFilterOpen(false)}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </Sheet>

      <Sheet
        isOpen={isEditViewOpen}
        onClose={() => setIsEditViewOpen(false)}
        title="Edit Pipeline"
        description="Update the active pipeline name."
        side="right"
        className="w-full sm:max-w-lg"
      >
        <div className="space-y-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Pipeline Name
            </span>
            <input
              value={viewNameDraft}
              onChange={(event) =>
                setViewNameDraft(event.target.value)
              }
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs outline-none transition placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              placeholder="Enter pipeline name"
              autoFocus
            />
          </label>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-white/[0.05]">
            <button
              type="button"
              onClick={() => setIsEditViewOpen(false)}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!viewNameDraft.trim()}
              onClick={updateActiveViewName}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Sheet>

      <AddCardSheet
        isOpen={!!cardStage}
        stageName={cardStage?.name ?? ""}
        onClose={() => setCardStage(null)}
        onSave={addCard}
      />
    </DndContext>
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

function EditIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="size-4"
    >
      <path
        d="M13.5 6.5l4 4M5 19l3.5-.75L18 7.75a1.77 1.77 0 000-2.5 1.77 1.77 0 00-2.5 0L5.75 15 5 19z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="size-4"
    >
      <path
        d="M4 6h16M7 12h10M10 18h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
