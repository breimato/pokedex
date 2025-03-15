"use client"

import { useState, useEffect } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface FilterPanelProps {
  onFilterChange: (filters: FilterOptions) => void
}

export interface FilterOptions {
  types: string[]
  generations: number[]
}

// Mapeo de generaciones a rangos de IDs de Pokémon
const GENERATIONS = [
  { id: 1, name: "Generación I", range: [1, 151] },
  { id: 2, name: "Generación II", range: [152, 251] },
  { id: 3, name: "Generación III", range: [252, 386] },
  { id: 4, name: "Generación IV", range: [387, 493] },
  { id: 5, name: "Generación V", range: [494, 649] },
  { id: 6, name: "Generación VI", range: [650, 721] },
  { id: 7, name: "Generación VII", range: [722, 809] },
  { id: 8, name: "Generación VIII", range: [810, 905] },
  { id: 9, name: "Generación IX", range: [906, 1025] },
]

// Tipos de Pokémon
const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
]

export function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>([])

  // Actualizar filtros cuando cambian las selecciones
  useEffect(() => {
    onFilterChange({
      types: selectedTypes,
      generations: selectedGenerations,
    })
  }, [selectedTypes, selectedGenerations, onFilterChange])

  // Manejar selección de tipos
  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  // Manejar selección de generaciones
  const handleGenerationToggle = (genId: number) => {
    setSelectedGenerations((prev) => (prev.includes(genId) ? prev.filter((g) => g !== genId) : [...prev, genId]))
  }

  // Limpiar todos los filtros
  const clearFilters = () => {
    setSelectedTypes([])
    setSelectedGenerations([])
  }

  // Obtener color para el tipo de Pokémon
  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      normal: "#A8A878",
      fire: "#F08030",
      water: "#6890F0",
      electric: "#F8D030",
      grass: "#78C850",
      ice: "#98D8D8",
      fighting: "#C03028",
      poison: "#A040A0",
      ground: "#E0C068",
      flying: "#A890F0",
      psychic: "#F85888",
      bug: "#A8B820",
      rock: "#B8A038",
      ghost: "#705898",
      dragon: "#7038F8",
      dark: "#705848",
      steel: "#B8B8D0",
      fairy: "#EE99AC",
    }

    return typeColors[type] || "#777777"
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 mb-6 border border-gray-800 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse mr-2"></div>
          <h3 className="text-lg font-semibold text-white">Filtros Pokédex</h3>
        </div>
        {(selectedTypes.length > 0 || selectedGenerations.length > 0) && (
          <Button variant="ghost" onClick={clearFilters} className="text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors" aria-label="Limpiar todos los filtros">
            Limpiar filtros
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Filtro por tipo */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full bg-black/30 border-gray-700 hover:bg-black/50 transition-colors overflow-hidden relative"
              aria-label="Abrir filtro de tipo"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <span className="mr-auto">Tipo</span> 
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700">
            <DropdownMenuLabel>Tipos de Pokémon</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {POKEMON_TYPES.map((type) => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={selectedTypes.includes(type)}
                onCheckedChange={() => handleTypeToggle(type)}
              >
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getTypeColor(type) }} />
                  <span className="capitalize">{type}</span>
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filtro por generación */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full bg-black/30 border-gray-700 hover:bg-black/50 transition-colors overflow-hidden relative"
              aria-label="Abrir filtro de generación"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
              <span className="mr-auto">Generación</span> 
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700">
            <DropdownMenuLabel>Generaciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {GENERATIONS.map((gen) => (
              <DropdownMenuCheckboxItem
                key={gen.id}
                checked={selectedGenerations.includes(gen.id)}
                onCheckedChange={() => handleGenerationToggle(gen.id)}
              >
                {gen.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mostrar filtros activos */}
      {(selectedTypes.length > 0 || selectedGenerations.length > 0) && (
        <div className="border-t border-gray-800 pt-3 mt-2">
          <p className="text-xs text-gray-400 mb-2">Filtros activos:</p>
          <div className="flex flex-wrap gap-2">
            {selectedTypes.map((type) => (
              <Badge
                key={type}
                variant="outline"
                className="capitalize flex items-center gap-1 py-1 px-2"
                style={{ borderColor: getTypeColor(type), color: getTypeColor(type), backgroundColor: `${getTypeColor(type)}20` }}
              >
                {type}
                <button 
                  onClick={() => handleTypeToggle(type)} 
                  className="ml-1 rounded-full hover:bg-gray-800 p-0.5"
                  aria-label={`Eliminar filtro de tipo ${type}`}
                >
                  <Check className="h-3 w-3" />
                </button>
              </Badge>
            ))}

            {selectedGenerations.map((genId) => {
              const gen = GENERATIONS.find((g) => g.id === genId)
              return (
                <Badge key={genId} variant="outline" className="flex items-center gap-1 py-1 px-2 bg-gray-800/50 border-gray-700">
                  {gen?.name}
                  <button
                    onClick={() => handleGenerationToggle(genId)}
                    className="ml-1 rounded-full hover:bg-gray-800 p-0.5"
                    aria-label={`Eliminar filtro de generación ${gen?.name}`}
                  >
                    <Check className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
