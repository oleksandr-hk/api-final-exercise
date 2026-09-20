import { expect } from "@playwright/test";
import { ApiController } from "../../app/controllers/ApiController";
import { test } from "../../fixtures/fixtures";
import {
  generateMinRequiredPost,
  generateRandomAlphabeticalString,
} from "../../utils/data-generators";

test.describe(
  "Posts: Create post title validation",
  { tag: "@Posts" },
  () => {
    const invalidPostData = [
      {
        title: "title is missing",
        postData: {},
        expectedStatus: 400,
        expectedError: "Title must be at least 3 characters",
      },
      {
        title: "title is empty",
        postData: { title: "" },
        expectedStatus: 400,
        expectedError: "Title must be at least 3 characters",
      },
      {
        title: "title has 2 characters - lower boundary",
        postData: { title: generateRandomAlphabeticalString(2) },
        expectedStatus: 400,
        expectedError: "Title must be at least 3 characters",
      },
      {
        title: "title has 256 characters - above upper boundary",
        postData: { title: generateRandomAlphabeticalString(256) },
        expectedStatus: 400,
        expectedError: "Title must not exceed 255 characters",
      },
    ];

    invalidPostData.forEach(
      ({ title, postData, expectedStatus, expectedError }) => {
        test(title, async ({ adminRequest }) => {
          // Arrange
          const adminApi = new ApiController(adminRequest);

          // Act
          const createdPostResponse =
            await adminApi.postController.createPost(
              postData,
              { failOnStatusCode: false },
            );

          // Assert
          await test.step("Verify post creation validation error", async () => {
            expect(createdPostResponse.response.status()).toBe(expectedStatus);

            expect(createdPostResponse.json).toHaveProperty(
              "error",
              expectedError,
            );
          });
        });
      },
    );
  },
);

test.describe(
  "Posts: Non-admin user cannot create a post",
  { tag: "@Posts" },
  () => {
    test("regular user cannot create a new post", async ({
      regularUserRequest,
    }) => {
      // Arrange
      const regularUserApi = new ApiController(regularUserRequest);
      const postData = generateMinRequiredPost(10);

      // Act
      const response = await regularUserApi.postController.createPost(
        postData,
        { failOnStatusCode: false },
      );

      // Assert
      await test.step("Verify regular user cannot create a post", async () => {
        expect(response.response.status()).toBe(403);
      });
    });
  },
);
