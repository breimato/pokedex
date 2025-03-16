import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "../styles/pokemon-types.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pokédex - Explora el mundo Pokémon",
  description: "Descubre información sobre todos los Pokémon con nuestra Pokédex interactiva"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}