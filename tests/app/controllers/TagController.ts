import { BaseController } from "./BaseController";
import { APIResponse } from "@playwright/test";
import { CreateTagRequest, CreateTagResponse, TagsResponse } from "../../types/tags/tag";
import { SuccessResponse } from "../../types/courses/course";

export class TagController extends BaseController {
  tagsEndPoint = "/api/tags";

  async getAllTags(options?: { failOnStatusCode: boolean }): Promise<{
    response: APIResponse;
    json: TagsResponse;
  }> {
    const response = await this.request.get(this.tagsEndPoint, {
      failOnStatusCode: options?.failOnStatusCode,
    });
    const json = await response.json();
    return { response, json };
  }

  async createTag(
    tag: CreateTagRequest,
    options?: { failOnStatusCode: boolean },
  ): Promise<{
    response: APIResponse;
    json: CreateTagResponse;
  }> {
    const response = await this.request.post(this.tagsEndPoint, {
      data: tag,
      failOnStatusCode: options?.failOnStatusCode,
    });
    const json = await response.json();
    return { response, json };
  }

  async deleteTag(
    tagId: string,
    options?: { failOnStatusCode: boolean },
  ): Promise<{
    response: APIResponse;
    json: SuccessResponse;
  }> {
    const response = await this.request.delete(
      this.tagsEndPoint + `/${tagId}`,
      {
        failOnStatusCode: options?.failOnStatusCode,
      },
    );
    const json = await response.json();
    return { response, json };
  }
}
