import { APIResponse } from "@playwright/test";
import { BaseController } from "./BaseController";
import {
  CreatePostRequest,
  CreatePostResponse,
  PostsResponse,
  UpdatePostRequest,
} from "../../types/posts/post";
import { SuccessResponse } from "../../types/courses/course";

export class PostController extends BaseController {
  postEndPoint = "/api/posts";

  async getAllPosts(options?: { failOnStatusCode: boolean }): Promise<{
    response: APIResponse;
    json: PostsResponse;
  }> {
    const response = await this.request.get(this.postEndPoint, {
      failOnStatusCode: options?.failOnStatusCode,
    });
    const json = await response.json();
    return { response, json };
  }

  async createPost(
    post: Partial<CreatePostRequest>,
    options?: { failOnStatusCode: boolean },
  ): Promise<{
    response: APIResponse;
    json: CreatePostResponse;
  }> {
    const response = await this.request.post(this.postEndPoint, {
      data: post,
      failOnStatusCode: options?.failOnStatusCode,
    });
    const json = await response.json();
    return { response, json };
  }

  async updatePost(
    postId: string,
    post: UpdatePostRequest,
    options?: { failOnStatusCode: boolean },
  ): Promise<{
    response: APIResponse;
    json: CreatePostResponse;
  }> {
    const response = await this.request.patch(
      this.postEndPoint + `/${postId}`,
      {
        data: post,
        failOnStatusCode: options?.failOnStatusCode,
      },
    );
    const json = await response.json();
    return { response, json };
  }

  async deletePost(
    postId: string,
    options?: { failOnStatusCode: boolean },
  ): Promise<{
    response: APIResponse;
    json: SuccessResponse;
  }> {
    const response = await this.request.delete(
      this.postEndPoint + `/${postId}`,
      {
        failOnStatusCode: options?.failOnStatusCode,
      },
    );
    const json = await response.json();
    return { response, json };
  }
}
