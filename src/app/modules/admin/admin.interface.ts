import { BookingStatus, Role, UserStatus } from '@prisma/client';

export interface IAdminUserFilters {
  role?: Role;
  status?: UserStatus;
  search?: string;
  page?: string;
  limit?: string;
}

export interface IAdminBookingFilters {
  status?: BookingStatus;
  page?: string;
  limit?: string;
}

export interface IUpdateUserStatusPayload {
  status: UserStatus;
}
