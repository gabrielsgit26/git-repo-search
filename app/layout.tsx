import { Geist_Mono, Noto_Sans_JP, Noto_Serif_JP } from "next/font/google"

import "./globals.css"
import { SearchStateProvider } from "@/components/search-state-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

const notoSans = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-sans" })
const notoSerif = Noto_Serif_JP({ subsets: ["latin"], variable: "--font-serif" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ja"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", notoSans.variable, notoSerif.variable)}
    >
      <body>
        <ThemeProvider>
          <SearchStateProvider>{children}</SearchStateProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
