# Trainer Routine Assignment Forms Specification

## Purpose

Define observable validation behavior for trainer template and manual assignment creation when submission fails.

## Requirements

### Requirement: Template submission retains user input on validation failure

The system MUST re-render the template assignment form with the submitted field values after a failed submission, while preserving the existing successful submission behavior.

#### Scenario: Template validation failure keeps submitted values
- GIVEN a trainer submits the template assignment form with one or more invalid fields
- WHEN the submission is rejected
- THEN the form shows the same submitted client, template, start date, and notes values
- AND no submitted field is cleared solely because validation failed

#### Scenario: Template success behavior remains unchanged
- GIVEN a trainer submits a valid template assignment form
- WHEN the submission succeeds
- THEN the assignment is created using existing persistence rules
- AND the existing success redirect or completion behavior remains unchanged

### Requirement: Manual submission retains dynamic rows and raw numeric input on validation failure

The system MUST re-render the manual assignment form with all submitted top-level fields, exercise rows, and raw numeric inputs after a failed submission.

#### Scenario: Manual validation failure keeps dynamic rows
- GIVEN a trainer submits the manual assignment form with multiple exercise rows and one row is invalid
- WHEN the submission is rejected
- THEN the form shows the same rows in the same submitted order
- AND each row keeps its submitted exercise, sets, reps, rest, and notes values

#### Scenario: Invalid numeric input is preserved verbatim
- GIVEN a trainer submits a manual row with a non-empty numeric field containing invalid numeric text
- WHEN the submission is rejected
- THEN that field still shows the submitted text value
- AND the value is not normalized into an empty field or different number

### Requirement: Validation feedback is targeted and accessible

The system MUST show field-specific or row-specific validation errors for rejected submissions and MUST also show an accessible general validation message as a fallback.

#### Scenario: Template flow shows field-specific errors with fallback
- GIVEN a template submission fails validation for specific fields
- WHEN the form is re-rendered
- THEN each invalid field shows its own validation error
- AND the page also shows a general validation message perceivable to assistive technology users

#### Scenario: Manual flow shows row-specific errors with fallback
- GIVEN a manual submission fails validation for one or more nested exercise row fields
- WHEN the form is re-rendered
- THEN each affected row field shows its own validation error
- AND the page also shows a general validation message perceivable to assistive technology users

### Requirement: Missing values and invalid numeric values are distinguished without weakening service validation

The system MUST present different validation feedback for missing required numeric values versus non-empty invalid numeric values, and MUST continue to rely on service-layer validation as the authority for assignment validity.

#### Scenario: Missing numeric value reports required-field feedback
- GIVEN a required numeric field is submitted blank
- WHEN the submission is rejected
- THEN the field error indicates that a value is required
- AND it is not reported as an invalid number

#### Scenario: Invalid numeric value reports format feedback while service validation still blocks submission
- GIVEN a required numeric field is submitted with non-empty invalid numeric text
- WHEN the submission is rejected
- THEN the field error indicates invalid numeric input
- AND the assignment is not created because validation still fails
