/**
 * Shared loading primitive for route-level code splitting.  The project does
 * not currently ship the Boneyard package, so this keeps the same skeleton
 * contract local and avoids adding a second UI runtime just for loading state.
 */
export function BoneyardSkeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`block animate-pulse rounded-lg bg-gray-200/80 dark:bg-white/10 ${className}`} />;
}

export function DataLoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading" className="space-y-3 p-5">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-3">
          <BoneyardSkeleton className="size-9 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <BoneyardSkeleton className="h-3 w-1/3" />
            <BoneyardSkeleton className="h-3 w-2/3" />
          </div>
          <BoneyardSkeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

export default function PageLoadingSkeleton() {
  return (
    <div role="status" aria-label="Loading page" className="min-h-screen space-y-6 p-6">
      <BoneyardSkeleton className="h-5 w-40" />
      <BoneyardSkeleton className="h-10 w-72" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <DataLoadingSkeleton rows={6} />
      </div>
    </div>
  );
}
