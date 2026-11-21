import { userService, type UserProfile } from "../user.service";

export type { UserProfile };

export async function getUserProfile(): Promise<UserProfile> {
  return userService.getProfile();
}

export async function updateUserProfile(payload: { name?: string; phone?: string }): Promise<UserProfile> {
  return userService.updateProfile(payload);
}

export default {
  getUserProfile,
  updateUserProfile,
};
