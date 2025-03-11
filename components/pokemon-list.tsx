"use client"

import { useState, useEffect, useMemo } from "react"
import { PokemonCard, type PokemonDetails } from "@/components/pokemon-card"
import { FilterPanel, type FilterOptions } from "@/components/filter-panel"
import { PokemonCompare } from "@/components/pokemon-compare"
import { Button } from "@/components/ui/button"
import { Loader2, BarChart2 } from "lucide-react"
import Image from "next/image"

interface Pokemon {
  name: string
  url: string
}

interface PokemonListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Pokemon[]
}

interface PokemonListProps {
  searchTerm?: string
}

// Mapeo de generaciones a rangos de IDs de Pokémon
const GENERATIONS = [
  { id: 1, range: [1, 151] },
  { id: 2, range: [152, 251] },
  { id: 3, range: [252, 386] },
  { id: 4, range: [387, 493] },
  { id: 5, range: [494, 649] },
  { id: 6, range: [650, 721] },
  { id: 7, range: [722, 809] },
  { id: 8, range: [810, 905] },
  { id: 9, range: [906, 1025] },
]

export function PokemonList({ searchTerm = "" }: PokemonListProps) {
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([])
  const [nextUrl, setNextUrl] = useState<string | null>("https://pokeapi.co/api/v2/pokemon?limit=20")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [filters, setFilters] = useState<FilterOptions>({ types: [], generations: [] })
  const [pokemonDetails, setPokemonDetails] = useState<Record<string, PokemonDetails>>({})
  const [isFilterLoading, setIsFilterLoading] = useState(false)

  // Estado para el comparador
  const [compareMode, setCompareMode] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState<PokemonDetails[]>([])
  const [showCompareModal, setShowCompareModal] = useState(false)

  const fetchPokemon = async () => {
    if (!nextUrl) return

    setLoading(true)
    try {
      const response = await fetch(nextUrl)
      const data: PokemonListResponse = await response.json()

      setAllPokemon((prev) => [...prev, ...data.results])
      setNextUrl(data.next)
    } catch (error) {
      console.error("Error fetching Pokémon:", error)
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }

  useEffect(() => {
    // Limpiar el estado cuando se monta el componente
    setAllPokemon([])
    setNextUrl("https://pokeapi.co/api/v2/pokemon?limit=20")
    setPokemonDetails({})
    setSelectedForCompare([])
    
    fetchPokemon()
  }, [])

  // Efecto para cargar todos los Pokémon cuando se aplica un filtro
  useEffect(() => {
    const fetchAllPokemon = async () => {
      // Solo cargamos todos los Pokémon si se aplica un filtro y no tenemos muchos Pokémon cargados
      if ((filters.types.length > 0 || filters.generations.length > 0) && allPokemon.length < 300) {
        setIsFilterLoading(true)

        try {
          // Cargamos todos los Pokémon (o un número alto)
          const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=600")
          const data = await response.json()

          // Al cargar todos, ya no necesitamos la paginación
          setAllPokemon(data.results)
          setNextUrl(null)

          // Si hay filtro de tipo, necesitamos cargar detalles para todos
          if (filters.types.length > 0) {
            // Cargamos los 100 primeros detalles para filtrar por tipo
            // (podríamos optimizar esto más adelante)
            const detailsPromises = data.results.slice(0, 300).map(async (pokemon: Pokemon) => {
              try {
                const response = await fetch(pokemon.url)
                const pokemonData = await response.json()
                return pokemonData
              } catch (error) {
                console.error(`Error fetching details for ${pokemon.name}:`, error)
                return null
              }
            })

            const detailsResults = await Promise.all(detailsPromises)
            const newDetails: Record<string, PokemonDetails> = {}

            detailsResults.forEach((pokemon) => {
              if (pokemon) {
                newDetails[pokemon.name] = pokemon
              }
            })

            setPokemonDetails((prev) => ({ ...prev, ...newDetails }))
          }
        } catch (error) {
          console.error("Error fetching all Pokémon:", error)
        } finally {
          setIsFilterLoading(false)
        }
      }
    }

    fetchAllPokemon()
  }, [filters, allPokemon.length])

  // Manejar la selección para comparar
  const handleCompare = (pokemon: PokemonDetails) => {
    setSelectedForCompare((prev) => {
      // Si ya está seleccionado, quitarlo
      if (prev.some((p) => p.id === pokemon.id)) {
        return prev.filter((p) => p.id !== pokemon.id)
      }

      // Si ya hay 2 seleccionados, reemplazar el último
      if (prev.length >= 2) {
        return [prev[0], pokemon]
      }

      // Añadir a la selección
      return [...prev, pokemon]
    })
  }

  // Verificar si un Pokémon está en la selección para comparar
  const isInCompare = (pokemonId: number) => {
    return selectedForCompare.some((p) => p.id === pokemonId)
  }

  // Filtrar Pokémon basado en el término de búsqueda y filtros
  const filteredPokemon = useMemo(() => {
    // Primero filtramos por término de búsqueda
    let filtered = allPokemon

    if (searchTerm) {
      filtered = filtered.filter((pokemon) => pokemon.name.includes(searchTerm.toLowerCase()))
    }

    // Si no hay filtros adicionales, devolvemos los resultados
    if (filters.types.length === 0 && filters.generations.length === 0) {
      return filtered
    }

    // Filtramos por generación basado en el ID
    if (filters.generations.length > 0) {
      filtered = filtered.filter((pokemon) => {
        // Extraer ID de la URL
        const url = pokemon.url
        const parts = url.split("/")
        const id = Number.parseInt(parts[parts.length - 2])

        // Verificar si pertenece a alguna de las generaciones seleccionadas
        return filters.generations.some((genId) => {
          const gen = GENERATIONS.find((g) => g.id === genId)
          return gen && id >= gen.range[0] && id <= gen.range[1]
        })
      })
    }

    // Si no hay filtros de tipo, devolvemos los resultados
    if (filters.types.length === 0) {
      return filtered
    }

    // Necesitamos detalles para filtrar por tipo
    return filtered.filter((pokemon) => {
      const details = pokemonDetails[pokemon.name]
      if (!details) return false

      // Filtrar por tipo
      return details.types.some((t) => filters.types.includes(t.type.name))
    })
  }, [allPokemon, searchTerm, filters, pokemonDetails])

  // Actualizar los detalles de Pokémon cuando se reciben
  const updatePokemonDetails = (pokemon: PokemonDetails) => {
    setPokemonDetails((prev) => ({
      ...prev,
      [pokemon.name]: pokemon,
    }))
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
        <FilterPanel onFilterChange={setFilters} />

        <Button
          variant={compareMode ? "default" : "outline"}
          onClick={() => setCompareMode(!compareMode)}
          className={compareMode ? "bg-red-600 hover:bg-red-700" : ""}
        >
          <BarChart2 className="mr-2 h-4 w-4" />
          {compareMode ? "Modo comparación activo" : "Comparar Pokémon"}
        </Button>
      </div>

      {/* Mostrar seleccionados para comparar */}
      {compareMode && selectedForCompare.length > 0 && (
        <div className="bg-gray-900 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Pokémon seleccionados: {selectedForCompare.length}/2</h3>
            {selectedForCompare.length === 2 && (
              <Button onClick={() => setShowCompareModal(true)} className="bg-red-600 hover:bg-red-700">
                Ver comparación
              </Button>
            )}
          </div>
          <div className="flex gap-4">
            {selectedForCompare.map((pokemon) => (
              <div key={pokemon.id} className="flex items-center gap-2">
                <Image
                  src={pokemon.sprites.front_default || "/placeholder.svg"}
                  alt={pokemon.name}
                  width={40}
                  height={40}
                />
                <span className="capitalize">{pokemon.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de comparación */}
      {showCompareModal && selectedForCompare.length === 2 && (
        <PokemonCompare
          pokemon1={selectedForCompare[0]}
          pokemon2={selectedForCompare[1]}
          onClose={() => setShowCompareModal(false)}
        />
      )}

      {/* Indicador de carga durante filtrado */}
      {isFilterLoading && (
        <div className="text-center py-4 mb-4 bg-gray-900 rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin text-red-500 inline mr-2" />
          <span>Cargando Pokémon para aplicar filtros...</span>
        </div>
      )}

      {filteredPokemon.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-4">No se encontraron Pokémon</h2>
          <p className="text-gray-400">Intenta con otros filtros o términos de búsqueda</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPokemon.map((pokemon) => (
              <PokemonCard
                key={pokemon.name}
                name={pokemon.name}
                url={pokemon.url}
                onCompare={compareMode ? handleCompare : undefined}
                isInCompare={
                  compareMode && pokemonDetails[pokemon.name] ? isInCompare(pokemonDetails[pokemon.name].id) : false
                }
                onLoad={updatePokemonDetails}
              />
            ))}
          </div>

          {nextUrl &&
            !searchTerm &&
            filters.types.length === 0 &&
            filters.generations.length === 0 &&
            !isFilterLoading && (
              <div className="flex justify-center mt-8">
                <Button onClick={fetchPokemon} disabled={loading} className="bg-red-600 hover:bg-red-700">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    "Cargar más Pokémon"
                  )}
                </Button>
              </div>
            )}
        </>
      )}
    </div>
  )
}
