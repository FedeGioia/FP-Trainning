-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TRAINER', 'STUDENT');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ProgramCode" AS ENUM ('FP_TRAINING', 'FP_STRETCHING', 'FP_RUNNING', 'FP_HOME');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'PAUSED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('STRENGTH', 'DURATION', 'DISTANCE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "RoutineStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'PARTIAL', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED');

-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('VIDEO');

-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('WARMUP', 'PREPARATION', 'MAIN', 'ACCESSORY', 'CIRCUIT', 'COMPLEMENT', 'CUSTOM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "code" "ProgramCode" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProgramMembership" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProgramMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerStudentAssignment" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "activeFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activeTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainerStudentAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "primaryMetricType" "MetricType" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseMedia" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "kind" "MediaKind" NOT NULL DEFAULT 'VIDEO',
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "programId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutineTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineTemplateSection" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sectionType" "SectionType" NOT NULL DEFAULT 'CUSTOM',
    "sectionOrder" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutineTemplateSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineTemplateExercise" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "exerciseOrder" INTEGER NOT NULL,
    "metricType" "MetricType" NOT NULL,
    "prescriptionPayload" JSONB NOT NULL,
    "restLabel" TEXT,
    "methodLabel" TEXT,
    "complementLabel" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutineTemplateExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignedRoutine" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "templateId" TEXT,
    "title" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "RoutineStatus" NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssignedRoutine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignedRoutineSection" (
    "id" TEXT NOT NULL,
    "assignedRoutineId" TEXT NOT NULL,
    "sourceTemplateSectionId" TEXT,
    "title" TEXT NOT NULL,
    "sectionType" "SectionType" NOT NULL DEFAULT 'CUSTOM',
    "sectionOrder" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssignedRoutineSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignedRoutineExercise" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "sourceTemplateExerciseId" TEXT,
    "exerciseOrder" INTEGER NOT NULL,
    "metricType" "MetricType" NOT NULL,
    "prescriptionSnapshot" JSONB NOT NULL,
    "restLabel" TEXT,
    "methodLabel" TEXT,
    "complementLabel" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssignedRoutineExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutSubmission" (
    "id" TEXT NOT NULL,
    "assignedRoutineId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "studentNotes" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutResultEntry" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "assignedRoutineExerciseId" TEXT NOT NULL,
    "resultType" "MetricType" NOT NULL,
    "resultPayload" JSONB NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutResultEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerFeedback" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "submissionId" TEXT,
    "assignedRoutineExerciseId" TEXT,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainerFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Program_code_key" ON "Program"("code");

-- CreateIndex
CREATE INDEX "StudentProgramMembership_studentId_idx" ON "StudentProgramMembership"("studentId");

-- CreateIndex
CREATE INDEX "StudentProgramMembership_programId_idx" ON "StudentProgramMembership"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProgramMembership_studentId_programId_key" ON "StudentProgramMembership"("studentId", "programId");

-- CreateIndex
CREATE INDEX "TrainerStudentAssignment_trainerId_idx" ON "TrainerStudentAssignment"("trainerId");

-- CreateIndex
CREATE INDEX "TrainerStudentAssignment_studentId_idx" ON "TrainerStudentAssignment"("studentId");

-- CreateIndex
CREATE INDEX "TrainerStudentAssignment_programId_idx" ON "TrainerStudentAssignment"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerStudentAssignment_trainerId_studentId_programId_key" ON "TrainerStudentAssignment"("trainerId", "studentId", "programId");

-- CreateIndex
CREATE INDEX "Exercise_primaryMetricType_idx" ON "Exercise"("primaryMetricType");

-- CreateIndex
CREATE INDEX "ExerciseMedia_exerciseId_idx" ON "ExerciseMedia"("exerciseId");

-- CreateIndex
CREATE INDEX "RoutineTemplate_programId_idx" ON "RoutineTemplate"("programId");

-- CreateIndex
CREATE INDEX "RoutineTemplate_createdById_idx" ON "RoutineTemplate"("createdById");

-- CreateIndex
CREATE INDEX "RoutineTemplateSection_templateId_idx" ON "RoutineTemplateSection"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "RoutineTemplateSection_templateId_sectionOrder_key" ON "RoutineTemplateSection"("templateId", "sectionOrder");

-- CreateIndex
CREATE INDEX "RoutineTemplateExercise_sectionId_idx" ON "RoutineTemplateExercise"("sectionId");

-- CreateIndex
CREATE INDEX "RoutineTemplateExercise_exerciseId_idx" ON "RoutineTemplateExercise"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "RoutineTemplateExercise_sectionId_exerciseOrder_key" ON "RoutineTemplateExercise"("sectionId", "exerciseOrder");

-- CreateIndex
CREATE INDEX "AssignedRoutine_studentId_scheduledAt_idx" ON "AssignedRoutine"("studentId", "scheduledAt");

-- CreateIndex
CREATE INDEX "AssignedRoutine_trainerId_scheduledAt_idx" ON "AssignedRoutine"("trainerId", "scheduledAt");

-- CreateIndex
CREATE INDEX "AssignedRoutine_programId_scheduledAt_idx" ON "AssignedRoutine"("programId", "scheduledAt");

-- CreateIndex
CREATE INDEX "AssignedRoutineSection_assignedRoutineId_idx" ON "AssignedRoutineSection"("assignedRoutineId");

-- CreateIndex
CREATE UNIQUE INDEX "AssignedRoutineSection_assignedRoutineId_sectionOrder_key" ON "AssignedRoutineSection"("assignedRoutineId", "sectionOrder");

-- CreateIndex
CREATE INDEX "AssignedRoutineExercise_sectionId_idx" ON "AssignedRoutineExercise"("sectionId");

-- CreateIndex
CREATE INDEX "AssignedRoutineExercise_exerciseId_idx" ON "AssignedRoutineExercise"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "AssignedRoutineExercise_sectionId_exerciseOrder_key" ON "AssignedRoutineExercise"("sectionId", "exerciseOrder");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutSubmission_assignedRoutineId_key" ON "WorkoutSubmission"("assignedRoutineId");

-- CreateIndex
CREATE INDEX "WorkoutSubmission_studentId_idx" ON "WorkoutSubmission"("studentId");

-- CreateIndex
CREATE INDEX "WorkoutResultEntry_submissionId_idx" ON "WorkoutResultEntry"("submissionId");

-- CreateIndex
CREATE INDEX "WorkoutResultEntry_assignedRoutineExerciseId_idx" ON "WorkoutResultEntry"("assignedRoutineExerciseId");

-- CreateIndex
CREATE INDEX "TrainerFeedback_trainerId_idx" ON "TrainerFeedback"("trainerId");

-- CreateIndex
CREATE INDEX "TrainerFeedback_submissionId_idx" ON "TrainerFeedback"("submissionId");

-- CreateIndex
CREATE INDEX "TrainerFeedback_assignedRoutineExerciseId_idx" ON "TrainerFeedback"("assignedRoutineExerciseId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgramMembership" ADD CONSTRAINT "StudentProgramMembership_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgramMembership" ADD CONSTRAINT "StudentProgramMembership_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerStudentAssignment" ADD CONSTRAINT "TrainerStudentAssignment_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerStudentAssignment" ADD CONSTRAINT "TrainerStudentAssignment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerStudentAssignment" ADD CONSTRAINT "TrainerStudentAssignment_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseMedia" ADD CONSTRAINT "ExerciseMedia_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineTemplate" ADD CONSTRAINT "RoutineTemplate_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineTemplate" ADD CONSTRAINT "RoutineTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineTemplateSection" ADD CONSTRAINT "RoutineTemplateSection_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "RoutineTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineTemplateExercise" ADD CONSTRAINT "RoutineTemplateExercise_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "RoutineTemplateSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineTemplateExercise" ADD CONSTRAINT "RoutineTemplateExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedRoutine" ADD CONSTRAINT "AssignedRoutine_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedRoutine" ADD CONSTRAINT "AssignedRoutine_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedRoutine" ADD CONSTRAINT "AssignedRoutine_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedRoutine" ADD CONSTRAINT "AssignedRoutine_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "RoutineTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedRoutineSection" ADD CONSTRAINT "AssignedRoutineSection_assignedRoutineId_fkey" FOREIGN KEY ("assignedRoutineId") REFERENCES "AssignedRoutine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedRoutineSection" ADD CONSTRAINT "AssignedRoutineSection_sourceTemplateSectionId_fkey" FOREIGN KEY ("sourceTemplateSectionId") REFERENCES "RoutineTemplateSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedRoutineExercise" ADD CONSTRAINT "AssignedRoutineExercise_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "AssignedRoutineSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedRoutineExercise" ADD CONSTRAINT "AssignedRoutineExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedRoutineExercise" ADD CONSTRAINT "AssignedRoutineExercise_sourceTemplateExerciseId_fkey" FOREIGN KEY ("sourceTemplateExerciseId") REFERENCES "RoutineTemplateExercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSubmission" ADD CONSTRAINT "WorkoutSubmission_assignedRoutineId_fkey" FOREIGN KEY ("assignedRoutineId") REFERENCES "AssignedRoutine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSubmission" ADD CONSTRAINT "WorkoutSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutResultEntry" ADD CONSTRAINT "WorkoutResultEntry_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "WorkoutSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutResultEntry" ADD CONSTRAINT "WorkoutResultEntry_assignedRoutineExerciseId_fkey" FOREIGN KEY ("assignedRoutineExerciseId") REFERENCES "AssignedRoutineExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerFeedback" ADD CONSTRAINT "TrainerFeedback_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerFeedback" ADD CONSTRAINT "TrainerFeedback_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "WorkoutSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerFeedback" ADD CONSTRAINT "TrainerFeedback_assignedRoutineExerciseId_fkey" FOREIGN KEY ("assignedRoutineExerciseId") REFERENCES "AssignedRoutineExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
