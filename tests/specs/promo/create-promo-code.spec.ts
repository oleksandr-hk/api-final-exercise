import { expect } from "@playwright/test";
import { test } from "../../fixtures/fixtures";
import { ApiController } from "../../app/controllers/ApiController";
import {
  generatePromoCode,
  generateRandomCourse,
} from "../../utils/data-generators";
import { promoCodeSchema } from "../../app/schemas/promo-code.schema";

test.describe(
  "Promo codes: Admin can create a promo code",
  { tag: "@Promo-code" },
  () => {
    const promoCodeCases = [
      {
        title: "admin can create a promo code without a usage limit",
        maxUses: undefined,
      },
      {
        title: "admin can create a promo code with a usage limit",
        maxUses: 100,
      },
    ];

    promoCodeCases.forEach(({ title, maxUses }) => {
      test(title, async ({ adminRequest }) => {
        // Arrange
        const adminApi = new ApiController(adminRequest);
        const promoCodeData = generatePromoCode(maxUses);

        const course = await test.step("Create a course", async () => {
          const response = await adminApi.courseController.createCourse(
            generateRandomCourse(10),
            { failOnStatusCode: true },
          );
          return response.json;
        });

        // Act
        const createdPromoCodeResponse = await test.step(
          "Create a promo code for the course",
          async () =>
            adminApi.promoController.createPromoCode(
              course.id,
              promoCodeData,
              { failOnStatusCode: true },
            ),
        );
        const createdPromoCode = createdPromoCodeResponse.json;

        // Assert
        await test.step("Verify the promo code was created", async () => {
          expect(createdPromoCodeResponse.response.status()).toBe(201);
          expect(createdPromoCode).toMatchObject({
            code: promoCodeData.code,
            courseId: course.id,
            discountPercent: promoCodeData.discountPercent,
            maxUses: maxUses ?? null,
            currentUses: 0,
            isActive: true,
          });
          expect(createdPromoCode.id).toBeDefined();
          expect(createdPromoCode.createdAt).toBeDefined();
          expect(createdPromoCode.expiresAt).toBeDefined();
        });

        await test.step("Verify created promo code matches schema", async () => {
          expect(promoCodeSchema.safeParse(createdPromoCode).success).toBe(true);
        });

        await test.step("Verify the promo code is in the course list", async () => {
          const promoCodesResponse =
            await adminApi.promoController.getListOfPromoCodesForCourse(
              course.id,
              { failOnStatusCode: true },
            );
          expect(promoCodesResponse.response.status()).toBe(200);
          const fetchedPromoCode = promoCodesResponse.json.find(
            (promoCode) => promoCode.id === createdPromoCode.id,
          );

          expect(fetchedPromoCode).toMatchObject({
            id: createdPromoCode.id,
            code: promoCodeData.code,
            courseId: course.id,
            discountPercent: promoCodeData.discountPercent,
            maxUses: maxUses ?? null,
            currentUses: 0,
            isActive: true,
            _count: { usages: 0 },
          });
          expect(promoCodeSchema.safeParse(fetchedPromoCode).success).toBe(true);
        });
      });
    });
  },
);
