"use client"

import { Check, Circle, Map } from "lucide-react"
import { useEffect, useState } from "react"

import {
  useDictionary,
  useLocale,
} from "@/components/i18n/dictionary-provider"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  formatRoadmapCreatedTime,
  type Roadmap,
  type RoadmapItem,
} from "@/lib/roadmap"
import { cn } from "@/lib/utils"

export const RoadmapButton = ({ className }: { className?: string }) => {
  const dict = useDictionary()
  const locale = useLocale()
  const [items, setItems] = useState<RoadmapItem[]>([])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const response = await fetch("/roadmap.json")
        if (!response.ok) {
          return
        }
        const data = (await response.json()) as Roadmap
        if (!cancelled) {
          setItems(data.items ?? [])
        }
      } catch {
        // Keep empty list if roadmap cannot be loaded.
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ size: "icon", variant: "outline" }),
          className,
        )}
        aria-label={dict.roadmap.label}
      >
        <Map />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="top"
        sideOffset={8}
        className="w-72 min-w-72"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>{dict.roadmap.label}</DropdownMenuLabel>
          {items.length === 0 ? (
            <DropdownMenuItem disabled className="text-muted-foreground">
              {dict.roadmap.empty}
            </DropdownMenuItem>
          ) : (
            items.map((item) => {
              const isCompleted = item.status === "completed"
              return (
                <DropdownMenuItem
                  key={item.id}
                  disabled
                  className="items-start gap-2 opacity-100 data-disabled:opacity-100"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-4 shrink-0 items-center justify-center",
                      isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                    aria-hidden
                  >
                    {isCompleted ? (
                      <Check className="size-3.5" />
                    ) : (
                      <Circle className="size-3" />
                    )}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span
                      className={cn(
                        "text-sm leading-snug whitespace-normal",
                        isCompleted && "text-muted-foreground line-through",
                      )}
                    >
                      {item.title}
                    </span>
                    <span className="text-[0.7rem] text-muted-foreground">
                      {isCompleted
                        ? dict.roadmap.status.completed
                        : dict.roadmap.status.pending}
                      {" · "}
                      {formatRoadmapCreatedTime(item.createdTime, locale)}
                    </span>
                  </span>
                </DropdownMenuItem>
              )
            })
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
