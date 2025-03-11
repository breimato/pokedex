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
    <main className="min-h-screen bg-black text-white p-4">
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="outline" size="icon" className="mr-4">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold capitalize">
            {pokemon.name} <span className="text-gray-400">#{pokemon.id.toString().padStart(3, "0")}</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card
            className="overflow-hidden border-2"
            style={{
              backgroundColor: "#111",
              borderColor: typeColor,
            }}
          >
            <CardContent className="p-8 flex flex-col items-center">
              <div className="relative h-64 w-64 mb-6">
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
                <Button variant="outline" className="mb-6" onClick={() => setShowAnimated(!showAnimated)}>
                  {showAnimated ? "Ver artwork oficial" : "Ver sprite animado"}
                </Button>
              )}

              <div className="flex gap-3 justify-center mb-6">
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

              <div className="grid grid-cols-2 gap-6 w-full">
                <div className="text-center">
                  <p className="text-gray-400 mb-1">Altura</p>
                  <p className="text-xl font-semibold">{pokemon.height / 10} m</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 mb-1">Peso</p>
                  <p className="text-xl font-semibold">{pokemon.weight / 10} kg</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Descripción</h2>
                <p className="text-gray-300">{getDescription()}</p>
              </CardContent>
            </Card>

            <Tabs defaultValue="stats" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-900">
                <TabsTrigger value="stats">Estadísticas</TabsTrigger>
                <TabsTrigger value="abilities">Habilidades</TabsTrigger>
                <TabsTrigger value="evolution">Evoluciones</TabsTrigger>
              </TabsList>
              <TabsContent value="stats" className="bg-gray-900 border-gray-700 rounded-b-lg p-6">
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

                    // Calculate color based on stat value
                    const getStatColor = (value: number) => {
                      if (value < 50) return "bg-red-500"
                      if (value < 80) return "bg-yellow-500"
                      return "bg-green-500"
                    }

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
                      <div key={stat.stat.name}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{statName}</span>
                          <span className="text-sm font-medium">{stat.base_stat}</span>
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
              <TabsContent value="abilities" className="bg-gray-900 border-gray-700 rounded-b-lg p-6">
                <ul className="space-y-2">
                  {pokemon.abilities.map((ability) => (
                    <li key={ability.ability.name} className="flex items-center">
                      <span className="capitalize">{ability.ability.name.replace("-", " ")}</span>
                      {ability.is_hidden && (
                        <span className="ml-2 px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">Oculta</span>
                      )}
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="evolution" className="bg-gray-900 border-gray-700 rounded-b-lg p-6">
                {evolutionChain.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <div className="flex flex-wrap justify-center items-center gap-2">
                      {evolutionChain.map((evo, index) => (
                        <div key={evo.id} className="flex items-center">
                          {index > 0 && (
                            <div className="flex flex-col items-center mx-2">
                              <ChevronRight className="h-6 w-6 text-gray-400" />
                              {evo.level && <span className="text-xs text-gray-400">Nv. {evo.level}</span>}
                            </div>
                          )}
                          <Link href={`/pokemon/${evo.id}`}>
                            <div
                              className={`flex flex-col items-center p-2 rounded-lg ${
                                evo.id.toString() === id ? "bg-gray-800 border border-gray-700" : ""
                              }`}
                            >
                              <div className="relative h-20 w-20">
                                <Image
                                  src={evo.image || "/placeholder.svg"}
                                  alt={evo.name}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <span className="capitalize text-sm mt-1">{evo.name}</span>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-400">No hay información de evolución disponible.</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  )
}
