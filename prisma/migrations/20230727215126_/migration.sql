-- CreateEnum
CREATE TYPE "MeetupStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'DONE', 'RATED');

-- CreateEnum
CREATE TYPE "WorkoutType" AS ENUM ('GYM');

-- CreateEnum
CREATE TYPE "Archetype" AS ENUM ('POWER_LIFTER', 'BODY_BUILDER', 'CALISTHENIC', 'ATHELETIC');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "weightLb" INTEGER NOT NULL,
    "heightFoot" INTEGER NOT NULL,
    "heightInch" INTEGER NOT NULL,
    "squatLb" INTEGER,
    "deadLiftLb" INTEGER,
    "benchPressLb" INTEGER,
    "workoutPattern" JSONB,
    "archetype" "Archetype" NOT NULL,
    "yoe" INTEGER NOT NULL,
    "picture" TEXT,
    "registeredWith" TEXT,
    "partners" TEXT[],
    "resetToken" TEXT,
    "resetTokenExpiration" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gym" (
    "id" TEXT NOT NULL,
    "location" INTEGER[],
    "name" TEXT NOT NULL,

    CONSTRAINT "Gym_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workout" (
    "id" TEXT NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL,
    "status" "MeetupStatus" NOT NULL,
    "type" "WorkoutType" NOT NULL,
    "location" INTEGER[],
    "rating" INTEGER NOT NULL,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "userId" TEXT,
    "socketId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserToWorkout" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Gym_location_key" ON "Gym"("location");

-- CreateIndex
CREATE UNIQUE INDEX "Workout_location_key" ON "Workout"("location");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sid_key" ON "Session"("sid");

-- CreateIndex
CREATE UNIQUE INDEX "Session_userId_key" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_socketId_key" ON "Session"("socketId");

-- CreateIndex
CREATE UNIQUE INDEX "_UserToWorkout_AB_unique" ON "_UserToWorkout"("A", "B");

-- CreateIndex
CREATE INDEX "_UserToWorkout_B_index" ON "_UserToWorkout"("B");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToWorkout" ADD CONSTRAINT "_UserToWorkout_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToWorkout" ADD CONSTRAINT "_UserToWorkout_B_fkey" FOREIGN KEY ("B") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;
