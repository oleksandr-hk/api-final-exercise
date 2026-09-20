export type CreatePromoCodeRequest = {
  code: string;
  discountPercent?: number;
  maxUses?: number;
  expiresAt?: string;
};

export type CreatePromoCodeResponse = {
  id: string;
  code: string;
  courseId: string;
  discountPercent: number;
  maxUses: number | null;
  currentUses: number;
  expiresAt: string;
  isActive: boolean;
  _count: {
    usages: number;
  };
  createdAt: string;
};

export type PromoCodesResponse = CreatePromoCodeResponse[];

export type ValidatePromoCodeResponse =
   {
      valid: boolean;
      discountPercent: number;
      originalPrice: number;
      finalPrice: number;
      error: string;
   }
