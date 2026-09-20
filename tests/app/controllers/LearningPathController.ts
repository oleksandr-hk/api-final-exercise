import { APIResponse } from "@playwright/test";
import { BaseController } from "./BaseController";
import {
  CreateLearningPathRequest,
  LearningPath,
} from "../../types/learning-path/path";

export class LearningPathController extends BaseController {
  learningPathsEndpoint = "/api/learning-paths";

  async createLearningPath(
    learningPath: Partial<CreateLearningPathRequest>,
    options?: { failOnStatusCode?: boolean },
  ): Promise<{
    response: APIResponse;
    json: LearningPath;
  }> {
    const response = await this.request.post(this.learningPathsEndpoint, {
      data: learningPath,
      failOnStatusCode: options?.failOnStatusCode,
    });
    const json = await response.json();
    return { response, json };
  }
}
