export type SaleStatus = "pending" | "verified" | "paid";

export interface Sale {
  id?: number;
  affiliateId: number;
  clientName: string;
  businessName?: string;
  clientEmail: string;
  saleAmount: number;

  saleDate: Date;
  status: SaleStatus;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export type SaleFormValues = Omit<Sale, "id" | "commission">;
