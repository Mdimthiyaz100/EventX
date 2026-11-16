export type EventCategory = "Music" | "Tech" | "Food" | "Sports" | "Festival";

export interface EventSummary {
  id: string;
  title: string;
  category: EventCategory;
  location: string;
  startDate: string;
  price: number;
  imageUrl: string;
  description: string;
}

export interface EventSearchCriteria {
  query: string;
  city: string;
  date: string;
}
