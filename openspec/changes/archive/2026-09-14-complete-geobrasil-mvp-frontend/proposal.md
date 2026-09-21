## Why

The archived MVP change left several frontend and integration tasks open even though the base backend, data loading, and initial dashboard are in place. This change finishes the remaining user-facing validation and hardens the territorial drill-down experience so the implemented app satisfies the synced MVP specs end-to-end.

## What Changes

- Complete and verify the UF -> municipality -> census sector navigation flow, including click selection, double-click drill-down, viewport fitting, and isolation of records to the selected hierarchy.
- Complete and verify the UF -> microregion -> municipality flow, including selector-driven and map-driven microregion selection.
- Ensure thematic styling, legend, charts, data table, selected-context panel, and status messages stay synchronized with the current layer, selected territory, and selected indicator.
- Add any missing frontend refinements needed for the existing MVP behavior, without changing backend API contracts unless a discovered defect requires a minimal compatible fix.
- Capture manual integrated verification for the two remaining MVP journeys.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `territorial-navigation`: Clarify that UF map double-click is a supported drill-down entry point and that selector-driven microregion navigation must keep the territorial hierarchy isolated.
- `dashboard-synchronization`: Clarify that dashboard rows, charts, table columns, selected feature, loading feedback, and context labels must update consistently across UF, microregion, municipality, and census-sector layers.
- `thematic-map`: Clarify that choropleth classes, legend, selected geometry highlighting, and viewport fitting must remain correct after indicator changes and every drill-down/back transition.

## Impact

- Frontend components under `frontend/src/pages` and `frontend/src/components`, especially `MapPage`, `MapView`, `LayerControl`, `DashboardCharts`, `DataTable`, and `SidePanel`.
- Frontend API helpers in `frontend/src/api.ts` only if needed to preserve hierarchical filtering and indicator-aware layer requests.
- Verification uses `npm run build` and manual browser flows against the existing FastAPI/PostGIS backend.
