import { expect } from "@playwright/test";
import { ApiController } from "../../app/controllers/ApiController";
import { test } from "../../fixtures/fixtures";
import { createPublishedCourse } from "../../utils/course-helpers";
import { generateRandomCourse } from "../../utils/data-generators";
import { purchaseSchema } from "../../app/schemas/purchase.schema";

test.describe(
  "Purchases: Purchase course validation",
  { tag: "@Purchases" },
  () => {
    test("invalid promo code is ignored and full price is charged", async ({
      adminRequest,
      regularUserRequest,
    }) => {
      // Arrange
      const adminApi = new ApiController(adminRequest);
      const regularUserApi = new ApiController(regularUserRequest);
      const course = await test.step("Create a published course", async () =>
        createPublishedCourse(adminApi),
      );

      // Act
      const response = await test.step(
        "Purchase with an invalid promo code",
        async () =>
          regularUserApi.purchaseController.purchaseCourse(
            course.id,
            "INVALID-PROMO-CODE",
            { failOnStatusCode: true },
          ),
      );

      // Assert
      expect(response.response.status()).toBe(201);
      expect(response.json).toMatchObject({
        courseId: course.id,
        amount: course.price,
        promoCode: null,
      });
      expect(purchaseSchema.safeParse(response.json).success).toBe(true);
    });

    test("unauthenticated user cannot purchase a course", async ({
      adminRequest,
      nonAuthRequest,
    }) => {
      // Arrange
      const adminApi = new ApiController(adminRequest);
      const nonAuthApi = new ApiController(nonAuthRequest);
      const course = await createPublishedCourse(adminApi);

      // Act
      const response = await nonAuthApi.purchaseController.purchaseCourse(
        course.id,
        undefined,
        { failOnStatusCode: false },
      );

      // Assert
      expect(response.response.status()).toBe(401);
      expect(response.json).toHaveProperty("error", "Unauthorized");
    });

    test("course not found", async ({ regularUserRequest }) => {
      const regularUserApi = new ApiController(regularUserRequest);

      const response = await regularUserApi.purchaseController.purchaseCourse(
        "non-existing-course-id",
        undefined,
        { failOnStatusCode: false },
      );

      expect(response.response.status()).toBe(404);
      expect(response.json).toHaveProperty("error", "Course not found");
    });

    test("unpublished course cannot be purchased", async ({
      adminRequest,
      regularUserRequest,
    }) => {
      // Arrange
      const adminApi = new ApiController(adminRequest);
      const regularUserApi = new ApiController(regularUserRequest);
      const course = await adminApi.courseController.createCourse(
        generateRandomCourse(10),
        { failOnStatusCode: true },
      );

      // Act
      const response = await regularUserApi.purchaseController.purchaseCourse(
        course.json.id,
        undefined,
        { failOnStatusCode: false },
      );

      // Assert
      expect(response.response.status()).toBe(404);
      expect(response.json).toHaveProperty("error", "Course not found");
    });

    test("already purchased course cannot be purchased again", async ({
      adminRequest,
      regularUserRequest,
    }) => {
      // Arrange
      const adminApi = new ApiController(adminRequest);
      const regularUserApi = new ApiController(regularUserRequest);
      const course = await createPublishedCourse(adminApi);
      await regularUserApi.purchaseController.purchaseCourse(
        course.id,
        undefined,
        { failOnStatusCode: true },
      );

      // Act
      const response = await regularUserApi.purchaseController.purchaseCourse(
        course.id,
        undefined,
        { failOnStatusCode: false },
      );

      // Assert
      expect(response.response.status()).toBe(409);
      expect(response.json).toHaveProperty("error", "Already purchased");
    });
  },
);
