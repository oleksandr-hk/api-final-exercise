import { expect } from "@playwright/test";
import { test } from "../../fixtures/fixtures";
import { ApiController } from "../../app/controllers/ApiController";
import {
  generateRandomCourse,
  generateRandomUpdatedCourse,
} from "../../utils/data-generators";
import { courseSchema } from "../../app/schemas/course.schema";

test.describe("Courses: Admin can update course", { tag: "@Courses" }, () => {
  test("admin user can update course", async ({ adminRequest }) => {
    //arrange
    const courseTitleLength = 15;
    const adminApi = new ApiController(adminRequest);
    const randomCourse = generateRandomCourse(courseTitleLength);
    const updatedCourse = generateRandomUpdatedCourse();

    //act
    const { createdCourseId, updateCourseResponse, fetchedCourseResponse } = await test.step(
      "Create, update, and fetch the course",
      async () => {
        const createdCourseResponse =
          await adminApi.courseController.createCourse(randomCourse, {
            failOnStatusCode: true,
          });
        const createdCourseId = createdCourseResponse.json.id;
        const updateCourseResponse =
          await adminApi.courseController.updateCourse(
            createdCourseId,
            updatedCourse,
            { failOnStatusCode: true },
          );
        const fetchedCourseResponse =
          await adminApi.courseController.getCourseById(createdCourseId);
        return {
          createdCourseId,
          updateCourseResponse,
          fetchedCourseResponse,
        };
      },
    );

    //assert
    expect(updateCourseResponse.response.status()).toBe(200);
    expect(fetchedCourseResponse.response.status()).toBe(200);
    const updateCourse = updateCourseResponse.json;
    const fetchedCourse = fetchedCourseResponse.json;
    const expectedUpdatedCourse = {
      id: createdCourseId,
      title: updatedCourse.title,
      description: updatedCourse.description,
      imageUrl: updatedCourse.imageUrl,
      price: updatedCourse.price?.toString(),
      outcomes: JSON.stringify(updatedCourse.outcomes),
      requirements: JSON.stringify(updatedCourse.requirements),
      authorName: updatedCourse.authorName,
      authorRole: updatedCourse.authorRole,
    };

    expect(updateCourse).toMatchObject(expectedUpdatedCourse);
    expect(fetchedCourse).toMatchObject(expectedUpdatedCourse);

    await test.step("Verify updated course matches schema", async () => {
      expect(courseSchema.safeParse(updateCourse).success).toBe(true);
      expect(courseSchema.safeParse(fetchedCourse).success).toBe(true);
    });
  });
});

test.describe(
  "Courses: Non admin user can't update a course",
  { tag: "@Courses" },
  () => {
    test("Regular user can't update course", async ({
      regularUserRequest,
      adminRequest,
    }) => {
      //arrange
      const courseTitleLength = 15;
      const adminApi = new ApiController(adminRequest);
      const regularUserApi = new ApiController(regularUserRequest);

      const randomCourse = generateRandomCourse(courseTitleLength);
      const updatedCourse = generateRandomUpdatedCourse();

      //act
      const updateCourseResponse = await test.step(
        "Create a course and attempt an update as a regular user",
        async () => {
          const createdCourseResponse =
            await adminApi.courseController.createCourse(randomCourse, {
              failOnStatusCode: true,
            });
          return regularUserApi.courseController.updateCourse(
            createdCourseResponse.json.id,
            updatedCourse,
            { failOnStatusCode: false },
          );
        },
      );

      //assert
      await test.step("Verify non-admin user can't update a course", async () => {
        expect(updateCourseResponse.response.status()).toBe(403);
      });
    });
  },
);
