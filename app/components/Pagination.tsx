"use client";

import { useState, useEffect } from "react";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export default function Pagination({
  totalItems,
  itemsPerPage = 5,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [pageRange, setPageRange] = useState<number[]>([]);

  // Calcular el rango de páginas visibles
  useEffect(() => {
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
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

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
      {/* Items por página */}
      {onItemsPerPageChange && (
        <div className="flex items-center">
          <span className="text-sm text-gray-700 mr-2">Mostrar:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Contador de resultados */}
      <div className="text-sm text-gray-700">
        Mostrando {(currentPage - 1) * itemsPerPage + 1} -{" "}
        {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}
      </div>

      {/* Controles de navegación */}
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md border ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Anterior
        </button>

        {/* Mostrar primera página si no está en el rango */}
        {!pageRange.includes(1) && (
          <>
            <button
              onClick={() => onPageChange(1)}
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

        {/* Páginas en el rango */}
        {pageRange.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-md border ${
              currentPage === page
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Mostrar última página si no está en el rango */}
        {!pageRange.includes(totalPages) && (
          <>
            {!pageRange.includes(totalPages - 1) && (
              <span className="px-2">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
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
          onClick={() => onPageChange(currentPage + 1)}
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
}
