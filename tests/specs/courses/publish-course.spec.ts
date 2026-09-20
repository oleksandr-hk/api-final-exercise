import { expect } from "@playwright/test";
import { ApiController } from "../../app/controllers/ApiController";
import { test } from "../../fixtures/fixtures";
import {
  generateRandomChapter,
  generateRandomCourse,
  generateRandomUpdatedChapter,
  generateRandomUpdatedCourse,
} from "../../utils/data-generators";
import { courseSchema } from "../../app/schemas/course.schema";

test.describe(
  "Courses: Admin can publish a new course",
  { tag: "@Courses" },
  () => {
    test("admin user can publish a new course", async ({ adminRequest }) => {
      // Arrange
      const adminApi = new ApiController(adminRequest);
      const randomCourse = generateRandomCourse(15);
      const updatedCourse = generateRandomUpdatedCourse();
      const chapter = generateRandomChapter();
      const chapterContent = {
        ...generateRandomUpdatedChapter(),
        isPublished: true,
      };

      // Act
      const {
        courseId,
        chapterId,
        updatedChapterResponse,
        publishedCourseResponse,
        fetchedCourseResponse,
      } = await test.step(
        "Create course content, publish it, and fetch the result",
        async () => {
          const createdCourseResponse =
            await adminApi.courseController.createCourse(randomCourse, {
              failOnStatusCode: true,
            });
          const courseId = createdCourseResponse.json.id;
          await adminApi.courseController.updateCourse(courseId, updatedCourse, {
            failOnStatusCode: true,
          });
          const assignedChapterResponse =
            await adminApi.chapterController.addChapterToCourse(
              courseId,
              chapter.title,
              { failOnStatusCode: true },
            );
          const chapterId = assignedChapterResponse.json.id;
          const updatedChapterResponse =
            await adminApi.chapterController.updateChapter(
              courseId,
              chapterId,
              chapterContent,
              { failOnStatusCode: true },
            );
          const publishedCourseResponse =
            await adminApi.courseController.publishCourse(courseId, {
              failOnStatusCode: true,
            });
          const fetchedCourseResponse =
            await adminApi.courseController.getCourseById(courseId);
          return {
            courseId,
            chapterId,
            updatedChapterResponse,
            publishedCourseResponse,
            fetchedCourseResponse,
          };
        },
      );
      const updatedChapter = updatedChapterResponse.json;
      const publishedCourse = publishedCourseResponse.json;
      const fetchedCourse = fetchedCourseResponse.json;

      // Assert
      await test.step("Verify the chapter was updated and published", async () => {
        expect(updatedChapterResponse.response.status()).toBe(200);
        expect(updatedChapter).toMatchObject({
          id: chapterId,
          courseId,
          ...chapterContent,
        });
      });

      const expectedPublishedCourse = {
        id: courseId,
        title: updatedCourse.title,
        description: updatedCourse.description,
        imageUrl: updatedCourse.imageUrl,
        price: updatedCourse.price?.toString(),
        outcomes: JSON.stringify(updatedCourse.outcomes),
        requirements: JSON.stringify(updatedCourse.requirements),
        authorName: updatedCourse.authorName,
        authorRole: updatedCourse.authorRole,
        isPublished: true,
      };

      await test.step("Verify the course was published", async () => {
        expect(publishedCourseResponse.response.status()).toBe(200);
        expect(publishedCourse).toMatchObject(expectedPublishedCourse);
      });

      await test.step("Verify the published course content can be fetched", async () => {
        expect(fetchedCourseResponse.response.status()).toBe(200);
        expect(fetchedCourse).toMatchObject(expectedPublishedCourse);
        expect(fetchedCourse.chapters).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: chapterId,
              courseId,
              ...chapterContent,
            }),
          ]),
        );
      });

      await test.step("Verify published course matches schema", async () => {
        expect(courseSchema.safeParse(publishedCourse).success).toBe(true);
        expect(courseSchema.safeParse(fetchedCourse).success).toBe(true);
      });
    });
  },
);
