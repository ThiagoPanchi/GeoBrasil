## Context

See `proposal.md` for motivation. The current implementation already has a Leaflet map, hierarchical state in `MapPage`, API helpers for UFs, microregions, municipalities, and sectors, synchronized rows for charts/table, dynamic choropleth breaks from backend metadata, and a column selector in the data table. The archived MVP tasks show remaining work concentrated in frontend behavior validation and edge-case synchronization rather than new database or backend architecture.

Observed implementation details that shape this plan:
- `MapView` reloads a single active GeoJSON layer for the current `TerritorialLayer` and fits to backend bbox metadata.
- `LayerControl` exposes UF, layer, microregion, municipality, and back controls.
- `DashboardCharts`, `DataTable`, and `SidePanel` consume the `rows`, `breaks`, `selectedFeature`, and selected indicator state held by `MapPage`.
- Backend endpoints already reject broad municipality/sector requests and return indicator-styled GeoJSON for the selected context.

## Goals / Non-Goals

**Goals:**
- Finish the remaining frontend navigation, selection, drill-down, back-navigation, and synchronization tasks from the archived MVP change.
- Preserve the existing API shape and component structure where possible.
- Make manual verification explicit for the two remaining integrated journeys.
- Keep fixes incremental and focused on observable behavior.

**Non-Goals:**
- Rework the data import pipeline or PostGIS schema.
- Replace Leaflet or redesign the entire UI layout.
- Add automated end-to-end testing infrastructure unless a small existing test hook is already present.
- Expand the MVP indicator catalog beyond the data already exposed by the backend.

## Decisions

### Keep `MapPage` as the shared state coordinator

`MapPage` already owns selected UF, microregion, municipality, sector, current layer, rows, breaks, and selected feature. Implementation should continue to centralize cross-component transitions there instead of distributing state resets across child components.

Alternative considered: move navigation state into a dedicated context/store. That would add abstraction without clear benefit for the remaining MVP tasks.

### Treat backend GeoJSON as the source of truth for displayed rows

The current map requests return exactly the records displayed for the current layer and context. Charts and tables should continue deriving from that same GeoJSON through `onRowsChange`, avoiding separate all-record queries.

Alternative considered: call separate indicator-value endpoints for dashboard rows. That risks desynchronizing the table/charts from map filtering and reintroducing broader queries.

### Verify behavior with targeted manual flows plus build checks

The archived tasks explicitly require visual/manual verification for map interactions. The apply work should pair `npm run build` with a manual checklist for UF-to-sector and UF-to-microregion journeys.

Alternative considered: only mark tasks complete after compile. That would not satisfy tasks that explicitly require browser validation.

## Risks / Trade-offs

- Manual verification can miss regressions across browsers -> Use a deterministic checklist that names each transition, selected state, map layer, rows, charts, legend, and status expectation.
- Large census-sector layers can be slow in the browser -> Keep one active Leaflet GeoJSON layer, clear stale layers before loading, and avoid adding extra duplicated geometry requests.
- Existing tasks may already be partially implemented -> During apply, verify before editing and mark tasks complete only when behavior is confirmed, avoiding unnecessary code churn.
- Indicator changes currently reload geometry for styling -> Preserve behavior unless performance becomes a blocker; the archived task scope prioritizes correctness and synchronization.

## Migration Plan

No data migration is required. Implementation should be deployable as frontend-only changes, with backend fixes only if verification exposes a compatible API defect. Rollback is the normal source-control rollback of frontend files changed during apply.
