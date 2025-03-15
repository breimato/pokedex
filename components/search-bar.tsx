"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface SearchBarProps {
  onSearch: (term: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Actualizar el término de búsqueda en el componente padre cuando cambia
  useEffect(() => {
    onSearch(searchTerm.toLowerCase())
  }, [searchTerm, onSearch])

  return (
    <div className="flex flex-col gap-2 max-w-md mx-auto">
      <div className="relative w-full">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center">
          <Search className="h-5 w-5 text-red-300" />
        </div>
        <Input
          type="text"
          placeholder="Buscar Pokémon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-black/20 text-white border-gray-700 pl-10 rounded-full h-12 placeholder:text-gray-300 transition-all duration-200 focus:ring-2 focus:ring-yellow-400 focus:border-transparent hover:bg-black/30"
        />
      </div>
      <div className="flex justify-center gap-2 mt-1">
        <div className="w-2 h-2 rounded-full bg-red-400"></div>
        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
        <div className="w-2 h-2 rounded-full bg-green-400"></div>
      </div>
    </div>
  )
}
