/*
  Warnings:

  - You are about to drop the `data_connectors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `file_uploads` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `knowledge_base_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `organizations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `properties` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `replicas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `upload_schedules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `organizationId` on the `hubspot_settings` table. All the data in the column will be lost.
  - Added the required column `integrationId` to the `hubspot_settings` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "replicas_slug_key";

-- DropIndex
DROP INDEX "users_email_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "data_connectors";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "file_uploads";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "knowledge_base_entries";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "organizations";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "properties";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "replicas";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "upload_schedules";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "users";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "integration_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationSecret" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "settings" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "integrationId" TEXT NOT NULL,
    "replicaId" TEXT,
    "operation" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "details" TEXT,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sync_logs_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "integration_settings" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_hubspot_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "integrationId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "isConnected" BOOLEAN NOT NULL DEFAULT false,
    "lastSync" DATETIME,
    "propertiesCount" INTEGER NOT NULL DEFAULT 0,
    "syncStatus" TEXT NOT NULL DEFAULT 'idle',
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "hubspot_settings_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "integration_settings" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_hubspot_settings" ("apiKey", "createdAt", "errorMessage", "id", "isConnected", "lastSync", "propertiesCount", "syncStatus", "updatedAt") SELECT "apiKey", "createdAt", "errorMessage", "id", "isConnected", "lastSync", "propertiesCount", "syncStatus", "updatedAt" FROM "hubspot_settings";
DROP TABLE "hubspot_settings";
ALTER TABLE "new_hubspot_settings" RENAME TO "hubspot_settings";
CREATE UNIQUE INDEX "hubspot_settings_integrationId_key" ON "hubspot_settings"("integrationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "integration_settings_organizationSecret_key" ON "integration_settings"("organizationSecret");
