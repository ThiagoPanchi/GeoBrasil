import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateRawSync } from 'node:zlib';
import { geojson } from 'flatgeobuf';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sourceDir = path.join(root, 'data', 'FlatGeoBuf');
const outputDir = path.join(root, 'public', 'geodata');
const incomeAggregateSource = path.join(root, 'data', 'Agregados_por_setores_renda_responsavel_BR_20260508_csv.zip');
const demographicAggregateSource = path.join(root, 'data', 'Agregados_por_setores_demografia_BR.zip');
const colorRaceAggregateSource = path.join(root, 'data', 'Agregados_por_setores_cor_ou_raca_BR.zip');

const ufByIbgeCode = new Map(Object.entries({
  11: 'RO',
  12: 'AC',
  13: 'AM',
  14: 'RR',
  15: 'PA',
  16: 'AP',
  17: 'TO',
  21: 'MA',
  22: 'PI',
  23: 'CE',
  24: 'RN',
  25: 'PB',
  26: 'PE',
  27: 'AL',
  28: 'SE',
  29: 'BA',
  31: 'MG',
  32: 'ES',
  33: 'RJ',
  35: 'SP',
  41: 'PR',
  42: 'SC',
  43: 'RS',
  50: 'MS',
  51: 'MT',
  52: 'GO',
  53: 'DF',
}));

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
  { id: 'responsible_persons', name: 'Pessoas responsaveis em domicilios particulares', unit: 'pessoas', property: 'v0007' },
  { id: 'income', name: 'Renda media mensal dos responsaveis', unit: 'R$', property: 'V06004' },
  { id: 'men', name: 'Quantidade de homens', unit: 'pessoas', property: 'V01007' },
  { id: 'women', name: 'Quantidade de mulheres', unit: 'pessoas', property: 'V01008' },
  { id: 'race_white', name: 'Cor ou raca branca', unit: 'pessoas', property: 'V01317' },
  { id: 'race_black', name: 'Cor ou raca preta', unit: 'pessoas', property: 'V01318' },
  { id: 'race_yellow', name: 'Cor ou raca amarela', unit: 'pessoas', property: 'V01319' },
  { id: 'race_brown', name: 'Cor ou raca parda', unit: 'pessoas', property: 'V01320' },
  { id: 'race_indigenous', name: 'Cor ou raca indigena', unit: 'pessoas', property: 'V01321' },
];

const sexAggregateColumns = {
  men: 'V01007',
  women: 'V01008',
};

const colorRaceAggregateColumns = {
  race_white: 'V01317',
  race_black: 'V01318',
  race_yellow: 'V01319',
  race_brown: 'V01320',
  race_indigenous: 'V01321',
};

function requireSources() {
  const missing = [...Object.values(sources), incomeAggregateSource, demographicAggregateSource, colorRaceAggregateSource].filter((file) => !existsSync(file));

  if (missing.length > 0) {
    throw new Error(`Required geodata source files are missing:\n${missing.map((file) => `- ${file}`).join('\n')}`);
  }
}

function ufFromMunicipalityId(municipalityId) {
  const ufCode = String(municipalityId ?? '').slice(0, 2);
  const uf = ufByIbgeCode.get(ufCode);

  if (!uf) {
    throw new Error(`Unknown IBGE UF code '${ufCode}' for municipality '${municipalityId}'`);
  }

  return uf;
}

function readUInt32(buffer, offset) {
  return buffer.readUInt32LE(offset);
}

function readUInt16(buffer, offset) {
  return buffer.readUInt16LE(offset);
}

function extractFirstCsvFromZip(buffer, zipPath) {
  const eocdSignature = 0x06054b50;
  let eocdOffset = -1;

  for (let offset = buffer.length - 22; offset >= Math.max(0, buffer.length - 66000); offset -= 1) {
    if (readUInt32(buffer, offset) === eocdSignature) {
      eocdOffset = offset;
      break;
    }
  }

  if (eocdOffset < 0) {
    throw new Error(`Invalid ZIP file: ${zipPath}`);
  }

  const centralDirectorySize = readUInt32(buffer, eocdOffset + 12);
  const centralDirectoryOffset = readUInt32(buffer, eocdOffset + 16);
  let offset = centralDirectoryOffset;

  while (offset < centralDirectoryOffset + centralDirectorySize) {
    if (readUInt32(buffer, offset) !== 0x02014b50) {
      throw new Error(`Invalid ZIP central directory in ${zipPath}`);
    }

    const compressionMethod = readUInt16(buffer, offset + 10);
    const compressedSize = readUInt32(buffer, offset + 20);
    const fileNameLength = readUInt16(buffer, offset + 28);
    const extraLength = readUInt16(buffer, offset + 30);
    const commentLength = readUInt16(buffer, offset + 32);
    const localHeaderOffset = readUInt32(buffer, offset + 42);
    const fileName = buffer.toString('utf8', offset + 46, offset + 46 + fileNameLength);

    if (/\.csv$/i.test(fileName)) {
      if (readUInt32(buffer, localHeaderOffset) !== 0x04034b50) {
        throw new Error(`Invalid ZIP local header for ${fileName}`);
      }

      const localFileNameLength = readUInt16(buffer, localHeaderOffset + 26);
      const localExtraLength = readUInt16(buffer, localHeaderOffset + 28);
      const dataOffset = localHeaderOffset + 30 + localFileNameLength + localExtraLength;
      const compressed = buffer.subarray(dataOffset, dataOffset + compressedSize);
      const data = compressionMethod === 0 ? compressed : compressionMethod === 8 ? inflateRawSync(compressed) : null;

      if (!data) {
        throw new Error(`Unsupported ZIP compression method ${compressionMethod} for ${fileName}`);
      }

      return data.toString('utf8').replace(/^\uFEFF/, '');
    }

    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  throw new Error(`No CSV file found in ${zipPath}`);
}

function detectDelimiter(headerLine) {
  return [';', ',', '\t'].reduce((best, delimiter) => {
    const count = headerLine.split(delimiter).length;
    return count > best.count ? { delimiter, count } : best;
  }, { delimiter: ';', count: 0 }).delimiter;
}

function parseDelimitedLine(line, delimiter) {
  const values = [];
  let current = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === delimiter && !quoted) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

function parseLocalizedNumber(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const text = String(value ?? '').trim();

  if (!text || text === '-' || text.toLowerCase() === 'x') {
    return 0;
  }

  const normalized = text.includes(',')
    ? text.replace(/\./g, '').replace(',', '.')
    : text;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function findColumn(headers, candidates) {
  const normalizedCandidates = new Set(candidates.map((item) => item.toLowerCase()));
  return headers.findIndex((header) => normalizedCandidates.has(header.trim().toLowerCase()));
}

async function readIncomeBySector() {
  const csv = extractFirstCsvFromZip(await readFile(incomeAggregateSource), incomeAggregateSource);
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error(`Income aggregate CSV has no data rows: ${incomeAggregateSource}`);
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseDelimitedLine(lines[0], delimiter);
  const sectorIndex = findColumn(headers, ['CD_SETOR', 'cd_setor', 'Cod_setor', 'cod_setor', 'setor']);
  const incomeIndex = findColumn(headers, ['V06004', 'v06004']);

  if (sectorIndex < 0 || incomeIndex < 0) {
    throw new Error(`Income aggregate CSV must contain sector identifier and V06004 columns. Found: ${headers.join(', ')}`);
  }

  const incomeBySector = new Map();

  for (const line of lines.slice(1)) {
    const row = parseDelimitedLine(line, delimiter);
    const sectorId = String(row[sectorIndex] ?? '').trim();

    if (sectorId) {
      incomeBySector.set(sectorId, parseLocalizedNumber(row[incomeIndex]));
    }
  }

  console.log(`Income aggregate rows loaded: ${incomeBySector.size}`);
  return incomeBySector;
}

async function readAggregateValuesBySector(sourcePath, columnsByIndicator, label) {
  const csv = extractFirstCsvFromZip(await readFile(sourcePath), sourcePath);
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error(`${label} aggregate CSV has no data rows: ${sourcePath}`);
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseDelimitedLine(lines[0], delimiter);
  const sectorIndex = findColumn(headers, ['CD_SETOR', 'CD_setor', 'cd_setor', 'Cod_setor', 'cod_setor', 'setor']);
  const columnIndexes = Object.fromEntries(
    Object.entries(columnsByIndicator).map(([indicatorId, column]) => [indicatorId, findColumn(headers, [column, column.toLowerCase()])]),
  );
  const missingColumns = Object.entries(columnIndexes).filter(([, index]) => index < 0).map(([indicatorId]) => columnsByIndicator[indicatorId]);

  if (sectorIndex < 0 || missingColumns.length > 0) {
    throw new Error(`${label} aggregate CSV must contain sector identifier and columns: ${Object.values(columnsByIndicator).join(', ')}. Found: ${headers.join(', ')}`);
  }

  const valuesBySector = new Map();

  for (const line of lines.slice(1)) {
    const row = parseDelimitedLine(line, delimiter);
    const sectorId = String(row[sectorIndex] ?? '').trim();

    if (!sectorId) {
      continue;
    }

    valuesBySector.set(sectorId, Object.fromEntries(
      Object.entries(columnIndexes).map(([indicatorId, columnIndex]) => [indicatorId, parseLocalizedNumber(row[columnIndex])]),
    ));
  }

  console.log(`${label} aggregate rows loaded: ${valuesBySector.size}`);
  return valuesBySector;
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
  return parseLocalizedNumber(value);
}

function sectorIndicators(properties, incomeBySector, sexBySector, colorRaceBySector) {
  const population = getNumber(properties.v0001);
  const area = getNumber(properties.AREA_KM2);
  const sectorId = String(properties.CD_SETOR ?? '');
  const sexValues = sexBySector.get(sectorId) ?? {};
  const colorRaceValues = colorRaceBySector.get(sectorId) ?? {};

  return {
    population,
    density: area > 0 ? population / area : 0,
    households: getNumber(properties.v0002),
    responsible_persons: getNumber(properties.v0007),
    income: getNumber(incomeBySector.get(sectorId)),
    ...sexValues,
    ...colorRaceValues,
  };
}

function addIndicators(target, values) {
  for (const indicator of indicators) {
    if (indicator.id === 'income') {
      continue;
    }

    target[indicator.id] = getNumber(target[indicator.id]) + getNumber(values[indicator.id]);
  }

  const weight = getNumber(values.responsible_persons);
  target.incomeWeightedTotal = getNumber(target.incomeWeightedTotal) + getNumber(values.income) * weight;
  target.incomeWeight = getNumber(target.incomeWeight) + weight;
}

function finalizeDensity(target, area) {
  target.density = area > 0 ? getNumber(target.population) / area : 0;
}

function finalizeIncome(target) {
  target.income = getNumber(target.incomeWeight) > 0 ? getNumber(target.incomeWeightedTotal) / getNumber(target.incomeWeight) : 0;
  delete target.incomeWeightedTotal;
  delete target.incomeWeight;
}

function normalizeSector(feature, incomeBySector, sexBySector, colorRaceBySector) {
  const properties = feature.properties ?? {};
  const indicatorsValue = sectorIndicators(properties, incomeBySector, sexBySector, colorRaceBySector);

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
      reportAttributes: {
        SITUACAO: String(properties.SITUACAO ?? ''),
        AREA_KM2: getNumber(properties.AREA_KM2),
        NM_DIST: String(properties.NM_DIST ?? ''),
        NM_BAIRRO: String(properties.NM_BAIRRO ?? ''),
      },
      indicators: indicatorsValue,
    },
  };
}

function normalizeMunicipality(feature, aggregate) {
  const properties = feature.properties ?? {};
  const area = getNumber(properties.AREA_KM2);
  const indicatorValues = aggregate ? { ...aggregate } : emptyAggregate();
  finalizeDensity(indicatorValues, area);
  finalizeIncome(indicatorValues);
  delete indicatorValues.area;

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
  const indicatorValues = aggregate ? { ...aggregate } : emptyAggregate();
  finalizeDensity(indicatorValues, getNumber(indicatorValues.area));
  finalizeIncome(indicatorValues);
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
  const indicatorValues = aggregate ? { ...aggregate } : emptyAggregate();
  finalizeDensity(indicatorValues, getNumber(properties.AREA_KM2));
  finalizeIncome(indicatorValues);
  delete indicatorValues.area;

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
  return { population: 0, density: 0, households: 0, responsible_persons: 0, income: 0, incomeWeightedTotal: 0, incomeWeight: 0, area: 0 };
}

async function main() {
  requireSources();
  const incomeBySector = await readIncomeBySector();
  const sexBySector = await readAggregateValuesBySector(demographicAggregateSource, sexAggregateColumns, 'Demographic');
  const colorRaceBySector = await readAggregateValuesBySector(colorRaceAggregateSource, colorRaceAggregateColumns, 'Color/race');
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  console.log('Reading sectors and building aggregates...');
  const sectorsByMunicipality = new Map();
  const municipalityAggregates = new Map();
  const microregionAggregates = new Map();
  const ufAggregates = new Map();

  for (const feature of await readFlatGeobuf(sources.sectors)) {
    const normalized = normalizeSector(feature, incomeBySector, sexBySector, colorRaceBySector);
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
        municipalities: `geodata/municipalities/${feature.properties.code}/${feature.properties.code}.fgb`,
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
      asset: `geodata/sectors/${ufFromMunicipalityId(feature.properties.id)}/${feature.properties.id}.fgb`,
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
    await writeFlatGeobuf(`municipalities/${uf.code}/${uf.code}.fgb`, municipalityFeatures.filter((feature) => feature.properties.uf === uf.code));
    await writeFlatGeobuf(`microregions/${uf.code}.fgb`, microregionFeatures.filter((feature) => feature.properties.uf === uf.code));
  }

  for (const municipality of municipalities) {
    await writeFlatGeobuf(`sectors/${ufFromMunicipalityId(municipality.id)}/${municipality.id}.fgb`, sectorsByMunicipality.get(municipality.id) ?? []);
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
