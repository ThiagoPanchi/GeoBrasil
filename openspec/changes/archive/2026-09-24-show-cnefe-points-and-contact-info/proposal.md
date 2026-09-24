## Why

The map can already drill down to census sectors, but users cannot inspect the CNEFE address points that explain what exists inside a selected sector. Adding a sector-scoped CNEFE overlay and visible attribution/contact information improves exploratory value and makes the public portfolio page more complete.

## What Changes

- Add a map tool button next to the existing color-scale editor and report buttons to enable or disable CNEFE point display.
- Display CNEFE points only after the user clicks a census sector, and only for CNEFE records whose `COD_SETOR` matches that selected sector.
- Style CNEFE point icons by `ESPECIE_ENDERECO`, with a distinct visual category for each configured address species.
- Scale CNEFE point icons by `QUANTIDADE` using 4 or 5 discrete size classes so larger aggregated counts appear larger.
- Extend the map legend with CNEFE category and size explanations when the CNEFE overlay is active.
- Add a lower-left application information block with creator/contact/source details: Thiago Panchiniak, LinkedIn, email, and Censo 2022 IBGE sources.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `thematic-map`: the map must support a user-enabled CNEFE point overlay with categorical icons, size classes, and legend entries.
- `territorial-navigation`: CNEFE points must be loaded and displayed only in response to selecting a census sector in the current sector view.
- `cnefe-address-geodata`: aggregated CNEFE assets must be consumable by the frontend for municipality/sector-scoped point filtering using `COD_SETOR`, `ESPECIE_ENDERECO`, and `QUANTIDADE`.
- `static-webgis-deployment`: the published static application must expose creator contact details and identify IBGE Censo 2022 as the data source.

## Impact

- Affected UI code: `src/components/MapView.tsx`, `src/pages/MapPage.tsx`, and `src/styles.css`.
- Affected data-loading code: `src/api.ts` and `src/types.ts` for CNEFE asset discovery, FlatGeoBuf loading, and typed point records.
- Affected static data contract: CNEFE aggregated assets under `public/geodata/cnefe-aggregated/<UF>/` should be discoverable for a selected municipality or sector context.
- No backend service, database, or new runtime dependency is expected.
- The existing choropleth sector map remains the base layer; CNEFE points are an optional overlay.
