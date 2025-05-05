"use client";

import { db } from "@/app/lib/db";
import { Affiliate, Sale, StatusFilter } from "@/app/types";
import { useState, useEffect } from "react";
import SaleForm from "./SaleForm";
import { formatDate } from "@/app/lib/utils";

export default function SaleList() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<number | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    const loadData = async () => {
      const allAffiliates = await db.affiliates.toArray();
      setAffiliates(allAffiliates);

      let query = db.sales.orderBy("saleDate").reverse();

      if (statusFilter !== "all") {
        query = query.filter((sale) => sale.status === statusFilter);
      }

      if (selectedAffiliate) {
        query = query.filter((sale) => sale.affiliateId === selectedAffiliate);
      }

      const allSales = await query.toArray();
      setSales(allSales);
    };

    loadData();
  }, [statusFilter, selectedAffiliate]);

  const getAffiliateName = (id: number) => {
    const affiliate = affiliates.find((a) => a.id === id);
    return affiliate ? `${affiliate.name} ${affiliate.lastName}` : "N/A";
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold">Registro de Ventas</h2>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={affiliates.length === 0}
        >
          + Registrar Venta
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filtrar por afiliado
          </label>
          <select
            value={selectedAffiliate || ""}
            onChange={(e) =>
              setSelectedAffiliate(
                e.target.value ? Number(e.target.value) : null
              )
            }
            className="w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">Todos</option>
            {affiliates.map((affiliate) => (
              <option key={affiliate.id} value={affiliate.id}>
                {affiliate.name} {affiliate.lastName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filtrar por estado
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="verified">Verificadas</option>
            <option value="paid">Pagadas</option>
          </select>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <SaleForm
            onSave={() => {
              setShowForm(false);
              setSelectedAffiliate(null);
              setStatusFilter("all");
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Afiliado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comisión
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sales.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No se encontraron ventas
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getAffiliateName(sale.affiliateId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sale.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${sale.saleAmount.toLocaleString()}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(sale.saleDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        sale.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : sale.status === "verified"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {sale.status === "paid"
                        ? "Pagada"
                        : sale.status === "verified"
                        ? "Verificada"
                        : "Pendiente"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
