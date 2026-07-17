"use client"

import { createContext, useContext, type ReactNode } from "react"

import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/get-dictionary"

const DictionaryContext = createContext<{
  dict: Dictionary
  locale: Locale
} | null>(null)

export const DictionaryProvider = ({
  dict,
  locale,
  children,
}: {
  dict: Dictionary
  locale: Locale
  children: ReactNode
}) => (
  <DictionaryContext.Provider value={{ dict, locale }}>
    {children}
  </DictionaryContext.Provider>
)

export const useDictionary = (): Dictionary => {
  const context = useContext(DictionaryContext)
  if (!context) {
    throw new Error("useDictionary must be used within DictionaryProvider")
  }
  return context.dict
}

export const useLocale = (): Locale => {
  const context = useContext(DictionaryContext)
  if (!context) {
    throw new Error("useLocale must be used within DictionaryProvider")
  }
  return context.locale
}
