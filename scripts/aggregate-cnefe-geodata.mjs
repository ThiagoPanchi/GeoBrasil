import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { geojson } from 'flatgeobuf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const outputDir = path.join(root, 'public', 'geodata', 'cnefe-aggregated');
const manifestFileName = 'manifest.json';

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

function usage() {
  console.log('Usage: npm run aggregate:cnefe -- public/geodata/cnefe/<municipality>-part-0001.fgb');
  console.log('       npm run aggregate:cnefe -- public/geodata/cnefe');
  console.log('       npm run aggregate:cnefe -- --manifest');
}

async function findAggregatedFiles(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return findAggregatedFiles(entryPath);
    }

    return entry.isFile() && /\.fgb$/i.test(entry.name) ? [entryPath] : [];
  }));

  return files.flat();
}

async function writeAggregatedManifest() {
  const files = (await findAggregatedFiles(outputDir))
    .sort((left, right) => path.relative(outputDir, left).localeCompare(path.relative(outputDir, right)));
  const municipalities = {};

  for (const file of files) {
    const fileName = path.basename(file);
    const municipalityCode = fileName.match(/^(\d{7})/)?.[1];

    if (!municipalityCode) {
      continue;
    }

    municipalities[municipalityCode] ??= { files: [] };
    municipalities[municipalityCode].files.push(path.relative(path.join(root, 'public'), file).replace(/\\/g, '/'));
  }

  const manifestPath = path.join(outputDir, manifestFileName);
  await mkdir(path.dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), municipalities }, null, 2)}\n`);
  return manifestPath;
}

async function resolveInputFiles(argument) {
  if (!argument) {
    usage();
    throw new Error('CNEFE FlatGeoBuf input file or directory path is required.');
  }

  const inputPath = path.isAbsolute(argument) ? argument : path.join(root, argument);

  if (!existsSync(inputPath)) {
    throw new Error(`CNEFE FlatGeoBuf input not found: ${inputPath}`);
  }

  const inputStats = await stat(inputPath);

  if (inputStats.isFile()) {
    if (!/\.fgb$/i.test(inputPath)) {
      throw new Error(`CNEFE input file must be a FlatGeoBuf .fgb file: ${inputPath}`);
    }

    return [inputPath];
  }

  if (!inputStats.isDirectory()) {
    throw new Error(`CNEFE input must be a FlatGeoBuf .fgb file or directory: ${inputPath}`);
  }

  const entries = await readdir(inputPath, { withFileTypes: true });
  const inputFiles = entries
    .filter((entry) => entry.isFile() && /\.fgb$/i.test(entry.name))
    .map((entry) => path.join(inputPath, entry.name))
    .sort((left, right) => path.basename(left).localeCompare(path.basename(right)));

  if (inputFiles.length === 0) {
    throw new Error(`No CNEFE FlatGeoBuf .fgb files found in directory: ${inputPath}`);
  }

  return inputFiles;
}

async function readFlatGeobuf(file) {
  const bytes = new Uint8Array(await readFile(file));
  const features = [];

  for await (const feature of geojson.deserialize(bytes)) {
    features.push(feature);
  }

  return features;
}

async function writeFlatGeobuf(fileName, features) {
  const ufCode = fileName.slice(0, 2);
  const uf = ufByIbgeCode.get(ufCode);

  if (!uf) {
    throw new Error(`Unknown IBGE UF code '${ufCode}' for CNEFE file '${fileName}'`);
  }

  const outputPath = path.join(outputDir, uf, fileName);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, Buffer.from(geojson.serialize({ type: 'FeatureCollection', features })));
  return outputPath;
}

function stableValue(value) {
  if (Array.isArray(value)) {
    return value.map(stableValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [key, stableValue(nestedValue)]),
    );
  }

  return value;
}

function propertiesWithoutQuantidade(properties) {
  return Object.fromEntries(
    Object.entries(properties ?? {})
      .filter(([key]) => key !== 'QUANTIDADE')
      .sort(([left], [right]) => left.localeCompare(right)),
  );
}

function groupingKey(feature) {
  return JSON.stringify({
    geometry: stableValue(feature.geometry),
    properties: stableValue(propertiesWithoutQuantidade(feature.properties)),
  });
}

export function aggregateFeatures(features) {
  const groups = new Map();

  for (const feature of features) {
    const key = groupingKey(feature);
    const existing = groups.get(key);

    if (existing) {
      existing.count += 1;
      continue;
    }

    groups.set(key, {
      count: 1,
      feature: {
        type: 'Feature',
        geometry: stableValue(feature.geometry),
        properties: propertiesWithoutQuantidade(feature.properties),
      },
    });
  }

  return [...groups.values()].map(({ count, feature }) => ({
    ...feature,
    properties: {
      ...feature.properties,
      QUANTIDADE: count,
    },
  }));
}

async function aggregateFile(inputPath) {
  console.log(`CNEFE aggregation source: ${path.relative(root, inputPath)}`);

  const features = await readFlatGeobuf(inputPath);
  const aggregatedFeatures = aggregateFeatures(features);
  const outputPath = await writeFlatGeobuf(path.basename(inputPath), aggregatedFeatures);
  const collapsedDuplicates = features.length - aggregatedFeatures.length;

  console.log(`CNEFE aggregation output: ${path.relative(root, outputPath)}`);
  console.log(`Input features: ${features.length}`);
  console.log(`Output features: ${aggregatedFeatures.length}`);
  console.log(`Collapsed duplicate records: ${collapsedDuplicates}`);

  return { inputFeatures: features.length, outputFeatures: aggregatedFeatures.length, collapsedDuplicates };
}

async function main() {
  const inputArgument = process.argv[2];

  if (inputArgument === '--help' || inputArgument === '-h') {
    usage();
    return;
  }

  if (inputArgument === '--manifest') {
    const manifestPath = await writeAggregatedManifest();
    console.log(`Wrote ${path.relative(root, manifestPath)}`);
    return;
  }

  const inputFiles = await resolveInputFiles(inputArgument);
  const totals = { inputFeatures: 0, outputFeatures: 0, collapsedDuplicates: 0 };

  for (const inputFile of inputFiles) {
    try {
      const result = await aggregateFile(inputFile);
      totals.inputFeatures += result.inputFeatures;
      totals.outputFeatures += result.outputFeatures;
      totals.collapsedDuplicates += result.collapsedDuplicates;
    } catch (error) {
      throw new Error(`Failed to aggregate ${path.relative(root, inputFile)}: ${error.message}`, { cause: error });
    }
  }

  console.log(`CNEFE aggregation files processed: ${inputFiles.length}`);
  console.log(`Total input features: ${totals.inputFeatures}`);
  console.log(`Total output features: ${totals.outputFeatures}`);
  console.log(`Total collapsed duplicate records: ${totals.collapsedDuplicates}`);
  const manifestPath = await writeAggregatedManifest();
  console.log(`Wrote ${path.relative(root, manifestPath)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((error) => {
    console.error(error.stack ?? error.message);
    process.exitCode = 1;
  });
}
