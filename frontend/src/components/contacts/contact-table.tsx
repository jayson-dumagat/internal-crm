"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Badge from "../ui/badge/Badge";
import {
  ExportIcon,
  FilterIcon,
  PencilIcon,
  PlusIcon,
  TrashBinIcon,
} from "../../icons";

type ContactStatus = "Customer" | "Prospect" | "KYC Pending" | "Dormant" | "Closed";
type RelationshipLevel = "High" | "Medium" | "Low";
type BadgeColor = "primary" | "success" | "error" | "warning" | "info" | "light" | "dark";

type Contact = {
  id: number;
  user: { image: string; name: string };
  position: string;
  company: { image: string; name: string };
  relationship_level: RelationshipLevel;
  contact: { email: string; phone: string };
  owner: { image: string; name: string };
  location: string;
  status: ContactStatus;
  last_activity: string;
};

const statusBadgeColor: Record<ContactStatus, BadgeColor> = {
  Customer: "success",
  Prospect: "primary",
  "KYC Pending": "warning",
  Dormant: "light",
  Closed: "error",
};

const relationshipBadgeColor: Record<RelationshipLevel, BadgeColor> = {
  High: "success",
  Medium: "warning",
  Low: "light",
};

const tableRowData: Contact[] = [
  {
    id: 1,
    user: {
      image: "/images/user/user-20.jpg",
      name: "Abram Schleifer",
    },
    position: "Sales Assistant",
    company: {
      image: "/images/user/user-20.jpg",
      name: "Northbridge Capital",
    },
    relationship_level: "High",
    contact: {
      email: "abram@schleifer.com",
      phone: "+63912887665"
    },
    owner: {
      image: "/images/user/user-20.jpg",
      name: "Kiko Pangilinan"
    },
    location: "Makati, Philippines",
    status: "Customer",
    last_activity: "12 July 2026"
  },

  {
    id: 2,
    user: {
      image: "/images/user/user-21.jpg",
      name: "Charlotte Anderson",
    },
    position: "Managing Director",
    company: {
      image: "/images/user/user-23.jpg",
      name: "Anderson Holdings",
    },
    relationship_level: "Medium",
    contact: {
      email: "charlotte@andersonholdings.com",
      phone: "+63 917 555 0182",
    },
    owner: {
      image: "/images/user/user-24.jpg",
      name: "Mark Santos",
    },
    location: "Taguig, Philippines",
    status: "KYC Pending",
    last_activity: "18 July 2026",
  },

  {
    id: 3,
    user: {
      image: "/images/user/user-26.jpg",
      name: "Ethan Brown",
    },
    position: "Investor",
    company: {
      image: "/images/user/user-26.jpg",
      name: "Individual",
    },
    relationship_level: "Low",
    contact: {
      email: "ethan@email.com",
      phone: "+63 917 555 0111",
    },
    owner: {
      image: "/images/user/user-27.jpg",
      name: "Ana Dela Cruz",
    },
    location: "Quezon City, Philippines",
    status: "Prospect",
    last_activity: "10 July 2026",
  },
];

type SortKey =
  | "name"
  | "position"
  | "company"
  | "relationship_level"
  | "contact"
  | "owner"
  | "location"
  | "status"
  | "last_activity";
type SortOrder = "asc" | "desc";

export default function ContactTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const filteredData = useMemo(() => {
    return tableRowData.filter((item) =>
        [
          item.user.name,
          item.position,
          item.company.name,
          item.contact.email,
          item.contact.phone,
          item.owner.name,
          item.location,
          item.status,
          item.last_activity,
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      );
  }, [searchTerm]);

  const sortedData = useMemo(() => {
    const valueFor = (contact: Contact) => {
      switch (sortKey) {
        case "name": return contact.user.name;
        case "company": return contact.company.name;
        case "contact": return contact.contact.email;
        case "owner": return contact.owner.name;
        default: return contact[sortKey];
      }
    };

    const direction = sortOrder === "asc" ? 1 : -1;
    return [...filteredData].sort(
      (left, right) =>
        String(valueFor(left)).localeCompare(String(valueFor(right)), undefined, {
          numeric: true,
          sensitivity: "base",
        }) * direction,
    );
  }, [filteredData, sortKey, sortOrder]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = sortedData.slice(startIndex, endIndex);
  const isCurrentPageSelected =
    currentData.length > 0 &&
    currentData.every((item) => selectedIds.includes(item.id));

  const handleToggleSelected = (id: number) => {
    setSelectedIds((currentIds) =>
      currentIds.includes(id)
        ? currentIds.filter((selectedId) => selectedId !== id)
        : [...currentIds, id],
    );
  };

  const handleToggleCurrentPage = () => {
    const currentPageIds = currentData.map((item) => item.id);

    setSelectedIds((currentIds) =>
      isCurrentPageSelected
        ? currentIds.filter((id) => !currentPageIds.includes(id))
        : Array.from(new Set([...currentIds, ...currentPageIds])),
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="border-b border-gray-100 px-4 py-2.5 sm:pr-5 dark:border-white/[0.05]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative min-w-0 flex-1 sm:w-72 sm:flex-none">
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="dark:bg-dark-900 h-9 w-full rounded-lg border border-gray-300 bg-transparent py-2 pr-3.5 pl-10 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden xl:w-[280px] dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 [&_svg]:size-4">
            <button
              type="button"
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              <FilterIcon />
              <span>Filter</span>
            </button>

            <button
              type="button"
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              <ExportIcon />
              <span>Export</span>
            </button>

            <button
              type="button"
              aria-label="Add contact"
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              <PlusIcon />
              <span>Add Contact</span>
            </button>
          </div>
        </div>
      </div>

      <div className="custom-scrollbar max-w-full overflow-x-auto">
        <div>
          <Table className="w-[1772px] min-w-[1772px] table-fixed border-separate border-spacing-0 [&_td]:px-3.5 [&_td]:py-3 [&_th]:px-3.5 [&_th]:py-2.5">
            <colgroup>
              {[52, 250, 215, 165, 250, 215, 225, 135, 155, 110].map(
                (width, index) => (
                  <col key={index} style={{ width }} />
                ),
              )}
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableCell
                  isHeader
                  className="sticky left-0 z-30 w-[52px] min-w-[52px] max-w-[52px] border border-gray-100 bg-white px-4 py-3 text-center dark:border-white/[0.05] dark:bg-gray-900"
                >
                  <input
                    type="checkbox"
                    aria-label="Select all contacts on this page"
                    checked={isCurrentPageSelected}
                    onChange={handleToggleCurrentPage}
                    className="size-4 cursor-pointer rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900"
                  />
                </TableCell>
                {[
                  { key: "name", label: "Name", width: "w-[250px]" },
                  { key: "company", label: "Company", width: "w-[215px]" },
                  { key: "relationship_level", label: "Relationship Level", width: "w-[165px]" },
                  { key: "contact", label: "Contact", width: "w-[250px]" },
                  { key: "owner", label: "Relationship Owner", width: "w-[215px]" },
                  { key: "location", label: "Location", width: "w-[225px]" },
                  { key: "status", label: "Status", width: "w-[135px]" },
                  { key: "last_activity", label: "Last Activity", width: "w-[155px]" },
                  { key: "actions", label: "Actions", width: "w-[110px]" },
                ].map(({ key, label, width }) => (
                  <TableCell
                    key={`${key}-${label}`}
                    isHeader
                    className={`overflow-hidden border border-gray-100 px-4 py-3 dark:border-white/[0.05] ${width} ${
                      key === "name"
                        ? "sticky left-[52px] z-30 min-w-[250px] bg-white shadow-[1px_0_0_#f2f4f7] dark:bg-gray-900 dark:shadow-[1px_0_0_rgba(255,255,255,0.05)]"
                        : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="w-full cursor-pointer text-left"
                      onClick={() => {
                        if (key !== "actions") {
                          handleSort(key as SortKey);
                        }
                      }}
                    >
                      <p className="text-theme-xs font-medium text-gray-700 dark:text-gray-400">
                        {label}
                      </p>
                    </button>
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((item) => {
                const isSelected = selectedIds.includes(item.id);

                return (
                <TableRow
                  key={item.id}
                  className={isSelected ? "bg-brand-50/40 dark:bg-brand-500/[0.05]" : ""}
                >
                  <TableCell
                    className={`sticky left-0 z-20 w-[52px] min-w-[52px] max-w-[52px] border border-gray-100 bg-white px-4 py-3 text-center dark:border-white/[0.05] dark:bg-gray-900 ${
                      isSelected ? "bg-brand-50 dark:bg-gray-900" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      aria-label={`Select ${item.user.name}`}
                      checked={isSelected}
                      onChange={() => handleToggleSelected(item.id)}
                      className="size-4 cursor-pointer rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900"
                    />
                  </TableCell>
                  <TableCell
                    className={`sticky left-[52px] z-20 w-[250px] min-w-[250px] border border-gray-100 bg-white px-4 py-3 whitespace-nowrap shadow-[1px_0_0_#f2f4f7] dark:border-white/[0.05] dark:bg-gray-900 dark:shadow-[1px_0_0_rgba(255,255,255,0.05)] ${
                      isSelected ? "bg-brand-50 dark:bg-gray-900" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-9 overflow-hidden rounded-full">
                        <img
                          src={item.user.image}
                          className="size-9"
                          alt="user"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="block truncate text-theme-sm font-medium text-gray-800 dark:text-white/90">
                          {item.user.name}
                        </span>
                        <span className="mt-0.5 block truncate text-sm text-gray-500 dark:text-gray-400">
                          {item.position}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="w-[215px] overflow-hidden border border-gray-100 px-4 py-3 text-theme-sm font-normal whitespace-nowrap text-gray-800 dark:border-white/[0.05] dark:text-gray-400/90">
                    <div className="flex min-w-0 items-center gap-2">
                      <img src={item.company.image} alt="" className="size-7 shrink-0 rounded-full object-cover" />
                      <span className="truncate">{item.company.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="w-[165px] overflow-hidden border border-gray-100 px-4 py-3 text-theme-sm font-normal whitespace-nowrap text-gray-800 dark:border-white/[0.05] dark:text-gray-400/90">
                    <Badge
                      variant="light"
                      color={relationshipBadgeColor[item.relationship_level]}
                      size="sm"
                    >
                      {item.relationship_level}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-[250px] overflow-hidden border border-gray-100 px-4 py-3 text-theme-sm font-normal whitespace-nowrap text-gray-800 dark:border-white/[0.05] dark:text-gray-400/90">
                    <a href={`mailto:${item.contact.email}`} className="block truncate font-medium text-gray-800 hover:text-brand-500 dark:text-white/90">
                      {item.contact.email}
                    </a>
                    <a href={`tel:${item.contact.phone}`} className="mt-1 block truncate text-xs text-gray-500 hover:text-brand-500">
                      {item.contact.phone}
                    </a>
                  </TableCell>
                  <TableCell className="w-[215px] overflow-hidden border border-gray-100 px-4 py-3 text-theme-sm font-normal whitespace-nowrap text-gray-800 dark:border-white/[0.05] dark:text-gray-400/90">
                    <div className="flex min-w-0 items-center gap-2">
                      <img src={item.owner.image} alt="" className="size-7 shrink-0 rounded-full object-cover" />
                      <span className="truncate">{item.owner.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="w-[225px] overflow-hidden border border-gray-100 px-4 py-3 text-theme-sm font-normal whitespace-nowrap text-gray-800 dark:border-white/[0.05] dark:text-gray-400/90">
                    <p className="truncate" title={item.location}>{item.location}</p>
                  </TableCell>
                  <TableCell className="w-[135px] overflow-hidden border border-gray-100 px-4 py-3 text-theme-sm font-normal whitespace-nowrap text-gray-800 dark:border-white/[0.05] dark:text-gray-400/90">
                    <Badge variant="light" color={statusBadgeColor[item.status]} size="sm">
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-[155px] overflow-hidden border border-gray-100 px-4 py-3 text-theme-sm font-normal whitespace-nowrap text-gray-800 dark:border-white/[0.05] dark:text-gray-400/90">
                    {item.last_activity}
                  </TableCell>
                  <TableCell className="w-[110px] overflow-hidden border border-gray-100 px-4 py-3 text-theme-sm font-normal whitespace-nowrap text-gray-800 dark:border-white/[0.05] dark:text-gray-400/90">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Delete ${item.user.name}`}
                        className="text-gray-500 hover:text-error-500 dark:text-gray-400"
                      >
                        <TrashBinIcon className="size-5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Edit ${item.user.name}`}
                        className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
                      >
                        <PencilIcon className="size-5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

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
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
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
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            className="h-10 rounded-lg border border-gray-300 px-4 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-4.5">
      <path
        d="m14.25 14.25 3 3m-1.5-8.5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
