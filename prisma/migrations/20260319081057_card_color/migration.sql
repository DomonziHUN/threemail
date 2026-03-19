-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Card" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "last4" TEXT NOT NULL,
    "expiryMonth" INTEGER NOT NULL,
    "expiryYear" INTEGER NOT NULL,
    "cvv" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "cardType" TEXT NOT NULL DEFAULT 'VIRTUAL',
    "color" TEXT NOT NULL DEFAULT 'green',
    "onlinePurchase" BOOLEAN NOT NULL DEFAULT true,
    "contactless" BOOLEAN NOT NULL DEFAULT true,
    "atmWithdrawal" BOOLEAN NOT NULL DEFAULT true,
    "dailyLimit" INTEGER NOT NULL DEFAULT 500000,
    "monthlyLimit" INTEGER NOT NULL DEFAULT 2000000,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Card_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Card" ("atmWithdrawal", "cardNumber", "cardType", "contactless", "createdAt", "cvv", "dailyLimit", "expiryMonth", "expiryYear", "id", "last4", "monthlyLimit", "onlinePurchase", "pin", "status", "userId") SELECT "atmWithdrawal", "cardNumber", "cardType", "contactless", "createdAt", "cvv", "dailyLimit", "expiryMonth", "expiryYear", "id", "last4", "monthlyLimit", "onlinePurchase", "pin", "status", "userId" FROM "Card";
DROP TABLE "Card";
ALTER TABLE "new_Card" RENAME TO "Card";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
