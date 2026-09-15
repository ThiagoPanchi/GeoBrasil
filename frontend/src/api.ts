import type {
  Indicator,
  MunicipalityDetails,
  MunicipalityFeatureCollection,
  TerritorialFeatureCollection,
  Uf,
} from './types';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export async function getStates(): Promise<Uf[]> {
  const response = await fetch(`${apiUrl}/states`);
  return response.json();
}

export async function getStatesGeojson(indicator: string): Promise<TerritorialFeatureCollection> {
  const response = await fetch(`${apiUrl}/states/geojson?indicator=${encodeURIComponent(indicator)}`);
  return response.json();
}

export async function getIndicators(): Promise<Indicator[]> {
  const response = await fetch(`${apiUrl}/indicators`);
  return response.json();
}

export async function getMicroregionsByState(uf: string, indicator = 'population'): Promise<TerritorialFeatureCollection> {
  const response = await fetch(
    `${apiUrl}/states/${encodeURIComponent(uf)}/microregions?indicator=${encodeURIComponent(indicator)}`,
  );
  return response.json();
}

export async function getMunicipalitiesByState(
  uf: string,
  indicator: string,
): Promise<MunicipalityFeatureCollection> {
  const response = await fetch(
    `${apiUrl}/states/${encodeURIComponent(uf)}/municipalities?indicator=${encodeURIComponent(indicator)}`,
  );
  return response.json();
}

export async function getMunicipalitiesByMicroregion(
  microregionId: string,
  indicator: string,
): Promise<MunicipalityFeatureCollection> {
  const response = await fetch(
    `${apiUrl}/microregions/${encodeURIComponent(microregionId)}/municipalities?indicator=${encodeURIComponent(indicator)}`,
  );
  return response.json();
}

export async function getSectorsByMunicipality(
  municipalityId: string,
  indicator: string,
): Promise<TerritorialFeatureCollection> {
  const response = await fetch(
    `${apiUrl}/municipalities/${encodeURIComponent(municipalityId)}/sectors?indicator=${encodeURIComponent(indicator)}`,
  );
  return response.json();
}

export async function getMunicipality(municipalityId: string): Promise<MunicipalityDetails> {
  const response = await fetch(`${apiUrl}/municipalities/${municipalityId}`);
  return response.json();
}
