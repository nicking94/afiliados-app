import AffiliateList from "@/app/components/affiliates/AffiliateList";
import AffiliateStats from "@/app/components/affiliates/AffiliateStats";

export default function AffiliatesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestión de Afiliados</h1>
      <AffiliateStats />
      <AffiliateList />
    </div>
  );
}
