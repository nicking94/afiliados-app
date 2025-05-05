import Dexie from "dexie";
import { Affiliate, AppSettings, DEFAULT_SETTINGS, Sale } from "../types";

export class AffiliateDB extends Dexie {
  affiliates!: Dexie.Table<Affiliate, number>;
  sales!: Dexie.Table<Sale, number>;
  settings!: Dexie.Table<AppSettings, number>;

  constructor() {
    super("AffiliateDatabase");

    this.version(1).stores({
      affiliates:
        "++id, code, name, lastName, phone, email, referredBy, createdAt",
      sales:
        "++id, affiliateId, clientName, businessName, clientEmail, saleAmount, saleDate, status, createdAt",
      settings: "++id",
    });

    // Initialize the tables
    this.affiliates = this.table("affiliates");
    this.sales = this.table("sales");
    this.settings = this.table("settings");

    this.on("populate", async () => {
      await this.settings.add(DEFAULT_SETTINGS);
    });
  }
}

export const db = new AffiliateDB();
