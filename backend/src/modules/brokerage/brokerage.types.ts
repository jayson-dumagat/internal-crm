export enum BrokerageAccountType {
  CASH = "cash",
  MARGIN = "margin",
}

export enum BrokerageAccountStatus {
  PENDING = "pending",
  ACTIVE = "active",
  SUSPENDED = "suspended",
  DORMANT = "dormant",
  CLOSED = "closed",
}

export enum FundingStatus {
  NOT_FUNDED = "not_funded",
  PARTIALLY_FUNDED = "partially_funded",
  FUNDED = "funded",
  WITHDRAWAL_HOLD = "withdrawal_hold",
}

export enum KycStatus {
  PENDING = "pending",
  IN_REVIEW = "in_review",
  NEEDS_INFORMATION = "needs_information",
  APPROVED = "approved",
  REJECTED = "rejected",
  EXPIRED = "expired",
}

export enum ScreeningStatus {
  NOT_STARTED = "not_started",
  CLEAR = "clear",
  POTENTIAL_MATCH = "potential_match",
  CONFIRMED_MATCH = "confirmed_match",
  REVIEW_REQUIRED = "review_required",
}

export enum SuitabilityStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  EXPIRED = "expired",
}

export enum DocumentCategory {
  ID = "id",
  ACCOUNT_OPENING = "account_opening",
  CORPORATE_REGISTRATION = "corporate_registration",
  TAX_FORM = "tax_form",
  RISK_DISCLOSURE = "risk_disclosure",
  SIGNED_AGREEMENT = "signed_agreement",
  PROOF_OF_ADDRESS = "proof_of_address",
  BENEFICIAL_OWNERSHIP = "beneficial_ownership",
  OTHER = "other",
}

export enum ComplianceCaseType {
  KYC_RENEWAL = "kyc_renewal",
  SUSPICIOUS_ACTIVITY = "suspicious_activity",
  UNUSUAL_TRANSACTION = "unusual_transaction",
  WATCHLIST = "watchlist",
  SUITABILITY_EXCEPTION = "suitability_exception",
  DORMANT_ACCOUNT = "dormant_account",
  COMPLAINT = "complaint",
  SUPERVISOR_APPROVAL = "supervisor_approval",
  MANUAL_OVERRIDE = "manual_override",
}

export enum ComplianceStatus {
  OPEN = "open",
  IN_REVIEW = "in_review",
  ESCALATED = "escalated",
  RESOLVED = "resolved",
  CLOSED = "closed",
}

export enum CommunicationType {
  CALL = "call",
  EMAIL = "email",
  TRADE_INSTRUCTION = "trade_instruction",
  RESEARCH_RECOMMENDATION = "research_recommendation",
  DISCLOSURE_SENT = "disclosure_sent",
  CONSENT = "consent",
  COMPLAINT = "complaint",
  OTHER = "other",
}

export enum CommunicationDirection {
  INBOUND = "inbound",
  OUTBOUND = "outbound",
  INTERNAL = "internal",
}
