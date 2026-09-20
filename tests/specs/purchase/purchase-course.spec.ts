import { expect } from "@playwright/test";
import { ApiController } from "../../app/controllers/ApiController";
import { test } from "../../fixtures/fixtures";
import { generatePromoCode } from "../../utils/data-generators";
import { createPublishedCourse } from "../../utils/course-helpers";
import { purchaseSchema } from "../../app/schemas/purchase.schema";

test.describe("Purchases: User can purchase a course", { tag: "@Purchases" }, () => {
  test("user can purchase a course without a promo code", async ({
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
    const purchaseResponse = await test.step(
      "Purchase the course without a promo code",
      async () =>
        regularUserApi.purchaseController.purchaseCourse(
          course.id,
          undefined,
          { failOnStatusCode: true },
        ),
    );

    // Assert
    await test.step("Verify the full-price purchase", async () => {
      expect(purchaseResponse.response.status()).toBe(201);
      expect(purchaseResponse.json).toMatchObject({
        courseId: course.id,
        amount: course.price,
        promoCode: null,
      });
      expect(purchaseResponse.json.id).toBeDefined();
      expect(purchaseResponse.json.userId).toBeDefined();
      expect(purchaseResponse.json.createdAt).toBeDefined();
    });

    await test.step("Verify purchase matches schema", async () => {
      expect(purchaseSchema.safeParse(purchaseResponse.json).success).toBe(true);
    });

    await test.step("Verify the purchase is in the user's list", async () => {
      const purchases = await regularUserApi.purchaseController.getPurchases({
        failOnStatusCode: true,
      });
      expect(purchases.response.status()).toBe(200);
      expect(
        purchases.json.find((purchase) => purchase.id === purchaseResponse.json.id),
      ).toMatchObject({
        courseId: course.id,
        promoCode: null,
        course: { id: course.id, title: course.title, slug: course.slug },
      });
      const fetchedPurchase = purchases.json.find(
        (purchase) => purchase.id === purchaseResponse.json.id,
      );
      expect(purchaseSchema.safeParse(fetchedPurchase).success).toBe(true);
    });
  });

  test("user can purchase a course with a promo code", async ({
    adminRequest,
    regularUserRequest,
  }) => {
    // Arrange
    const adminApi = new ApiController(adminRequest);
    const regularUserApi = new ApiController(regularUserRequest);
    const course = await test.step("Create a published course", async () =>
      createPublishedCourse(adminApi),
    );
    const promoCodeData = generatePromoCode(10);
    const promoCode = await test.step("Create a promo code", async () => {
      const response = await adminApi.promoController.createPromoCode(
        course.id,
        promoCodeData,
        { failOnStatusCode: true },
      );
      return response.json;
    });

    // Act
    const purchaseResponse = await test.step(
      "Purchase the course with the promo code",
      async () =>
        regularUserApi.purchaseController.purchaseCourse(
          course.id,
          promoCode.code,
          { failOnStatusCode: true },
        ),
    );

    // Assert
    await test.step("Verify the discounted purchase", async () => {
      const expectedAmount =
        Number(course.price) * (1 - promoCode.discountPercent / 100);
      expect(purchaseResponse.response.status()).toBe(201);
      expect(purchaseResponse.json).toMatchObject({
        courseId: course.id,
        promoCode: promoCode.code,
      });
      expect(Number(purchaseResponse.json.amount)).toBeCloseTo(
        expectedAmount,
        2,
      );
    });

    await test.step("Verify purchase matches schema", async () => {
      expect(purchaseSchema.safeParse(purchaseResponse.json).success).toBe(true);
    });

    await test.step("Verify the discounted purchase is in the user's list", async () => {
      const purchases = await regularUserApi.purchaseController.getPurchases({
        failOnStatusCode: true,
      });
      expect(purchases.response.status()).toBe(200);
      expect(
        purchases.json.find((purchase) => purchase.id === purchaseResponse.json.id),
      ).toMatchObject({
        courseId: course.id,
        promoCode: promoCode.code,
        course: { id: course.id, title: course.title, slug: course.slug },
      });
      const fetchedPurchase = purchases.json.find(
        (purchase) => purchase.id === purchaseResponse.json.id,
      );
      expect(purchaseSchema.safeParse(fetchedPurchase).success).toBe(true);
    });
  });
});
