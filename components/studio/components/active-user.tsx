"use client"

import { useDictionary } from "@/components/i18n/dictionary-provider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useSessionStore } from "../hooks/use-session-store"
import { NONE_USER } from "../lib/studio.lib"

export const StudioActiveUser = () => {
  const activeUserId = useSessionStore((state) => state.activeUserId)
  const setActiveUserId = useSessionStore((state) => state.setActiveUserId)
  const usersById = useSessionStore((state) => state.usersById)
  const users = Object.values(usersById)
  const dict = useDictionary()

  return (
    <div data-slot="studio-active-user">
      <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {dict.activeUser.label}
      </p>
      <Select
        value={activeUserId}
        onValueChange={(value) => {
          if (typeof value === "string") {
            setActiveUserId(value)
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={dict.activeUser.none}>
            {activeUserId === NONE_USER
              ? dict.activeUser.none
              : usersById[activeUserId]?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="start" alignItemWithTrigger={false}>
          <SelectItem value={NONE_USER}>{dict.activeUser.none}</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              <img
                src={user.avatarUrl}
                alt=""
                className="size-5 rounded-full object-cover"
              />
              {user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
