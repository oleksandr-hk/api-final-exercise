import { expect } from "@playwright/test";
import { ApiController } from "../../app/controllers/ApiController";
import { test } from "../../fixtures/fixtures";
import { CreatePromoCodeRequest } from "../../types/promo-codes/promo-code";
import {
  generatePromoCode,
  generateRandomCourse,
} from "../../utils/data-generators";

type InvalidPromoCodeCase = {
  title: string;
  buildPromoCode: () => Partial<CreatePromoCodeRequest>;
  expectedError?: string;
};

const invalidPromoCodeCases: InvalidPromoCodeCase[] = [
  {
    title: "code with 2 characters is rejected",
    buildPromoCode: () => ({ ...generatePromoCode(), code: "AA" }),
    expectedError: "Code must be at least 3 characters",
  },
  {
    title: "code with 21 characters is rejected",
    buildPromoCode: () => ({ ...generatePromoCode(), code: "A".repeat(21) }),
    expectedError: "Code must be at most 20 characters",
  },
  {
    title: "discount below 1 percent is rejected",
    buildPromoCode: () => ({ ...generatePromoCode(), discountPercent: 0 }),
    expectedError: "Discount must be at least 1%",
  },
  {
    title: "discount above 100 percent is rejected",
    buildPromoCode: () => ({ ...generatePromoCode(), discountPercent: 101 }),
    expectedError: "Discount cannot exceed 100%",
  },
  {
    title: "maxUses equal to zero is rejected",
    buildPromoCode: () => ({ ...generatePromoCode(), maxUses: 0 }),
  },
  {
    title: "non-integer maxUses is rejected",
    buildPromoCode: () => ({ ...generatePromoCode(), maxUses: 1.5 }),
  },
  {
    title: "missing code is rejected",
    buildPromoCode: () => {
      const { code, ...promoCodeWithoutCode } = generatePromoCode();
      return promoCodeWithoutCode;
    },
  },
  {
    title: "missing discountPercent is rejected",
    buildPromoCode: () => {
      const { discountPercent, ...promoCodeWithoutDiscount } =
        generatePromoCode();
      return promoCodeWithoutDiscount;
    },
  },
  {
    title: "missing expiresAt is rejected",
    buildPromoCode: () => {
      const { expiresAt, ...promoCodeWithoutExpiration } = generatePromoCode();
      return promoCodeWithoutExpiration;
    },
  },
];

test.describe(
  "Promo codes: Create promo-code validation",
  { tag: "@Promo-code" },
  () => {
    invalidPromoCodeCases.forEach(
      ({ title, buildPromoCode, expectedError }) => {
        test(title, async ({ adminRequest }) => {
          // Arrange
          const adminApi = new ApiController(adminRequest);
          const courseResponse = await adminApi.courseController.createCourse(
            generateRandomCourse(10),
            { failOnStatusCode: true },
          );

          // Act
          const response = await adminApi.promoController.createPromoCode(
            courseResponse.json.id,
            buildPromoCode(),
            { failOnStatusCode: false },
          );

          // Assert
          await test.step("Verify the promo code is rejected", async () => {
            expect(response.response.status()).toBe(400);
            expect(response.json).toHaveProperty("error");
            if (expectedError) {
              expect(response.json).toHaveProperty("error", expectedError);
            }
          });
        });
      },
    );

    test("course not found", async ({ adminRequest }) => {
      // Arrange
      const adminApi = new ApiController(adminRequest);

      // Act
      const response = await adminApi.promoController.createPromoCode(
        "non-existing-course-id",
        generatePromoCode(),
        { failOnStatusCode: false },
      );

      // Assert
      expect(response.response.status()).toBe(404);
      expect(response.json).toHaveProperty("error", "Course not found");
    });

    test("promo code already exists", async ({ adminRequest }) => {
      // Arrange
      const adminApi = new ApiController(adminRequest);
      const courseResponse = await adminApi.courseController.createCourse(
        generateRandomCourse(10),
        { failOnStatusCode: true },
      );
      const promoCode = generatePromoCode();
      await adminApi.promoController.createPromoCode(
        courseResponse.json.id,
        promoCode,
        { failOnStatusCode: true },
      );

      // Act
      const response = await adminApi.promoController.createPromoCode(
        courseResponse.json.id,
        promoCode,
        { failOnStatusCode: false },
      );

      // Assert
      expect(response.response.status()).toBe(409);
      expect(response.json).toHaveProperty(
        "error",
        "Promo code with this code already exists",
      );
    });
  },
);
