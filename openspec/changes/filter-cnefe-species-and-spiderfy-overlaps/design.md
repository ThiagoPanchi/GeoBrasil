## Context

See `proposal.md` for motivation. The current CNEFE overlay is implemented in `src/components/MapView.tsx` as a Leaflet layer group that loads sector-filtered CNEFE points on census-sector click. Styling already maps `ESPECIE_ENDERECO` to marker categories and `QUANTIDADE` to marker size classes. The loaded CNEFE records are point geometries with original coordinates, and repeated coordinates currently render markers directly on top of one another.

## Goals / Non-Goals

**Goals:**
- Add a CNEFE filter selector for `ESPECIE_ENDERECO`.
- Re-render the active sector's CNEFE overlay when the species filter changes.
- Spread only currently displayed overlapping CNEFE points around their original coordinate.
- Draw thin connector lines from displaced points back to their original coordinate.
- Keep marker popups and category/quantity styling usable after displacement.

**Non-Goals:**
- Add backend-side filtering or new generated data files.
- Add clustering, heatmaps, editing, or search.
- Change the meaning of original CNEFE coordinates or mutate source geometries.
- Add filters for `INDICADOR_ESTABELECIMENTO` in this change.

## Decisions

- Use `ESPECIE_ENDERECO` as the only new filter field.
  - Rationale: the user clarified that the selector should filter by the same species categories already used for CNEFE visual styling.
  - Alternative considered: `INDICADOR_ESTABELECIMENTO`. That was rejected by user clarification.

- Store the loaded sector CNEFE points separately from the rendered/filtered layer.
  - Rationale: changing the species filter should not refetch assets or require another sector click when points for the active sector are already loaded.
  - Alternative considered: refetch on every filter change. That is simpler but unnecessary and makes the UI slower.

- Build selector options from the configured CNEFE species list and include an "all" option.
  - Rationale: a stable list keeps the selector aligned with the legend, even when the selected sector lacks some categories.
  - Alternative considered: derive options only from the current sector's points. That can reduce empty choices but makes the control jump between sectors.

- Normalize species labels the same way as icon styling.
  - Rationale: CNEFE generated labels may differ in accents/casing while still representing the same category.
  - Alternative considered: exact string comparison. That is brittle and inconsistent with current legend/icon normalization.

- Spiderfy overlaps in map pixel space and convert the displaced pixel positions back to `LatLng` for rendering.
  - Rationale: pixel offsets remain visually consistent across zoom levels and are straightforward with Leaflet projection APIs.
  - Alternative considered: add small coordinate deltas in longitude/latitude. That varies with latitude/zoom and can be hard to tune.

- Use deterministic circular placement around the original coordinate.
  - Rationale: given the same displayed point set, markers should appear in stable positions. Use each overlap group's index order after filtering to assign positions.
  - Alternative considered: random jitter. That reduces overlap but creates unstable visual output and makes QA difficult.

- Draw connectors as a separate visual layer in the CNEFE layer group.
  - Rationale: connector lines should clear/re-render with the CNEFE markers and remain visually subordinate.
  - Alternative considered: draw connectors with CSS pseudo-elements inside marker icons. That is difficult to anchor to the original map coordinate.

## Risks / Trade-offs

- Spiderfy can push points outside a very small selected sector boundary -> keep offsets small and only use displacement for exact repeated coordinates.
- Many points at one coordinate can still create a dense web -> use a deterministic radius that can grow slightly with group size while keeping thin, low-opacity connectors.
- Filtering can leave no visible CNEFE points for the selected sector -> show a clear status message and keep the sector selection intact.
- Re-rendering on filter changes can accidentally refit or disturb the map -> reuse the existing CNEFE layer group and avoid changing the territorial viewport when only the filter changes.

## Migration Plan

1. Add CNEFE species filter state and selector UI when the CNEFE overlay is active.
2. Preserve the loaded points for the active selected sector and apply the filter locally.
3. Add a deterministic overlap-layout helper that groups displayed points by original coordinate and returns marker display coordinates plus connector coordinates.
4. Render displaced CNEFE markers and thin connector lines in the CNEFE layer group.
5. Update status and legend text to reflect the active filter and empty filtered results.
6. Verify a repeated-coordinate sample shows separated markers and connectors, and that filter changes recalculate the displayed overlap layout.
