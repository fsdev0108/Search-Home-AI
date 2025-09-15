-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "domain" TEXT,
    "sensayId" TEXT,
    "settings" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "password" TEXT,
    "sensayId" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "replicas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "greeting" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'character',
    "ownerID" TEXT NOT NULL,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "profileImage" TEXT,
    "suggestedQuestions" TEXT NOT NULL,
    "llm" TEXT NOT NULL,
    "voicePreviewText" TEXT NOT NULL,
    "isAccessibleByCustomerSupport" BOOLEAN NOT NULL DEFAULT true,
    "isEveryConversationAccessibleBySupport" BOOLEAN NOT NULL DEFAULT true,
    "isPrivateConversationsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "introductionAudioID" TEXT,
    "sensayId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "replicas_ownerID_fkey" FOREIGN KEY ("ownerID") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "location" TEXT NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "area" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "metadata" TEXT NOT NULL,
    "lastSync" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "data_connectors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastSync" DATETIME,
    "syncCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "upload_schedules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "replicaId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "lastUpload" DATETIME,
    "nextUpload" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "upload_schedules_replicaId_fkey" FOREIGN KEY ("replicaId") REFERENCES "replicas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "file_uploads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "replicaId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "knowledgeBaseId" INTEGER,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending'
);

-- CreateTable
CREATE TABLE "hubspot_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "isConnected" BOOLEAN NOT NULL DEFAULT false,
    "lastSync" DATETIME,
    "propertiesCount" INTEGER NOT NULL DEFAULT 0,
    "syncStatus" TEXT NOT NULL DEFAULT 'idle',
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "hubspot_settings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "knowledge_base_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "replicaId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "filename" TEXT,
    "url" TEXT,
    "autoRefresh" BOOLEAN NOT NULL DEFAULT false,
    "sensayEntryId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "knowledge_base_entries_replicaId_fkey" FOREIGN KEY ("replicaId") REFERENCES "replicas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "replicas_slug_key" ON "replicas"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "hubspot_settings_organizationId_key" ON "hubspot_settings"("organizationId");
