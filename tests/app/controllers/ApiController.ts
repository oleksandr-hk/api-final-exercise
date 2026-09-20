import { APIRequestContext } from "@playwright/test";
import { AuthController } from "./AuthController";
import { OauthController } from "./OauthController";
import { AdminController } from "./AdminController";
import { CourseController } from "./CourseController";
import { ChapterController } from "./ChapterController";
import { TagController } from "./TagController";
import { PostController } from "./PostController";
import { PromoController } from "./PromoCodesController";
import { PurchaseController } from "./PurchaseController";
import { LearningPathController } from "./LearningPathController";

export class ApiController {
  authController: AuthController;
  oauthController: OauthController;
  adminController: AdminController;
  courseController: CourseController;
  chapterController: ChapterController;
  tagController: TagController;
  postController: PostController;
  promoController: PromoController;
  purchaseController: PurchaseController;
  learningPathController: LearningPathController;

  constructor(request: APIRequestContext) {
    this.authController = new AuthController(request);
    this.oauthController = new OauthController(request);
    this.adminController = new AdminController(request);
    this.courseController = new CourseController(request);
    this.chapterController = new ChapterController(request);
    this.tagController = new TagController(request);
    this.postController = new PostController(request);
    this.promoController = new PromoController(request);
    this.purchaseController = new PurchaseController(request);
    this.learningPathController = new LearningPathController(request);
  }
}
