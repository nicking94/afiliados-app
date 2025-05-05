import SettingsForm from "@/app/components/settings/SettingsForm";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configuración del Sistema</h1>
      <SettingsForm />
    </div>
  );
}
