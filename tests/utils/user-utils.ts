import { TestUser } from "../test-data/users";
import { getRequiredEnv } from "./utils";

export function buildWorkerUser(parallelIndex: number): TestUser {
  const uniquePart = `${process.pid}-${Date.now()}`;

  return {
    name: `Playwright Worker ${parallelIndex}`,
    email: `playwright-worker-${parallelIndex}-${uniquePart}@dojo.test`,
    password: `Worker${parallelIndex}Password1`,
  };
}

export function getAdminUser(): TestUser {
  return {
    name: getRequiredEnv("ADMIN_NAME"),
    email: getRequiredEnv("ADMIN_EMAIL"),
    password: getRequiredEnv("ADMIN_PASSWORD"),
  };
}
