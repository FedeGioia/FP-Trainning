# Implementation Handoff

## Read first

- `docs/design/trainer-students-roster/DESIGN.md`
- `docs/design/trainer-students-roster/design-contract.md`
- `src/app/(trainer)/trainer/students/page.tsx`
- `src/components/trainer/student-roster-table.tsx`
- `src/app/globals.css`

## Binding constraints

- Stay inside the current Next.js server-component structure.
- Prefer semantic class additions in `globals.css`; match the current trainer BEM-style naming.
- Keep trainer tokens (`--primary`, `--primary-strong`, neutral surfaces) as the base palette.
- Reuse `ProgramBadge` instead of inventing a separate badge system.
- Keep current actions/URLs; visual changes should not alter workflow meaning.

## Responsive / composition rules

- Make the roster read as one unified white card on desktop.
- Toolbar order: search → optional filter slot → primary CTA.
- Table should remain horizontally stable on desktop; preserve controlled overflow on narrow widths.
- If email becomes too dense, degrade secondary metadata before breaking the primary hierarchy.

## Asset rules

- No copied logos, avatars, or screenshot assets.
- Icons should remain inline SVG or existing lightweight patterns.

## First artifact should prove

1. The intro/toolbar/table can be visually unified into one roster workspace.
2. Program badges and weekly progress can look more reference-aligned without breaking shared app semantics.
3. The page still clearly belongs to FP-Training trainer flows, not a cloned template.
