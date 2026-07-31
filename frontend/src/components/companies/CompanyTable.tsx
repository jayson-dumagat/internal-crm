import { useMemo, useState } from "react";
import {
  ExportIcon,
  FilterIcon,
  PencilIcon,
  PlusIcon,
  TrashBinIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";

type CompanyStatus = "Active" | "Prospect" | "Dormant";
type SortKey =
  | "name"
  | "industry"
  | "location"
  | "employees"
  | "revenue"
  | "website"
  | "customerSince"
  | "status"
  | "lastActivity";

type Company = {
  id: number;
  name: string;
  industry: string;
  location: string;
  employees: string;
  revenue: string;
  contacts: Array<{ name: string; avatar: string }>;
  website: string;
  customerSince: string;
  tags: string[];
  status: CompanyStatus;
  lastActivity: string;
};

const companies: Company[] = [
  {
    id: 1,
    name: "Northbridge Capital",
    industry: "Investment Management",
    location: "Makati City, Philippines",
    employees: "51–200",
    revenue: "₱850M",
    contacts: [
      { name: "Abram Schleifer", avatar: "/images/user/user-20.jpg" },
      { name: "Sarah Lim", avatar: "/images/user/user-21.jpg" },
    ],
    website: "northbridgecapital.com",
    customerSince: "12 Mar 2021",
    tags: ["VIP", "Institutional"],
    status: "Active",
    lastActivity: "28 Jul 2026",
  },
  {
    id: 2,
    name: "Anderson Holdings",
    industry: "Diversified Holdings",
    location: "Taguig City, Philippines",
    employees: "201–500",
    revenue: "₱2.4B",
    contacts: [
      { name: "Charlotte Anderson", avatar: "/images/user/user-23.jpg" },
      { name: "Mark Santos", avatar: "/images/user/user-24.jpg" },
      { name: "Mia Cruz", avatar: "/images/user/user-25.jpg" },
    ],
    website: "andersonholdings.com",
    customerSince: "08 Sep 2022",
    tags: ["High Value", "Corporate"],
    status: "Active",
    lastActivity: "30 Jul 2026",
  },
  {
    id: 3,
    name: "Lumina Ventures",
    industry: "Venture Capital",
    location: "Pasig City, Philippines",
    employees: "11–50",
    revenue: "₱320M",
    contacts: [
      { name: "Ethan Brown", avatar: "/images/user/user-26.jpg" },
      { name: "Ana Dela Cruz", avatar: "/images/user/user-27.jpg" },
    ],
    website: "luminaventures.ph",
    customerSince: "19 Jan 2024",
    tags: ["Partner", "Referral"],
    status: "Prospect",
    lastActivity: "24 Jul 2026",
  },
  {
    id: 4,
    name: "Martinez Family Office",
    industry: "Family Office",
    location: "Bonifacio Global City",
    employees: "11–50",
    revenue: "₱1.1B",
    contacts: [
      { name: "Sophia Martinez", avatar: "/images/user/user-28.jpg" },
      { name: "John Reyes", avatar: "/images/user/user-22.jpg" },
    ],
    website: "martinezfamilyoffice.com",
    customerSince: "15 Jun 2023",
    tags: ["HNW", "Decision Maker"],
    status: "Active",
    lastActivity: "Today",
  },
  {
    id: 5,
    name: "Pacific Crest Partners",
    industry: "Financial Services",
    location: "Cebu City, Philippines",
    employees: "51–200",
    revenue: "₱670M",
    contacts: [{ name: "James Wilson", avatar: "/images/user/user-29.jpg" }],
    website: "pacificcrestpartners.com",
    customerSince: "02 Nov 2020",
    tags: ["Institutional"],
    status: "Dormant",
    lastActivity: "03 May 2026",
  },
  {
    id: 6,
    name: "Meridian Securities",
    industry: "Brokerage",
    location: "Mandaluyong City, Philippines",
    employees: "201–500",
    revenue: "₱1.8B",
    contacts: [
      { name: "Olivia Johnson", avatar: "/images/user/user-30.jpg" },
      { name: "William Smith", avatar: "/images/user/user-31.jpg" },
    ],
    website: "meridiansecurities.ph",
    customerSince: "21 Feb 2019",
    tags: ["Strategic", "Institutional"],
    status: "Active",
    lastActivity: "29 Jul 2026",
  },
];

const columns: Array<{ key: SortKey | "contacts" | "tags" | "actions"; label: string; width: number }> = [
  { key: "industry", label: "Industry", width: 175 },
  { key: "location", label: "Location", width: 205 },
  { key: "employees", label: "Employees", width: 115 },
  { key: "revenue", label: "Revenue", width: 115 },
  { key: "contacts", label: "Contacts", width: 125 },
  { key: "website", label: "Website", width: 205 },
  { key: "customerSince", label: "Customer Since", width: 145 },
  { key: "tags", label: "Tags", width: 200 },
  { key: "status", label: "Status", width: 110 },
  { key: "lastActivity", label: "Last Activity", width: 145 },
  { key: "actions", label: "Action", width: 100 },
];

const statusColor = {
  Active: "success",
  Prospect: "primary",
  Dormant: "light",
} as const;

export default function CompanyTable() {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [sort, setSort] = useState<{ key: SortKey; descending: boolean }>({
    key: "name",
    descending: false,
  });
  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = term
      ? companies.filter((company) =>
          [
            company.name,
            company.industry,
            company.location,
            company.website,
            company.status,
            company.tags.join(" "),
          ]
            .join(" ")
            .toLowerCase()
            .includes(term),
        )
      : companies;

    return [...filtered].sort((a, b) => {
      const result = String(a[sort.key]).localeCompare(String(b[sort.key]), undefined, {
        numeric: true,
        sensitivity: "base",
      });
      return sort.descending ? -result : result;
    });
  }, [search, sort]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const visibleRows = rows.slice((page - 1) * pageSize, page * pageSize);
  const allVisibleSelected =
    visibleRows.length > 0 && visibleRows.every((row) => selected.includes(row.id));

  const changeSort = (key: SortKey) => {
    setSort((current) => ({
      key,
      descending: current.key === key ? !current.descending : false,
    }));
  };

  const togglePage = () => {
    const ids = visibleRows.map((row) => row.id);
    setSelected((current) =>
      allVisibleSelected
        ? current.filter((id) => !ids.includes(id))
        : Array.from(new Set([...current, ...ids])),
    );
  };

  return (
    <section className="w-full min-w-0 overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-2.5 sm:pr-5 md:flex-row md:items-center md:justify-between dark:border-white/[0.05]">
        <div className="relative md:w-[280px]">
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search..."
            className="h-9 w-full rounded-lg border border-gray-300 bg-transparent pr-3.5 pl-10 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2 [&_svg]:size-4">
          <button className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]">
            <FilterIcon /> Filter
          </button>
          <button className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]">
            <ExportIcon /> Export
          </button>
          <button className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]">
            <PlusIcon /> Add Company
          </button>
        </div>
      </div>

      <div className="w-full min-w-0 overflow-x-auto custom-scrollbar">
        <table className="w-[1932px] min-w-[1932px] table-fixed border-separate border-spacing-0 [&_td]:px-3.5 [&_td]:py-3 [&_th]:px-3.5 [&_th]:py-2.5">
          <colgroup>
            <col style={{ width: 52 }} />
            <col style={{ width: 240 }} />
            {columns.map((column) => <col key={column.key} style={{ width: column.width }} />)}
          </colgroup>
          <thead>
            <tr>
              <th className="border border-gray-100 bg-white px-4 py-3 dark:border-white/[0.05] dark:bg-gray-900">
                <input type="checkbox" checked={allVisibleSelected} onChange={togglePage} className="size-4 rounded border-gray-300 text-brand-500" />
              </th>
              <th className="border border-gray-100 bg-white px-4 py-3 text-left dark:border-white/[0.05] dark:bg-gray-900">
                <button onClick={() => changeSort("name")} className="w-full text-left text-theme-xs font-medium text-gray-700 dark:text-gray-400">Name</button>
              </th>
              {columns.map((column) => (
                <th key={column.key} className="border border-gray-100 px-4 py-3 text-left dark:border-white/[0.05]">
                  {column.key === "contacts" || column.key === "tags" || column.key === "actions" ? (
                    <span className="text-theme-xs font-medium text-gray-700 dark:text-gray-400">{column.label}</span>
                  ) : (
                    <button onClick={() => changeSort(column.key as SortKey)} className="w-full text-left text-theme-xs font-medium text-gray-700 dark:text-gray-400">{column.label}</button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((company) => {
              const isSelected = selected.includes(company.id);
              return (
                <tr key={company.id} className={isSelected ? "bg-brand-50/40 dark:bg-brand-500/[0.05]" : ""}>
                  <td className={`border border-gray-100 px-4 py-4 text-center dark:border-white/[0.05] ${isSelected ? "bg-brand-50 dark:bg-gray-900" : "bg-white dark:bg-gray-900"}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => setSelected((current) => current.includes(company.id) ? current.filter((id) => id !== company.id) : [...current, company.id])}
                      className="size-4 rounded border-gray-300 text-brand-500"
                    />
                  </td>
                  <td className={`border border-gray-100 px-4 py-4 dark:border-white/[0.05] ${isSelected ? "bg-brand-50 dark:bg-gray-900" : "bg-white dark:bg-gray-900"}`}>
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-xs font-semibold text-brand-600 dark:bg-brand-500/15">{company.name.split(" ").map((word) => word[0]).slice(0, 2).join("")}</span>
                      <span className="truncate text-theme-sm font-medium text-gray-800 dark:text-white">{company.name}</span>
                    </div>
                  </td>
                  <td className="truncate border border-gray-100 px-4 py-4 text-theme-sm text-gray-700 dark:border-white/[0.05] dark:text-gray-400">{company.industry}</td>
                  <td className="truncate border border-gray-100 px-4 py-4 text-theme-sm text-gray-700 dark:border-white/[0.05] dark:text-gray-400">{company.location}</td>
                  <td className="border border-gray-100 px-4 py-4 text-theme-sm text-gray-700 dark:border-white/[0.05] dark:text-gray-400">{company.employees}</td>
                  <td className="border border-gray-100 px-4 py-4 text-theme-sm text-gray-700 dark:border-white/[0.05] dark:text-gray-400">{company.revenue}</td>
                  <td className="border border-gray-100 px-4 py-4 dark:border-white/[0.05]">
                    <div className="flex -space-x-2">{company.contacts.map((contact) => <img key={contact.name} src={contact.avatar} alt={contact.name} title={contact.name} className="size-7 rounded-full border-2 border-white object-cover dark:border-gray-900" />)}</div>
                  </td>
                  <td className="truncate border border-gray-100 px-4 py-4 text-theme-sm dark:border-white/[0.05]"><a href={`https://${company.website}`} target="_blank" rel="noreferrer" className="text-brand-500 hover:text-brand-600">{company.website}</a></td>
                  <td className="border border-gray-100 px-4 py-4 text-theme-sm text-gray-700 dark:border-white/[0.05] dark:text-gray-400">{company.customerSince}</td>
                  <td className="border border-gray-100 px-4 py-4 dark:border-white/[0.05]"><div className="flex gap-1.5 overflow-hidden">{company.tags.map((tag) => <Badge key={tag} color="light" size="sm">{tag}</Badge>)}</div></td>
                  <td className="border border-gray-100 px-4 py-4 dark:border-white/[0.05]"><Badge color={statusColor[company.status]} size="sm">{company.status}</Badge></td>
                  <td className="border border-gray-100 px-4 py-4 text-theme-sm text-gray-700 dark:border-white/[0.05] dark:text-gray-400">{company.lastActivity}</td>
                  <td className="border border-gray-100 px-4 py-4 dark:border-white/[0.05]"><div className="flex gap-2"><button aria-label={`Delete ${company.name}`} className="text-gray-500 hover:text-error-500"><TrashBinIcon className="size-5" /></button><button aria-label={`Edit ${company.name}`} className="text-gray-500 hover:text-gray-800"><PencilIcon className="size-5" /></button></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.05]">
        <label className="flex items-center gap-2 text-sm text-gray-500">
          Show
          <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="h-9 rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700 dark:bg-gray-900">
            {[5, 8, 10].map((size) => <option key={size}>{size}</option>)}
          </select>
          entries
        </label>
        <div className="flex items-center gap-2">
          <button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="h-10 rounded-lg border border-gray-300 px-4 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300">Previous</button>
          <span className="flex size-10 items-center justify-center rounded-lg bg-brand-500 text-sm text-white">{page}</span>
          <button disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className="h-10 rounded-lg border border-gray-300 px-4 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300">Next</button>
        </div>
      </div>
    </section>
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
