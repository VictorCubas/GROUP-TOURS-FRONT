/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronDown, ChevronUp, X, Check } from "lucide-react"

interface Country {
  codigo_alpha2: string
  nombre: string
  id: number
}

interface CountrySearchSelectProps {
  value: number | ""
  onValueChange?: (value: number | "") => void
  handleNacionalidadNoSeleccionada: (value: boolean | undefined) => void
  placeholder?: string
  disabled?: boolean
  nacionalidades: any[]
}

export function CountrySearchSelect({
  value,
  onValueChange,
  handleNacionalidadNoSeleccionada,
  placeholder = "Seleccionar país...",
  disabled = false,
  nacionalidades = []
}: CountrySearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const primeraVezRef = useRef(true);

  // Lista de países de ejemplo (en una aplicación real, esto vendría de una API)
  const countries: any[] = nacionalidades;

  console.log('selectedNacionalidadID: ', value)
  // Filtrar países basado en el término de búsqueda
  const filteredCountries = countries.filter(
    (country) =>
      country.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.codigo_alpha2.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Manejar selección de país
  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country)
    onValueChange?.(country.id)
    setIsOpen(false)
    setSearchTerm("")
  }

  // Limpiar selección
  const handleClear = () => {
    setSelectedCountry(null)
    onValueChange?.("");
    setSearchTerm("")
  }

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Inicializar país seleccionado basado en el valor
  useEffect(() => {
    if (value) {
      const country = countries.find((c) => c.id === value)
      console.log('cargando pais: ', country)
      if (country) {
        setSelectedCountry(country);
        handleNacionalidadNoSeleccionada(true);
      }
    } else {
      setSelectedCountry(null);
    }
  }, [value])

  useEffect(() => {
    if (primeraVezRef.current) {
      primeraVezRef.current = false; // la primera vez no ejecuta la lógica
      return;
    }

    if (!isOpen && !selectedCountry) {
      handleNacionalidadNoSeleccionada(false);
      console.log("Cerraste el selector sin elegir país");
    }
  }, [isOpen, selectedCountry]);

  // Enfocar input cuando se abre
  useEffect(() => {
    console.log('isOpen: ', isOpen)
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <div
        role="button"
        tabIndex={0}
        className={`w-full justify-between h-10 px-3 bg-white border rounded-md flex items-center cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
>
        <div className="flex items-center gap-2 flex-1 text-left">
          {selectedCountry ? (
            <>
              {/* <span className="text-lg">{selectedCountry.flag}</span> */}
              <span className="font-medium">{selectedCountry.nombre}</span>
              <Badge variant="secondary" className="text-xs">
                {selectedCountry.codigo_alpha2}
              </Badge>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {selectedCountry && !disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {isOpen ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-hidden shadow-lg">
          {/* Search Input */}
          <div className="p-3  pt-0 mt-0 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={inputRef}
                placeholder="Buscar país o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Countries List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No se encontraron países</div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.codigo_alpha2}
                  type="button"
                  className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between group ${
                    selectedCountry?.codigo_alpha2 === country.codigo_alpha2 ? "bg-blue-50 border-r-2 border-blue-500" : ""
                  }`}
                  onClick={() => handleSelectCountry(country)}
                >
                  <div className="flex items-center gap-3">
                    {/* <span className="text-lg">{country.flag}</span> */}
                    <div className="flex items-center gap-2 cursor-pointer">
                      <span className="font-medium">{country.nombre}</span>
                      <Badge variant="outline" className="text-xs">
                        {country.codigo_alpha2}
                      </Badge>
                    </div>
                  </div>
                  {selectedCountry?.codigo_alpha2 === country.codigo_alpha2 && <Check className="h-4 w-4 text-blue-600" />}
                </button>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
