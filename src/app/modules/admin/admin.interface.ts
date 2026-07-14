import { BookingStatus, Role, UserStatus } from '@prisma/client';

export interface IAdminUserFilters {
  role?: Role;
  status?: UserStatus;
  search?: string;
}

export interface IAdminBookingFilters {
  status?: BookingStatus;
}

export interface IUpdateUserStatusPayload {
  status: UserStatus;
}
