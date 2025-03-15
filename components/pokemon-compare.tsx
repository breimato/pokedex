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

  const getStatName = (statName: string) => {
    switch (statName) {
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
        return statName
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-700 shadow-lg">
        <div className="p-6 relative">
          {/* Líneas de circuito decorativas */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
            <div className="absolute top-0 right-0 w-1 h-full bg-green-500"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500"></div>
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
            
            <div className="absolute top-5 left-5 w-20 h-1 bg-green-500"></div>
            <div className="absolute top-5 left-5 w-1 h-20 bg-green-500"></div>
            <div className="absolute bottom-5 right-5 w-20 h-1 bg-green-500"></div>
            <div className="absolute bottom-5 right-5 w-1 h-20 bg-green-500"></div>
          </div>
          
          <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
            <h2 className="text-2xl font-bold text-green-400 flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse"></div>
              Comparación de Pokémon
            </h2>
            <button 
              onClick={onClose} 
              className="p-1 rounded-full hover:bg-red-700 bg-red-600/80 text-white shadow-md transition-colors"
              aria-label="Cerrar comparación"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Columna del primer Pokémon */}
            <div className="flex flex-col items-center bg-gray-800/30 p-4 rounded-lg border border-gray-700">
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
                {pokemon1.types.map((typeInfo) => {
                  const typeClass = `type-${typeInfo.type.name}`;
                  const typeColor = getTypeColor(typeInfo.type.name);
                  return (
                    <span
                      key={typeInfo.type.name}
                      className={`pokemon-type ${typeClass} text-white px-2 py-1 rounded text-xs font-medium`}
                      style={{ backgroundColor: typeColor }}
                      data-component-name="PokemonCompare"
                    >
                      {typeInfo.type.name}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Columna central - Comparativa */}
            <div className="border-x border-gray-700 px-4 bg-gray-800/20 rounded-lg">
              <div className="text-center mb-4">
                <h4 className="font-semibold mb-2 text-green-400">Efectividad de tipos</h4>
                <div className="flex flex-col gap-2 text-sm">
                  <div
                    className={`p-2 rounded border ${
                      pokemon1Advantage > 1 
                        ? "bg-green-900/50 border-green-700 text-green-300" 
                        : pokemon1Advantage < 1 
                          ? "bg-red-900/50 border-red-700 text-red-300" 
                          : "bg-gray-800/50 border-gray-700 text-yellow-300"
                    }`}
                  >
                    <span className="capitalize font-medium">{pokemon1.name}</span> 
                    <span className="mx-1">→</span> 
                    <span className="capitalize font-medium">{pokemon2.name}</span>: 
                    <span className="ml-1 font-bold">{pokemon1Advantage}x</span>
                  </div>
                  <div
                    className={`p-2 rounded border ${
                      pokemon2Advantage > 1 
                        ? "bg-green-900/50 border-green-700 text-green-300" 
                        : pokemon2Advantage < 1 
                          ? "bg-red-900/50 border-red-700 text-red-300" 
                          : "bg-gray-800/50 border-gray-700 text-yellow-300"
                    }`}
                  >
                    <span className="capitalize font-medium">{pokemon2.name}</span> 
                    <span className="mx-1">→</span> 
                    <span className="capitalize font-medium">{pokemon1.name}</span>: 
                    <span className="ml-1 font-bold">{pokemon2Advantage}x</span>
                  </div>
                </div>
              </div>

              <h4 className="font-semibold text-center mb-2 text-green-400">Estadísticas</h4>
              {pokemon1.stats.map((stat, index) => {
                const stat1 = stat.base_stat
                const stat2 = pokemon2.stats[index].base_stat
                const statName = getStatName(stat.stat.name)
                return (
                  <div key={stat.stat.name} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className={stat1 > stat2 ? "text-green-400 font-bold" : stat1 < stat2 ? "text-red-400" : "text-yellow-400"}>
                        {stat1}
                      </span>
                      <span className="font-medium text-gray-300">{statName}</span>
                      <span className={stat2 > stat1 ? "text-green-400 font-bold" : stat2 < stat1 ? "text-red-400" : "text-yellow-400"}>
                        {stat2}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div 
                        className={`progress-container ${
                          stat1 > stat2 
                            ? "progress-higher" 
                            : stat1 < stat2 
                              ? "progress-lower" 
                              : "progress-equal"
                        }`}
                      >
                        <Progress
                          value={stat1}
                          max={255}
                          className="h-2 bg-gray-700"
                        />
                      </div>
                      <div 
                        className={`progress-container ${
                          stat2 > stat1 
                            ? "progress-higher" 
                            : stat2 < stat1 
                              ? "progress-lower" 
                              : "progress-equal"
                        }`}
                      >
                        <Progress
                          value={stat2}
                          max={255}
                          className="h-2 bg-gray-700 rotate-180"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Columna del segundo Pokémon */}
            <div className="flex flex-col items-center bg-gray-800/30 p-4 rounded-lg border border-gray-700">
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
                {pokemon2.types.map((typeInfo) => {
                  const typeClass = `type-${typeInfo.type.name}`;
                  const typeColor = getTypeColor(typeInfo.type.name);
                  return (
                    <span
                      key={typeInfo.type.name}
                      className={`pokemon-type ${typeClass} text-white px-2 py-1 rounded text-xs font-medium`}
                      style={{ backgroundColor: typeColor }}
                      data-component-name="PokemonCompare"
                    >
                      {typeInfo.type.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
