import { expect } from "@playwright/test";
import { ApiController } from "../../app/controllers/ApiController";
import { test } from "../../fixtures/fixtures";
import { userSchema } from "../../app/schemas/admin.schema";
import {
  RegisterUserRequest,
  RegisterUserResponse,
  UserRole,
} from "../../types/auth/auth";
import { buildNewUser } from "../../utils/data-generators";

test.describe(
  "User registration: successful account creation",
  { tag: "@Auth" },
  () => {
    test("user can successfully register a new account", async ({
      nonAuthRequest,
      adminRequest,
    }) => {
      // arrange
      const api = new ApiController(nonAuthRequest);
      const adminApi = new ApiController(adminRequest);
      //generate random user
      const generatedUser = buildNewUser();

      //Act
      const createdUserResponse = await api.authController.registerNewUser(
        generatedUser,
        {
          failOnStatusCode: true,
        },
      );
      const createdUser = createdUserResponse.json;

      // Assert
      await test.step("Verify created user response", async () => {
        expect(createdUserResponse.response.status()).toBe(201);
        expect(createdUser).toMatchObject({
          name: generatedUser.name,
          email: generatedUser.email,
          role: UserRole.USER,
        });
        //verify id and createdAt exist in response
        expect(createdUser.id).toBeDefined();
        expect(createdUser.createdAt).toBeDefined();
        expect(userSchema.safeParse(createdUser).success).toBe(true);
      });

      await test.step("Verify user was created and present in user list", async () => {
        //use admin token to fetch user list
        const usersResponse = await adminApi.adminController.getAllUsers({
          failOnStatusCode: true,
        });
        const users: RegisterUserResponse[] = usersResponse.json;
        expect(usersResponse.response.status()).toBe(200);

        //search for created user in user list
        expect(
          users.find((user) => {
            return (
              user.name == generatedUser.name &&
              user.email == generatedUser.email &&
              user.role == UserRole.USER
            );
          }),
        ).toBeDefined();
      });
    });
  },
);

test.describe(
  "User registration: invalid input validation",
  { tag: "@Register" },
  () => {
    type InvalidUserCase = {
      title: string;
      transformUserData: (userData: RegisterUserRequest) => RegisterUserRequest;
      errorCode: number;
      errorMessage: string;
    };

    const invalidUserData: InvalidUserCase[] = [
      {
        title: "User name too short",
        transformUserData: (userData) => ({ ...userData, name: "a" }),
        errorCode: 400,
        errorMessage: "Name must be at least 2 characters",
      },
      {
        title: "User name too long [Application bug]",
        transformUserData: (userData) => ({
          ...userData,
          name: "a".repeat(10000),
        }),
        errorCode: 500,
        errorMessage: "Name must be at least 2 characters",
      },
      {
        title: "Missing username",
        transformUserData: ({ name: _name, ...userData }) => userData,
        errorCode: 400,
        errorMessage: "Invalid input: expected string, received undefined",
      },
      {
        title: "Invalid email without @",
        transformUserData: (userData) => ({
          ...userData,
          email: "regularuser555gmail.com",
        }),
        errorCode: 400,
        errorMessage: "Invalid email address",
      },
      {
        title: "Invalid email without domain name",
        transformUserData: (userData) => ({
          ...userData,
          email: "regularuser555@.com",
        }),
        errorCode: 400,
        errorMessage: "Invalid email address",
      },
      {
        title: "Missing email",
        transformUserData: ({ email: _email, ...userData }) => userData,
        errorCode: 400,
        errorMessage: "Invalid input: expected string, received undefined",
      },
      {
        title: "Password too short",
        transformUserData: (userData) => ({ ...userData, password: "a" }),
        errorCode: 400,
        errorMessage: "Password must be at least 8 characters",
      },
      {
        title: "Password too long [Application bug]",
        transformUserData: (userData) => ({
          ...userData,
          password: "a1".repeat(10000),
        }),
        errorCode: 500,
        errorMessage: "Name must be at least 2 characters",
      },
      {
        title: "Missing password",
        transformUserData: ({ password: _password, ...userData }) => userData,
        errorCode: 400,
        errorMessage: "Invalid input: expected string, received undefined",
      },
      {
        title: "Password without digit",
        transformUserData: (userData) => ({
          ...userData,
          password: "Password",
        }),
        errorCode: 400,
        errorMessage: "Password must contain at least one digit",
      },
      {
        title: "Password without uppercase letter",
        transformUserData: (userData) => ({
          ...userData,
          password: "password1",
        }),
        errorCode: 400,
        errorMessage: "Password must contain at least one uppercase letter",
      },
    ];

    invalidUserData.forEach(
      ({ title, transformUserData, errorCode, errorMessage }) => {
        test(title, async ({ nonAuthRequest, adminRequest }) => {
          // arrange
          const api = new ApiController(nonAuthRequest);
          const adminApi = new ApiController(adminRequest);
          const userData = transformUserData(buildNewUser());

          //Act
          const createdUserResponse = await api.authController.registerNewUser(
            userData,
            {
              failOnStatusCode: false,
            },
          );

          // Assert
          await test.step("Verify created user response error", async () => {
            //verify error code and error message
            expect(createdUserResponse.response.status()).toEqual(errorCode);
            const errorBody = (await createdUserResponse.response.json()) as {
              error: string;
            };
            expect(errorBody.error).toEqual(errorMessage);
          });

          await test.step("Verify invalid user missing in user list", async () => {
            //use admin token to fetch user list
            const usersResponse = await adminApi.adminController.getAllUsers({
              failOnStatusCode: true,
            });
            const users: RegisterUserResponse[] = usersResponse.json;
            expect(usersResponse.response.status()).toBe(200);

            //search for generated user in user list
            expect(
              users.find((user) => {
                return (
                  user.name == userData.name &&
                  user.email == userData.email &&
                  user.role == UserRole.USER
                );
              }),
            ).toBeFalsy();
          });
        });
      },
    );
  },
);
