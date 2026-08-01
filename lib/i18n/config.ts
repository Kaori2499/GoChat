export const locales = ["zh", "en", "ja"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "zh";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  ja: "日本語",
  zh: "中文",
};

export const hasLocale = (locale: string): locale is Locale =>
  (locales as readonly string[]).includes(locale);
