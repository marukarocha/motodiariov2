"use client";

import { deleteEarning, getOdometerRecords, deleteOdometerRecord } from "@/lib/db/firebaseServices";
import { useAuth } from "@/components/USER/Auth/AuthContext";

export function useDeleteEarning() {
  const { currentUser } = useAuth();

  /**
   * Exclui o earning e seus registros de odômetro associados.
   * Se os registros não tiverem sourceId preenchido, tenta filtrar pelo campo note.
   * Se ainda assim não encontrar, utiliza uma heurística baseada na data (±5 minutos).
   */
  async function deleteEarningAndOdometer(earningId: string, earningDate?: Date) {
    if (!currentUser) {
      throw new Error("Usuário não autenticado");
    }

    // Exclui o earning
    await deleteEarning(currentUser.uid, earningId);

    // Busca todos os registros de odômetro do usuário
    const odometerRecords = await getOdometerRecords(currentUser.uid);

    // Filtra os registros associados pelo sourceId ou pelo campo note
    let associatedRecords = odometerRecords.filter(record =>
      record.source === "earnings" &&
      (record.sourceId === earningId ||
        (record.note && record.note.toString().includes(earningId)))
    );

    // Se nenhum registro foi encontrado e a data do earning for fornecida,
    // utiliza uma heurística: registros com source "earnings" com recordedAt dentro de ±5 minutos da data do earning.
    if (associatedRecords.length === 0 && earningDate) {
      const fiveMinutes = 5 * 60 * 1000;
      associatedRecords = odometerRecords.filter(record => {
        if (record.source !== "earnings" || !record.recordedAt) return false;
        const recDate = record.recordedAt.toDate ? record.recordedAt.toDate() : new Date(record.recordedAt);
        return Math.abs(recDate.getTime() - earningDate.getTime()) <= fiveMinutes;
      });
    }

    // Exclui todos os registros associados
    for (const record of associatedRecords) {
      await deleteOdometerRecord(currentUser.uid, record.id);
    }
  }

  return { deleteEarningAndOdometer };
}
