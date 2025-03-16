export interface MaintenanceStatus {
  text: string;
  color: string;
}

/**
 * Calcula o status da manutenção com base na quilometragem.
 * @param lastMileage Última quilometragem registrada
 * @param nextMaintenance Quilometragem prevista para a próxima manutenção
 * @param threshold Margem para aviso (padrão: 500 km)
 * @returns Status da manutenção (texto e cor)
 */
export function calculateMaintenanceStatus(lastMileage: number, nextMaintenance: number, threshold = 500) {
  const diff = nextMaintenance - lastMileage;

  if (diff === 0) {
    return { text: "Dentro do prazo", color: "green" }; // ✅ Corrigido: Agora não mostra "Atrasado"
  } else if (diff < 0) {
    return { text: `Atrasado ${Math.abs(diff)} km`, color: "red" };
  } else if (diff <= threshold) {
    return { text: `Próximo em ${diff} km`, color: "orange" };
  } else {
    return { text: "Dentro do prazo", color: "green" };
  }
}


/**
 * Atualiza a manutenção anterior como "finalizada" ao registrar uma nova.
 * @param maintenanceList Lista de manutenções existentes
 * @param type Tipo da nova manutenção registrada
 * @param updateFunction Função de atualização da manutenção
 */
export async function finalizePreviousMaintenance(
  maintenanceList: any[],
  type: string,
  updateFunction: (id: string, data: Partial<any>) => Promise<void>
) {
  const lastMaintenance = maintenanceList
    .filter((m) => m.tipo.toLowerCase() === type.toLowerCase())
    .sort((a, b) => b.km - a.km)[0];

  if (lastMaintenance && !lastMaintenance.finalizado) {
    await updateFunction(lastMaintenance.id, { finalizado: true });
  }
}
