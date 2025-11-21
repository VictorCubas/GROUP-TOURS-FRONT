/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatearFecha, formatearSeparadorMiles, getPrimerNombreApellido } from '@/helper/formatter';
import { getPaymentPercentage, getPaymentStatus, PAYMENT_STATUS, DOCUMENT_TYPES, } from '@/types/reservas';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Baby, Building, Calendar, CheckCircle, Clock, CreditCard, Crown, DollarSign, Download, FileText, Globe, Loader2, Loader2Icon, Mail, Package, Phone, RefreshCcwIcon, Star, Ticket, User, UserCheck, UserCheck2, UserPlus2, Users, XCircle } from 'lucide-react';
import { fetchReservaDetallesById } from './utils/httpReservas';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import PagoParcialModal from './PagoParcialModal';
import { use, useState } from 'react';
import { useCancelarReserva, useAsignarPasajero, useAsignarTipoFacturaModalidad, useDescargarComprobante, useDescargarFacturaGlobal, useDescargarFacturaIndividual, useDescargarNotaCreditoYaGenerada, useDescargarVoucher, useGenerarNotaCreditoGlobal, useGenerarNotaCreditoParcial, useRegistrarPagoParcial } from './hooks/useDescargarPDF';
import { ToastContext } from '@/context/ToastContext';
import { queryClient } from './utils/http';
import PaymentReceiptModal from './PaymentReceiptModal';
import AsignarPasajeroModal from './AsignarPasajeroModal';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import GenerarFacturaModal from './GenerarFacturaModal';
import type { ClienteFacturaData } from './FormularioFacturaTitular';
import AsignarTipoFacturaModal from './AsignarTipoFactura';
import GenerarNotaCreditoModal from './GenerarNotaCreditoModal';
import CancelarReservaModal from './CancelarReservaModal';
import ComprobanteDevolucionModal from './ComprobanteDevolucionModal';
import { useSessionStore } from '@/store/sessionStore';
// import { verificarUsuarioTieneCajaAbierta } from './utils/httpCajas';
// import type { VerificacionCajaAbierta } from '@/types/cajas';

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

    const {handleShowToast} = use(ToastContext);
    const { siTienePermiso } = useSessionStore();
    const [isPagoParcialModalOpen, setIsPagoParcialModalOpen] = useState(false);
    const [isAsiganrPasajeroModalOpen, setIsAsiganrPasajeroModalOpen] = useState(false);
    const [isAsiganrTipoFacturaModalOpen, setIsAsiganrTipoFacturaModalOpen] = useState(false);
    const [isGenerarNotaCreditoModalOpen, setIsGenerarNotaCreditoModalOpen] = useState(false);
    const [isGenerarFacturaOpen, setIsGenerarFacturaOpen] = useState(false);
    const [tipoFacturaAgenerarse, setTipoFacturaAgenerarse] = useState<'global' | "individual" | "">("");
    const [tipoNotaCreditoAgenerarse, setTipoNotaCreditoAgenerarse] = useState<'global' | "individual" | "">("");
    const [selectedPassengerId, setSelectedPassengerId] = useState<number | undefined>(undefined);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [descargandoVoucherId, setDescargandoVoucherId] = useState<number | undefined>(undefined);
    const [pagoSeniaRealizadaResponse, setPagoSeniaRealizadaResponse] = useState<any>(null);
    const [isCancelarReservaModalOpen, setIsCancelarReservaModalOpen] = useState(false);
    const [isComprobanteDevolucionModalOpen, setIsComprobanteDevolucionModalOpen] = useState(false);
    const [cancelacionResponse, setCancelacionResponse] = useState<any>(null);
    
    const {data: dataDetalleResp, isFetching: isFetchingDetalles,} = useQuery({
        queryKey: ['reserva-detalles', reservaId], //data cached
        queryFn: ({signal}) => fetchReservaDetallesById({signal, id: reservaId}),
        enabled: Boolean(reservaId),
        staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
    });

    // Query para verificar si el usuario tiene una caja abierta
    // const {data: dataCajaAbierta} = useQuery<VerificacionCajaAbierta>({
    //     queryKey: ['usuario-tiene-caja-abierta'],
    //     queryFn: verificarUsuarioTieneCajaAbierta,
    //     staleTime: 2 * 60 * 1000, // 2 minutos
    //     refetchOnWindowFocus: true
    // });

    const { mutate: fetchRegistrarPagoParcial, isPending: isPendingPagaoParcial } = useRegistrarPagoParcial();
    
    const { mutate: generarYDescargar, isPending: isPendingDescargaComprobante } = useDescargarComprobante();

    const { mutate: generarYDescargarFacturaGlobal, isPending: isPendingDescargaFacturaGlobal } = useDescargarFacturaGlobal();
    
    const { mutate: generarYDescargarFacturaIndividual, isPending: isPendingDescargaFacturaIndividual } = useDescargarFacturaIndividual();
    
    const { mutate: fetchAsignarPasajero, isPending: isPendingAsignarPasajero } = useAsignarPasajero();

    const { mutate: fetchAsignarTipoFacturaConModalidad, isPending: isPendingAsignarTipoFacturaModalidad } = useAsignarTipoFacturaModalidad();

    const { mutate: fetchGenerarNotaCreditoGlobal, isPending: isPendingGenerarNotaCreditoGlobal } = useGenerarNotaCreditoGlobal();

    const { mutate: fetchGenerarNotaCreditoParcial, isPending: isPendingGenerarNotaCreditoParcial } = useGenerarNotaCreditoParcial();

    const { mutate: fetchDescargarNotaCreditoYaGenerada, isPending: isPendingDescargarNC } = useDescargarNotaCreditoYaGenerada();

    const { mutate: generarYDescargarVoucher, isPending: isPendingDescargaVoucher } = useDescargarVoucher();

    const { mutate: fetchCancelarReserva, isPending: isPendingCancelarReserva } = useCancelarReserva();

    // Verificar si el usuario tiene permiso para registrar pagos
    // Solo Cajero y Admin pueden registrar pagos
    const puedeRegistrarPagos = siTienePermiso('pagos', 'crear');

    console.log(dataDetalleResp)

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

    const paymentStatus = getPaymentStatus(dataDetalleResp);
    const paymentProgress = getPaymentPercentage(dataDetalleResp);

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

    // Función para calcular el porcentaje de pago por pasajero
    const getPassengerPaymentPercentage = (pasajero: any): number => {
        if (!pasajero || !dataDetalleResp?.precio_unitario) return 0;
        const precioTotal = dataDetalleResp.precio_unitario;
        if (precioTotal === 0) return 0;
        const montoPagado = precioTotal - (pasajero.saldo_pendiente || 0);
        return Math.min((montoPagado / precioTotal) * 100, 100);
    };

    // Función para obtener el color de la barra según el porcentaje
    const getProgressBarColor = (percentage: number): string => {
        if (percentage < 20) return 'bg-red-600';
        if (percentage < 50) return 'bg-red-400';
        if (percentage < 100) return 'bg-yellow-500';
        return 'bg-green-600';
    };


    if(isFetchingDetalles){
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
                <Loader2 className="w-8 h-8 mb-2 animate-spin text-blue-500" />
                <p className="text-sm font-medium">Cargando detalles...</p>
            </div>
            );
    }


    const handleRegistrarPagoParcial = (id: number, payload: any) => {
        console.log('📦 Payload enviado al backend:', JSON.stringify(payload, null, 2));

        fetchRegistrarPagoParcial(
            { reservaId: id, payload },
            {
                onSuccess: (data) => {
                console.log('✅ Pago registrado correctamente');
                console.log('📄 Respuesta del servidor:', data);
                handleShowToast('Pago registrado correctamente', 'success');  

                // Cerrar modal
                setIsPagoParcialModalOpen(false);
                console.log(data)
                setIsReceiptModalOpen(true);
                setPagoSeniaRealizadaResponse(data);
                setSelectedPassengerId(undefined);;

                // Refrescar los detalles de la reserva para ver el estado actualizado
                queryClient.invalidateQueries({ queryKey: ['reserva-detalles', reservaId] });
                queryClient.invalidateQueries({queryKey: ['reservas'],exact: false});
                // Refrescar el resumen de movimientos de caja
                queryClient.invalidateQueries({ queryKey: ['movimientos-resumen'] });
                queryClient.invalidateQueries({queryKey: ['movimientos'],exact: false});
            },
                onError: (error: any) => { 
                    console.error('❌ Error al registrar el pago:', error);
                    console.error('📋 Detalles del error:', error.response?.data);

                    const errorMessage = error.response?.data?.message
                        || error.response?.data?.error
                        || 'Error al registrar el pago';

                    handleShowToast(errorMessage, 'error');
                },
            }
        );
    }

    const handleAsignarPasajero = (id: number, payload: any) => {
        console.log('📦 Payload enviado al backend:', JSON.stringify(payload, null, 2));
        console.log(payload);
        console.log(id)

        fetchAsignarPasajero(
            { pasajeroId: id, payload },
            {
                onSuccess: (data) => {
                console.log('✅ Persona asignada correctamente');
                console.log('📄 Respuesta del servidor:', data);
                handleShowToast('Persona asignada al pasajero correctamente', 'success'); 

                // Cerrar modal
                setIsAsiganrPasajeroModalOpen(false);
                setSelectedPassengerId(undefined);
                console.log(data)
                // setIsReceiptModalOpen(true);
                // setPagoSeniaRealizadaResponse(data)

                // Refrescar los detalles de la reserva para ver el estado actualizado
                queryClient.invalidateQueries({ queryKey: ['reserva-detalles', reservaId] });
                queryClient.invalidateQueries({queryKey: ['reservas'],exact: false});
                },
                onError: (error: any) => {
                    console.error('❌ Error al asignar persona:', error);
                    console.error('📋 Detalles del error:', error.response?.data);

                    const errorMessage = error.response?.data?.message
                        || error.response?.data?.error
                        || 'Error al asignar persona';

                    handleShowToast(errorMessage, 'error');
                },
            }
        );
    }

    const handleAsignarTipoFacturaConModalidad = (id: number, payload: any) => {
        console.log('📦 Payload enviado al backend:', JSON.stringify(payload, null, 2));
        console.log(payload);
        console.log(id)

        fetchAsignarTipoFacturaConModalidad(
            { reservaId: id, payload },
            {
                onSuccess: (data) => {
                console.log('✅ Persona asignada correctamente');
                console.log('📄 Respuesta del servidor:', data);
                handleShowToast('Persona asignada el tipo de factura satisfactoriamente', 'success'); 

                // Cerrar modal
                setIsAsiganrTipoFacturaModalOpen(false);
                setSelectedPassengerId(undefined);
                console.log(data)
                // setIsReceiptModalOpen(true);
                // setPagoSeniaRealizadaResponse(data)

                // Refrescar los detalles de la reserva para ver el estado actualizado
                queryClient.invalidateQueries({ queryKey: ['reserva-detalles', reservaId] });
                queryClient.invalidateQueries({queryKey: ['reservas'],exact: false});
                },
                onError: (error: any) => {
                    console.error('❌ Error al asignar persona:', error);
                    console.error('📋 Detalles del error:', error.response?.data);

                    const errorMessage = error.response?.data?.message
                        || error.response?.data?.error
                        || 'Error al asignar persona';

                    handleShowToast(errorMessage, 'error');
                },
            }
        );
    }

    const handleGenerarNotaCreditoGlobal = (id: number, payload: any) => {
        console.log('📦 Payload enviado al backend:', JSON.stringify(payload, null, 2));
        console.log(payload);
        console.log(id)

        // 🆕 Determinar qué tipo de NC generar según el payload
        const tipoNC = payload.tipo_nota_credito;
        const isNCParcial = tipoNC === 'parcial';

        // Limpiar el campo tipo_nota_credito del payload antes de enviarlo
        const payloadLimpio = { ...payload };
        delete payloadLimpio.tipo_nota_credito;

        // 🔀 Usar el hook correcto según el tipo de NC
        const mutationFn = isNCParcial ? fetchGenerarNotaCreditoParcial : fetchGenerarNotaCreditoGlobal;

        mutationFn(
            { facturaId: id, payload: payloadLimpio },
            {
                onSuccess: (data) => {
                console.log(`✅ Nota de Crédito ${isNCParcial ? 'Parcial' : 'Total'} generada correctamente`);
                console.log('📄 Respuesta del servidor:', data);
                handleShowToast('La nota de credito se ha generado y descargado satisfactoriamente', 'success');

                // Cerrar modal
                setIsGenerarNotaCreditoModalOpen(false);
                console.log(data)

                // Refrescar los detalles de la reserva para ver el estado actualizado
                queryClient.invalidateQueries({ queryKey: ['reserva-detalles', reservaId] });
                queryClient.invalidateQueries({queryKey: ['reservas'],exact: false});
                // Refrescar el resumen de movimientos de caja
                queryClient.invalidateQueries({ queryKey: ['movimientos-resumen'] });
                queryClient.invalidateQueries({queryKey: ['movimientos'],exact: false});
                // Refrescar paquetes para actualizar cupos
                queryClient.invalidateQueries({queryKey: ['paquetes'],exact: false});
                queryClient.invalidateQueries({queryKey: ['salidas-paquete'],exact: false});
                },
                onError: (error: any) => {
                    console.error(`❌ Error al generar NC ${isNCParcial ? 'Parcial' : 'Total'}:`, error);
                    console.error('📋 Detalles del error:', error.response?.data);

                    const errorMessage = error.response?.data?.message
                        || error.response?.data?.error
                        || `Error al generar la nota de crédito ${isNCParcial ? 'parcial' : 'total'}`;

                    handleShowToast(errorMessage, 'error');
                },
            }
        );
    }


    function handleDescargarPDF(id: number) {
        generarYDescargar(id, {
        onSuccess: () => {
            console.log('✅ PDF descargado correctamente');
            handleShowToast('Comprobante descargado correctamente', 'success');
            // setIsReceiptModalOpen(false);
            // setReservaRealizadaResponse(null);
            queryClient.invalidateQueries({ queryKey: ['reserva-detalles', reservaId] });
            queryClient.invalidateQueries({queryKey: ['reservas'],exact: false});
        },
        onError: (error) => {
            console.error('❌ Error al descargar el PDF', error);
            handleShowToast('Error al descargar el comprobante', 'error');
        },
        });
    }

    function handleDescargarFacturaGlobal(id: number, params: string | null = null) { 
        generarYDescargarFacturaGlobal({id, params}, {
        onSuccess: () => {
            console.log('✅ PDF descargado correctamente');
            handleShowToast('Factura descargado correctamente', 'success');
            // setIsReceiptModalOpen(false);
            // setReservaRealizadaResponse(null);
            setIsGenerarFacturaOpen(false);
            setTipoFacturaAgenerarse("");
            setTipoNotaCreditoAgenerarse("");


            if(!dataDetalleResp.factura_global_generada){
                queryClient.invalidateQueries({ queryKey: ['reserva-detalles', reservaId] });
                queryClient.invalidateQueries({queryKey: ['reservas'],exact: false});
            }
            
            // Invalidar queries de facturas después de generar/descargar
            queryClient.invalidateQueries({
                queryKey: ['facturas'],
                exact: false
            });
            queryClient.invalidateQueries({
                queryKey: ['facturas-resumen'],
            });
            
            setSelectedPassengerId(undefined);
        },
        onError: (error) => {
            console.error('❌ Error al descargar el PDF', error);
            handleShowToast('Error al descargar la factura', 'error');
        },
        });
    }
    
    function handleDescargarFacturaIndividual(reservaId: number, params: string, pasajeroId: number) {
        console.log(reservaId, params)
        // return;
        generarYDescargarFacturaIndividual( { reservaId, params }, {
        onSuccess: () => {
            console.log('✅ PDF descargado correctamente'); 
            handleShowToast('Factura descargada correctamente', 'success');
            setIsGenerarFacturaOpen(false)
            setTipoFacturaAgenerarse("");
            setTipoNotaCreditoAgenerarse("");
            // setIsReceiptModalOpen(false);

            console.log(selectedPassengerId);
            console.log(pasajeroId);
            // setReservaRealizadaResponse(null);
            if(pasajeroId){
                const paxFilter = dataDetalleResp.pasajeros.filter((p: any) => p.id.toString() === pasajeroId?.toString())
                console.log(paxFilter)
                const pax = paxFilter[0];
    
                console.log(pax)
    
                if(!pax.factura_individual_generada){
                    queryClient.invalidateQueries({ queryKey: ['reserva-detalles', reservaId] });
                    queryClient.invalidateQueries({queryKey: ['reservas'],exact: false});
                }
            }
            
            // Invalidar queries de facturas después de generar/descargar
            queryClient.invalidateQueries({
                queryKey: ['facturas'],
                exact: false
            });
            queryClient.invalidateQueries({
                queryKey: ['facturas-resumen'],
            });
            
            setSelectedPassengerId(undefined);
        },
        onError: (error) => {
            console.error('❌ Error al descargar la factura', error ?? '');
            handleShowToast('Error al descargar la factura', 'error');
        },
        });
    }

    const handleDescargarVoucherPDF = (id: number) => {
        setDescargandoVoucherId(id)
        generarYDescargarVoucher(id, {
        onSuccess: () => {
            console.log('✅ PDF descargado correctamente');
            handleShowToast('Voucher descargado correctamente', 'success');
            // setIsReceiptModalOpen(false);
            // setReservaRealizadaResponse(null);
        },
        onError: (error) => {
            console.error('❌ Error al descargar el PDF', error);
            handleShowToast('Error al descargar el voucher', 'error');
        },
        });
    }

    const handleDescargarNotaCreditoYaGenerada = (notaCreditoId: number) => {
        fetchDescargarNotaCreditoYaGenerada(notaCreditoId, {
            onSuccess: () => {
                console.log('✅ Nota de crédito descargada correctamente');
                handleShowToast('Nota de crédito descargada correctamente', 'success');
            },
            onError: (error) => {
                console.error('❌ Error al descargar la nota de crédito', error);
                handleShowToast('Error al descargar la nota de crédito', 'error');
            },
        });
    }

    const handleCancelarReserva = (payload: any) => {
        console.log('📦 Payload enviado para cancelar reserva:', JSON.stringify(payload, null, 2));

        fetchCancelarReserva(
            { reservaId: reservaId, payload },
            {
                onSuccess: (data) => {
                    console.log('✅ Reserva cancelada correctamente');
                    console.log('📄 Respuesta del servidor:', data);
                    handleShowToast('Reserva cancelada correctamente', 'success');

                    // Guardar respuesta y abrir modal de comprobante
                    setCancelacionResponse(data);
                    setIsCancelarReservaModalOpen(false);
                    setIsComprobanteDevolucionModalOpen(true);

                    // Refrescar queries
                    queryClient.invalidateQueries({ queryKey: ['reserva-detalles', reservaId] });
                    queryClient.invalidateQueries({ queryKey: ['reservas'], exact: false });
                    queryClient.invalidateQueries({ queryKey: ['movimientos-resumen'] });
                    queryClient.invalidateQueries({ queryKey: ['movimientos'], exact: false });
                    queryClient.invalidateQueries({ queryKey: ['paquetes'], exact: false });
                    queryClient.invalidateQueries({ queryKey: ['salidas-paquete'], exact: false });
                },
                onError: (error: any) => {
                    console.error('❌ Error al cancelar la reserva:', error);
                    console.error('📋 Detalles del error:', error.response?.data);

                    const errorMessage = error.response?.data?.message
                        || error.response?.data?.error
                        || 'Error al cancelar la reserva';

                    handleShowToast(errorMessage, 'error');
                },
            }
        );
    };

    const handleCloseCancelarReservaModal = () => {
        setIsCancelarReservaModalOpen(false);
    };

    const handleCloseComprobanteDevolucionModal = () => {
        setIsComprobanteDevolucionModalOpen(false);
        setCancelacionResponse(null);
        // Cerrar el modal principal de detalles
        onClose();
    };

    const handleClosePagoParcialModal = () => {
        setIsPagoParcialModalOpen(false);
        setSelectedPassengerId(undefined);
        // handleCancel()
        // setPayloadReservationData(null);
    };

    const handleCloseAsigarPasajeroModal = () => {
        setIsAsiganrPasajeroModalOpen(false);
        setSelectedPassengerId(undefined);
        // handleCancel()
        // setPayloadReservationData(null);
    };

    const handleCloseAsigarTipoFacturaModal = () => {
        setIsAsiganrTipoFacturaModalOpen(false);
        // setSelectedPassengerId(undefined);
        // handleCancel()
        // setPayloadReservationData(null);
    };

    const handleCloseGenerarNotaCreditoModal = () => {
        setIsGenerarNotaCreditoModalOpen(false);
        // setSelectedPassengerId(undefined);
        // handleCancel()
        // setPayloadReservationData(null);
    };

    const handleCloseGenerarFacturaModal = () => {
        setIsGenerarFacturaOpen(false)
        setTipoFacturaAgenerarse("");
        setTipoNotaCreditoAgenerarse("");
        setSelectedPassengerId(undefined);
        // handleCancel()
        // setPayloadReservationData(null);
    };

     // Manejar la confirmación del modal
    const handleConfirmPagoParcial = (payload: any, paymentType: "deposit" | "full") => {
        if (payload && dataDetalleResp) {
            console.log('Payload generado:', payload);
            console.log('Tipo de pago:', paymentType);

            // Llamar a la función de pago con el ID de la reserva actual
            handleRegistrarPagoParcial(dataDetalleResp.id, payload);
        }
    };

     // Manejar la confirmación del modal
    const handleConfirmAAsignarPasajero = (payload: any, pasajeroId: number | string) => {
        if (payload && dataDetalleResp && pasajeroId) {

            // Llamar a la función de pago con el ID de la reserva actual
            handleAsignarPasajero(Number(pasajeroId), payload);
        }
    };
    
     // Manejar la confirmación del modal
    const handleConfirmAsignarTipoFactuta = (payLoad: any) => {
        if (payLoad) {
            // Llamar a la función de pago con el ID de la reserva actual
            handleAsignarTipoFacturaConModalidad(Number(reservaId), payLoad);
        }
    };

     // Manejar la confirmación del modal
    const handleConfirmGenerarNotaCredito  = (payLoad: any) => {
        if (payLoad) {
          console.log('🔍 Debug handleConfirmGenerarNotaCredito:');
          console.log('  - reservaId:', reservaId);
          console.log('  - factura_global_id:', dataDetalleResp.factura_global_id);
          console.log('  - Payload recibido del modal:', payLoad);
          console.log('  - tipo_nota_credito:', payLoad.tipo_nota_credito);
          console.log('  - tipoNotaCreditoAgenerarse:', tipoNotaCreditoAgenerarse);
          console.log('  - selectedPassengerId:', selectedPassengerId);

            // ⚠️ NO ELIMINAR tipo_nota_credito aquí
            // La función handleGenerarNotaCreditoGlobal necesita este campo para decidir qué endpoint usar
            // Ella se encargará de limpiarlo antes de enviarlo al backend

            // Determinar el ID de la factura a afectar
            let factura_id = dataDetalleResp?.factura_global_id;

            if(tipoNotaCreditoAgenerarse === 'global') {
              factura_id = dataDetalleResp.factura_global_id;
            } else {
              // NC Individual - buscar la factura del pasajero
              const paxFilter = dataDetalleResp.pasajeros.filter((p: any) => p.id.toString() === selectedPassengerId?.toString());
              const pax = paxFilter[0];

              if(pax?.factura_individual_generada){
                factura_id = pax.factura_id;
              }
            }

            console.log('✅ Factura ID final a usar:', factura_id);

            // Llamar a la función que maneja tanto NC Total como Parcial
            handleGenerarNotaCreditoGlobal(Number(factura_id), payLoad);
        }
    };

     // Manejar la confirmación del modal
    const handleConfirmGenerarFacturaGlobal = (payload: ClienteFacturaData,) => {
        //  {
        //     nombre: '',
        //     ruc: '',
        //     email: '',
        //     telefono: '',
        //     direccion: '',
        //     tipo_documento: '4',
        //     documento_original: '778341234-2',
        //     factura_nombre: 'titular',
        //     algunValorHaCambiado: true
        // }
        if (payload && dataDetalleResp) {
            console.log('Payload generado:', payload);
            let params= '';

            if(payload.factura_nombre === 'titular'){
                if(payload.algunValorHaCambiado) //titular con cambio de documento
                    params += `?tercero_tipo_documento=${payload.tipo_documento}&tercero_numero_documento=${payload.documento_original}`;
            }
            else
                params += `?tercero_nombre=${payload.nombre}&tercero_tipo_documento=${payload.tipo_documento}&tercero_numero_documento=${payload.ruc}&tercero_direccion=${payload.direccion}&tercero_telefono=${payload.telefono}&tercero_email=${payload.email}`;


            console.log(params)
            handleDescargarFacturaGlobal(dataDetalleResp?.id, params)
        }
    };

     // Manejar la confirmación del modal
    const handleConfirmGenerarFacturaIndividual = (payload: ClienteFacturaData,) => {
        if (payload && dataDetalleResp) {
            console.log('Payload generado:', payload);
            console.log(selectedPassengerId); 
            //  {
            //     nombre: '',
            //     ruc: '',
            //     email: '',
            //     telefono: '',
            //     direccion: '',
            //     tipo_documento: '4',
            //     documento_original: '888777666-2',
            //     factura_nombre: 'pasajero',
            //     algunValorHaCambiado: true
            // }

            let params= `?pasajero_id=${selectedPassengerId}`;

            if(payload.factura_nombre === 'pasajero'){ //FACTURA A NOMBRE DEL PASAJERO CON CAMBIO DE DOCUMENTO
                if(payload.algunValorHaCambiado) //titular con cambio de documento
                    params += `&tercero_tipo_documento=${payload.tipo_documento}&tercero_numero_documento=${payload.documento_original}`;
            }
            else //FACTURA A NOMBRE DE UN TERCERO
                params += `&tercero_nombre=${payload.nombre}&tercero_tipo_documento=${payload.tipo_documento}&tercero_numero_documento=${payload.ruc}&tercero_direccion=${payload.direccion}&tercero_telefono=${payload.telefono}&tercero_email=${payload.email}`;


            console.log(params)
            
            // const params = `?pasajero_id=${selectedPassengerId}&tercero_nombre=${payload.nombre}&tercero_tipo_documento=${payload.tipo_documento}&tercero_numero_documento=${payload.ruc}&tercero_direccion=${payload.direccion}&tercero_telefono=${payload.telefono}&tercero_email=${payload.email}`;
            handleDescargarFacturaIndividual(dataDetalleResp?.id, params, Number(selectedPassengerId))

        }
    };

    const handleCloseReceipt = () => {
        console.log('Modal de comprobante cerrado');
        setIsReceiptModalOpen(false);
    };

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
                                {getPrimerNombreApellido(dataDetalleResp?.titular?.nombre, dataDetalleResp?.titular?.apellido)}
                            </p>
                            <p className="text-sm text-gray-500">Nombre completo</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <div>
                            <p className="font-medium text-gray-900">
                                {dataDetalleResp?.titular?.documento}
                            </p>
                            <p className="text-sm text-gray-500">Documento de identidad</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                            <p className="font-medium text-gray-900">
                                {formatearFecha(dataDetalleResp.titular.fecha_nacimiento, false)} 
                                <Badge className="ml-1 text-xs bg-blue-200  text-gray-700 text-center py-1">
                                    {getAgeFromBirthDate(dataDetalleResp.titular.fecha_nacimiento)} años
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
                                {dataDetalleResp?.titular?.email}
                            </p>
                            <p className="text-sm text-gray-500">Correo electrónico</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <div>
                            <p className="font-medium text-gray-900">
                                {/* {booking.persona.telefono} */}
                                {dataDetalleResp?.titular?.telefono}
                            </p>
                            <p className="text-sm text-gray-500">Teléfono</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Globe className="w-5 h-5 text-gray-400" />
                            <div>
                            <p className="font-medium text-gray-900">
                                {dataDetalleResp.titular.nacionalidad_nombre}
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
                            <div className='flex items-center justify-between'>
                              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                                <Package className="w-6 h-6 mr-3 text-green-600" />
                                Detalles del Paquete
                              </h3>

                              <button className="cursor-pointer px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 font-medium"
                                  onClick={() => {
                                    if(!dataDetalleResp?.condicion_pago)
                                      setIsAsiganrTipoFacturaModalOpen(true)
                                  }}> 
                                {dataDetalleResp.condicion_pago_display?.toUpperCase() ?? 'ASIGNAR TIPO DE FACTURA'}
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
                                <div className="space-y-3">
                                    <div>
                                    <p className="font-medium text-gray-900 text-lg">
                                        {dataDetalleResp?.paquete?.nombre}
                                    </p>
                                    <p className="text-sm text-gray-500">Nombre del paquete</p>
                                    </div>
                                    <div>
                                    <p className="font-medium text-gray-900">
                                        {dataDetalleResp?.paquete.destino.ciudad},{' '}
                                        {dataDetalleResp?.paquete.destino.pais}
                                    </p>
                                    <p className="text-sm text-gray-500">Destino</p>
                                    </div>
                                    <div>
                                    <p className="font-medium text-gray-900">
                                        {dataDetalleResp?.paquete.tipo_paquete.nombre}
                                    </p>
                                    <p className="text-sm text-gray-500">Tipo de paquete</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                    <p className="font-medium text-gray-900">
                                        {dataDetalleResp?.paquete.moneda?.simbolo || '$'}{formatearSeparadorMiles.format(dataDetalleResp.precio_unitario)} {dataDetalleResp?.paquete.moneda?.codigo || 'USD'}
                                    </p>
                                    <p className="text-sm text-gray-500">Precio por persona</p>
                                    </div>
                                    <div>
                                    <p className="font-medium text-gray-900">
                                        {/* {dataDetalle?.paquete.moneda?.simbolo || '$'}{dataDetalle?.paquete.sena.toLocaleString()} {dataDetalle?.paquete.moneda?.codigo || 'USD'} */}
                                        {dataDetalleResp?.paquete.moneda?.simbolo || '$'}{formatearSeparadorMiles.format(dataDetalleResp.seña_total)} {dataDetalleResp?.paquete.moneda?.codigo || 'USD'}
                                    </p>
                                    <p className="text-sm text-gray-500">Seña requerida</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                    {dataDetalleResp?.paquete.propio ? (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                        Paquete Propio
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                                        {dataDetalleResp?.paquete.distribuidora?.nombre || 'Distribuidor'}
                                        </span>
                                    )}

                                    {dataDetalleResp?.paquete.personalizado && (
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
                                        {/* {formatearFecha(dataDetalleResp?.salida?.fecha_salida)} */}
                                        {new Date(dataDetalleResp?.salida?.fecha_salida).toLocaleDateString(
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
                                        {/* {formatearFecha(dataDetalleResp?.salida?.fecha_salida)} */}
                                        {new Date(dataDetalleResp?.salida?.fecha_regreso).toLocaleDateString(
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
                                        {formatearSeparadorMiles.format(dataDetalleResp?.precio_unitario)}
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
                                        {dataDetalleResp?.hotel?.nombre}
                                    </h4>
                                    <div className="flex items-center space-x-1">
                                    <span className="text-sm text-gray-500 ml-1">
                                        {renderStars(dataDetalleResp.hotel.estrellas)}
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
                                        {dataDetalleResp?.habitacion?.tipo_display}
                                    </h4>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span>Capacidad: {dataDetalleResp?.cantidad_pasajeros} personas</span>
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
                                {formatearFecha(dataDetalleResp?.fecha_reserva, false)}
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
                    Lista de Pasajeros ({dataDetalleResp?.cantidad_pasajeros})
                    </h3>
                    {(() => {
                    const pasajerosPorAsignar = dataDetalleResp?.pasajeros?.filter(
                        (pasajero: any) => pasajero.persona?.nombre?.toLowerCase().includes('por asignar')
                    )?.length || 0;

                    return (
                        <>
                          <div className='flex items-center gap-5'>
                             {dataDetalleResp?.factura_global_generada && dataDetalleResp?.factura_global_id  &&
                              <div>
                                    <Button
                                        disabled={isPendingDescargaFacturaGlobal || isPendingDescargarNC || isPendingGenerarNotaCreditoGlobal || isPendingGenerarNotaCreditoParcial}
                                        onClick={() => {
                                          console.log('🔍 Debug NC Global:', {
                                            reservaId: dataDetalleResp.id,
                                            nota_credito_ya_generada: dataDetalleResp.nota_credito_global_ya_generada,
                                            nota_credito_id: dataDetalleResp.nota_credito_global_id
                                          });

                                          // Si ya existe una NC generada, descargarla directamente
                                          if(dataDetalleResp.nota_credito_global_ya_generada && dataDetalleResp.nota_credito_global_id) {
                                            console.log('✅ Descargando NC Global existente, ID:', dataDetalleResp.nota_credito_global_id);
                                            handleDescargarNotaCreditoYaGenerada(dataDetalleResp.nota_credito_global_id);
                                          } else {
                                            // Si no existe, abrir modal para generar nueva NC
                                            console.log('📝 Abriendo modal para generar nueva NC Global');
                                            setIsGenerarNotaCreditoModalOpen(true);
                                            setTipoNotaCreditoAgenerarse('global');
                                          }
                                        }}
                                        className="cursor-pointer w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 font-medium"
                                        size="lg"
                                    >
                                        {(isPendingDescargaFacturaGlobal || isPendingDescargarNC || isPendingGenerarNotaCreditoGlobal || isPendingGenerarNotaCreditoParcial) ?
                                          <>
                                              <Loader2Icon className="animate-spin w-10 h-10 text-gray-300"/>
                                              {dataDetalleResp.nota_credito_global_ya_generada ? 'Descargando...' : 'Generando...'}
                                          </> :
                                          <>
                                            <Download className="h-4 w-4 mr-2" />
                                            {dataDetalleResp.nota_credito_global_ya_generada ? 'Descargar NC' : 'Generar NC'}
                                          </>}
                                    </Button>
                              </div>
                             }

                            {dataDetalleResp?.puede_descargar_factura_global  &&
                              <div>
                                  <Button
                                      disabled={isPendingDescargaFacturaGlobal}
                                      onClick={() => {
                                            if(dataDetalleResp.factura_global_generada){
                                              handleDescargarFacturaGlobal(dataDetalleResp?.id)
                                            }
                                            else{
                                              setIsGenerarFacturaOpen(true);
                                              setTipoFacturaAgenerarse("global");
                                            }
                                          // handleDescargarFacturaGlobal(dataDetalleResp?.id)
                                      }}
                                      className="cursor-pointer w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 font-medium"
                                      size="lg"
                                  >
                                      {isPendingDescargaFacturaGlobal ? 
                                        <>
                                            <Loader2Icon className="animate-spin w-10 h-10 text-gray-300"/>
                                            Descargando...
                                        </> : 
                                        <>
                                          <Download className="h-4 w-4 mr-2" />
                                          Descargar Factura
                                        </>}
                                  </Button>
                              </div>
                              
                            }

                            {/* Solo mostrar botón si tiene permiso para registrar pagos */}
                            {puedeRegistrarPagos && (
                              <div>
                                  <Button
                                      disabled={dataDetalleResp?.esta_totalmente_pagada}
                                      onClick={() => {
                                          setSelectedPassengerId(undefined);
                                          setIsPagoParcialModalOpen(true);
                                      }}
                                      className="cursor-pointer w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 font-medium"
                                      size="lg"
                                  >
                                      <DollarSign className="w-4 h-4" />
                                      <span>Registrar pago</span>
                                  </Button>
                              </div>
                            )}
                            {pasajerosPorAsignar > 0 &&
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                    <div className="flex items-center space-x-2">
                                        <AlertCircle className="w-4 h-4 text-orange-600" />
                                        <span className="text-sm font-medium text-orange-800">
                                            Faltan {pasajerosPorAsignar} pasajero{pasajerosPorAsignar !== 1 ? 's' : ''} por registrar y/o asignar
                                        </span>
                                    </div>
                                </div>
                            }
                          </div>

                        </>
                    );
                })()}
                </div>

                {dataDetalleResp?.pasajeros.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {dataDetalleResp?.pasajeros.map((pasajero: any, index: number) => (
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

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <p className="text-xs text-gray-500">Estado de Pago</p>
                                  <p className="text-xs font-medium text-gray-700">
                                    {getPassengerPaymentPercentage(pasajero).toFixed(0)}%
                                  </p>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`${getProgressBarColor(getPassengerPaymentPercentage(pasajero))} h-2 rounded-full transition-all duration-300`}
                                    style={{ width: `${Math.min(getPassengerPaymentPercentage(pasajero), 100)}%` }}
                                  />
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-gray-500">
                                    Pagado: {formatearSeparadorMiles.format(dataDetalleResp.precio_unitario - (pasajero.saldo_pendiente || 0))}
                                  </span>
                                  <span className={`font-medium ${pasajero.saldo_pendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    Saldo: {formatearSeparadorMiles.format(pasajero.saldo_pendiente || 0)}
                                  </span>
                                </div>
                            </div>
                            <div className="space-y-3 mt-5 pt-2 border-t border-gray-200">
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
                                    <button
                                          className={`w-full rounded-lg border p-4 text-left transition-all 
                                            ${(pasajero.ticket_numero || pasajero.voucher_codigo) ? 'border-blue-500 bg-blue-50' : 'border-orange-300 bg-orange-50'}
                                             cursor-pointer`}
                                          onClick={() => {
                                            if(pasajero.ticket_numero || pasajero.voucher_codigo)
                                              handleDescargarVoucherPDF(pasajero?.voucher_id)
                                          }}
                                        >
                                        <div className='flex justify-between items-center '>
                                          {((pasajero.ticket_numero || pasajero.voucher_codigo) && !pasajero.por_asignar) ?
                                              <>
                                              <div className=''>
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
                                                        <span className="text-sm text-gray-700 font-mono">{pasajero?.voucher_codigo}</span>
                                                        <span className="text-xs text-gray-500">Voucher</span>
                                                    </div>
                                                    )}
                                                </div>
                                              </div>
                                                
                                                {(isPendingDescargaVoucher && pasajero?.voucher_id.toString() === descargandoVoucherId?.toString()) ?
                                                  <Loader2 className="w-5 h-5 text-gray-400" /> :
                                                  <Download className="w-5 h-5 text-gray-400" /> 
                                                }
                                              </> :
                                              <>
                                                  <div className='text-orange-400'>
                                                    <p>VOUCHER NO DISPONIBLE AUN</p>
                                                    <span className='text-xs text-gray-400'>Requerido: Completar pago + datos completos</span>
                                                  </div>
                                              </>
                                          }
                                        </div>

                                    </button>
                                  

                                <div className="pt-3 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">
                                    Registrado: {new Date(pasajero.fecha_registro).toLocaleDateString()}
                                    </p>
                                </div>
                                
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>

                                      {/* Solo mostrar botón si tiene permiso para registrar pagos */}
                                      {puedeRegistrarPagos && (
                                        <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                disabled={!pasajero?.saldo_pendiente}
                                                onClick={() => {
                                                    setSelectedPassengerId(pasajero.id);
                                                    setIsPagoParcialModalOpen(true);
                                                }}
                                                className={`cursor-pointer disabled:cursor-not-allowed
                                                            w-full px-6 py-3 border-1 rounded-lg hover:bg-blue-100
                                                            disabled:hover:bg-transparent transition-colors duration-200
                                                            flex items-center justify-center space-x-2 font-medium
                                                            ${!pasajero?.saldo_pendiente ? 'bg-emerald-600 text-white': ''}`}
                                                size="lg"
                                            >
                                                <DollarSign className="w-4 h-4" />
                                                {pasajero?.saldo_pendiente ?
                                                    <span>Pagar</span>
                                                    :
                                                    <span>Pago completo</span>
                                                }
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Registrar un pago por pasajero</p>
                                        </TooltipContent>
                                      </Tooltip>
                                      )}

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                          <Button
                                            variant="outline"
                                            disabled={!pasajero?.por_asignar}
                                            onClick={() => {
                                                setSelectedPassengerId(pasajero.id);
                                                setIsAsiganrPasajeroModalOpen(true);
                                            }}
                                            className={`cursor-pointer disabled:cursor-not-allowed
                                                        w-full px-6 py-3 border-1 border-bray-800 rounded-lg hover:bg-blue-100 
                                                        disabled:hover:bg-transparent transition-colors duration-200
                                                        flex items-center justify-center space-x-2 font-medium
                                                        `}
                                            size="lg"
                                        >
                                            {pasajero.por_asignar ? 
                                                <>
                                                <UserPlus2 className="w-4 h-4" />
                                                <span>Asignar</span> 
                                                </>
                                                :
                                                <>
                                                <UserCheck2 className="w-4 h-4" />
                                                <span>Asignado</span>
                                                </>
                                            }
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Asignar una persona a este pasajero</p>
                                      </TooltipContent>
                                    </Tooltip>
                                      
                                      {pasajero?.puede_descargar_factura &&
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                disabled={isPendingDescargaFacturaIndividual}
                                                onClick={() => {
                                                  console.log(pasajero.id)
                                                    setSelectedPassengerId(pasajero.id);
                                                    console.log()
                                                    if(pasajero.factura_individual_generada){
                                                        //DESCARGA DIRECTA (FACTURA YA GENERADA)
                                                        const params = `?pasajero_id=${pasajero.id}`;
                                                        handleDescargarFacturaIndividual(dataDetalleResp?.id, params, pasajero.id)
                                                    }
                                                    else{
                                                      //ABRE EL FOMRULARIO DE DESCARGA (FACTURA POR GENERARSE)
                                                      setIsGenerarFacturaOpen(true);
                                                      setTipoFacturaAgenerarse("individual");
                                                    }
                                                    
                                                    // setIsAsiganrPasajeroModalOpen(true);
                                                }}
                                                className={`cursor-pointer disabled:cursor-not-allowed
                                                            w-full px-6 py-3 border-1 border-bray-800 rounded-lg hover:bg-blue-100 
                                                            disabled:hover:bg-transparent transition-colors duration-200
                                                            flex items-center justify-center space-x-2 font-medium
                                                            `}
                                                size="lg"
                                            >
                                              {isPendingDescargaFacturaIndividual ? 
                                                  <>
                                                      <Loader2Icon className="animate-spin w-10 h-10 text-gray-300"/>
                                                      Descargando...
                                                  </> : 
                                                  <>
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Descargar
                                                </>} 
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Descargar factura por pasajero</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      }

                                      {pasajero?.factura_individual_generada && pasajero?.factura_id  &&
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                disabled={isPendingGenerarNotaCreditoGlobal || isPendingGenerarNotaCreditoParcial || isPendingDescargarNC}
                                                onClick={() => {
                                                  setSelectedPassengerId(pasajero.id);

                                                  console.log('🔍 Debug NC Individual:', {
                                                    pasajeroId: pasajero.id,
                                                    nota_credito_ya_generada: pasajero.nota_credito_individual_ya_generada,
                                                    nota_credito_id: pasajero.nota_credito_individual_id
                                                  });

                                                  // Si ya existe una NC generada para este pasajero, descargarla directamente
                                                  if(pasajero.nota_credito_individual_ya_generada && pasajero.nota_credito_individual_id) {
                                                    console.log('✅ Descargando NC existente, ID:', pasajero.nota_credito_individual_id);
                                                    handleDescargarNotaCreditoYaGenerada(pasajero.nota_credito_individual_id);
                                                  } else {
                                                    // Si no existe, abrir modal para generar nueva NC
                                                    console.log('📝 Abriendo modal para generar nueva NC');
                                                    setIsGenerarNotaCreditoModalOpen(true);
                                                    setTipoNotaCreditoAgenerarse('individual');
                                                  }
                                                }}
                                                className={`cursor-pointer disabled:cursor-not-allowed
                                                            w-full px-6 py-3 border-1 border-bray-800 rounded-lg hover:bg-blue-100
                                                            disabled:hover:bg-transparent transition-colors duration-200
                                                            flex items-center justify-center space-x-2 font-medium
                                                            `}
                                                size="lg"
                                            >
                                              {(isPendingGenerarNotaCreditoGlobal || isPendingGenerarNotaCreditoParcial || isPendingDescargarNC) ?
                                                  <>
                                                      <Loader2Icon className="animate-spin w-10 h-10 text-gray-300"/>
                                                      {pasajero.nota_credito_individual_ya_generada ? 'Descargando...' : 'Generando...'}
                                                  </> :
                                                  <>
                                                    <RefreshCcwIcon className="h-4 w-4 mr-2" />
                                                    {pasajero.nota_credito_individual_ya_generada ? 'Descargar NC' : 'Generar NC'}
                                                </>}
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>{pasajero.nota_credito_individual_ya_generada ? 'Descargar Nota de Crédito del pasajero' : 'Generar Nota de Crédito para el pasajero'}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      }
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
                            Esta reserva fue creada en modo rápido con ASFAS pasajero{dataDetalleResp.cantidad_pasajeros !== 1 ? 's' : ''}.
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

                    {/* Botón para registrar nuevo pago */}
                    {puedeRegistrarPagos && dataDetalleResp.saldo_pendiente > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border-2 border-blue-200">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                                        <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                                        Registrar Pago
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Saldo pendiente: {dataDetalleResp.paquete.moneda?.simbolo || '$'}{formatearSeparadorMiles.format(dataDetalleResp.saldo_pendiente)}
                                    </p>
                                </div>
                                <Button
                                    onClick={() => {
                                        setSelectedPassengerId(undefined);
                                        setIsPagoParcialModalOpen(true);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                                >
                                    <DollarSign className="w-4 h-4 mr-2" />
                                    Realizar Pago
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Resumen Financiero */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 p-6 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                                <DollarSign className="w-8 h-8 text-blue-600" />
                                <span className="text-2xl font-bold text-blue-600">
                                {/* {booking.paquete.moneda?.simbolo || '$'}{booking.monto_total.toLocaleString()} */}
                                {dataDetalleResp.paquete.moneda?.simbolo || '$'}{formatearSeparadorMiles.format(dataDetalleResp.costo_total_estimado)}
                                </span>
                            </div>
                            <h3 className="font-semibold text-gray-900">Total</h3>
                            <p className="text-sm text-gray-600">{dataDetalleResp.paquete.moneda?.codigo || 'USD'}</p>
                        </div>

                        <div className="bg-green-50 p-6 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                                <span className="text-2xl font-bold text-green-600">
                                {dataDetalleResp.paquete.moneda?.simbolo || '$'}{formatearSeparadorMiles.format(dataDetalleResp.monto_pagado)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <h3 className="font-semibold text-gray-900">Pagado</h3>
                                <span className="font-medium">{Math.round(paymentProgress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div 
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                                />
                            </div>
                        </div>

                        <div className={`p-6 rounded-xl ${dataDetalleResp.saldo_pendiente > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                            <div className="flex items-center justify-between mb-3">
                                <AlertCircle className={`w-8 h-8 ${dataDetalleResp.saldo_pendiente > 0 ? 'text-red-600' : 'text-gray-600'}`} />
                                <span className={`text-2xl font-bold ${dataDetalleResp.saldo_pendiente > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                {dataDetalleResp.paquete.moneda?.simbolo || '$'}{formatearSeparadorMiles.format(dataDetalleResp.saldo_pendiente)}
                                </span>
                            </div>
                            <h3 className="font-semibold text-gray-900">Pendiente</h3>
                            <p className="text-sm text-gray-600">
                                {dataDetalleResp.saldo_pendiente > 0 ? 'Por pagar' : 'Completado'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 p-6 rounded-xl flex gap-6 items-center">
                        <div className="flex gap-6 items-center">
                          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center pt-3">
                            <FileText className="w-6 h-6 mr-3 text-gray-600" />
                            Modalidad de facturación:
                          </h3>
                          <span className='text-gray-600 font-600'>{dataDetalleResp.modalidad_facturacion_display}</span>
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
                                            {dataDetalleResp.paquete.moneda?.simbolo || '$'}{formatearSeparadorMiles.format(dataDetalleResp?.precio_unitario)} {dataDetalleResp.paquete.moneda?.codigo || 'USD'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Seña requerida por persona</p>
                                        <p className="font-medium text-gray-900">
                                            {dataDetalleResp.paquete.moneda?.simbolo || '$'}{formatearSeparadorMiles.format(dataDetalleResp?.salida?.senia)} {dataDetalleResp.paquete.moneda?.codigo || 'USD'}
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
                            Precio base ({dataDetalleResp?.cantidad_pasajeros} pasajero{dataDetalleResp?.cantidad_pasajeros !== 1 ? 's' : ''})
                            </span>
                            <span className="font-medium">
                            {dataDetalleResp.paquete.moneda?.simbolo || '$'}{formatearSeparadorMiles.format(dataDetalleResp?.costo_total_estimado)} {dataDetalleResp.paquete.moneda?.codigo || 'USD'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">
                                Seña mínima requerida
                            </span>
                            <span className="font-medium text-orange-600">
                                {dataDetalleResp.paquete.moneda?.simbolo || '$'}{(formatearSeparadorMiles.format(dataDetalleResp?.seña_total)).toLocaleString()} {dataDetalleResp.paquete.moneda?.codigo || 'USD'}
                            </span>
                        </div>
                        <div className="border-t border-gray-200 pt-3">
                            <div className="flex justify-between items-center text-lg font-semibold">
                            <span>Total</span>
                            <span>{dataDetalleResp.paquete.moneda?.simbolo || '$'}{formatearSeparadorMiles.format(dataDetalleResp?.costo_total_estimado)} {dataDetalleResp.paquete.moneda?.codigo || 'USD'}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-green-600">
                            <span>Pagado</span>
                            <span>{dataDetalleResp.paquete.moneda?.simbolo || '$'}{formatearSeparadorMiles.format(dataDetalleResp?.monto_pagado)} {dataDetalleResp.paquete.moneda?.codigo || 'USD'}</span>
                        </div>
                        <div className="flex justify-between items-center text-red-600 font-medium">
                            <span>Saldo pendiente</span>
                            <span>{dataDetalleResp.paquete.moneda?.simbolo || '$'}{formatearSeparadorMiles.format(dataDetalleResp?.saldo_pendiente)} {dataDetalleResp.paquete.moneda?.codigo || 'USD'}</span>
                        </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 p-6 rounded-xl">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <Clock className="w-6 h-6 mr-3 text-gray-600" />
                            Historial de Pagos
                          
                      </h3>
                      <div className="space-y-3">
                          {/* {[booking.pagos].map((pago) => ( */}
                          {dataDetalleResp.comprobantes.map((pago: any) => (
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
                                      {dataDetalleResp.paquete.moneda?.simbolo || '$'}
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
                </div>
            )}

             {/* Botones de acción */}
            <div className="flex items-center justify-between space-x-4 p-2 pt-6 border-t border-gray-200">
            {/* Botón Cancelar Reserva - Solo si puede cancelar */}
            {dataDetalleResp?.info_cancelacion?.puede_cancelar && (
                <button
                    onClick={() => {
                        setIsCancelarReservaModalOpen(true);
                    }}
                    className="cursor-pointer px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2 font-medium"
                >
                    <XCircle className="w-4 h-4" />
                    <span>Cancelar Reserva</span>
                </button>
            )}

            {/* Botón Aceptar */}
            <button
                onClick={() => {
                onClose();
                }}
                className="cursor-pointer px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 font-medium"
            >
                <CheckCircle className="w-4 h-4" />
                <span>Aceptar</span>
            </button>
            </div>
        </div>

        {isPagoParcialModalOpen && (
            <PagoParcialModal
                isOpen={isPagoParcialModalOpen}
                onClose={handleClosePagoParcialModal}
                onConfirm={handleConfirmPagoParcial}
                isPendingPago={isPendingPagaoParcial}
                reservaData={dataDetalleResp}
                selectedPassengerId={selectedPassengerId}
            />
        )}

        {isReceiptModalOpen && <PaymentReceiptModal
            isOpen={isReceiptModalOpen}
            onClose={handleCloseReceipt}
            isPendingDescargaComprobante={isPendingDescargaComprobante}
            receiptData={pagoSeniaRealizadaResponse}
            handleDescargarPDF={() => handleDescargarPDF(pagoSeniaRealizadaResponse?.comprobante?.id)}
        />}


        {isAsiganrPasajeroModalOpen && (
            <AsignarPasajeroModal
                isOpen={isAsiganrPasajeroModalOpen}
                onClose={handleCloseAsigarPasajeroModal}
                onConfirm={handleConfirmAAsignarPasajero}
                isPending={isPendingAsignarPasajero}
                reservaData={dataDetalleResp}
                selectedPasajeroId={selectedPassengerId}
            />
        )}

        {isAsiganrTipoFacturaModalOpen && (
            <AsignarTipoFacturaModal
                isOpen={isAsiganrTipoFacturaModalOpen}
                onClose={handleCloseAsigarTipoFacturaModal}
                onConfirm={handleConfirmAsignarTipoFactuta}
                isPending={isPendingAsignarTipoFacturaModalidad}
                reservaData={dataDetalleResp}
            />
        )}

        {isGenerarNotaCreditoModalOpen && (
            <GenerarNotaCreditoModal
                isOpen={isGenerarNotaCreditoModalOpen}
                onClose={handleCloseGenerarNotaCreditoModal}
                onConfirm={handleConfirmGenerarNotaCredito}
                isPending={isPendingGenerarNotaCreditoGlobal || isPendingGenerarNotaCreditoParcial}
                reservaData={dataDetalleResp}
                selectedPasajeroId={selectedPassengerId}
            />
        )}


        {isGenerarFacturaOpen && (
            <GenerarFacturaModal
                isOpen={isGenerarFacturaOpen}
                onClose={handleCloseGenerarFacturaModal}
                onConfirm={tipoFacturaAgenerarse === "global" ? handleConfirmGenerarFacturaGlobal: handleConfirmGenerarFacturaIndividual}
                isPending={isPendingDescargaFacturaGlobal || isPendingDescargaFacturaIndividual}
                reservaData={dataDetalleResp}
                selectedPasajeroId={selectedPassengerId}
            />
        )}

        {isCancelarReservaModalOpen && (
            <CancelarReservaModal
                isOpen={isCancelarReservaModalOpen}
                onClose={handleCloseCancelarReservaModal}
                onConfirm={handleCancelarReserva}
                isPending={isPendingCancelarReserva}
                reservaData={dataDetalleResp}
            />
        )}

        {isComprobanteDevolucionModalOpen && (
            <ComprobanteDevolucionModal
                isOpen={isComprobanteDevolucionModalOpen}
                onClose={handleCloseComprobanteDevolucionModal}
                responseData={cancelacionResponse}
                reservaData={dataDetalleResp}
                onDescargarComprobante={handleDescargarPDF}
                isPendingDescarga={isPendingDescargaComprobante}
            />
        )}
</>
}

export default DetallesReservaContainer