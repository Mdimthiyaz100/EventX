import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function seedAdmin(): Promise<void> {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) {
    throw new Error(
      "Set BOOTSTRAP_ADMIN_EMAIL and a BOOTSTRAP_ADMIN_PASSWORD of at least 12 characters to seed an admin.",
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("The bootstrap admin email already exists; refusing to change an existing account's role.");
  }

  await prisma.user.create({
    data: {
      name: "EventX Admin",
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: UserRole.ADMIN,
      organizerApproved: false,
    },
  });
}

seedAdmin()
  .then(() => console.info("Bootstrap admin created. Remove the bootstrap credentials from the environment."))
  .catch((error: unknown) => {
    console.error("Failed to seed bootstrap admin", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());