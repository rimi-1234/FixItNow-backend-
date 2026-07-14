export interface IBookingCreatePayload {
  technicianId: string;
  serviceId: string;
  scheduledTime: string | Date;
}
