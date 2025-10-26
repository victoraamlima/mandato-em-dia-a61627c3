import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeCPF(cpf: string): string {
  return cpf.replace(/[^\d]/g, "");
}

export function isValidCPF(cpf: string): boolean {
  cpf = normalizeCPF(cpf);
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;

  const digits = cpf.split("").map(Number);
  
  const calc = (slice: number) => {
    let sum = 0;
    for (let i = 0; i < slice; i++) {
      sum += digits[i] * (slice + 1 - i);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return calc(9) === digits[9] && calc(10) === digits[10];
}

export function maskCpf(cpf: string) {
  if (!cpf) return "";
  return cpf.replace(/^(\d{3})\d{6}(\d{2})$/, "$1.***.***-$2");
}

export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export function maskPhone(phone: string) {
  const normalized = normalizePhone(phone);
  if (normalized.length < 10) return normalized;

  const ddd = normalized.substring(0, 2);
  const part1 = normalized.substring(2, normalized.length - 4);
  const part2 = normalized.substring(normalized.length - 4);

  if (normalized.length === 11) { // Celular (9 dígitos)
    return `(${ddd}) ${part1.substring(0, 5)}-${part2}`;
  } else if (normalized.length === 10) { // Fixo (8 dígitos)
    return `(${ddd}) ${part1.substring(0, 4)}-${part2}`;
  }
  return normalized;
}