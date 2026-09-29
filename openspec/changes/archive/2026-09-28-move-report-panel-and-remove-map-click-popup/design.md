## Context

See `proposal.md` for motivation. `src/components/MapView.tsx` currently routes geometry clicks through `handleFeatureClick`. Outside information mode it selects the record and calls `openFeaturePopup`; inside information mode it calls the same helper with `report=true`. `openFeaturePopup` renders `MunicipalityPopup` into a Leaflet popup anchored to the clicked geometry bounds center. The contact/source card was previously planned as a left-bottom map overlay, but the revised layout moves it to the sidebar footer so the map overlay area can be reserved for map tools, legend, and the report panel.

## Goals / Non-Goals

**Goals:**
- Remove Leaflet popup creation from normal map geometry clicks.
- Keep normal click selection and double-click drill-down behavior functional.
- Render the full indicator report in a React-controlled panel within the map layout.
- Position the panel on the left side of the map with width constrained to the visible window.
- Move contact/source information to a fixed footer area at the bottom of the sidebar.
- Reuse the existing `MunicipalityPopup` report content as much as possible.
- Clear stale report content when information mode or territorial context changes.

**Non-Goals:**
- Redesign the indicator report content, metric grouping, or demographic chart logic.
- Change CNEFE marker popups.
- Add routing, persistence, or export for reports.
- Change data loading, indicator calculation, or geodata assets.

## Decisions

- Replace report Leaflet popups with React state in `MapView`.
  - Rationale: a fixed side panel is layout UI, not map geometry content, and React state is simpler to clear on mode/context changes.
  - Alternative considered: keep using Leaflet popup with custom offsets. That would still anchor the report to map coordinates and can leave the popup outside the visible area.

- Remove basic geometry popups from normal map clicks.
  - Rationale: the selected feature is already communicated through shared dashboard state, and the popup interferes with double-click drill-down.
  - Alternative considered: delay popup opening to distinguish single click from double click. That adds timing complexity and still leaves an intrusive popup.

- Keep the existing `MunicipalityPopup` component for report body rendering.
  - Rationale: the component already contains the report semantics, metric sections, and demographic charts; moving the container avoids duplicating report markup.
  - Alternative considered: create a new report component. That risks divergence unless there is a broader redesign.

- Store the active report record independently from selected-feature state.
  - Rationale: information mode clicks should show report details without changing normal selection behavior unless explicitly desired by existing behavior.
  - Alternative considered: reuse selected feature for reports. That couples report visibility to selection and makes clearing report state less explicit.

- Clear report state when information mode is disabled or territorial context changes.
  - Rationale: displayed records can change under the report, so stale report content must not remain visible.
  - Alternative considered: leave the last report visible until replaced. That conflicts with the requirement to avoid stale information.

- Keep the report as a map-side panel but constrain its width against the viewport.
  - Rationale: the report must stay visually tied to map information mode while fitting entirely inside the window.
  - Alternative considered: move the report into the sidebar. That would reduce map overlay complexity but weakens the connection between report mode and the clicked map geometry.

- Move contact/source information to the sidebar footer.
  - Rationale: contact/source content is global application metadata, not map geometry content, and moving it out of the map frees the lower-left map area for the report panel.
  - Alternative considered: keep contact/source as a map overlay below the report. That was rejected by the revised requirement to fix it at the bottom of the sidebar.

## Risks / Trade-offs

- Report panel can reduce visible map area on small screens -> constrain width/height, account for viewport width, and use internal scrolling with responsive stacking.
- Sidebar footer can collide with long sidebar controls -> use sidebar layout that reserves footer space or allows the control area to scroll independently.
- Removing basic popups may remove quick inline feedback some users used -> preserve selected-feature dashboard feedback and map highlight behavior.
- Report state can become stale after async layer changes -> clear it in the same context-change effect that clears layer-specific overlays.
- Double-click may still emit a preceding single click from Leaflet -> with normal click popups removed, the remaining single-click selection should no longer obstruct drill-down.

## Migration Plan

1. Add report panel state to `MapView` for the clicked feature details.
2. Change normal geometry clicks to select/highlight without opening a Leaflet popup.
3. Change information-mode geometry clicks to set report panel state instead of calling `L.popup()`.
4. Keep or simplify popup helper usage only where still needed by non-report behavior, avoiding coordinate-anchored report rendering.
5. Add map-side report panel markup that renders `MunicipalityPopup` with `report` enabled.
6. Add styles for left-side report positioning, viewport-constrained width, and responsive containment.
7. Move contact/source markup from the map overlay to a fixed sidebar footer area.
8. Clear report panel state when information mode is disabled or the territorial context changes.
