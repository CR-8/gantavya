"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import Navbar from "@/components/layout/nav"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>
    <Navbar/>
    {children}
    </NextThemesProvider>
}