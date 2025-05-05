import SaleList from "@/app/components/sales/SaleList";

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Registro de Ventas</h1>

      <SaleList />
    </div>
  );
}
