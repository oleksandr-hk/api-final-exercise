import { request, type FullConfig } from "@playwright/test";
import { generateRandomAlphabeticalString } from "./tests/utils/data-generators";

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL;

  if (!baseURL) {
    throw new Error("Playwright baseURL is not configured");
  }

  const apiRequest = await request.newContext({ baseURL });

  try {
    await apiRequest.post("/api/auth/register", {
      failOnStatusCode: true,
      data: {
        name: "John Doe",
        email: generateRandomAlphabeticalString(10) + "@gmail.com",
        password: "Password1",
      },
    });
  } finally {
    await apiRequest.dispose();
  }
}

export default globalSetup;
