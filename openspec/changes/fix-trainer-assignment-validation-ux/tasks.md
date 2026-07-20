# Tasks: Fix Trainer Assignment Validation UX

## Phase 1: Types & Validation Contract

- [x] 1.1 Add `ValidationIssue` type to `src/modules/assignments/types.ts`: `{ path: string; message: string; kind: 'required' | 'invalid' }`. Add `TemplateValidationState` and `ManualValidationState` serializable types holding submitted field values, issue arrays, and a general `formError`.
- [x] 1.2 Extend `CreateAssignmentResult` and `CreateManualAssignmentResult` discriminated unions: on `ok: false` add optional `issues: ValidationIssue[]` alongside the existing `message`.

## Phase 2: Service Structured Issues

- [x] 2.1 In `src/modules/assignments/service.ts` `createAssignment`: map each early-return validation failure to an `issues` array with stable paths (`studentId`, `templateId`, `scheduledAt`) while keeping the `message` string unchanged.
- [x] 2.2 In `createManualAssignment`: map each normalization error and per-exercise validation to `issues` with nested paths (`sections.{i}.title`, `sections.{i}.exercises.{j}.exerciseId`, `sections.{i}.exercises.{j}.strengthSeries`, etc.). Keep existing `message` for backward compat.

## Phase 3: Raw Numeric Parsing & Action State

- [x] 3.1 Refactor `parseOptionalNumber` in `src/app/(trainer)/trainer/assignments/manual/actions.ts` to return `{ raw: string; parsed: number | null }` instead of bare `number | undefined`. Blank → `{ raw: '', parsed: null }`. Non-numeric text → `{ raw: 'abc', parsed: null }`. Valid → `{ raw: '60', parsed: 60 }`.
- [x] 3.2 After calling `createManualAssignment`, when `result.ok` is false, build a `ManualValidationState` containing all submitted top-level fields, every section's raw title, every exercise row's raw field strings (including raw numeric strings), and the returned issues. Return this object instead of calling `redirect()`.
- [x] 3.3 Refactor `createAssignmentAction`: on `result.ok` false, build `TemplateValidationState` with all five submitted field values and returned issues, then return it instead of redirecting. On auth failure, keep existing redirect.

## Phase 4: Client Form Components

- [x] 4.1 Extract `TemplateAssignmentForm` client component from `src/app/(trainer)/trainer/assignments/new/page.tsx`. Accept `students`, `templates`, and optional `initialState: TemplateValidationState` props. Use `useActionState(createAssignmentAction, initialState ?? null)` to handle returned validation state and render field values from it.
- [x] 4.2 Extract `ManualAssignmentForm` client component from `src/app/(trainer)/trainer/assignments/manual/page.tsx`. Accept `students`, `programs`, `exercises`, and optional `initialState: ManualValidationState` props. Use `useActionState(createManualAssignmentAction, initialState ?? null)`. Pass section titles and exercise row initial values down to `ExercisePrescriptionGrid`.

## Phase 5: ExercisePrescriptionGrid Rehydration

- [x] 5.1 Add optional `initialRows` prop to `ExercisePrescriptionGrid` (array of `{ metricType: string }[]`). Initialize `useState` from `initialRows` when provided instead of always creating 4 blank rows. Preserve the existing `createRow()` fallback.
- [x] 5.2 Add optional `initialValues` prop (nested array indexed by `[exerciseIndex]`) carrying raw strings for `exerciseId`, `prescriptionValue`, `strengthSeries`, `strengthRepetitions`, `strengthWeight`, `restLabel`, `methodLabel`. Set `defaultValue` on each input/select accordingly. Keep metricType select controlled via existing state.
- [x] 5.3 Add optional `fieldErrors` prop (`Record<string, string>`) keyed by field name. Render inline `<small className="field-error">` below the affected input when present.

## Phase 6: Page Rewiring

- [x] 6.1 Update `new/page.tsx`: pass fetched `students`/`templates` to `TemplateAssignmentForm`. When action returns validation state, re-render with it (via `useActionState` in the client component). Remove the `params.error` banner logic — errors now come from validation state.
- [x] 6.2 Update `manual/page.tsx`: pass fetched data to `ManualAssignmentForm`. When action returns validation state, re-render with preserved sections, exercise rows, and raw numeric values. Remove `params.error` banner. Add accessible `role="alert"` general error message from `formError`.

## Phase 7: Tests

- [x] 7.1 Add unit tests in `tests/run.ts`: validate that `createAssignment` returns structured issues with correct paths for missing studentId, missing templateId, invalid scheduledAt.
- [x] 7.2 Add unit tests: validate that `createManualAssignment` returns nested issues for missing section title, missing exerciseId, invalid metricType, missing STRENGTH fields, missing prescription for non-STRENGTH.
- [x] 7.3 Add unit tests for the refactored numeric parser: blank string → `{ raw: '', parsed: null }`, non-numeric text → `{ raw: 'abc', parsed: null }`, valid number → `{ raw: '60', parsed: 60 }`, comma decimal → `{ raw: '62,5', parsed: 62.5 }`.
- [x] 7.4 Add unit tests for `ManualValidationState` construction from action failure: verify all submitted fields, raw numeric strings, and dynamic row order are preserved in the returned state object.

## Phase 8: Verification

- [ ] 8.1 Run `npm test` and `npm run test:integration`. Confirm zero regressions and all new tests pass.
- [ ] 8.2 Manual verification checklist: (a) template form — submit with missing fields, confirm all values preserved and per-field errors shown; (b) manual form — submit with one invalid row, confirm all rows, exercise selections, and raw numeric text preserved; (c) blank numeric field shows "required" error, non-numeric text shows "invalid number" error; (d) valid submission still redirects to `/trainer/assignments?created=1`.
