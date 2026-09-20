import { expect } from "@playwright/test";
import { test } from "../../fixtures/fixtures";
import { ApiController } from "../../app/controllers/ApiController";
import {
  generateMinRequiredPost,
  generatePostWithData,
} from "../../utils/data-generators";
import { postSchema } from "../../app/schemas/post.schema";

test.describe("Posts: Admin user can create a post", { tag: "@Posts" }, () => {
  test("admin user can create a new post with title only", async ({
    adminRequest,
  }) => {
    // arrange
    const adminApi = new ApiController(adminRequest);
    const randomPost = generateMinRequiredPost(10);

    //Act
    const { createdPostResponse, allPostsResponse } =
      await test.step("Create the post and fetch published posts", async () => {
        const createdPostResponse = await adminApi.postController.createPost(
          randomPost,
          { failOnStatusCode: true },
        );
        const allPostsResponse = await adminApi.postController.getAllPosts({
          failOnStatusCode: true,
        });
        return { createdPostResponse, allPostsResponse };
      });
    const createdPost = createdPostResponse.json;
    const allPosts = allPostsResponse.json;

    // Assert
    await test.step("Verify post was created", async () => {
      expect(createdPostResponse.response.status()).toBe(201);
      expect(createdPost).toMatchObject({
        title: randomPost.title,
      });
      //verify all required posts fields were created
      expect(createdPost.id).toBeDefined();
      expect(createdPost.isPublished).toEqual(false);
      expect(createdPost.createdAt).toBeDefined();
    });

    await test.step("Verify published posts API doesn't return created post ", async () => {
      expect(allPostsResponse.response.status()).toBe(200);
      expect(
        allPosts.find((post) => post.id === createdPost.id),
      ).toBeUndefined();
    });

    await test.step("Verify created post matches schema", async () => {
      const result = postSchema.safeParse(createdPost);
      expect(result.success).toBe(true);
    });
  });

  test("admin user can create a new post with with all post data", async ({
    adminRequest,
  }) => {
    // arrange
    const adminApi = new ApiController(adminRequest);
    const randomPost = generatePostWithData(10);

    //Act
    const { createdPostResponse, allPostsResponse } =
      await test.step("Create the post and fetch published posts", async () => {
        const createdPostResponse = await adminApi.postController.createPost(
          randomPost,
          { failOnStatusCode: true },
        );
        const allPostsResponse = await adminApi.postController.getAllPosts({
          failOnStatusCode: true,
        });
        return { createdPostResponse, allPostsResponse };
      });
    const createdPost = createdPostResponse.json;
    const allPosts = allPostsResponse.json;

    // Assert
    await test.step("Verify post was created", async () => {
      expect(createdPostResponse.response.status()).toBe(201);
      expect(createdPost).toMatchObject({
        title: randomPost.title,
        excerpt: randomPost.excerpt,
        content: randomPost.content,
        imageUrl: randomPost.imageUrl,
        tags: randomPost.tagIds, //
        isPublished: randomPost.isPublished,
      });
      //verify all required posts fields were create
      expect(createdPost.id).toBeDefined();
      expect(createdPost.createdAt).toBeDefined();
    });

    await test.step("Verify published posts API doesn't return created post ", async () => {
      expect(allPostsResponse.response.status()).toBe(200);
      expect(
        allPosts.find((post) => post.id === createdPost.id),
      ).toBeUndefined();
    });

    await test.step("Verify created post matches schema", async () => {
      const result = postSchema.safeParse(createdPost);
      expect(result.success).toBe(true);
    });
  });
});
