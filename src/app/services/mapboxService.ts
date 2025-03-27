//pk.eyJ1IjoibWFydWsiLCJhIjoiY204bndmdnIwMDBiYTJxb2oydW00emplcSJ9.FO5u9DFzfdDYLY2aVBm4Cg
import mapboxgl from 'mapbox-gl';
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';
import mbxDirections from '@mapbox/mapbox-sdk/services/directions';

mapboxgl.accessToken = 'pk.eyJ1IjoibWFydWsiLCJhIjoiY204bndmdnIwMDBiYTJxb2oydW00emplcSJ9.FO5u9DFzfdDYLY2aVBm4Cg';

const geocodingClient = mbxGeocoding({ accessToken: mapboxgl.accessToken });
const directionsClient = mbxDirections({ accessToken: mapboxgl.accessToken });

export const getCoordinates = async (address: string): Promise<[number, number]> => {
  const response = await geocodingClient
    .forwardGeocode({ query: address, limit: 1 })
    .send();
  if (response.body.features.length > 0) {
    return response.body.features[0].geometry.coordinates as [number, number];
  }
  throw new Error("Coordenadas não encontradas para: " + address);
};

interface Route {
  distance: number;
  duration: number;
  geometry: any;
}

export const getRoute = async (
  originCoords: [number, number],
  destCoords: [number, number]
): Promise<Route> => {
  const response = await directionsClient
    .getDirections({
      profile: 'driving',
      waypoints: [{ coordinates: originCoords }, { coordinates: destCoords }],
      geometries: 'geojson',
    })
    .send();

  if (!response.body.routes || response.body.routes.length === 0) {
    throw new Error("Rota não encontrada.");
  }
  return response.body.routes[0];
};

export const getSuggestions = async (
  query: string,
  bbox?: [number, number, number, number]
) => {
  const response = await geocodingClient
    .forwardGeocode({
      query,
      limit: 5,
      bbox: bbox ? bbox : undefined,
    })
    .send();
  return response.body.features;
};

export const reverseGeocode = async (coords: [number, number]): Promise<string> => {
  const response = await geocodingClient
    .reverseGeocode({ query: coords, limit: 1 })
    .send();
  if (response.body.features && response.body.features.length > 0) {
    return response.body.features[0].place_name;
  }
  throw new Error("Endereço não encontrado");
};
