// src/hooks/useGasStations.ts
import { useState, useEffect } from "react";

export interface GasStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
}

export function useGasStations(query: string) {
  const [stations, setStations] = useState<GasStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    // Exemplo: use a URL da API que retorna dados de postos com base em uma consulta
    fetch(`https://api.exemplo.com/gas-stations?query=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        setStations(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Erro ao buscar postos");
        setLoading(false);
      });
  }, [query]);

  return { stations, loading, error };
}
