/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, memo, useMemo } from "react";
import {
  Building,
  CheckCircle,
  Bed,
  Users,
  AlertCircle,
  Loader2,
  Star,
} from "lucide-react";
import { capitalizePrimeraLetra, formatearSeparadorMiles } from "@/helper/formatter";
import { Badge } from "./ui/badge";

interface Habitacion {
  id: string;
  tipo: string;
  capacidad: number;
  precio_noche: number;
  moneda_simbolo: string;
  cupo: number;
}

interface Hotel {
  habitaciones: any;
  id: string;
  nombre: string;
  ciudad_nombre: string;
  pais_nombre: string;
  descripcion: string;
  estrellas: number;
}

interface HabitacionListItem {
  habitacion_id: number;
  hotel_id: number;
  hotel_nombre: string;
  habitacion_numero: string;
  habitacion_tipo: string;
  capacidad: number;
  precio_noche: string;
  precio_venta_final: string;
  cupo: number;
  precio_moneda_alternativa: MonedaAlternativaCotizada;
  
}

export interface MonedaAlternativaCotizada {
  moneda: string;              // Ej: "PYG"
  precio_venta_final: number;  // Monto final de venta (viene como string con decimales)
  cotizacion: string;          // Cotización (también string, puede contener decimales)
  fecha_cotizacion: string;    // Fecha en formato ISO (YYYY-MM-DD)
}

interface SelectedHotelHabitacion {
  hotel: Hotel;
  habitacion: HabitacionListItem;
}

interface HotelHabitacionSelectorListModeProps {
  esDistribuidor: boolean;
  hoteles: Hotel[];
  habitaciones: Habitacion[];
  habitacionesResumenPrecios: HabitacionListItem[];
  selectedHotelId: string | number;
  selectedHabitacionId: string | number;
  selectedSalidaCupo: number;
  isLoading?: boolean;
  onSelectItem: (selection: SelectedHotelHabitacion) => void;
}

const HotelHabitacionSelectorListModeComponent: FC<HotelHabitacionSelectorListModeProps> = ({
  esDistribuidor,
  hoteles,
  habitacionesResumenPrecios,
  selectedHabitacionId,
  selectedSalidaCupo,
  isLoading = false,
  onSelectItem,
}) => {
  // 🔄 Ordenar habitaciones por precio de venta final de menor a mayor
  const habitacionesOrdenadas = useMemo(() => {
    if (!habitacionesResumenPrecios?.length) return [];

    return [...habitacionesResumenPrecios].sort((a, b) => {
      const precioA = parseFloat(a.precio_venta_final);
      const precioB = parseFloat(b.precio_venta_final);
      return precioA - precioB;
    });
  }, [habitacionesResumenPrecios]);


  // 🎨 Estilos dinámicos según cupos disponibles
  const getStyleCuposDisponiblePorHabitacion = (cupos: number) => {
    if (cupos === 0) return "bg-red-600 text-white text-red-600 font-semibold rounded-xl px-2 py-0";
    if (cupos <= 3) return "text-red-600 font-semibold";
    if (cupos <= 7) return "text-orange-600 font-medium";
    if (cupos <= 12) return "text-amber-600 font-medium";
    return "text-gray-600 font-normal";
  };


  console.log(esDistribuidor)

  // 🌀 Estado de carga
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
        <Loader2 className="w-8 h-8 mb-2 animate-spin text-blue-500" />
        <p className="text-sm font-medium">Cargando habitaciones...</p>
      </div>
    );
  }

  // 📭 Sin habitaciones
  if (!habitacionesOrdenadas.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
        <Bed className="w-8 h-8 mb-2 text-gray-400" />
        <p className="text-sm">No hay habitaciones disponibles.</p>
      </div>
    );
  }

  const renderStars = (rating: number) => {
        return (
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                className={`h-3 w-3 ${
                  index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
            <span className="ml-1 text-sm text-gray-600">({rating})</span>
          </div>
        );
      };


  return (
    <div className="space-y-3 overflow-y-auto flex-1 p-2 rounded-lg">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Habitaciones ordenadas por precio
        </h3>
        <p className="text-sm text-gray-600">
          {habitacionesOrdenadas.length} habitación{habitacionesOrdenadas.length !== 1 ? "es" : ""} disponible{habitacionesOrdenadas.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-4">
        {habitacionesOrdenadas.map((habitacion) => {
          const isRoomSelected = selectedHabitacionId?.toString() === habitacion?.habitacion_id?.toString();
          const cuposInsuficientes = selectedSalidaCupo < habitacion.capacidad;
          const isAgotado = habitacion.cupo === 0;
          const h = hoteles.filter((hotel: any) => hotel?.id?.toString() === habitacion?.hotel_id?.toString())
          const estrellas = h.length ? h[0].estrellas : 0;

          return (
            <div
              key={habitacion.habitacion_id}
              onClick={() => {
                if (!isAgotado) {
                  const hotelSeleccionado = hoteles.find((hotel: Hotel) => hotel.id.toString() === habitacion.hotel_id.toString());

                  if (hotelSeleccionado) {
                    onSelectItem({
                      hotel: hotelSeleccionado,
                      habitacion: habitacion
                    });
                  }
                }
              }}
              className={`border-2 rounded-lg px-5 pt-3 pb-1 transition-all ${
                isAgotado
                  ? "cursor-not-allowed opacity-50 bg-gray-100"
                  : "cursor-pointer hover:border-blue-300 hover:shadow-md"
              } ${
                isRoomSelected
                  ? "border-blue-500 bg-blue-50 shadow-lg"
                  : "border-gray-300 bg-white"
              }`}
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* 🏨 Información del Hotel */}
                <div className="flex-shrink-0 md:w-64">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                        isRoomSelected ? "bg-blue-200" : "bg-gray-200"
                      }`}
                    >
                      <Building
                        className={`w-6 h-6 ${
                          isRoomSelected ? "text-blue-700" : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div className="flex-col">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 mb-1">
                          {habitacion.hotel_nombre}
                        </h4>
                      </div>
                      {/* <div className="flex items-center gap-2 mt-2"> */}
                      
                        <span className="text-sm text-gray-600">
                          {h[0].ciudad_nombre}, {h[0].pais_nombre}
                        </span>
                      {/* </div> */}
                      <div className="flex items-center">{renderStars(estrellas)}</div>
                    </div>
                  </div>
                </div>

                {/* 🛏️ Información de la Habitación */}
                <div className="flex-1 border-l-0 md:border-l-2 border-gray-200 md:pl-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                          isRoomSelected ? "bg-blue-200" : "bg-gray-200"
                        }`}
                      >
                        <Bed
                          className={`w-6 h-6 ${
                            isRoomSelected ? "text-blue-700" : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div className="flex-col">
                        <h5 className="text-base font-semibold text-gray-700 capitalize">
                            {capitalizePrimeraLetra(habitacion.habitacion_tipo)}
                        </h5>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Users className="w-4 h-4 mr-1" />
                          <span>Hasta {habitacion.capacidad} personas</span>
                        </div>
                        <div className="relative top-1">
                          {cuposInsuficientes ? (
                            <div className="flex items-center gap-1 text-sm">
                              {esDistribuidor ? 
                                // <div className="text-xs text-gray-600 mb-1">Sujeto a disponibilidad del proveedor</div>
                                <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                                  Sujeto a disponibilidad
                                </Badge>
                              :
                                <>
                                  <AlertCircle className="w-4 h-4 text-orange-500" />
                                  <span className="text-orange-600 font-medium">
                                    Cupos insuficientes (disponible: {selectedSalidaCupo})
                                  </span>
                                </>
                              }
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-sm"> 
                              <span className={`${getStyleCuposDisponiblePorHabitacion(habitacion.cupo)}`}>
                                {habitacion.cupo > 1 && `${habitacion.cupo} habitaciones disponibles`}
                                {habitacion.cupo === 1 && "1 habitación disponible"}
                                {habitacion.cupo === 0 && "Agotado"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                     {/* Precio */}
                    <div className="flex flex-row gap-5 items-center">
                          <div className="text-right">
                            <div className="text-xs text-gray-600 mb-1">Precio total</div>
                            <div className="text-2xl font-bold text-blue-600">
                              ${" "}
                              {formatearSeparadorMiles.format(parseFloat(habitacion.precio_venta_final))}
                            </div>
                            <p className="text-xs text-muted-foreground">Precio en {habitacion?.precio_moneda_alternativa?.moneda} <span className="text-gray-900 font-bold">{formatearSeparadorMiles.format(habitacion.precio_moneda_alternativa.precio_venta_final)}</span></p> 
                            <div className="text-xs text-gray-600 mb-1">Por persona</div>
                          </div>
                        

                        {isRoomSelected && !isAgotado && (
                          <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                        )}
                    </div>
                  </div>

                  
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 🧠 Memoizado para evitar renders innecesarios
export const HotelHabitacionSelectorListMode = memo(HotelHabitacionSelectorListModeComponent);
