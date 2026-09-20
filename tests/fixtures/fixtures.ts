import {
  APIRequestContext,
  test as base,
  request as APIRequest,
} from "@playwright/test";
import {
  readFile,
  saveToFile,
} from "../utils/utils";
import {
  getAdminUser,
  buildWorkerUser,
} from "../utils/user-utils";
import { resolve } from "node:path";
import { RegisterUserResponse } from "../types/auth/auth";

type StoredTokens = {
  access_token: string;
  refresh_token: string;
};

type BaseFixture = {
  regularUserRequest: APIRequestContext;
  regularUser: RegisterUserResponse;
  nonAuthRequest: APIRequestContext;
  adminRequest: APIRequestContext;
};

export const test = base.extend<BaseFixture>({
  regularUserRequest: async ({ request }, use, workerInfo) => {
    const { tokens } = await getWorkerAuth(request, workerInfo.parallelIndex);
    const authenticatedRequest = await APIRequest.newContext({
      baseURL: workerInfo.project.use.baseURL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    try {
      await use(authenticatedRequest);
    } finally {
      await authenticatedRequest.dispose();
    }
  },
  regularUser: async ({ regularUserRequest }, use) => {
    const response = await regularUserRequest.get("/api/oauth/userinfo", {
      failOnStatusCode: true,
    });
    await use((await response.json()) as RegisterUserResponse);
  },
  nonAuthRequest: async ({ request }, use) => {
    const nonAuthenticatedRequest = await APIRequest.newContext({
      baseURL: process.env.BASE_URL,
    });

    await use(nonAuthenticatedRequest);
  },
  adminRequest: async ({ request }, use, workerInfo) => {
    const admin = getAdminUser();
    const tokens = await getToken(
      request,
      admin.email,
      admin.password,
    );
    const adminRequest = await APIRequest.newContext({
      baseURL: workerInfo.project.use.baseURL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    try {
      await use(adminRequest);
    } finally {
      await adminRequest.dispose();
    }
  },
});

async function getWorkerAuth(
  request: APIRequestContext,
  parallelIndex: number,
): Promise<{ tokens: StoredTokens; user: RegisterUserResponse }> {
  const tokenFile = resolve(
    process.cwd(),
    "tests/file_storage",
    `worker-${parallelIndex}.token`,
  );

  try {
    const stored = JSON.parse(await readFile(tokenFile)) as StoredTokens;
    const user = await getUserForToken(request, stored.access_token);

    if (user) {
      return { tokens: stored, user };
    }

    const refreshedTokens = await refreshTokens(request, stored.refresh_token);
    if (refreshedTokens) {
      const refreshedUser = await getUserForToken(
        request,
        refreshedTokens.access_token,
      );
      if (refreshedUser) {
        await saveTokens(tokenFile, refreshedTokens);
        return { tokens: refreshedTokens, user: refreshedUser };
      }
    }
  } catch {
    console.log(`No reusable token found for worker ${parallelIndex}`);
  }

  const workerUser = buildWorkerUser(parallelIndex);
  const createResponse = await request.post("/api/auth/register", {
    data: workerUser,
    failOnStatusCode: true,
  });
  const user = (await createResponse.json()) as RegisterUserResponse;
  const tokens = await getNewToken(
    request,
    workerUser.email,
    workerUser.password,
  );

  await saveTokens(tokenFile, tokens);
  return { tokens, user };
}

async function getUserForToken(
  request: APIRequestContext,
  token: string,
): Promise<RegisterUserResponse | null> {
  if (!token) return null;

  const response = await request.get("/api/oauth/userinfo", {
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  });

  return response.ok()
    ? ((await response.json()) as RegisterUserResponse)
    : null;
}

//read token from file -> check if token still valid
async function getToken(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<StoredTokens> {
  //get first part part from email and use it as file name for token storage regularuser1@gmail -> regularuser1
  const tokenFileName = email
    .split("@", 1)[0]
    .replace(/[^a-zA-Z0-9_-]/g, "_");
  const tokenFile = resolve(
    process.cwd(),
    "tests/file_storage",
    `${tokenFileName}.token`,
  );
  let tokens: StoredTokens | undefined;

  try {
    console.log("reading existing token");
    tokens = JSON.parse(await readFile(tokenFile)) as StoredTokens;
  } catch {
    console.log("saved tokens were not found");
  }

  if (tokens) {
    console.log("checking existing token");
    const isValid = await isTokenValid(request, tokens.access_token);

    if (isValid) {
      console.log("existing token is valid");
      return tokens;
    }

    console.log("access token is invalid, refreshing tokens");
    const refreshedTokens = await refreshTokens(request, tokens.refresh_token);

    if (refreshedTokens) {
      await saveTokens(tokenFile, refreshedTokens);
      return refreshedTokens;
    }

    console.log("refresh token is invalid, logging in again");
  }

  const newTokens = await getNewToken(request, email, password);
  await saveTokens(tokenFile, newTokens);
  return newTokens;
}

//check if token from file is valid
async function isTokenValid(request: APIRequestContext, token: string) {
  if (!token) return false;

  const response = await request.get("/api/oauth/userinfo", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    failOnStatusCode: false,
  });

  return response.ok();
}

//get new tokens for a specific user
async function getNewToken(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<StoredTokens> {
  console.log("getting new token");
  const response = await request.post("/api/oauth/token", {
    data: {
      grant_type: "password",
      email,
      password,
    },
    failOnStatusCode: true,
  });

  return parseTokens(await response.json());
}

//exchange a refresh token for a rotated token pair
async function refreshTokens(
  request: APIRequestContext,
  refreshToken: string,
): Promise<StoredTokens | null> {
  if (!refreshToken) return null;

  const response = await request.post("/api/oauth/token", {
    data: {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    },
    failOnStatusCode: false,
  });

  if (response.status() === 401) return null;

  if (!response.ok()) {
    throw new Error(
      `Token refresh failed with status ${response.status()}: ${await response.text()}`,
    );
  }

  return parseTokens(await response.json());
}

async function saveTokens(tokenFile: string, tokens: StoredTokens) {
  console.log(`saving new tokens to file ${tokenFile}`);
  await saveToFile(tokenFile, JSON.stringify(tokens, null, 2));
  console.log("tokens saved");
}

function parseTokens(json: unknown): StoredTokens {
  const { access_token, refresh_token } = json as Partial<StoredTokens>;

  if (typeof access_token !== "string" || typeof refresh_token !== "string") {
    throw new Error("OAuth response does not contain a valid token pair");
  }

  return { access_token, refresh_token };
}
