-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "balanceHuf" INTEGER NOT NULL DEFAULT 0,
    "referralCode" TEXT NOT NULL,
    "paymentReference" TEXT NOT NULL,
    "referredById" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "kycStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("balanceHuf", "createdAt", "email", "fullName", "id", "passwordHash", "paymentReference", "phone", "referralCode", "referredById", "role", "updatedAt") SELECT "balanceHuf", "createdAt", "email", "fullName", "id", "passwordHash", "paymentReference", "phone", "referralCode", "referredById", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
CREATE UNIQUE INDEX "User_paymentReference_key" ON "User"("paymentReference");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
