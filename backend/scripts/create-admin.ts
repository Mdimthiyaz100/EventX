import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase() || "admin@eventx.com";
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || "Admin@EventX2026!";
  const name = "Mohamed Imthiyaz";

  console.log(`Creating / verifying admin account for: ${email}`);

  const existing = await prisma.user.findUnique({ where: { email } });
  const passwordHash = await bcrypt.hash(password, 12);

  if (existing) {
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: {
        name,
        role: UserRole.ADMIN,
        passwordHash,
      },
    });
    console.log(`Admin account updated successfully: ${updated.email} (ID: ${updated.id})`);
  } else {
    const created = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: UserRole.ADMIN,
        organizerApproved: true,
      },
    });
    console.log(`Admin account created successfully: ${created.email} (ID: ${created.id})`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed to create admin:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
