import { expect } from "@playwright/test";
import { ApiController } from "../../app/controllers/ApiController";
import { test } from "../../fixtures/fixtures";
import {
  generatePromoCode,
  generateRandomCourse,
} from "../../utils/data-generators";
import { promoCodeSchema } from "../../app/schemas/promo-code.schema";

test.describe(
  "Promo codes: Admin can toggle promo-code active status",
  { tag: "@Promo-code" },
  () => {
    test("admin can deactivate and reactivate a promo code", async ({
      adminRequest,
    }) => {
      // Arrange
      const adminApi = new ApiController(adminRequest);

      const course = await test.step("Create a course", async () => {
        const response = await adminApi.courseController.createCourse(
          generateRandomCourse(10),
          { failOnStatusCode: true },
        );
        return response.json;
      });

      const promoCode = await test.step("Create an active promo code", async () => {
        const response = await adminApi.promoController.createPromoCode(
          course.id,
          generatePromoCode(100),
          { failOnStatusCode: true },
        );
        return response.json;
      });

      expect(promoCode.isActive).toBe(true);

      // Act and assert
      const deactivatedPromoCode = await test.step(
        "Deactivate the promo code",
        async () => {
          const response =
            await adminApi.promoController.togglePromoCodesActiveStatus(
              course.id,
              promoCode.id,
              { failOnStatusCode: true },
            );
          expect(response.response.status()).toBe(200);
          expect(response.json).toMatchObject({
            id: promoCode.id,
            isActive: false,
          });
          expect(promoCodeSchema.safeParse(response.json).success).toBe(true);
          return response.json;
        },
      );

      await test.step("Verify the promo code is inactive in the list", async () => {
        const response =
          await adminApi.promoController.getListOfPromoCodesForCourse(
            course.id,
            { failOnStatusCode: true },
          );
        expect(response.response.status()).toBe(200);
        expect(
          response.json.find((item) => item.id === deactivatedPromoCode.id),
        ).toMatchObject({ isActive: false });
      });

      const reactivatedPromoCode = await test.step(
        "Reactivate the promo code",
        async () => {
          const response =
            await adminApi.promoController.togglePromoCodesActiveStatus(
              course.id,
              promoCode.id,
              { failOnStatusCode: true },
            );
          expect(response.response.status()).toBe(200);
          expect(response.json).toMatchObject({
            id: promoCode.id,
            isActive: true,
          });
          expect(promoCodeSchema.safeParse(response.json).success).toBe(true);
          return response.json;
        },
      );

      await test.step("Verify the promo code is active in the list", async () => {
        const response =
          await adminApi.promoController.getListOfPromoCodesForCourse(
            course.id,
            { failOnStatusCode: true },
          );
        expect(response.response.status()).toBe(200);
        expect(
          response.json.find((item) => item.id === reactivatedPromoCode.id),
        ).toMatchObject({ isActive: true });
      });
    });
  },
);
