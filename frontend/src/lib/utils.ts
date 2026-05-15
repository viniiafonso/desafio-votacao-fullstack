import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function maskCpf(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function unmaskCpf(value: string) {
  return value.replace(/\D/g, '');
}

export function isValidCpf(value: string): boolean {
  const cpf = unmaskCpf(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  const calc = (slice: string, factor: number) => {
    let sum = 0;
    for (let i = 0; i < slice.length; i++) {
      sum += parseInt(slice[i], 10) * (factor - i);
    }
    const result = 11 - (sum % 11);
    return result >= 10 ? 0 : result;
  };

  const dv1 = calc(cpf.substring(0, 9), 10);
  if (dv1 !== parseInt(cpf[9], 10)) return false;
  const dv2 = calc(cpf.substring(0, 10), 11);
  return dv2 === parseInt(cpf[10], 10);
}
