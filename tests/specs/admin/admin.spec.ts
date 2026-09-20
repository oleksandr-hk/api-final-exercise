import { expect } from "@playwright/test";
import { ApiController } from "../../app/controllers/ApiController";
import { test } from "../../fixtures/fixtures";
import { buildNewUser } from "../../utils/data-generators";
import { userSchema } from "../../app/schemas/admin.schema";

test.describe("Admin: admin can update user info", { tag: "@Admin" }, () => {
  test("user can get current info for regular user", async ({
    adminRequest,
    nonAuthRequest,
  }) => {
    // arrange
    const adminApi = new ApiController(adminRequest);
    const nonAuthenticatedApi = new ApiController(nonAuthRequest);
    const randomUser = buildNewUser();
    //update fields of random generated object
    const updatedRandomUser = {
      ...randomUser,
      name: "updatedName",
      email: "updated@gmail.com",
      isActive: false,
    };

    //Act
    const { createdUserResponse, updatedUserResponse, updatedUser, fetchedUser } = await test.step(
      "Create, update, and fetch the user",
      async () => {
        const createdUserResponse =
          await nonAuthenticatedApi.authController.registerNewUser(randomUser, {
            failOnStatusCode: true,
          });
        const createdUserId = createdUserResponse.json.id;
        const updatedUserResponse = await adminApi.adminController.updateUser(
          createdUserId,
          updatedRandomUser,
          { failOnStatusCode: true },
        );
        const fetchedUser = await adminApi.adminController.getUserById(
          createdUserId,
          { failOnStatusCode: true },
        );
        return {
          createdUserResponse,
          updatedUserResponse,
          updatedUser: updatedUserResponse.json,
          fetchedUser,
        };
      },
    );

    // Assert
    await test.step("Verify user was updated", () => {
      expect(createdUserResponse.response.status()).toBe(201);
      expect(updatedUserResponse.response.status()).toBe(200);
      //verify updated response
      expect(updatedUser).toMatchObject({
        name: updatedRandomUser.name,
        email: updatedRandomUser.email,
        isActive: updatedRandomUser.isActive,
      });
      //verify id and createdAt exist in response
      expect(updatedUser.id).toBeDefined();
      expect(updatedUser.createdAt).toBeDefined();
      expect(userSchema.safeParse(updatedUser).success).toBe(true);
    });

    //verify fetched user
    expect(fetchedUser).toBeDefined();
    expect(fetchedUser).toMatchObject({
      name: updatedRandomUser.name,
      email: updatedRandomUser.email,
      isActive: updatedRandomUser.isActive,
    });
    //verify id and createdAt exist in response
    expect(fetchedUser!.id).toBeDefined();
    expect(fetchedUser!.createdAt).toBeDefined();
  });
});
