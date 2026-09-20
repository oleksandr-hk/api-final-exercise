import { Chapter } from "../chapters/chapter";

export type Category = { id: string; name: string; slug: string };

export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  price: string | null;
  isPublished: boolean;
  isListed: boolean;
  isFeatured: boolean;
  featuredOrder: number;
  outcomes: string | null;
  requirements: string | null;
  authorName: string | null;
  authorRole: string | null;
  categories?: Category[];
  chapters?: Chapter[];
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
};

export type Attachment = {
  id: string;
  name: string;
  url: string;
  courseId: string;
  createdAt: string;
};

export type CourseListItem = Pick<
  Course,
  | "id"
  | "title"
  | "slug"
  | "description"
  | "imageUrl"
  | "price"
  | "isPublished"
  | "createdAt"
> & {
  categories: Category[];
  _count: { chapters: number; purchases: number };
};

export type CoursePaginated = {
  data: CourseListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CreateCourseRequest = { title: string };

export type UpdateCourseRequest = {
  authorName?: string;
  authorRole?: string;
  categoryIds?: string[];
  description?: string;
  imageUrl?: string;
  outcomes?: string[];
  price?: number;
  requirements?: string[];
  title?: string;
};

export type SuccessResponse = { success: boolean };
