// src/app/utils/geoUtils.ts

/**
 * Cria um bounding box (~raio de 150 km) em torno de [lng, lat].
 * @param lng longitude
 * @param lat latitude
 * @param radiusKm raio em km (padrão 150)
 * @returns [minX, minY, maxX, maxY]
 */
export function computeBbox(
  lng: number,
  lat: number,
  radiusKm = 150
): [number, number, number, number] {
  // 1 grau latitude ~ 111 km
  const latDelta = radiusKm / 111.12;

  // longitude varia com cos(lat)
  const rad = (Math.PI / 180) * lat;
  const lngDelta = radiusKm / (111.12 * Math.cos(rad));

  const minX = lng - lngDelta;
  const maxX = lng + lngDelta;
  const minY = lat - latDelta;
  const maxY = lat + latDelta;

  return [minX, minY, maxX, maxY];
}

/**
 * Verifica se coords [lng, lat] estão dentro do bounding box [minX, minY, maxX, maxY].
 */
export function isInsideBbox(
  [lng, lat]: [number, number],
  [minX, minY, maxX, maxY]: [number, number, number, number]
): boolean {
  return lng >= minX && lng <= maxX && lat >= minY && lat <= maxY;
}
