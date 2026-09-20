import { APIRequestContext, expect } from "@playwright/test";
import { ApiController } from "../../app/controllers/ApiController";
import { test } from "../../fixtures/fixtures";
import {
  generateRandomAlphabeticalString,
  generateRandomTag,
} from "../../utils/data-generators";
import { tagSchema } from "../../app/schemas/tag.schema";

test.describe("Tags: User can create a tag", { tag: "@Tags" }, () => {
  test("user can successfully create tag", async ({ adminRequest }) => {
    // arrange
    const api = new ApiController(adminRequest);
    const generatedTag = generateRandomTag();

    //Act
    const { createdTagResponse, allTagsResponse } = await test.step(
      "Create the tag and fetch all tags",
      async () => {
        const createdTagResponse = await api.tagController.createTag(
          generatedTag,
          { failOnStatusCode: true },
        );
        const allTagsResponse = await api.tagController.getAllTags();
        return { createdTagResponse, allTagsResponse };
      },
    );
    const createdTag = createdTagResponse.json;
    const allTags = allTagsResponse.json;

    // Assert
    await test.step("Verify tag was created and present in tags list", async () => {
      expect(createdTagResponse.response.status()).toBe(201);
      expect(allTagsResponse.response.status()).toBe(200);
      expect(createdTag).toMatchObject({
        name: generatedTag.name,
      });

      expect(createdTag.id).toBeDefined();
      expect(createdTag.slug).toBeDefined();
      expect(tagSchema.safeParse(createdTag).success).toBe(true);

      expect(
        allTags.filter(
          (tag) => tag.name == createdTag.name && tag.slug == createdTag.slug,
        ),
      ).toHaveLength(1);
    });
  });
});

const invalidTagData = [
  {
    title: "tag name below the minimum length returns 400",
    generateTag: () => ({
      name: generateRandomAlphabeticalString(1),
    }),
    createTagBeforeTest: false,
    expectedStatus: 400,
    expectedError: "Name must be at least 2 characters",
  },
  {
    title: "an already-created tag returns 409",
    generateTag: () => generateRandomTag(),
    createTagBeforeTest: true,
    expectedStatus: 409,
    expectedError: "Tag already exists",
  },
];

test.describe("Tags: Create tag validation", { tag: "@Tags" }, () => {
  invalidTagData.forEach(
    ({
      title,
      generateTag,
      createTagBeforeTest,
      expectedStatus,
      expectedError,
    }) => {
      test(title, async ({ adminRequest }) => {
        // Arrange
        const api = new ApiController(adminRequest);
        const tag = generateTag();
        const existingTagResponse = createTagBeforeTest
          ? await api.tagController.createTag(tag, {
              failOnStatusCode: true,
            })
          : undefined;

        // Act
        const createdTagResponse = await test.step(
          "Attempt to create the invalid tag",
          async () =>
            api.tagController.createTag(tag, {
              failOnStatusCode: false,
            }),
        );

        // Assert
        await test.step("Verify tag creation is rejected", async () => {
          expect(createdTagResponse.response.status()).toBe(expectedStatus);
          const errorBody = (await createdTagResponse.response.json()) as {
            error: string;
          };
          expect(errorBody.error).toBe(expectedError);
        });

        if (existingTagResponse) {
          await api.tagController.deleteTag(existingTagResponse.json.id, {
            failOnStatusCode: true,
          });
        }
      });
    },
  );
});

type TagAuthorizationCase = {
  title: string;
  getRequest: (requests: {
    nonAuthRequest: APIRequestContext;
    regularUserRequest: APIRequestContext;
  }) => APIRequestContext;
  expectedStatus: number;
  expectedError: string;
};

const tagAuthorizationData: TagAuthorizationCase[] = [
  {
    title: "unauthenticated user cannot create a tag",
    getRequest: ({ nonAuthRequest }) => nonAuthRequest,
    expectedStatus: 401,
    expectedError: "Unauthorized",
  },
  {
    title: "regular user cannot create a tag",
    getRequest: ({ regularUserRequest }) => regularUserRequest,
    expectedStatus: 403,
    expectedError: "Forbidden",
  },
];

test.describe("Tags: Create tag authorization", { tag: "@Tags" }, () => {
  tagAuthorizationData.forEach(
    ({ title, getRequest, expectedStatus, expectedError }) => {
      test(title, async ({ nonAuthRequest, regularUserRequest }) => {
        // Arrange
        const tag = generateRandomTag();
        const request = getRequest({ nonAuthRequest, regularUserRequest });
        const api = new ApiController(request);

        // Act
        const { createdTagResponse, allTagsResponse } = await test.step(
          "Attempt creation and fetch all tags",
          async () => {
            const createdTagResponse = await api.tagController.createTag(tag, {
              failOnStatusCode: false,
            });
            const allTagsResponse = await api.tagController.getAllTags({
              failOnStatusCode: true,
            });
            return { createdTagResponse, allTagsResponse };
          },
        );

        // Assert
        await test.step("Verify tag creation is rejected", async () => {
          expect(createdTagResponse.response.status()).toBe(expectedStatus);
          expect(allTagsResponse.response.status()).toBe(200);
          const errorBody = (await createdTagResponse.response.json()) as {
            error: string;
          };
          expect(errorBody.error).toBe(expectedError);
          expect(
            allTagsResponse.json.some((existingTag) =>
              existingTag.name === tag.name,
            ),
          ).toBe(false);
        });
      });
    },
  );
});
