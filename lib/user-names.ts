import type { Locale } from "@/lib/i18n/config";

/** Name language keys used in user presets (`ch` maps from app locale `zh`). */
export type NameLocale = "ch" | "en" | "ja";

export interface LocalizedName {
  ch: string;
  en: string;
  ja: string;
}

export const nameLocaleFromAppLocale = (locale: Locale): NameLocale =>
  locale === "zh" ? "ch" : locale;

export const pickLocalizedName = (
  names: LocalizedName,
  locale: Locale
): string => {
  const key = nameLocaleFromAppLocale(locale);
  return names[key] || names.en || names.ch || names.ja;
};

/** Display name for a user in the current UI language (no alias). */
export const resolveUserName = (
  user: { names: LocalizedName },
  locale: Locale
): string => pickLocalizedName(user.names, locale);

/**
 * Name shown to `viewer` for `target`:
 * alias from viewer → target if present, otherwise target's localized name.
 */
export const resolveDisplayName = (
  viewer: { aliases?: Record<string, LocalizedName> } | undefined,
  target: { id: string; names: LocalizedName },
  locale: Locale
): string => {
  const key = nameLocaleFromAppLocale(locale);
  const alias = viewer?.aliases?.[target.id];
  if (alias?.[key]) {
    return alias[key];
  }
  return resolveUserName(target, locale);
};
