/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, useEffect, useMemo, useState } from "react";
import {
  Building,
  Users,
  Loader2,
  BedDouble,
  Minus,
  Plus,

} from "lucide-react";
import { formatearSeparadorMiles } from "@/helper/formatter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { HotelEstrellas } from "@/components/HotelEstrellas";
import type { HabitacionHotel, HotelReserva } from "@/types/reservas";
import { BloqueoHabitacionesSeleccionadosCard } from "./BloqueoHabitacionesSeleccionadosCard";
import { useBloqueoHabitacionContext } from "@/context/BloqueoHabitacionContext";




export interface MonedaAlternativaCotizada {
  moneda: string;              // Ej: "PYG"
  precio_venta_final: number;  // Monto final de venta (viene como string con decimales)
  cotizacion: string;          // Cotización (también string, puede contener decimales)
  fecha_cotizacion: string;    // Fecha en formato ISO (YYYY-MM-DD)
}

interface BloqueoHabitacionesContainerProps {
  isLoading?: boolean;
  handleAumentarBloqueo: (habitacionId: number, capacidad: number) => void
  handleDisminuirBloqueo: (habitacionId: number) => void
}


const BloqueoHabitacionesContainer: FC<BloqueoHabitacionesContainerProps> = ({
    handleAumentarBloqueo,
    handleDisminuirBloqueo,
    isLoading = false,
}) => {
  const { bloqueoData, hotelesPorSalida } = useBloqueoHabitacionContext();


  const getStyleCuposDisponiblePorHabitacion = (cupos: number) => {
    if (cupos === 0) return "bg-red-600 text-white text-red-600 font-semibold rounded-xl px-2 py-0";
    if (cupos <= 3) return "text-red-600 font-semibold";
    if (cupos <= 7) return "text-orange-600 font-medium";
    if (cupos <= 12) return "text-amber-600 font-medium";
    return "text-gray-600 font-normal";
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
        <Loader2 className="w-8 h-8 mb-2 animate-spin text-blue-500" />
        <p className="text-sm font-medium">Cargando hoteles...</p>
      </div>
    );
  }


  return (
    <>
    <div>
      {JSON.stringify(bloqueoData)}
    </div>
        <Accordion
          type="single"
          collapsible
          className="w-full"
          >
          {hotelesPorSalida.map((hotel: HotelReserva) => 
              <AccordionItem
                key={hotel.id.toString()}
                value={hotel.id.toString()}
                className="rounded-lg border-2 border-gray-300 last:border-b-2 not-first:mt-2">
                <AccordionTrigger className="accordion-trigger-bloqueo flex-row-reverse justify-end items-center hover:no-underline w-full px-5 pt-3 pb-1 transition-all bg-white">
                  <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex md:w-64 gap-3">
                          <div className="flex items-start gap-3 mb-3">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gray-200`}>
                                    <Building className={`w-6 h-6 text-gray-600`}/> 
                              </div>
                          </div>

                          <div className="flex-col">
                              <div className="flex gap-3 min-w-0">
                                  <h4 className="font-bold text-gray-900 mb-1 whitespace-nowrap">
                                  {hotel.nombre}
                                  </h4>

                                  <span>
                                    <div className="flex items-center">
                                      <HotelEstrellas  rating={hotel.estrellas}/>
                                    </div>
                                  </span>
                              </div>

                              <span className="text-sm text-gray-600">
                                  {hotel.ciudad_nombre}, {hotel.pais_nombre}
                              </span>
                          </div>
                      </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="border-t border-gray-100">
                  {hotel.habitaciones.map((habitacion: HabitacionHotel) => {
                    // const capacidad = bloqueoData.find(b => b.habitacion_id.toString() === habitacion.id.toString())?.capacidad ?? 0;
                    const bloqueo = bloqueoData.find(b => b.habitacion_id.toString() === habitacion.id.toString()) ?? null;

                    let capacidad = 0;
                    let cantidadBloqueada = 0;

                    if(bloqueo){
                      capacidad = bloqueo.capacidad;
                      cantidadBloqueada = bloqueo.cantidad
                    }
                    
                    
                    return (<div key={habitacion.id} className={`px-5 py-4 border-b border-gray-100 overflow-x-auto`}>
                          <div className="flex items-center justify-between overflow-x-auto">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                  <BedDouble size={20} className="text-blue-500" />
                                </div>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">
                                      {habitacion.tipo_habitacion_nombre}
                                    </span>
                                    <span className="text-gray-400">·</span>
                                    <span className="text-sm text-gray-500 flex items-center gap-1">
                                      <Users size={14} />
                                      {habitacion.capacidad} {habitacion.capacidad > 1 ? 'personas': 'persona'}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`${getStyleCuposDisponiblePorHabitacion(habitacion.cupo)}`}>
                                      {habitacion.cupo > 1 && `${habitacion.cupo} habitaciones disponibles`}
                                      {habitacion.cupo === 1 && "1 habitación disponible"}
                                      {habitacion.cupo === 0 && "Agotado"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-lg font-bold text-blue-600">
                                  {habitacion?.precio_calculado?.precio_moneda_alternativa?.moneda === 'USD' ? 'Gs.': 'USD'}{" "}
                                  {formatearSeparadorMiles.format(parseFloat(habitacion.precio_calculado.precio_venta_final))}
                                </div>
                                <div className="text-xs text-gray-400">Por noche</div>
                              </div>
                          </div>


                          <div className="flex items-center justify-between mt-3 ml-13 ">
                              <div className="flex items-center gap-3">

                                <span className="text-sm text-gray-600">Cantidad:</span>
                                <div className="flex items-center gap-2">
                                  <button
                                  type="button"
                                    onClick={() => handleDisminuirBloqueo(habitacion.id)}
                                    disabled={cantidadBloqueada === 0}
                                    className="cursor-pointer w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className={`w-8 text-center font-semibold
                                    ${cantidadBloqueada > 0 ? 'text-blue-600': 'text-gray-900'}`}>
                                      
                                    {cantidadBloqueada}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleAumentarBloqueo(habitacion.id, habitacion.capacidad)}
                                    disabled={cantidadBloqueada >= habitacion.cupo}
                                    className="cursor-pointer w-8 h-8 ml-4 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              </div>
                              {/* {isSelected && ( */}
                                <div className="text-sm text-gray-700">
                                  Subtotal: <span className="font-semibold text-gray-900">
                                    {formatearSeparadorMiles.format((cantidadBloqueada * capacidad) * parseFloat(habitacion.precio_calculado.precio_venta_final))}
                                  </span>
                                </div>
                              {/* )} */}
                          </div>
                        </div>)
                    }
                  )}

                </AccordionContent>
              </AccordionItem>
          )}
        </Accordion>


        <BloqueoHabitacionesSeleccionadosCard/>
    </>
    )
}

export default BloqueoHabitacionesContainer