import { UserRole } from "@prisma/client";
import { prisma } from "../config/database.js";
import { AppError } from "../utils/http.js";

export async function listOrganizers(page: number, limit: number) {
  const where = { role: UserRole.ORGANIZER };
  const [total, organizers] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        organizerApproved: true,
        createdAt: true,
      },
    }),
  ]);
  return {
    organizers,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function setOrganizerApproval(userId: string, approved: boolean) {
  const result = await prisma.user.updateMany({
    where: { id: userId, role: UserRole.ORGANIZER },
    data: { organizerApproved: approved },
  });
  if (!result.count) throw new AppError(404, "ORGANIZER_NOT_FOUND", "Organizer not found.");
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, organizerApproved: true },
  });
}
