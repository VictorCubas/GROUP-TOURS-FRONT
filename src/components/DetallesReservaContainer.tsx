/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { formatearFecha, formatearSeparadorMiles, getPrimerNombreApellido } from '@/helper/formatter';
import { getPaymentPercentage, getPaymentStatus, PAYMENT_STATUS, DOCUMENT_TYPES, } from '@/types/reservas';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Baby, Building, Calendar, CheckCircle, Clock, CreditCard, Crown, DollarSign, Edit2, FileText, Globe, Loader2, Mail, MapPin, Package, Phone, Star, Ticket, User, UserCheck, Users } from 'lucide-react';
import { fetchReservaDetallesById } from './utils/httpReservas';
import { Badge } from './ui/badge';

interface DetallesReservaContainerProps{
    activeTab: 'general' | 'passengers' | 'payments';
    reservaId: number | string;
    onClose: () => void
    
} 

const DetallesReservaContainer: React.FC<DetallesReservaContainerProps> = ({
    activeTab, 
    reservaId,
    onClose
}) => {



const {data: dataDetalleTemp, isFetching: isFetchingDetalles,} = useQuery({
    queryKey: ['reserva-detalles', reservaId], //data cached
    queryFn: ({signal}) => fetchReservaDetallesById({signal, id: reservaId}),
    enabled: Boolean(reservaId),
    staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
});


console.log(dataDetalleTemp)

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

    const paymentStatus = getPaymentStatus(dataDetalleTemp);
    const paymentProgress = getPaymentPercentage(dataDetalleTemp);

    const getAgeFromBirthDate = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();

        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const getPassengerTypeIcon = (passenger: any) => {
        const age = getAgeFromBirthDate(passenger.persona.fecha_nacimiento);

        if (age < 18) return <Baby className="w-4 h-4 text-orange-500" />;
            return <UserCheck className="w-4 h-4 text-green-500" />;
    };


    if(isFetchingDetalles){
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
                <Loader2 className="w-8 h-8 mb-2 animate-spin text-blue-500" />
                <p className="text-sm font-medium">Cargando detalles...</p>
            </div>
            );
}

return   <>
    {/* Contenido de tabs */}
    <div className="p-8">
            {activeTab === 'general' && (
                <div className="space-y-8">
                    {/* Información del Titular */}
                    <div className="bg-blue-50 p-6 rounded-xl">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <Crown className="w-6 h-6 mr-3 text-blue-600" />
                        Titular de la Reserva
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                            <User className="w-5 h-5 text-gray-400" />
                            <div>
                            <p className="font-medium text-gray-900">
                                {getPrimerNombreApellido(dataDetalleTemp?.titular?.nombre, dataDetalleTemp?.titular?.apellido)}
                            </p>
                            <p className="text-sm text-gray-500">Nombre completo</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <div>
                            <p className="font-medium text-gray-900">
                                {dataDetalleTemp?.titular?.documento}
                            </p>
                            <p className="text-sm text-gray-500">Documento de identidad</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                            <p className="font-medium text-gray-900">
                                {formatearFecha(dataDetalleTemp.titular.fecha_nacimiento, false)} 
                                <Badge className="ml-1 text-xs bg-blue-200  text-gray-700 text-center py-1">
                                    {getAgeFromBirthDate(dataDetalleTemp.titular.fecha_nacimiento)} años
                                </Badge>
                                
                            </p>
                            <p className="text-sm text-gray-500">Fecha de nacimiento</p>
                            </div>
                        </div>
                        </div>

                        <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <div>
                            <p className="font-medium text-gray-900">
                                {dataDetalleTemp?.titular?.email}
                            </p>
                            <p className="text-sm text-gray-500">Correo electrónico</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <div>
                            <p className="font-medium text-gray-900">
                                {/* {booking.persona.telefono} */}
                                {dataDetalleTemp?.titular?.telefono}
                            </p>
                            <p className="text-sm text-gray-500">Teléfono</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Globe className="w-5 h-5 text-gray-400" />
                            <div>
                            <p className="font-medium text-gray-900">
                                {dataDetalleTemp.titular.nacionalidad_nombre}
                            </p>
                            <p className="text-sm text-gray-500">Nacionalidad</p>
                            </div>
                        </div>
                        </div>
                    </div>

                    {/* {dataDetalle.persona.direccion && (
                                    <div className="mt-4 pt-4 border-t border-blue-200">
                                        <div className="flex items-center space-x-3">
                                        <MapPin className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                            {booking.persona.direccion}
                                            {booking.persona.ciudad && `, ${booking.persona.ciudad}`}
                                            {booking.persona.pais && `, ${booking.persona.pais}`}
                                            </p>
                                            <p className="text-sm text-gray-500">Dirección</p>
                                        </div>
                                        </div>
                                    </div>
                                    )} */}
                    </div>

                    {/* DETALLES DEL PAQUETE */}
                    <div>
                        <div className="bg-green-50 p-6 rounded-xl">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <Package className="w-6 h-6 mr-3 text-green-600" />
                            Detalles del Paquete
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div>
                                    <p className="font-medium text-gray-900 text-lg">
                                        {dataDetalleTemp?.paquete?.nombre}
                                    </p>
                                    <p className="text-sm text-gray-500">Nombre del paquete</p>
                                    </div>
                                    <div>
                                    <p className="font-medium text-gray-900">
                                        {dataDetalleTemp?.paquete.destino.ciudad},{' '}
                                        {dataDetalleTemp?.paquete.destino.pais}
                                    </p>
                                    <p className="text-sm text-gray-500">Destino</p>
                                    </div>
                                    <div>
                                    <p className="font-medium text-gray-900">
                                        {dataDetalleTemp?.paquete.tipo_paquete.nombre}
                                    </p>
                                    <p className="text-sm text-gray-500">Tipo de paquete</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                    <p className="font-medium text-gray-900">
                                        {dataDetalleTemp?.paquete.moneda?.simbolo || '$'}{formatearSeparadorMiles.format(dataDetalleTemp.precio_unitario)} {dataDetalleTemp?.paquete.moneda?.codigo || 'USD'}
                                    </p>
                                    <p className="text-sm text-gray-500">Precio por persona</p>
                                    </div>
                                    <div>
                                    <p className="font-medium text-gray-900">
                                        {/* {dataDetalle?.paquete.moneda?.simbolo || '$'}{dataDetalle?.paquete.sena.toLocaleString()} {dataDetalle?.paquete.moneda?.codigo || 'USD'} */}
                                        {dataDetalleTemp?.paquete.moneda?.simbolo || '$'}{formatearSeparadorMiles.format(dataDetalleTemp.seña_total)} {dataDetalleTemp?.paquete.moneda?.codigo || 'USD'}
                                    </p>
                                    <p className="text-sm text-gray-500">Seña requerida</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                    {dataDetalleTemp?.paquete.propio ? (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                        Paquete Propio
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                                        {dataDetalleTemp?.paquete.distribuidora?.nombre || 'Distribuidor'}
                                        </span>
                                    )}

                                    {dataDetalleTemp?.paquete.personalizado && (
                                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                                        Personalizado
                                        </span>
                                    )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-xl">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <Calendar className="w-6 h-6 mr-3 text-purple-600" />
                            Salida Seleccionada
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Fecha de Inicio</h4>
                                    <p className="text-gray-600">
                                        {/* {formatearFecha(dataDetalleTemp?.salida?.fecha_salida)} */}
                                        {new Date(dataDetalleTemp?.salida?.fecha_salida).toLocaleDateString(
                                            'es',
                                            {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            }
                                            )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Fecha de Fin</h4>
                                    <p className="text-gray-600">
                                        {/* {formatearFecha(dataDetalleTemp?.salida?.fecha_salida)} */}
                                        {new Date(dataDetalleTemp?.salida?.fecha_regreso).toLocaleDateString(
                                            'es',
                                            {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            }
                                            )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Precio de Salida</h4>
                                    <p className="text-gray-600 font-bold">
                                        {formatearSeparadorMiles.format(dataDetalleTemp?.precio_unitario)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* Hotel y Habitación Seleccionados */}
                    <div className="bg-orange-50 p-6 rounded-xl">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <Building className="w-6 h-6 mr-3 text-orange-600" />
                        Alojamiento Seleccionado
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-4 rounded-lg border border-orange-200">
                                <div className="flex items-center space-x-3 mb-3">
                                <Building className="w-6 h-6 text-orange-600" />
                                <div>
                                    <h4 className="font-semibold text-gray-900">
                                        {dataDetalleTemp?.hotel?.nombre}
                                    </h4>
                                    <div className="flex items-center space-x-1">
                                    <span className="text-sm text-gray-500 ml-1">
                                        {renderStars(dataDetalleTemp.hotel.estrellas)}
                                    </span>
                                    </div>
                                </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-orange-200">
                                <div className="flex items-center space-x-3 mb-3">
                                <Users className="w-6 h-6 text-orange-600" />
                                <div>
                                    <h4 className="font-semibold text-gray-900">
                                        {dataDetalleTemp?.habitacion?.tipo_display}
                                    </h4>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span>Capacidad: {dataDetalleTemp?.cantidad_pasajeros} personas</span>
                                    <span className="font-medium">
                                        {/* {booking.habitacion_seleccionada.precio_adicional > 0 
                                        ? `+${booking.paquete.moneda?.simbolo || '$'}${booking.habitacion_seleccionada.precio_adicional.toLocaleString()}`
                                        : 'Incluido'
                                        } */}
                                    </span>
                                    </div>
                                </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Información de la Reserva */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Información de la Reserva</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="font-medium text-gray-900">
                                {/* {new Date(booking.fecha_reserva).toLocaleDateString()} */}
                                {formatearFecha(dataDetalleTemp?.fecha_reserva, false)}
                            </p>
                            <p className="text-sm text-gray-500">Fecha de reserva</p>
                        </div>
                        
                        </div>
                    </div>
                </div>
                )}
        
            {activeTab === 'passengers' && (
                <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-semibold text-gray-900">
                    Lista de Pasajeros ({dataDetalleTemp?.cantidad_pasajeros})
                    </h3>
                    {(() => {
                    const pasajerosPorAsignar = dataDetalleTemp?.pasajeros?.filter(
                        (pasajero: any) => pasajero.persona?.nombre?.toLowerCase().includes('por asignar')
                    )?.length || 0;

                    return pasajerosPorAsignar > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                                <AlertCircle className="w-4 h-4 text-orange-600" />
                                <span className="text-sm font-medium text-orange-800">
                                    Faltan {pasajerosPorAsignar} pasajero{pasajerosPorAsignar !== 1 ? 's' : ''} por registrar y/o asignar
                                </span>
                            </div>
                        </div>
                    );
                })()}
                </div>

                {dataDetalleTemp?.pasajeros.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {dataDetalleTemp?.pasajeros.map((pasajero: any, index: number) => (
                        <div key={pasajero.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        {pasajero.es_titular ? <Crown className="w-6 h-6 text-blue-600" /> : getPassengerTypeIcon(pasajero)}
                                    </div>
                                    <div>
                                    <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                        {pasajero.persona.nombre.toLowerCase().includes('por asignar') ? 
                                            <span>{pasajero.persona.nombre}</span> :
                                            <span>{getPrimerNombreApellido(pasajero.persona.nombre, pasajero.persona.apellido)}</span>
                                        }

                                        {pasajero.es_titular && (
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                                Titular
                                            </span>
                                        )}
                                    </h4>
                                    <p className="text-sm text-gray-500">Pasajero #{index + 1}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {getAgeFromBirthDate(pasajero.persona.fecha_nacimiento)} años
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {getAgeFromBirthDate(pasajero.persona.fecha_nacimiento) < 18 ? 'Menor' : 'Adulto'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                    <p className="text-sm text-gray-500">Documento</p>
                                    <p className="font-medium text-gray-900">
                                        {DOCUMENT_TYPES[pasajero.persona.tipo_documento_nombre] || pasajero.persona.tipo_documento_nombre}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {pasajero.persona.documento}
                                    </p>
                                    </div>
                                    <div>
                                    <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                                    <p className="font-medium text-gray-900">
                                        {formatearFecha(pasajero.persona.fecha_nacimiento, false)}
                                    </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                    <p className="text-sm text-gray-500">Nacionalidad</p>
                                    <p className="font-medium text-gray-900 flex items-center">
                                        <Globe className="w-4 h-4 mr-1" />
                                        {pasajero.persona.nacionalidad_nombre || 'No especificado'}
                                    </p>
                                    </div>
                                    <div>
                                    <p className="text-sm text-gray-500">Género</p>
                                    <p className="font-medium text-gray-900 capitalize">
                                        {pasajero.persona.nombre.toLowerCase().includes('por asignar') ?
                                            'No especificado' : pasajero.persona.sexo_display
                                        }
                                    </p>
                                    </div>
                                </div>

                                {(pasajero.persona.telefono || pasajero.persona.email) && (
                                    <div className="pt-3 border-t border-gray-200">
                                    {pasajero.persona.telefono && (
                                        <div className="flex items-center space-x-2 mb-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">{pasajero.persona.telefono}</span>
                                        </div>
                                    )}
                                    {pasajero.persona.email && (
                                        <div className="flex items-center space-x-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">{pasajero.persona.email}</span>
                                        </div>
                                    )}
                                    </div>
                                )}

                                {/* Información de tickets y vouchers */}
                                {(pasajero.ticket_numero || pasajero.voucher_codigo) && (
                                    <div className="pt-3 border-t border-gray-200">
                                    <p className="text-sm text-gray-500 mb-2">Documentos de Viaje</p>
                                    <div className="space-y-2">
                                        {pasajero.ticket_numero && (
                                        <div className="flex items-center space-x-2">
                                            <Ticket className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-700 font-mono">{pasajero.ticket_numero}</span>
                                            <span className="text-xs text-gray-500">Ticket</span>
                                        </div>
                                        )}
                                        {pasajero.voucher_codigo && (
                                        <div className="flex items-center space-x-2">
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-700 font-mono">{pasajero.voucher_codigo}</span>
                                            <span className="text-xs text-gray-500">Voucher</span>
                                        </div>
                                        )}
                                    </div>
                                    </div>
                                )}

                                <div className="pt-3 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">
                                    Registrado: {new Date(pasajero.fecha_registro).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Pasajeros no registrados individualmente
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {/* Esta reserva fue creada en modo rápido con {booking.cantidad_pasajeros} pasajero{booking.cantidad_pasajeros !== 1 ? 's' : ''}. */}
                        Esta reserva fue creada en modo rápido con ASFAS pasajero{dataDetalleTemp.cantidad_pasajeros !== 1 ? 's' : ''}.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                        <div className="flex items-center space-x-2 mb-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Información disponible:</span>
                        </div>
                        <div className="text-sm text-blue-800 space-y-1">
                        {/* <p>• Titular: {booking.persona.nombre} {booking.persona.apellido}</p> */}
                        <p>• Titular: dasdsa</p>
                        <p>• Total de pasajeros: 45643</p>
                        {/* <p>• Estado: {RESERVATION_STATES[booking.estado].label}</p> */}
                        <p>• Estado: sdfsdf</p>
                        </div>
                    </div>
                    </div>
                )}
                </div>
            )}


            {activeTab === 'payments' && (
                <div className="space-y-8">
                    {/* {booking.pagos && booking.pagos.length > 0 && ( */}
                    
                        <div className="bg-white border border-gray-200 p-6 rounded-xl">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <Clock className="w-6 h-6 mr-3 text-gray-600" />
                                Historial de Pagos
                            </h3>
                            <div className="space-y-3">
                                {/* {[booking.pagos].map((pago) => ( */}
                                {dataDetalleTemp.comprobantes.map((pago: any) => (
                                <div
                                    key={pago.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                            <DollarSign className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                            {dataDetalleTemp.paquete.moneda?.simbolo || '$'}
                                            {pago.monto.toLocaleString()}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                            {formatearFecha(pago.fecha_creacion, false)} • {' '}
                                            {pago.metodo_pago_display}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800`}
                                    >
                                        {pago.tipo_display}
                                    </span>
                                    {/* <p className="text-xs text-gray-500 mt-1 capitalize">
                                        {pago.concepto}
                                    </p> */}
                                    </div>
                                </div>
                                ))}
                            </div>
                        </div>
                    


                    {/* Resumen Financiero */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 p-6 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                                <DollarSign className="w-8 h-8 text-blue-600" />
                                <span className="text-2xl font-bold text-blue-600">
                                {/* {booking.paquete.moneda?.simbolo || '$'}{booking.monto_total.toLocaleString()} */}
                                {dataDetalleTemp.paquete.moneda?.simbolo || '$'}{formatearSeparadorMiles.format(dataDetalleTemp.costo_total_estimado)}
                                </span>
                            </div>
                            <h3 className="font-semibold text-gray-900">Total</h3>
                            <p className="text-sm text-gray-600">{dataDetalleTemp.paquete.moneda?.codigo || 'USD'}</p>
                        </div>

                        <div className="bg-green-50 p-6 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                                <span className="text-2xl font-bold text-green-600">
                                {dataDetalleTemp.paquete.moneda?.simbolo || '$'}{formatearSeparadorMiles.format(dataDetalleTemp.monto_pagado)}
                                </span>
                            </div>
                            <h3 className="font-semibold text-gray-900">Pagado</h3>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div 
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                                />
                            </div>
                        </div>

                        <div className={`p-6 rounded-xl ${dataDetalleTemp.saldo_pendiente > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                            <div className="flex items-center justify-between mb-3">
                                <AlertCircle className={`w-8 h-8 ${dataDetalleTemp.saldo_pendiente > 0 ? 'text-red-600' : 'text-gray-600'}`} />
                                <span className={`text-2xl font-bold ${dataDetalleTemp.saldo_pendiente > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                {dataDetalleTemp.paquete.moneda?.simbolo || '$'}{formatearSeparadorMiles.format(dataDetalleTemp.saldo_pendiente)}
                                </span>
                            </div>
                            <h3 className="font-semibold text-gray-900">Pendiente</h3>
                            <p className="text-sm text-gray-600">
                                {dataDetalleTemp.saldo_pendiente > 0 ? 'Por pagar' : 'Completado'}
                            </p>
                        </div>
                    </div>


                     {/* Estado de Pago */}
                    <div className="bg-white border border-gray-200 p-6 rounded-xl">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <CreditCard className="w-6 h-6 mr-3 text-gray-600" />
                            Estado de Pago
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex items-center space-x-3 mb-4">
                                        <span className={`px-4 py-2 text-sm font-medium rounded-full ${PAYMENT_STATUS[paymentStatus].color}`}>
                                            {PAYMENT_STATUS[paymentStatus].label}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Progreso de Pago</span>
                                            <span className="font-medium">{Math.round(paymentProgress)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div 
                                            className={`h-3 rounded-full transition-all duration-300 ${
                                                paymentStatus === 'pago_completo' ? 'bg-green-500' : 
                                                paymentStatus === 'pago_parcial' ? 'bg-yellow-500' : 
                                                paymentStatus === 'sobrepago' ? 'bg-blue-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Precio por persona</p>
                                        <p className="font-medium text-gray-900">
                                            {dataDetalleTemp.paquete.moneda?.simbolo || '$'}{formatearSeparadorMiles.format(dataDetalleTemp?.precio_unitario)} {dataDetalleTemp.paquete.moneda?.codigo || 'USD'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Seña requerida por persona</p>
                                        <p className="font-medium text-gray-900">
                                            {dataDetalleTemp.paquete.moneda?.simbolo || '$'}{formatearSeparadorMiles.format(dataDetalleTemp?.salida?.senia)} {dataDetalleTemp.paquete.moneda?.codigo || 'USD'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                    </div>


                    {/* Desglose de Costos */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Desglose de Costos</h3>
                        <div className="space-y-3">
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">
                            Precio base ({dataDetalleTemp?.cantidad_pasajeros} pasajero{dataDetalleTemp?.cantidad_pasajeros !== 1 ? 's' : ''})
                            </span>
                            <span className="font-medium">
                            {dataDetalleTemp.paquete.moneda?.simbolo || '$'}{formatearSeparadorMiles.format(dataDetalleTemp?.costo_total_estimado)} {dataDetalleTemp.paquete.moneda?.codigo || 'USD'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">
                                Seña mínima requerida
                            </span>
                            <span className="font-medium text-orange-600">
                                {dataDetalleTemp.paquete.moneda?.simbolo || '$'}{(formatearSeparadorMiles.format(dataDetalleTemp?.seña_total)).toLocaleString()} {dataDetalleTemp.paquete.moneda?.codigo || 'USD'}
                            </span>
                        </div>
                        <div className="border-t border-gray-200 pt-3">
                            <div className="flex justify-between items-center text-lg font-semibold">
                            <span>Total</span>
                            <span>{dataDetalleTemp.paquete.moneda?.simbolo || '$'}{formatearSeparadorMiles.format(dataDetalleTemp?.costo_total_estimado)} {dataDetalleTemp.paquete.moneda?.codigo || 'USD'}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-green-600">
                            <span>Pagado</span>
                            <span>{dataDetalleTemp.paquete.moneda?.simbolo || '$'}{formatearSeparadorMiles.format(dataDetalleTemp?.monto_pagado)} {dataDetalleTemp.paquete.moneda?.codigo || 'USD'}</span>
                        </div>
                        <div className="flex justify-between items-center text-red-600 font-medium">
                            <span>Saldo pendiente</span>
                            <span>{dataDetalleTemp.paquete.moneda?.simbolo || '$'}{formatearSeparadorMiles.format(dataDetalleTemp?.saldo_pendiente)} {dataDetalleTemp.paquete.moneda?.codigo || 'USD'}</span>
                        </div>
                        </div>
                    </div>

                </div>
            )}

             {/* Botones de acción */}
            <div className="flex items-center justify-end space-x-4 p-2 pt-6 border-t border-gray-200">
            <button
                onClick={() => {
                onClose();
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 font-medium"
            >
                <CheckCircle className="w-4 h-4" />
                <span>Aceptar</span>
            </button>
            </div>
        </div>
</>
}

export default DetallesReservaContainer