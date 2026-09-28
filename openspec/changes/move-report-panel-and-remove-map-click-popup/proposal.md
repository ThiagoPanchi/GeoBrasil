## Why

The current map click behavior opens Leaflet popups that interfere with double-click drill-down and make the indicator report difficult to read when it is anchored to a geometry coordinate. The report should behave like a stable map-side panel, while normal map interaction should remain unobstructed.

## What Changes

- Remove the basic map popup that opens on normal geometry clicks.
- Keep normal geometry clicks available for selection, dashboard synchronization, and CNEFE sector loading where applicable.
- Replace the information-mode Leaflet popup report with a fixed report panel on the left side of the map.
- Adjust the report panel width so the report fits within the visible window without horizontal overflow.
- Move the contact/source card out of the map overlay and into the bottom of the sidebar, fixed there as sidebar footer content.
- Keep the report content and demographic chart behavior from the current indicator report.
- Ensure the report panel stays within the visible map area and uses internal scrolling when content is long.
- Clear or hide the report panel when information mode is disabled or when the displayed territorial context changes.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `dashboard-synchronization`: map information mode report behavior changes from a coordinate-anchored popup to a fixed map-side panel, while selection and double-click interactions remain unobstructed.
- `thematic-map`: map layout changes to include a left-side report panel that fits the viewport and to relocate contact/source information to the sidebar footer.

## Impact

- Affected UI code: `src/components/MapView.tsx`, the sidebar/container component that owns contact/source placement, `src/components/MunicipalityPopup.tsx` if report-specific semantics need small adjustments, and `src/styles.css`.
- No data model, generated geodata, backend, or dependency changes are expected.
- Existing territorial navigation, CNEFE overlay behavior, indicator formatting, and report content should remain intact.
