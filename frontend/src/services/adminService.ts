import { apiRequest } from "./api";

export interface DashboardStats {
  users: number;
  organizers: number;
  events: number;
  pendingEvents: number;
  comedyShows?: number;
  diningPartners?: number;
  bookings: number;
  totalMovies: number;
  activeMovies: number;
  upcomingMovies: number;
  settledPayments: number;
  grossRevenue: number | string;
  revenueByMonth: { key: string; month: string; revenue: number }[];
  bookingStats: { status: string; count: number }[];
  recentBookings: Array<{
    id: string;
    status: string;
    totalAmount: number | string;
    currency: string;
    createdAt: string;
    user: { name: string; email: string };
    event: { title: string };
    payment: { status: string; amount: number | string; currency: string } | null;
  }>;
  latestMovies: Array<{
    id: string;
    title: string;
    posterUrl: string;
    status: string;
    releaseDate: string;
    language: string;
    createdAt: string;
  }>;
  recentEvents: Array<{
    id: string;
    title: string;
    category: string;
    city: string;
    startAt: string;
    status: string;
    imageUrl: string | null;
    createdAt: string;
  }>;
}

export interface AdminEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  venue: string;
  imageUrl: string | null;
  startAt: string;
  endAt: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  featured: boolean;
  createdAt: string;
  organizer: { id: string; name: string; email: string };
  ticketTypes: Array<{
    id: string;
    name: string;
    price: number | string;
    capacity: number;
    sold: number;
  }>;
  _count?: { bookings: number };
}

export interface EventInput {
  title: string;
  description: string;
  category: string;
  city: string;
  venue: string;
  imageUrl?: string;
  startAt: string;
  endAt: string;
  status?: "DRAFT" | "PUBLISHED";
  featured?: boolean;
  ticketTypes: Array<{ name: string; price: number; capacity: number }>;
}

export interface AdminBooking {
  id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";
  totalAmount: number | string;
  currency: string;
  createdAt: string;
  user: { id: string; name: string; email: string; phone?: string | null };
  event: { id: string; title: string; city: string; venue?: string };
  payment: { status: string; amount: number | string; currency: string } | null;
  _count: { items: number };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "CUSTOMER" | "ORGANIZER" | "ADMIN";
  organizerApproved: boolean;
  createdAt: string;
  _count: { bookings: number; events: number };
}

export interface AdminCategory {
  name: string;
  events: number;
  movies: number;
}

export interface PaginatedResult<T> {
  events?: T[];
  bookings?: T[];
  users?: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function getAdminDashboard(): Promise<DashboardStats> {
  return apiRequest<DashboardStats>("GET", "/admin/dashboard");
}

export async function listAdminEvents(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
}): Promise<{ events: AdminEvent[]; pagination: PaginatedResult<AdminEvent>["pagination"] }> {
  return apiRequest("GET", "/admin/events", undefined, params);
}

export async function getAdminEvent(id: string): Promise<AdminEvent> {
  return apiRequest<AdminEvent>("GET", `/admin/events/${encodeURIComponent(id)}`);
}

export async function createAdminEvent(data: EventInput): Promise<AdminEvent> {
  return apiRequest<AdminEvent>("POST", "/admin/events", data);
}

export async function updateAdminEvent(id: string, data: Partial<EventInput>): Promise<AdminEvent> {
  return apiRequest<AdminEvent>("PUT", `/admin/events/${encodeURIComponent(id)}`, data);
}

export async function deleteAdminEvent(id: string): Promise<AdminEvent> {
  return apiRequest<AdminEvent>("DELETE", `/admin/events/${encodeURIComponent(id)}`);
}

export async function reviewAdminEvent(id: string, publish: boolean): Promise<AdminEvent> {
  return apiRequest<AdminEvent>("PATCH", `/admin/events/${encodeURIComponent(id)}/review`, { publish });
}

export async function listAdminBookings(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<{ bookings: AdminBooking[]; pagination: PaginatedResult<AdminBooking>["pagination"] }> {
  return apiRequest("GET", "/admin/bookings", undefined, params);
}

export async function listAdminUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}): Promise<{ users: AdminUser[]; pagination: PaginatedResult<AdminUser>["pagination"] }> {
  return apiRequest("GET", "/admin/users", undefined, params);
}

export async function updateOrganizerApproval(id: string, approved: boolean): Promise<{ success: boolean }> {
  return apiRequest("PATCH", `/admin/organizers/${encodeURIComponent(id)}/approval`, { approved });
}

export async function listAdminCategories(): Promise<AdminCategory[]> {
  return apiRequest<AdminCategory[]>("GET", "/admin/categories");
}
