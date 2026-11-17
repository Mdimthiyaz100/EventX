export interface EventTicketType {
  id: string;
  name: string;
  price: number | string;
  capacity: number;
  sold: number;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  location?: string;
  venue: string;
  imageUrl?: string;
  startAt: string;
  startDate?: string;
  endAt?: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  featured?: boolean;
  price?: number;
  ticketTypes?: EventTicketType[];
  organizer?: {
    id: string;
    name: string;
  };
}

export interface MovieItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  language: string;
  genre: string;
  duration: number;
  certification: string;
  releaseDate: string;
  posterUrl: string;
  bannerUrl?: string | null;
  trailerUrl?: string | null;
  director: string;
  cast: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured?: boolean;
}
