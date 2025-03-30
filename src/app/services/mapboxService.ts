// src/app/services/mapboxService.ts
import mapboxgl from 'mapbox-gl';
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';
import mbxDirections from '@mapbox/mapbox-sdk/services/directions';

// Token da sua conta Mapbox (verifique se está válido e com permissões de Geocoding).
mapboxgl.accessToken = 'pk.eyJ1IjoibWFydWsiLCJhIjoiY204bndmdnIwMDBiYTJxb2oydW00emplcSJ9.FO5u9DFzfdDYLY2aVBm4Cg';

const geocodingClient = mbxGeocoding({ accessToken: mapboxgl.accessToken });
const directionsClient = mbxDirections({ accessToken: mapboxgl.accessToken });

export interface Route {
  distance: number;
  duration: number;
  geometry: any;
}

export const getCoordinates = async (address: string): Promise<[number, number]> => {
  const resp = await geocodingClient
    .forwardGeocode({ query: address, limit: 1 })
    .send();
  if (resp.body.features.length > 0) {
    return resp.body.features[0].geometry.coordinates as [number, number];
  }
  throw new Error("Coordenadas não encontradas para: " + address);
};

export const getRoute = async (
  originCoords: [number, number],
  destCoords: [number, number]
): Promise<Route> => {
  const resp = await directionsClient
    .getDirections({
      profile: 'driving',
      waypoints: [
        { coordinates: originCoords },
        { coordinates: destCoords }
      ],
      geometries: 'geojson'
    })
    .send();

  if (!resp.body.routes || resp.body.routes.length === 0) {
    throw new Error("Rota não encontrada.");
  }
  return resp.body.routes[0];
};

/**
 * Retorna array de features (cada feature tem .place_name, .geometry etc.),
 * se bbox for passado, limita a essa area
 */
export const getSuggestions = async (
  query: string,
  bbox?: [number, number, number, number]
) => {
  const resp = await geocodingClient
    .forwardGeocode({
      query,
      limit: 5,
      bbox
    })
    .send();
  return resp.body.features; // array
};

export const reverseGeocode = async ([lng, lat]: [number, number]): Promise<string> => {
  const resp = await geocodingClient
    .reverseGeocode({
      query: [lng, lat],
      limit: 1
    })
    .send();
  if (resp.body.features && resp.body.features.length > 0) {
    return resp.body.features[0].place_name;
  }
  throw new Error("Endereço não encontrado");
};
