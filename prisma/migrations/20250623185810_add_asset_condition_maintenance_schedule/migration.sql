-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "condition_id" INTEGER,
ADD COLUMN     "maintenance_schedule_id" INTEGER;

-- CreateTable
CREATE TABLE "asset_conditions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_schedules" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "asset_conditions_name_key" ON "asset_conditions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_schedules_name_key" ON "maintenance_schedules"("name");

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_condition_id_fkey" FOREIGN KEY ("condition_id") REFERENCES "asset_conditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_maintenance_schedule_id_fkey" FOREIGN KEY ("maintenance_schedule_id") REFERENCES "maintenance_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
