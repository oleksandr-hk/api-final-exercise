import { promises } from "fs";
import { dirname } from "node:path";

export async function readFile(fileName: string) {
  return await promises.readFile(fileName, { encoding: "utf-8" });
}

export async function saveToFile(fileName: string, content: string) {
  await promises.mkdir(dirname(fileName), { recursive: true });
  await promises.writeFile(fileName, content, { encoding: "utf-8" });
}

export function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }

  return value;
}
