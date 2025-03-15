"use client"

import { useState } from "react"
import { PokemonList } from "@/components/pokemon-list"
import { SearchBar } from "@/components/search-bar"

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="container mx-auto py-4">
        {/* Pokédex Header */}
        <div className="bg-red-600 rounded-t-lg shadow-lg p-6 mb-4 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-6 left-6 w-16 h-16 rounded-full bg-white border-4 border-gray-200 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-blue-500 animate-pulse border-2 border-white"></div>
          </div>
          
          {/* Small indicator lights */}
          <div className="flex gap-3 absolute top-6 right-6">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          
          <div className="flex justify-between items-center mt-14 mb-2 px-8">
            <div className="w-3 h-10 bg-red-500/20 rounded-sm"></div>
            <div className="h-10 w-32 bg-red-500/10 rounded-md flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-red-500/30 animate-pulse"></div>
            </div>
            <div className="w-3 h-10 bg-red-500/20 rounded-sm"></div>
          </div>
          <div className="h-2 bg-black/20 rounded-full mb-1"></div>
          <div className="h-1 bg-black/10 rounded-full mb-6"></div>
          
          <SearchBar onSearch={setSearchTerm} />
        </div>
        <PokemonList searchTerm={searchTerm} />
      </div>
    </main>
  )
}
