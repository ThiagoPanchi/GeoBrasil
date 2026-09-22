## Context

See `proposal.md` for motivation. `MapView` currently owns the Leaflet map, rendered GeoJSON layer events, selected-feature popup mounting, color scale state callbacks, and the color scale editor open/closed state. The palette editor is already an absolutely positioned overlay with a toggle button and option list, but the wrapper keeps the card styling and width even while closed. `MunicipalityPopup` currently renders a compact popup with record name, UF, and only the selected indicator value.

## Goals / Non-Goals

**Goals:**

- Make the collapsed palette control visually occupy only a circular map overlay button.
- Keep the expanded palette selector near the button and sized to the available color scale options.
- Add an information-mode map overlay button whose active state is visible to the user.
- Show a popup report with every catalog indicator value for the clicked displayed record when information mode is active.
- Preserve normal map click selection and double-click drill-down behavior when information mode is inactive.

**Non-Goals:**

- Add new indicator data, change data generation, or alter static asset formats.
- Add backend lookups or reverse geocoding for arbitrary coordinates.
- Replace the legend, chart/table panel, or territorial navigation model.
- Change how color classes are calculated.

## Decisions

- Keep palette and information controls inside `MapView` overlay state.
  - Rationale: `MapView` already owns map interaction state, popup opening, and palette open/close behavior, so this avoids new global state or prop plumbing.
  - Alternative considered: move control state to `MapPage`. Rejected because no other component needs to coordinate with palette open state or information mode beyond map click behavior.

- Treat "ponto" as the displayed territorial feature clicked on the map.
  - Rationale: current data is polygon-based and all indicator values are attached to displayed features, not arbitrary coordinates.
  - Alternative considered: report nearest feature for any map coordinate. Rejected because it would introduce ambiguous hit-testing behavior and is not supported by existing data structures.

- Use a single popup component path with a report mode.
  - Rationale: the existing popup mounting mechanism already creates a React root inside a Leaflet popup. Extending it to render all indicators minimizes new Leaflet integration code.
  - Alternative considered: create a separate report panel outside the map. Rejected because the requested behavior is a map click popup.

- Do not let information mode replace normal selection permanently.
  - Rationale: selection, chart/table synchronization, and drill-down are existing core interactions. Information mode should be explicit and reversible.
  - Alternative considered: always show all indicators on any click. Rejected because it would make normal selection popups heavier and remove the user's control over inspection mode.

## Risks / Trade-offs

- Small overlay buttons may be hard to discover -> Mitigate with clear `title`, `aria-label`, active styling, and an icon/label pattern consistent with existing controls.
- Popup report may be tall when the catalog grows -> Mitigate with popup content max-height and internal scrolling.
- Information mode could confuse normal click behavior -> Mitigate by showing active state and ensuring the button toggles back to normal mode.
- Expanded palette may overlap the new info button or legend on mobile -> Mitigate by grouping top-right map tools with spacing and responsive wrapping/stacking styles.

## Migration Plan

1. Update `MapView` overlay markup so the palette wrapper changes style between collapsed button-only and expanded option panel states.
2. Add an information mode toggle button in the same map overlay control area.
3. Adjust feature click handling so normal clicks preserve current selection behavior and information-mode clicks open a full indicator report popup.
4. Extend popup rendering to list all catalog indicators with labels, units, and values while still highlighting the selected indicator.
5. Update CSS for compact buttons, expanded palette sizing, active information mode, and scrollable report content on desktop and mobile.
6. Run the frontend build and OpenSpec validation.
