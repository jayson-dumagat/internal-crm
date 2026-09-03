import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router";
import { useDebounce } from "../useDebounce";
import { useSearch } from "../useSearch";
import { createBrokerageAccount, createComplianceCase, getBrokerageAccounts, getComplianceCases, getKycCases, getSuitabilityProfiles, getBrokerageDocuments, getCommunications, updateBrokerageAccount, updateComplianceCase, updateKycCase, reviewKycCase, uploadBrokerageDocument, createKycCase, createCommunication, getBrokerageAccountSnapshot, createSuitabilityProfile, updateSuitabilityProfile, downloadBrokerageDocument } from "../../api/brokerage";
import type { BrokerageQuery } from "../../api/brokerage";
import type { CreateAccountInput, CreateComplianceInput, CreateSuitabilityInput } from "../../validations/brokerage";

const keys = {
  all: ["brokerage"] as const,
  accounts: () => [...keys.all, "accounts"] as const,
  kyc: () => [...keys.all, "kyc"] as const,
  suitability: () => [...keys.all, "suitability"] as const,
  documents: () => [...keys.all, "documents"] as const,
  compliance: () => [...keys.all, "compliance"] as const,
  communications: () => [...keys.all, "communications"] as const,
};

function useParams(): BrokerageQuery {
  const { search } = useSearch();
  const location = useLocation();
  const debounced = useDebounce(search, 350);
  const params = new URLSearchParams(location.search);
  if (debounced.trim()) params.set("search", debounced.trim()); else params.delete("search");
  return Object.fromEntries(params.entries());
}

export function useBrokerageAccountsQuery() { const params = useParams(); return useQuery({ queryKey: [...keys.accounts(), params], queryFn: () => getBrokerageAccounts(params) }); }
export function useBrokerageAccountSnapshotQuery(id: string | null) { return useQuery({ queryKey: [...keys.accounts(), "snapshot", id], queryFn: () => getBrokerageAccountSnapshot(id as string), enabled: Boolean(id) }); }
export function useKycCasesQuery() { const params = useParams(); return useQuery({ queryKey: [...keys.kyc(), params], queryFn: () => getKycCases(params) }); }
export function useSuitabilityProfilesQuery() { const params = useParams(); return useQuery({ queryKey: [...keys.suitability(), params], queryFn: () => getSuitabilityProfiles(params) }); }
export function useCreateSuitabilityProfile() { const client = useQueryClient(); return useMutation({ mutationFn: (input: CreateSuitabilityInput) => createSuitabilityProfile(input), onSuccess: () => invalidate(client) }); }
export function useUpdateSuitabilityProfile() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, input }: { id: string; input: Partial<CreateSuitabilityInput> }) => updateSuitabilityProfile(id, input), onSuccess: () => invalidate(client) }); }
export function useBrokerageDocumentsQuery() { const params = useParams(); return useQuery({ queryKey: [...keys.documents(), params], queryFn: () => getBrokerageDocuments(params) }); }
export function useComplianceCasesQuery() { const params = useParams(); return useQuery({ queryKey: [...keys.compliance(), params], queryFn: () => getComplianceCases(params) }); }
export function useCommunicationsQuery() { const params = useParams(); return useQuery({ queryKey: [...keys.communications(), params], queryFn: () => getCommunications(params) }); }

function invalidate(client: ReturnType<typeof useQueryClient>) {
  [keys.accounts, keys.kyc, keys.suitability, keys.documents, keys.compliance, keys.communications].forEach((key) => client.invalidateQueries({ queryKey: key() }));
}
export function useCreateBrokerageAccount() { const client = useQueryClient(); return useMutation({ mutationFn: (input: CreateAccountInput) => createBrokerageAccount(input), onSuccess: () => invalidate(client) }); }
export function useUpdateBrokerageAccount() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, input }: { id: string; input: Partial<CreateAccountInput> }) => updateBrokerageAccount(id, input), onSuccess: () => invalidate(client) }); }
export function useCreateKycCase() { const client = useQueryClient(); return useMutation({ mutationFn: (input: Record<string, unknown>) => createKycCase(input), onSuccess: () => invalidate(client) }); }
export function useUpdateKycCase() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, input }: { id: string; input: Record<string, unknown> }) => updateKycCase(id, input), onSuccess: () => invalidate(client) }); }
export function useReviewKycCase() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, decision, notes }: { id: string; decision: string; notes?: string }) => reviewKycCase(id, { decision, notes }), onSuccess: () => invalidate(client) }); }
export function useCreateComplianceCase() { const client = useQueryClient(); return useMutation({ mutationFn: (input: CreateComplianceInput) => createComplianceCase(input), onSuccess: () => invalidate(client) }); }
export function useUpdateComplianceCase() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, input }: { id: string; input: Partial<CreateComplianceInput> }) => updateComplianceCase(id, input), onSuccess: () => invalidate(client) }); }
export function useUploadBrokerageDocument() { const client = useQueryClient(); return useMutation({ mutationFn: ({ file, fields }: { file: File; fields: Record<string, string> }) => uploadBrokerageDocument(file, fields), onSuccess: () => invalidate(client) }); }
export function useDownloadBrokerageDocument() { return useMutation({ mutationFn: (id: string) => downloadBrokerageDocument(id) }); }
export function useCreateCommunication() { const client = useQueryClient(); return useMutation({ mutationFn: (input: Record<string, unknown>) => createCommunication(input), onSuccess: () => invalidate(client) }); }
