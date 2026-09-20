export type PurchasedCourse = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
};

export type CreatePurchaseResponse = {
  id: string;
  userId: string;
  courseId: string;
  amount: string;
  promoCode: string | null;
  course: PurchasedCourse;
  createdAt: string;
};

export type PurchasesResponse = CreatePurchaseResponse[];
