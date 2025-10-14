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
  setSelectedTitularData?: (value: any) => void;
  onSearchChange?: (search: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isFetchingPersonas?: boolean;
  dataList: T[];
  labelKey?: any;
  valueKey: keyof T;
  secondaryLabelKey?: any;
  thirdLabelKey?: any; // 🆕 agregado
  mostrarPreview?: boolean;
}

export function DinamicSearchSelect<T extends Record<string, any>>({
  value,
  onValueChange,
  handleDataNoSeleccionada,
  setSelectedTitularData,
  onSearchChange,
  placeholder = "Seleccionar...",
  disabled = false,
  dataList = [],
  labelKey,
  isFetchingPersonas,
  valueKey,
  secondaryLabelKey,
  thirdLabelKey, // 🆕 agregado
  mostrarPreview
}: GenericSearchSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const primeraVezRef = useRef(true);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(searchTerm)
      }
    }, 750)
    return () => clearTimeout(handler)
  }, [searchTerm, onSearchChange]);

  const getItemLabel = (item: T) => {
    if (item && typeof item === "object") {
      if ("razon_social" in item && (item as any).razon_social) {
        return String((item as any).razon_social);
      }
      if ("nombre" in item && "apellido" in item) {
        return `${(item as any).nombre} ${(item as any).apellido}`;
      }
      return labelKey ? String((item as any)[labelKey]) : "";
    }
    return String(item ?? "");
  };

  const filteredItems = dataList;

  const handleSelect = (item: T) => {
    setSelectedItem(item);
    onValueChange?.(item[valueKey]);
    setSelectedTitularData?.(item);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    setSelectedItem(null);
    onValueChange?.("");
    setSelectedTitularData?.(undefined);
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
    if (value) {
      const item = dataList.find((c) => c[valueKey] === value);
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
      {/* Contenedor principal */}
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
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-medium">{getItemLabel(selectedItem)}</span>
                {secondaryLabelKey && (
                  <Badge variant="secondary" className="text-xs">
                    {String(selectedItem[secondaryLabelKey])}
                  </Badge>
                )}
                {thirdLabelKey && (
                  <Badge variant="outline" className="text-xs text-gray-500">
                    {String(selectedItem[thirdLabelKey])}
                  </Badge>
                )}
              </div>
            </div>
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

      {/* Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-hidden shadow-lg">
          <div className="p-3 pt-0 mt-0 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={inputRef}
                placeholder={
                  placeholder.toLowerCase().startsWith("buscar")
                    ? placeholder
                    : `Buscar ${placeholder.toLowerCase()}`
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {isFetchingPersonas && (
              <div className="w-full flex items-center justify-center">
                <Loader2Icon className="animate-spin w-10 h-10 text-gray-500" />
              </div>
            )}

            {!isFetchingPersonas && (
              <>
                {filteredItems.length === 0 ? (
                  !searchTerm && !mostrarPreview ? (
                    <div className="p-4 text-center text-gray-500">
                      Comience escribiendo para buscar...
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No se encontraron resultados
                    </div>
                  )
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
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{getItemLabel(item)}</span>
                          {secondaryLabelKey && (
                            <Badge variant="outline" className="text-xs">
                              {String(item[secondaryLabelKey])}
                            </Badge>
                          )}
                          {thirdLabelKey && (
                            <Badge variant="outline" className="text-xs text-gray-500">
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
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
