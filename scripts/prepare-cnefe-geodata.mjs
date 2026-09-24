import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { createInflateRaw } from 'node:zlib';
import { geojson } from 'flatgeobuf';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const inputDir = path.join(root, 'data', 'CNEFE');
const outputDir = path.join(root, 'public', 'geodata', 'cnefe');
const manifestFileName = 'manifest.json';
const csvDecodeChunkSize = 1024 * 1024;
const zipStreamChunkSize = 64 * 1024;
const defaultOutputBatchFeatureLimit = 25000;
const parsedOutputBatchFeatureLimit = Number.parseInt(
  process.env.CNEFE_OUTPUT_BATCH_SIZE ?? String(defaultOutputBatchFeatureLimit),
  10,
);
const outputBatchFeatureLimit = Number.isFinite(parsedOutputBatchFeatureLimit) && parsedOutputBatchFeatureLimit > 0
  ? parsedOutputBatchFeatureLimit
  : defaultOutputBatchFeatureLimit;

const requiredColumns = [
  'COD_MUNICIPIO',
  'COD_SETOR',
  'LATITUDE',
  'LONGITUDE',
  'CEP',
  'DSC_LOCALIDADE',
  'NOM_TIPO_SEGLOGR',
  'NOM_TITULO_SEGLOGR',
  'NOM_SEGLOGR',
  'NUM_ENDERECO',
  'DSC_ESTABELECIMENTO',
];

const optionalCodeColumns = [
  'COD_ESPECIE',
  'COD_INDICADOR_ESTAB_ENDERECO',
  'COD_INDICADOR_CONST_ENDERECO',
  'COD_INDICADOR_FINALIDADE_CONST',
  'COD_TIPO_ESPECIE',
];

const addressColumns = [
  'CEP',
  'DSC_LOCALIDADE',
  'NOM_TIPO_SEGLOGR',
  'NOM_TITULO_SEGLOGR',
  'NOM_SEGLOGR',
  'NUM_ENDERECO',
];

const codeMappings = {
  COD_ESPECIE: {
    output: 'ESPECIE_ENDERECO',
    values: {
      1: 'Domicilio particular',
      2: 'Domicilio coletivo',
      3: 'Estabelecimento agropecuario',
      4: 'Estabelecimento de ensino',
      5: 'Estabelecimento de saude',
      6: 'Estabelecimento de outras finalidades',
      7: 'Edificacao em construcao ou reforma',
      8: 'Estabelecimento religioso',
    },
  },
  COD_INDICADOR_ESTAB_ENDERECO: {
    output: 'INDICADOR_ESTABELECIMENTO',
    values: {
      1: 'Unico',
      2: 'Multiplo, com ate 10 estabelecimentos no endereco',
      3: 'Multiplo, com mais de 10 estabelecimentos no endereco',
      4: 'Multiplo, com quantidade de estabelecimentos desconhecida no endereco',
    },
  },
  COD_INDICADOR_CONST_ENDERECO: {
    output: 'INDICADOR_CONSTRUCAO_REFORMA',
    values: {
      1: 'Unico',
      2: 'Multiplo, com ate 10 unidades no endereco',
      3: 'Multiplo, com mais de 10 unidades no endereco',
      4: 'Multiplo, com quantidade de unidades desconhecida no endereco',
    },
  },
  COD_INDICADOR_FINALIDADE_CONST: {
    output: 'INDICADOR_FINALIDADE_CONSTRUCAO',
    values: {
      1: 'Residencial',
      2: 'Nao residencial',
      3: 'Misto',
      4: 'Indeterminado',
    },
  },
  COD_TIPO_ESPECIE: {
    output: 'TIPO_EDIFICACAO_DOMICILIOS',
    values: {
      101: 'Casa',
      102: 'Casa de vila ou em condominio',
      103: 'Apartamento',
      104: 'Outros',
    },
  },
};

function readUInt32(buffer, offset) {
  return buffer.readUInt32LE(offset);
}

function readUInt16(buffer, offset) {
  return buffer.readUInt16LE(offset);
}

function extractCsvEntriesFromZip(buffer, zipPath) {
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
  const csvEntries = [];
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
      if (compressionMethod !== 0 && compressionMethod !== 8) {
        throw new Error(`Unsupported ZIP compression method ${compressionMethod} for ${fileName}`);
      }

      csvEntries.push({ name: fileName, compressionMethod, dataOffset, compressedSize });
    }

    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  if (csvEntries.length === 0) {
    throw new Error(`No CSV file found in ${zipPath}`);
  }

  return csvEntries;
}

function* bufferChunks(buffer, start, end, chunkSize) {
  for (let offset = start; offset < end; offset += chunkSize) {
    yield buffer.subarray(offset, Math.min(offset + chunkSize, end));
  }
}

async function* streamZipEntryData(buffer, csvEntry) {
  const start = csvEntry.dataOffset;
  const end = start + csvEntry.compressedSize;
  const chunks = bufferChunks(buffer, start, end, zipStreamChunkSize);

  if (csvEntry.compressionMethod === 0) {
    yield* chunks;
    return;
  }

  const inflateStream = Readable.from(chunks).pipe(createInflateRaw());

  for await (const chunk of inflateStream) {
    yield chunk;
  }
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

async function* decodeCsvLines(chunks) {
  const decoder = new TextDecoder('utf-8');
  let pending = '';
  let firstChunk = true;

  for await (const rawChunk of chunks) {
    let chunkBuffer = rawChunk;

    if (firstChunk) {
      firstChunk = false;
      chunkBuffer = chunkBuffer.length >= 3 && chunkBuffer[0] === 0xef && chunkBuffer[1] === 0xbb && chunkBuffer[2] === 0xbf
        ? chunkBuffer.subarray(3)
        : chunkBuffer;
    }

    for (let offset = 0; offset < chunkBuffer.length; offset += csvDecodeChunkSize) {
      const nextOffset = Math.min(offset + csvDecodeChunkSize, chunkBuffer.length);
      const chunk = decoder.decode(chunkBuffer.subarray(offset, nextOffset), { stream: true });
      const text = pending + chunk;
      const lines = text.split(/\r?\n/);
      pending = lines.pop() ?? '';

      for (const line of lines) {
        yield line;
      }
    }
  }

  const finalChunk = decoder.decode();
  const finalText = pending + finalChunk;

  if (finalText.length > 0) {
    yield finalText.replace(/\r$/, '');
  }
}

function parseLocalizedNumber(value) {
  const text = String(value ?? '').trim();
  const normalized = text.includes(',') ? text.replace(/\./g, '').replace(',', '.') : text;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function normalizeColumnName(value) {
  return String(value ?? '').trim().toUpperCase();
}

function columnIndex(headers, column) {
  const wanted = normalizeColumnName(column);
  return headers.findIndex((header) => normalizeColumnName(header) === wanted);
}

function buildColumnIndexes(headers, csvName) {
  const indexes = Object.fromEntries(
    [...requiredColumns, ...optionalCodeColumns].map((column) => [column, columnIndex(headers, column)]),
  );
  const missing = requiredColumns.filter((column) => indexes[column] < 0);

  if (missing.length > 0) {
    throw new Error(`CNEFE CSV ${csvName} is missing required columns: ${missing.join(', ')}`);
  }

  return indexes;
}

function valueAt(row, indexes, column) {
  const index = indexes[column];
  return index >= 0 ? String(row[index] ?? '').trim() : '';
}

function buildFullAddress(row, indexes) {
  return addressColumns
    .map((column) => valueAt(row, indexes, column))
    .filter(Boolean)
    .join(' - ');
}

function decodeMappedValue(row, indexes, column) {
  const value = valueAt(row, indexes, column);

  if (!value) {
    return '';
  }

  return codeMappings[column].values[value] ?? value;
}

function rowToFeature(row, indexes) {
  const longitude = parseLocalizedNumber(valueAt(row, indexes, 'LONGITUDE'));
  const latitude = parseLocalizedNumber(valueAt(row, indexes, 'LATITUDE'));

  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    return null;
  }

  const properties = {
    COD_MUNICIPIO: valueAt(row, indexes, 'COD_MUNICIPIO'),
    COD_SETOR: valueAt(row, indexes, 'COD_SETOR'),
    ENDERECO_COMPLETO: buildFullAddress(row, indexes),
    DSC_ESTABELECIMENTO: valueAt(row, indexes, 'DSC_ESTABELECIMENTO'),
  };

  for (const column of optionalCodeColumns) {
    if (indexes[column] < 0) {
      continue;
    }

    properties[codeMappings[column].output] = decodeMappedValue(row, indexes, column);
  }

  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [longitude, latitude],
    },
    properties,
  };
}

async function discoverInputFiles(argument) {
  if (argument) {
    const file = path.isAbsolute(argument) ? argument : path.join(root, argument);

    if (!existsSync(file)) {
      throw new Error(`CNEFE input ZIP not found: ${file}`);
    }

    return [file];
  }

  if (!existsSync(inputDir)) {
    throw new Error(`CNEFE input directory not found: ${inputDir}`);
  }

  const entries = await readdir(inputDir);
  const zipFiles = entries
    .filter((entry) => /\.zip$/i.test(entry))
    .map((entry) => path.join(inputDir, entry))
    .sort((left, right) => left.localeCompare(right));

  if (zipFiles.length === 0) {
    throw new Error(`No CNEFE ZIP files found in ${inputDir}`);
  }

  return zipFiles;
}

async function writeFlatGeobuf(fileName, features) {
  const outputPath = path.join(outputDir, fileName);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, Buffer.from(geojson.serialize({ type: 'FeatureCollection', features })));
  return outputPath;
}

function createManifest() {
  return {
    version: 1,
    generatedAt: '',
    batchFeatureLimit: outputBatchFeatureLimit,
    filesArePartitioned: true,
    municipalities: {},
  };
}

async function readExistingManifest() {
  const manifestPath = path.join(outputDir, manifestFileName);

  if (!existsSync(manifestPath)) {
    return createManifest();
  }

  return JSON.parse(await readFile(manifestPath, 'utf8'));
}

async function writeManifest(manifest) {
  const manifestPath = path.join(outputDir, manifestFileName);
  manifest.generatedAt = new Date().toISOString();
  manifest.batchFeatureLimit = outputBatchFeatureLimit;
  manifest.filesArePartitioned = true;
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return manifestPath;
}

async function removeExistingMunicipalityOutputs(municipalityCode) {
  if (!existsSync(outputDir)) {
    return;
  }

  const entries = await readdir(outputDir);
  const staleFiles = entries.filter((entry) => (
    entry === `${municipalityCode}.fgb`
    || (entry.startsWith(`${municipalityCode}-part-`) && entry.endsWith('.fgb'))
  ));

  await Promise.all(staleFiles.map((entry) => rm(path.join(outputDir, entry), { force: true })));
}

function partFileName(municipalityCode, partNumber) {
  return `${municipalityCode}-part-${String(partNumber).padStart(4, '0')}.fgb`;
}

async function municipalityState(municipalityStates, manifest, municipalityCode) {
  const existing = municipalityStates.get(municipalityCode);

  if (existing) {
    return existing;
  }

  await removeExistingMunicipalityOutputs(municipalityCode);
  manifest.municipalities[municipalityCode] = { files: [], features: 0 };

  const state = { municipalityCode, partNumber: 1, features: [] };
  municipalityStates.set(municipalityCode, state);
  return state;
}

async function flushMunicipalityPart(state, manifest) {
  if (state.features.length === 0) {
    return 0;
  }

  const fileName = partFileName(state.municipalityCode, state.partNumber);
  const featureCount = state.features.length;
  const outputPath = await writeFlatGeobuf(fileName, state.features);
  const manifestEntry = manifest.municipalities[state.municipalityCode];

  manifestEntry.files.push({ file: fileName, features: featureCount });
  manifestEntry.features += featureCount;
  console.log(`Wrote ${path.relative(root, outputPath)} (${featureCount} features)`);

  state.partNumber += 1;
  state.features = [];
  return 1;
}

async function flushAllMunicipalityParts(municipalityStates, manifest) {
  let fileCount = 0;

  for (const state of [...municipalityStates.values()].sort((left, right) => left.municipalityCode.localeCompare(right.municipalityCode))) {
    fileCount += await flushMunicipalityPart(state, manifest);
  }

  return fileCount;
}

async function processZipFile(zipPath, totals, manifest) {
  const zipBuffer = await readFile(zipPath);
  const csvEntries = extractCsvEntriesFromZip(zipBuffer, zipPath);
  const municipalityStates = new Map();
  let fileCount = 0;

  for (const csvEntry of csvEntries) {
    const lineIterator = decodeCsvLines(streamZipEntryData(zipBuffer, csvEntry));
    let headerLine = '';

    while (true) {
      const next = await lineIterator.next();

      if (next.done) {
        break;
      }

      const line = next.value;

      if (line.trim().length > 0) {
        headerLine = line;
        break;
      }
    }

    if (!headerLine) {
      console.log(`Skipping empty CNEFE CSV: ${csvEntry.name}`);
      continue;
    }

    const delimiter = detectDelimiter(headerLine);
    const headers = parseDelimitedLine(headerLine, delimiter);
    const indexes = buildColumnIndexes(headers, csvEntry.name);

    for await (const line of lineIterator) {
      if (line.trim().length === 0) {
        continue;
      }

      totals.rows += 1;
      const row = parseDelimitedLine(line, delimiter);
      const feature = rowToFeature(row, indexes);

      if (!feature) {
        totals.skippedInvalidCoordinates += 1;
        continue;
      }

      const municipalityCode = feature.properties.COD_MUNICIPIO;

      if (!municipalityCode) {
        totals.skippedMissingMunicipality += 1;
        continue;
      }

      const state = await municipalityState(municipalityStates, manifest, municipalityCode);
      state.features.push(feature);
      totals.features += 1;

      if (state.features.length >= outputBatchFeatureLimit) {
        fileCount += await flushMunicipalityPart(state, manifest);
      }
    }
  }

  fileCount += await flushAllMunicipalityParts(municipalityStates, manifest);
  return { fileCount, municipalityCount: municipalityStates.size };
}

async function main() {
  const inputArgument = process.argv[2];

  if (inputArgument === '--help' || inputArgument === '-h') {
    console.log('Usage: npm run prepare:cnefe -- [data/CNEFE/14_RR.zip]');
    console.log('Without an argument, all ZIP files in data/CNEFE/ are processed.');
    console.log(`Set CNEFE_OUTPUT_BATCH_SIZE to override the default ${defaultOutputBatchFeatureLimit} features per FlatGeoBuf part.`);
    return;
  }

  const inputFiles = await discoverInputFiles(inputArgument);
  const totals = { rows: 0, features: 0, skippedInvalidCoordinates: 0, skippedMissingMunicipality: 0 };
  let municipalityFileCount = 0;

  if (!inputArgument) {
    await rm(outputDir, { recursive: true, force: true });
  }

  await mkdir(outputDir, { recursive: true });
  const manifest = inputArgument ? await readExistingManifest() : createManifest();

  console.log(`CNEFE output batch size: ${outputBatchFeatureLimit} features per part`);

  for (const zipPath of inputFiles) {
    const relativeZipPath = path.relative(root, zipPath);
    console.log(`Reading CNEFE source: ${relativeZipPath}`);

    console.log(`Writing CNEFE outputs for: ${relativeZipPath}`);
    const result = await processZipFile(zipPath, totals, manifest);
    municipalityFileCount += result.fileCount;
    console.log(`Finished CNEFE source: ${relativeZipPath} (${result.fileCount} FlatGeoBuf part files, ${result.municipalityCount} municipalities)`);
  }

  const manifestPath = await writeManifest(manifest);
  console.log(`Wrote ${path.relative(root, manifestPath)}`);

  console.log(`CNEFE rows read: ${totals.rows}`);
  console.log(`CNEFE point features written: ${totals.features}`);
  console.log(`Rows skipped with invalid coordinates: ${totals.skippedInvalidCoordinates}`);
  console.log(`Rows skipped without COD_MUNICIPIO: ${totals.skippedMissingMunicipality}`);
  console.log(`Municipality FlatGeoBuf part files written: ${municipalityFileCount}`);
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exitCode = 1;
});
