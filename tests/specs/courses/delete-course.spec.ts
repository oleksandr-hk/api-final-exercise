import { expect } from "@playwright/test";
import { ApiController } from "../../app/controllers/ApiController";
import { test } from "../../fixtures/fixtures";
import { generateRandomCourse } from "../../utils/data-generators";

test.describe("Courses: Admin can delete a course", { tag: "@Courses" }, () => {
  test("admin can create a new course", async ({ adminRequest }) => {
    //arrange
    const adminApi = new ApiController(adminRequest);
    const randomCourse = generateRandomCourse(10);

    //act
    const { createdCourse, courseDeletedResponse, allCourses } = await test.step(
      "Create, delete, and fetch courses",
      async () => {
        const createdCourseResponse =
          await adminApi.courseController.createCourse(randomCourse, {
            failOnStatusCode: true,
          });
        const createdCourse = createdCourseResponse.json;
        const courseDeletedResponse =
          await adminApi.courseController.deleteCourse(createdCourse.id);
        const allCoursesResponse =
          await adminApi.courseController.getAllCourses();
        return {
          createdCourse,
          courseDeletedResponse,
          allCourses: allCoursesResponse.json,
        };
      },
    );

    //assert
    expect(courseDeletedResponse.response.status()).toBe(200);
    const courseDeleted = courseDeletedResponse.json;
    expect(courseDeleted.success).toBe(true);
    expect(
      allCourses.data.filter((course) => course.id == createdCourse.id),
    ).toHaveLength(0);
  });
});

test.describe(
  "Courses: Non admin users can't delete course",
  { tag: "@Courses" },
  () => {
    test("regular user can't delete course", async ({
      adminRequest,
      regularUserRequest,
    }) => {
      //arrange
      const adminApi = new ApiController(adminRequest);
      const regularUserApi = new ApiController(regularUserRequest);
      const randomCourse = generateRandomCourse(10);

      //act
      const { createdCourse, courseDeletedResponse, allCourses } =
        await test.step(
          "Create a course, attempt deletion, and fetch courses",
          async () => {
            const createdCourseResponse =
              await adminApi.courseController.createCourse(randomCourse, {
                failOnStatusCode: false,
              });
            const createdCourse = createdCourseResponse.json;
            const courseDeletedResponse =
              await regularUserApi.courseController.deleteCourse(
                createdCourse.id,
              );
            const allCoursesResponse =
              await adminApi.courseController.getAllCourses();
            return {
              createdCourse,
              courseDeletedResponse,
              allCourses: allCoursesResponse.json,
            };
          },
        );

      //assert
      expect(courseDeletedResponse.response.status()).toBe(403);
      expect(
        allCourses.data.filter((course) => course.id == createdCourse.id),
      ).toHaveLength(1);
    });

    test("non authorized user can't delete course", async ({
      adminRequest,
      nonAuthRequest,
    }) => {
      //arrange
      const adminApi = new ApiController(adminRequest);
      const nonAuthApi = new ApiController(nonAuthRequest);
      const randomCourse = generateRandomCourse(10);

      //act
      const { createdCourse, courseDeletedResponse, allCourses } =
        await test.step(
          "Create a course, attempt deletion, and fetch courses",
          async () => {
            const createdCourseResponse =
              await adminApi.courseController.createCourse(randomCourse, {
                failOnStatusCode: false,
              });
            const createdCourse = createdCourseResponse.json;
            const courseDeletedResponse =
              await nonAuthApi.courseController.deleteCourse(createdCourse.id);
            const allCoursesResponse =
              await adminApi.courseController.getAllCourses();
            return {
              createdCourse,
              courseDeletedResponse,
              allCourses: allCoursesResponse.json,
            };
          },
        );

      //assert
      expect(courseDeletedResponse.response.status()).toBe(401);
      expect(
        allCourses.data.filter((course) => course.id == createdCourse.id),
      ).toHaveLength(1);
    });
  },
);
