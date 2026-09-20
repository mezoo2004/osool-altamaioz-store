export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export type PublicCustomerReview = {
  id: string;
  status: ReviewStatus;
  rating: number;
  displayName: string;
  body: string;
  productSlug: string | null;
  productName: string | null;
  productImageUrl: string | null;
  imageUrl: string | null;
  verifiedPurchase: boolean;
  createdAt: string;
  /** Demo seed rows — must show badge, not presented as real customers */
  isDemoSeed: boolean;
};

export type ReviewSubmissionInput = {
  rating: number;
  body: string;
  productSlug?: string | null;
  imageStorageKey?: string | null;
  imagePreviewUrl?: string | null;
};

export type PendingReviewRecord = {
  id: string;
  status: "PENDING";
  rating: number;
  body: string;
  locale: "ar" | "en";
  displayName: string;
  customerId: string;
  productSlug: string | null;
  imageStorageKey: string | null;
  createdAt: string;
};
