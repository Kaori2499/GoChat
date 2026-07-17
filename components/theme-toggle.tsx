"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { useDictionary } from "@/components/i18n/dictionary-provider"
import { Button } from "@/components/ui/button"

export const ThemeToggle = ({ className }: { className?: string }) => {
  const { resolvedTheme, setTheme } = useTheme()
  const dict = useDictionary()
  const isDark = resolvedTheme === "dark"

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={className}
      aria-label={isDark ? dict.theme.toLight : dict.theme.toDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Sun className="hidden dark:block" />
      <Moon className="dark:hidden" />
    </Button>
  )
}
