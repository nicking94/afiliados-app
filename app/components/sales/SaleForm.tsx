"use client";

import { db } from "@/app/lib/db";
import { Affiliate, SaleFormValues } from "@/app/types";
import { useState, useEffect } from "react";

export default function SaleForm({
  onSave,
  onCancel,
  affiliateId,
}: {
  onSave: () => void;
  onCancel: () => void;
  affiliateId?: number;
}) {
  const [formData, setFormData] = useState<SaleFormValues>({
    affiliateId: affiliateId || 0,
    clientName: "",
    clientEmail: "",
    saleAmount: 0,
    saleDate: new Date(),
    status: "pending",
    notes: "",
  });

  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fixedCommission, setFixedCommission] = useState<number>(15000);

  useEffect(() => {
    const loadData = async () => {
      // Cargar lista de afiliados
      const allAffiliates = await db.affiliates
        .where("status")
        .equals("accepted")
        .toArray();
      setAffiliates(allAffiliates);

      // Cargar configuración de comisión
      const settings = await db.settings.get(1);
      if (settings) {
        setFixedCommission(settings.fixedCommission);
      }

      // Si se pasó un affiliateId, establecerlo como predeterminado
      if (affiliateId) {
        setFormData((prev) => ({
          ...prev,
          affiliateId,
        }));
      }
    };

    loadData();
  }, [affiliateId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "saleAmount" ? Number(value) : value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim())
      newErrors.clientName = "Nombre del cliente es requerido";
    if (formData.saleAmount <= 0)
      newErrors.saleAmount = "Monto debe ser mayor a 0";
    if (!formData.affiliateId)
      newErrors.affiliateId = "Debe seleccionar un afiliado";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await db.sales.add({
        ...formData,

        saleDate: new Date(formData.saleDate),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      onSave();
    } catch (error) {
      console.error("Error saving sale:", error);
      setErrors({
        submit: "Error al registrar la venta. Por favor intente nuevamente.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.submit && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Afiliado *
          </label>
          <select
            name="affiliateId"
            value={formData.affiliateId}
            onChange={handleChange}
            disabled={!!affiliateId}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.affiliateId ? "border-red-500" : "border"
            }`}
          >
            <option value="">Seleccionar afiliado</option>
            {affiliates.map((affiliate) => (
              <option key={affiliate.id} value={affiliate.id}>
                {affiliate.name} {affiliate.lastName} ({affiliate.code})
              </option>
            ))}
          </select>
          {errors.affiliateId && (
            <p className="mt-1 text-sm text-red-600">{errors.affiliateId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Comisión
          </label>
          <input
            type="text"
            value={`$${fixedCommission.toLocaleString()}`}
            readOnly
            className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre del Cliente *
          </label>
          <input
            type="text"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.clientName ? "border-red-500" : "border"
            }`}
          />
          {errors.clientName && (
            <p className="mt-1 text-sm text-red-600">{errors.clientName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email del Cliente
          </label>
          <input
            type="email"
            name="clientEmail"
            value={formData.clientEmail}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Monto de Venta *
          </label>
          <input
            type="number"
            name="saleAmount"
            min="0"
            step="0.01"
            value={formData.saleAmount}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.saleAmount ? "border-red-500" : "border"
            }`}
          />
          {errors.saleAmount && (
            <p className="mt-1 text-sm text-red-600">{errors.saleAmount}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fecha de Venta
          </label>
          <input
            type="date"
            name="saleDate"
            value={
              formData.saleDate instanceof Date
                ? formData.saleDate.toISOString().split("T")[0]
                : formData.saleDate
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                saleDate: new Date(e.target.value),
              })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notas</label>
        <textarea
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Detalles adicionales sobre la venta"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Registrar Venta
        </button>
      </div>
    </form>
  );
}
