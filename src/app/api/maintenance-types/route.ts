// app/api/maintenance-types/route.ts
import { NextResponse } from "next/server";

const maintenanceTypes = [
  {
    id: "oil-change",
    label: "Troca de Óleo",
    description: "Substituição do óleo e do filtro de óleo.",
    icon: "FaOilCan", // Nome do ícone (será mapeado no front)
    fields: [
      { name: "km", type: "number", label: "Quilometragem no momento" },
      { name: "valor", type: "number", label: "Valor gasto (R$)" },
      { name: "local", type: "string", label: "Local da manutenção" },
      { name: "observacoes", type: "string", label: "Observações" }
    ],
    maintenanceInterval: 1900
  },
  {
    id: "tire-change",
    label: "Troca de Pneus",
    description: "Substituição dos pneus. Informe se a troca é para pneus dianteiros, traseiros ou ambos.",
    icon: "GiFlatTire",
    fields: [
      { name: "km", type: "number", label: "Quilometragem no momento" },
      { name: "valor", type: "number", label: "Valor gasto (R$)" },
      { name: "local", type: "string", label: "Local da manutenção" },
      { name: "position", type: "string", label: "Posição (dianteiro, traseiro ou ambos)" },
      { name: "observacoes", type: "string", label: "Observações" }
    ],
    maintenanceInterval: 10000
  },
  {
    id: "brake-pad-replacement",
    label: "Troca de Pastilhas de Freio",
    description: "Substituição das pastilhas de freio. Informe se é dianteira, traseira ou ambos.",
    icon: "GiPokecog",
    fields: [
      { name: "km", type: "number", label: "Quilometragem no momento" },
      { name: "valor", type: "number", label: "Valor gasto (R$)" },
      { name: "local", type: "string", label: "Local da manutenção" },
      { name: "position", type: "string", label: "Posição (dianteiro, traseiro ou ambos)" },
      { name: "observacoes", type: "string", label: "Observações" }
    ],
    maintenanceInterval: 8000
  },
  {
    id: "chain-lubrication",
    label: "Lubrificação de Corrente",
    description: "Lubrificação e limpeza da corrente.",
    icon: "GiPokecog",
    fields: [
      { name: "km", type: "number", label: "Quilometragem no momento" },
      { name: "valor", type: "number", label: "Valor gasto (R$)" },
      { name: "local", type: "string", label: "Local da manutenção" },
      { name: "observacoes", type: "string", label: "Observações" }
    ],
    maintenanceInterval: 1000
  },
  {
    id: "air-filter-change",
    label: "Troca de Filtro de Ar",
    description: "Substituição do filtro de ar.",
    icon: "GiPokecog",
    fields: [
      { name: "km", type: "number", label: "Quilometragem no momento" },
      { name: "valor", type: "number", label: "Valor gasto (R$)" },
      { name: "local", type: "string", label: "Local da manutenção" },
      { name: "observacoes", type: "string", label: "Observações" }
    ],
    maintenanceInterval: 12000
  },
  {
    id: "brake-fluid-change",
    label: "Troca de Fluido de Freio",
    description: "Substituição do fluido de freio.",
    icon: "FaTools",
    fields: [
      { name: "km", type: "number", label: "Quilometragem no momento" },
      { name: "valor", type: "number", label: "Valor gasto (R$)" },
      { name: "local", type: "string", label: "Local da manutenção" },
      { name: "observacoes", type: "string", label: "Observações" }
    ],
    maintenanceInterval: 15000
  },
  {
    id: "suspension-check",
    label: "Revisão de Suspensão",
    description: "Verificação e manutenção da suspensão.",
    icon: "FaTools",
    fields: [
      { name: "km", type: "number", label: "Quilometragem no momento" },
      { name: "valor", type: "number", label: "Valor gasto (R$)" },
      { name: "local", type: "string", label: "Local da manutenção" },
      { name: "observacoes", type: "string", label: "Observações" }
    ],
    maintenanceInterval: 20000
  }
];

export function GET() {
  return NextResponse.json(maintenanceTypes);
}
