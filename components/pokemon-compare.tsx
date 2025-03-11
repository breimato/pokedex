"use client"
import Image from "next/image"
import { X } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { PokemonDetails } from "@/components/pokemon-card"

interface PokemonCompareProps {
  pokemon1: PokemonDetails
  pokemon2: PokemonDetails
  onClose: () => void
}

export function PokemonCompare({ pokemon1, pokemon2, onClose }: PokemonCompareProps) {
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

  // Calcular ventajas de tipo
  const calculateTypeAdvantage = (attackerTypes: string[], defenderTypes: string[]) => {
    const typeEffectiveness: Record<string, Record<string, number>> = {
      normal: { rock: 0.5, ghost: 0, steel: 0.5 },
      fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
      water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
      electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
      grass: {
        fire: 0.5,
        water: 2,
        grass: 0.5,
        poison: 0.5,
        ground: 2,
        flying: 0.5,
        bug: 0.5,
        rock: 2,
        dragon: 0.5,
        steel: 0.5,
      },
      ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
      fighting: {
        normal: 2,
        ice: 2,
        poison: 0.5,
        flying: 0.5,
        psychic: 0.5,
        bug: 0.5,
        rock: 2,
        ghost: 0,
        dark: 2,
        steel: 2,
        fairy: 0.5,
      },
      poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
      ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
      flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
      psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
      bug: {
        fire: 0.5,
        grass: 2,
        fighting: 0.5,
        poison: 0.5,
        flying: 0.5,
        psychic: 2,
        ghost: 0.5,
        dark: 2,
        steel: 0.5,
        fairy: 0.5,
      },
      rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
      ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
      dragon: { dragon: 2, steel: 0.5, fairy: 0 },
      dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
      steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
      fairy: { fighting: 2, poison: 0.5, bug: 0.5, dragon: 2, dark: 2, steel: 0.5 },
    }

    let multiplier = 1

    attackerTypes.forEach((attackerType) => {
      defenderTypes.forEach((defenderType) => {
        if (typeEffectiveness[attackerType] && typeEffectiveness[attackerType][defenderType] !== undefined) {
          multiplier *= typeEffectiveness[attackerType][defenderType]
        }
      })
    })

    return multiplier
  }

  // Obtener tipos de cada Pokémon
  const pokemon1Types = pokemon1.types.map((t) => t.type.name)
  const pokemon2Types = pokemon2.types.map((t) => t.type.name)

  // Calcular ventajas
  const pokemon1Advantage = calculateTypeAdvantage(pokemon1Types, pokemon2Types)
  const pokemon2Advantage = calculateTypeAdvantage(pokemon2Types, pokemon1Types)

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Comparación de Pokémon</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-800">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Columna Pokémon 1 */}
            <div className="flex flex-col items-center">
              <div className="relative h-32 w-32 mb-2">
                <Image
                  src={pokemon1.sprites.other["official-artwork"].front_default || "/placeholder.svg"}
                  alt={pokemon1.name}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-bold capitalize mb-2">{pokemon1.name}</h3>
              <div className="flex gap-2 justify-center mb-4">
                {pokemon1.types.map((typeInfo) => (
                  <span
                    key={typeInfo.type.name}
                    className="px-2 py-1 rounded text-xs font-semibold"
                    style={{
                      backgroundColor: getTypeColor(typeInfo.type.name),
                      color: "#fff",
                    }}
                  >
                    {typeInfo.type.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Columna central - Comparativa */}
            <div className="border-x border-gray-700 px-4">
              <div className="text-center mb-4">
                <h4 className="font-semibold mb-2">Efectividad de tipos</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div
                    className={`p-2 rounded ${pokemon1Advantage > 1 ? "bg-green-900" : pokemon1Advantage < 1 ? "bg-red-900" : "bg-gray-800"}`}
                  >
                    {pokemon1.name} → {pokemon2.name}: {pokemon1Advantage}x
                  </div>
                  <div
                    className={`p-2 rounded ${pokemon2Advantage > 1 ? "bg-green-900" : pokemon2Advantage < 1 ? "bg-red-900" : "bg-gray-800"}`}
                  >
                    {pokemon2.name} → {pokemon1.name}: {pokemon2Advantage}x
                  </div>
                </div>
              </div>

              <h4 className="font-semibold text-center mb-2">Estadísticas</h4>
              {pokemon1.stats.map((stat, index) => {
                const stat1 = stat.base_stat
                const stat2 = pokemon2.stats[index].base_stat
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

                return (
                  <div key={stat.stat.name} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{stat1}</span>
                      <span className="font-medium">{statName}</span>
                      <span>{stat2}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Progress
                        value={stat1}
                        max={255}
                        className="h-2 bg-gray-700"
                        indicatorClassName={
                          stat1 > stat2 ? "bg-green-500" : stat1 < stat2 ? "bg-red-500" : "bg-blue-500"
                        }
                      />
                      <Progress
                        value={stat2}
                        max={255}
                        className="h-2 bg-gray-700 rotate-180"
                        indicatorClassName={
                          stat2 > stat1 ? "bg-green-500" : stat2 < stat1 ? "bg-red-500" : "bg-blue-500"
                        }
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Columna Pokémon 2 */}
            <div className="flex flex-col items-center">
              <div className="relative h-32 w-32 mb-2">
                <Image
                  src={pokemon2.sprites.other["official-artwork"].front_default || "/placeholder.svg"}
                  alt={pokemon2.name}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-bold capitalize mb-2">{pokemon2.name}</h3>
              <div className="flex gap-2 justify-center mb-4">
                {pokemon2.types.map((typeInfo) => (
                  <span
                    key={typeInfo.type.name}
                    className="px-2 py-1 rounded text-xs font-semibold"
                    style={{
                      backgroundColor: getTypeColor(typeInfo.type.name),
                      color: "#fff",
                    }}
                  >
                    {typeInfo.type.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

