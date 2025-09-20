-- Create twilio_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS "twilio_settings" (
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

-- Create unique index if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS "twilio_settings_integrationId_key" ON "twilio_settings"("integrationId");

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'twilio_settings_integrationId_fkey'
    ) THEN
        ALTER TABLE "twilio_settings" ADD CONSTRAINT "twilio_settings_integrationId_fkey" 
        FOREIGN KEY ("integrationId") REFERENCES "integration_settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
