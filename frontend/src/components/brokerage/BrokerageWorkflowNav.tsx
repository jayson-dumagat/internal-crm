import { Link, useLocation } from "react-router";

import { usePermission } from "../../context/PermissionContext";

export type BrokerageWorkspace =
  | "accounts"
  | "kyc"
  | "suitability"
  | "documents"
  | "communications"
  | "compliance";

const steps: Array<{
  id: BrokerageWorkspace;
  label: string;
  path: string;
  permission: string;
}> = [
  { id: "accounts", label: "1. Accounts", path: "/brokerage-accounts", permission: "brokerageAccounts.read" },
  { id: "kyc", label: "2. KYC / AML", path: "/kyc-aml", permission: "kyc.read" },
  { id: "suitability", label: "3. Suitability", path: "/suitability", permission: "suitability.read" },
  { id: "documents", label: "4. Documents", path: "/document-vault", permission: "documents.read" },
  { id: "compliance", label: "5. Compliance", path: "/compliance", permission: "compliance.read" },
  { id: "communications", label: "6. Communications", path: "/communications", permission: "communications.read" },
];

export default function BrokerageWorkflowNav({ active }: { active: BrokerageWorkspace }) {
  const location = useLocation();
  const { can } = usePermission();
  const visibleSteps = steps.filter((step) => can(step.permission));

  return (
    <nav aria-label="Brokerage workflow" className="overflow-x-auto">
      <ol className="flex min-w-max items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900">
        {visibleSteps.map((step) => {
          const selected = step.id === active || location.pathname === step.path;
          return (
            <li key={step.id}>
              <Link
                to={step.path}
                aria-current={selected ? "page" : undefined}
                className={`block rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  selected
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.04] dark:hover:text-gray-200"
                }`}
              >
                {step.label}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
