import { APIResponse } from "@playwright/test";
import { BaseController } from "./BaseController";
import {
  CreatePurchaseResponse,
  PurchasesResponse,
} from "../../types/purchases/purchase";

export class PurchaseController extends BaseController {
  async purchaseCourse(
    courseId: string,
    promoCode?: string,
    options?: { failOnStatusCode?: boolean },
  ): Promise<{ response: APIResponse; json: CreatePurchaseResponse }> {
    const response = await this.request.post(
      `/api/courses/${courseId}/purchase`,
      {
        data: promoCode ? { promoCode } : {},
        failOnStatusCode: options?.failOnStatusCode,
      },
    );
    const json = await response.json();
    return { response, json };
  }

  async getPurchases(
    options?: { failOnStatusCode?: boolean },
  ): Promise<{ response: APIResponse; json: PurchasesResponse }> {
    const response = await this.request.get("/api/purchases", {
      failOnStatusCode: options?.failOnStatusCode,
    });
    const json = await response.json();
    return { response, json };
  }
}
