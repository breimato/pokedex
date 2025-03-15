"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PlusCircle } from "lucide-react"

// Modificar la interfaz PokemonCardProps para incluir onLoad
interface PokemonCardProps {
  name: string
  url: string
  onCompare?: (pokemon: PokemonDetails) => void
  isInCompare?: boolean
  onLoad?: (pokemon: PokemonDetails) => void
}

export interface PokemonDetails {
  id: number
  name: string
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
          }
        }
      }
    }
    front_default: string
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
}

export function PokemonCard({ name, url, onCompare, isInCompare = false, onLoad }: PokemonCardProps) {
  const [pokemon, setPokemon] = useState<PokemonDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [showAnimated, setShowAnimated] = useState(false)

  // Modificar el useEffect para llamar a onLoad cuando se cargan los detalles
  useEffect(() => {
    // Mantener un registro de si el componente está montado
    let isMounted = true;
    // Número máximo de reintentos
    const maxRetries = 3;
    
    const fetchPokemonDetails = async (retryCount = 0) => {
      // Si ya se desmontó el componente, no hacemos nada
      if (!isMounted) return;
      
      try {
        // Añadimos un pequeño retraso aleatorio para evitar muchas solicitudes simultáneas
        const delay = Math.random() * 300;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Solo actualizamos el estado si el componente sigue montado
        if (isMounted) {
          setPokemon(data);
          
          if (onLoad) {
            onLoad(data);
          }
        }
      } catch (error) {
        console.error(`Error fetching details for ${name}:`, error);
        
        // Reintentamos si no hemos alcanzado el máximo de reintentos
        if (retryCount < maxRetries && isMounted) {
          console.log(`Retrying fetch for ${name} (${retryCount + 1}/${maxRetries})`);
          // Esperamos un tiempo incremental antes de reintentar
          const retryDelay = Math.pow(2, retryCount) * 1000 + Math.random() * 1000;
          setTimeout(() => {
            fetchPokemonDetails(retryCount + 1);
          }, retryDelay);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Iniciamos la carga
    fetchPokemonDetails();
    
    // Limpieza cuando el componente se desmonta
    return () => {
      isMounted = false;
    };
  }, [name, url, onLoad]);

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

  const mainType = pokemon?.types[0]?.type.name || "normal"
  const typeColor = getTypeColor(mainType)

  // Obtener sprite animado si está disponible
  const animatedSprite = pokemon?.sprites?.versions?.["generation-v"]?.["black-white"]?.animated?.front_default

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (pokemon && onCompare) {
      onCompare(pokemon)
    }
  }

  return (
    <Link href={`/pokemon/${pokemon?.id}`}>
      <Card
        className={`overflow-hidden transition-all duration-300 relative rounded-lg ${
          isHovered ? "transform scale-[1.02]" : ""
        } ${isInCompare ? "ring-2 ring-red-500" : ""} card-bg-${mainType}`}
        style={{
          borderColor: isHovered ? typeColor : "#333",
        }}
        onMouseEnter={() => {
          setIsHovered(true)
          if (animatedSprite) {
            setShowAnimated(true)
          }
        }}
        onMouseLeave={() => {
          setIsHovered(false)
          setShowAnimated(false)
        }}
      >
        {/* Elemento decorativo de Pokédex */}
        <div className={`absolute top-0 left-0 w-full h-2 type-bg-${mainType}`}></div>
        
        {/* ID de Pokémon en formato Pokédex */}
        {pokemon && (
          <div className="absolute top-2 right-3 text-xs font-mono text-gray-400">
            #{pokemon.id.toString().padStart(3, "0")}
          </div>
        )}
        
        <CardContent className="p-4 flex flex-col items-center pt-6">
          {loading || !pokemon ? (
            <>
              <div className="relative h-32 w-32 mb-4 bg-gray-800/50 rounded-full flex items-center justify-center overflow-hidden">
                <div className="absolute inset-2 rounded-full bg-black/40 flex items-center justify-center">
                  <Skeleton className="h-24 w-24 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-20" />
            </>
          ) : (
            <>
              <div className="relative h-32 w-32 mb-4 bg-gray-800/50 rounded-full flex items-center justify-center overflow-hidden border border-gray-700">
                <div className="absolute inset-2 rounded-full bg-black/40 flex items-center justify-center">
                  {showAnimated && animatedSprite ? (
                    <Image
                      src={animatedSprite || "/placeholder.svg"}
                      alt={pokemon.name}
                      width={80}
                      height={80}
                      className="object-contain scale-[1.2]"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <Image
                      src={
                        pokemon.sprites.other["official-artwork"].front_default || "/placeholder.svg?height=160&width=160"
                      }
                      alt={pokemon.name}
                      width={80}
                      height={80}
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={pokemon.id <= 20}
                    />
                  )}
                </div>
                {/* Pequeño indicador LED */}
                <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              </div>
              
              <div className="text-center w-full">
                <h3 className="text-lg font-bold capitalize mb-2 text-white">{pokemon.name}</h3>
                <div className="flex gap-1 justify-center flex-wrap">
                  {pokemon.types.map((typeInfo) => (
                    <span
                      key={typeInfo.type.name}
                      className={`type-badge type-bg-${typeInfo.type.name}-light type-text-${typeInfo.type.name} type-border-${typeInfo.type.name}`}
                      style={{
                        border: `1px solid ${getTypeColor(typeInfo.type.name)}80`
                      }}
                    >
                      {typeInfo.type.name}
                    </span>
                  ))}
                </div>

                {/* Barra de estadísticas simple */}
                <div className="w-full mt-3 px-2">
                  <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 type-bg-${mainType}`}
                      style={{ 
                        width: `${((pokemon.stats.find(s => s.stat.name === "hp")?.base_stat || 50) / 255) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>

                {onCompare && (
                  <button
                    onClick={handleCompareClick}
                    className={`mt-3 flex items-center justify-center gap-1 w-full py-1 px-2 rounded text-sm transition-colors ${
                      isInCompare 
                        ? "bg-red-700 hover:bg-red-800 text-white" 
                        : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    }`}
                    aria-label={isInCompare ? "Quitar de comparación" : "Añadir a comparación"}
                  >
                    <PlusCircle className="h-3 w-3" />
                    <span>{isInCompare ? "Seleccionado" : "Comparar"}</span>
                  </button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
