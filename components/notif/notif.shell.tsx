"use client";

import { useTheme } from "next-themes";

import { getChatTheme } from "@/components/chat/chat.theme";
import type { ChatThemeId } from "@/components/chat/chat.types";
import { cn } from "@/lib/utils";

import type { NotifShellProps } from "./notif.types";

const NotifShell = ({
  className,
  style,
  wallpaperUrl,
  wallpaperOpacity = 1,
  children,
  ref,
  ...props
}: NotifShellProps) => {
  const { resolvedTheme } = useTheme();
  const themeId = (resolvedTheme === "dark" ? "dark" : "light") as ChatThemeId;
  const fallbackBg = getChatTheme(themeId).colors.background;

  return (
    <div
      ref={ref}
      data-slot="notif"
      className={cn(
        "relative isolate flex h-full w-full flex-col overflow-hidden text-white",
        className
      )}
      style={{ backgroundColor: fallbackBg, ...style }}
      {...props}
    >
      {wallpaperUrl ? (
        <img
          src={wallpaperUrl}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ opacity: wallpaperOpacity }}
          aria-hidden
        />
      ) : null}
      <div className="relative z-10 flex h-full min-h-0 flex-col">
        {children}
      </div>
    </div>
  );
};

NotifShell.displayName = "Notif";

export { NotifShell };
