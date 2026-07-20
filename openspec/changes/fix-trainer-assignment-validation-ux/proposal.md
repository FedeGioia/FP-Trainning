# Proposal: Fix Trainer Assignment Validation UX

## Intent

Stop validation failures in trainer assignment creation from wiping the form. Template and manual flows currently redirect with only `?error`, so trainers lose entered values and manual row context.

## Scope

### In Scope
- Replace validation-failure redirects in template and manual assignment creation with structured action state.
- Preserve submitted values for all fields, including manual dynamic exercise rows and invalid numeric input.
- Show field-level and row-level errors while keeping a form-level fallback message.
- Keep domain validation in `src/modules/assignments/service.ts` as the source of truth and add coverage for action/service/UI state handling.

### Out of Scope
- Redesigning assignment creation layout or copy beyond validation feedback.
- Changing success redirects, assignment persistence rules, or unrelated trainer forms.

## Capabilities

### New Capabilities
- `trainer-routine-assignment-forms`: Validation-state handling for trainer template/manual assignment creation, including preserved inputs and targeted error feedback.

### Modified Capabilities
- None.

## Approach

Return serializable validation state from both server actions and render forms from that state instead of query-string errors. Manual parsing must keep raw submitted strings, distinguish blank from invalid numeric values, and rehydrate dynamic rows deterministically. Service-layer validation stays authoritative; extend its failure contract only as needed to expose stable field/path metadata that actions can map to UI errors without duplicating business rules.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/(trainer)/trainer/assignments/new/` | Modified | Template action/page shift to structured validation state. |
| `src/app/(trainer)/trainer/assignments/manual/` | Modified | Manual action/page preserve nested values and numeric issues. |
| `src/components/shared/ExercisePrescriptionGrid.tsx` | Modified | Rehydrate dynamic rows and display nested row errors. |
| `src/modules/assignments/service.ts` | Modified | Preserve domain validation while exposing structured issue metadata. |
| `tests/` | Modified | Add regression coverage for state preservation and validation mapping. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Dynamic rows rehydrate with wrong indexes | Med | Use submitted row order/indexes as the canonical form state. |
| UI and service validation drift | Med | Keep business validation in service; action checks only input-shape/parsing concerns. |

## Rollback Plan

Revert the change folder implementation to restore redirect-based errors and remove the added validation-state adapters/tests.

## Dependencies

- Existing Next.js server actions/forms stack in `src/app/(trainer)/trainer/assignments/*`.

## Success Criteria

- [ ] Validation failures in both assignment flows keep every submitted value visible after submit.
- [ ] Trainers see field-specific errors for missing/invalid inputs, including manual nested rows and numeric fields.
- [ ] Service-layer domain validation still blocks invalid assignments and is covered by regression tests.
