import { expect } from "@playwright/test";
import { ApiController } from "../../app/controllers/ApiController";
import { test } from "../../fixtures/fixtures";
import { UpdateCourseRequest } from "../../types/courses/course";
import {
  generateRandomChapter,
  generateRandomCourse,
  generateRandomUpdatedCourse,
} from "../../utils/data-generators";

type PublishValidationCase = {
  title: string;
  transformCourse: (course: UpdateCourseRequest) => UpdateCourseRequest;
  addPublishedChapter: boolean;
  expectedError: string;
};

const missingRequiredData: PublishValidationCase[] = [
  {
    title: "course cannot be published without a title",
    transformCourse: (course) => ({ ...course, title: "" }),
    addPublishedChapter: true,
    expectedError: "Missing required fields (title, description, image, price)",
  },
  {
    title: "course cannot be published without a description",
    transformCourse: ({ description: _description, ...course }) => course,
    addPublishedChapter: true,
    expectedError: "Missing required fields (title, description, image, price)",
  },
  {
    title: "course cannot be published without an image",
    transformCourse: ({ imageUrl: _imageUrl, ...course }) => course,
    addPublishedChapter: true,
    expectedError: "Missing required fields (title, description, image, price)",
  },
  {
    title: "course cannot be published without a price",
    transformCourse: ({ price: _price, ...course }) => course,
    addPublishedChapter: true,
    expectedError: "Missing required fields (title, description, image, price)",
  },
  {
    title: "course cannot be published without a published chapter",
    transformCourse: (course) => course,
    addPublishedChapter: false,
    expectedError: "At least one published chapter is required",
  },
];

async function prepareCourseForPublishing(
  adminApi: ApiController,
  transformCourse: (course: UpdateCourseRequest) => UpdateCourseRequest,
  addPublishedChapter: boolean,
) {
  const createdCourseResponse = await adminApi.courseController.createCourse(
    generateRandomCourse(15),
    { failOnStatusCode: true },
  );
  const courseId = createdCourseResponse.json.id;

  await adminApi.courseController.updateCourse(
    courseId,
    transformCourse(generateRandomUpdatedCourse()),
    { failOnStatusCode: true },
  );

  if (addPublishedChapter) {
    const chapter = generateRandomChapter();
    const createdChapterResponse =
      await adminApi.chapterController.addChapterToCourse(
        courseId,
        chapter.title,
        { failOnStatusCode: true },
      );

    await adminApi.chapterController.updateChapter(
      courseId,
      createdChapterResponse.json.id,
      { isPublished: true },
      { failOnStatusCode: true },
    );
  }

  return courseId;
}

test.describe(
  "Courses: Course publishing validation",
  { tag: "@Courses" },
  () => {
    missingRequiredData.forEach(
      ({ title, transformCourse, addPublishedChapter, expectedError }) => {
        test(title, async ({ adminRequest }) => {
          // Arrange
          const adminApi = new ApiController(adminRequest);
          const courseId = await prepareCourseForPublishing(
            adminApi,
            transformCourse,
            addPublishedChapter,
          );

          // Act
          const { publishResponse, fetchedCourseResponse } = await test.step(
            "Attempt publishing and fetch the course",
            async () => {
              const publishResponse =
                await adminApi.courseController.publishCourse(courseId, {
                  failOnStatusCode: false,
                });
              const fetchedCourseResponse =
                await adminApi.courseController.getCourseById(courseId, {
                  failOnStatusCode: true,
                });
              return { publishResponse, fetchedCourseResponse };
            },
          );

          // Assert
          await test.step("Verify publishing is rejected", async () => {
            expect(publishResponse.response.status()).toBe(400);
            const errorBody = (await publishResponse.response.json()) as {
              error: string;
            };
            expect(errorBody.error).toBe(expectedError);
            expect(fetchedCourseResponse.json.isPublished).toBe(false);
          });
        });
      },
    );

    test("regular customer cannot publish a course", async ({
      adminRequest,
      regularUserRequest,
    }) => {
      // Arrange
      const adminApi = new ApiController(adminRequest);
      const customerApi = new ApiController(regularUserRequest);
      const courseId = await prepareCourseForPublishing(
        adminApi,
        (course) => course,
        true,
      );

      // Act
      const publishResponse = await test.step(
        "Attempt to publish as a regular customer",
        async () =>
          customerApi.courseController.publishCourse(courseId, {
            failOnStatusCode: false,
          }),
      );

      // Assert
      await test.step("Verify publishing is forbidden for a customer", async () => {
        expect(publishResponse.response.status()).toBe(403);
        const errorBody = (await publishResponse.response.json());
        expect(errorBody.error).toBe("Forbidden");
      });
    });
  },
);
