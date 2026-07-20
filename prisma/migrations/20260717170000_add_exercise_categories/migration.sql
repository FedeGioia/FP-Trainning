-- CreateTable
CREATE TABLE "ExerciseCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseCategory_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN "categoryId" TEXT;

-- CreateIndex
CREATE INDEX "Exercise_categoryId_idx" ON "Exercise"("categoryId");
CREATE INDEX "ExerciseCategory_parentId_idx" ON "ExerciseCategory"("parentId");
CREATE INDEX "ExerciseCategory_createdById_idx" ON "ExerciseCategory"("createdById");

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExerciseCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExerciseCategory" ADD CONSTRAINT "ExerciseCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ExerciseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExerciseCategory" ADD CONSTRAINT "ExerciseCategory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
