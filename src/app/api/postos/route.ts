// app/api/postos/route.ts

import { NextResponse } from 'next/server';

const postos = [
  {
    id: "1",
    name: "Posto Mauro Ramos",
    address: "Av. Mauro Ramos, number 500 - Florianópolis - Centro",
    fuelTypes: {
      Gasoline: {
        regular: {
          price: 6.50
        },
        premium: {
          price: 6.52
        }
      },
      Ethanol: {
        price: 4.60
      }
    },
    rating: 4.5,
    reviewsCount: 23,
    lastUpdated: "2025-03-13T15:00:00Z"
  },
  {
    id: "2",
    name: "Posto Trindade",
    address: "Central Avenue, 456",
    fuelTypes: {
      Gasoline: {
        regular: {
          price: 6.69
        },
        premium: {
          price: 6.89
        }
      },
      Ethanol: {
        price: 4.29
      }
    },
    rating: 4.2,
    reviewsCount: 15,
    lastUpdated: "2025-03-13T14:30:00Z"
  }
];

export function GET() {
  return NextResponse.json(postos);
}
