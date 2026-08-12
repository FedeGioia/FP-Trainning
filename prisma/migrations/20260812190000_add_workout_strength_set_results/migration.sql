-- Per-set strength results are normalized while WorkoutResultEntry remains the
-- exercise-level completion record. Existing JSON payloads intentionally stay
-- untouched and are read as a legacy fallback until a student saves new sets.
CREATE TABLE "WorkoutStrengthSetResult" (
    "id" TEXT NOT NULL,
    "workoutResultEntryId" TEXT NOT NULL,
    "setOrder" INTEGER NOT NULL,
    "repetitions" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutStrengthSetResult_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WorkoutStrengthSetResult_workoutResultEntryId_setOrder_key"
ON "WorkoutStrengthSetResult"("workoutResultEntryId", "setOrder");

CREATE INDEX "WorkoutStrengthSetResult_workoutResultEntryId_idx"
ON "WorkoutStrengthSetResult"("workoutResultEntryId");

ALTER TABLE "WorkoutStrengthSetResult"
ADD CONSTRAINT "WorkoutStrengthSetResult_workoutResultEntryId_fkey"
FOREIGN KEY ("workoutResultEntryId") REFERENCES "WorkoutResultEntry"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
