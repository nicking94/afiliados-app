"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Afiliados", href: "/affiliates", icon: "👥" },
    { name: "Ventas", href: "/sales", icon: "💰" },
    { name: "Configuración", href: "/settings", icon: "⚙️" },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white p-4">
      <div className="mb-8 p-4">
        <h2 className="text-xl font-bold">Gestión de Afiliados</h2>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={clsx(
              "flex items-center px-4 py-3 rounded-md",
              pathname.startsWith(item.href)
                ? "bg-gray-900 text-white"
                : "text-gray-300 hover:bg-gray-700"
            )}
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
