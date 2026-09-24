## Context

See `proposal.md` for motivation. The current map is rendered in `src/components/MapView.tsx` with Leaflet, a territorial `LayerGroup`, a top-right `.map-tools` overlay, and a bottom-right `.map-legend`. Data loading is centralized in `src/api.ts` and uses static FlatGeoBuf assets referenced by `public/geodata/manifest.json`. Aggregated CNEFE files exist under `public/geodata/cnefe-aggregated/<UF>/`, but a static browser cannot discover files by listing directories.

## Goals / Non-Goals

**Goals:**
- Add an optional CNEFE overlay without changing the territorial choropleth workflow.
- Load CNEFE points only for the selected census sector after a user click.
- Keep all runtime data access static and compatible with GitHub Pages.
- Expose creator contact and IBGE Censo 2022 source information in the UI.

**Non-Goals:**
- Add clustering, search, editing, or export for CNEFE points.
- Recompute or regenerate raw CNEFE conversion semantics.
- Change sector double-click drill-down behavior or existing report mode semantics.
- Require a backend, database, or directory listing support from the static host.

## Decisions

- Add a CNEFE overlay state to the map component and keep it independent from the report mode.
  - Rationale: CNEFE display is a layer concern, while the existing report button changes click behavior for popups.
  - Alternative considered: overload the report button. That would make the UI ambiguous and conflict with the requested separate selector button.

- Load CNEFE only after a sector click while the overlay is active.
  - Rationale: this matches the requested behavior and avoids loading all municipality CNEFE points immediately on sector view.
  - Alternative considered: load points as soon as a municipality sector layer opens. That would be simpler but can add heavy requests before the user asks for CNEFE.

- Use a dedicated Leaflet layer group for CNEFE points.
  - Rationale: the existing territorial layer group can be cleared/rebuilt by choropleth changes. A separate group makes CNEFE clearing explicit when the overlay is disabled or the territorial context changes.
  - Alternative considered: merge points into the territorial GeoJSON layer. That would complicate territorial styling and selection because points and polygons have different event behavior.

- Add or update an aggregated CNEFE manifest for static asset discovery.
  - Target shape: a manifest that maps municipality code to one or more aggregated FlatGeoBuf asset paths, such as `4200051 -> [geodata/cnefe-aggregated/SC/4200051-part-0001.fgb]`.
  - Rationale: GitHub Pages cannot list `public/geodata/cnefe-aggregated/<UF>/`, and some municipalities have multiple part files.
  - Alternative considered: derive file names optimistically from municipality codes. That fails for multipart municipalities and missing assets.

- Filter CNEFE records in the browser by the first 15 digits of `COD_SETOR` after loading the selected municipality's aggregated files.
  - Rationale: existing CNEFE partitioning is municipality/part based, and the CNEFE aggregated assets can include suffixes such as `P` while the census sector layer uses the 15-digit sector code.
  - Alternative considered: generate sector-partitioned CNEFE assets. That would reduce client filtering but create many more files and broaden this change.

- Use deterministic style maps for `ESPECIE_ENDERECO` and discrete size classes for `QUANTIDADE`.
  - Rationale: users need stable icon meanings across sectors. Use 5 classes unless implementation finds the visual spacing too dense, in which case 4 classes still satisfies the spec.
  - Alternative considered: continuous scaling. Discrete classes are easier to explain in the legend.

- Render contact/source information as a lower-left app overlay or panel area that is visually subordinate to primary controls.
  - Rationale: the request specifies bottom-left placement and the existing legend already occupies bottom-right.
  - Alternative considered: putting the information in the sidebar. That would be simpler, but it would not satisfy the requested map-corner placement.

## Risks / Trade-offs

- Large CNEFE municipality assets can make a sector click slow -> load only after explicit sector click, show status messages, and clear stale requests when context changes.
- National manifests may reference non-SC CNEFE assets that are not committed under the current SC-only versioning rules -> show clear missing-asset feedback and preserve the choropleth layer.
- Multiple CNEFE points may share identical coordinates -> use visible marker styling with opacity/border and `QUANTIDADE` sizing so aggregated duplicates are still understandable.
- The CNEFE species values may be stored with or without accents depending on the preparation script -> normalize or map known variants to the user-facing legend labels.
- Exact `COD_SETOR` string equality can hide valid CNEFE points when aggregated CNEFE includes suffixes such as `P` -> compare only the first 15 digits of `COD_SETOR` to the selected sector code.

## Migration Plan

1. Extend aggregated CNEFE output/discovery with a static manifest for municipality-to-file lookup.
2. Add CNEFE API helpers and types for loading aggregated files and filtering by the first 15 digits of `COD_SETOR`.
3. Add map overlay state, CNEFE layer rendering, loading/clearing behavior, and status feedback.
4. Add CNEFE button styling and legend sections for species and quantity size classes.
5. Add lower-left creator/contact/source information styling and responsive behavior.
6. Verify with an SC municipality/sector that has CNEFE aggregated files and with a sector or municipality that lacks them.
