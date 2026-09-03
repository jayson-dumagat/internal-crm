import { apiClient } from "./client";
import { z } from "zod";
import { getApiErrorMessage } from "./errors";
import { listResponse, singleResponse } from "../validations/api";
import { brokerageAccountSchema, complianceCaseSchema, createAccountInputSchema, createComplianceInputSchema, createSuitabilityInputSchema, documentSchema, kycCaseSchema, suitabilityProfileSchema, communicationRecordSchema } from "../validations/brokerage";
import type { BrokerageAccountRecord, BrokerageDocumentRecord, CommunicationRecord, ComplianceCaseRecord, CreateAccountInput, CreateComplianceInput, CreateSuitabilityInput, KycCaseRecord, SuitabilityProfileRecord } from "../validations/brokerage";

export type BrokerageQuery = Record<string, string | number | undefined>;
export type BrokerageAccountSnapshotRecord = {
  availableCash: string | null;
  accountValue: string | null;
  holdings: unknown[];
  recentTransactions: unknown[];
  orders: unknown[];
  lastTradeAt: string | null;
  inactivityDays: number | null;
  source: string;
  syncedAt: string;
};
const list = <T extends z.ZodType>(schema: T, data: unknown) => listResponse(schema).parse(data).data;
function rethrow(error: unknown, fallback: string): never { throw new Error(getApiErrorMessage(error, fallback)); }

export async function getBrokerageAccounts(params: BrokerageQuery = {}): Promise<BrokerageAccountRecord[]> { try { return list(brokerageAccountSchema, (await apiClient.get("/brokerage/accounts", { params })).data); } catch (e) { return rethrow(e, "Unable to load brokerage accounts."); } }
export async function createBrokerageAccount(input: CreateAccountInput) { try { const response = await apiClient.post("/brokerage/accounts", createAccountInputSchema.parse(input)); return singleResponse(brokerageAccountSchema).parse(response.data).data; } catch (e) { return rethrow(e, "Unable to create brokerage account."); } }
export async function updateBrokerageAccount(id: string, input: Partial<CreateAccountInput>) { try { const response = await apiClient.patch(`/brokerage/accounts/${id}`, input); return singleResponse(brokerageAccountSchema).parse(response.data).data; } catch (e) { return rethrow(e, "Unable to update brokerage account."); } }
export async function getBrokerageAccountSnapshot(id: string): Promise<BrokerageAccountSnapshotRecord | null> { try { return (await apiClient.get(`/brokerage/accounts/${id}/snapshot`)).data.data as BrokerageAccountSnapshotRecord | null; } catch (e) { return rethrow(e, "Unable to load the account snapshot."); } }
export async function getKycCases(params: BrokerageQuery = {}): Promise<KycCaseRecord[]> { try { return list(kycCaseSchema, (await apiClient.get("/brokerage/kyc", { params })).data); } catch (e) { return rethrow(e, "Unable to load KYC cases."); } }
export async function createKycCase(input: Record<string, unknown>) { try { return singleResponse(kycCaseSchema).parse((await apiClient.post("/brokerage/kyc", input)).data).data; } catch (e) { return rethrow(e, "Unable to create KYC case."); } }
export async function updateKycCase(id: string, input: Record<string, unknown>) { try { return singleResponse(kycCaseSchema).parse((await apiClient.patch(`/brokerage/kyc/${id}`, input)).data).data; } catch (e) { return rethrow(e, "Unable to update KYC case."); } }
export async function reviewKycCase(id: string, input: { decision: string; notes?: string }) { try { return (await apiClient.post(`/brokerage/kyc/${id}/reviews`, input)).data.data; } catch (e) { return rethrow(e, "Unable to save KYC review."); } }
export async function getSuitabilityProfiles(params: BrokerageQuery = {}): Promise<SuitabilityProfileRecord[]> { try { return list(suitabilityProfileSchema, (await apiClient.get("/brokerage/suitability", { params })).data); } catch (e) { return rethrow(e, "Unable to load suitability profiles."); } }
export async function createSuitabilityProfile(input: CreateSuitabilityInput) { try { return singleResponse(suitabilityProfileSchema).parse((await apiClient.post("/brokerage/suitability", createSuitabilityInputSchema.parse(input))).data).data; } catch (e) { return rethrow(e, "Unable to create suitability profile."); } }
export async function updateSuitabilityProfile(id: string, input: Partial<CreateSuitabilityInput>) { try { return singleResponse(suitabilityProfileSchema).parse((await apiClient.patch(`/brokerage/suitability/${id}`, input)).data).data; } catch (e) { return rethrow(e, "Unable to update suitability profile."); } }
export async function getBrokerageDocuments(params: BrokerageQuery = {}): Promise<BrokerageDocumentRecord[]> { try { return list(documentSchema, (await apiClient.get("/brokerage/documents", { params })).data); } catch (e) { return rethrow(e, "Unable to load brokerage documents."); } }
export async function downloadBrokerageDocument(id: string) { try { const response = await apiClient.get(`/brokerage/documents/${id}/download`, { responseType: "blob" }); return response.data as Blob; } catch (e) { return rethrow(e, "Unable to download document."); } }
export async function uploadBrokerageDocument(file: File, fields: Record<string, string>) { try { const form = new FormData(); form.append("file", file); Object.entries(fields).forEach(([key, value]) => form.append(key, value)); return singleResponse(documentSchema).parse((await apiClient.post("/brokerage/documents", form, { headers: { "Content-Type": "multipart/form-data" } })).data).data; } catch (e) { return rethrow(e, "Unable to upload document."); } }
export async function getComplianceCases(params: BrokerageQuery = {}): Promise<ComplianceCaseRecord[]> { try { return list(complianceCaseSchema, (await apiClient.get("/brokerage/compliance", { params })).data); } catch (e) { return rethrow(e, "Unable to load compliance queue."); } }
export async function createComplianceCase(input: CreateComplianceInput) { try { return singleResponse(complianceCaseSchema).parse((await apiClient.post("/brokerage/compliance", createComplianceInputSchema.parse(input))).data).data; } catch (e) { return rethrow(e, "Unable to create compliance case."); } }
export async function updateComplianceCase(id: string, input: Partial<CreateComplianceInput>) { try { return singleResponse(complianceCaseSchema).parse((await apiClient.patch(`/brokerage/compliance/${id}`, input)).data).data; } catch (e) { return rethrow(e, "Unable to update compliance case."); } }
export async function getCommunications(params: BrokerageQuery = {}): Promise<CommunicationRecord[]> { try { return list(communicationRecordSchema, (await apiClient.get("/brokerage/communications", { params })).data); } catch (e) { return rethrow(e, "Unable to load communications."); } }
export async function createCommunication(input: Record<string, unknown>) { try { return singleResponse(communicationRecordSchema).parse((await apiClient.post("/brokerage/communications", input)).data).data; } catch (e) { return rethrow(e, "Unable to record communication."); } }
