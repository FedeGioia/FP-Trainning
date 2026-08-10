-- Backfill a stable root category before making every exercise category mandatory.
DO $$
DECLARE
    backfill_category_id TEXT;
BEGIN
    SELECT "id" INTO backfill_category_id
    FROM "ExerciseCategory"
    WHERE "name" = 'Sin categoría' AND "parentId" IS NULL
    ORDER BY "createdAt" ASC
    LIMIT 1;

    IF backfill_category_id IS NULL THEN
        backfill_category_id := 'uncategorized-exercise-category';
        INSERT INTO "ExerciseCategory" ("id", "name", "parentId", "createdAt", "updatedAt")
        VALUES (backfill_category_id, 'Sin categoría', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    END IF;

    UPDATE "Exercise"
    SET "categoryId" = backfill_category_id
    WHERE "categoryId" IS NULL;
END $$;

-- The backfill makes the relation safe to require. Restrict deletion so no future
-- database-level delete can create an uncategorized exercise.
ALTER TABLE "Exercise" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "Exercise" DROP CONSTRAINT "Exercise_categoryId_fkey";
ALTER TABLE "Exercise"
  ADD CONSTRAINT "Exercise_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "ExerciseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
