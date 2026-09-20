import { APIResponse } from "@playwright/test";
import { BaseController } from "./BaseController";
import { Chapter, DeleteChapterResponse, UpdateChapterRequest } from "../../types/chapters/chapter";

export class ChapterController extends BaseController {
  coursesEndpoint = "/api/courses";

  async addChapterToCourse(
    courseId: string,
    title: string,
    options?: { failOnStatusCode?: boolean },
  ): Promise<{
    response: APIResponse;
    json: Chapter;
  }> {
    const response = await this.request.post(
      this.coursesEndpoint + "/" + courseId + "/chapters",
      {
        data: { title },
        failOnStatusCode: options?.failOnStatusCode,
      },
    );
    const json = await response.json();
    return { response, json };
  }

  async updateChapter(
    courseId: string,
    chapterId: string,
    updatedChapter: UpdateChapterRequest,
    options?: { failOnStatusCode?: boolean },
  ): Promise<{
    response: APIResponse;
    json: Chapter;
  }> {
    const response = await this.request.patch(
      `${this.coursesEndpoint}/${courseId}/chapters/${chapterId}`,
      {
        data: updatedChapter,
        failOnStatusCode: options?.failOnStatusCode,
      },
    );
    const json = await response.json();
    return { response, json };
  }

  async deleteChapter(
    courseId: string,
    chapterId: string,
    options?: { failOnStatusCode?: boolean },
  ): Promise<{
    response: APIResponse;
    json: DeleteChapterResponse;
  }> {
    const response = await this.request.delete(
      `${this.coursesEndpoint}/${courseId}/chapters/${chapterId}`,
      {
        failOnStatusCode: options?.failOnStatusCode,
      },
    );
    const json = await response.json();
    return { response, json };
  }
}
