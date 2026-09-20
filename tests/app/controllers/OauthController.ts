import { APIResponse } from "@playwright/test";
import { BaseController } from "./BaseController";
import {
  OauthTokenRequestData,
  RegisterUserResponse,
} from "../../types/auth/auth";

export class OauthController extends BaseController {
  getTokenEndpoint = "/api/oauth/token";
  getUserInfoEndPoint = "/api/oauth/userinfo"

  async getOauthToken(
    oauthRequestData: OauthTokenRequestData,
    options?: {
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.post(this.getTokenEndpoint, {
      data: oauthRequestData,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  async getCurrentUserInfo(options?: { failOnStatusCode?: boolean }): Promise<{
    response: APIResponse;
    json: RegisterUserResponse;
  }> {
    const response = await this.request.get(this.getUserInfoEndPoint, {
      failOnStatusCode: options?.failOnStatusCode,
    });

    const json = await response.json();
    return { response, json };
  }
}
