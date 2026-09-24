## Context

See `proposal.md` for motivation. The repository already has a Node.js geodata preparation script that reads ZIP/CSV-like inputs, parses localized numeric values, serializes GeoJSON feature collections with `flatgeobuf`, and writes static assets under `public/geodata/`. The CNEFE script was verified with `data/CNEFE/14_RR.zip`, but running against PA exposed Node's maximum string length limit during `TextDecoder.decode` of a complete CSV buffer. Large CNEFE sources therefore require incremental CSV decoding/parsing instead of materializing an entire CSV file as one string. Running the complete CNEFE directory exposed a second scaling issue after the string-length fix: features from completed UFs were retained until the end of the whole run, eventually exhausting the Node.js heap while reading MA. After per-UF flushing, another heap exhaustion still occurred near Node's heap limit, which means one active UF, one active municipality, the inflated CSV buffer, or FlatGeoBuf serialization can still exceed memory.

## Goals / Non-Goals

**Goals:**
- Add a standalone CNEFE preparation script that follows the existing Node.js static geodata tooling style.
- Process large CNEFE UF ZIPs without decoding an entire CSV into a single JavaScript string.
- Process complete CNEFE directories without retaining feature arrays from UFs that have already been written.
- Keep memory bounded within a large active UF by avoiding whole-entry inflation where possible and by flushing output in deterministic parts.
- Convert zipped CNEFE CSV rows into point features using `LONGITUDE` and `LATITUDE`.
- Partition output by `COD_MUNICIPIO` under `public/geodata/cnefe/`.
- Keep output properties minimal and deterministic for later sector joins by `COD_SETOR`.
- Provide an execution path that can target only `data/CNEFE/14_RR.zip` for lightweight validation.

**Non-Goals:**
- Add CNEFE points to the interactive map UI.
- Join CNEFE points to census sector polygons during this change.
- Modify existing census sector, municipality, microregion, UF, or indicator assets.
- Publish raw CNEFE ZIP/CSV files as browser assets.

## Decisions

- Implement CNEFE conversion as a separate script instead of extending `prepare-static-geodata.mjs`.
  - Rationale: CNEFE address points are a distinct dataset with different input columns, output partitioning, and verification needs.
  - Alternative considered: add CNEFE work to the existing geodata script. That would couple a large address-point pipeline to the core territorial/indicator asset build.

- Keep ZIP entry discovery in-repo, but parse CSV content incrementally rather than decoding each full CSV to one string.
  - Rationale: PA fails with `Cannot create a string longer than 0x1fffffe8 characters` when a complete CSV buffer is decoded at once.
  - Alternative considered: keep the current full-buffer decode path. That is simpler and works for RR, but it cannot handle large UF files.
  - Alternative considered: add a streaming ZIP/CSV dependency. That may reduce memory further, but the smallest corrective change is to chunk decoded CSV data from the existing decompressed entry buffer and preserve the current dependency set.

- Support processing either all `data/CNEFE/*.zip` files or a specific ZIP path argument.
  - Rationale: full CNEFE processing can be large, while `data/CNEFE/14_RR.zip` is the requested lightweight validation input.
  - Alternative considered: always process every UF. That makes local validation slower and harder when only one source file is present.

- Treat each UF ZIP as the memory boundary for complete runs.
  - Rationale: the script can write all municipality files for one UF, release that UF's feature arrays, and then continue to the next UF. This avoids heap growth proportional to the sum of every UF processed so far.
  - Alternative considered: keep one global `featuresByMunicipality` map and write after all ZIPs finish. That is simpler, but it caused `JavaScript heap out of memory` during a complete run after earlier large UFs had already accumulated in memory.

- Treat the UF boundary as necessary but not sufficient; introduce smaller batch boundaries inside a UF.
  - Rationale: the latest heap failure occurred even after the script stopped retaining completed UFs, so the active working set must be bounded below UF level. Batches should be limited by feature count or approximate serialized size and flushed before they can grow into multi-GB arrays/buffers.
  - Alternative considered: increase Node's heap with `--max-old-space-size`. That may postpone the failure but does not fix the unbounded data structure and can still fail on larger UFs or lower-memory machines.

- Prefer streaming ZIP/CSV handling over whole-entry inflation for the long-term correction.
  - Rationale: `inflateRawSync` still materializes the full CSV buffer before row parsing begins. Streaming decompression would reduce peak memory before feature conversion even starts.
  - Alternative considered: keep the current ZIP extraction and only shard feature output. That reduces `Feature[]`/serialization pressure but still leaves the inflated CSV buffer as a large memory spike.

- Allow one municipality to produce multiple deterministic FlatGeoBuf part files when it is too large for one in-memory collection.
  - Rationale: FlatGeoBuf serialization currently expects an in-memory `FeatureCollection`. Splitting large municipality outputs into numbered parts bounds serialization memory while preserving municipality-based discovery.
  - Alternative considered: require exactly one `.fgb` per municipality. That is convenient for consumers but can make very large municipalities impossible to generate within available memory.

- Python is an implementation option only if the pipeline remains streaming and bounded.
  - Rationale: Python can provide mature streaming ZIP/CSV tooling, but a Python rewrite that accumulates full CSVs or full feature lists would reproduce the same memory class of failure. The key correction is bounded streaming, not the language itself.
  - Alternative considered: rewrite in Python as the primary fix. That may be worthwhile if Node streaming ZIP/FlatGeoBuf output proves awkward, but it should not be treated as sufficient without batch flushing.

- Clean the CNEFE output directory only for complete-directory runs; for a single explicit ZIP, overwrite only municipality files produced from that ZIP.
  - Rationale: targeted validation or reruns should not delete outputs produced by previous UF runs. A complete run remains a full rebuild and may safely start from a clean output directory.
  - Alternative considered: never clean outputs automatically. That avoids data loss during partial runs but can leave stale municipality files after source ZIPs are removed from a complete rebuild.

- Use stable property names without spaces for decoded output fields.
  - Rationale: names such as `INDICADOR_ESTABELECIMENTO` and `TIPO_EDIFICACAO_DOMICILIOS` are easier to consume from JavaScript and geodata tooling than properties with spaces, while the property values still contain the requested human-readable labels.
  - Alternative considered: use the exact display labels as property names, such as `Indicador de Estabelecimento`. That is closer to the prose request but less consistent with the existing geodata properties.

- Normalize address parts by trimming blanks and joining non-empty pieces with a single separator.
  - Rationale: CNEFE rows may have missing title/type/number fields, and the output should not contain repeated separators.
  - Alternative considered: concatenate raw values with fixed spacing. That can create noisy addresses when optional fields are blank.

- Decode CSV chunks with `TextDecoder` streaming mode and carry partial lines between chunks.
  - Rationale: chunked decoding prevents a single over-large JavaScript string while preserving UTF-8 character boundaries across chunks.
  - Alternative considered: split the raw byte buffer by newline before decoding. That avoids a giant string but risks cutting multi-byte characters without extra boundary handling.

- Parse rows incrementally and append generated features to per-municipality groups scoped to the current UF.
  - Rationale: this preserves deterministic municipality outputs while allowing each UF's feature arrays to be written and released before the next ZIP is processed.
  - Alternative considered: first write intermediate per-municipality temp files. That may be needed later if feature arrays become too large, but the observed failure is at CSV string decode, not FlatGeoBuf serialization.

- For very large municipalities, write intermediate part files instead of waiting for all rows for that municipality.
  - Rationale: this bounds both the feature array and FlatGeoBuf serialization buffer for an active municipality.
  - Alternative considered: keep accumulating per municipality until the end of the UF. The latest heap failure suggests that this can still exceed the heap.

- Skip rows with invalid coordinates and report counts.
  - Rationale: FlatGeoBuf point output should not contain invalid geometries, and maintainers need feedback on skipped records.
  - Alternative considered: emit null geometry features. That complicates downstream spatial use and contradicts the point-asset goal.

## Risks / Trade-offs

- A single very large UF or municipality may still produce large feature arrays even after per-UF flushing -> add bounded batching and deterministic part files so one municipality does not require one giant in-memory `FeatureCollection`.
- Splitting municipality outputs into multiple files changes downstream consumption expectations -> document the part naming/manifest format before depending on these assets in the frontend.
- Node can still be used if the implementation streams and batches correctly; Python may help with streaming libraries, but language choice alone is not a memory fix.
- CSV encoding may differ from UTF-8 -> detect BOM and keep parsing helpers isolated so encoding handling can be adjusted if the sample reveals mojibake.
- Column names may differ in case or accents from the requested names -> resolve columns case-insensitively and fail clearly when required columns are absent.
- Chunked parsing can change edge cases around quoted multiline CSV fields -> keep quoted-field state across parsed records or explicitly verify the CNEFE files do not rely on multiline quoted fields.

## Migration Plan

1. Add the standalone CNEFE preparation script and optional package command.
2. Implement ZIP CSV extraction, chunked row parsing, coordinate conversion, property transformation, and municipality partitioning.
3. Scope feature accumulation to one UF at a time, write that UF's municipality outputs immediately, and release the UF map before the next ZIP.
4. Keep complete-directory runs clean by removing `public/geodata/cnefe/` once at the start, but keep targeted single-ZIP runs non-destructive to other UF outputs.
5. Add bounded batch flushing within each UF and allow large municipality outputs to be split into deterministic FlatGeoBuf part files.
6. Replace whole-entry ZIP inflation with streaming decompression/parsing if the active inflated CSV buffer remains a memory spike.
7. Run the script against `data/CNEFE/14_RR.zip` and inspect generated files under `public/geodata/cnefe/`.
8. Run the script against the PA ZIP that reproduced the string-length failure and verify it no longer throws `Cannot create a string longer than 0x1fffffe8 characters`.
9. Run against the UF that reproduced the post-flush heap failure and verify memory remains bounded or progresses past the previous failure point.
10. Run `npm run build` or an equivalent syntax/build verification and `openspec validate "convert-cnefe-csv-to-flatgeobuf" --strict`.
