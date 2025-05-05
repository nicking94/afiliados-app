export type AffiliateStatus = "pending" | "accepted";

export interface Affiliate {
  id?: number;
  name: string;
  lastName: string;
  phone: string;
  email: string;
  code: string;
  status: AffiliateStatus;
  referredBy?: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  bankAccount?: string;
}

export type StatusFilter = "all" | "pending" | "accepted";

export type AffiliateFormValues = Omit<
  Affiliate,
  "id" | "createdAt" | "updatedAt"
>;
