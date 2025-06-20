import { NextResponse } from 'next/server';

// Mock de motos cadastradas (apenas para teste)
const motos = [
  { id: 1, modelo: 'XRE 300', ano: 2020 },
  { id: 2, modelo: 'CG 160', ano: 2023 }
];

export async function GET() {
  return NextResponse.json(motos);
}
