import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export const formatDate = (date: Date): string => {
  if (!date) return 'N/A';
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
};