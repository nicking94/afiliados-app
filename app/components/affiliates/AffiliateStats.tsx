"use client";

import { db } from "@/app/lib/db";
import { useEffect, useState } from "react";

export default function AffiliateStats() {
  const [total, setTotal] = useState(0);

  const loadStats = async () => {
    const count = await db.affiliates.count();
    setTotal(count);
  };

  useEffect(() => {
    loadStats(); // Cargar inicialmente

    // Escuchar eventos de actualización
    const handleUpdate = () => loadStats();
    window.addEventListener("affiliateUpdated", handleUpdate);

    return () => {
      window.removeEventListener("affiliateUpdated", handleUpdate);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 mb-6">
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900">Total Afiliados</h3>
        <p className="mt-1 text-3xl font-semibold text-blue-600">{total}</p>
      </div>
    </div>
  );
}
