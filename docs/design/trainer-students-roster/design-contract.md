# Trainer Students Roster Design Contract

## Goal and target artifact

Create a reusable visual contract for the FP-Training trainer Students roster area, using the provided screenshot as the primary stylistic reference and grounding all decisions in the current Next.js + `globals.css` trainer implementation.

Audience: trainers managing students, assignments, and weekly adherence.

## Evidence

| Evidence | Confidence | Notes |
|---|---|---|
| `C:\Users\fedeg\AppData\Local\Temp\Rar$DRa26632.30196.rartemp\screen.png` | provided | Strong cues for composition, toolbar feel, chip density, and single-surface workspace. |
| `src/app/(trainer)/trainer/students/page.tsx` | observed | Current roster page structure: intro, feedback, search form, table, empty state. |
| `src/components/trainer/student-roster-table.tsx` | observed | Current table columns, actions, and weekly progress model. |
| `src/app/globals.css` trainer + roster styles | observed | Existing visual tokens, card language, hover states, and BEM-like class pattern. |
| `src/components/layout/role-shell.tsx` | observed | Current trainer navigation is top/header-based, not sidebar-based. |
| `src/app/(trainer)/trainer/students/[studentId]/page.tsx` | observed | Related surface to align with future screens in the same area. |

## Keep / Change / Do not copy

| Keep | Change / Adapt | Do not copy |
|---|---|---|
| One dominant white management surface | Map the sidebar feeling to FP-Training's existing trainer shell/header | FP-Training logo placement from the screenshot |
| Strong page title + toolbar directly above the table | Replace English copy with FP-Training Spanish product language | “Trainer Student Workout Management” title |
| Search-first toolbar with secondary filter and strong CTA | Use current data model: students, programs, weekly counts, existing actions | Reference student names, avatars, labels, or counts |
| Rounded pills for programs and progress | Reuse existing `ProgramBadge` semantics instead of arbitrary new chip categories | Exact chip colors if they conflict with FP-Training program tones |
| Minimal grid with clean row dividers | Keep current table columns relevant to FP-Training; optionally hide email on tighter widths later | Exact layout proportions if they harm responsiveness |
| Outline utility action icons | Keep FP-Training action destinations and accessible labels | Literal icon set if it requires a new dependency |

## Final design stance

Recommended direction: **soft editorial admin table**. Keep the reference's calm white-card workspace, compact toolbar, rounded pills, and simple row actions. Adapt it to FP-Training by preserving the existing trainer header shell, current data model, current blue accent, and current semantic program/status structure. The roster page should feel more unified and polished, not redesigned into a different product.

## Risks and unknowns

- The reference implies avatars, but the current roster data does not expose student images.
- The reference shows a filter dropdown; current page only has search. Filter scope needs product confirmation before implementation.
- `ProgramBadge` colors are shared across other areas, so heavy visual changes may have cross-screen impact.
- The trainer shell is horizontal; if the product later wants a true left rail, that becomes a broader layout change, not a page-only tweak.

## Quality gate checklist

- [x] One dominant roster surface, not multiple stacked cards.
- [x] Search toolbar feels integrated with the table.
- [x] Table hierarchy is readable in under 3 seconds: name → programs → weekly state → actions.
- [x] Visual borrowing stays at the level of composition/material/tone, not brand cloning.
- [x] Uses current trainer tokens, semantic classes, and plain CSS architecture.
- [x] Works as a baseline for `/trainer/students` and related trainer-student screens.
