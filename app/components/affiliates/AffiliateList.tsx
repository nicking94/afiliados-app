"use client";

import { db } from "@/app/lib/db";
import { Affiliate, StatusFilter, Sale } from "@/app/types";
import { useState, useEffect } from "react";
import AffiliateForm from "./AffiliateForm";
import { formatDate } from "@/app/lib/utils";
import { Dialog } from "@headlessui/react";

export default function AffiliateList() {
  // Estados del componente
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [editingAffiliate, setEditingAffiliate] = useState<
    Affiliate | undefined
  >();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalAffiliates, setTotalAffiliates] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para ventas
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [currentAffiliate, setCurrentAffiliate] = useState<Affiliate | null>(
    null
  );
  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);
  const [salesHistoryModalOpen, setSalesHistoryModalOpen] = useState(false);
  const initialSaleState = {
    clientName: "",
    businessName: "",
    clientEmail: "",
    saleAmount: 0,
    saleDate: new Date().toISOString().split("T")[0],
    notes: "",
  };

  const [newSale, setNewSale] = useState(initialSaleState);
  const reloadAffiliates = async () => {
    setIsLoading(true);
    try {
      // Obtener conteo total
      const countQuery = db.affiliates;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const allAffiliates = await countQuery.toArray();
        const filtered = allAffiliates.filter(
          (aff) =>
            aff.name?.toLowerCase().includes(term) ||
            aff.lastName?.toLowerCase().includes(term) ||
            aff.email?.toLowerCase().includes(term) ||
            aff.phone?.includes(searchTerm) ||
            aff.code?.toLowerCase().includes(term)
        );
        setTotalAffiliates(filtered.length);
      } else {
        const total = await countQuery.count();
        setTotalAffiliates(total);
      }

      // Obtener datos paginados
      const query = db.affiliates
        .orderBy("createdAt")
        .reverse()
        .offset((currentPage - 1) * itemsPerPage)
        .limit(itemsPerPage);

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const allAffiliates = await query.toArray();
        const filtered = allAffiliates.filter(
          (aff) =>
            aff.name?.toLowerCase().includes(term) ||
            aff.lastName?.toLowerCase().includes(term) ||
            aff.email?.toLowerCase().includes(term) ||
            aff.phone?.includes(searchTerm) ||
            aff.code?.toLowerCase().includes(term)
        );
        setAffiliates(filtered);
      } else {
        const paginatedAffiliates = await query.toArray();
        setAffiliates(paginatedAffiliates);
      }
    } catch (error) {
      console.error("Error loading affiliates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carga inicial de afiliados y cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
    reloadAffiliates();
  }, [searchTerm, statusFilter]);

  // Recargar cuando cambia la paginación
  useEffect(() => {
    reloadAffiliates();
  }, [currentPage, itemsPerPage]);

  // Manejadores de acciones
  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este afiliado?")) {
      try {
        await db.affiliates.delete(id);
        await reloadAffiliates();
      } catch (error) {
        console.error("Error deleting affiliate:", error);
      }
    }
  };

  const handleEdit = (affiliate: Affiliate) => {
    setEditingAffiliate(affiliate);
    setIsModalOpen(true);
  };

  const handleFormSuccess = async (newAffiliate?: Affiliate) => {
    try {
      if (newAffiliate && !editingAffiliate) {
        setAffiliates((prev) => [newAffiliate, ...prev]);
      }
      await reloadAffiliates();
      setIsModalOpen(false);
      setEditingAffiliate(undefined);

      // Disparar evento para actualizar stats
      window.dispatchEvent(new CustomEvent("affiliateUpdated"));

      if (!editingAffiliate) {
        setSearchTerm("");
        setStatusFilter("all");
      }
    } catch (error) {
      console.error("Error updating affiliates list:", error);
    }
  };

  const openNewAffiliateModal = () => {
    setEditingAffiliate(undefined);
    setIsModalOpen(true);
  };

  // Funciones para manejar ventas
  const openAddSaleModal = (affiliate: Affiliate) => {
    setCurrentAffiliate(affiliate);
    setNewSale(initialSaleState);
    setIsSaleModalOpen(true);
  };

  const openSalesHistory = async (affiliate: Affiliate) => {
    setCurrentAffiliate(affiliate);
    try {
      const sales = await db.sales
        .where("affiliateId")
        .equals(affiliate.id!)
        .toArray();
      setSalesHistory(sales);
      setSalesHistoryModalOpen(true);
    } catch (error) {
      console.error("Error loading sales history:", error);
    }
  };

  const handleCancelSale = () => {
    setIsSaleModalOpen(false);
    setNewSale(initialSaleState);
  };

  const handleAddSale = async () => {
    if (!currentAffiliate?.id) {
      alert("No se ha seleccionado un afiliado válido");
      return;
    }

    if (!newSale.clientName.trim() || newSale.saleAmount <= 0) {
      alert("Por favor complete todos los campos requeridos");
      return;
    }

    try {
      const saleDate = new Date(newSale.saleDate);
      // Ajusta la fecha para evitar el cambio de día
      saleDate.setMinutes(saleDate.getMinutes() + saleDate.getTimezoneOffset());

      const saleData: Sale = {
        affiliateId: currentAffiliate.id,
        clientName: newSale.clientName,
        businessName: newSale.businessName,
        clientEmail: newSale.clientEmail,
        saleAmount: newSale.saleAmount,
        saleDate: saleDate,
        status: "pending",
        notes: newSale.notes,
        createdAt: new Date(),
      };

      await db.sales.add(saleData);

      // Reset form
      setNewSale(initialSaleState);
      setIsSaleModalOpen(false);
      alert("Venta registrada exitosamente");

      // Actualizar historial
      await openSalesHistory(currentAffiliate);
    } catch (error) {
      console.error("Error al registrar venta:", error);
      alert(
        `Error: ${
          error instanceof Error
            ? error.message
            : "No se pudo registrar la venta"
        }`
      );
    }
  };

  const Pagination = () => {
    const totalPages = Math.ceil(totalAffiliates / itemsPerPage);
    const [pageRange, setPageRange] = useState<number[]>([]);

    useEffect(() => {
      const maxVisiblePages = 5;
      let startPage = Math.max(
        1,
        currentPage - Math.floor(maxVisiblePages / 2)
      );
      let endPage = startPage + maxVisiblePages - 1;

      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      const range = [];
      for (let i = startPage; i <= endPage; i++) {
        range.push(i);
      }
      setPageRange(range);
    }, [currentPage, totalPages]);

    if (totalAffiliates === 0) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
        <div className="flex items-center">
          <span className="text-sm text-gray-700 mr-2">Mostrar:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-700">
          Mostrando {(currentPage - 1) * itemsPerPage + 1} -{" "}
          {Math.min(currentPage * itemsPerPage, totalAffiliates)} de{" "}
          {totalAffiliates}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md border ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Anterior
          </button>

          {!pageRange.includes(1) && (
            <>
              <button
                onClick={() => setCurrentPage(1)}
                className={`px-3 py-1 rounded-md border ${
                  currentPage === 1
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                1
              </button>
              {!pageRange.includes(2) && <span className="px-2">...</span>}
            </>
          )}

          {pageRange.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded-md border ${
                currentPage === page
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}

          {!pageRange.includes(totalPages) && (
            <>
              {!pageRange.includes(totalPages - 1) && (
                <span className="px-2">...</span>
              )}
              <button
                onClick={() => setCurrentPage(totalPages)}
                className={`px-3 py-1 rounded-md border ${
                  currentPage === totalPages
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage >= totalPages}
            className={`px-3 py-1 rounded-md border ${
              currentPage >= totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Siguiente
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 ">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Lista de Afiliados
        </h2>
        <button
          onClick={openNewAffiliateModal}
          className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <span className="mr-1">+</span> Nuevo Afiliado
        </button>
      </div>

      <div className="mb-6">
        <div className="w-full mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="placeholder:text-gray-400 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nombre, email, código..."
          />
        </div>
      </div>

      {/* Modal para formulario de edición/creación */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            <Dialog.Title className="text-xl font-semibold mb-8 text-gray-800">
              {editingAffiliate ? "Editar Afiliado" : "Nuevo Afiliado"}
            </Dialog.Title>
            <AffiliateForm
              affiliate={editingAffiliate}
              onSave={handleFormSuccess}
              onCancel={() => {
                setIsModalOpen(false);
                setEditingAffiliate(undefined);
              }}
            />
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Modal para agregar venta */}
      <Dialog
        open={isSaleModalOpen}
        onClose={handleCancelSale}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <Dialog.Title className="text-xl font-semibold mb-4 text-gray-800">
              Registrar Venta para {currentAffiliate?.name}{" "}
              {currentAffiliate?.lastName}
            </Dialog.Title>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Negocio
                </label>
                <input
                  type="text"
                  value={newSale.businessName}
                  onChange={(e) =>
                    setNewSale({ ...newSale, businessName: e.target.value })
                  }
                  className="placeholder:text-gray-400 outline-none text-black w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                  placeholder="Nombre del negocio"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del dueño
                </label>
                <input
                  type="text"
                  value={newSale.clientName}
                  onChange={(e) =>
                    setNewSale({ ...newSale, clientName: e.target.value })
                  }
                  className="placeholder:text-gray-400 outline-none text-black w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                  placeholder="Nombre del dueño"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comisión
                </label>
                <input
                  type="number"
                  value={newSale.saleAmount || ""}
                  onChange={(e) =>
                    setNewSale({
                      ...newSale,
                      saleAmount: Number(e.target.value) || 0,
                    })
                  }
                  className="placeholder:text-gray-400 outline-none text-black w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                  placeholder="Monto de la comisión"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Venta
                </label>
                <input
                  type="date"
                  value={newSale.saleDate}
                  onChange={(e) =>
                    setNewSale({ ...newSale, saleDate: e.target.value })
                  }
                  className="placeholder:text-gray-400 outline-none text-black w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={newSale.notes}
                  onChange={(e) =>
                    setNewSale({ ...newSale, notes: e.target.value })
                  }
                  className="placeholder:text-gray-400 outline-none text-black w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                  placeholder="Notas adicionales"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCancelSale}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddSale}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Registrar Venta
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Modal para historial de ventas */}
      <Dialog
        open={salesHistoryModalOpen}
        onClose={() => setSalesHistoryModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl max-h-[80vh] overflow-y-auto">
            <Dialog.Title className="text-xl font-semibold mb-4 text-gray-800">
              Historial de Ventas - {currentAffiliate?.name}{" "}
              {currentAffiliate?.lastName}
            </Dialog.Title>

            {salesHistory.length === 0 ? (
              <p className="text-gray-500">
                No hay ventas registradas para este afiliado.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Empresa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dueño
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {salesHistory.map((sale) => (
                      <tr key={sale.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">
                          {sale.businessName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sale.clientName}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${sale.saleAmount.toFixed(2)}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(sale.saleDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSalesHistoryModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cerrar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Tabla de resultados */}
      <div className="overflow-x-auto h-[47vh]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cuenta/Alias
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : affiliates.length === 0 ? (
              <tr className="w-full">
                <td
                  colSpan={6}
                  className="p-6 text-center text-sm text-gray-500"
                >
                  No se encontraron afiliados
                </td>
              </tr>
            ) : (
              affiliates.map((affiliate) => (
                <tr key={affiliate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 uppercase">
                          {affiliate.name} {affiliate.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {affiliate.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {affiliate.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {affiliate.bankAccount || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {affiliate.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(affiliate.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-4">
                    <button
                      onClick={() => openAddSaleModal(affiliate)}
                      className="cursor-pointer text-green-600 hover:text-green-800 transition-colors"
                      title="Agregar venta"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => openSalesHistory(affiliate)}
                      className="cursor-pointer text-blue-600 hover:text-blue-800 transition-colors"
                      title="Ver historial de ventas"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEdit(affiliate)}
                      className="cursor-pointer text-blue-600 hover:text-blue-900 transition-colors"
                      title="Editar"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => affiliate.id && handleDelete(affiliate.id)}
                      className="cursor-pointer text-red-600 hover:text-red-900 transition-colors"
                      title="Eliminar"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Componente de paginación */}
      <Pagination />
    </div>
  );
}
