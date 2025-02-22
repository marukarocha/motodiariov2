import { getEarnings } from '@/lib/db/firebaseServices';

export const calculateTotalEarnings = async (uid: string): Promise<number> => {
  try {
    const earnings = await getEarnings(uid);
    console.log('calculateTotalEarnings: Dados de ganhos:', earnings);

    let total = 0;
    if (earnings && earnings.length > 0) {
      for (const earning of earnings) {
        let amount = 0;
        if (earning) {
          const amountValue = earning.amount ? Number(earning.amount) : 0;
          const tipValue = earning.tip ? Number(earning.tip) : 0;
          amount = amountValue + tipValue;
        }
        console.log('calculateTotalEarnings: Valor do ganho:', amount);
        total += isNaN(amount) ? 0 : amount;
      }
    }
    return total;
  } catch (error) {
    console.error('Erro ao calcular ganhos:', error);
    return 0;
  }
};

export const calculateTotalFuelings = async (uid: string): Promise<number> => {
  // Implemente a lógica para calcular o total de abastecimentos
  return 0;
};

export const calculateTotalKilometers = async (uid: string): Promise<number> => {
  try {
    const earnings = await getEarnings(uid);
    console.log('calculateTotalKilometers: Dados de ganhos:', earnings);

    let total = 0;
    if (earnings && earnings.length > 0) {
      for (const earning of earnings) {
        let mileage = 0;
        if (earning && earning.mileage) {
          mileage = Number(earning.mileage);
        }
        console.log('calculateTotalKilometers: Valor do km:', mileage);
        total += isNaN(mileage) ? 0 : mileage;
      }
      return total;
    }
    return 0;
  } catch (error) {
    console.error('Erro ao calcular quilômetros:', error);
    return 0;
  }
};

export const calculateTotalHours = async (uid: string): Promise<number> => {
  try {
    const earnings = await getEarnings(uid);
    console.log('calculateTotalHours: Dados de ganhos:', earnings);

    let total = 0;
    if (earnings && earnings.length > 0) {
      for (const earning of earnings) {
        let hours = 0;
        if (earning && earning.hours) {
          hours = Number(earning.hours);
        }
        console.log('calculateTotalHours: Valor das horas:', hours);
        total += isNaN(hours) ? 0 : hours;
      }
      return total;
    }
    return 0;
  } catch (error) {
    console.error('Erro ao calcular horas:', error);
    return 0;
  }
};

export const calculateAverageEarningsPerHour = async (uid: string): Promise<number> => {
    try {
      const earnings = await getEarnings(uid);
      if (earnings && earnings.length > 0) {
        let totalEarnings = 0;
        let totalHours = 0;
        for (const earning of earnings) {
          const amount = earning.amount ? Number(earning.amount) : 0;
          const tip = earning.tip ? Number(earning.tip) : 0;
          const hours = earning.hours ? Number(earning.hours) : 0;
          totalEarnings += amount + tip;
          totalHours += hours;
        }
        return totalHours > 0 ? totalEarnings / totalHours : 0;
      }
      return 0;
    } catch (error) {
      console.error('Erro ao calcular média de ganhos por hora:', error);
      return 0;
    }
  };
  
  export const calculateAverageEarningsPerDay = async (uid: string): Promise<number> => {
    try {
      const earnings = await getEarnings(uid);
      if (earnings && earnings.length > 0) {
        let totalEarnings = 0;
        const uniqueDates = new Set();
        for (const earning of earnings) {
          const amount = earning.amount ? Number(earning.amount) : 0;
          const tip = earning.tip ? Number(earning.tip) : 0;
          totalEarnings += amount + tip;
          if (earning.date) {
            const date = new Date(earning.date.seconds * 1000); // Converte timestamp do Firebase para Date
            uniqueDates.add(date.toDateString()); // Adiciona a data sem a hora
          }
        }
        return uniqueDates.size > 0 ? totalEarnings / uniqueDates.size : 0;
      }
      return 0;
    } catch (error) {
      console.error('Erro ao calcular média de ganhos por dia:', error);
      return 0;
    }
  };
