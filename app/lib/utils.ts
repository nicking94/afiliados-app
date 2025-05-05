import { v4 as uuidv4 } from "uuid";

export const generateUniqueCode = (): string => {
  return uuidv4().substring(0, 6).toUpperCase();
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export function formatDate(dateInput: Date | string): string {
  // Si es string, conviértelo a Date
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  // Asegúrate de usar la fecha local
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
};
