/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, memo } from "react";
import {
  Building,
  CheckCircle,
  MapPin,
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

interface HotelHabitacionSelectorProps {
  esDistribuidor: boolean;
  hoteles: Hotel[];
  habitaciones: Habitacion[];
  selectedHotelId: string;
  selectedHabitacionId: string;
  selectedSalidaCupo: number;
  isLoading?: boolean;
  onSelectHotel: (hotel: Hotel) => void;
  onSelectHabitacion: (habitacion: Habitacion) => void;
}

const HotelHabitacionSelectorComponent: FC<HotelHabitacionSelectorProps> = ({
  esDistribuidor,
  hoteles,
  habitaciones,
  selectedHotelId,
  selectedHabitacionId,
  selectedSalidaCupo,
  isLoading = false,
  onSelectHotel,
  onSelectHabitacion,
}) => {
  // 🌀 Estado de carga
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
        <Loader2 className="w-8 h-8 mb-2 animate-spin text-blue-500" />
        <p className="text-sm font-medium">Cargando hoteles y habitaciones...</p>
      </div>
    );
  }

  // 📭 Sin resultados
  if (!hoteles?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
        <Building className="w-8 h-8 mb-2 text-gray-400" />
        <p className="text-sm">No hay hoteles disponibles para esta salida.</p>
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


  const getStyleCuposDisponiblePorHabitacion = (cupos: number) => {
    if (cupos === 0) return "bg-red-600 text-white text-red-600 font-semibold rounded-xl px-2 py-0";
    if (cupos <= 3) return "text-red-600 font-semibold ";
    if (cupos <= 7) return "text-orange-600 font-medium" ;
    if (cupos <= 12) return "text-amber-600 font-medium";
    return "text-gray-600 font-normal";
  }

  return (
    <div className="space-y-3 overflow-y-auto flex-1 p-2 rounded-lg">
      {hoteles.map((hotel) => {
        const isSelected = selectedHotelId === hotel.id;

        return (
          <div
            key={hotel.id}
            className="bg-white border-2 rounded-lg overflow-hidden transition-all"
          >
            {/* 🔹 Cabecera del hotel */}
            <div
              onClick={() => onSelectHotel(hotel)}
              className={`p-5 cursor-pointer transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center ${
                    isSelected ? "bg-blue-200" : "bg-gray-200"
                  }`}
                >
                  <Building
                    className={`w-8 h-8 ${
                      isSelected ? "text-blue-700" : "text-gray-600"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {hotel.nombre}
                    </h3>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" />
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span>
                      {hotel.ciudad_nombre}, {hotel.pais_nombre}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center">{renderStars(hotel.estrellas)}</div>
                    <span className="text-xs text-gray-500">
                      {hotel?.habitaciones?.length || 0} tipos de habitación
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 🔹 Habitaciones si el hotel está seleccionado */}
            {isSelected && (
              <div className="p-5 bg-gradient-to-b from-blue-50 to-white border-t-2 border-blue-200">
                {habitaciones?.length ? (
                  <>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Bed className="w-5 h-5 mr-2 text-blue-600" />
                      Seleccionar tipo de habitación:
                    </h4>

                    <div className="grid md:grid-cols-3 gap-3">
                      {habitaciones.map((habitacion) => {
                        const isRoomSelected = selectedHabitacionId.toString() === habitacion.id.toString();
                        const cuposInsuficientes = selectedSalidaCupo < habitacion.capacidad;
                        const isAgotado = !esDistribuidor ? habitacion.cupo === 0 : false;


                        console.log(cuposInsuficientes)
                        console.log(isAgotado);
                        return (
                          <div
                            key={habitacion.id}
                            onClick={() => {
                              // Evitar selección si no hay cupos
                              if (!isAgotado) {
                                onSelectHabitacion(habitacion);
                              }
                            }}
                            className={`relative border-2 rounded-lg p-4 transition-all ${
                              isAgotado
                                ? "cursor-not-allowed opacity-50 bg-gray-100"
                                : "cursor-pointer hover:border-blue-300 hover:shadow-sm"
                            } ${
                              isRoomSelected
                                ? "border-blue-500 bg-blue-50 shadow-md"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {isRoomSelected && !isAgotado && (
                              <div className="absolute top-2 right-2">
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                              </div>
                            )}

                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                                isRoomSelected ? "bg-blue-200" : "bg-gray-200"
                              }`}
                            >
                              <Bed
                                className={`w-6 h-6 ${
                                  isRoomSelected ? "text-blue-700" : "text-gray-600"
                                }`}
                              />
                            </div>

                            <h5 className="font-bold text-gray-900 mb-2">
                              {capitalizePrimeraLetra(habitacion.tipo)}
                            </h5>
                            <div className="flex items-center text-xs text-gray-600 mb-3">
                              <Users className="w-3 h-3 mr-1" />
                              <span>Hasta {habitacion.capacidad} personas</span>
                            </div>


                            {/* {!esDistribuidor && cuposInsuficientes} */}

                            {!esDistribuidor && cuposInsuficientes && (
                              <div className="flex items-center gap-1 mt-2 text-sm">
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                                <span className="text-orange-600 font-medium">
                                  Cupos insuficientes (disponible: {selectedSalidaCupo})
                                </span>
                              </div>
                            )}
                            {!esDistribuidor && !cuposInsuficientes && (
                              <div className="flex items-center gap-1 mt-2 text-sm">
                                <span className={`${getStyleCuposDisponiblePorHabitacion(habitacion.cupo)}`}>
                                  {habitacion.cupo > 1 && `${habitacion.cupo} habitaciones disponibles`}
                                  {habitacion.cupo === 1 && "1 habitación disponible"}
                                  {habitacion.cupo === 0 && "Agotado"}
                                </span>
                              </div>
                            )}


                            {esDistribuidor && <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                              Sujeto a disponibilidad
                            </Badge>}

                            {esDistribuidor &&  <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 p-1 mt-2 border border-green-200 dark:border-green-800">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 dark:bg-green-500">
                                <svg
                                  className="h-3 w-3 text-white"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                                Incluido en tu paquete
                              </span>
                            </div>} 

                            {!esDistribuidor && 
                              <div className="pt-3 border-t border-gray-200">
                                <div className="text-xs text-gray-600 mb-1">Precio por noche</div>
                                <div className="text-lg font-bold text-blue-600">
                                  {habitacion.moneda_simbolo}{" "}
                                  {formatearSeparadorMiles.format(habitacion.precio_noche)}
                                </div>
                              </div>
                            }
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-500 py-8">
                    <Bed className="w-6 h-6 mb-2 text-gray-400" />
                    <p className="text-sm">No hay tipos de habitación disponibles.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// 🧠 Memoizado para evitar renders innecesarios
export const HotelHabitacionSelector = memo(HotelHabitacionSelectorComponent);
