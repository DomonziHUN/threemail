import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@threemail.hu" },
    update: {},
    create: {
      email: "admin@threemail.hu",
      passwordHash: adminPassword,
      fullName: "Admin User",
      phone: "+36301234567",
      balanceHuf: 1000000,
      referralCode: "TM-ADMIN1",
      paymentReference: "TM-USR-00000001",
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user created:", admin.email);

  // Create test user
  const testPassword = await bcrypt.hash("Test123!", 12);
  const testUser = await prisma.user.upsert({
    where: { email: "test@threemail.hu" },
    update: {},
    create: {
      email: "test@threemail.hu",
      passwordHash: testPassword,
      fullName: "Teszt Felhasználó",
      phone: "+36307654321",
      balanceHuf: 50000,
      referralCode: "TM-TEST01",
      paymentReference: "TM-USR-00000002",
      role: "USER",
    },
  });

  console.log("✅ Test user created:", testUser.email);

  // Create sample transactions for test user
  await prisma.transaction.createMany({
    data: [
      {
        userId: testUser.id,
        type: "DEPOSIT",
        amount: 50000,
        description: "Kezdő egyenleg",
        status: "COMPLETED",
      },
      {
        userId: testUser.id,
        type: "CARD_PAYMENT",
        amount: 5000,
        description: "Tesco Áruház",
        status: "COMPLETED",
      },
      {
        userId: testUser.id,
        type: "CARD_PAYMENT",
        amount: 2500,
        description: "Starbucks",
        status: "COMPLETED",
      },
    ],
  });

  console.log("✅ Sample transactions created");

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
