import type { Indicator, MunicipalityDetails, MunicipalityFeatureCollection, Uf } from './types';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export async function getStates(): Promise<Uf[]> {
  const response = await fetch(`${apiUrl}/states`);
  return response.json();
}

export async function getStatesGeojson(): Promise<GeoJSON.FeatureCollection> {
  const response = await fetch(`${apiUrl}/states/geojson`);
  return response.json();
}

export async function getIndicators(): Promise<Indicator[]> {
  const response = await fetch(`${apiUrl}/indicators`);
  return response.json();
}

export async function getMunicipalitiesByState(
  uf: string,
  indicator: string,
): Promise<MunicipalityFeatureCollection> {
  const response = await fetch(`${apiUrl}/states/${uf}/municipalities?indicator=${indicator}`);
  return response.json();
}

export async function getMunicipality(municipalityId: string): Promise<MunicipalityDetails> {
  const response = await fetch(`${apiUrl}/municipalities/${municipalityId}`);
  return response.json();
}
