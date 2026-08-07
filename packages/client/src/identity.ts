const TOKEN_KEY = "moon.token";
const PROFILE_KEY = "moon.profile";

export function getOrCreateToken(): string {
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(TOKEN_KEY, token);
  }
  return token;
}

export interface SavedProfile {
  name: string;
  classId: string;
  raceId?: string;
}

export function getSavedProfile(): SavedProfile | null {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveProfile(profile: SavedProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
