import { APIResponse } from "@playwright/test";
import {
  Course,
  CoursePaginated,
  CreateCourseRequest,
  SuccessResponse,
  UpdateCourseRequest,
} from "../../types/courses/course";
import { BaseController } from "./BaseController";

export class CourseController extends BaseController {
  coursesEndpoint = "/api/courses";

  async getAllCourses(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<{
    response: APIResponse;
    json: CoursePaginated;
  }> {
    const response = await this.request.get("/api/courses", {
      params,
    });

    const json = await response.json();

    return { response, json };
  }

  async createCourse(
    course: CreateCourseRequest,
    options?: { failOnStatusCode?: boolean },
  ): Promise<{
    response: APIResponse;
    json: Course;
  }> {
    const response = await this.request.post(this.coursesEndpoint, {
      data: course,
      failOnStatusCode: options?.failOnStatusCode,
    });
    const json = await response.json();
    return { response, json };
  }

  async getCourseById(
    courseId: string,
    options?: { failOnStatusCode?: boolean },
  ): Promise<{
    response: APIResponse;
    json: Course;
  }> {
    const response = await this.request.get(
      `${this.coursesEndpoint}/${courseId}`,
      {
        failOnStatusCode: options?.failOnStatusCode,
      },
    );
    const json = await response.json();
    return { response, json };
  }

  async updateCourse(
    courseId: string,
    course: UpdateCourseRequest,
    options?: { failOnStatusCode?: boolean },
  ): Promise<{
    response: APIResponse;
    json: Course;
  }> {
    const response = await this.request.patch(
      `${this.coursesEndpoint}/${courseId}`,
      { data: course, failOnStatusCode: options?.failOnStatusCode },
    );
    const json = await response.json();
    return { response, json };
  }

  async deleteCourse(
    courseId: string,
    options?: { failOnStatusCode?: boolean },
  ): Promise<{
    response: APIResponse;
    json: SuccessResponse;
  }> {
    const response = await this.request.delete(
      `${this.coursesEndpoint}/${courseId}`,
      { failOnStatusCode: options?.failOnStatusCode },
    );
    const json = await response.json();
    return { response, json };
  }

  async publishCourse(
    courseId: string,
    options?: { failOnStatusCode?: boolean },
  ): Promise<{
    response: APIResponse;
    json: Course;
  }> {
    const response = await this.request.patch(
      `${this.coursesEndpoint}/${courseId}/publish`,
      { failOnStatusCode: options?.failOnStatusCode },
    );
    const json = await response.json();
    return { response, json };
  }
}
