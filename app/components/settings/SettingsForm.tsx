"use client";

import { db } from "@/app/lib/db";
import { AppSettings, DEFAULT_SETTINGS } from "@/app/types";
import { useState, useEffect } from "react";

export default function SettingsForm() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const savedSettings = await db.settings.get(1);
      if (savedSettings) {
        setSettings(savedSettings);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await db.settings.update(1, settings);
      alert("Configuración guardada correctamente");
    } catch (error) {
      console.error("Error guardando configuración:", error);
      alert("Error al guardar la configuración");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Configuración del Sistema</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comisión Fija por Venta ($)
          </label>
          <input
            type="number"
            value={settings.fixedCommission}
            onChange={(e) =>
              setSettings({
                ...settings,
                fixedCommission: Number(e.target.value),
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            min="0"
            step="1000"
          />
          <p className="mt-1 text-sm text-gray-500">
            Este valor se aplicará a todas las ventas registradas
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isSaving ? "Guardando..." : "Guardar Configuración"}
          </button>
        </div>
      </div>
    </div>
  );
}
