// types.ts

// Interface base, se desejar usar em várias entidades
export interface DataItem {
  id: string;
  date?: Date; // Campo opcional, que pode ser usado como base
}

// Interface para abastecimentos (fuelings)
export interface Fueling extends DataItem {
  // Aqui, "data" é uma string que representa a data do abastecimento, por exemplo "YYYY-MM-DD" ou "DD/MM/YYYY"
  data: string;  // "hora" é a hora do abastecimento, por exemplo "14:30"
  hora: string;  // Quantidade de litros abastecidos
  litros: number;  // Nome do posto
  posto: string;  // Valor cobrado por litro
  valorLitro: number;
  currentMileage: number;  // Adicionado para armazenar a leitura do odômetro
}

// Interface para ganhos (earnings)
export interface Earning extends DataItem {
  // "data" é a data do ganho (como string)
  data: string;
  // "date" pode ser a data convertida (ou você pode definir apenas um campo)
  date: Date;
  // Quilometragem registrada naquele ganho
  km: number;
  // Valor recebido
  amount: number;
  // Caso você registre a quilometragem acumulada ou incremental, use "mileage"
  mileage: number;
  // Plataforma (Uber, 99, etc.)
  platform: string;
  tip?: number;
  description?: string;
  // Horas trabalhadas
  hours?: number;
  // Duração em minutos (para converter em horas, por exemplo)
  duration?: number;
}
