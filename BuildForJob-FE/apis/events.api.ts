import api from './axiosInstance';

export type EventStatus = 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
export type AttendanceStatus = 'NOT_VERIFIED' | 'VERIFIED' | 'ABSENT';
export type RefundStatus = 'NONE' | 'PENDING' | 'PROCESSED';

export interface EventOrganizer {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  jobTitle?: string | null;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  bannerUrl?: string | null;
  price: number; // paise
  venue: string;
  prize?: string | null;
  maxParticipants?: number | null;
  eventDate: string;
  contactInfo: string;
  organizerName: string;
  status: EventStatus;
  isListed: boolean;
  organizerId: string;
  organizer: EventOrganizer;
  _count: { registrations: number };
  isRegistered?: boolean;
  myAttendanceCode?: string | null;
  myAttendanceStatus?: AttendanceStatus | null;
  myRefundStatus?: RefundStatus | null;
  createdAt: string;
}

export interface EventRegistration {
  id: string;
  participantName: string;
  participantEmail: string;
  participantPhone?: string;
  amountPaid: number;
  attendanceStatus: AttendanceStatus;
  refundStatus: RefundStatus;
  attendanceCode?: string; // only in my-registrations
  createdAt: string;
  event: Event;
}

export interface HostRegistration {
  id: string;
  participantName: string;
  participantEmail: string;
  amountPaid: number;
  attendanceStatus: AttendanceStatus;
  refundStatus: RefundStatus;
  createdAt: string;
}

export interface EventStats {
  total: number;
  verified: number;
  absent: number;
  notVerified: number;
  totalRevenue: number;
  pendingRevenue: number;
}

export const eventsApi = {
  getAll: () => api.get<{ success: boolean; data: Event[] }>('/event').then((r) => r.data),

  getOne: (id: string) => api.get<{ success: boolean; data: Event }>(`/event/${id}`).then((r) => r.data),

  getMyEvents: () => api.get<{ success: boolean; data: Event[] }>('/event/my-events').then((r) => r.data),

  getMyRegistrations: () =>
    api.get<{ success: boolean; data: EventRegistration[] }>('/event/my-registrations').then((r) => r.data),

  getRegistrations: (eventId: string) =>
    api.get<{ success: boolean; data: { registrations: HostRegistration[]; stats: EventStats } }>(`/event/${eventId}/registrations`).then((r) => r.data),

  /** Step 1 for hosting: get ₹100 listing fee order */
  createListingOrder: () =>
    api.post<{ success: boolean; data: { orderId: string; amount: number; currency: string; keyId: string } }>('/event/listing/order').then((r) => r.data),

  /** Step 2: create event with verified payment + form data */
  createEvent: (formData: FormData) =>
    api.post<{ success: boolean; data: Event }>('/event', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),

  /** Step 1 for attending: get entry fee order */
  createRegistrationOrder: (eventId: string) =>
    api.post<{ success: boolean; data: { orderId: string; amount: number; currency: string; keyId: string } }>(`/event/${eventId}/register/order`).then((r) => r.data),

  /** Step 2: verify entry payment & get attendance code */
  verifyRegistration: (eventId: string, payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    participantName: string;
    participantEmail: string;
    participantPhone: string;
  }) =>
    api.post<{ success: boolean; data: { attendanceCode: string; registrationId: string } }>(`/event/${eventId}/register/verify`, payload).then((r) => r.data),

  /** Host verifies attendance code at venue */
  verifyAttendance: (eventId: string, code: string) =>
    api.post<{ success: boolean; message: string; data: { participantName: string } }>(`/event/${eventId}/verify-attendance`, { code }).then((r) => r.data),

  /** Host cancels event */
  cancelEvent: (eventId: string) =>
    api.post<{ success: boolean; message: string }>(`/event/${eventId}/cancel`).then((r) => r.data),
};
