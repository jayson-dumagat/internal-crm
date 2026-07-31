type LeadFooterProps = {
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (value: number) => void;
};

const LeadFooter = ({
  totalPages,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
}: LeadFooterProps) => {
  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.05]">
      <label className="flex items-center gap-2 text-sm text-gray-500">
        Show
        <select
          value={itemsPerPage}
          onChange={(event) => {
            setItemsPerPage(Number(event.target.value));
            setCurrentPage(1);
          }}
          className="h-9 rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700 dark:bg-gray-900"
        >
          {[5, 8, 10].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        entries
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          className="h-10 rounded-lg border border-gray-300 px-4 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
        >
          Previous
        </button>
        <span className="flex size-10 items-center justify-center rounded-lg bg-brand-500 text-sm text-white">
          {currentPage}
        </span>
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          className="h-10 rounded-lg border border-gray-300 px-4 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default LeadFooter;
