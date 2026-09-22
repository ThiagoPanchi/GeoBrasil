## Context

See `proposal.md` for motivation. The current `MapView` renders a top-right `.map-scale-editor` with a text button labeled "Editar cores" and separate text buttons for each color scale. The bottom-right legend renders only the title "Legenda" and the value ranges; it receives `breaks` but does not currently render the active indicator name in the legend body.

## Goals / Non-Goals

**Goals:**

- Make the color editor entry point compact by using a pencil edit icon/emoji button.
- Replace individual palette buttons with one selector-style control.
- Show palette options vertically with a color-scale preview beside each option.
- Add the active indicator name to the legend between the "Legenda" title and the range rows.
- Preserve the existing color-scale choices, quantile breaks, map overlay placement, and legend placement.

**Non-Goals:**

- Change quantile classification logic or color ramp values.
- Add custom user-defined colors.
- Persist the selected color scale.
- Move color editing into the sidebar or change map navigation interactions.

## Decisions

- Use a compact icon/emoji button for opening the editor, with accessible labeling.
  - Rationale: the user asked for a pencil symbol and the map overlay should consume less visual space.
  - Alternative considered: keep text plus icon. Rejected because the requested behavior is specifically "somente um botao" with a pencil symbol.

- Implement the palette chooser as a single selector panel rather than multiple standalone text buttons.
  - Rationale: one selector groups the mutually exclusive color-scale choices and makes the active selection clearer.
  - Alternative considered: use a native `select`. Rejected because native options cannot reliably show multi-color previews across browsers.

- Render each scale option as one vertical row containing the scale name and a swatch preview made from that scale's colors.
  - Rationale: stacked rows match the user's request and previews make palette choice visual instead of text-only.
  - Alternative considered: horizontal chips. Rejected because the user asked for options one above another.

- Pass the active indicator display name to the legend rendering path.
  - Rationale: the legend needs to show the current indicator below the title, and `MapView` already receives the indicator catalog and selected indicator id.
  - Alternative considered: store indicator name in break metadata. Rejected because the current component already has enough information to derive it.

## Risks / Trade-offs

- A pencil emoji may render differently across operating systems -> Mitigate with an accessible `aria-label` and fallback text/title if needed.
- Custom selector rows require keyboard/focus styling -> Mitigate by keeping each row as a button-like selectable control.
- Palette previews can crowd the overlay on small screens -> Mitigate with compact swatches, fixed max width, and vertical layout.
- Long indicator names can overflow the legend -> Mitigate with wrapping and compact typography.

## Migration Plan

1. Replace the editor trigger text with a compact pencil icon/emoji button and accessible label.
2. Replace separate scale buttons with a single selector panel rendered as vertical option rows.
3. Add a reusable swatch preview for each color scale option.
4. Derive and render the active indicator name in the map legend below the "Legenda" title.
5. Update overlay and legend CSS for desktop and mobile widths.
6. Run the frontend build and OpenSpec validation.
