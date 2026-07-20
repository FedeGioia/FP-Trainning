# Tasks: Nested Exercise Categories and Modal Routine Picker

## Phase 1: Data Model & Migration

- [x] 1.1 Add `ExerciseCategory` model to `prisma/schema.prisma` — fields: `id cuid`, `name`, `parentId String?` self-relation, `createdById String?` relation to User, `createdAt`/`updatedAt`
- [x] 1.2 Add `categoryId String?` field and `category ExerciseCategory?` relation to existing `Exercise` model in `prisma/schema.prisma`
- [ ] 1.3 Run `npx prisma migrate dev --name add-exercise-categories` and verify migration SQL
- [ ] 1.4 Run `npx prisma generate` to regenerate client types

## Phase 2: Category Services & Exercise Module

- [x] 2.1 Add types to `src/modules/exercises/types.ts` — `ExerciseCategoryNode` (with children + path), `CreateCategoryInput`, `CreateCategoryResult`
- [x] 2.2 Add `createCategory(input)` to `src/modules/exercises/service.ts` — insert with optional parentId, validate parent exists
- [x] 2.3 Add `listCategoryTree()` to `src/modules/exercises/service.ts` — query all categories, build parent→children tree, compute display path per node
- [x] 2.4 Add `deleteCategory(id)` to `src/modules/exercises/service.ts` — reject if has children; reassign exercises to uncategorized on delete
- [x] 2.5 Add `listExercisesWithCategoryPaths()` to `src/modules/exercises/service.ts` — join exercises with category ancestry, return `categoryPath` string per exercise
- [x] 2.6 Extend `CreateExerciseInput` and `createExercise()` in service to accept optional `categoryId`, pass through to Prisma create
- [x] 2.7 Export new functions from `src/modules/exercises/index.ts`

## Phase 3: Trainer Category Management UX

- [x] 3.1 Create `src/app/(trainer)/trainer/exercises/actions.ts` with server actions: `createCategoryAction`, `deleteCategoryAction` (auth-gated to trainer role)
- [x] 3.2 Add category tree section to `src/app/(trainer)/trainer/exercises/page.tsx` — render tree with add-child / delete buttons, empty-state when no categories
- [x] 3.3 Add category `<select>` field to exercise creation form in `src/app/(trainer)/trainer/exercises/new/page.tsx` — fetch category tree server-side, pass as props
- [x] 3.4 Update `createExerciseAction` in `src/app/(trainer)/trainer/exercises/new/actions.ts` to read and forward `categoryId`

## Phase 4: Shared Modal Picker Component

- [x] 4.1 Create `src/components/shared/ExerciseModalPicker.tsx` — dialog with `role="dialog"` + `aria-modal="true"`, search input, category-grouped exercise list, select/cancel, empty state for no exercises
- [x] 4.2 Create `src/components/shared/ExerciseModalPickerTrigger.tsx` — small button/display showing current selection text + hidden `<input name={fieldName} value={selectedId}>` preserving form contract
- [x] 4.3 Add modal and picker styles to `src/app/globals.css` — follow existing `student-modal-backdrop` / `student-modal` pattern for consistency

## Phase 5: Integrate Picker into Routine Builders

- [x] 5.1 Replace `<select>` exercise column in `src/components/shared/ExercisePrescriptionGrid.tsx` with `ExerciseModalPickerTrigger` + hidden input; accept `exercisesWithPaths` prop (categoryPath + id + name + metricType)
- [x] 5.2 Update `src/app/(trainer)/trainer/templates/new/page.tsx` — call `listExercisesWithCategoryPaths()` and pass result to grid
- [x] 5.3 Update `src/app/(trainer)/trainer/assignments/manual/ManualAssignmentForm.tsx` — accept and forward category-aware exercises to grid
- [x] 5.4 Confirm `src/app/(trainer)/trainer/assignments/new/TemplateAssignmentForm.tsx` is NOT modified (out of scope)

## Phase 6: Verification

- [ ] 6.1 Verify `npx prisma migrate dev` applies cleanly and `prisma generate` produces valid client
- [ ] 6.2 Manual test: create category tree (root + nested), assign exercise to nested category, confirm path displays in library
- [ ] 6.3 Manual test: exercise creation with and without category; verify uncategorized exercises appear in library
- [ ] 6.4 Manual test: open modal picker in template creation, browse grouped exercises, select one — confirm hidden input has correct `exerciseId`
- [ ] 6.5 Manual test: submit template form — verify server action receives same `exerciseId` contract as before
- [ ] 6.6 Manual test: same flow for manual assignment form — verify no regression
- [x] 6.7 Verify template assignment flow (`TemplateAssignmentForm`) is unaffected
