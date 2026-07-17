import { Geist, Geist_Mono } from "next/font/google"
import { notFound } from "next/navigation"

import { DictionaryProvider } from "@/components/i18n/dictionary-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { hasLocale, locales, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { cn } from "@/lib/utils"

import "../globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const generateStaticParams = () =>
  locales.map((lang) => ({ lang }))

export default async function LangLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params

  if (!hasLocale(lang)) {
    notFound()
  }

  const locale = lang as Locale
  const dict = await getDictionary(locale)

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body>
        <ThemeProvider>
          <DictionaryProvider dict={dict} locale={locale}>
            {children}
          </DictionaryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
