/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronDown, ChevronUp, X, Check } from "lucide-react"

interface GenericSearchSelectProps<T> {
  value: number | ""
  onValueChange?: (value: number | "") => void
  handleDataNoSeleccionada?: (value: boolean | undefined) => void
  placeholder?: string
  disabled?: boolean
  dataList: T[]
  labelKey: keyof T
  valueKey: keyof T
  secondaryLabelKey?: keyof T // opcional, por si quieres mostrar un código o algo extra
  thirdLabelKey?: keyof T // 🔹 Nuevo campo opcional

}

export function GenericSearchSelect<T extends Record<string, any>>({
  value,
  onValueChange,
  handleDataNoSeleccionada,
  placeholder = "Seleccionar...",
  disabled = false,
  dataList = [],
  labelKey,
  valueKey,
  secondaryLabelKey,
  thirdLabelKey
}: GenericSearchSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItem, setSelectedItem] = useState<T | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const primeraVezRef = useRef(true)

  const filteredItems = dataList.filter((item) =>
  String(item[labelKey]).toLowerCase().includes(searchTerm.toLowerCase()) ||
  (secondaryLabelKey && String(item[secondaryLabelKey]).toLowerCase().includes(searchTerm.toLowerCase())) ||
  (thirdLabelKey && String(item[thirdLabelKey]).toLowerCase().includes(searchTerm.toLowerCase())) // 🔹 agregado
)

  const handleSelect = (item: T) => {
    setSelectedItem(item)
    onValueChange?.(item[valueKey])
    setIsOpen(false)
    setSearchTerm("")
  }

  const handleClear = () => {
    setSelectedItem(null)
    onValueChange?.("")
    setSearchTerm("")
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (value) {
      const item = dataList.find((c) => c[valueKey] === value)
      if (item) {
        setSelectedItem(item)
        handleDataNoSeleccionada?.(true)
      }
    } else {
      setSelectedItem(null)
    }
  }, [value, dataList, valueKey, handleDataNoSeleccionada])

  useEffect(() => {
    if (primeraVezRef.current) {
      primeraVezRef.current = false
      return
    }
    if (!isOpen && !selectedItem) {
      handleDataNoSeleccionada?.(false)
    }
  }, [isOpen, selectedItem])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])


  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        role="button"
        tabIndex={0}
        className={`w-full justify-between h-10 px-3 bg-white border rounded-md flex items-center cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 flex-1 text-left">
          {selectedItem ? (
            <>
              <span className="font-medium">{String(selectedItem[labelKey])}</span>
              {secondaryLabelKey && (
                <Badge variant="secondary" className="text-xs">
                  {String(selectedItem[secondaryLabelKey])}
                </Badge>
              )}
              {thirdLabelKey && (
                <Badge variant="secondary" className="text-xs">
                  {String(selectedItem[thirdLabelKey])}
                </Badge>
              )}
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {selectedItem && !disabled && (
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

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-hidden shadow-lg">
          <div className="p-3 pt-0 mt-0 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={inputRef}
                placeholder={`${placeholder.toLowerCase()}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No se encontraron resultados</div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={String(item[valueKey])}
                  type="button"
                  className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between group ${
                    selectedItem?.[valueKey] === item[valueKey] ? "bg-blue-50 border-r-2 border-blue-500" : ""
                  }`}
                  onClick={() => handleSelect(item)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 cursor-pointer">
                      <span className="font-medium">{String(item[labelKey])}</span>
                      {secondaryLabelKey && (
                        <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50">
                          {String(item[secondaryLabelKey])}
                        </Badge>
                      )}
                      {thirdLabelKey && (
                        <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                          {String(item[thirdLabelKey])}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {selectedItem?.[valueKey] === item[valueKey] && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
