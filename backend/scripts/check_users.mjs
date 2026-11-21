import { prisma } from "../dist/src/config/database.js";

async function checkUsers() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, phone: true, role: true, organizerApproved: true },
  });
  console.log("Current DB Users count:", users.length);
  console.log(JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}

checkUsers().catch(async (e) => {
  console.error("Error:", e);
  await prisma.$disconnect();
  process.exit(1);
});
