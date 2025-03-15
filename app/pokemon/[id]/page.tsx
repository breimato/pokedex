"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Loader2, ChevronRight } from "lucide-react"
import { useParams } from "next/navigation"

interface PokemonDetails {
  id: number
  name: string
  height: number
  weight: number
  sprites: {
    other: {
      "official-artwork": {
        front_default: string
      }
    }
    versions: {
      "generation-v": {
        "black-white": {
          animated: {
            front_default: string
            back_default: string
          }
        }
      }
    }
    front_default: string
    back_default: string
  }
  types: {
    type: {
      name: string
    }
  }[]
  stats: {
    base_stat: number
    stat: {
      name: string
    }
  }[]
  abilities: {
    ability: {
      name: string
    }
    is_hidden: boolean
  }[]
  species: {
    url: string
  }
}

interface Species {
  flavor_text_entries: {
    flavor_text: string
    language: {
      name: string
    }
  }[]
  evolution_chain: {
    url: string
  }
}

interface EvolutionChain {
  chain: {
    species: {
      name: string
      url: string
    }
    evolves_to: {
      species: {
        name: string
        url: string
      }
      evolution_details: {
        min_level: number
      }[]
      evolves_to: {
        species: {
          name: string
          url: string
        }
        evolution_details: {
          min_level: number
        }[]
      }[]
    }[]
  }
}

interface EvolutionPokemon {
  name: string
  id: number
  image: string
  level?: number
}

export default function PokemonDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [pokemon, setPokemon] = useState<PokemonDetails | null>(null)
  const [species, setSpecies] = useState<Species | null>(null)
  const [evolutionChain, setEvolutionChain] = useState<EvolutionPokemon[]>([])
  const [loading, setLoading] = useState(true)
  const [showAnimated, setShowAnimated] = useState(false)

  useEffect(() => {
    const fetchPokemonDetails = async () => {
      setLoading(true)
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        const data = await response.json()
        setPokemon(data)

        // Fetch species data for description and evolution chain
        const speciesResponse = await fetch(data.species.url)
        const speciesData = await speciesResponse.json()
        setSpecies(speciesData)

        // Fetch evolution chain
        if (speciesData.evolution_chain) {
          const evolutionResponse = await fetch(speciesData.evolution_chain.url)
          const evolutionData: EvolutionChain = await evolutionResponse.json()

          // Process evolution chain
          const evolutions: EvolutionPokemon[] = []

          // First evolution (base form)
          const baseSpecies = evolutionData.chain.species
          const baseId = extractIdFromUrl(baseSpecies.url)
          const basePokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${baseId}`)
          const basePokemonData = await basePokemonResponse.json()

          evolutions.push({
            name: baseSpecies.name,
            id: baseId,
            image: basePokemonData.sprites.other["official-artwork"].front_default,
          })

          // Second evolution
          if (evolutionData.chain.evolves_to.length > 0) {
            for (const evolution of evolutionData.chain.evolves_to) {
              const evoId = extractIdFromUrl(evolution.species.url)
              const evoPokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${evoId}`)
              const evoPokemonData = await evoPokemonResponse.json()

              evolutions.push({
                name: evolution.species.name,
                id: evoId,
                image: evoPokemonData.sprites.other["official-artwork"].front_default,
                level: evolution.evolution_details[0]?.min_level,
              })

              // Third evolution
              if (evolution.evolves_to.length > 0) {
                for (const finalEvo of evolution.evolves_to) {
                  const finalEvoId = extractIdFromUrl(finalEvo.species.url)
                  const finalEvoPokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${finalEvoId}`)
                  const finalEvoPokemonData = await finalEvoPokemonResponse.json()

                  evolutions.push({
                    name: finalEvo.species.name,
                    id: finalEvoId,
                    image: finalEvoPokemonData.sprites.other["official-artwork"].front_default,
                    level: finalEvo.evolution_details[0]?.min_level,
                  })
                }
              }
            }
          }

          setEvolutionChain(evolutions)
        }
      } catch (error) {
        console.error(`Error fetching Pokémon details:`, error)
      } finally {
        setLoading(false)
      }
    }

    fetchPokemonDetails()
  }, [id])

  // Extraer ID de la URL
  const extractIdFromUrl = (url: string) => {
    const parts = url.split("/")
    return Number.parseInt(parts[parts.length - 2])
  }

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

  const getDescription = () => {
    if (!species) return ""

    const spanishEntry = species.flavor_text_entries.find((entry) => entry.language.name === "es")

    if (spanishEntry) {
      return spanishEntry.flavor_text.replace(/\f/g, " ")
    }

    // Fallback to English if Spanish is not available
    const englishEntry = species.flavor_text_entries.find((entry) => entry.language.name === "en")

    return englishEntry ? englishEntry.flavor_text.replace(/\f/g, " ") : "No hay descripción disponible."
  }

  const mainType = pokemon?.types[0]?.type.name || "normal"
  const typeColor = getTypeColor(mainType)

  // Obtener sprite animado si está disponible
  const animatedFrontSprite = pokemon?.sprites?.versions?.["generation-v"]?.["black-white"]?.animated?.front_default
  const animatedBackSprite = pokemon?.sprites?.versions?.["generation-v"]?.["black-white"]?.animated?.back_default

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white p-4 flex justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-red-500" />
      </main>
    )
  }

  if (!pokemon) {
    return (
      <main className="min-h-screen bg-black text-white p-4">
        <div className="container mx-auto py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Pokémon no encontrado</h1>
          <Link href="/">
            <Button className="bg-red-600 hover:bg-red-700">Volver al inicio</Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="container mx-auto py-4">
        {/* Pokédex Header y Navegación */}
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="outline" size="icon" className="mr-4 border-gray-700 hover:bg-gray-800">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold capitalize">
            {pokemon.name} <span className="text-gray-400">#{pokemon.id.toString().padStart(3, "0")}</span>
          </h1>
        </div>

        {/* Contenedor principal de la Pokédex */}
        <div className="bg-red-600 rounded-lg shadow-xl mb-6 overflow-hidden">
          {/* Detalles decorativos de la Pokédex - parte superior */}
          <div className="relative p-3">
            {/* Luz indicadora grande */}
            <div className="absolute top-3 left-3 w-16 h-16 rounded-full bg-white border-4 border-gray-200 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-blue-500 animate-pulse border-2 border-white"></div>
            </div>
            
            {/* Pequeñas luces indicadoras */}
            <div className="flex gap-3 absolute top-3 right-3">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            
            <div className="flex justify-between items-center mt-12 mb-2 px-8">
              <div className="w-3 h-6 bg-red-500/20 rounded-sm"></div>
              <div className="h-6 w-32 bg-red-500/10 rounded-md flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-red-500/30 animate-pulse"></div>
              </div>
              <div className="w-3 h-6 bg-red-500/20 rounded-sm"></div>
            </div>
            <div className="h-2 bg-black/20 rounded-full mb-1"></div>
            <div className="h-1 bg-black/10 rounded-full mb-3"></div>
          </div>

          {/* Contenido principal - Pantalla de la Pokédex */}
          <div className="bg-gray-900 mx-3 mb-3 rounded-md p-4 border-2 border-gray-800 shadow-inner">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Panel izquierdo - Imagen y tipos */}
              <div className="bg-black rounded-lg p-6 border border-gray-800 relative overflow-hidden">
                {/* Efectos de escáner */}
                <div className="absolute left-0 top-0 w-full h-1 bg-blue-500/20 animate-[scan_2s_ease-in-out_infinite]"></div>
                <div className="absolute right-0 top-0 h-full w-1 bg-blue-500/20 animate-[scan-v_2s_ease-in-out_infinite]"></div>
                
                {/* Información de ID y registro */}
                <div className="flex justify-between items-center mb-4">
                  <div className="px-2 py-1 bg-gray-800 rounded text-xs font-mono">
                    ID: <span className="text-green-400">#{pokemon.id.toString().padStart(3, "0")}</span>
                  </div>
                  <div className="px-2 py-1 bg-gray-800 rounded text-xs font-mono flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1 animate-pulse"></div>
                    <span className="text-green-400">REGISTRADO</span>
                  </div>
                </div>

                <div className="relative h-64 w-64 mx-auto mb-6 rounded-md overflow-hidden bg-gray-850 flex items-center justify-center border border-gray-700">
                  {/* Marco de pantalla con detalles técnicos */}
                  <div className="absolute top-1 left-2 text-[8px] text-gray-500 font-mono">REC.00{pokemon.id}</div>
                  <div className="absolute bottom-1 right-2 text-[8px] text-gray-500 font-mono">POK.{mainType.toUpperCase()}</div>
                  <div className="absolute top-1 right-2 text-[8px] text-gray-500 font-mono flex items-center">
                    <div className="w-1 h-1 rounded-full bg-red-500 mr-0.5 animate-pulse"></div>
                    LIVE
                  </div>
                  
                  {/* Imagen del Pokémon */}
                  {showAnimated && animatedFrontSprite ? (
                    <div className="flex justify-between items-start h-full w-full px-6">
                      <div className="flex flex-col items-center">
                        <div className="h-48 flex items-center justify-center">
                          <Image
                            src={animatedFrontSprite || "/placeholder.svg"}
                            alt={`${pokemon.name} animated front`}
                            width={90}
                            height={90}
                            className="object-contain scale-[1.7]"
                          />
                        </div>
                        <span className="text-xs text-gray-400 mt-1">Frente</span>
                      </div>
                      {animatedBackSprite && (
                        <div className="flex flex-col items-center">
                          <div className="h-48 flex items-center justify-center">
                            <Image
                              src={animatedBackSprite || "/placeholder.svg"}
                              alt={`${pokemon.name} animated back`}
                              width={90}
                              height={90}
                              className="object-contain scale-[1.7]"
                            />
                          </div>
                          <span className="text-xs text-gray-400 mt-1">Espalda</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Image
                      src={
                        pokemon.sprites.other["official-artwork"].front_default || "/placeholder.svg?height=256&width=256"
                      }
                      alt={pokemon.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                    />
                  )}
                </div>

                {animatedFrontSprite && (
                  <Button 
                    variant="outline" 
                    className="w-full mb-4 bg-gray-800 border-gray-700 hover:bg-gray-700"
                    onClick={() => setShowAnimated(!showAnimated)}
                  >
                    {showAnimated ? "Ver artwork oficial" : "Ver sprite animado"}
                  </Button>
                )}

                <div className="flex gap-3 justify-center mb-4">
                  {pokemon.types.map((typeInfo) => (
                    <span
                      key={typeInfo.type.name}
                      className="px-4 py-1 rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: getTypeColor(typeInfo.type.name),
                        color: "#fff",
                      }}
                    >
                      {typeInfo.type.name}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-6 w-full bg-gray-800 p-3 rounded-md border border-gray-700">
                  <div className="text-center">
                    <p className="text-gray-400 mb-1 text-xs">Altura</p>
                    <p className="text-xl font-mono font-semibold text-green-400">{pokemon.height / 10} m</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 mb-1 text-xs">Peso</p>
                    <p className="text-xl font-mono font-semibold text-green-400">{pokemon.weight / 10} kg</p>
                  </div>
                </div>
              </div>

              {/* Panel derecho - Información y estadísticas */}
              <div className="space-y-4">
                {/* Información del Pokémon */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                    <h2 className="text-lg font-bold uppercase text-red-400">Información</h2>
                  </div>
                  <p className="text-gray-300 font-mono text-sm bg-black p-3 rounded border border-gray-700">{getDescription()}</p>
                </div>

                {/* Tabs de estadísticas */}
                <Tabs defaultValue="stats" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                    <TabsTrigger value="stats" className="data-[state=active]:bg-gray-700">Estadísticas</TabsTrigger>
                    <TabsTrigger value="abilities" className="data-[state=active]:bg-gray-700">Habilidades</TabsTrigger>
                    <TabsTrigger value="evolution" className="data-[state=active]:bg-gray-700">Evoluciones</TabsTrigger>
                  </TabsList>
                  
                  {/* Contenido de estadísticas */}
                  <TabsContent value="stats" className="bg-gray-800 rounded-b-lg p-4 border-x border-b border-gray-700">
                    <div className="space-y-4">
                      {pokemon.stats.map((stat) => {
                        const statName = (() => {
                          switch (stat.stat.name) {
                            case "hp":
                              return "HP"
                            case "attack":
                              return "Ataque"
                            case "defense":
                              return "Defensa"
                            case "special-attack":
                              return "Ataque Esp."
                            case "special-defense":
                              return "Defensa Esp."
                            case "speed":
                              return "Velocidad"
                            default:
                              return stat.stat.name
                          }
                        })()

                        // Crear un estilo personalizado para el indicador de progreso
                        const getProgressStyle = (value: number) => {
                          let color = "#ef4444"; // red-500
                          if (value >= 80) color = "#22c55e"; // green-500
                          else if (value >= 50) color = "#eab308"; // yellow-500
                          
                          return {
                            "--progress-color": color,
                          } as React.CSSProperties;
                        }

                        return (
                          <div key={stat.stat.name} className="bg-black p-2 rounded border border-gray-700">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-mono text-gray-300">{statName}</span>
                              <span className="text-sm font-mono font-bold text-green-400">{stat.base_stat}</span>
                            </div>
                            <Progress
                              value={stat.base_stat}
                              max={255}
                              className="h-2 bg-gray-700 [&>div]:!bg-[var(--progress-color)]"
                              style={getProgressStyle(stat.base_stat)}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </TabsContent>
                  
                  {/* Contenido de habilidades */}
                  <TabsContent value="abilities" className="bg-gray-800 rounded-b-lg p-4 border-x border-b border-gray-700">
                    <div className="bg-black p-3 rounded border border-gray-700">
                      <ul className="space-y-2">
                        {pokemon.abilities.map((ability) => (
                          <li key={ability.ability.name} className="flex items-center">
                            <div className="w-1 h-1 rounded-full bg-green-500 mr-2"></div>
                            <span className="capitalize font-mono text-green-400">{ability.ability.name.replace("-", " ")}</span>
                            {ability.is_hidden && (
                              <span className="ml-2 px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">Oculta</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                  
                  {/* Contenido de evoluciones */}
                  <TabsContent value="evolution" className="bg-gray-800 rounded-b-lg p-4 border-x border-b border-gray-700">
                    {evolutionChain.length > 0 ? (
                      <div className="flex flex-col items-center bg-black p-3 rounded border border-gray-700">
                        <div className="flex flex-wrap justify-center items-center gap-2">
                          {evolutionChain.map((evo, index) => (
                            <div key={evo.id} className="flex items-center">
                              {index > 0 && (
                                <div className="flex flex-col items-center mx-2">
                                  <ChevronRight className="h-6 w-6 text-green-400" />
                                  {evo.level && <span className="text-xs font-mono text-green-400">Nv. {evo.level}</span>}
                                </div>
                              )}
                              <Link href={`/pokemon/${evo.id}`}>
                                <div
                                  className={`flex flex-col items-center p-2 rounded-lg ${
                                    evo.id.toString() === id ? "bg-gray-700 border border-green-500/50" : "hover:bg-gray-800"
                                  }`}
                                >
                                  <div className="relative h-20 w-20 bg-gray-850 rounded-full overflow-hidden border border-gray-700">
                                    <Image
                                      src={evo.image || "/placeholder.svg"}
                                      alt={evo.name}
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                  <span className="capitalize text-sm mt-1 font-mono text-green-400">{evo.name}</span>
                                </div>
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-black p-3 rounded border border-gray-700">
                        <p className="text-center text-gray-400 font-mono">No hay información de evolución disponible.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Detalles decorativos de la Pokédex - parte inferior */}
          <div className="p-3 flex justify-center">
            <div className="grid grid-cols-5 gap-2 w-full max-w-md">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-6 bg-red-700/50 rounded-md"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
