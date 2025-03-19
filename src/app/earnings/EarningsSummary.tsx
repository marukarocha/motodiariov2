"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Clock, Calendar, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/USER/Auth/AuthContext";

// Importações do dnd-kit
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

// --- Tipagem e funções auxiliares ---
interface Earning {
  id: string;
  amount: number;
  date: any;
  duration?: number; // duração em minutos
}

interface EarningsSummaryProps {
  earningsData: Earning[];
  startDate?: Date | null;
  endDate?: Date | null;
}

function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatHours(totalHours: number): string {
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);
  return `${hours}h ${minutes}m`;
}

interface CardConfig {
  id: string;
  title: string;
  content: JSX.Element;
  icon?: JSX.Element;
}

// --- Componente SortableCard ---
interface SortableCardProps {
  id: string;
  children: React.ReactNode;
}
function SortableCard({ id, children }: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

// --- Componente EarningsSummary ---
export function EarningsSummary({ earningsData, startDate, endDate }: EarningsSummaryProps) {
  const { currentUser } = useAuth();
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [totalHours, setTotalHours] = useState<number>(0);
  const [averageEarningsPerHour, setAverageEarningsPerHour] = useState<number>(0);
  const [averageEarningsPerDay, setAverageEarningsPerDay] = useState<number>(0);
  const [offlineDays, setOfflineDays] = useState<number>(0);

  // Estado para expandir/collapsar o conteúdo de cada card (todos começam expandidos)
  const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>({});

  // Cálculo do total de horas
  useEffect(() => {
    let hoursSum = 0;
    earningsData.forEach((earning) => {
      const durationValue = earning.duration != null ? Number(earning.duration) : 0;
      const minutes = isNaN(durationValue) ? 0 : durationValue;
      hoursSum += minutes / 60;
    });
    setTotalHours(hoursSum);
  }, [earningsData]);

  // Cálculo de ganhos e médias
  useEffect(() => {
    if (earningsData.length > 0) {
      const total = earningsData.reduce((acc, curr) => acc + curr.amount, 0);
      setTotalEarnings(total);
      setAverageEarningsPerHour(totalHours > 0 ? total / totalHours : 0);
      const uniqueDays = new Set(
        earningsData.map((earning) => {
          let dateObj;
          if (earning.date && earning.date.seconds) {
            dateObj = new Date(earning.date.seconds * 1000);
          } else if (earning.date instanceof Date) {
            dateObj = earning.date;
          } else {
            dateObj = new Date();
          }
          return getLocalDateString(dateObj);
        })
      );
      setAverageEarningsPerDay(uniqueDays.size ? total / uniqueDays.size : 0);
    } else {
      setTotalEarnings(0);
      setAverageEarningsPerHour(0);
      setAverageEarningsPerDay(0);
    }
  }, [earningsData, totalHours]);

  // Cálculo dos dias offline
  useEffect(() => {
    if (startDate && endDate) {
      const recordDays = new Set(
        earningsData.map((earning) => {
          let dateObj;
          if (earning.date && earning.date.seconds) {
            dateObj = new Date(earning.date.seconds * 1000);
          } else if (earning.date instanceof Date) {
            dateObj = earning.date;
          } else {
            dateObj = new Date();
          }
          return getLocalDateString(dateObj);
        })
      );
      let countOffline = 0;
      const current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endDateCopy = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      while (current <= endDateCopy) {
        if (!recordDays.has(getLocalDateString(current))) {
          countOffline++;
        }
        current.setDate(current.getDate() + 1);
      }
      setOfflineDays(countOffline);
    } else {
      setOfflineDays(0);
    }
  }, [earningsData, startDate, endDate]);

  // Criação do conteúdo dos cards (dinâmico)
  const updatedCards: CardConfig[] = useMemo(() => [
    {
      id: "totalEarnings",
      title: "Total de Ganhos",
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
      content: (
        <>
          <div className="text-2xl font-bold">R$ {totalEarnings.toFixed(2)}</div>
          <div className="mt-4">
            <Link href="/earnings/details" className="text-sm font-medium text-primary hover:underline">
              Ver detalhes &rarr;
            </Link>
          </div>
        </>
      ),
    },
    {
      id: "averagePerHour",
      title: "Média de Ganho por Hora",
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
      content: (
        <>
          <div className="text-2xl font-bold">R$ {averageEarningsPerHour.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">Total de Horas: {formatHours(totalHours)}</div>
          <div className="mt-4">
            <Link href="/earnings/hourly" className="text-sm font-medium text-primary hover:underline">
              Ver detalhes &rarr;
            </Link>
          </div>
        </>
      ),
    },
    {
      id: "averagePerDay",
      title: "Média de Ganho por Dia",
      icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
      content: (
        <>
          <div className="text-2xl font-bold">R$ {averageEarningsPerDay.toFixed(2)}</div>
          <div className="mt-4">
            <Link href="/earnings/daily" className="text-sm font-medium text-primary hover:underline">
              Ver detalhes &rarr;
            </Link>
          </div>
        </>
      ),
    },
    {
      id: "offlineDays",
      title: "Dias Offline",
      content: (
        <>
          <div className="text-2xl font-bold">{offlineDays} dia{offlineDays !== 1 ? "s" : ""}</div>
          <div className="mt-4">
            <Link href="/earnings/daily" className="text-sm font-medium text-primary hover:underline">
              Ver detalhes &rarr;
            </Link>
          </div>
        </>
      ),
    },
  ], [totalEarnings, totalHours, averageEarningsPerHour, averageEarningsPerDay, offlineDays]);

  // Estado para a ordem dos cards (default)
  const defaultOrder = ["totalEarnings", "averagePerHour", "averagePerDay", "offlineDays"];
  const [cardOrder, setCardOrder] = useState<string[]>(defaultOrder);

  // No mount, inicializa a ordem e todos os cards como expandidos
  useEffect(() => {
    const savedOrder = localStorage.getItem("cardOrder");
    if (savedOrder) {
      try {
        const parsed = JSON.parse(savedOrder);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCardOrder(parsed);
        } else {
          setCardOrder(defaultOrder);
        }
      } catch {
        setCardOrder(defaultOrder);
      }
    } else {
      setCardOrder(defaultOrder);
    }
    // Inicializa expandedStates com todos os cards expandidos
    const initialExpanded: Record<string, boolean> = {};
    updatedCards.forEach(card => {
      initialExpanded[card.id] = true;
    });
    setExpandedStates(initialExpanded);
  }, [updatedCards]);

  // Persistência: salva a ordem sempre que mudar
  useEffect(() => {
    localStorage.setItem("cardOrder", JSON.stringify(cardOrder));
  }, [cardOrder]);

  // dnd-kit: configura sensores e handler de drag end (atualiza cardOrder)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = cardOrder.indexOf(active.id);
    const newIndex = cardOrder.indexOf(over.id);
    const newOrder = arrayMove(cardOrder, oldIndex, newIndex);
    setCardOrder(newOrder);
  };

  // Ordena os cards conforme cardOrder
  const orderedCards = useMemo(() => {
    const orderMap = new Map(updatedCards.map(card => [card.id, card]));
    const ordered = cardOrder.map(id => orderMap.get(id)).filter(Boolean) as CardConfig[];
    const missing = updatedCards.filter(card => !cardOrder.includes(card.id));
    return [...ordered, ...missing];
  }, [updatedCards, cardOrder]);

  // Função para alternar a expansão do conteúdo do card
  const toggleExpanded = (id: string) => {
    setExpandedStates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div>
      {/* Área de drag & drop: grid responsiva (2 colunas mobile, 4 colunas desktop) */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={orderedCards.map(card => card.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {orderedCards.map(card => (
              <SortableCard key={card.id} id={card.id}>
                <Card>
                <CardHeader className="flex flex-row justify-between items-left">
                    {/* Grupo esquerdo: ícone principal e título */}
                    <div className="flex items-center gap-2">
                      {card.icon}
                      <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    </div>
                    {/* Grupo direito: botão com ícone de alternância */}
                    <div className="flex flex-none items-center whitespace-nowrap">
                      <button onClick={() => toggleExpanded(card.id)} className="focus:outline-none">
                        {expandedStates[card.id] ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>
                  </CardHeader>
                  {expandedStates[card.id] && <CardContent>{card.content}</CardContent>}
                </Card>
              </SortableCard>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
