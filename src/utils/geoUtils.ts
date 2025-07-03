export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calcularDistanciaTotal(pontos: any[]) {
  let total = 0;
  for (let i = 1; i < pontos.length; i++) {
    const a = pontos[i - 1];
    const b = pontos[i];
    total += haversineDistance(a.latitude, a.longitude, b.latitude, b.longitude);
  }
  return total;
}

export function calcularVelocidadeMedia(pontos: any[]) {
  const emMovimento = pontos.filter((p: any) => p.speed > 1);
  if (emMovimento.length < 2) return 0;

  const tempoTotal = (emMovimento[emMovimento.length - 1].createdAt?.toDate() - emMovimento[0].createdAt?.toDate()) / 3600000;
  const distancia = calcularDistanciaTotal(emMovimento);
  return tempoTotal > 0 ? distancia / tempoTotal : 0;
}
// Calcula a distância em km entre dois pontos latitude/longitude
export function distanciaCoordKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
