"use client";

import { usePathname, useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { locales } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

import { useDictionary, useLocale } from "./dictionary-provider";

export const LocaleSelect = ({ className }: { className?: string }) => {
  const dict = useDictionary();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (nextLocale: string) => {
    if (!locales.includes(nextLocale as Locale)) {
      return;
    }

    document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=31536000`;
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    router.push(segments.join("/") || `/${nextLocale}`);
  };

  return (
    <div data-slot="locale-select" className={cn(className)}>
      <Select
        value={locale}
        onValueChange={(value) => {
          if (typeof value === "string") {
            switchLocale(value);
          }
        }}
      >
        <SelectTrigger
          className="w-[8.5rem]"
          aria-label={dict.locale.label}
          size="sm"
        >
          <SelectValue>{dict.locale[locale]}</SelectValue>
        </SelectTrigger>
        <SelectContent align="end" alignItemWithTrigger={false}>
          {locales.map((item) => (
            <SelectItem key={item} value={item}>
              {dict.locale[item]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
