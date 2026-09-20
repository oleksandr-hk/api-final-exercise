import { expect } from "@playwright/test";
import { ApiController } from "../../app/controllers/ApiController";
import { test } from "../../fixtures/fixtures";
import { UserRole } from "../../types/auth/auth";
import { getAdminUser } from "../../utils/user-utils";

test.describe("OAuth2: get current user info", { tag: "@OAuth2" }, () => {
  test("user can get current info for regular user", async ({
    regularUserRequest,
    regularUser,
  }) => {
    // arrange
    const api = new ApiController(regularUserRequest);

    //Act
    const userInfoResponse = await api.oauthController.getCurrentUserInfo({
      failOnStatusCode: true,
    });
    const userInfo = userInfoResponse.json;

    // Assert
    await test.step("Verify current user response", () => {
      expect(userInfoResponse.response.status()).toBe(200);
      expect(userInfo).toMatchObject({
        name: regularUser.name,
        email: regularUser.email,
        role: UserRole.USER,
      });
      //verify id and createdAt exist in response
      expect(userInfo.id).toBeDefined();
      expect(userInfo.createdAt).toBeDefined();
    });
  });

  test("user can get current info for admin user", async ({ adminRequest }) => {
    // arrange
    const api = new ApiController(adminRequest);
    const admin = getAdminUser();

    //Act
    const userInfoResponse = await api.oauthController.getCurrentUserInfo({
      failOnStatusCode: true,
    });
    const userInfo = userInfoResponse.json;

    // Assert
    await test.step("Verify current user response", () => {
      expect(userInfoResponse.response.status()).toBe(200);
      expect(userInfo).toMatchObject({
        name: admin.name,
        email: admin.email,
        role: UserRole.ADMIN,
      });
      //verify id and createdAt exist in response
      expect(userInfo.id).toBeDefined();
      expect(userInfo.createdAt).toBeDefined();
    });
  });
});

test.describe(
  "OAuth2: user can't get current info without auth data",
  { tag: "@OAuth2" },
  () => {
    test("user can't get current info without auth token", async ({
      nonAuthRequest,
    }) => {
      // arrange
      const api = new ApiController(nonAuthRequest);

      //Act
      const userInfoResponse = await api.oauthController.getCurrentUserInfo({
        failOnStatusCode: false,
      });

      // Assert
      await test.step("Verify current user response error", async () => {
        expect(userInfoResponse.response.status()).toBe(401);
        //parse error message
        const errorBody = await userInfoResponse.response.json();
        expect(errorBody.error).toBe("Unauthorized");
      });
    });
  },
);
