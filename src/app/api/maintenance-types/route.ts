// app/api/maintenance-types/route.ts
import { NextResponse } from "next/server";

const maintenanceCategories  = [
  {
    category: "Sistema de Freios",
    items: [
      {
        id: "brake-pad-replacement",
        label: "Troca de Pastilhas de Freio",
        description: "Substituição das pastilhas de freio dianteiras, traseiras ou ambas.",
        icon: "GiBrakePad",
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
        id: "brake-disc-change",
        label: "Troca de Discos de Freio",
        description: "Substituição dos discos de freio.",
        icon: "GiDisc",
        fields: [ { name: "km", type: "number", label: "Quilometragem no momento" },
          { name: "valor", type: "number", label: "Valor gasto (R$)" },
          { name: "local", type: "string", label: "Local da manutenção" },
          { name: "position", type: "string", label: "Posição (dianteiro, traseiro ou ambos)" },
          { name: "observacoes", type: "string", label: "Observações" }],
        maintenanceInterval: 20000
      },
      {
        id: "brake-fluid-change",
        label: "Troca de Fluido de Freio",
        description: "Substituição do fluido de freio.",
        icon: "FaTools",
        fields: [ { name: "km", type: "number", label: "Quilometragem no momento" },
          { name: "valor", type: "number", label: "Valor gasto (R$)" },
          { name: "local", type: "string", label: "Local da manutenção" },
          { name: "position", type: "string", label: "Posição (dianteiro, traseiro ou ambos)" },
          { name: "observacoes", type: "string", label: "Observações" }],
        maintenanceInterval: 15000
      },
      {
        id: "brake-system-maintenance",
        label: "Revisão do Sistema de Freios",
        description: "Verificação geral do sistema de freios.",
        icon: "GiBrakeDrum",
        fields: [ { name: "km", type: "number", label: "Quilometragem no momento" },
          { name: "valor", type: "number", label: "Valor gasto (R$)" },
          { name: "local", type: "string", label: "Local da manutenção" },
          { name: "position", type: "string", label: "Posição (dianteiro, traseiro ou ambos)" },
          { name: "observacoes", type: "string", label: "Observações" }],
        maintenanceInterval: 10000
      },
      {
        id: "brake-cable-change",
        label: "Troca de Cabo de Freio",
        description: "Substituição dos cabos do freio.",
        icon: "GiWireCoil",
        fields: [ { name: "km", type: "number", label: "Quilometragem no momento" },
          { name: "valor", type: "number", label: "Valor gasto (R$)" },
          { name: "local", type: "string", label: "Local da manutenção" },
          { name: "position", type: "string", label: "Posição (dianteiro, traseiro ou ambos)" },
          { name: "observacoes", type: "string", label: "Observações" }],
        maintenanceInterval: 10000
      },
      {
        id: "brake-drum-change",
        label: "Troca de Tambor ou Lonas de Freio",
        description: "Substituição do tambor de freio ou das lonas.",
        icon: "GiDrum",
        fields: [ { name: "km", type: "number", label: "Quilometragem no momento" },
          { name: "valor", type: "number", label: "Valor gasto (R$)" },
          { name: "local", type: "string", label: "Local da manutenção" },
          { name: "position", type: "string", label: "Posição (dianteiro, traseiro ou ambos)" },
          { name: "observacoes", type: "string", label: "Observações" }],
        maintenanceInterval: 20000
      }
    ]
  },
  {
    category: "Motor",
    items: [
      {
        id: "valve-adjustment",
        label: "Regulagem de Válvulas",
        description: "Ajuste de folga das válvulas do motor.",
        icon: "GiValve",
        fields: [ { name: "km", type: "number", label: "Quilometragem no momento" },
          { name: "valor", type: "number", label: "Valor gasto (R$)" },
          { name: "local", type: "string", label: "Local da manutenção" },
          { name: "position", type: "string", label: "Posição (dianteiro, traseiro ou ambos)" },
          { name: "observacoes", type: "string", label: "Observações" }],
        maintenanceInterval: 10000
      },
      {
        id: "spark-plug-change",
        label: "Troca de Vela",
        description: "Substituição das velas de ignição.",
        icon: "GiSparkPlug",
        fields: [ { name: "km", type: "number", label: "Quilometragem no momento" },
          { name: "valor", type: "number", label: "Valor gasto (R$)" },
          { name: "local", type: "string", label: "Local da manutenção" },
          { name: "position", type: "string", label: "Posição (dianteiro, traseiro ou ambos)" },
          { name: "observacoes", type: "string", label: "Observações" }],
        maintenanceInterval: 8000
      },
      {
        id: "engine-cleaning",
        label: "Limpeza do Motor",
        description: "Limpeza geral externa do motor.",
        icon: "GiElectric",
        fields: [ { name: "km", type: "number", label: "Quilometragem no momento" },
          { name: "valor", type: "number", label: "Valor gasto (R$)" },
          { name: "local", type: "string", label: "Local da manutenção" },
          { name: "position", type: "string", label: "Posição (dianteiro, traseiro ou ambos)" },
          { name: "observacoes", type: "string", label: "Observações" }],
        maintenanceInterval: 15000
      }
    ]
  },
  {
    category: "Lubrificação e Filtros",
    items: [
      {
        id: "oil-change",
        label: "Troca de Óleo",
        description: "Substituição do óleo e filtro.",
        icon: "FaOilCan",
        fields: [ { name: "km", type: "number", label: "Quilometragem no momento" },
          { name: "valor", type: "number", label: "Valor gasto (R$)" },
          { name: "local", type: "string", label: "Local da manutenção" },
          { name: "position", type: "string", label: "Posição (dianteiro, traseiro ou ambos)" },
          { name: "observacoes", type: "string", label: "Observações" }],
        maintenanceInterval: 1900
      },
      {
        id: "air-filter-change",
        label: "Troca de Filtro de Ar",
        description: "Substituição do filtro de ar.",
        icon: "GiDustCloud",
        fields: [ { name: "km", type: "number", label: "Quilometragem no momento" },
          { name: "valor", type: "number", label: "Valor gasto (R$)" },
          { name: "local", type: "string", label: "Local da manutenção" },
          { name: "position", type: "string", label: "Posição (dianteiro, traseiro ou ambos)" },
          { name: "observacoes", type: "string", label: "Observações" }],
        maintenanceInterval: 12000
      },
      {
        id: "fuel-filter-change",
        label: "Troca de Filtro de Combustível",
        description: "Substituição do filtro de combustível.",
        icon: "GiFuelTank",
        fields: [ { name: "km", type: "number", label: "Quilometragem no momento" },
          { name: "valor", type: "number", label: "Valor gasto (R$)" },
          { name: "local", type: "string", label: "Local da manutenção" },
          { name: "position", type: "string", label: "Posição (dianteiro, traseiro ou ambos)" },
          { name: "observacoes", type: "string", label: "Observações" }],
        maintenanceInterval: 15000
      },
      {
        id: "chain-lubrication",
        label: "Lubrificação de Corrente",
        description: "Lubrificação e limpeza da corrente.",
        icon: "GiChain",
        fields: [ { name: "km", type: "number", label: "Quilometragem no momento" },
          { name: "valor", type: "number", label: "Valor gasto (R$)" },
          { name: "local", type: "string", label: "Local da manutenção" },
          { name: "position", type: "string", label: "Posição (dianteiro, traseiro ou ambos)" },
          { name: "observacoes", type: "string", label: "Observações" }],
        maintenanceInterval: 1000
      }
    ]
  },
  {
    category: "Suspensão e Direção",
    items: [
      {
        id: "suspension-check",
        label: "Revisão de Suspensão",
        description: "Verificação e troca de componentes da suspensão.",
        icon: "GiSuspensionBridge",
        fields: [ { name: "km", type: "number", label: "Quilometragem no momento" },
          { name: "valor", type: "number", label: "Valor gasto (R$)" },
          { name: "local", type: "string", label: "Local da manutenção" },
          { name: "position", type: "string", label: "Posição (dianteiro, traseiro ou ambos)" },
          { name: "observacoes", type: "string", label: "Observações" }],
        maintenanceInterval: 20000
      },
      {
        id: "suspension-oil-change",
        label: "Troca de Óleo da Suspensão",
        description: "Substituição do óleo das bengalas.",
        icon: "FaOilCan",
        fields: [ { name: "km", type: "number", label: "Quilometragem no momento" },
          { name: "valor", type: "number", label: "Valor gasto (R$)" },
          { name: "local", type: "string", label: "Local da manutenção" },
          { name: "position", type: "string", label: "Posição (dianteiro, traseiro ou ambos)" },
          { name: "observacoes", type: "string", label: "Observações" }],
        maintenanceInterval: 25000
      },
      {
        id: "steering-box-replacement",
        label: "Troca da Caixa de Direção",
        description: "Substituição de rolamentos da caixa de direção.",
        icon: "GiGearHammer",
        fields: [ { name: "km", type: "number", label: "Quilometragem no momento" },
          { name: "valor", type: "number", label: "Valor gasto (R$)" },
          { name: "local", type: "string", label: "Local da manutenção" },
          { name: "position", type: "string", label: "Posição (dianteiro, traseiro ou ambos)" },
          { name: "observacoes", type: "string", label: "Observações" }],
        maintenanceInterval: 40000
      }
    ]
  },
  {
    category: "Rodagem",
    items: [
      {
        id: "tire-change",
        label: "Troca de Pneus",
        description: "Substituição dos pneus dianteiros, traseiros ou ambos.",
        icon: "GiFlatTire",
        fields: [/* mesmos campos + position */],
        maintenanceInterval: 10000
      },
      {
        id: "wheel-balancing",
        label: "Balanceamento de Roda",
        description: "Balanceamento para evitar vibrações.",
        icon: "GiTireIronCross",
        fields: [ { name: "km", type: "number", label: "Quilometragem no momento" },
          { name: "valor", type: "number", label: "Valor gasto (R$)" },
          { name: "local", type: "string", label: "Local da manutenção" },
          { name: "position", type: "string", label: "Posição (dianteiro, traseiro ou ambos)" },
          { name: "observacoes", type: "string", label: "Observações" }],
        maintenanceInterval: 8000
      },
      {
        id: "wheel-alignment",
        label: "Alinhamento de Roda",
        description: "Correção do alinhamento das rodas.",
        icon: "GiTireTracks",
        fields: [ { name: "km", type: "number", label: "Quilometragem no momento" },
          { name: "valor", type: "number", label: "Valor gasto (R$)" },
          { name: "local", type: "string", label: "Local da manutenção" },
          { name: "position", type: "string", label: "Posição (dianteiro, traseiro ou ambos)" },
          { name: "observacoes", type: "string", label: "Observações" }],
        maintenanceInterval: 8000
      }
    ]
  },
  {
    category: "Transmissão",
    items: [
      {
        id: "chain-replacement",
        label: "Troca de Corrente",
        description: "Substituição da corrente da transmissão.",
        icon: "GiChain",
        fields: [ { name: "km", type: "number", label: "Quilometragem no momento" },
          { name: "valor", type: "number", label: "Valor gasto (R$)" },
          { name: "local", type: "string", label: "Local da manutenção" },
          { name: "position", type: "string", label: "Posição (dianteiro, traseiro ou ambos)" },
          { name: "observacoes", type: "string", label: "Observações" }],
        maintenanceInterval: 20000
      },
      {
        id: "sprocket-replacement",
        label: "Troca de Coroa e Pinhão",
        description: "Substituição da relação final da moto.",
        icon: "GiGears",
        fields: [ { name: "km", type: "number", label: "Quilometragem no momento" },
          { name: "valor", type: "number", label: "Valor gasto (R$)" },
          { name: "local", type: "string", label: "Local da manutenção" },
          { name: "position", type: "string", label: "Posição (dianteiro, traseiro ou ambos)" },
          { name: "observacoes", type: "string", label: "Observações" }],
        maintenanceInterval: 20000
      }
    ]
  },
  {
    category: "Sistema Elétrico",
    items: [
      {
        id: "battery-check",
        label: "Revisão da Bateria",
        description: "Verificação e carga da bateria.",
        icon: "GiBattery100",
        fields: [ { name: "km", type: "number", label: "Quilometragem no momento" },
          { name: "valor", type: "number", label: "Valor gasto (R$)" },
          { name: "local", type: "string", label: "Local da manutenção" },
          { name: "position", type: "string", label: "Posição (dianteiro, traseiro ou ambos)" },
          { name: "observacoes", type: "string", label: "Observações" }],
        maintenanceInterval: 12000
      },
      {
        id: "lamp-replacement",
        label: "Troca de Lâmpadas",
        description: "Substituição de faróis, lanternas ou piscas.",
        icon: "GiLightBulb",
        fields: [ { name: "km", type: "number", label: "Quilometragem no momento" },
          { name: "valor", type: "number", label: "Valor gasto (R$)" },
          { name: "local", type: "string", label: "Local da manutenção" },
          { name: "position", type: "string", label: "Posição (dianteiro, traseiro ou ambos)" },
          { name: "observacoes", type: "string", label: "Observações" }],
        maintenanceInterval: 10000
      }
    ]
  },
  {
    category: "Outros",
    items: [
      {
        id: "general-review",
        label: "Revisão Geral",
        description: "Revisão completa da moto.",
        icon: "GiToolbox",
        fields: [ { name: "km", type: "number", label: "Quilometragem no momento" },
          { name: "valor", type: "number", label: "Valor gasto (R$)" },
          { name: "local", type: "string", label: "Local da manutenção" },
          { name: "position", type: "string", label: "Posição (dianteiro, traseiro ou ambos)" },
          { name: "observacoes", type: "string", label: "Observações" }],
        maintenanceInterval: 10000
      }
    ]
  }
];


export function GET() {
  return NextResponse.json(maintenanceCategories);
}
