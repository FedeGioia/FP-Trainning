# Proposal: Nested Exercise Categories and Modal Routine Picker

## Intent

Make the exercise library scale cleanly and keep routine building usable once the catalog grows. Today exercises are effectively flat and routine rows rely on a plain select that will degrade as volume increases.

## Scope

### In Scope
- Add truly hierarchical exercise categories (folder-like parent/child nesting).
- Allow exercises to belong to one category and expose category path data for UI grouping.
- Replace exercise row dropdowns with a shared modal picker in template creation and manual assignment creation.

### Out of Scope
- Template-to-student assignment flow; it does not pick exercises directly.
- Multi-category tagging, drag-and-drop tree management, or bulk taxonomy tools.

## Requirements Summary

- Trainers MUST be able to organize categories with parent-child nesting.
- Exercise creation/editing MUST support assigning an exercise to a nested category.
- Routine-building exercise selection MUST use a modal picker and preserve the same submitted value contract.

## Capabilities

### New Capabilities
- `exercise-category-management`: Hierarchical categories for organizing exercises and assigning a category to an exercise.
- `routine-exercise-picker`: Shared modal-based exercise selection for routine-building rows.

### Modified Capabilities
- None.

## Approach

Use the smallest safe model: add a self-referential `ExerciseCategory` table plus nullable `categoryId` on `Exercise`. Keep tree writes simple with parentId links and compute display paths server-side for reads, avoiding nested-set/materialized-path complexity for now. Introduce one shared client picker component that opens a modal, filters/group exercises by category path, writes the chosen `exerciseId` to the existing form field contract, and is reused by `ExercisePrescriptionGrid` in templates and manual assignments.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modified | Add category hierarchy and exercise relation. |
| `src/modules/exercises/` | Modified | Extend types/services to read category paths and picker data. |
| `src/app/(trainer)/trainer/exercises/` | Modified | Support category assignment and library organization UI. |
| `src/components/shared/ExercisePrescriptionGrid.tsx` | Modified | Swap select for shared modal picker trigger/hidden value. |
| `src/components/shared/` | New | Shared modal picker component(s). |
| `src/app/globals.css` | Modified | Reuse/extend modal and picker styles. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Recursive category rendering gets messy | Med | Limit to parentId tree + derived display paths first. |
| Modal picker hurts keyboard/accessibility | Med | Reuse existing dialog patterns and require focus/ARIA coverage. |

## Rollback Plan

Revert category schema/UI additions and restore the existing exercise select in `ExercisePrescriptionGrid` while keeping routine payload names unchanged.

## Dependencies

- Existing Prisma + Next.js App Router form/server-action stack.

## Success Criteria

- [ ] Trainers can create nested categories and assign exercises into them.
- [ ] Template creation and manual assignment use the modal picker for exercise selection.
- [ ] Existing routine submission payloads and downstream assignment/template persistence remain compatible.
