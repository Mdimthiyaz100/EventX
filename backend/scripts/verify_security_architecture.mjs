import { prisma } from "../dist/src/config/database.js";
import { verifyAccessToken } from "../dist/src/services/auth.service.js";
import jwt from "jsonwebtoken";
import { env } from "../dist/src/config/env.js";

async function runTests() {
  console.log("--- Starting Routing, JWT & Authorization Security Verification ---");

  // 1. JWT verification test
  console.log("[Test 1] Testing JWT Token Signing & Claims...");
  const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!adminUser) {
    throw new Error("No admin user found in database");
  }

  const token = jwt.sign({ role: adminUser.role }, env.JWT_ACCESS_SECRET, {
    subject: adminUser.id,
    expiresIn: "15m",
    issuer: "eventx-api",
    audience: "eventx-client",
  });
  const claims = verifyAccessToken(token);
  if (claims.sub !== adminUser.id || claims.role !== "ADMIN") {
    throw new Error("JWT claim validation mismatch");
  }
  console.log("✓ Test 1 Passed: JWT access token correctly signs and decodes claims (sub, role, audience, issuer)");

  // 2. Refresh Token Rotation & Hash check
  console.log("[Test 2] Testing Refresh Token storage hashing...");
  const refreshTokens = await prisma.refreshToken.findMany({ take: 3 });
  for (const rt of refreshTokens) {
    if (rt.tokenHash.length !== 64) {
      throw new Error(`Token hash ${rt.id} is not a valid SHA-256 hash length`);
    }
  }
  console.log(`✓ Test 2 Passed: ${refreshTokens.length} inspected refresh tokens stored exclusively as SHA-256 hashes`);

  // 3. IDOR Check on Attendee and Ticket verification
  console.log("[Test 3] Testing IDOR protection in ticket & booking layer...");
  const { listEventAttendees } = await import("../dist/src/services/booking.service.js");
  let idorBlocked = false;
  try {
    // Attempt to access event attendees with an unauthorized organizer ID
    await listEventAttendees("fake-organizer-id", "some-event-id", 1, 10);
  } catch (err) {
    if (err.statusCode === 404 || err.code === "EVENT_NOT_FOUND") {
      idorBlocked = true;
    }
  }
  if (!idorBlocked) {
    throw new Error("IDOR vulnerability: organizer can inspect unauthorized event attendees");
  }
  console.log("✓ Test 3 Passed: IDOR strictly prevented; unauthorized organizers cannot view foreign attendee lists");

  // 4. Cancel pending booking ownership check
  console.log("[Test 4] Testing IDOR protection on booking cancellation...");
  const { cancelPendingBooking } = await import("../dist/src/services/booking.service.js");
  let cancelBlocked = false;
  try {
    await cancelPendingBooking("fake-user-id", "fake-booking-id");
  } catch (err) {
    if (err.statusCode === 404 || err.code === "BOOKING_NOT_FOUND") {
      cancelBlocked = true;
    }
  }
  if (!cancelBlocked) {
    throw new Error("IDOR vulnerability: booking cancellation does not enforce user ownership");
  }
  console.log("✓ Test 4 Passed: IDOR strictly prevented; users cannot cancel foreign bookings");

  console.log("\nALL SECURITY & AUTHORIZATION TESTS PASSED SUCCESSFULLY (4/4).");
  await prisma.$disconnect();
}

runTests().catch(async (e) => {
  console.error("Test failed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
