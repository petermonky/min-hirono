# Your Hirono storefront archive design language

Version: 2.0
Source influence: POP MART retail storefront
Reference: https://www.popmart.com/sg

This is the visual contract for Your Hirono. It translates POP MART's crisp merchandising language into a personal archive: a white retail canvas, black structural surfaces, compact uppercase labels, clean product grids, square image stages, restrained red accents and generous sectional spacing.

The app must remain clearly branded as an independent HIRONO collection tracker. Do not reproduce POP MART logos, commerce copy, prices or checkout patterns.

## Direction

- Treat artwork as merchandise photography: large, square and visually dominant.
- Use a bright white canvas with soft-gray product stages and almost no decorative container styling.
- Black creates structure in the footer and active controls.
- POP MART red is the interaction, progress and ownership accent. Baby pink remains a quiet HIRONO undertone in fallback and image surfaces.
- Use centered uppercase section titles with a short red rule.
- Prefer thin dividers and spacing over rounded cards, shadows or tinted panels.
- Keep controls compact and rectangular. No faux-3D button depth.
- Preserve the chronological archive model even though its presentation resembles a storefront.

## Tokens

```yaml
colors:
  primary: "#E60012"
  primaryStrong: "#B7000E"
  onPrimary: "#FFFFFF"
  ink: "#111111"
  body: "#343434"
  secondary: "#666666"
  muted: "#8D8D8D"
  canvas: "#FFFFFF"
  canvasSoft: "#F6F6F6"
  surfaceHover: "#F3F3F3"
  border: "#E6E6E6"
  borderStrong: "#BDBDBD"
  hironoPink: "#FFB6D2"
  focus: "#2563EB"
  error: "#C91524"

typography:
  display:
    fontFamily: "Barlow, Arial, sans-serif"
    fontWeight: 900
    letterSpacing: "-0.035em to -0.055em"
    textTransform: uppercase
  body:
    fontFamily: "Barlow, Arial, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.4
  brandMark:
    fontFamily: "Barlow, Arial, sans-serif"
    fontWeight: 900
    usage: "HIRONO wordmark"

radius:
  default: 0px

motion:
  pressDuration: 80ms
  hoverDuration: 120ms
  imageHoverDuration: 240ms
  easing: "cubic-bezier(0.2, 0, 0, 1)"
```

The implementation source of truth is `src/app/globals.css`. Use its semantic Tailwind tokens rather than introducing one-off colors.

## Page composition

### Header

- Use a single 64px white navigation row with a thin lower divider.
- Center the 36px Hirono head without adjacent wordmark text or secondary controls.
- Use the isolated hand-drawn Hirono head as the product mark and favicon. Keep its exterior transparent and internal white fill opaque; never place it inside the former red `H` square.
- On mobile, remove center navigation before reducing touch targets.

### Access gate

- The private archive opens with a single centered passcode form on the white app canvas.
- Use the regular app canvas rather than the soft-gray section surface.
- Center the Hirono head at 48px without visible title text; retain a screen-reader-only `Your Hirono` heading. Use the high-resolution source asset at this compact display size for crisp rendering.
- Keep the passcode field and primary action large enough for mobile entry.
- Authentication language should feel personal and quiet; avoid account-management or enterprise terminology.

### Entry point

- Begin with collection progress, followed immediately by filters and the chronological archive.
- Do not add a marketing hero, latest-release shelf or archive introduction block.
- Avoid descriptive subheadings beneath page or release titles; let imagery, metadata and progress establish hierarchy.

### Archive and filters

- The filter bar is sticky beneath the navigation and uses thin horizontal rules.
- Mobile shows one compact row containing search and a `Filters` disclosure button. Category and ownership controls stay collapsed until requested; the button displays the number of active filters.
- Expanded mobile filter groups use identical vertical spacing and consistent minimum control widths. Rails scroll horizontally only. Dynamic white edge fades transition over 180ms and appear only where additional options remain off-screen.
- Desktop presents search, category and ownership controls in one horizontal toolbar—never two permanently visible rows.
- Search fields and filter controls are rectangular with 1px borders.
- Keep search input updates urgent while deferring catalog reconciliation; precompute normalized catalog text and avoid rerendering unchanged collectible cards.
- Active filters are black with white type; inactive filters remain white.
- Years are shown as compact ruled markers alongside the chronological release list.

### Release and collectible cards

- Releases are sections divided by hairlines, not floating cards.
- Use 32px of equal padding above and below every collapsed release summary at every viewport size; the top spacing is the source of truth.
- On compact layouts, center the release image against the full metadata-and-progress column so its visible top and bottom spacing remains balanced.
- Compact release artwork is 120px square with a 16px gutter before the adjacent summary stack, large enough to balance the content without crowding a 320px viewport.
- Expand and collapse the item panel with a quiet height-and-opacity transition.
- Year rules use the same 1px thickness as release dividers.
- Release covers and collectible art use square image stages with `object-fit: cover`.
- Missing items retain 70% image opacity; avoid grayscale.
- Owned items use a red check block with white iconography and a visible border. Missing items use the empty checkbox; secondary status captions are omitted.
- Secrets use a compact black label and remain fully visible.
- Collaboration badges use a gray fill with white text. Product type always describes the object itself rather than using `Collaboration` as a type.

### Progress

- Progress tracks are 4px high with a gray track and red fill.
- Every bar is paired with exact counts and percentage text.
- Completion never relies on color alone.

### Footer and dialogs

- The footer is a compact black row containing only the lock and reset actions, aligned to the right.
- Footer actions use white borders so their outlines remain clear against black.
- Dialogs are flat canvas-colored rectangles with a 1px high-contrast border and no shadow treatment.
- Confirmation dialogs begin directly with the action title; do not add an eyebrow label above it.

## Responsive layout

- Minimum supported width: 320px.
- Page gutters: 20px mobile, 32px desktop.
- Product grids: 2 columns mobile, 3 small tablet, 4 tablet, 5 desktop.
- All interactive targets remain at least 40–44px.
- Avoid horizontal page scrolling; filter rows may scroll independently.

## Accessibility

- Essential copy uses black or dark gray on white.
- Red is always paired with labels, counts or checkmarks and uses white foreground content where needed.
- Keyboard focus uses a visible 2px blue outline.
- Image fallback is plain centered text; never show broken-image browser UI.
- Browser zoom remains functional.
- Respect `prefers-reduced-motion`; interactions become effectively immediate.
