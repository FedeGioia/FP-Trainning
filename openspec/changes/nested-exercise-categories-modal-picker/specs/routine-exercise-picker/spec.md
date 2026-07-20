# Routine Exercise Picker Specification

## Purpose

Define modal-based exercise selection for routine-building rows while keeping routine submission compatible with current server handling.

## Requirements

### Requirement: Routine-building rows use a modal picker in supported flows

The system MUST use a modal-based exercise picker for exercise-row selection in template creation and manual assignment creation, and MUST NOT require this picker in template assignment.

#### Scenario: Template creation selects an exercise from a modal
- GIVEN a trainer is building a template and focuses an exercise row
- WHEN the trainer opens the picker and chooses an exercise
- THEN the row shows the chosen exercise as the current selection
- AND the trainer can continue editing the rest of the row without leaving the form

#### Scenario: Template assignment remains unchanged
- GIVEN a trainer is assigning an existing template to a student
- WHEN the trainer uses the template assignment flow
- THEN no routine exercise picker is shown
- AND existing template assignment behavior remains unchanged

### Requirement: Modal picker organizes exercises by category path

The system MUST present exercises inside the modal grouped or filterable by category path, and MUST include exercises with no category in a visible uncategorized state.

#### Scenario: Browse nested categories in the picker
- GIVEN exercises exist in multiple nested categories
- WHEN the trainer opens the modal picker
- THEN each exercise is shown with enough category context to distinguish similarly named items
- AND nested categories are presented in parent-to-child order

#### Scenario: Picker shows uncategorized exercises
- GIVEN some exercises do not belong to a category
- WHEN the trainer opens the modal picker
- THEN those exercises remain selectable
- AND they appear in a clearly identified uncategorized group or label

### Requirement: Picker preserves the current routine submission contract

The system MUST submit the same exercise identifier values and field names currently consumed by template-creation and manual-assignment server actions, regardless of the modal UI.

#### Scenario: Modal selection submits existing exerciseId contract
- GIVEN a trainer selects exercises through the modal and submits the form
- WHEN the request reaches the existing server action
- THEN each populated row includes the same `exerciseId` field contract as before
- AND downstream template or manual assignment persistence continues without a server contract change

### Requirement: Picker handles empty exercise availability clearly

The system MUST communicate when no exercises are available to pick and MUST prevent the modal flow from implying a selection succeeded when the catalog is empty.

#### Scenario: No exercises available for picking
- GIVEN the trainer opens a supported routine-building page with no exercises in the library
- WHEN the trainer reaches exercise selection
- THEN the UI shows a clear empty-state message for missing exercises
- AND the trainer is not shown a misleading successful selection state
