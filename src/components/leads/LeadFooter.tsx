import Pagination from "../pagination/Pagination";

type LeadFooterProps = {
  startEntry: number;
  endIndex: number;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
};

const LeadFooter = ({
  startEntry,
  endIndex,
  totalItems,
  totalPages,
  currentPage,
  setCurrentPage,
}: LeadFooterProps) => {
  return (
    <div className="border-t border-gray-100 px-4 py-4 sm:px-5 dark:border-white/[0.05]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <p className="hidden text-center text-sm font-medium text-gray-500 md:block xl:text-left dark:text-gray-400">
          Showing {startEntry} to {endIndex} of {totalItems} leads
        </p>

        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default LeadFooter;
