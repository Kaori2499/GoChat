import type { CSSProperties } from "react";

import type { ChatTheme, ChatThemeId } from "./chat.types";

export const CHAT_FONT =
  '-apple-system, "Hiragino Sans", "Yu Gothic", "Helvetica Neue", sans-serif';

export const CHAT_RADIUS = "1.125rem";

export const chatThemes: ChatTheme[] = [
  {
    colors: {
      accent: "#34c759",
      background: "#bddfe6",
      border: "#d1d1d6",
      bubbleReceived: "#ffffff",
      bubbleReceivedText: "#1c1c1e",
      bubbleSent: "#B4E1EB",
      bubbleSentText: "#1c1c1e",
      header: "#f7f7f7",
      headerText: "#1c1c1e",
      icon: "#1c1c1e",
      input: "#f7f7f7",
      inputText: "#1c1c1e",
      muted: "#8e8e93",
      surface: "#ffffff",
    },
    id: "light",
    name: "Light",
    pattern:
      "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)",
  },
  {
    colors: {
      accent: "#34c759",
      background: "#1a2a2e",
      border: "#3a3a3c",
      bubbleReceived: "#2c2c2e",
      bubbleReceivedText: "#f2f2f7",
      bubbleSent: "#B4E1EB",
      bubbleSentText: "#1c1c1e",
      header: "#1c1c1e",
      headerText: "#f2f2f7",
      icon: "#f2f2f7",
      input: "#1c1c1e",
      inputText: "#f2f2f7",
      muted: "#8e8e93",
      surface: "#1c1c1e",
    },
    id: "dark",
    name: "Dark",
  },
];

export const getChatTheme = (themeId: ChatThemeId = "light"): ChatTheme =>
  chatThemes.find((theme) => theme.id === themeId) ?? chatThemes[0];

export const chatThemeStyle = (theme: ChatTheme): CSSProperties => {
  const { colors } = theme;
  return {
    "--bubble-received": colors.bubbleReceived,
    "--bubble-received-text": colors.bubbleReceivedText,
    "--bubble-sent": colors.bubbleSent,
    "--bubble-sent-text": colors.bubbleSentText,
    "--chat-accent": colors.accent,
    "--chat-bg": colors.background,
    "--chat-border": colors.border,
    "--chat-header": colors.header,
    "--chat-header-text": colors.headerText,
    "--chat-icon": colors.icon,
    "--chat-input": colors.surface,
    "--chat-input-inner": colors.input,
    "--chat-muted": colors.muted,
    "--chat-pattern": theme.pattern ?? "none",
    "--chat-radius": CHAT_RADIUS,
    "--chat-surface": colors.surface,
    "--chat-text": colors.inputText,
    "--layout-font-body": CHAT_FONT,
    "--layout-font-header": CHAT_FONT,
    fontFamily: CHAT_FONT,
  } as CSSProperties;
};
