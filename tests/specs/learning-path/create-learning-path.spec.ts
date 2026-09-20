import { expect } from "@playwright/test";
import { test } from "../../fixtures/fixtures";
import {
  generateRandomCertificate,
  generateRandomAlphabeticalString,
  generateRandomInstructor,
  generateRandomLearningPathModules,
  generateRandomLearningPathVideo,
} from "../../utils/data-generators";
import { ApiController } from "../../app/controllers/ApiController";
import { learningPathSchema } from "../../app/schemas/learning-path.schema";


test.describe(
  "Learning-path: Admin can create a new learning path",
  { tag: "@Learning-path" },
  () => {
    test("admin user can create a new learning path with required only resources", async ({
      adminRequest,
    }) => {
      //Arrange
      const apiController = new ApiController(adminRequest);

      const { instructor, title } =
        await test.step("Generate required learning path resources", async () => {
          const instructor = generateRandomInstructor();
          const title = generateRandomAlphabeticalString(5);
          return { instructor, title };
        });
      const learningPath = { title, instructor };

      //Act
      const learningPathResponse =
        await test.step("Create learning path", async () => {
          return await apiController.learningPathController.createLearningPath(
            learningPath,
          );
        });

      //Assert
      await test.step("Verify learning path was created with required resources", async () => {
        expect(learningPathResponse.response.status()).toBe(201);
        expect(learningPathResponse.json).toMatchObject({
          title,
          description: null,
          isPublished: false,
          modules: [],
          categories: [],
          video: null,
          certificate: null,
          instructor: {
            name: instructor.name,
            bio: instructor.bio,
            avatarUrl: instructor.avatarUrl,
          },
        });

        expect(learningPathResponse.json.id).toBeDefined();
        expect(learningPathResponse.json.slug).toBeDefined();
        expect(learningPathResponse.json.createdAt).toBeDefined();
        expect(learningPathResponse.json.updatedAt).toBeDefined();
        expect(learningPathResponse.json.instructor.id).toBeDefined();
        expect(learningPathResponse.json.instructor.createdAt).toBeDefined();
        expect(learningPathResponse.json.instructor.updatedAt).toBeDefined();
      });

      await test.step("Verify created learning path matches schema", async () => {
        const result = learningPathSchema.safeParse(learningPathResponse.json);
        expect(result.success).toBe(true);
      });
    });

    test("admin user can create a new learning path with all resources", async ({
      adminRequest,
    }) => {
      // Arrange
      const apiController = new ApiController(adminRequest);
      const title = `Learning path ${generateRandomAlphabeticalString(8)}`;
      const description = `Description ${generateRandomAlphabeticalString(20)}`;
      const instructor = generateRandomInstructor();
      const modules = generateRandomLearningPathModules(3);
      const video = generateRandomLearningPathVideo();
      const certificate = generateRandomCertificate();
      const learningPath = {
        title,
        description,
        modules,
        categoryIds: [],
        video,
        certificate,
        instructor,
      };

      // Act
      const learningPathResponse = await test.step(
        "Create learning path with all resources",
        async () =>
          apiController.learningPathController.createLearningPath(
            learningPath,
            { failOnStatusCode: true },
          ),
      );

      // Assert
      await test.step("Verify all learning path resources were created", async () => {
        expect(learningPathResponse.response.status()).toBe(201);
        expect(learningPathResponse.json).toMatchObject({
          title,
          description,
          isPublished: false,
          categories: [],
          instructor: {
            name: instructor.name,
            bio: instructor.bio,
            avatarUrl: instructor.avatarUrl,
          },
          video: {
            title: video.title,
            videoId: video.videoId,
            isPublished: true,
          },
          certificate: {
            name: certificate.name,
            description: certificate.description,
            templateUrl: certificate.templateUrl,
          },
        });

        expect(learningPathResponse.json.id).toBeDefined();
        expect(learningPathResponse.json.slug).toBeDefined();
        expect(learningPathResponse.json.createdAt).toBeDefined();
        expect(learningPathResponse.json.updatedAt).toBeDefined();
        expect(learningPathResponse.json.modules).toHaveLength(modules.length);
        expect(learningPathResponse.json.modules).toEqual(
          expect.arrayContaining(
            modules.map((module) =>
              expect.objectContaining({
                title: module.title,
                description: module.description,
                position: module.position,
              }),
            ),
          ),
        );
        expect(learningPathResponse.json.video?.id).toBeDefined();
        expect(learningPathResponse.json.certificate?.id).toBeDefined();
        expect(learningPathResponse.json.instructor.id).toBeDefined();
      });

      await test.step("Verify created learning path matches schema", async () => {
        const result = learningPathSchema.safeParse(learningPathResponse.json);
        expect(result.success).toBe(true);
      });
    });
  },
);
