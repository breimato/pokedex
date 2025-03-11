"use client"

import { useState } from "react"
import { PokemonList } from "@/components/pokemon-list"
import { SearchBar } from "@/components/search-bar"

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Pokédex</h1>
        <SearchBar onSearch={setSearchTerm} />
        <PokemonList searchTerm={searchTerm} />
      </div>
    </main>
  )
}

