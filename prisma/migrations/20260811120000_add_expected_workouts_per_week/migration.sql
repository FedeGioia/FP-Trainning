-- A student's expected workload is global for now, rather than program-specific.
-- Zero preserves existing students until a trainer sets an expectation.
ALTER TABLE "User" ADD COLUMN "expectedWorkoutsPerWeek" INTEGER NOT NULL DEFAULT 0;
