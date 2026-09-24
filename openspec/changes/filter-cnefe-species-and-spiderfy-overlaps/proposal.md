## Why

The CNEFE overlay can display many address points inside a selected census sector, but dense sectors are hard to inspect when multiple records share the same coordinate. Users also need a quick way to focus the overlay on specific `ESPECIE_ENDERECO` categories instead of visually parsing every CNEFE point at once.

## What Changes

- Add a CNEFE overlay filter selector based on `ESPECIE_ENDERECO`.
- Allow users to show all CNEFE species or restrict displayed CNEFE points to one selected species category.
- Update CNEFE counts/status/legend behavior so they reflect the active species filter.
- Detect CNEFE points that share the same original coordinate in the selected sector.
- Spread overlapping points around their original coordinate so individual markers can be clicked.
- Draw a thin connector line from each displaced point back to the original coordinate, creating a web/spider visual for overlaps.
- Keep the original coordinate semantics available for interpretation; the spread position is visual only.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `thematic-map`: the CNEFE overlay must support `ESPECIE_ENDERECO` filtering and visual de-overlap with connector lines.
- `cnefe-address-geodata`: frontend CNEFE records must preserve enough original coordinate and species information to filter and render displaced overlapping points accurately.

## Impact

- Affected UI code: `src/components/MapView.tsx` and `src/styles.css`.
- Affected data typing/normalization: `src/types.ts` and possibly `src/api.ts` if original coordinate metadata needs to be normalized for rendering.
- No backend, database, generated data format change, or new runtime dependency is expected.
- Existing CNEFE toggle, sector-click loading, species icon styling, and quantity size classes remain in place.
