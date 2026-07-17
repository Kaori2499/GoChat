"use client"

import { Bell, MessageCircle } from "lucide-react"

import { useDictionary } from "@/components/i18n/dictionary-provider"
import { Button } from "@/components/ui/button"

import { useSessionStore } from "../hooks/use-session-store"

export const StudioModeToggle = () => {
  const mode = useSessionStore((state) => state.mode)
  const setMode = useSessionStore((state) => state.setMode)
  const dict = useDictionary()

  return (
    <div
      data-slot="studio-mode-toggle"
      className="flex items-center justify-center gap-2 pt-6"
    >
      <Button
        type="button"
        variant={mode === "notif" ? "default" : "outline"}
        aria-pressed={mode === "notif"}
        onClick={() => setMode("notif")}
      >
        <Bell />
        {dict.mode.notif}
      </Button>
      <Button
        type="button"
        variant={mode === "chat" ? "default" : "outline"}
        aria-pressed={mode === "chat"}
        onClick={() => setMode("chat")}
      >
        <MessageCircle />
        {dict.mode.chat}
      </Button>
    </div>
  )
}
