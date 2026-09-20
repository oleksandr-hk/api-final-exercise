import { APIResponse } from "@playwright/test";
import { BaseController } from "./BaseController";
import {
  RegisterUserResponse,
  UpdateUserRequest,
} from "../../types/auth/auth";

export class AdminController extends BaseController {
  usersEndpoint = "/api/admin/users";

  async getAllUsers(options?: { failOnStatusCode?: boolean }): Promise<{
    response: APIResponse;
    json: RegisterUserResponse[];
  }> {
    const response = await this.request.get(this.usersEndpoint, {
      failOnStatusCode: options?.failOnStatusCode,
    });

    const json = await response.json();
    return { response, json };
  }

  async getUserById(
    userId: string,
    options?: { failOnStatusCode?: boolean },
  ) {
    const usersResponse = await this.getAllUsers();
    const users: RegisterUserResponse[] = usersResponse.json;
    return users.find((user) => user.id === userId);
  }

  async updateUser(
    userId: string,
    updatedUser: UpdateUserRequest,
    options?: { failOnStatusCode?: boolean },
  ): Promise<{
    response: APIResponse;
    json: RegisterUserResponse;
  }> {
    const response = await this.request.patch(
      `${this.usersEndpoint}/${userId}`,
      {
        data: updatedUser,
        failOnStatusCode: options?.failOnStatusCode,
      },
    );

    const json = await response.json();
    return { response, json };
  }
}
