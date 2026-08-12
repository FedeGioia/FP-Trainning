## 1. Visual Theme & Atmosphere

Quiet admin workspace with a soft-light canvas, one elevated white roster card, and restrained blue as the only strong accent. The page should feel operational and calm rather than dashboard-heavy or consumer-marketing. Preserve the reference's “single control surface” feeling, but adapt it to FP-Training's existing trainer shell and Spanish product copy.

## 2. Color

- Base app background: keep the trainer shell neutrals already defined in `src/app/globals.css` (`#f3f5f9`, `#f8faff`, white surfaces).
- Primary accent: keep FP-Training trainer blue (`--primary`, `--primary-strong`) for the main CTA, active states, focus rings, and selected navigation.
- Surface contrast: white card on pale blue-gray background; avoid dark content panels inside the page body.
- Status tones: keep semantic completion colors for weekly progress (green / orange / red), but render them as soft pills instead of harsh dots-only signals when possible.
- Program pills: keep per-program color identity, but soften saturation slightly when used in dense table rows.

## 3. Typography

- Use the app's existing sans stack.
- Page title: large, bold, compact line-height; one clear focal heading.
- Supporting copy: muted, short, operational.
- Table headers: small uppercase or small caps feeling, medium-bold, muted gray.
- Row primary text: semibold student name.
- Row secondary text: muted email / helper metadata.
- Numeric progress: tabular-feeling emphasis, visually compact.

## 4. Spacing & Grid

- Center the content in a readable max-width block similar to the current trainer pages.
- Use one primary card with 20–24px internal padding on desktop.
- Toolbar gap: 12–16px.
- Table row height: comfortable, not cramped; target ~64–72px with vertical centering.
- Badges/actions should wrap only as a last resort; prioritize stable columns.

## 5. Layout & Composition

- Keep the app's existing trainer shell/header navigation; DO NOT add a literal left sidebar just because the reference has one.
- Borrow from the reference the relationship of “persistent navigation + one dominant content slab”. In FP-Training this means: current trainer header/nav remains the persistent frame, while the roster area becomes a single elevated white main surface.
- Merge the intro + toolbar + table into one more unified composition so the page reads like one roster workspace, not separate stacked cards.
- Search/filter controls should sit at the top edge of the surface, followed immediately by the table.

## 6. Components

- **Roster shell:** rounded 20–24px white card, subtle border, soft shadow.
- **Toolbar:** search-first composition; search input should feel long and calm, filter/select controls secondary, primary CTA at far right.
- **Table:** clean horizontal separators, low-noise header row, no zebra striping, hover state via faint blue wash + subtle left accent.
- **Student cell:** optional avatar slot can be introduced later, but v1 should support name-first layout without depending on avatars.
- **Program badges:** rounded pill chips, thin border or inner shadow, compact text, consistent height.
- **Weekly progress:** evolve from the current dot + fraction into a pill-like status token while preserving semantic counts.
- **Action icons:** simple outline icons inside small ghost buttons; one primary action may use filled blue treatment, others stay neutral.

## 7. Motion & Interaction

- Hover should be restrained: slight background tint, no large lifts.
- Focus states must use the existing blue focus ring language.
- CTA hover can keep the current subtle lift/shadow increase.
- Table actions should feel precise and utility-like, not playful.

## 8. Voice & Brand

- Keep FP-Training naming, Spanish labels, and trainer workflow language.
- Do not copy the reference title, logo, English labels, or generic fitness-brand copy.
- The visual tone should support “trainer operations” rather than a public-facing brand showcase.

## 9. Anti-patterns

- Do not add a literal cloned dark left sidebar inside the page.
- Do not import avatars, logos, or copy from the reference.
- Do not use glassmorphism, neon blue glows, or oversized gradients.
- Do not split the roster into many unrelated cards.
- Do not make badges overly saturated or action icons heavy/filled by default.
- Do not introduce a new component library just for this screen.
