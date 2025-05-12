import Button from "@/app/components/Button";
import { Download } from "lucide-react";

interface ExportButtonProps {
  onExport: () => void;
  disabled?: boolean;
}

export default function ExportFileButton({
  onExport,
  disabled,
}: ExportButtonProps) {
  return (
    <Button
      icon={<Download className="w-5 h-5" />}
      text="Exportar datos"
      onClick={onExport}
      colorText="text-white"
      colorTextHover="text-white"
      colorBg="bg-green-600"
      colorBgHover="hover:bg-green-700"
      disabled={disabled}
    />
  );
}
