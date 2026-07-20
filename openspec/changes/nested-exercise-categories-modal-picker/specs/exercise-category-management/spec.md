# Exercise Category Management Specification

## Purpose

Define how trainers organize exercises into nested category folders and assign each exercise to at most one category.

## Requirements

### Requirement: Trainers can manage nested exercise categories

The system MUST let trainers create exercise categories as top-level folders or as children of another category, and MUST present each category with its full parent-to-child path.

#### Scenario: Create a nested category
- GIVEN a trainer already has a parent category
- WHEN the trainer creates a new category under that parent
- THEN the category is stored as a child of that parent
- AND the UI shows its full path including every ancestor in order

#### Scenario: Create a root category
- GIVEN a trainer does not choose a parent category
- WHEN the trainer creates a category
- THEN the category is stored at the top level
- AND it is shown without any parent prefix

### Requirement: Exercises can belong to one category or none

The system MUST allow an exercise to be assigned to exactly one category or left uncategorized, and MUST allow trainers to clear an existing category assignment.

#### Scenario: Assign an exercise to a nested category
- GIVEN a trainer is creating or updating an exercise
- WHEN the trainer selects a nested category path
- THEN the exercise is associated to that single selected category
- AND the assignment reflects that exact category path in exercise-library views

#### Scenario: Leave an exercise uncategorized
- GIVEN a trainer does not select any category for an exercise
- WHEN the exercise is saved
- THEN the exercise remains available in the library
- AND it is shown as uncategorized rather than rejected for missing a category

### Requirement: Library views expose nested and uncategorized organization

The system MUST present the exercise library grouped by category hierarchy and MUST also expose exercises without a category in a distinct uncategorized state.

#### Scenario: Library shows mixed categorized and uncategorized exercises
- GIVEN the trainer has exercises across multiple nested categories and some without category
- WHEN the trainer opens the exercise library
- THEN exercises appear under their category path grouping
- AND uncategorized exercises appear in a separate visible group

#### Scenario: No categories exist yet
- GIVEN the trainer has exercises but no categories created
- WHEN the trainer opens category-based exercise management
- THEN the system shows an empty-category state
- AND trainers can still keep creating and using uncategorized exercises
