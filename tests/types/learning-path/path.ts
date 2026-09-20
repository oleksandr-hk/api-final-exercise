import { Category } from "../courses/course";

export type Instructor = {
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  id: string;
  name: string;
  updatedAt: string;
};

export type Certificate = {
  createdAt: string;
  description?: string;
  id: string;
  learningPathId: string;
  name: string;
  templateUrl?: string;
  updatedAt: string;
};

export type learningPathModule = {
  createdAt: string;
  description?: string;
  id: string;
  learningPathId: string;
  position: number;
  title: string;
  updatedAt: string;
};

export type YouTubeVideo = {
  createdAt: string;
  description?: string;
  id: string;
  isPublished: boolean;
  position: number;
  title: string;
  videoId: string;
};

export type CreateLearningPathRequest = {
  title: string;
  description?: string;
  modules?: learningPathModule[];
  categoryIds?: string[];
  video?: YouTubeVideo;
  certificate?: Certificate;
  instructor: Instructor;
};

export type LearningPath = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  modules: learningPathModule[];
  categories: Category[];
  video: YouTubeVideo | null;
  certificate: Certificate | null;
  instructor: Instructor;
};
