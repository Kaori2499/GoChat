"use client";

import type { ReactNode } from "react";

import { LocaleSelect } from "@/components/i18n/locale-select";
import { RoadmapButton } from "@/components/roadmap-button";
import { ThemeToggle } from "@/components/theme-toggle";

export const StudioShell = ({ children }: { children: ReactNode }) => (
  <div data-slot="studio" className="relative flex min-h-svh flex-col">
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between px-6 pt-6">
      <ThemeToggle className="pointer-events-auto" />
      <LocaleSelect className="pointer-events-auto" />
    </header>
    <div className="pointer-events-none absolute bottom-0 left-0 z-20 p-6">
      <RoadmapButton className="pointer-events-auto" />
    </div>
    {children}
  </div>
);

StudioShell.displayName = "Studio";
