-- CreateTable
CREATE TABLE "telegram_settings" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "botToken" TEXT NOT NULL,
    "botUsername" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "replicaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telegram_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "telegram_settings_integrationId_key" ON "telegram_settings"("integrationId");

-- AddForeignKey
ALTER TABLE "telegram_settings" ADD CONSTRAINT "telegram_settings_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "integration_settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
