/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Label } from "@/components/ui/label"
import { Calendar, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
// import type { DepartureDate } from "./package-selector"
// import { RadioGroup } from "@radix-ui/react-dropdown-menu"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface DepartureDateSelectorProps {
  fechaSalidasList: any[]
  fechaSeleccionada: string
  onFechaSeleccionada: (dateId: string) => void
}

export function FechaSalidaSelectorContainer({ fechaSalidasList, fechaSeleccionada, onFechaSeleccionada }: DepartureDateSelectorProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }



  console.log(fechaSalidasList)

  //  id: 212,
  //     fecha_salida: '2025-10-01',
  //     fecha_regreso: '2025-10-10',
  //     moneda: { id: 2, nombre: 'Dolar' },
  //     temporada: null,
  //     precio_actual: 1800,
  //     precio_final: 2250,
  //     ganancia: 10,
  //     comision: null,
  //     precio_venta_sugerido_min: 1980,
  //     precio_venta_sugerido_max: 2475,
  //     cupo: 45,
  //     senia: 250,
  //     activo: true,
  //     hoteles: [
  //       { id: 20, nombre: 'Hotel Prueba' },
  //       { id: 19, nombre: 'Victor Holte 3' }
  //     ],
  //     habitacion_fija: null,
  //     cupos_habitaciones: [
  //       {
  //         habitacion: { id: 30, tipo: 'doble', hotel: 'Hotel Prueba' },
  //         cupo: 10
  //       },
  //       {
  //         habitacion: { id: 31, tipo: 'single', hotel: 'Hotel Prueba' },
  //         cupo: 5
  //       },
  //       {
  //         habitacion: { id: 29, tipo: 'single', hotel: 'Victor Holte 3' },
  //         cupo: 5
  //       },
  //       {
  //         habitacion: { id: 32, tipo: 'doble', hotel: 'Victor Holte 3' },
  //         cupo: 8
  //       }
  //     ]
  //   }

  return (
    <div className="space-y-4">
      <Label>Fecha de Salida *</Label>
      <RadioGroup value={fechaSeleccionada} onValueChange={onFechaSeleccionada} className="space-y-3">
        {fechaSalidasList.map((departure) => (
          <div key={departure.id} className="relative">
            <RadioGroupItem value={departure.id} id={departure.id} className="peer sr-only" />
            <Label
              htmlFor={departure.id}
              className="flex items-start gap-4 p-4 rounded-lg border-2 border-muted bg-background hover:bg-accent/5 cursor-pointer transition-all peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 peer-data-[state=checked]:bg-blue-100">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground capitalize">{formatDate(departure.fecha_salida)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{departure.cupo} cupos disponibles</span>
                      </div>
                      {departure.availableSeats <= 5 && (
                        <Badge variant="destructive" className="text-xs">
                          Últimos cupos
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-blue-600">{formatCurrency(departure.precio_actual)}</p>
                    <p className="text-xs text-muted-foreground">por persona</p>
                  </div>
                </div>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
