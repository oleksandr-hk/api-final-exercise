import { expect } from "@playwright/test";
import { test } from "../../fixtures/fixtures";
import { ApiController } from "../../app/controllers/ApiController";
import { generateRandomCourse } from "../../utils/data-generators";
import { courseSchema } from "../../app/schemas/course.schema";

test.describe(
  "Courses: Admin can create a new course",
  { tag: "@Courses" },
  () => {
    test("admin can create a new course", async ({ adminRequest }) => {
      // arrange
      const adminApi = new ApiController(adminRequest);
      const randomCourse = generateRandomCourse(10);

      //Act
      const { createdCourseResponse, fetchedCourseResponse } = await test.step(
        "Create and fetch the course",
        async () => {
          const createdCourseResponse =
            await adminApi.courseController.createCourse(randomCourse, {
              failOnStatusCode: true,
            });
          const fetchedCourseResponse =
            await adminApi.courseController.getCourseById(
              createdCourseResponse.json.id,
              { failOnStatusCode: true },
            );
          return { createdCourseResponse, fetchedCourseResponse };
        },
      );
      const createdCourse = createdCourseResponse.json;
      const fetchedCourse = fetchedCourseResponse.json;

      // Assert
      await test.step("Verify the course was created", async () => {
        expect(createdCourseResponse.response.status()).toBe(201);
        expect(createdCourse).toMatchObject({
          title: randomCourse.title,
        });
        expect(createdCourse.id).toBeDefined();
        expect(createdCourse.slug).toBeDefined();
        expect(createdCourse.createdAt).toBeDefined();
      });

      await test.step("Verify the course can be fetched", async () => {
        expect(fetchedCourseResponse.response.status()).toBe(200);
        expect(fetchedCourse).toMatchObject({
          id: createdCourse.id,
          title: randomCourse.title,
          slug: createdCourse.slug,
        });
      });

      await test.step("Verify created course matches schema", async () => {
        expect(courseSchema.safeParse(createdCourse).success).toBe(true);
        expect(courseSchema.safeParse(fetchedCourse).success).toBe(true);
      });
    });
  },
);
