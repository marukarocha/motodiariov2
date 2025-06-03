import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, DollarSign, Gift, FileText, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";

type FreelasItem = {
  porcao: string;
  bairro: string;
  horario: string;
  arrancada: number;
  taxaMinima: number;
  kmAdicional: number;
  beneficios: string[];
  requisitos: string[];
};

type FreelasProps = {
  items?: FreelasItem[];
};

// Simulated JSON data
const freelasData: FreelasItem[] = [
  {
    porcao: "Porção Express",
    bairro: "Ponte de Imaruim",
    horario: "18 às 00",
    arrancada: 60.00,
    taxaMinima: 5.00,
    kmAdicional: 1.00,
    beneficios: ["Ganha janta", "Porção", "Água mineral"],
    requisitos: ["Precisa begue", "Mínimo 1 ano de experiência"]
  },
  {
    porcao: "Deliverize",
    bairro: "Centro",
    horario: "19 às 23",
    arrancada: 50.00,
    taxaMinima: 4.50,
    kmAdicional: 1.20,
    beneficios: ["Ganha bebida", "Bônus por entregas rápidas"],
    requisitos: ["Mochila própria", "Smartphone com 4G"]
  },
  {
    porcao: "Food Riders",
    bairro: "Kobrasol",
    horario: "17 às 23",
    arrancada: 55.00,
    taxaMinima: 4.80,
    kmAdicional: 1.10,
    beneficios: ["Seguro para motocicleta", "Vale refeição semanal", "Ajuda manutenção"],
    requisitos: ["Moto própria", "Habilitação A", "CNH sem pontos"]
  }
];

export function Freelas({ items = freelasData }: FreelasProps) {
  return (
    <div className="container mx-auto p-4 text-gray-50">
      <div className="flex items-center mb-6">
      </div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
        {items.map((item, index) => (
          <Card key={index} className="border-white hover:shadow-md hover:shadow-primary/20 transition-all">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl text-primary">{item.porcao}</CardTitle>
                <Badge variant="outline" className="bg-gray-700">
                  {index === 0 ? "Popular" : index === 1 ? "Novo" : "Recomendado"}
                </Badge>
              </div>
              <CardDescription className="flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-1" /> {item.bairro}
              </CardDescription>
        <div className="flex items-center text-sm mt-1">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                <span>{item.horario}</span>
              </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="space-y-2">
            <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Arrancada:</span>
                  <span className="font-medium text-green-400">R$ {item.arrancada.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                <span className="text-gray-400">Taxa mín:</span>
                  <span>R$ {item.taxaMinima.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Km adicional:</span>
                  <span>R$ {item.kmAdicional.toFixed(2)}</span>
                </div>
              </div>
                  </div>

          <div className='ml-10'>
            {item.beneficios.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center mb-1">
                  <Gift className="h-3 w-3 mr-1 text-primary" />
                  <span className="font-medium text-xs">Benefícios</span>
                </div>
                <ul className="space-y-0.5 text-xs">
                  {item.beneficios.map((beneficio, idx) => (
                      <li key={idx} className="flex items-center">
                      <span className="mr-1 text-primary">•</span>
                      {beneficio}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
      </div>

        <div className="border-t border-gray-700 pt-2 text-xs">
          <div className="flex items-center mb-1">
            <FileText className="h-3 w-3 mr-1 text-yellow-500" />
            <span className="font-medium">Requisitos</span>
    </div>
          <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5">
            <li className="flex items-center">
              <span className="mr-1 text-yellow-500">•</span>
              Bag
            </li>
            <li className="flex items-center">
              <span className="mr-1 text-yellow-500">•</span>
              Celular
            </li>
            <li className="flex items-center">
              <span className="mr-1 text-yellow-500">•</span>
              Internet
            </li>
            {item.requisitos.map((requisito, idx) => (
              <li key={idx} className="flex items-center">
                <span className="mr-1 text-yellow-500">•</span>
                {requisito}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button className="w-full text-sm py-1 bg-color:green-600 text-white rounded-md transition-colors duration-300 ease-in-out transform hover:scale-100 hover:bg-green-600" variant="default">
          <DollarSign className="h-4 w-4 mr-1" />
          Aceitar Corrida
        </Button>
      </CardFooter>
    </Card>
  ))}
</div>
</div>
  );
}
