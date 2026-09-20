import { expect } from "@playwright/test";
import { ApiController } from "../../app/controllers/ApiController";
import { test } from "../../fixtures/fixtures";
import {
  generateMinRequiredPost,
  generatePostWithData,
  generateRandomTag,
} from "../../utils/data-generators";
import { postSchema } from "../../app/schemas/post.schema";

test.describe("Posts: Admin can update a post", { tag: "@Posts" }, () => {
  test("admin user can update a post", async ({ adminRequest }) => {
    // Arrange
    const adminApi = new ApiController(adminRequest);
    const postData = generateMinRequiredPost(10);

    const createdTags = await test.step(
      "Create tags for the updated post",
      async () =>
        Promise.all(
          [generateRandomTag(), generateRandomTag()].map(async (tag) => {
            const response = await adminApi.tagController.createTag(tag, {
              failOnStatusCode: true,
            });
            return response.json;
          }),
        ),
    );
    const tagIds = createdTags.map((tag) => tag.id);
    const updatedPostData = generatePostWithData(10, true, tagIds);

    // Act
    const createdPostResponse = await test.step(
      "Create a post to update",
      async () =>
        adminApi.postController.createPost(postData, {
          failOnStatusCode: true,
        }),
    );
    const postId = createdPostResponse.json.id;

    const updatedPostResponse = await test.step(
      "Update and publish the post",
      async () =>
        adminApi.postController.updatePost(postId, updatedPostData, {
          failOnStatusCode: true,
        }),
    );

    const { fetchedPost, allPostsResponse } = await test.step(
      "Fetch the updated post from the published posts list",
      async () => {
        const allPostsResponse = await adminApi.postController.getAllPosts({
          failOnStatusCode: true,
        });
        return {
          fetchedPost: allPostsResponse.json.find((post) => post.id === postId),
          allPostsResponse,
        };
      },
    );

    // Assert
    const expectedUpdatedPost = {
      id: postId,
      title: updatedPostData.title,
      excerpt: updatedPostData.excerpt,
      content: updatedPostData.content,
      imageUrl: updatedPostData.imageUrl,
      isPublished: true,
    };

    const expectedTagIds = createdTags.map((tag) => tag.id).sort();

    await test.step("Verify the post fields and tags were updated", async () => {
      expect(createdPostResponse.response.status()).toBe(201);
      expect(updatedPostResponse.response.status()).toBe(200);
      expect(allPostsResponse.response.status()).toBe(200);
      expect(updatedPostResponse.json).toMatchObject(expectedUpdatedPost);
      expect(fetchedPost).toMatchObject(expectedUpdatedPost);
      expect(updatedPostResponse.json.tags.map((tag) => tag.id).sort()).toEqual(
        expectedTagIds,
      );
      expect(fetchedPost?.tags.map((tag) => tag.id).sort()).toEqual(
        expectedTagIds,
      );
    });

    await test.step("Verify updated post matches schema", async () => {
      expect(postSchema.safeParse(updatedPostResponse.json).success).toBe(true);
      expect(postSchema.safeParse(fetchedPost).success).toBe(true);
    });
  });
});

test.describe(
  "Posts: Non-admin user cannot update a post",
  { tag: "@Posts" },
  () => {
    test("regular user cannot update a post", async ({
      adminRequest,
      regularUserRequest,
    }) => {
      // Arrange
      const adminApi = new ApiController(adminRequest);
      const regularUserApi = new ApiController(regularUserRequest);
      const postData = generateMinRequiredPost(10);
      const updatedPostData = generatePostWithData(10, true);

      const createdPostResponse = await test.step(
        "Create a post as admin",
        async () =>
          adminApi.postController.createPost(postData, {
            failOnStatusCode: true,
          }),
      );

      // Act
      const updatedPostResponse = await test.step(
        "Attempt to update the post as a regular user",
        async () =>
          regularUserApi.postController.updatePost(
            createdPostResponse.json.id,
            updatedPostData,
            { failOnStatusCode: false },
          ),
      );

      // Assert
      await test.step("Verify the update is forbidden", async () => {
        expect(updatedPostResponse.response.status()).toBe(403);
      });
    });
  },
);
