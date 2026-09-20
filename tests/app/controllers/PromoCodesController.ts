import { APIResponse } from "@playwright/test";
import { BaseController } from "./BaseController";
import {
  CreatePromoCodeRequest,
  CreatePromoCodeResponse,
  PromoCodesResponse,
  ValidatePromoCodeResponse,
} from "../../types/promo-codes/promo-code";
import { SuccessResponse } from "../../types/courses/course";

export class PromoController extends BaseController {
  courseEndpoint = "/api/courses";
  adminCourseEndpoint = "/api/admin/courses";

  async createPromoCode(
    courseId: string,
    promoCode: Partial<CreatePromoCodeRequest>,
    options?: { failOnStatusCode: boolean },
  ): Promise<{
    response: APIResponse;
    json: CreatePromoCodeResponse;
  }> {
    const response = await this.request.post(
      `${this.adminCourseEndpoint}/${courseId}/promo-codes`,
      {
        data: promoCode,
        failOnStatusCode: options?.failOnStatusCode,
      },
    );
    const json = await response.json();
    return { response, json };
  }

  async validatePromoCode(
    courseId: string,
    promoCode: string,
    options?: { failOnStatusCode: boolean },
  ): Promise<{
    response: APIResponse;
    json: ValidatePromoCodeResponse;
  }> {
    const response = await this.request.post(
      `${this.courseEndpoint}/${courseId}/validate-promo`,
      {
        data: {
          code: promoCode,
        },
        failOnStatusCode: options?.failOnStatusCode,
      },
    );
    const json = await response.json();
    return { response, json };
  }

  async getListOfPromoCodesForCourse(
    courseId: string,
    options?: { failOnStatusCode: boolean },
  ): Promise<{ response: APIResponse; json: PromoCodesResponse }> {
    const response = await this.request.get(
      `${this.adminCourseEndpoint}/${courseId}/promo-codes`,
      {
        failOnStatusCode: options?.failOnStatusCode,
      },
    );
    const json = await response.json();
    return { response, json };
  }

  async togglePromoCodesActiveStatus(
    courseId: string,
    promoCodeId: string,
    options?: { failOnStatusCode: boolean },
  ): Promise<{ response: APIResponse; json: CreatePromoCodeResponse }> {
    const response = await this.request.patch(
      `${this.adminCourseEndpoint}/${courseId}/promo-codes/${promoCodeId}`,
      {
        failOnStatusCode: options?.failOnStatusCode,
      },
    );
    const json = await response.json();
    return { response, json };
  }

  async deletePromoCode(
    courseId: string,
    promoCodeId: string,
    options?: { failOnStatusCode: boolean },
  ): Promise<{
    response: APIResponse;
    json: SuccessResponse;
  }> {
    const response = await this.request.patch(
      `${this.courseEndpoint}/${courseId}/promo-codes${promoCodeId}`,
      {
        failOnStatusCode: options?.failOnStatusCode,
      },
    );

    const json = await response.json();
    return { response, json };
  }
}
