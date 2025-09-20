-- CreateTable
CREATE TABLE "twilio_settings" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "accountSid" TEXT NOT NULL,
    "authToken" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "replicaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "twilio_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "twilio_settings_integrationId_key" ON "twilio_settings"("integrationId");

-- AddForeignKey
ALTER TABLE "twilio_settings" ADD CONSTRAINT "twilio_settings_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "integration_settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
