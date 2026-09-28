import assert from "node:assert/strict";
import test from "node:test";
import { comparePasswordHash, hashPassword, normalizeRole, signJwt, verifyJwt } from "./auth.js";

test("normalizeRole converts backend enums to frontend roles", () => {
  assert.equal(normalizeRole("STUDENT"), "student");
  assert.equal(normalizeRole("ADMIN"), "admin");
  assert.equal(normalizeRole("student"), "student");
});

test("password hashing and JWT round trip works", async () => {
  const password = "student123";
  const hashed = await hashPassword(password);
  assert.ok(hashed.length > 20);
  assert.equal(await comparePasswordHash(password, hashed), true);

  const token = signJwt({ id: "u-1", email: "student@exam.edu", role: "STUDENT" });
  const payload = verifyJwt(token);
  assert.equal(payload.email, "student@exam.edu");
  assert.equal(payload.role, "STUDENT");
});
