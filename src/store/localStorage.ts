import { MAX_SELECTED_COINS } from "../constants";

const SELECTED_COINS_KEY = "cryptonite:selected-coins";

export function loadSelectedCoinIds(): string[] {
  try {
    const rawValue = localStorage.getItem(SELECTED_COINS_KEY);
    const parsed = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsed)
      ? parsed.filter((value) => typeof value === "string").slice(0, MAX_SELECTED_COINS)
      : [];
  } catch {
    return [];
  }
}

export function saveSelectedCoinIds(ids: string[]) {
  localStorage.setItem(SELECTED_COINS_KEY, JSON.stringify(ids.slice(0, MAX_SELECTED_COINS)));
}
