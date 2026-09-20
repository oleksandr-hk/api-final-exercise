import { expect } from "@playwright/test";
import { ApiController } from "../../app/controllers/ApiController";
import { test } from "../../fixtures/fixtures";
import { learningPathSchema } from "../../app/schemas/learning-path.schema";
import {
  generateRandomAlphabeticalString,
  generateRandomInstructor,
} from "../../utils/data-generators";

const MIN_TITLE_LENGTH = 3;
const MAX_TITLE_LENGTH = 191;

test.describe(
  "Learning paths: Create learning path validation",
  { tag: "@Learning-path" },
  () => {
    test("title shorter than 3 characters returns 400", async ({
      adminRequest,
    }) => {
      const adminApi = new ApiController(adminRequest);

      const response = await adminApi.learningPathController.createLearningPath(
        {
          title: generateRandomAlphabeticalString(MIN_TITLE_LENGTH - 1),
          instructor: generateRandomInstructor(),
        },
        { failOnStatusCode: false },
      );

      expect(response.response.status()).toBe(400);
      expect(response.json).toHaveProperty(
        "error",
        "Title must be at least 3 characters",
      );
    });

    test("title with exactly 3 characters is accepted", async ({
      adminRequest,
    }) => {
      const adminApi = new ApiController(adminRequest);
      const title = generateRandomAlphabeticalString(MIN_TITLE_LENGTH);

      const response = await adminApi.learningPathController.createLearningPath(
        { title, instructor: generateRandomInstructor() },
        { failOnStatusCode: true },
      );

      expect(response.response.status()).toBe(201);
      expect(response.json).toMatchObject({ title });

      await test.step("Verify created learning path matches schema", async () => {
        const result = learningPathSchema.safeParse(response.json);
        expect(result.success).toBe(true);
      });
    });

    test("title with maximum 191 characters is accepted", async ({
      adminRequest,
    }) => {
      const adminApi = new ApiController(adminRequest);
      const title = generateRandomAlphabeticalString(MAX_TITLE_LENGTH);

      const response = await adminApi.learningPathController.createLearningPath(
        { title, instructor: generateRandomInstructor() },
        { failOnStatusCode: true },
      );

      expect(response.response.status()).toBe(201);
      expect(response.json).toMatchObject({ title });

      await test.step("Verify created learning path matches schema", async () => {
        const result = learningPathSchema.safeParse(response.json);
        expect(result.success).toBe(true);
      });
    });

    test("title longer than 191 characters returns 400", async ({
      adminRequest,
    }) => {
      const adminApi = new ApiController(adminRequest);

      const response = await adminApi.learningPathController.createLearningPath(
        {
          title: generateRandomAlphabeticalString(MAX_TITLE_LENGTH + 1),
          instructor: generateRandomInstructor(),
        },
        { failOnStatusCode: false },
      );

      expect(response.response.status()).toBe(400);
      expect(response.json).toHaveProperty(
        "error",
        "Title must not exceed 191 characters",
      );
    });

    test("missing instructor returns 400", async ({ adminRequest }) => {
      const adminApi = new ApiController(adminRequest);

      const response = await adminApi.learningPathController.createLearningPath(
        { title: generateRandomAlphabeticalString(10) },
        { failOnStatusCode: false },
      );

      expect(response.response.status()).toBe(400);
      expect(response.json).toHaveProperty(
        "error",
        "Instructor is required with at least a name",
      );
    });

    test("unauthenticated request returns 401", async ({ nonAuthRequest }) => {
      const nonAuthApi = new ApiController(nonAuthRequest);

      const response = await nonAuthApi.learningPathController.createLearningPath(
        {
          title: generateRandomAlphabeticalString(10),
          instructor: generateRandomInstructor(),
        },
        { failOnStatusCode: false },
      );

      expect(response.response.status()).toBe(401);
      expect(response.json).toHaveProperty("error", "Unauthorized");
    });

    test("regular user request returns 403", async ({ regularUserRequest }) => {
      const regularUserApi = new ApiController(regularUserRequest);

      const response =
        await regularUserApi.learningPathController.createLearningPath(
          {
            title: generateRandomAlphabeticalString(10),
            instructor: generateRandomInstructor(),
          },
          { failOnStatusCode: false },
        );

      expect(response.response.status()).toBe(403);
      expect(response.json).toHaveProperty("error", "Forbidden");
    });
  },
);
