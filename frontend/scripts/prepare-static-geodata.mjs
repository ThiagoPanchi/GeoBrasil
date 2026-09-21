import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { geojson } from 'flatgeobuf';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', '..');
const sourceDir = path.join(root, 'data', 'FlatGeoBuf');
const outputDir = path.join(root, 'frontend', 'public', 'geodata');

const sources = {
  ufs: path.join(sourceDir, 'BR_UF_2025_simp.fgb'),
  municipalities: path.join(sourceDir, 'BR_Municipios_2025_simp.fgb'),
  microregions: path.join(sourceDir, 'BR_Microrregioes_2022_simp.fgb'),
  sectors: path.join(sourceDir, 'BR_setores_CD2022_simp.fgb'),
};

const indicators = [
  { id: 'population', name: 'Populacao total', unit: 'habitantes', property: 'v0001' },
  { id: 'density', name: 'Densidade demografica', unit: 'hab/km2', property: 'density' },
  { id: 'households', name: 'Domicilios', unit: 'domicilios', property: 'v0002' },
  { id: 'literacy', name: 'Alfabetizacao', unit: 'pessoas', property: 'v0003' },
  { id: 'ethnicity_race', name: 'Cor ou raca', unit: 'pessoas', property: 'v0004' },
  { id: 'gender_sex', name: 'Sexo', unit: 'pessoas', property: 'v0005' },
  { id: 'age_group', name: 'Grupo de idade', unit: 'pessoas', property: 'v0006' },
  { id: 'income', name: 'Renda', unit: 'indice', property: 'v0007' },
];

function requireSources() {
  const missing = Object.values(sources).filter((file) => !existsSync(file));

  if (missing.length > 0) {
    throw new Error(`Required FlatGeoBuf source files are missing:\n${missing.map((file) => `- ${file}`).join('\n')}`);
  }
}

async function readFlatGeobuf(file) {
  const bytes = new Uint8Array(await readFile(file));
  const features = [];

  for await (const feature of geojson.deserialize(bytes)) {
    features.push(feature);
  }

  return features;
}

async function writeFlatGeobuf(relativePath, features) {
  const outputPath = path.join(outputDir, relativePath);
  await mkdir(path.dirname(outputPath), { recursive: true });
  const collection = { type: 'FeatureCollection', features };
  await writeFile(outputPath, Buffer.from(geojson.serialize(collection)));
}

async function writeGeoJson(relativePath, features) {
  const outputPath = path.join(outputDir, relativePath);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify({ type: 'FeatureCollection', features })}\n`);
}

function simplifyGeometry(geometry, maxRingPoints = 450) {
  if (!geometry) {
    return geometry;
  }

  if (geometry.type === 'Polygon') {
    return { ...geometry, coordinates: geometry.coordinates.map((ring) => simplifyRing(ring, maxRingPoints)) };
  }

  if (geometry.type === 'MultiPolygon') {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((polygon) => polygon.map((ring) => simplifyRing(ring, maxRingPoints))),
    };
  }

  return geometry;
}

function simplifyRing(ring, maxRingPoints) {
  if (!Array.isArray(ring) || ring.length <= maxRingPoints) {
    return ring;
  }

  const step = Math.ceil(ring.length / maxRingPoints);
  const simplified = ring.filter((_, index) => index % step === 0);
  const first = ring[0];
  const last = simplified[simplified.length - 1];

  if (!last || first[0] !== last[0] || first[1] !== last[1]) {
    simplified.push(first);
  }

  return simplified;
}

function simplifyFeatures(features, maxRingPoints) {
  return features.map((feature) => ({
    ...feature,
    geometry: simplifyGeometry(feature.geometry, maxRingPoints),
  }));
}

function byCode(items) {
  return new Map(items.map((item) => [item.code, item]));
}

function getNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sectorIndicators(properties) {
  const population = getNumber(properties.v0001);
  const area = getNumber(properties.AREA_KM2);

  return {
    population,
    density: area > 0 ? population / area : 0,
    households: getNumber(properties.v0002),
    literacy: getNumber(properties.v0003),
    ethnicity_race: getNumber(properties.v0004),
    gender_sex: getNumber(properties.v0005),
    age_group: getNumber(properties.v0006),
    income: getNumber(properties.v0007),
  };
}

function addIndicators(target, values) {
  for (const indicator of indicators) {
    target[indicator.id] = getNumber(target[indicator.id]) + getNumber(values[indicator.id]);
  }
}

function finalizeDensity(target, area) {
  target.density = area > 0 ? getNumber(target.population) / area : 0;
}

function normalizeSector(feature) {
  const properties = feature.properties ?? {};
  const indicatorsValue = sectorIndicators(properties);

  return {
    ...feature,
    properties: {
      ...properties,
      id: String(properties.CD_SETOR ?? ''),
      name: String(properties.CD_SETOR ?? 'Setor censitario'),
      uf: String(properties.SIGLA_UF ?? ''),
      ufCode: String(properties.CD_UF ?? ''),
      municipalityId: String(properties.CD_MUN ?? ''),
      municipalityName: String(properties.NM_MUN ?? ''),
      microregionId: String(properties.CD_RGI ?? ''),
      microregionName: String(properties.NM_RGI ?? ''),
      level: 'sector',
      indicators: indicatorsValue,
    },
  };
}

function normalizeMunicipality(feature, aggregate) {
  const properties = feature.properties ?? {};
  const area = getNumber(properties.AREA_KM2);
  const indicatorValues = aggregate ? { ...aggregate } : { population: 0, density: 0, households: 0, literacy: 0, ethnicity_race: 0, gender_sex: 0, age_group: 0, income: 0 };
  finalizeDensity(indicatorValues, area);

  return {
    ...feature,
    properties: {
      ...properties,
      id: String(properties.CD_MUN ?? ''),
      name: String(properties.NM_MUN ?? ''),
      uf: String(properties.SIGLA_UF ?? ''),
      ufCode: String(properties.CD_UF ?? ''),
      municipalityId: String(properties.CD_MUN ?? ''),
      municipalityName: String(properties.NM_MUN ?? ''),
      microregionId: String(properties.CD_RGI ?? ''),
      microregionName: String(properties.NM_RGI ?? ''),
      level: 'municipality',
      indicators: indicatorValues,
    },
  };
}

function normalizeMicroregion(feature, aggregate) {
  const properties = feature.properties ?? {};
  const indicatorValues = aggregate ? { ...aggregate } : { population: 0, density: 0, households: 0, literacy: 0, ethnicity_race: 0, gender_sex: 0, age_group: 0, income: 0 };
  finalizeDensity(indicatorValues, getNumber(indicatorValues.area));
  delete indicatorValues.area;

  return {
    ...feature,
    properties: {
      ...properties,
      id: String(properties.CD_RGI ?? ''),
      name: String(properties.NM_RGI ?? ''),
      uf: String(properties.SIGLA_UF ?? ''),
      ufCode: String(properties.CD_UF ?? ''),
      microregionId: String(properties.CD_RGI ?? ''),
      microregionName: String(properties.NM_RGI ?? ''),
      level: 'microregion',
      indicators: indicatorValues,
    },
  };
}

function normalizeUf(feature, aggregate) {
  const properties = feature.properties ?? {};
  const indicatorValues = aggregate ? { ...aggregate } : { population: 0, density: 0, households: 0, literacy: 0, ethnicity_race: 0, gender_sex: 0, age_group: 0, income: 0 };
  finalizeDensity(indicatorValues, getNumber(properties.AREA_KM2));

  return {
    ...feature,
    properties: {
      ...properties,
      id: String(properties.SIGLA_UF ?? ''),
      code: String(properties.SIGLA_UF ?? ''),
      uf: String(properties.SIGLA_UF ?? ''),
      ufCode: String(properties.CD_UF ?? ''),
      name: String(properties.NM_UF ?? ''),
      level: 'uf',
      indicators: indicatorValues,
    },
  };
}

function addToGroup(map, key, feature) {
  if (!key) {
    return;
  }

  const group = map.get(key) ?? [];
  group.push(feature);
  map.set(key, group);
}

function emptyAggregate() {
  return { population: 0, density: 0, households: 0, literacy: 0, ethnicity_race: 0, gender_sex: 0, age_group: 0, income: 0, area: 0 };
}

async function main() {
  requireSources();
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  console.log('Reading sectors and building aggregates...');
  const sectorsByMunicipality = new Map();
  const municipalityAggregates = new Map();
  const microregionAggregates = new Map();
  const ufAggregates = new Map();

  for (const feature of await readFlatGeobuf(sources.sectors)) {
    const normalized = normalizeSector(feature);
    const props = normalized.properties;
    const values = props.indicators;
    const municipalityId = props.municipalityId;
    const microregionId = props.microregionId;
    const ufCode = props.ufCode;
    const area = getNumber(props.AREA_KM2);

    addToGroup(sectorsByMunicipality, municipalityId, normalized);

    for (const [map, key] of [[municipalityAggregates, municipalityId], [microregionAggregates, microregionId], [ufAggregates, ufCode]]) {
      if (!key) {
        continue;
      }
      const aggregate = map.get(key) ?? emptyAggregate();
      addIndicators(aggregate, values);
      aggregate.area += area;
      map.set(key, aggregate);
    }
  }

  console.log('Reading UFs, municipalities, and microregions...');
  const ufFeatures = (await readFlatGeobuf(sources.ufs)).map((feature) => normalizeUf(feature, ufAggregates.get(String(feature.properties?.CD_UF ?? ''))));
  const municipalityFeatures = (await readFlatGeobuf(sources.municipalities))
    .map((feature) => normalizeMunicipality(feature, municipalityAggregates.get(String(feature.properties?.CD_MUN ?? ''))))
    .filter((feature) => sectorsByMunicipality.has(feature.properties.id));
  const microregionFeatures = (await readFlatGeobuf(sources.microregions)).map((feature) => normalizeMicroregion(feature, microregionAggregates.get(String(feature.properties?.CD_RGI ?? ''))));

  const ufs = ufFeatures
    .map((feature) => ({
      code: feature.properties.code,
      ibgeCode: feature.properties.ufCode,
      name: feature.properties.name,
      assets: {
        municipalities: `geodata/municipalities/${feature.properties.code}.fgb`,
        microregions: `geodata/microregions/${feature.properties.code}.fgb`,
      },
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  const municipalities = municipalityFeatures
    .map((feature) => ({
      id: feature.properties.id,
      name: feature.properties.name,
      uf: feature.properties.uf,
      ufCode: feature.properties.ufCode,
      microregionId: feature.properties.microregionId,
      asset: `geodata/sectors/${feature.properties.id}.fgb`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  const microregions = microregionFeatures
    .map((feature) => ({
      id: feature.properties.id,
      name: feature.properties.name,
      uf: feature.properties.uf,
      ufCode: feature.properties.ufCode,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  console.log('Writing partitioned FlatGeobuf assets...');
  await writeFlatGeobuf('ufs.fgb', ufFeatures);
  await writeGeoJson('ufs.geojson', simplifyFeatures(ufFeatures, 450));

  for (const uf of ufs) {
    await writeFlatGeobuf(`municipalities/${uf.code}.fgb`, municipalityFeatures.filter((feature) => feature.properties.uf === uf.code));
    await writeFlatGeobuf(`microregions/${uf.code}.fgb`, microregionFeatures.filter((feature) => feature.properties.uf === uf.code));
  }

  for (const municipality of municipalities) {
    await writeFlatGeobuf(`sectors/${municipality.id}.fgb`, sectorsByMunicipality.get(municipality.id) ?? []);
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    assets: { ufs: 'geodata/ufs.fgb' },
    indicators: indicators.map(({ property, ...indicator }) => indicator),
    ufs,
    municipalities,
    microregions,
  };

  await writeFile(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`Static geodata written to ${outputDir}`);
  console.log(`UFs: ${ufs.length}; municipalities: ${municipalities.length}; microregions: ${microregions.length}; sector partitions: ${sectorsByMunicipality.size}`);
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exitCode = 1;
});
