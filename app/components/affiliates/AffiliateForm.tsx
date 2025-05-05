"use client";

import { db } from "@/app/lib/db";
import { generateUniqueCode, validateEmail } from "@/app/lib/utils";
import { Affiliate, AffiliateFormValues } from "@/app/types";
import { useState, useEffect } from "react";

export default function AffiliateForm({
  affiliate,
  onSave,
  onCancel,
}: {
  affiliate?: Affiliate;
  onSave: (newAffiliate?: Affiliate) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<AffiliateFormValues>({
    name: "",
    lastName: "",
    phone: "",
    email: "",
    status: "pending",
    notes: "", // Inicializado como string vacío
    bankAccount: "",
    code: affiliate?.code || generateUniqueCode(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (affiliate) {
      setFormData({
        name: affiliate.name,
        lastName: affiliate.lastName,
        phone: affiliate.phone,
        email: affiliate.email,
        status: affiliate.status,
        notes: affiliate.notes ?? "",
        bankAccount: affiliate.bankAccount ?? "",
        code: affiliate.code,
      });
    }
  }, [affiliate]);

  // Un solo manejador para todos los campos
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Nombre es requerido";
    if (!formData.lastName.trim()) newErrors.lastName = "Apellido es requerido";
    if (!formData.phone.trim()) newErrors.phone = "Teléfono es requerido";
    if (!formData.email.trim()) newErrors.email = "Email es requerido";
    if (!validateEmail(formData.email)) newErrors.email = "Email no válido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (affiliate && affiliate.id) {
        await db.affiliates.update(affiliate.id, {
          ...formData,
          updatedAt: new Date(),
        });
        onSave(); // No pasamos datos para edición
      } else {
        // Creamos el objeto completo con fechas
        const fullAffiliate = {
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date(),
          referredBy: affiliate?.referredBy,
          status: "pending" as const, // Aseguramos el tipo
        };

        const id = await db.affiliates.add(fullAffiliate);

        // Obtenemos el registro completo recién creado
        const createdAffiliate = await db.affiliates.get(id);
        if (!createdAffiliate) {
          throw new Error("No se pudo recuperar el afiliado creado");
        }

        onSave(createdAffiliate);
      }
    } catch (error) {
      console.error("Error saving affiliate:", error);
      setErrors({
        submit: "Error al guardar el afiliado. Por favor intente nuevamente.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-black">
      {errors.submit && (
        <div className="bg-red-100 border border-red-400 text-xs text-red-700 px-4 py-3 rounded">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`p-1 outline-none mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${
              errors.name ? "border-red-500" : "border"
            }`}
          />
          {errors.name && (
            <p className="text-xs mt-1 text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Apellido *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`p-1 outline-none mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${
              errors.lastName ? "border-red-500" : "border"
            }`}
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Teléfono *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`p-1 outline-none mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${
              errors.phone ? "border-red-500" : "border"
            }`}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`p-1 outline-none mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${
              errors.email ? "border-red-500" : "border"
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700">
            Código de Afiliado
          </label>
          <input
            type="text"
            name="code"
            value={formData.code}
            readOnly
            className="p-1 text-black outline-none mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm "
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Cuenta Bancaria
        </label>
        <input
          type="text"
          name="bankAccount"
          value={formData.bankAccount || ""}
          onChange={handleChange}
          placeholder="Número de cuenta o alias para transferencias"
          className="p-1 outline-none text-black mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm  sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notas</label>
        <textarea
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          rows={3}
          className="text-black placeholder:text-gray-400 outline-none mt-1 block w-full rounded-md border border-gray-300 shadow-sm sm:text-sm p-2"
          placeholder="Información adicional sobre el afiliado"
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
          {affiliate ? "Actualizar Afiliado" : "Crear Afiliado"}
        </button>
      </div>
    </form>
  );
}
