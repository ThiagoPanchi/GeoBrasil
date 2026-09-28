## 1. Map Click Behavior

- [x] 1.1 Remove normal geometry-click Leaflet popup opening and verify a single click still selects/highlights the geometry and updates dashboard state.
- [x] 1.2 Verify double-click drill-down no longer shows a basic map popup before navigating to the next territorial level.
- [x] 1.3 Preserve CNEFE sector-click loading when CNEFE mode is active and verify removing normal popups does not stop CNEFE points from loading.

## 2. Report Panel State

- [x] 2.1 Add React state for the active map report record and verify information-mode clicks populate the state with the clicked geometry details.
- [x] 2.2 Render the existing indicator report content from the active report state and verify record name, territorial context, indicator rows, sector context, and demographic charts still appear.
- [x] 2.3 Clear the active report when information mode is disabled and verify later normal clicks do not reopen the report panel.
- [x] 2.4 Clear the active report when UF, microregion, municipality, territorial layer, selected indicator dataset, or displayed records change and verify stale report content is not shown.

## 3. Report Panel Layout

- [x] 3.1 Add a fixed map-side report panel on the left side above the contact/source card and verify it remains inside the desktop map viewport.
- [x] 3.2 Add internal scrolling and constrained height for long report content and verify the report can be inspected without moving the map viewport.
- [x] 3.3 Adjust responsive styles and verify the report panel remains readable on narrow screens while contact/source information remains reachable.
- [x] 3.4 Verify the report panel does not cover the top-right map tools or bottom-right legend.

## 4. Verification

- [x] 4.1 Run `npm run build` and verify the production frontend build succeeds.
- [x] 4.2 Run `openspec validate move-report-panel-and-remove-map-click-popup --strict` and verify the change remains valid after implementation.

## 5. Revised Layout Follow-up

- [x] 5.1 Adjust the report panel width constraints and verify the complete report fits inside the visible window without horizontal page or map scrolling.
- [x] 5.2 Move contact/source information out of the map overlay into a fixed footer area at the bottom of the sidebar and verify it remains visible there during map use.
- [x] 5.3 Verify the moved contact/source footer does not obscure sidebar controls and that the sidebar remains usable when its content is taller than the viewport.
- [x] 5.4 Run `npm run build` and verify the production frontend build succeeds after the revised layout changes.
- [x] 5.5 Run `openspec validate move-report-panel-and-remove-map-click-popup --strict` and verify the revised change remains valid.
