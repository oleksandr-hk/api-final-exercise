import { expect } from "@playwright/test";
import { ApiController } from "../../app/controllers/ApiController";
import { test } from "../../fixtures/fixtures";
import { CreateCourseRequest } from "../../types/courses/course";
import { generateRandomCourse } from "../../utils/data-generators";

test.describe(
  "Courses: Create course title validation",
  { tag: "@Courses" },
  () => {
    const invalidUserData = [
      {
        title: "title is missing",
        courseData: {},
        expectedStatus: 400,
        expectedError: "Title must be at least 3 characters",
      },
      {
        title: "title has an invalid type",
        courseData: { title: 123 },
        expectedStatus: 400,
        expectedError: "Title must be at least 3 characters",
      },
      {
        title: "title is empty - invalid equivalence partition",
        courseData: { title: "" },
        expectedStatus: 400,
        expectedError: "Title must be at least 3 characters",
      },
      {
        title: "title has 2 characters - lower boundary",
        courseData: { ...generateRandomCourse(2) },
        expectedStatus: 400,
        expectedError: "Title must be at least 3 characters",
      },
    ];

    invalidUserData.forEach(
      ({ title, courseData, expectedStatus, expectedError }) => {
        test(title, async ({ adminRequest }) => {
          // Arrange
          const adminApi = new ApiController(adminRequest);

          // Act
          const createdCourseResponse =
            await adminApi.courseController.createCourse(
              courseData as CreateCourseRequest,
              { failOnStatusCode: false },
            );

          // Assert
          await test.step("Verify course creation validation error", async () => {
            expect(createdCourseResponse.response.status()).toBe(
              expectedStatus,
            );

            const errorBody = (await createdCourseResponse.response.json()) as {
              error: string;
            };
            expect(errorBody.error).toBe(expectedError);
          });
        });
      },
    );
  },
);

test.describe(
  "Courses: Non admin user can't create a course",
  { tag: "@Courses" },
  () => {
    test("Non admin user can't create a new course", async ({
      regularUserRequest,
    }) => {
      //arrange
      const randomCourse = generateRandomCourse(10);
      const regularUserApi = new ApiController(regularUserRequest);

      //act
      const response = await regularUserApi.courseController.createCourse(
        randomCourse,
        { failOnStatusCode: false },
      );

      //assert
      await test.step("Verify regular user can't create a course", async () => {
        expect(response.response.status()).toBe(403);
      });
    });
  },
);
