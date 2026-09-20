import { expect } from "@playwright/test";
import { ApiController } from "../../app/controllers/ApiController";
import { test } from "../../fixtures/fixtures";
import { generatePostWithData } from "../../utils/data-generators";

test.describe("Posts: Admin can delete a post", { tag: "@Posts" }, () => {
  test("admin user can delete a post", async ({ adminRequest }) => {
    // Arrange
    const adminApi = new ApiController(adminRequest);
    const postData = generatePostWithData(10, true);

    const createdPost = await test.step(
      "Create a published post",
      async () => {
        const response = await adminApi.postController.createPost(postData, {
          failOnStatusCode: true,
        });
        return response.json;
      },
    );

    // Act
    const deletedPostResponse = await test.step("Delete the post", async () =>
      adminApi.postController.deletePost(createdPost.id, {
        failOnStatusCode: true,
      }),
    );

    // Assert
    await test.step("Verify the post was deleted", async () => {
      expect(deletedPostResponse.response.status()).toBe(200);
      expect(deletedPostResponse.json.success).toBe(true);

      const allPostsResponse = await adminApi.postController.getAllPosts({
        failOnStatusCode: true,
      });
      expect(allPostsResponse.response.status()).toBe(200);
      expect(
        allPostsResponse.json.find((post) => post.id === createdPost.id),
      ).toBeUndefined();
    });
  });
});

test.describe(
  "Posts: Non-admin users cannot delete a post",
  { tag: "@Posts" },
  () => {
    const authorizationCases = [
      {
        title: "regular user cannot delete a post",
        useRegularUser: true,
        expectedStatus: 403,
      },
      {
        title: "unauthenticated user cannot delete a post",
        useRegularUser: false,
        expectedStatus: 401,
      },
    ];

    authorizationCases.forEach(
      ({ title, useRegularUser, expectedStatus }) => {
        test(title, async ({
          adminRequest,
          regularUserRequest,
          nonAuthRequest,
        }) => {
          // Arrange
          const adminApi = new ApiController(adminRequest);
          const unauthorizedApi = new ApiController(
            useRegularUser ? regularUserRequest : nonAuthRequest,
          );
          const postData = generatePostWithData(10, true);

          const createdPost = await test.step(
            "Create a published post as admin",
            async () => {
              const response = await adminApi.postController.createPost(
                postData,
                { failOnStatusCode: true },
              );
              return response.json;
            },
          );

          // Act
          const deletedPostResponse = await test.step(
            "Attempt to delete the post without admin access",
            async () =>
              unauthorizedApi.postController.deletePost(createdPost.id, {
                failOnStatusCode: false,
              }),
          );

          // Assert
          await test.step("Verify deletion was rejected", async () => {
            expect(deletedPostResponse.response.status()).toBe(expectedStatus);

            const allPostsResponse = await adminApi.postController.getAllPosts({
              failOnStatusCode: true,
            });
            expect(allPostsResponse.response.status()).toBe(200);
            expect(
              allPostsResponse.json.find(
                (post) => post.id === createdPost.id,
              ),
            ).toBeDefined();
          });
        });
      },
    );
  },
);
