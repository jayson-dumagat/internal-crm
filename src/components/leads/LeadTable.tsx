"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import PaginationWithIcon from "../ui/pagination/PaginationWithIcon";
import { ExportIcon, FilterIcon } from "../../icons";
import SearchField from "../ui/search/Search";

// keep your existing tableRowData here
// keep your existing SortKey and SortOrder types here

export default function LeadTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, searchTerm]);

  const filteredAndSortedData = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return tableRowData
      .filter((item) => {
        if (!normalizedSearch) return true;

        return [
          item.user.name,
          item.position,
          item.location,
          item.age,
          item.date,
          item.salary,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      })
      .sort((a, b) => {
        if (sortKey === "name") {
          return sortOrder === "asc"
            ? a.user.name.localeCompare(b.user.name)
            : b.user.name.localeCompare(a.user.name);
        }

        if (sortKey === "salary") {
          const salaryA = Number.parseInt(a[sortKey].replace(/\$|,/g, ""));
          const salaryB = Number.parseInt(b[sortKey].replace(/\$|,/g, ""));
          return sortOrder === "asc" ? salaryA - salaryB : salaryB - salaryA;
        }

        return sortOrder === "asc"
          ? String(a[sortKey]).localeCompare(String(b[sortKey]))
          : String(b[sortKey]).localeCompare(String(a[sortKey]));
      });
  }, [sortKey, sortOrder, searchTerm]);

  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.max(Math.ceil(totalItems / itemsPerPage), 1);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const startEntry = totalItems === 0 ? 0 : startIndex + 1;
  const currentData = filteredAndSortedData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      return;
    }

    setSortKey(key);
    setSortOrder("asc");
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="border-b border-gray-100 px-4 py-4 sm:px-5 dark:border-white/[0.05]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchField
            name="leadSearch"
            value={searchTerm}
            onValueChange={setSearchTerm}
            placeholder="Search leads..."
            containerClassName="w-full lg:w-72"
            autoComplete="off"
          />

          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:justify-end">
            <button
              type="button"
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs sm:flex-none sm:min-w-[100px] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            >
              <FilterIcon />
              Filter
            </button>

            <button
              type="button"
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs sm:flex-none sm:min-w-[100px] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            >
              <ExportIcon />
              Export
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {totalItems} {totalItems === 1 ? "entry" : "entries"}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Show
            </span>

            <div className="relative z-20 bg-transparent">
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="dark:bg-dark-900 h-9 w-[72px] appearance-none rounded-lg border border-gray-300 bg-white bg-none py-2 pr-8 pl-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              >
                {[5, 8, 10].map((value) => (
                  <option
                    key={value}
                    value={value}
                    className="text-gray-500 dark:bg-gray-900 dark:text-gray-400"
                  >
                    {value}
                  </option>
                ))}
              </select>

              <span className="absolute top-1/2 right-2 z-30 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <svg
                  className="stroke-current"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165"
                    stroke=""
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden max-w-full overflow-x-auto md:block">
        <Table>
          <TableHeader className="border-t border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {[
                { key: "name", label: "User" },
                { key: "position", label: "Position" },
                { key: "location", label: "Office" },
                { key: "age", label: "Age" },
                { key: "date", label: "Start Date" },
                { key: "salary", label: "Salary" },
              ].map(({ key, label }) => (
                <TableCell
                  key={key}
                  isHeader
                  className="border border-gray-100 px-4 py-3 dark:border-white/[0.05]"
                >
                  <div
                    className="flex cursor-pointer items-center justify-between"
                    onClick={() => handleSort(key as SortKey)}
                  >
                    <p className="text-theme-xs font-medium text-gray-700 dark:text-gray-400">
                      {label}
                    </p>

                    <button type="button" className="flex flex-col gap-0.5">
                      <svg
                        className={`text-gray-300 dark:text-gray-700 ${
                          sortKey === key && sortOrder === "asc"
                            ? "text-brand-500"
                            : ""
                        }`}
                        width="8"
                        height="5"
                        viewBox="0 0 8 5"
                        fill="none"
                      >
                        <path
                          d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z"
                          fill="currentColor"
                        />
                      </svg>

                      <svg
                        className={`text-gray-300 dark:text-gray-700 ${
                          sortKey === key && sortOrder === "desc"
                            ? "text-brand-500"
                            : ""
                        }`}
                        width="8"
                        height="5"
                        viewBox="0 0 8 5"
                        fill="none"
                      >
                        <path
                          d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="border border-gray-100 px-4 py-3 whitespace-nowrap dark:border-white/[0.05]">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full">
                        <img
                          src={item.user.image}
                          className="size-10"
                          alt="user"
                        />
                      </div>

                      <span className="block text-theme-sm font-medium text-gray-800 dark:text-white/90">
                        {item.user.name}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="border border-gray-100 px-4 py-3 text-theme-sm whitespace-nowrap text-gray-800 dark:border-white/[0.05] dark:text-gray-400/90">
                    {item.position}
                  </TableCell>

                  <TableCell className="border border-gray-100 px-4 py-3 text-theme-sm whitespace-nowrap text-gray-800 dark:border-white/[0.05] dark:text-gray-400/90">
                    {item.location}
                  </TableCell>

                  <TableCell className="border border-gray-100 px-4 py-3 text-theme-sm whitespace-nowrap text-gray-800 dark:border-white/[0.05] dark:text-gray-400/90">
                    {item.age}
                  </TableCell>

                  <TableCell className="border border-gray-100 px-4 py-3 text-theme-sm whitespace-nowrap text-gray-800 dark:border-white/[0.05] dark:text-gray-400/90">
                    {item.date}
                  </TableCell>

                  <TableCell className="border border-gray-100 px-4 py-3 text-theme-sm whitespace-nowrap text-gray-800 dark:border-white/[0.05] dark:text-gray-400/90">
                    {item.salary}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="border border-gray-100 px-4 py-8 text-center text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400"
                >
                  No leads found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="divide-y divide-gray-100 md:hidden dark:divide-white/[0.05]">
        {currentData.length > 0 ? (
          currentData.map((item) => (
            <div key={item.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full">
                  <img src={item.user.image} className="size-11" alt="user" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-theme-sm font-medium text-gray-800 dark:text-white/90">
                    {item.user.name}
                  </h3>

                  <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
                    {item.position}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-1 text-xs text-gray-400 dark:text-gray-500">
                    Office
                  </p>
                  <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.location}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs text-gray-400 dark:text-gray-500">
                    Age
                  </p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.age}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs text-gray-400 dark:text-gray-500">
                    Start Date
                  </p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.date}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs text-gray-400 dark:text-gray-500">
                    Salary
                  </p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.salary}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No leads found.
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 px-4 py-4 sm:px-5 dark:border-white/[0.05]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <p className="text-center text-sm font-medium text-gray-500 xl:text-left dark:text-gray-400">
            Showing {startEntry} to {endIndex} of {totalItems} entries
          </p>

          <PaginationWithIcon
            totalPages={totalPages}
            initialPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}