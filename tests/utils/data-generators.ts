import { faker } from "@faker-js/faker";
import { RegisterUserRequest } from "../types/auth/auth";
import {
  CreateCourseRequest,
  UpdateCourseRequest,
} from "../types/courses/course";
import {
  CreateChapterRequest,
  UpdateChapterRequest,
} from "../types/chapters/chapter";
import { CreateTagRequest } from "../types/tags/tag";
import { CreatePostRequest } from "../types/posts/post";
import { CreatePromoCodeRequest } from "../types/promo-codes/promo-code";
import {
  Certificate,
  Instructor,
  learningPathModule,
  YouTubeVideo,
} from "../types/learning-path/path";

/** Builds valid user data for register */
export function buildNewUser(): RegisterUserRequest {
  return {
    name: faker.person.firstName().toLowerCase(),
    email:
      faker.string.alpha({
        length: 10,
        casing: "lower",
      }) + "@gmail.com",
    password: `A1${faker.string.alphanumeric({ length: 10 })}`,
  };
}

export function generateRandomAlphabeticalString(length: number): string {
  return faker.string.alpha({
    length,
  });
}

export function generateRandomNumber(): bigint {
  return faker.number.bigInt();
}

/** Generate a random course */
export function generateRandomCourse(titleLength: number): CreateCourseRequest {
  return {
    title: generateRandomAlphabeticalString(titleLength),
  };
}

/** Generate valid random data for updating a course */
export function generateRandomUpdatedCourse(): UpdateCourseRequest {
  return {
    title: `Course title ${generateRandomAlphabeticalString(10)}`,
    description: faker.lorem.paragraph(),
    imageUrl: faker.image.url(),
    price: faker.number.float({ min: 10, max: 200, fractionDigits: 2 }),
    categoryIds: [],
    outcomes: [faker.lorem.sentence(), faker.lorem.sentence()],
    requirements: [faker.lorem.sentence(), faker.lorem.sentence()],
    authorName: faker.person.fullName(),
    authorRole: faker.person.jobTitle(),
  };
}

/** Generate valid random data for creating a chapter */
export function generateRandomChapter(titleLength = 10): CreateChapterRequest {
  return {
    title: `Chapter ${generateRandomAlphabeticalString(titleLength)}`,
  };
}

/** Generate valid random data for updating a chapter */
export function generateRandomUpdatedChapter(): UpdateChapterRequest {
  return {
    title: `Chapter title - ${generateRandomNumber()}`,
    description: faker.lorem.sentence(),
    videoUrl: faker.internet.url(),
    timecodes: "00:00 Introduction, 05:00 Main topic, 10:00 Summary",
    notes: faker.lorem.paragraph(),
    homework: faker.lorem.sentence(),
    isPublished: faker.datatype.boolean(),
    isFree: faker.datatype.boolean(),
  };
}

/** Generate valid random data for creating a tag */
export function generateRandomTag(nameLength = 10): CreateTagRequest {
  return {
    name: `Tag ${generateRandomAlphabeticalString(nameLength)}`,
  };
}

/** Generate a random post with title only */
export function generateMinRequiredPost(
  titleLength: number,
): CreatePostRequest {
  return {
    title: `Title ${generateRandomAlphabeticalString(titleLength)}`,
  };
}

/** Generate a random post with all supported fields */
export function generatePostWithData(
  titleLength = 10,
  isPublished = false,
  tagIds: string[] = [],
): CreatePostRequest {
  return {
    title: `Title ${generateRandomAlphabeticalString(titleLength)}`,
    excerpt: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(2),
    imageUrl: faker.image.url(),
    tagIds,
    isPublished,
  };
}

/** Generate valid random data for creating a promo code */
export function generatePromoCode(
  maxUses?: number,
): CreatePromoCodeRequest {
  return {
    code: `PROMO-${faker.string.alpha({ length: 8, casing: "upper" })}`,
    discountPercent: faker.number.int({ min: 1, max: 100 }),
    maxUses,
    expiresAt: faker.date.future({ years: 1 }).toISOString(),
  };
}

/** Generate valid instructor data for creating a learning path */
export function generateRandomInstructor(): Instructor {
  const timestamp = new Date().toISOString();
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    bio: faker.person.bio(),
    avatarUrl: faker.image.avatar(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/** Generate valid certificate data for creating a learning path */
export function generateRandomCertificate(): Certificate {
  const timestamp = new Date().toISOString();
  return {
    id: faker.string.uuid(),
    learningPathId: faker.string.uuid(),
    name: `${faker.helpers.arrayElement(["Completion", "Achievement"])} Certificate`,
    description: faker.lorem.sentence(),
    templateUrl: faker.internet.url(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/** Generate valid module data for creating a learning path */
export function generateRandomLearningPathModules(
  count = 2,
): learningPathModule[] {
  return Array.from({ length: count }, (_, position) => {
    const timestamp = new Date().toISOString();
    return {
      id: faker.string.uuid(),
      learningPathId: faker.string.uuid(),
      title: `Module ${position + 1}: ${faker.lorem.words(3)}`,
      description: faker.lorem.sentence(),
      position: position + 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  });
}

/** Generate valid YouTube video data for creating a learning path */
export function generateRandomLearningPathVideo(): YouTubeVideo {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.words(4),
    description: faker.lorem.sentence(),
    videoId: faker.string.alphanumeric(11),
    position: 0,
    isPublished: true,
    createdAt: new Date().toISOString(),
  };
}
