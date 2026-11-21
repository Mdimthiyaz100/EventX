import { eventService } from "../event.service";

export async function getPublicCategories(): Promise<string[]> {
  return eventService.getCategories();
}

export async function getPublicCities(): Promise<string[]> {
  return eventService.getCities();
}

export default {
  getPublicCategories,
  getPublicCities,
};
