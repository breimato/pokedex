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
    <div className="flex gap-2 max-w-md mx-auto mb-6">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar Pokémon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-gray-900 border-gray-700 pl-10"
        />
      </div>
    </div>
  )
}

