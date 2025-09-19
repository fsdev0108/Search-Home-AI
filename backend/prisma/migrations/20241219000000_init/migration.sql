-- CreateTable
CREATE TABLE "integration_settings" (
    "id" TEXT NOT NULL,
    "organizationSecret" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "settings" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "sensayUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hubspot_settings" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "isConnected" BOOLEAN NOT NULL DEFAULT false,
    "lastSync" TIMESTAMP(3),
    "propertiesCount" INTEGER NOT NULL DEFAULT 0,
    "syncStatus" TEXT NOT NULL DEFAULT 'idle',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hubspot_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "replicaId" TEXT,
    "operation" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "details" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "integration_settings_organizationSecret_key" ON "integration_settings"("organizationSecret");

-- CreateIndex
CREATE UNIQUE INDEX "users_sensayUserId_key" ON "users"("sensayUserId");

-- CreateIndex
CREATE UNIQUE INDEX "hubspot_settings_integrationId_key" ON "hubspot_settings"("integrationId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "integration_settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hubspot_settings" ADD CONSTRAINT "hubspot_settings_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "integration_settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "integration_settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
