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
import Avatar from "../ui/avatar/Avatar";
import {
  ExportIcon,
  FilterIcon,
  PencilIcon,
  PlusIcon,
  TrashBinIcon,
  UsersRoundIcon,
  DownloadIcon,
} from "../../icons";
import type { ContactRecord } from "../../api/crm";
import AddContactSheet from "./AddContactSheet";
import {
  useCompaniesQuery,
  useContactsQuery,
  useDeleteContact,
} from "../../hooks/crm/useCrmDirectory";
import { toast } from "sonner";
import { formatDisplayDate } from "../../utils/date";
import { useAuth } from "../../hooks/auth/useAuth";
import { CURRENT_USER_AVATAR, formatUserDisplayName } from "../../utils/user";
import { useCan } from "../../hooks/auth/useCan";
import SearchField from "../search/SearchField";
import { useSearch } from "../../hooks/useSearch";
import { useDebounce } from "../../hooks/useDebounce";
import Checkbox from "../form/input/Checkbox";

type ContactStatus =
  | "Customer"
  | "Prospect"
  | "KYC Pending"
  | "Dormant"
  | "Closed";
type RelationshipLevel = "High" | "Medium" | "Low";
type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

type Contact = {
  id: string | number;
  user: { image: string | null; name: string };
  position: string;
  company: { image: string | null; name: string };
  relationship_level: RelationshipLevel;
  contact: { email: string; phone: string };
  owner: { image: string | null; name: string };
  location: string;
  status: ContactStatus;
  last_activity: string | null;
  company_id?: string | null;
  type_of_client?: string | null;
  risk_profile?: string | null;
  preferred_contact_method?: string | null;
  tags?: string[];
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
  const { user: currentUser } = useAuth();
  const canCreate = useCan("contacts.create");
  const canUpdate = useCan("contacts.update");
  const canDelete = useCan("contacts.delete");
  const { search } = useSearch();
  const debouncedSearch = useDebounce(search, 300);
  const contactsQuery = useContactsQuery();
  const companiesQuery = useCompaniesQuery();
  const contactData = contactsQuery.data;
  const hasContacts = (contactData ?? []).length > 0;
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [selectedIds, setSelectedIds] = useState<Array<Contact["id"]>>([]);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactRecord | null>(
    null,
  );
  const deleteContact = useDeleteContact();

  const filteredData = useMemo(() => {
    return (contactData ?? []).filter((item) =>
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
        .includes(debouncedSearch.toLowerCase()),
    );
  }, [contactData, debouncedSearch]);

  const sortedData = useMemo(() => {
    const valueFor = (contact: Contact) => {
      switch (sortKey) {
        case "name":
          return contact.user.name;
        case "company":
          return contact.company.name;
        case "contact":
          return contact.contact.email;
        case "owner":
          return contact.owner.name;
        default:
          return contact[sortKey];
      }
    };

    const direction = sortOrder === "asc" ? 1 : -1;
    return [...filteredData].sort(
      (left, right) =>
        String(valueFor(left)).localeCompare(
          String(valueFor(right)),
          undefined,
          {
            numeric: true,
            sensitivity: "base",
          },
        ) * direction,
    );
  }, [filteredData, sortKey, sortOrder]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

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

  const handleToggleSelected = (id: Contact["id"]) => {
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
          <SearchField />

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
              aria-label="Import contacts"
              title={canCreate ? "Import contacts" : "Read-only access"}
              disabled={!canCreate}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              <DownloadIcon />
            </button>

            <button
              type="button"
              aria-label="Export contacts"
              title="Export contacts"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              <ExportIcon />
            </button>

            <button
              type="button"
              aria-label="Add contact"
              title={canCreate ? "Add contact" : "Read-only access"}
              disabled={!canCreate}
              onClick={() => {
                setEditingContact(null);
                setIsAddContactOpen(true);
              }}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
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
                  className="w-[52px] max-w-[52px] min-w-[52px] border border-gray-100 bg-white px-4 py-3 text-center dark:border-white/[0.05] dark:bg-gray-900"
                >
                  <Checkbox
                    aria-label="Select all contacts"
                    checked={isCurrentPageSelected}
                    onChange={handleToggleCurrentPage}
                  />
                </TableCell>
                {[
                  { key: "name", label: "Name", width: "w-[250px]" },
                  { key: "company", label: "Company", width: "w-[215px]" },
                  {
                    key: "relationship_level",
                    label: "Relationship Level",
                    width: "w-[165px]",
                  },
                  { key: "contact", label: "Contact Details", width: "w-[250px]" },
                  {
                    key: "owner",
                    label: "Relationship Owner",
                    width: "w-[215px]",
                  },
                  { key: "location", label: "Location", width: "w-[225px]" },
                  { key: "status", label: "Status", width: "w-[135px]" },
                  {
                    key: "last_activity",
                    label: "Last Activity",
                    width: "w-[155px]",
                  },
                  { key: "actions", label: "Actions", width: "w-[110px]" },
                ].map(({ key, label, width }) => (
                  <TableCell
                    key={`${key}-${label}`}
                    isHeader
                    className={`overflow-hidden border border-gray-100 px-4 py-3 dark:border-white/[0.05] ${width} ${key === "name" ? "min-w-[250px] bg-white dark:bg-gray-900" : ""}`}
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
              {contactsQuery.isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="border border-gray-100 px-4 py-10 text-center text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400"
                  >
                    Loading contacts...
                  </TableCell>
                </TableRow>
              ) : contactsQuery.isError ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="border border-gray-100 px-4 py-10 text-center text-sm text-error-500 dark:border-white/[0.05]"
                  >
                    {contactsQuery.error.message}
                  </TableCell>
                </TableRow>
              ) : currentData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="border border-gray-100 px-4 py-10 dark:border-white/[0.05]"
                  >
                    <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
                      <span className="mb-3 flex size-11 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                        <UsersRoundIcon className="size-5" />
                      </span>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {hasContacts
                          ? "No contacts match your search"
                          : "No contacts yet"}
                      </p>
                      <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                        {hasContacts
                          ? "Try adjusting your search to find a contact."
                          : "Add your first contact to start building your directory."}
                      </p>
                      {!hasContacts && (
                        <button
                          type="button"
                          disabled={!canCreate}
                          title={canCreate ? "Add Contact" : "Read-only access"}
                          onClick={() => {
                            setEditingContact(null);
                            setIsAddContactOpen(true);
                          }}
                          className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-brand-500 px-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <PlusIcon className="size-4" /> Add Contact
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentData.map((item) => {
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <TableRow
                      key={item.id}
                      className={
                        isSelected
                          ? "bg-brand-50/40 dark:bg-brand-500/[0.05]"
                          : ""
                      }
                    >
                      <TableCell
                        className={`w-[52px] max-w-[52px] min-w-[52px] border border-gray-100 bg-white px-4 py-3 text-center dark:border-white/[0.05] dark:bg-gray-900 ${
                          isSelected ? "bg-brand-50 dark:bg-gray-900" : ""
                        }`}
                      >
                        <Checkbox
                          aria-label={`Select ${item.user.name}`}
                          checked={isSelected}
                          onChange={() => handleToggleSelected(item.id)}
                        />
                      </TableCell>
                      <TableCell
                        className={`w-[250px] min-w-[250px] border border-gray-100 bg-white px-4 py-3 whitespace-nowrap dark:border-white/[0.05] dark:bg-gray-900 ${
                          isSelected ? "bg-brand-50 dark:bg-gray-900" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={item.user.image}
                            alt={item.user.name}
                            size="medium"
                          />
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
                          <Avatar
                            src={item.company.image}
                            alt={item.company.name}
                            size="xsmall"
                            colorKey={`company-${item.company.name}`}
                          />
                          <span className="truncate">{item.company.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="w-[165px] overflow-hidden border border-gray-100 px-4 py-3 text-theme-sm font-normal whitespace-nowrap text-gray-800 dark:border-white/[0.05] dark:text-gray-400/90">
                        <Badge
                          variant="light"
                          color={
                            relationshipBadgeColor[item.relationship_level]
                          }
                          size="sm"
                        >
                          {item.relationship_level}
                        </Badge>
                      </TableCell>
                      <TableCell className="w-[250px] overflow-hidden border border-gray-100 px-4 py-3 text-theme-sm font-normal whitespace-nowrap text-gray-800 dark:border-white/[0.05] dark:text-gray-400/90">
                        <a
                          href={`mailto:${item.contact.email}`}
                          className="block truncate font-medium text-gray-800 hover:text-brand-500 dark:text-white/90"
                        >
                          {item.contact.email}
                        </a>
                        <a
                          href={`tel:${item.contact.phone}`}
                          className="mt-1 block truncate text-xs text-gray-500 hover:text-brand-500"
                        >
                          {item.contact.phone}
                        </a>
                      </TableCell>
                      <TableCell className="w-[215px] overflow-hidden border border-gray-100 px-4 py-3 text-theme-sm font-normal whitespace-nowrap text-gray-800 dark:border-white/[0.05] dark:text-gray-400/90">
                        <div className="flex min-w-0 items-center gap-2">
                          <Avatar
                            src={
                              item.relationship_owner_id ===
                              currentUser?.entraObjectId
                                ? (currentUser?.avatarUrl ??
                                  CURRENT_USER_AVATAR)
                                : item.owner.image
                            }
                            alt={formatUserDisplayName(item.owner.name)}
                            size="small"
                          />
                          <span className="truncate">
                            {item.relationship_owner_id ===
                            currentUser?.entraObjectId
                              ? "Me"
                              : formatUserDisplayName(item.owner.name)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="w-[225px] overflow-hidden border border-gray-100 px-4 py-3 text-theme-sm font-normal whitespace-nowrap text-gray-800 dark:border-white/[0.05] dark:text-gray-400/90">
                        <p className="truncate" title={item.location}>
                          {item.location}
                        </p>
                      </TableCell>
                      <TableCell className="w-[135px] overflow-hidden border border-gray-100 px-4 py-3 text-theme-sm font-normal whitespace-nowrap text-gray-800 dark:border-white/[0.05] dark:text-gray-400/90">
                        <Badge
                          variant="light"
                          color={statusBadgeColor[item.status]}
                          size="sm"
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="w-[155px] overflow-hidden border border-gray-100 px-4 py-3 text-theme-sm font-normal whitespace-nowrap text-gray-800 dark:border-white/[0.05] dark:text-gray-400/90">
                        {formatDisplayDate(item.last_activity)}
                      </TableCell>
                      <TableCell className="w-[110px] overflow-hidden border border-gray-100 px-4 py-3 text-theme-sm font-normal whitespace-nowrap text-gray-800 dark:border-white/[0.05] dark:text-gray-400/90">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={`Delete ${item.user.name}`}
                            onClick={async () => {
                              if (!window.confirm(`Delete ${item.user.name}?`))
                                return;
                              try {
                                await deleteContact.mutateAsync(item.id);
                                setSelectedIds((ids) =>
                                  ids.filter((id) => id !== item.id),
                                );
                                toast.success("Contact deleted successfully.");
                              } catch (error) {
                                toast.error(
                                  error instanceof Error
                                    ? error.message
                                    : "Unable to delete contact.",
                                );
                              }
                            }}
                            disabled={!canDelete || deleteContact.isPending}
                            title={
                              canDelete
                                ? `Delete ${item.user.name}`
                                : "Read-only access"
                            }
                            className="text-gray-500 hover:text-error-500 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400"
                          >
                            <TrashBinIcon className="size-5" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Edit ${item.user.name}`}
                            disabled={!canUpdate}
                            title={
                              canUpdate
                                ? `Edit ${item.user.name}`
                                : "Read-only access"
                            }
                            onClick={() => {
                              setEditingContact(item);
                              setIsAddContactOpen(true);
                            }}
                            className="text-gray-500 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:text-white/90"
                          >
                            <PencilIcon className="size-5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
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
            onClick={() =>
              handlePageChange(Math.min(totalPages, currentPage + 1))
            }
            className="h-10 rounded-lg border border-gray-300 px-4 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
          >
            Next
          </button>
        </div>
      </div>

      <AddContactSheet
        isOpen={isAddContactOpen}
        onClose={() => {
          setIsAddContactOpen(false);
          setEditingContact(null);
        }}
        companies={companiesQuery.data ?? []}
        companiesLoading={companiesQuery.isLoading}
        contact={editingContact}
      />
    </div>
  );
}
