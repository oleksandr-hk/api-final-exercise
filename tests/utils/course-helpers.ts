import { ApiController } from "../app/controllers/ApiController";
import {
  generateRandomChapter,
  generateRandomCourse,
  generateRandomUpdatedChapter,
  generateRandomUpdatedCourse,
} from "./data-generators";

export async function createPublishedCourse(adminApi: ApiController) {
  const createdCourse = await adminApi.courseController.createCourse(
    generateRandomCourse(10),
    { failOnStatusCode: true },
  );
  const courseId = createdCourse.json.id;
  const courseData = generateRandomUpdatedCourse();

  await adminApi.courseController.updateCourse(courseId, courseData, {
    failOnStatusCode: true,
  });
  const chapter = await adminApi.chapterController.addChapterToCourse(
    courseId,
    generateRandomChapter().title,
    { failOnStatusCode: true },
  );
  await adminApi.chapterController.updateChapter(
    courseId,
    chapter.json.id,
    { ...generateRandomUpdatedChapter(), isPublished: true },
    { failOnStatusCode: true },
  );

  const publishedCourse = await adminApi.courseController.publishCourse(
    courseId,
    { failOnStatusCode: true },
  );
  return publishedCourse.json;
}
