/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronDown, ChevronUp, X, Check, Loader2Icon } from "lucide-react"

interface GenericSearchSelectProps<T> {
  value: number | "";
  onValueChange?: (value: number | "") => void;
  handleDataNoSeleccionada?: (value: boolean | undefined) => void;
  onSearchChange?: (search: string) => void; // 🔹 Nuevo para notificar búsqueda
  placeholder?: string;
  disabled?: boolean;
  isFetchingPersonas?: boolean;
  dataList: T[];
  labelKey?: keyof T; // lo dejamos opcional porque vamos a manejar casos especiales
  valueKey: keyof T;
  secondaryLabelKey?: keyof T;
}

export function DinamicSearchSelect<T extends Record<string, any>>({
  value,
  onValueChange,
  handleDataNoSeleccionada,
  onSearchChange,
  placeholder = "Seleccionar...",
  disabled = false,
  dataList = [],
  labelKey,
  isFetchingPersonas,
  valueKey,
  secondaryLabelKey
}: GenericSearchSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const primeraVezRef = useRef(true);

  // 🔹 Cuando el usuario escribe, notificamos al padre
  useEffect(() => {
      const handler = setTimeout(() => {
        if (onSearchChange) {
          onSearchChange(searchTerm)
        }
      }, 750) // ⏱️ medio segundo de espera
  
      return () => {
        clearTimeout(handler) // limpia el timeout si se sigue escribiendo
      }
    }, [searchTerm, onSearchChange]);

  // 🔹 Función para obtener el label dinámico (razon_social o nombre+apellido)
  const getItemLabel = (item: T) => {
    if ("razon_social" in item && item.razon_social) {
      return String(item.razon_social);
    }
    if ("nombre" in item && "apellido" in item) {
      return `${item.nombre} ${item.apellido}`;
    }
    return labelKey ? String(item[labelKey]) : "";
  };

  // 🔹 Filtro local por razon_social, nombre, apellido o documento
  const filteredItems = dataList;
  // const filteredItems = dataList.filter((item) => {
  //   const label = getItemLabel(item).toLowerCase();
  //   const documento = String(item.documento ?? "").toLowerCase();
  //   return (
  //     label.includes(searchTerm.toLowerCase()) ||
  //     documento.includes(searchTerm.toLowerCase())
  //   );
  // });

  const handleSelect = (item: T) => {
    setSelectedItem(item);
    onValueChange?.(item[valueKey]);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    setSelectedItem(null);
    onValueChange?.("");
    setSearchTerm("");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    console.log('actualizando valor: ', value)
    console.log('valueKey: ', valueKey)
    if (value) {
      const item = dataList.find((c) => c[valueKey] === value);
      console.log('item selected: ', item)
      if (item) {
        setSelectedItem(item);
        handleDataNoSeleccionada?.(true);
      }
    } else {
      setSelectedItem(null);
    }
  }, [value, dataList, valueKey, handleDataNoSeleccionada]);

  useEffect(() => {
    if (primeraVezRef.current) {
      primeraVezRef.current = false;
      return;
    }
    if (!isOpen && !selectedItem) {
      handleDataNoSeleccionada?.(false);
    }
  }, [isOpen, selectedItem]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

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
              <span className="font-medium">{getItemLabel(selectedItem)}</span>
              {secondaryLabelKey && (
                <Badge variant="secondary" className="text-xs">
                  {String(selectedItem[secondaryLabelKey])}
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
                e.stopPropagation();
                handleClear();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-hidden shadow-lg">
          <div className="p-3 pt-0 mt-0 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={inputRef}
                placeholder={`Buscar ${placeholder.toLowerCase()}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {isFetchingPersonas && <div className="w-full flex items-center justify-center">
                                        <Loader2Icon className="animate-spin w-10 h-10 text-gray-500"/>
                                      </div>}

            {!isFetchingPersonas && filteredItems.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No se encontraron resultados</div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={String(item[valueKey])}
                  type="button"
                  className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between group ${
                    selectedItem?.[valueKey] === item[valueKey]
                      ? "bg-blue-50 border-r-2 border-blue-500"
                      : ""
                  }`}
                  onClick={() => handleSelect(item)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 cursor-pointer">
                      <span className="font-medium">{getItemLabel(item)}</span>
                      {secondaryLabelKey && (
                        <Badge variant="outline" className="text-xs">
                          {String(item[secondaryLabelKey])}
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
  );
}
