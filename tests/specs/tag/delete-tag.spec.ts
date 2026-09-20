import { APIRequestContext, expect } from "@playwright/test";
import { ApiController } from "../../app/controllers/ApiController";
import { test } from "../../fixtures/fixtures";
import { generateRandomTag } from "../../utils/data-generators";

test.describe("Tags: User can delete tag", { tag: "@Tags" }, () => {
  test("user can successfully delete tag", async ({ adminRequest }) => {
    // arrange
    const api = new ApiController(adminRequest);
    const generatedTag = generateRandomTag();

    //Act
    const { createdTag, deleteTagResponse, allTagsResponse } = await test.step(
      "Create, delete, and fetch tags",
      async () => {
        const createdTagResponse = await api.tagController.createTag(
          generatedTag,
          { failOnStatusCode: true },
        );
        const createdTag = createdTagResponse.json;
        const deleteTagResponse = await api.tagController.deleteTag(
          createdTag.id,
        );
        const allTagsResponse = await api.tagController.getAllTags();
        return {
          createdTag,
          deleteTagResponse,
          allTagsResponse,
        };
      },
    );

    // Assert
    await test.step("Verify tag was deleted and absent in tags list", async () => {
      expect(deleteTagResponse.response.status()).toBe(200);
      expect(allTagsResponse.response.status()).toBe(200);
      expect(deleteTagResponse.json).toMatchObject({
        success: true,
      });
      
      expect(
        allTagsResponse.json.filter(
          (tag) => tag.name == createdTag.name && tag.slug == createdTag.slug,
        ),
      ).toHaveLength(0);
    });
  });
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
    title: "unauthenticated user cannot delete a tag",
    getRequest: ({ nonAuthRequest }) => nonAuthRequest,
    expectedStatus: 401,
    expectedError: "Unauthorized",
  },
  {
    title: "regular user cannot delete a tag",
    getRequest: ({ regularUserRequest }) => regularUserRequest,
    expectedStatus: 403,
    expectedError: "Forbidden",
  },
];

test.describe("Tags: Delete tag authorization", { tag: "@Tags" }, () => {
  tagAuthorizationData.forEach(
    ({ title, getRequest, expectedStatus, expectedError }) => {
      test(title, async ({
        nonAuthRequest,
        regularUserRequest,
        adminRequest,
      }) => {
        // Arrange
        const tag = generateRandomTag();
        const request = getRequest({ nonAuthRequest, regularUserRequest });
        const adminApi = new ApiController(adminRequest);
        const unauthorizedApi = new ApiController(request);
        const createdTagResponse = await adminApi.tagController.createTag(tag, {
          failOnStatusCode: true,
        });
        const createdTag = createdTagResponse.json;

        // Act
        const { deleteTagResponse, allTagsResponse } = await test.step(
          "Attempt deletion and fetch the remaining tags",
          async () => {
            const deleteTagResponse =
              await unauthorizedApi.tagController.deleteTag(createdTag.id, {
                failOnStatusCode: false,
              });
            const allTagsResponse = await adminApi.tagController.getAllTags({
              failOnStatusCode: true,
            });
            return { deleteTagResponse, allTagsResponse };
          },
        );

        // Assert
        await test.step("Verify tag deletion is rejected", async () => {
          expect(deleteTagResponse.response.status()).toBe(expectedStatus);
          expect(allTagsResponse.response.status()).toBe(200);
          const errorBody = (await deleteTagResponse.response.json()) as {
            error: string;
          };
          expect(errorBody.error).toBe(expectedError);
          expect(
            allTagsResponse.json.some((existingTag) =>
              existingTag.id === createdTag.id,
            ),
          ).toBe(true);
        });

        await adminApi.tagController.deleteTag(createdTag.id, {
          failOnStatusCode: true,
        });
      });
    },
  );
});
