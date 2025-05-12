"use client";
import Image from "next/image";
import { useState } from "react";
import { Affiliate } from "./types";
import { db } from "./lib/db";
import logo from "../public/assets/logo.png";
import ImportFileButton from "./components/ImportFileButton";

import AffiliateList from "./components/affiliates/AffiliateList";
import AffiliateStats from "./components/affiliates/AffiliateStats";
import ExportFileButton from "./components/ExportFileButton.";

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Estado para forzar actualización

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsProcessing(true);
    const file = e.target.files?.[0];
    if (!file) {
      setIsProcessing(false);
      return;
    }

    try {
      const fileText = await file.text();
      const data = JSON.parse(fileText) as Affiliate[];

      if (!Array.isArray(data)) {
        throw new Error("El archivo no contiene un array de afiliados válido");
      }

      await db.affiliates.clear();
      await db.affiliates.bulkAdd(data);

      alert("Datos importados correctamente");
      setRefreshTrigger((prev) => prev + 1); // Forzar actualización
    } catch (error) {
      console.error("Error al importar datos:", error);
      alert("Error al importar datos: " + (error as Error).message);
    } finally {
      setIsProcessing(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleExport = async () => {
    setIsProcessing(true);
    try {
      const allAffiliates = await db.affiliates.toArray();
      const dataStr = JSON.stringify(allAffiliates, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
        dataStr
      )}`;

      const exportFileName = `afiliados_${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileName);
      linkElement.click();
    } catch (error) {
      console.error("Error al exportar datos:", error);
      alert("Error al exportar datos");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="container mx-auto py-6 px-4 text-black">
      <div className="flex justify-center items-center gap-2 mb-6 ">
        <Image src={logo} alt="Logo" width={40} height={40} />
        <span className="text-xl font-bold text-white italic">
          Universal Web - Afiliados
        </span>
      </div>
      <div className="text-white flex justify-end mb-1 gap-2">
        <ImportFileButton onImport={handleImport} />
        <ExportFileButton onExport={handleExport} disabled={isProcessing} />
      </div>

      <AffiliateStats />
      <AffiliateList refreshTrigger={refreshTrigger} />
    </main>
  );
}
