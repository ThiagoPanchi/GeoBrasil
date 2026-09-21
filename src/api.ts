import { geojson } from 'flatgeobuf';
import type {
  ChoroplethBreak,
  Indicator,
  Microregion,
  MunicipalityDetails,
  MunicipalityFeatureCollection,
  MunicipalityOption,
  StaticAssetManifest,
  TerritorialLayer,
  Uf,
} from './types';

const colorRamp = ['#eff3ff', '#bdd7e7', '#6baed6', '#3182bd', '#08519c'];
let manifestPromise: Promise<StaticAssetManifest> | null = null;

function publicUrl(assetPath: string) {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  return new URL(assetPath, window.location.origin + base).pathname;
}

async function fetchJson<T>(assetPath: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(publicUrl(assetPath), { signal });

  if (!response.ok) {
    throw new Error(`Asset estatico indisponivel: ${assetPath}`);
  }

  return response.json();
}

async function readGeoJson(assetPath: string, signal?: AbortSignal): Promise<GeoJSON.Feature[]> {
  const collection = await fetchJson<GeoJSON.FeatureCollection>(assetPath, signal);
  return collection.features;
}

export async function getManifest(signal?: AbortSignal): Promise<StaticAssetManifest> {
  manifestPromise ??= fetchJson<StaticAssetManifest>('geodata/manifest.json');

  if (signal?.aborted) {
    throw new DOMException('Request aborted', 'AbortError');
  }

  return manifestPromise;
}

async function readFlatGeobuf(assetPath: string, signal?: AbortSignal): Promise<GeoJSON.Feature[]> {
  const response = await fetch(publicUrl(assetPath), { signal });

  if (!response.ok) {
    throw new Error(`Asset estatico indisponivel: ${assetPath}`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  const features: GeoJSON.Feature[] = [];

  for await (const feature of geojson.deserialize(bytes)) {
    features.push(feature as GeoJSON.Feature);
  }

  return features;
}

export async function getStates(signal?: AbortSignal): Promise<Uf[]> {
  const manifest = await getManifest(signal);
  return manifest.ufs.map(({ code, name, ibgeCode }) => ({ code, name, ibgeCode }));
}

export async function getIndicators(signal?: AbortSignal): Promise<Indicator[]> {
  const manifest = await getManifest(signal);
  return manifest.indicators;
}

export async function getMicroregionsByState(uf: string, signal?: AbortSignal): Promise<Microregion[]> {
  const manifest = await getManifest(signal);
  return manifest.microregions.filter((microregion) => microregion.uf === uf);
}

export async function getMunicipalitiesByMicroregion(
  microregionId: string,
  signal?: AbortSignal,
): Promise<MunicipalityOption[]> {
  const manifest = await getManifest(signal);
  return manifest.municipalities
    .filter((municipality) => municipality.microregionId === microregionId)
    .map(({ id, name, uf, ufCode, microregionId }) => ({ id, name, uf, ufCode, microregionId }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export async function getStatesGeojson(indicator: string, signal?: AbortSignal): Promise<MunicipalityFeatureCollection> {
  const manifest = await getManifest(signal);
  const features = manifest.assets.ufs.endsWith('.geojson')
    ? await readGeoJson(manifest.assets.ufs, signal)
    : await readFlatGeobuf(manifest.assets.ufs, signal);
  return styleFeatureCollection(features, indicator, 'ufs');
}

export async function getMicroregionsGeojsonByState(
  uf: string,
  indicator: string,
  signal?: AbortSignal,
): Promise<MunicipalityFeatureCollection> {
  const manifest = await getManifest(signal);
  const entry = manifest.ufs.find((item) => item.code === uf);

  if (!entry) {
    throw new Error(`UF nao encontrada: ${uf}`);
  }

  const features = await readFlatGeobuf(entry.assets.microregions, signal);
  return styleFeatureCollection(features, indicator, 'microregions');
}

export async function getMunicipalitiesByState(
  uf: string,
  indicator: string,
  microregionId?: string,
  signal?: AbortSignal,
): Promise<MunicipalityFeatureCollection> {
  const manifest = await getManifest(signal);
  const entry = manifest.ufs.find((item) => item.code === uf);

  if (!entry) {
    throw new Error(`UF nao encontrada: ${uf}`);
  }

  const features = await readFlatGeobuf(entry.assets.municipalities, signal);
  const filteredFeatures = microregionId
    ? features.filter((feature) => String(feature.properties?.microregionId ?? feature.properties?.CD_RGI ?? '') === microregionId)
    : features;

  return styleFeatureCollection(filteredFeatures, indicator, 'municipalities');
}

export async function getSectorsByMunicipality(
  municipalityId: string,
  indicator: string,
  signal?: AbortSignal,
): Promise<MunicipalityFeatureCollection> {
  const manifest = await getManifest(signal);
  const entry = manifest.municipalities.find((item) => item.id === municipalityId);

  if (!entry) {
    throw new Error(`Municipio nao encontrado: ${municipalityId}`);
  }

  const features = await readFlatGeobuf(entry.asset, signal);
  return styleFeatureCollection(features, indicator, 'sectors');
}

export async function getMicroregionMunicipalitiesWithSectors(
  microregionId: string,
  indicator: string,
  signal?: AbortSignal,
): Promise<{ municipalities: MunicipalityFeatureCollection; sectors: MunicipalityFeatureCollection }> {
  const manifest = await getManifest(signal);
  const municipalities = manifest.municipalities.filter((item) => item.microregionId === microregionId);

  if (municipalities.length === 0) {
    throw new Error(`Microrregiao sem municipios no manifesto: ${microregionId}`);
  }

  const municipalityFeatures = await Promise.all(
    [...new Set(municipalities.map((item) => item.uf))].map(async (uf) => {
      const entry = manifest.ufs.find((item) => item.code === uf);

      if (!entry) {
        return [] as GeoJSON.Feature[];
      }

      return readFlatGeobuf(entry.assets.municipalities, signal);
    }),
  );
  const municipalityIds = new Set(municipalities.map((item) => item.id));
  const filteredMunicipalities = municipalityFeatures
    .flat()
    .filter((feature) => municipalityIds.has(String(feature.properties?.id ?? feature.properties?.CD_MUN ?? '')));
  const sectorFeatures = (
    await Promise.all(municipalities.map((municipality) => readFlatGeobuf(municipality.asset, signal)))
  ).flat();

  return {
    municipalities: styleFeatureCollection(filteredMunicipalities, indicator, 'municipalities'),
    sectors: styleFeatureCollection(sectorFeatures, indicator, 'sectors'),
  };
}

export async function getMunicipality(municipalityId: string, signal?: AbortSignal): Promise<MunicipalityDetails> {
  const manifest = await getManifest(signal);
  const municipality = manifest.municipalities.find((item) => item.id === municipalityId);

  if (!municipality) {
    throw new Error(`Municipio nao encontrado: ${municipalityId}`);
  }

  return {
    id: municipality.id,
    name: municipality.name,
    uf: municipality.uf,
    microregionId: municipality.microregionId,
    indicators: {},
  };
}

function styleFeatureCollection(
  features: GeoJSON.Feature[],
  indicator: string,
  layer: TerritorialLayer,
): MunicipalityFeatureCollection {
  const normalized = features.map((feature) => normalizeFeature(feature, layer));
  const breaks = buildBreaks(normalized.map((feature) => getIndicatorValue(feature, indicator)));
  const styledFeatures = normalized.map((feature) => styleFeature(feature, indicator, breaks));

  return {
    type: 'FeatureCollection',
    features: styledFeatures,
    metadata: {
      indicator,
      breaks,
      bbox: calculateBbox(styledFeatures),
      rows: styledFeatures.map((feature) => featureToDetails(feature, layer)),
      layer,
    },
  };
}

function normalizeFeature(feature: GeoJSON.Feature, layer: TerritorialLayer): GeoJSON.Feature {
  const properties = feature.properties ?? {};
  const id = String(properties.id ?? properties.code ?? properties.CD_SETOR ?? properties.CD_MUN ?? properties.CD_RGI ?? properties.SIGLA_UF ?? '');
  const name = String(properties.name ?? properties.NM_MUN ?? properties.NM_RGI ?? properties.NM_UF ?? id);
  const uf = String(properties.uf ?? properties.SIGLA_UF ?? '');
  const indicators = normalizeIndicators(properties.indicators, properties);

  return {
    ...feature,
    properties: {
      id,
      name,
      uf,
      layer,
      indicators: JSON.stringify(indicators),
      municipalityId: String(properties.municipalityId ?? properties.CD_MUN ?? id),
      municipalityName: String(properties.municipalityName ?? properties.NM_MUN ?? name),
      microregionId: String(properties.microregionId ?? properties.CD_RGI ?? ''),
      microregionName: String(properties.microregionName ?? properties.NM_RGI ?? ''),
      indicatorValue: 0,
      fillColor: colorRamp[0],
    },
  };
}

function normalizeIndicators(indicators: unknown, properties: GeoJSON.GeoJsonProperties): Record<string, number> {
  if (indicators && typeof indicators === 'object') {
    return Object.fromEntries(Object.entries(indicators as Record<string, unknown>).map(([key, value]) => [key, toNumber(value)]));
  }

  const population = toNumber(properties?.v0001);
  const area = toNumber(properties?.AREA_KM2);

  return {
    population,
    density: area > 0 ? population / area : 0,
    households: toNumber(properties?.v0002),
    literacy: toNumber(properties?.v0003),
    ethnicity_race: toNumber(properties?.v0004),
    gender_sex: toNumber(properties?.v0005),
    age_group: toNumber(properties?.v0006),
    income: toNumber(properties?.v0007),
  };
}

function styleFeature(feature: GeoJSON.Feature, indicator: string, breaks: ChoroplethBreak[]): GeoJSON.Feature {
  const value = getIndicatorValue(feature, indicator);
  const color = breaks.find((item) => item.min <= value && value <= item.max)?.color ?? colorRamp[0];

  return {
    ...feature,
    properties: {
      ...feature.properties,
      indicatorValue: value,
      fillColor: color,
    },
  };
}

function getIndicatorValue(feature: GeoJSON.Feature, indicator: string) {
  const indicators = parseIndicators(feature.properties?.indicators);
  return toNumber(indicators[indicator]);
}

function buildBreaks(values: number[]): ChoroplethBreak[] {
  const validValues = values.filter((value) => Number.isFinite(value));

  if (validValues.length === 0) {
    return [];
  }

  const min = Math.min(...validValues);
  const max = Math.max(...validValues);

  if (min === max) {
    return [{ min, max, color: colorRamp[colorRamp.length - 1] }];
  }

  const step = (max - min) / colorRamp.length;
  return colorRamp.map((color, index) => ({
    min: index === 0 ? min : min + step * index,
    max: index === colorRamp.length - 1 ? max : min + step * (index + 1),
    color,
  }));
}

function calculateBbox(features: GeoJSON.Feature[]): [[number, number], [number, number]] {
  const bbox = {
    minLng: Infinity,
    minLat: Infinity,
    maxLng: -Infinity,
    maxLat: -Infinity,
    count: 0,
  };

  for (const feature of features) {
    collectCoordinates(feature.geometry, bbox);
  }

  if (bbox.count === 0) {
    return [[-74, -34], [-34, 6]];
  }

  return [[bbox.minLng, bbox.minLat], [bbox.maxLng, bbox.maxLat]];
}

type BboxAccumulator = {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
  count: number;
};

function collectCoordinates(geometry: GeoJSON.Geometry | null, bbox: BboxAccumulator) {
  if (!geometry) {
    return;
  }

  if (geometry.type === 'GeometryCollection') {
    geometry.geometries.forEach((item) => collectCoordinates(item, bbox));
    return;
  }

  collectNestedCoordinates(geometry.coordinates, bbox);
}

function collectNestedCoordinates(value: unknown, bbox: BboxAccumulator) {
  if (!Array.isArray(value)) {
    return;
  }

  if (typeof value[0] === 'number' && typeof value[1] === 'number') {
    bbox.minLng = Math.min(bbox.minLng, value[0]);
    bbox.minLat = Math.min(bbox.minLat, value[1]);
    bbox.maxLng = Math.max(bbox.maxLng, value[0]);
    bbox.maxLat = Math.max(bbox.maxLat, value[1]);
    bbox.count += 1;
    return;
  }

  value.forEach((item) => collectNestedCoordinates(item, bbox));
}

function featureToDetails(feature: GeoJSON.Feature, layer: TerritorialLayer): MunicipalityDetails {
  const properties = feature.properties ?? {};

  return {
    id: String(properties.id ?? ''),
    name: String(properties.name ?? ''),
    uf: String(properties.uf ?? ''),
    layer,
    microregionId: String(properties.microregionId ?? ''),
    microregionName: String(properties.microregionName ?? ''),
    indicators: parseIndicators(properties.indicators),
  };
}

function parseIndicators(value: unknown): Record<string, number> {
  if (typeof value === 'string') {
    try {
      return Object.fromEntries(Object.entries(JSON.parse(value)).map(([key, item]) => [key, toNumber(item)]));
    } catch {
      return {};
    }
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, toNumber(item)]));
  }

  return {};
}

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
