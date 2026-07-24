import { ArrowLeftAltIcon, ArrowRightAltIcon } from "../../icons";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
};

type PaginationItem = number | "ellipsis-left" | "ellipsis-right";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) => {
  const safeTotalPages = Math.max(totalPages, 1);
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), safeTotalPages);

  const canGoPrevious = safeCurrentPage > 1;
  const canGoNext = safeCurrentPage < safeTotalPages;

  const handlePageChange = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), safeTotalPages);

    if (nextPage !== safeCurrentPage) {
      onPageChange(nextPage);
    }
  };

  const getPaginationItems = (): PaginationItem[] => {
    const totalVisiblePages = siblingCount * 2 + 5;

    if (safeTotalPages <= totalVisiblePages) {
      return Array.from({ length: safeTotalPages }, (_, index) => index + 1);
    }

    const leftSibling = Math.max(safeCurrentPage - siblingCount, 1);
    const rightSibling = Math.min(
      safeCurrentPage + siblingCount,
      safeTotalPages,
    );

    const shouldShowLeftEllipsis = leftSibling > 2;
    const shouldShowRightEllipsis = rightSibling < safeTotalPages - 1;

    if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
      const leftRange = Array.from(
        { length: 3 + siblingCount * 2 },
        (_, index) => index + 1,
      );

      return [...leftRange, "ellipsis-right", safeTotalPages];
    }

    if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
      const rightRange = Array.from(
        { length: 3 + siblingCount * 2 },
        (_, index) => safeTotalPages - (3 + siblingCount * 2) + 1 + index,
      );

      return [1, "ellipsis-left", ...rightRange];
    }

    const middleRange = Array.from(
      { length: rightSibling - leftSibling + 1 },
      (_, index) => leftSibling + index,
    );

    return [
      1,
      "ellipsis-left",
      ...middleRange,
      "ellipsis-right",
      safeTotalPages,
    ];
  };

  const paginationItems = getPaginationItems();

  return (
    <nav
      className="flex items-center justify-between gap-2 px-4 py-4 sm:justify-normal sm:px-6"
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => handlePageChange(safeCurrentPage - 1)}
        disabled={!canGoPrevious}
        aria-label="Go to previous page"
        className="inline-flex size-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-theme-xs transition hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:size-11 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
      >
        <ArrowLeftAltIcon />
      </button>

      <span className="block text-sm font-medium text-gray-700 sm:hidden dark:text-gray-400">
        Page {safeCurrentPage} of {safeTotalPages}
      </span>

      <ul className="hidden items-center gap-0.5 sm:flex">
        {paginationItems.map((item) => {
          if (typeof item === "string") {
            return (
              <li key={item}>
                <span className="flex size-10 items-center justify-center rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400">
                  ...
                </span>
              </li>
            );
          }

          const isActive = item === safeCurrentPage;

          return (
            <li key={item}>
              <button
                type="button"
                onClick={() => handlePageChange(item)}
                aria-label={`Go to page ${item}`}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "flex size-10 items-center justify-center rounded-lg text-sm font-medium transition",
                  isActive
                    ? "bg-brand-500 text-white hover:bg-brand-500 hover:text-white"
                    : "text-gray-700 hover:bg-brand-500 hover:text-white dark:text-gray-400 dark:hover:text-white",
                ].join(" ")}
              >
                {item}
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => handlePageChange(safeCurrentPage + 1)}
        disabled={!canGoNext}
        aria-label="Go to next page"
        className="inline-flex size-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-theme-xs transition hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:size-11 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
      >
        <ArrowRightAltIcon />
      </button>
    </nav>
  );
};

export default Pagination;
