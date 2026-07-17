"use client";

import { X } from "lucide-react";

import { useDictionary } from "@/components/i18n/dictionary-provider";
import { cn } from "@/lib/utils";

import type { NotifHeaderProps } from "./notif.types";

const NotifHeader = ({ title, onClose, className }: NotifHeaderProps) => {
  const dict = useDictionary();
  const resolvedTitle = title ?? dict.notif.centerTitle;

  return (
    <header
      data-slot="notif-header"
      className={cn(
        "relative z-10 flex shrink-0 items-center px-4 pb-2.5 text-white",
        className
      )}
    >
      <h1 className="min-w-0 flex-1 text-left text-[1.15rem] tracking-tight drop-shadow-md">
        {resolvedTitle}
      </h1>
      <button
        type="button"
        aria-label={dict.notif.clearAll}
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-muted-foreground transition-colors hover:opacity-90"
        onClick={onClose}
      >
        <X className="size-3" strokeWidth={2.5} />
      </button>
    </header>
  );
};

NotifHeader.displayName = "Notif.Header";

export { NotifHeader };
