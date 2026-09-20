import { APIResponse } from "@playwright/test";
import {
  RegisterUserRequest,
  RegisterUserResponse,
} from "../../types/auth/auth";
import { BaseController } from "./BaseController";

export class AuthController extends BaseController {
  registerEndpoint = "/api/auth/register";

  async registerNewUser(
    userData: RegisterUserRequest,
    options?: {
      failOnStatusCode?: boolean;
    },
  ): Promise<{
    response: APIResponse;
    json: RegisterUserResponse;
  }> {
    const response = await this.request.post(this.registerEndpoint, {
      data: userData,
      failOnStatusCode: options?.failOnStatusCode,
    });

    const json = await response.json();
    return { response, json };
  }
}
