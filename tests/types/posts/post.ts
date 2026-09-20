import { Tag } from "../tags/tag";

export type CreatePostRequest = {
  title: string;
  content?: string;
  excerpt?: string;
  imageUrl?: string;
  isPublished?: boolean;
  tagIds?: string[];
};

export type UpdatePostRequest = Partial<CreatePostRequest>;

export type CreatePostResponse = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  imageUrl: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  tags: Tag[];
  createdAt: string;
};

export type PostsResponse = CreatePostResponse[];
