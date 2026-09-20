export type Chapter = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  timecodes: string | null;
  notes: string | null;
  homework: string | null;
  position: number;
  isPublished: boolean;
  isFree: boolean;
  courseId: string;
  createdAt: string;
};

export type CreateChapterRequest = {
  title: string;
};

export type UpdateChapterRequest = {
  title?: string;
  description?: string;
  videoUrl?: string;
  timecodes?: string;
  notes?: string;
  homework?: string;
  isPublished?: boolean;
  isFree?: boolean;
};

export type DeleteChapterResponse = {
    success: boolean
};
