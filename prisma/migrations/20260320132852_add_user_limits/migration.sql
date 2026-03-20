-- CreateTable
CREATE TABLE "UserLimits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dailyTransferLimit" INTEGER NOT NULL DEFAULT 10000,
    "monthlyTransferLimit" INTEGER NOT NULL DEFAULT 100000,
    "dailyCardLimit" INTEGER NOT NULL DEFAULT 5000,
    "monthlyCardLimit" INTEGER NOT NULL DEFAULT 50000,
    "dailyAtmLimit" INTEGER NOT NULL DEFAULT 2000,
    "monthlyAtmLimit" INTEGER NOT NULL DEFAULT 20000,
    "dailyOnlineLimit" INTEGER NOT NULL DEFAULT 3000,
    "monthlyOnlineLimit" INTEGER NOT NULL DEFAULT 30000,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserLimits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UserLimits_userId_key" ON "UserLimits"("userId");
