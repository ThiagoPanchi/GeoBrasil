## Context

See `proposal.md` for motivation. The current popup report builds demographic chart data from fixed sex and color/race groups, then filters charts out when `chart.total > 0` is false. Because generic row suppression currently depends on the charts that survived that filter, zero-total demographic groups are omitted from the chart area and their indicators fall back into the generic indicator rows.

## Goals / Non-Goals

**Goals:**
- Keep demographic indicators grouped as demographic chart cards in census sector reports even when all group values are zero.
- Preserve proportional pie chart behavior for positive totals.
- Make the zero state visually explicit enough that users understand the chart group exists but has no measured total.
- Keep the generic report row list focused on non-demographic indicators.

**Non-Goals:**
- Change indicator IDs, generated assets, aggregate calculations, or data preparation scripts.
- Change map click selection, sector loading, or popup positioning behavior.
- Introduce a charting dependency.
- Change non-sector report layout beyond preserving existing demographic chart behavior.

## Decisions

- Decouple demographic row suppression from positive chart totals.
  - Rationale: whether an indicator belongs to a demographic chart group is independent from whether that group has a positive total.
  - Alternative considered: keep filtering zero-total charts and separately hide zero demographic rows. That removes clutter but fails to communicate the zero-data demographic groups requested by the user.

- Build demographic chart cards for census sector reports from the known demographic groups regardless of total.
  - Rationale: census sectors are the report type where zero demographic group visibility matters, and the sector report already has dedicated demographic chart semantics.
  - Alternative considered: show zero chart cards for every layer. This could change broader behavior unexpectedly for UFs, microregions, or municipalities if aggregate demographic values are absent.

- Render zero-total chart cards with the existing category legend and all zero values, plus a neutral empty pie visual.
  - Rationale: users can see both that the group exists and that each category contributes zero.
  - Alternative considered: display only a text message. That is simpler but less consistent with the existing report layout.

- Keep selected demographic indicator feedback when the selected indicator belongs to a zero-total chart group.
  - Rationale: the current report already identifies selected indicators represented in charts; zero totals should not make that context disappear.
  - Alternative considered: suppress selection feedback for zero totals. That creates an inconsistent selected-indicator experience.

## Risks / Trade-offs

- Zero chart cards may look like missing data rather than true zero -> include an explicit zero-total state and preserve zero values in the legend.
- Showing both sex and color/race zero chart cards can lengthen reports -> reuse the existing scrollable popup report area and responsive chart grid.
- Some records may lack demographic fields entirely rather than having measured zeros -> treat missing values as zero only for the configured sector demographic groups, matching current formatting behavior.

## Migration Plan

1. Adjust report chart derivation so census sector reports keep sex and color/race chart groups even when totals are zero.
2. Suppress demographic indicator rows based on membership in demographic groups rather than only on positive chart totals.
3. Add a zero-total visual state to demographic chart cards while preserving proportional pies for positive totals.
4. Verify the change with a production build and OpenSpec validation.
