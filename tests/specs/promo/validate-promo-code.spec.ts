import { expect } from "@playwright/test";
import { ApiController } from "../../app/controllers/ApiController";
import { test } from "../../fixtures/fixtures";
import {
  generatePromoCode,
  generateRandomCourse,
} from "../../utils/data-generators";
import { validatePromoCodeSchema } from "../../app/schemas/promo-code.schema";

test.describe(
  "Promo codes: Validate a promo code",
  { tag: "@Promo-code" },
  () => {
    test("existing, unexpired promo code with remaining uses is valid", async ({
      adminRequest,
      regularUserRequest,
    }) => {
      // Arrange
      const adminApi = new ApiController(adminRequest);
      const regularUserApi = new ApiController(regularUserRequest);

      const course = await test.step("Create a course", async () => {
        const response = await adminApi.courseController.createCourse(
          generateRandomCourse(10),
          { failOnStatusCode: true },
        );
        return response.json;
      });

      const promoCode = await test.step("Create a valid promo code", async () => {
        const response = await adminApi.promoController.createPromoCode(
          course.id,
          generatePromoCode(10),
          { failOnStatusCode: true },
        );
        return response.json;
      });

      await test.step("Verify promo-code validation preconditions", async () => {
        expect(promoCode.id).toBeDefined();
        expect(new Date(promoCode.expiresAt).getTime()).toBeGreaterThan(
          Date.now(),
        );
        expect(promoCode.currentUses).toBeLessThan(promoCode.maxUses ?? 0);
      });

      // Act
      const validationResponse = await test.step(
        "Validate the promo code",
        async () =>
          regularUserApi.promoController.validatePromoCode(
            course.id,
            promoCode.code,
            { failOnStatusCode: true },
          ),
      );

      // Assert
      await test.step("Verify the promo code is valid", async () => {
        expect(validationResponse.response.status()).toBe(200);
        expect(validationResponse.json).toMatchObject({
          valid: true,
          discountPercent: promoCode.discountPercent,
          originalPrice: 0,
          finalPrice: 0,
        });
        expect(validatePromoCodeSchema.safeParse(validationResponse.json).success).toBe(true);
      });
    });

    test("nonexistent promo code is invalid", async ({
      adminRequest,
      regularUserRequest,
    }) => {
      // Arrange
      const adminApi = new ApiController(adminRequest);
      const regularUserApi = new ApiController(regularUserRequest);
      const courseResponse = await adminApi.courseController.createCourse(
        generateRandomCourse(10),
        { failOnStatusCode: true },
      );

      // Act
      const validationResponse = await test.step(
        "Validate a nonexistent promo code",
        async () =>
          regularUserApi.promoController.validatePromoCode(
          courseResponse.json.id,
          "PROMO-NOT-FOUND",
          { failOnStatusCode: true },
          ),
      );

      // Assert
      expect(validationResponse.response.status()).toBe(200);
      expect(validationResponse.json).toMatchObject({
        valid: false,
        error: "Promo code not found",
      });
      await test.step("Verify validation response matches schema", async () => {
        expect(validatePromoCodeSchema.safeParse(validationResponse.json).success).toBe(true);
      });
    });
  },
);
