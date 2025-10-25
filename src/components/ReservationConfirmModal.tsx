import { formatearSeparadorMiles } from '@/helper/formatter';
import type { Moneda } from '@/types/reservas';
import { X, Calendar, Hotel, Users, BedDouble, CheckCircle2, Star } from 'lucide-react';

interface ReservationData {
  package: string;
  duration: string;
  departureDate: string;
  returnDate: string;
  numberOfPeople: number;
  hotel: string;
  hotelRating: number;
  roomType: string;
  servicesIncluded: number;
  deposit: number;
  depositPerPerson: number;
  totalPrice: number;
  pricePerPerson: number;
  currency: Moneda;
}

interface ReservationConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reservationData: ReservationData;
}

export default function ReservationConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  reservationData,
}: ReservationConfirmModalProps) {
  if (!isOpen) return null;


  // :19:40.846	      
  // {
  //   package: 'Rio Aereo Flexibble x5',
  //   duration: '7 días',
  //   departureDate: '25/10/2025 00:00',
  //   returnDate: '01/11/2025 00:00',
  //   numberOfPeople: 2,
  //   hotel: '',
  //   hotelRating: 4,
  //   roomType: 'doble',
  //   servicesIncluded: 0,
  //   deposit: 440,
  //   depositPerPerson: 220,
  //   totalPrice: 2600,
  //   pricePerPerson: 1300,
  //   currency: { id: 2, nombre: 'Dolar', simbolo: '$', codigo: 'USD' }
  // }

  console.log(reservationData)


  // Función para extraer solo la fecha (sin hora)
  const extractDate = (dateString: string) => {
    if (!dateString) return '';
    // Si la fecha contiene espacio (formato: DD/MM/YYYY HH:MM), extraer solo la parte de la fecha
    return dateString.split(' ')[0];
  };


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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 rounded-xl shadow-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto backdrop-blur-sm">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Confirmar Reserva</h2>
            <p className="text-sm text-gray-500 mt-1">
              Revisa los detalles antes de confirmar tu reserva
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Package Info */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {reservationData.package}
                </h3>
                <p className="text-sm text-gray-600">Duración: {reservationData.duration}</p>
              </div>
              <div className="text-right">
                {/* <p className="text-xs text-gray-500 mb-1">{reservationData.currency} Dólar</p> */}
                <p className="text-xs text-gray-500 mb-1">{reservationData.currency.simbolo} Dólar</p>
              </div>
            </div>
          </div>

          {/* Dates & People */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Fechas</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Salida:</span>
                  <span className="font-medium text-gray-900">
                    {extractDate(reservationData.departureDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Regreso:</span>
                  <span className="font-medium text-gray-900">
                    {extractDate(reservationData.returnDate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Personas</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Número de personas:</span>
                  <span className="font-medium text-gray-900">
                    {reservationData.numberOfPeople}
                    {/* dfgsgwg */}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Servicios incluidos:</span>
                  <span className="font-medium text-gray-900">
                    {reservationData.servicesIncluded}
                    {/* fgjrghjrteh */}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Hotel Info */}
          <div className="border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 p-2 rounded-lg">
                <Hotel className="w-5 h-5 text-amber-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Alojamiento</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Hotel:</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-medium text-gray-900">{reservationData.hotel}</span>
                  <div className="flex">
                    {/* {[...Array(reservationData.hotelRating)].map((_, i) => (
                      <span key={i} className="text-amber-400 text-xs">★</span>
                    ))} */}
                    {renderStars(reservationData.hotelRating)}
                  </div>
                </div>
              </div>
              <div>
                <span className="text-gray-600">Habitación:</span>
                <div className="mt-1 flex items-center gap-2">
                  <BedDouble className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900 capitalize">
                    {reservationData.roomType}
                    {/* jrtjrthr */}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gray-50 rounded-lg p-5 space-y-4">
            <h4 className="font-semibold text-gray-900 mb-3">Resumen de Precios</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-700">Seña</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatearSeparadorMiles.format(reservationData.depositPerPerson)} por persona
                  </p>
                </div>
                <p className="text-xl font-bold text-blue-600">
                  {reservationData.currency.simbolo} {formatearSeparadorMiles.format(reservationData.deposit)}
                  
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-base font-semibold text-gray-900">Precio Total</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatearSeparadorMiles.format(reservationData.pricePerPerson)} por persona
                    {/* asfasdfas por persona */}
                  </p>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {reservationData.currency.simbolo} {formatearSeparadorMiles.format(reservationData.totalPrice)}
                  {/* 534634634534 */}
                </p>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Importante</p>
                <p className="text-blue-700">
                  Al confirmar, aceptas los términos y condiciones de la reserva.
                  Recibirás un correo de confirmación con todos los detalles.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              onConfirm()
            }}
            className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Confirmar Reserva
          </button>
        </div>
      </div>
    </div>
  );
}
