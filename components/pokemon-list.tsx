"use client"

import { useState, useEffect, useMemo } from "react"
import { PokemonCard, type PokemonDetails } from "@/components/pokemon-card"
import { FilterPanel, type FilterOptions } from "@/components/filter-panel"
import { PokemonCompare } from "@/components/pokemon-compare"
import { Button } from "@/components/ui/button"
import { Loader2, BarChart2, X } from "lucide-react"
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
  
  // Clave para forzar la remontada del componente y evitar duplicados
  const [key, setKey] = useState(Date.now())
  
  // Estado para rastrear si los filtros están aplicados
  const [filtersApplied, setFiltersApplied] = useState(false)
  
  // Referencia para almacenar los Pokémon iniciales que se cargan al abrir la app
  const [initialPokemonState, setInitialPokemonState] = useState<{
    pokemon: Pokemon[],
    nextUrl: string | null
  }>({ pokemon: [], nextUrl: null })

  const fetchPokemon = async () => {
    if (!nextUrl) return

    setLoading(true)
    try {
      const response = await fetch(nextUrl)
      const data: PokemonListResponse = await response.json()

      // Usar un Set para eliminar duplicados basados en el nombre
      const existingNames = new Set(allPokemon.map(p => p.name))
      const newPokemon = data.results.filter(p => !existingNames.has(p.name))
      
      const updatedPokemon = [...allPokemon, ...newPokemon]
      setAllPokemon(updatedPokemon)
      setNextUrl(data.next)
      
      // Si es la primera carga, guardamos este estado como el inicial
      if (initialLoading && !filtersApplied) {
        setInitialPokemonState({ 
          pokemon: updatedPokemon, 
          nextUrl: data.next 
        })
      }
    } catch (error) {
      console.error("Error fetching Pokémon:", error)
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }

  // Efecto para reiniciar el estado cuando cambia la clave
  useEffect(() => {
    setAllPokemon([])
    setNextUrl("https://pokeapi.co/api/v2/pokemon?limit=20")
    setPokemonDetails({})
    setSelectedForCompare([])
    setCompareMode(false)
    setShowCompareModal(false)
    setInitialLoading(true)
    setFiltersApplied(false)
    
    fetchPokemon()
  }, [key])

  // Efecto para detectar cuando el componente se monta/desmonta
  useEffect(() => {
    // Cuando el componente se monta, generar una nueva clave para forzar un estado fresco
    setKey(Date.now())
    
    return () => {
      // Cleanup cuando el componente se desmonta
    }
  }, [])

  // Rango de ID de Pokémon por generación
  const generationRanges = {
    1: { start: 1, end: 151 },     // Kanto
    2: { start: 152, end: 251 },   // Johto
    3: { start: 252, end: 386 },   // Hoenn
    4: { start: 387, end: 493 },   // Sinnoh
    5: { start: 494, end: 649 },   // Unova
    6: { start: 650, end: 721 },   // Kalos
    7: { start: 722, end: 809 },   // Alola
    8: { start: 810, end: 905 },   // Galar
    9: { start: 906, end: 1010 },  // Paldea
  }

  // Función para obtener el ID de un Pokémon desde su URL
  const getPokemonIdFromUrl = (url: string): number => {
    const urlParts = url.split('/')
    return parseInt(urlParts[urlParts.length - 2])
  }

  // Filtrar por generación sin cargar todos los detalles
  const filterByGeneration = (pokemon: Pokemon[], generations: number[]): Pokemon[] => {
    if (generations.length === 0) return pokemon
    
    return pokemon.filter(p => {
      const id = getPokemonIdFromUrl(p.url)
      return generations.some(gen => 
        id >= generationRanges[gen as keyof typeof generationRanges].start && 
        id <= generationRanges[gen as keyof typeof generationRanges].end
      )
    })
  }

  // Función para cargar detalles de Pokémon
  const loadPokemonDetails = async (pokemonList: Pokemon[]) => {
    // Limitamos a 50 para evitar demasiadas solicitudes
    const limitedList = pokemonList.slice(0, 50)
    
    // Procesamos en grupos más pequeños para evitar sobrecargar la API
    const batchSize = 10;
    let newDetails: Record<string, PokemonDetails> = {};
    
    for (let i = 0; i < limitedList.length; i += batchSize) {
      const batch = limitedList.slice(i, i + batchSize);
      
      const detailsPromises = batch.map(async (pokemon: Pokemon) => {
        // Evitamos cargar detalles que ya tenemos
        if (pokemonDetails[pokemon.name]) return { pokemon: pokemonDetails[pokemon.name], cached: true };
        
        try {
          const response = await fetch(pokemon.url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const pokemonData = await response.json();
          return { pokemon: pokemonData, cached: false };
        } catch (error) {
          console.error(`Error fetching details for ${pokemon.name}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(detailsPromises);
      
      for (const result of batchResults) {
        if (result && result.pokemon) {
          newDetails[result.pokemon.name] = result.pokemon;
        }
      }
      
      // Pequeña pausa entre lotes para no sobrecargar la API
      if (i + batchSize < limitedList.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    // Solo actualizamos el estado una vez con todos los detalles nuevos
    setPokemonDetails(prev => {
      // Evitamos actualizar si no hay cambios reales
      if (Object.keys(newDetails).length === 0) return prev;
      return { ...prev, ...newDetails };
    });
    
    return newDetails;
  }

  // Efecto para cargar Pokémon específicos de una generación cuando se aplica el filtro
  useEffect(() => {
    let isMounted = true;
    
    const fetchPokemonByGeneration = async () => {
      // Solo si hay filtros de generación
      if (filters.generations.length > 0) {
        setIsFilterLoading(true);
        setFiltersApplied(true);
        
        try {
          const promises: Promise<PokemonListResponse>[] = [];
          
          // Para cada generación seleccionada, cargamos el rango correspondiente
          for (const gen of filters.generations) {
            const range = generationRanges[gen as keyof typeof generationRanges];
            const limit = range.end - range.start + 1;
            const offset = range.start - 1;
            
            promises.push(
              fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`)
                .then(res => {
                  if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                  }
                  return res.json();
                })
            );
          }
          
          const results = await Promise.all(promises);
          
          // Combinamos todos los resultados
          let allResults: Pokemon[] = [];
          for (const result of results) {
            allResults = [...allResults, ...result.results];
          }
          
          // Eliminamos duplicados
          const uniquePokemon = allResults.filter((pokemon, index, self) => 
            index === self.findIndex(p => p.name === pokemon.name)
          );
          
          if (isMounted) {
            setAllPokemon(uniquePokemon);
            setNextUrl(null); // Desactivamos la paginación con filtros
            
            // Si también hay filtros de tipo, cargamos los detalles necesarios
            if (filters.types.length > 0 && isMounted) {
              await loadPokemonDetails(uniquePokemon);
            }
          }
        } catch (error) {
          console.error("Error fetching Pokémon by generation:", error);
        } finally {
          if (isMounted) {
            setIsFilterLoading(false);
          }
        }
      } else if (filters.types.length > 0 && !filtersApplied) {
        // Si solo hay filtros de tipo pero no de generación
        setFiltersApplied(true);
        setIsFilterLoading(true);
        
        try {
          // Usar el endpoint de tipo directamente para obtener todos los Pokémon de ese tipo
          const typePromises = filters.types.map(type => 
            fetch(`https://pokeapi.co/api/v2/type/${type}`)
              .then(res => {
                if (!res.ok) {
                  throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
              })
          );
          
          const typeResults = await Promise.all(typePromises);
          
          // Combinamos todos los Pokémon de los tipos seleccionados
          let pokemonByType: { name: string, url: string }[] = [];
          
          for (const typeResult of typeResults) {
            // Convertimos los resultados al formato que esperamos (Pokemon[])
            const typePokemon = typeResult.pokemon.map((entry: { pokemon: { name: string, url: string } }) => ({
              name: entry.pokemon.name,
              url: entry.pokemon.url
            }));
            
            pokemonByType = [...pokemonByType, ...typePokemon];
          }
          
          // Eliminamos duplicados si hay varios tipos seleccionados
          const uniquePokemon = pokemonByType.filter((pokemon, index, self) => 
            index === self.findIndex(p => p.name === pokemon.name)
          );
          
          if (isMounted) {
            setAllPokemon(uniquePokemon);
            setNextUrl(null); // Desactivamos la paginación con filtros
            
            // Solo cargamos los detalles de los primeros 50 Pokémon para mostrar inmediatamente
            const initialPokemonToLoad = uniquePokemon.slice(0, 50);
            await loadPokemonDetails(initialPokemonToLoad);
            
            // Si hay más de 50, cargamos el resto en segundo plano para no bloquear la UI
            if (uniquePokemon.length > 50 && isMounted) {
              const remainingPokemon = uniquePokemon.slice(50);
              // Esto se ejecutará en segundo plano sin bloquear
              setTimeout(() => {
                if (isMounted) {
                  loadPokemonDetails(remainingPokemon);
                }
              }, 500);
            }
          }
        } catch (error) {
          console.error("Error fetching Pokémon by type:", error);
        } finally {
          if (isMounted) {
            setIsFilterLoading(false);
          }
        }
      } else if (filtersApplied && filters.types.length === 0 && filters.generations.length === 0 && isMounted) {
        // Si se quitan todos los filtros, volvemos al estado inicial
        setFiltersApplied(false);
        setAllPokemon(initialPokemonState.pokemon);
        setNextUrl(initialPokemonState.nextUrl);
      }
    };
    
    fetchPokemonByGeneration();
    
    return () => {
      isMounted = false;
    };
  }, [filters.generations, filters.types]);

  // Manejar la selección para comparar
  const handleCompare = (pokemon: PokemonDetails) => {
    setSelectedForCompare((prev) => {
      // Si ya está seleccionado, lo quitamos
      if (prev.some((p) => p.id === pokemon.id)) {
        return prev.filter((p) => p.id !== pokemon.id)
      }

      // Si ya hay 2 Pokémon seleccionados, reemplazamos el primero
      if (prev.length >= 2) {
        return [prev[1], pokemon]
      }

      // Añadimos el Pokémon
      return [...prev, pokemon]
    })
  }

  const isPokemonSelected = (pokemonId: number) => {
    return selectedForCompare.some((p) => p.id === pokemonId)
  }

  const handleRemoveFromCompare = (pokemonId: number) => {
    setSelectedForCompare((prev) => prev.filter((p) => p.id !== pokemonId))
  }

  // Filtrar Pokémon según la búsqueda y filtros
  const filteredPokemon = useMemo(() => {
    // Crear un Set con los nombres de los Pokémon para evitar duplicados
    const uniqueNames = new Set<string>()
    const uniquePokemon: Pokemon[] = []
    
    for (const pokemon of allPokemon) {
      if (!uniqueNames.has(pokemon.name)) {
        uniqueNames.add(pokemon.name)
        uniquePokemon.push(pokemon)
      }
    }
    
    // Primero filtramos por término de búsqueda
    let filtered = uniquePokemon

    if (searchTerm) {
      filtered = filtered.filter((pokemon) => pokemon.name.includes(searchTerm.toLowerCase()))
    }

    // Filtramos por tipo si hay detalles cargados y tipos seleccionados
    if (filters.types.length > 0 && Object.keys(pokemonDetails).length > 0) {
      filtered = filtered.filter((pokemon) => {
        const details = pokemonDetails[pokemon.name]
        // Si no tenemos detalles, no podemos filtrar
        if (!details) return false

        // Verificamos si alguno de los tipos del Pokémon está en la lista de tipos seleccionados
        return details.types.some((type) =>
          filters.types.includes(type.type.name)
        )
      })
    }

    return filtered
  }, [allPokemon, searchTerm, filters.types, pokemonDetails])

  // Obtener todos los tipos disponibles a partir de los detalles cargados
  const availableTypes = useMemo(() => {
    const types = new Set<string>()

    Object.values(pokemonDetails).forEach((pokemon) => {
      pokemon.types.forEach((type) => {
        types.add(type.type.name)
      })
    })

    return Array.from(types).sort()
  }, [pokemonDetails])

  const toggleFilter = (type: string) => {
    setFilters((prev) => {
      if (prev.types.includes(type)) {
        return {
          ...prev,
          types: prev.types.filter((t) => t !== type),
        }
      } else {
        return {
          ...prev,
          types: [...prev.types, type],
        }
      }
    })
  }

  const toggleGeneration = (generation: number) => {
    setFilters((prev) => {
      if (prev.generations.includes(generation)) {
        return {
          ...prev,
          generations: prev.generations.filter((g) => g !== generation),
        }
      } else {
        return {
          ...prev,
          generations: [...prev.generations, generation],
        }
      }
    })
  }

  const handleLoadMore = () => {
    fetchPokemon()
  }

  const handleLoadMoreTypeResults = () => {
    // Esta función cargará los detalles de más Pokémon por tipo
    // cuando el usuario quiere ver más resultados
    const loadedNames = Object.keys(pokemonDetails);
    const remainingPokemon = allPokemon.filter(p => !loadedNames.includes(p.name)).slice(0, 50);
    
    if (remainingPokemon.length > 0) {
      setIsFilterLoading(true);
      loadPokemonDetails(remainingPokemon).finally(() => {
        setIsFilterLoading(false);
      });
    }
  }

  const handleStartCompare = () => {
    setCompareMode(true)
  }

  const handleStopCompare = () => {
    setCompareMode(false)
    setSelectedForCompare([])
  }

  const handleShowCompare = () => {
    setShowCompareModal(true)
  }

  const handleCloseCompare = () => {
    setShowCompareModal(false)
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-bounce w-16 h-16">
          <Loader2 className="w-full h-full text-red-500" />
        </div>
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
        <div className="bg-gray-900/80 p-4 rounded-lg mb-6 border border-gray-800 shadow-lg backdrop-blur-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-green-400 flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
              Pokémon seleccionados: {selectedForCompare.length}/2
            </h3>
            {selectedForCompare.length === 2 && (
              <Button onClick={() => setShowCompareModal(true)} className="bg-red-600 hover:bg-red-700 text-white shadow-md">
                <BarChart2 className="mr-2 h-4 w-4" />
                Ver comparación
              </Button>
            )}
          </div>
          <div className="flex gap-4">
            {selectedForCompare.map((pokemon) => (
              <div key={pokemon.id} className="flex items-center gap-2 bg-gray-800/50 p-2 rounded-md border border-gray-700">
                <Image
                  src={pokemon.sprites.front_default}
                  alt={pokemon.name}
                  width={40}
                  height={40}
                />
                <span className="capitalize">{pokemon.name}</span>
                <button 
                  onClick={() => handleRemoveFromCompare(pokemon.id)}
                  className="ml-2 p-1 rounded-full hover:bg-red-700/50 text-red-400 hover:text-white transition-colors"
                  aria-label={`Eliminar ${pokemon.name} de la comparación`}
                >
                  <X className="h-4 w-4" />
                </button>
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
                  compareMode && pokemonDetails[pokemon.name] ? isPokemonSelected(pokemonDetails[pokemon.name].id) : false
                }
                onLoad={(pokemon) => {
                  setPokemonDetails((prev) => ({
                    ...prev,
                    [pokemon.name]: pokemon,
                  }))
                }}
              />
            ))}
          </div>

          {nextUrl &&
            !searchTerm &&
            filters.types.length === 0 &&
            filters.generations.length === 0 &&
            !isFilterLoading && (
              <div className="flex justify-center mt-8">
                <Button onClick={handleLoadMore} disabled={loading} className="bg-red-600 hover:bg-red-700">
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
          {filters.types.length > 0 && Object.keys(pokemonDetails).length < allPokemon.length && (
            <div className="flex justify-center mt-8">
              <Button onClick={handleLoadMoreTypeResults} disabled={isFilterLoading} className="bg-red-600 hover:bg-red-700">
                {isFilterLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  "Cargar más resultados"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
