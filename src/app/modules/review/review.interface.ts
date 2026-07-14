export interface IReviewCreatePayload {
  bookingId: string;
  rating: number;
  comment?: string;
}
