"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import "@/styles/search-input.css"

interface SearchBarProps {
  onSearch: (term: string) => void
}

// Función de debounce para limitar las llamadas a la API
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  
  // Crear una versión debounced de la función onSearch
  const debouncedSearch = debounce((term: string) => {
    // Solo realizar la búsqueda si hay texto
    if (term.trim().length > 0) {
      onSearch(term.toLowerCase())
    } else {
      // Si no hay texto, limpiar los resultados
      onSearch("")
    }
  }, 300) // 300ms de retraso
  
  // Efecto para realizar la búsqueda cuando cambia el término
  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm])
  
  return (
    <div className="flex flex-col gap-2 max-w-md mx-auto">
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Buscar Pokémon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="flex justify-center gap-2 mt-1">
      </div>
    </div>
  )
}
