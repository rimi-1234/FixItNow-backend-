export interface IServicePayload {
  name: string;
  description: string;
  price: number;
  categoryId: string;
}

export interface IServiceUpdatePayload {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
}

export interface IServiceFilters {
  type?: string;
  location?: string;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}
