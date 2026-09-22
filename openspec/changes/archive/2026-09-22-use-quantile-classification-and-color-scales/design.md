## Context

See `proposal.md` for motivation. Current choropleth styling is calculated in `src/api.ts`: `styleFeatureCollection` normalizes displayed features, `buildBreaks` creates five equal-width numeric intervals from min/max values, and `styleFeature` assigns each feature a `fillColor`. `MapView` renders a bottom-right legend from the returned breaks. Color choice is currently a fixed blue ramp and is not user-configurable.

## Goals / Non-Goals

**Goals:**

- Replace equal-width class breaks with quantile class breaks for the currently displayed records.
- Keep class calculation browser-only and based on the same loaded static records already used by the map.
- Add a top-right map overlay control for choosing the color scale.
- Support blue, red, green, and semaforica scales.
- Keep legend ranges and geometry colors synchronized with the selected scale and quantile breaks.

**Non-Goals:**

- Add server-side classification or precomputed class metadata.
- Add a user-facing classification-method selector beyond the new quantile default.
- Persist color scale preferences across reloads.
- Change indicator values, static geodata generation, chart/table records, or territorial navigation behavior.

## Decisions

- Use quantiles as the only default classification method for this change.
  - Rationale: quantiles directly address outlier-dominated indicators such as municipality population in Sao Paulo by balancing record counts across classes.
  - Alternative considered: add a method selector for equal intervals, quantiles, and log scale. Rejected for this change because the user asked for quantiles and color scales, and method selection would add extra UI/acceptance scope.

- Keep five classes when five distinct ranges can be represented, and collapse duplicate ranges when repeated values prevent distinct quantile breaks.
  - Rationale: the current UI and legend already use a five-color ramp, but datasets with many repeated values or small counts can produce duplicate quantile thresholds.
  - Alternative considered: always force five classes by using inclusive duplicate thresholds. Rejected because duplicate legend intervals are confusing and can make color assignment ambiguous.

- Define color scales as fixed client-side ramps with the same number of colors.
  - Rationale: palettes are presentation state and do not require backend or asset changes.
  - Alternative considered: allow arbitrary custom colors. Rejected as unnecessary complexity for the requested red, green, and semaforica scales.

- Hold the selected color scale in page-level map state and pass it into map styling/loading.
  - Rationale: the selected scale affects feature styling and legend output and needs to trigger recalculation alongside indicator and territory changes.
  - Alternative considered: keep palette state entirely inside `MapView`. This is possible, but page-level state keeps the selected scale explicit and easier to pass through asset styling calls.

- Place the edit button and palette choices inside the map overlay area at the top-right.
  - Rationale: color scale editing affects the map's visual encoding and belongs with the map, while the existing legend remains bottom-right.
  - Alternative considered: put controls in the sidebar. Rejected because the user requested the top-right corner and the sidebar already holds navigation/indicator controls.

## Risks / Trade-offs

- Quantile class ranges can have uneven numeric widths -> Mitigate by showing actual min/max ranges in the legend.
- Many repeated indicator values can reduce the number of visible classes -> Mitigate by collapsing duplicate ranges and ensuring all finite values still map to a valid color.
- Semaforica colors can imply good/bad semantics that may not fit every indicator -> Mitigate by labeling it only as a color scale and not changing data interpretation.
- Recalculating styles after color-scale changes may reload or restyle more data than necessary -> Mitigate by keeping the first implementation simple and optimizing only if measured.
- A top-right overlay can compete with Leaflet controls -> Mitigate with compact placement, high z-index, and responsive wrapping/collapse.

## Migration Plan

1. Replace equal-width break calculation with quantile break calculation over finite displayed indicator values.
2. Add named color scale definitions for blue, red, green, and semaforica ramps.
3. Pass the selected color scale into styling so breaks and feature `fillColor` use the active ramp.
4. Add map overlay UI for opening palette editing and selecting the scale.
5. Keep legend rendering driven by current breaks so it reflects both quantile ranges and selected colors.
6. Verify representative contexts: Sao Paulo municipalities with population, UFs, microregions, and sectors.
7. Run frontend build and OpenSpec validation.
