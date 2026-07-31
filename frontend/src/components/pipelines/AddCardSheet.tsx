import { useState } from "react";

import Sheet from "../ui/sheet/Sheet";

export type NewPipelineCard = {
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
};

type AddCardSheetProps = {
  isOpen: boolean;
  stageName: string;
  onClose: () => void;
  onSave: (card: NewPipelineCard) => void;
};

const inputClassName =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs outline-none transition placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800";

export default function AddCardSheet({
  isOpen,
  stageName,
  onClose,
  onSave,
}: AddCardSheetProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const resetForm = () => {
    setName("");
    setRole("");
    setCompany("");
    setEmail("");
    setPhone("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = () => {
    if (!name.trim()) {
      return;
    }

    onSave({
      name: name.trim(),
      role: role.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
    handleClose();
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Pipeline Card"
      description={`Create a new card in ${stageName}.`}
      side="right"
      className="w-full sm:max-w-lg"
    >
      <div className="space-y-5">
        <FormField label="Name">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClassName}
            placeholder="Enter contact name"
            autoFocus
          />
        </FormField>

        <FormField label="Role">
          <input
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className={inputClassName}
            placeholder="Enter role or job title"
          />
        </FormField>

        <FormField label="Company">
          <input
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            className={inputClassName}
            placeholder="Enter company"
          />
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Email">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClassName}
              placeholder="name@company.com"
            />
          </FormField>

          <FormField label="Phone">
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={inputClassName}
              placeholder="+63"
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-white/[0.05]">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!name.trim()}
            onClick={handleSave}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add Card
          </button>
        </div>
      </div>
    </Sheet>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
      {children}
    </label>
  );
}
