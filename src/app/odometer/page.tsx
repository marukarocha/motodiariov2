"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { DateFilter } from "@/components/DataFilter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/USER/Auth/AuthContext";
import { 
  getOdometerRecords, 
  deleteOdometerRecord 
} from "@/lib/db/firebaseServices";
import { OdometerRecord } from "@/types/types";
import { Trash } from "lucide-react";
import OdometerUpdateButton from "@/app/odometer/OdometerUpdateButton";

export default function OdometerPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [odometerRecords, setOdometerRecords] = useState<OdometerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!currentUser) return;
      const data = await getOdometerRecords(currentUser.uid, selectedDate);
      setOdometerRecords(data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Erro ao carregar registros de odômetro:", err);
      setError("Erro ao carregar registros de odômetro");
      toast({
        title: "Erro!",
        description: "Erro ao carregar registros de odômetro",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, selectedDate]);

  // Ordena os registros pela data em ordem decrescente
  const sortedRecords = useMemo(() => {
    const dataCopy = [...odometerRecords];
    dataCopy.sort((a, b) => {
      const timeA = a.recordedAt.toDate().getTime();
      const timeB = b.recordedAt.toDate().getTime();
      return timeB - timeA;
    });
    return dataCopy;
  }, [odometerRecords]);

  // Paginação
  const totalPages = Math.ceil(sortedRecords.length / recordsPerPage);
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    return sortedRecords.slice(startIndex, startIndex + recordsPerPage);
  }, [sortedRecords, currentPage]);

  const handleDelete = async (recordId: string) => {
    if (!currentUser) return;
    const confirmed = window.confirm("Tem certeza que deseja excluir este registro de odômetro?");
    if (!confirmed) return;

    try {
      await deleteOdometerRecord(currentUser.uid, recordId);
      toast({ 
        title: "Excluído", 
        description: "Registro de odômetro excluído com sucesso!", 
        variant: "success" 
      });
      fetchData();
    } catch (error) {
      console.error("Erro ao excluir registro de odômetro:", error);
      toast({
        title: "Erro",
        description: "Falha ao excluir registro de odômetro",
        variant: "destructive",
      });
    }
  };

  // Formatação de data e hora
  const formatDate = (timestamp: any): string => {
    const date = timestamp.toDate();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (timestamp: any): string => {
    const date = timestamp.toDate();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Registros de Odômetro</h1>
      
      <div className="flex flex-wrap gap-4 mb-4">
        <OdometerUpdateButton />
        <DateFilter onDateSelected={(from, to) => setSelectedDate(from)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Registros de Odômetro</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Carregando...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Quilometragem</TableHead>
                    <TableHead>Fonte</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{formatDate(record.recordedAt)}</TableCell>
                      <TableCell>{formatTime(record.recordedAt)}</TableCell>
                      <TableCell>{record.currentMileage} km</TableCell>
                      <TableCell>{record.source || 'N/A'}</TableCell>
                      <TableCell>{record.note || 'Sem nota'}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          onClick={() => handleDelete(record.id)}
                          title="Deletar"
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginação */}
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span>
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Próximo
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
