

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { startTransition, use, useCallback, useEffect, useState } from "react"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Check,
  // X,
  Shield,
  // Users,
  // Package,
  // User,
  Download,
  // RefreshCw,
  Eye,
  Calendar,
  // AlertCircle,
  Loader2Icon,
  CheckIcon,
  // FileText,
  // Activity,
  // Tag,
  // Boxes,
  // User,
  // Building,
  X,
  Bus,
  Users,
  Table2,
  Grid3X3,
  Crown,
  User,
  CalendarDays,
  Package,
  CheckCircle,
  CheckCircle2,
  Circle,
  LayoutGrid,
  List,
  Building2,
  Heart,
  Share2,
  MapPin,
  BoxIcon,
} from "lucide-react"

import { MdOutlinePending } from "react-icons/md";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { FaAngleDoubleRight } from "react-icons/fa";
import { useMutation, useQuery } from '@tanstack/react-query';
// import { FaUserGroup } from "react-icons/fa6";
import { RiGroupLine } from "react-icons/ri";



import "flatpickr/dist/themes/material_green.css";


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPaymentPercentage, getPaymentStatus, PAYMENT_STATUS, RESERVATION_STATES, type Reserva, type ReservaListado, type RespuestaPaginada, type TipoPaquete, } from "@/types/reservas"
import {formatearFecha, formatearSeparadorMiles, getDaysBetweenDates, quitarAcentos } from "@/helper/formatter"
import { fetchData, fetchResumen, guardarDataEditado, nuevoDataFetch, fetchDataDistribuidoraTodos, fetchDataPasajeros, fetchDataPaquetes, fetchDataHotelesPorSalida, fetchDataPersonaTitular, activarReserva, desactivarReserva } from "@/components/utils/httpReservas"

import {Controller, useForm } from "react-hook-form"
import { queryClient } from "@/components/utils/http"
import { ToastContext } from "@/context/ToastContext"
import Modal from "@/components/Modal"
import { IoCheckmarkCircleOutline, IoWarningOutline } from "react-icons/io5";
import ResumenCardsDinamico from "@/components/ResumenCardsDinamico"
// import { GenericSearchSelect } from "@/components/GenericSearchSelect"
import { useSessionStore } from "@/store/sessionStore"
import placeholderViaje from "@/assets/paquete_default.png";
import { Checkbox } from "@/components/ui/checkbox"
import { fetchDataTiposPaquetesTodos } from "@/components/utils/httpPaquete"
import { DinamicSearchSelect } from "@/components/DinamicSearchSelect"
import type { Persona } from "@/types/empleados"
import { FechaSalidaSelectorContainer } from "@/components/FechaSalidaSelectorContainer"
// import { NumericFormat } from "react-number-format"
import { HotelHabitacionSelector } from "@/components/HotelHabitacionSelector";
import { HotelHabitacionSelectorListMode, type MonedaAlternativaCotizada } from "@/components/HotelHabitacionSelectorListMode";
import ReservationConfirmModal from "@/components/ReservationConfirmModal"
import PaymentReceiptModal from "@/components/PaymentReceiptModal"
import { useDescargarComprobante, usePagarSenia, usePagoTotal } from "@/components/hooks/useDescargarPDF"
import PagoSeniaModal from "@/components/PagoSeniaModal"
import DetallesReservaContainer from "@/components/DetallesReservaContainer";
import { TbInvoice } from "react-icons/tb"


// let dataList: Reserva[] = [];
let tipoReservaFilterList: any[] = [];
let dataPasajerosList: any[] = [];
let hotelesPorSalida: any = null;
// let dataPaquetesList: any[] = [];
console.log(tipoReservaFilterList);

// let paqueteSeleccionado: any = [];

export default function ReservaPage() {
  const {siTienePermiso} = useSessionStore();
  // const [setSearchTerm] = useState("")
  const [paymentType, setPaymentType] = useState<"minimum" | "total">("minimum")
  const [selectedPaqueteID, setSelectedPaqueteID] = useState<number | "">("");
  const [selectedSalidaID, setSelectedSalidaID] = useState<string>("");
  const [dataList, setDataList] = useState<Reserva[]>([]);
  const [selectedSalidaData, setSelectedSalidaData] = useState<any>();
  const [cotizacionMonedaAlternativa, setCotizacionMonedaAlternativa] = useState<MonedaAlternativaCotizada>();
  const [paqueteNoSeleccionada, setPaqueteNoSeleccionada] = useState<boolean | undefined>();
  const [nombreABuscar, setNombreABuscar] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [dataAEditar, setDataAEditar] = useState<Reserva>();
  const [dataADesactivar, setDataADesactivar] = useState<Reserva>();
  const [onDesactivarData, setOnDesactivarData] = useState(false);
  const [onVerDetalles, setOnVerDetalles] = useState(false);
  const [tipoPaqueteSelected, setTipoPaqueteSelected] = useState<TipoPaquete>();
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [reservaRealizadaResponse, setReservaRealizadaResponse] = useState<any>(null);
  const [pagoSeniaRealizadaResponse, setPagoSeniaRealizadaResponse] = useState<any>(null);
  // const [distribuidoraSelected, setDistribuidoraSelected] = useState<Distribuidora>();
  const [pasajerosSearchTerm, setPasajerosSearchTerm] = useState("");
  const [selectedPasajeros, setSelectedPasajeros] = useState<number[]>([])
  const [selectedPasajerosData, setSelectedPasajerosData] = useState<any[]>([])
  const [dataDetalle, setDataDetalle] = useState<Reserva>();
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")
  const [viewModeHabitacionList, setViewModeHabitacionList] = useState<"grouped" | "detailed">('detailed');
  const {handleShowToast} = use(ToastContext);
  const [onGuardar, setOnGuardar] = useState(false);
  const [newDataPersonaList, setNewDataPersonaList] = useState<Persona[]>();
  const [newDataPaqueteList, setNewDataPaqueteList] = useState<Persona[]>();
  const [personaBusqueda, setPersonaBusqueda] = useState<string>("");
  const [paqueteBusqueda, setPaqueteBusqueda] = useState<string>("");
  const [selectedPersonaID, setSelectedPersonaID] = useState<number | "">("");
  const [selectedTitularData, setSelectedTitularData] = useState<any | undefined>();
  const [selectedPaqueteData, setSelectedPaqueteData] = useState<any | undefined>();
  const [personaNoSeleccionada, setPersonaNoSeleccionada] = useState<boolean | undefined>();
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [selectedHotelData, setSelectedHotelData] = useState<any>();
  const [selectedTipoHabitacionID, setSelectedTipoHabitacionID] = useState('');
  const [selectedTipoHabitacionData, setSelectedTipoHabitacionData] = useState<any>();
  const [habitacionesPorSalida, setHabitacionesPorSalida] = useState<any[]>([]);
  const [habitacionesResumenPrecios, setHabitacionesResumenPrecios] = useState<any[]>([]);
  const [precioFinalPorPersona, setPrecioFinalPorPersona] = useState<number>(0);
  const [isEditingSena, setIsEditingSena] = useState(false)
  const [montoInicialAAbonar, setMontoInicialAAbonar] = useState<number>(0)
  const [seniaPorPersona, setSeniaPorPersona] = useState<number>(0)
  const [imagePreview, setImagePreview] = useState<string | undefined>(placeholderViaje);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSenialModalOpen, setIsSenialModalOpen] = useState(false);
  const [payloadReservationData, setPayloadReservationData] = useState<any>(null);
  console.log(seniaPorPersona)

  // const [serviciosAdicionalesSearchTerm, setServiciosAdicionalesSearchTerm] = useState("");
  // const [selectedServiciosAdicionales, setSelectedServiciosAdicionales] = useState<number[]>([])

  // const [paqueteNoSeleccionada, setPaqueteNoSeleccionada] = useState<boolean | undefined>();
  const [startDebounce, setStartDebounce] = useState<boolean>(false);
  
  const [filtros, setFiltros] = useState({
                  activo: true,   // null = todos, true = solo activos
                  fecha_desde: "",
                  fecha_hasta: "",
                  nombre: "",
                  estado: "all",  
                });

  const [filtrosPasajeros, setFiltrosPasajeros] = useState({
                  activo: true, tipo: 'fisica', sexo: 'all', busqueda: ""
                });
  
  // DATOS DEL FORMULARIO 
  const {control, watch, handleSubmit, setValue, clearErrors, reset} = 
            useForm<any>({
              mode: "onBlur",
              defaultValues: {
              }
        });
  // DATOS DEL FORMULARIO 
  // console.log(tipoReservaFilterList)


  const [currentPage, setCurrentPage] = useState(1);
  const [activeTabCatalogo, setActiveTabCatalogo] = useState('list');
  const [activeTab, setActiveTab] = useState<'general' | 'passengers' | 'payments'>('general');
  const [paginacion, setPaginacion] = useState<RespuestaPaginada>({
                                                      next: null,
                                                      totalItems: 5,
                                                      previous: null,
                                                      totalPages: 5,
                                                      pageSize: 10
                                              });

  console.log(onVerDetalles)
  console.log(dataDetalle);
  // console.log(distribuidoraSelected)

  const {data: dataPaquetesList, isFetching: isFetchingPaquete,} = useQuery({
      queryKey: ['paquetes-disponibles', 1, 10, {activo: true, busqueda: paqueteBusqueda}], //data cached
      // queryFn: () => fetchDataPaquetes(1, 10, filtrosPaquetes),
      queryFn: () => fetchDataPaquetes(1, 10, {activo: true, busqueda: paqueteBusqueda}),
      enabled: Boolean(paqueteBusqueda),
      staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
    });

  // const {data: dataServiciosList, isFetching: isFetchingServicios,} = useQuery({
  //       queryKey: ['servicios-disponibles',], //data cached
  //       queryFn: () => fetchDataServiciosTodos(),
  //       staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
  //     });

  const {data: dataPersonaList, isFetching: isFetchingPersonas} = useQuery({
    queryKey: ['personas-disponibles', 1, 10, {activo: true, tipo: 'fisica', sexo: 'all', busqueda: personaBusqueda}], //data cached 
    queryFn: () => fetchDataPersonaTitular(1, 10, {activo: true, tipo: 'fisica', sexo: 'all', busqueda: personaBusqueda}),
    staleTime: 5 * 60 * 1000, //despues de 5min los datos se consideran obsoletos
    // enabled: !((filtros.fecha_desde && !filtros.fecha_hasta) || (!filtros.fecha_desde && filtros.fecha_hasta))
    enabled: Boolean(personaBusqueda)
  ,
  });


  const {data: dataPasajerosListTemp, isFetching: isFetchingPasajeros} = useQuery({
    queryKey: ['pasajeros-disponibles', 1, 10, filtrosPasajeros], //data cached 
    queryFn: () => fetchDataPasajeros(1, 10, filtrosPasajeros),
    staleTime: 5 * 60 * 1000, //despues de 5min los datos se consideran obsoletos
    enabled: !((filtros.fecha_desde && !filtros.fecha_hasta) || (!filtros.fecha_desde && filtros.fecha_hasta))
  ,
  });

  console.log(dataPasajerosListTemp)

  if(isFetchingPasajeros)
    dataPasajerosList = [];
  else
    dataPasajerosList = dataPasajerosListTemp;


  console.log(dataPasajerosList) 
  console.log(dataPaquetesList);

  const {data: dataTipoPaqueteList, isFetching: isFetchingTipoPaquetes,} = useQuery({
      queryKey: ['tipos-paquetes-disponibles',], //data cached
      queryFn: () => fetchDataTiposPaquetesTodos(),
      staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
    });
    

  // const {data: dataMonedaList, isFetching: isFetchingMoneda,} = useQuery({
  //     queryKey: ['monedas-disponibles',], //data cached
  //     queryFn: () => fetchDataMonedaTodos(),
  //     staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
  //   });

    console.log('selectedSalidaID: ', selectedSalidaID)

    // selectedSalidaID
  const {data: dataHotelesPorSalidaList, isFetching: isFetchingHotelesList,} = useQuery({
      queryKey: ['hotel-por-salida', selectedSalidaID], //data cached
      queryFn: ({signal}) => fetchDataHotelesPorSalida({signal, id: selectedSalidaID}),
      enabled: Boolean(selectedSalidaID),
      staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
    });


  //FETCH PARA DESCARGAR EL COMPROBANTE EN FORMATO PDF
  const { mutate: generarYDescargar, isPending: isPendingDescargaComprobante } = useDescargarComprobante();
  //FETCH PARA REALIZAR EL PAGO DE LA SEÑA
  const { mutate: fetchPagarSenia, isPending: isPendingPagarSenia } = usePagarSenia();

  const { mutate: fetchPagoTotal, isPending: isPendingPagoTotal } = usePagoTotal();

  console.log(isPendingDescargaComprobante);

  function handleDescargarPDF(id: number) {
    generarYDescargar(id, {
      onSuccess: () => {
        console.log('✅ PDF descargado correctamente');
        handleShowToast('Comprobante descargado correctamente', 'success');
        // setIsReceiptModalOpen(false);
        // setReservaRealizadaResponse(null);
      },
      onError: (error) => {
        console.error('❌ Error al descargar el PDF', error);
        handleShowToast('Error al descargar el comprobante', 'error');
      },
    });
  }

  const handlePagarSenia = (id: number, payload: any) => {
    console.log('📦 Payload enviado al backend:', JSON.stringify(payload, null, 2));

    fetchPagarSenia(
      { reservaId: id, payload },
      {
        onSuccess: (data) => {
          console.log('✅ Se ha realizado la seña correctamente');
          console.log('📄 Respuesta del servidor:', data);
          handleShowToast('Se ha pagado la seña correctamente', 'success');

          // Cerrar modal y limpiar estado
          setIsSenialModalOpen(false);
          // setReservaRealizadaResponse(null);
          setIsReceiptModalOpen(true);
          setPagoSeniaRealizadaResponse(data);

          // Refrescar la lista de reservas para ver el estado actualizado
          queryClient.invalidateQueries({ queryKey: ['reservas'] });
          // Refrescar el resumen de movimientos de caja
          queryClient.invalidateQueries({ queryKey: ['movimientos-resumen'] });
          queryClient.invalidateQueries({queryKey: ['movimientos'],exact: false});
        },
        onError: (error: any) => {
          console.error('❌ Error al realizar la seña:', error);
          console.error('📋 Detalles del error:', error.response?.data);

          const errorMessage = error.response?.data?.message
            || error.response?.data?.error
            || 'Error al generar la seña';

          handleShowToast(errorMessage, 'error');
        },
      }
    );
  }

  const handlePagoTotal = (id: number, payload: any) => {
    console.log('📦 Payload enviado al backend:', JSON.stringify(payload, null, 2));

    fetchPagoTotal(
      { reservaId: id, payload },
      {
        onSuccess: (data) => {
          console.log('✅ Se ha realizado la seña correctamente');
          console.log('📄 Respuesta del servidor:', data);
          handleShowToast('Se ha pagado el paquete correctamente', 'success');

          // Cerrar modal y limpiar estado
          setIsSenialModalOpen(false);
          // setReservaRealizadaResponse(null);
          setIsReceiptModalOpen(true);
          setPagoSeniaRealizadaResponse(data);

          // Refrescar la lista de reservas para ver el estado actualizado
          queryClient.invalidateQueries({ queryKey: ['reservas'] });
          // Refrescar el resumen de movimientos de caja
          queryClient.invalidateQueries({ queryKey: ['movimientos-resumen'] });
          queryClient.invalidateQueries({queryKey: ['movimientos'],exact: false});
        },
        onError: (error: any) => {
          console.error('❌ Error al realizar la seña:', error);
          console.error('📋 Detalles del error:', error.response?.data);

          const errorMessage = error.response?.data?.message
            || error.response?.data?.error
            || 'Error al generar el pagp';

          handleShowToast(errorMessage, 'error');
        },
      }
    );
  }

    console.log(dataHotelesPorSalidaList)

    if(dataHotelesPorSalidaList){
      hotelesPorSalida = dataHotelesPorSalidaList.hoteles;

      console.log(hotelesPorSalida);
    }


    console.log(isFetchingHotelesList);

  const {data: dataDistribuidoraList, isFetching: isFetchingDistribuidora,} = useQuery({
      queryKey: ['distribuidoras-disponibles',], //data cached
      queryFn: () => fetchDataDistribuidoraTodos(),
      staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
    });


  console.log(isFetchingTipoPaquetes);
  // console.log(dataMonedaList, isFetchingServicios);
  // console.log( isFetchingMoneda);
  console.log(dataDistribuidoraList, isFetchingDistribuidora);
  // console.log(dataMonedaList, isFetchingServicios);


  const {data, isFetching, isError} = useQuery({
    queryKey: ['reservas', currentPage, paginacion.pageSize, filtros], //data cached
    queryFn: () => fetchData(currentPage, paginacion.pageSize, filtros),
    staleTime: 5 * 60 * 1000, //despues de 5min los datos se consideran obsoletos
    enabled: !((filtros.fecha_desde && !filtros.fecha_hasta) || (!filtros.fecha_desde && filtros.fecha_hasta))
  ,
  });

  const {data: dataResumen, isFetching: isFetchingResumen, isError: isErrorResumen} = useQuery({
    queryKey: ['reservas-resumen'], //data cached
    queryFn: () => fetchResumen(),
    staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
  });

  // let filteredPermissions: Modulo[] = [];

  console.log(dataPersonaList)


  if(dataTipoPaqueteList && dataTipoPaqueteList.length){
    tipoReservaFilterList = [...dataTipoPaqueteList];
  }
  

  console.log(data);

  
  useEffect(() => {
      if(!isFetching && !isError){
        console.log(data?.results)
        if(data?.results){
          const dataList = data.results.map((per: ReservaListado, index: number) => ({...per, numero: index + 1}));
          console.log(dataList)
          setDataList(dataList)
        }
      }

  }, [data, isError, isFetching]);


  useEffect(() => {
    if(!dataHotelesPorSalidaList)
      return;
    
    setHabitacionesResumenPrecios(dataHotelesPorSalidaList?.resumen_precios?.habitaciones_ordenadas ?? [])


  }, [dataHotelesPorSalidaList]);

  // if(!isFetchingPersonas){
  //   console.log('dataListPersonas: ', dataPersonaList)
  // }
  useEffect(() => {
      if(isFetchingPersonas){
        setNewDataPersonaList([])
      }
    }, [isFetchingPersonas]);


    console.log(selectedPersonaID);
    console.log(selectedTitularData); 
    console.log(watch('titularComoPasajero')); ;


  useEffect(() => {  
    if(dataPersonaList){
        console.log(dataPersonaList);

        const dataPersonasTitular = dataPersonaList.map((data: any) => ({
          ...data, tipo_documento_nombre: data?.tipo_documento?.nombre
        }))


      if(dataAEditar){
        setNewDataPersonaList([...dataPersonasTitular, dataAEditar.titular]);
      }
      else{
        console.log(dataPersonasTitular)
        console.log('dataPersonaList: ', dataPersonasTitular)
        setNewDataPersonaList([...dataPersonasTitular])
      }
    }
  }, [dataAEditar, dataPersonaList]); 


  useEffect(() => {
    // setSelectedTipoHabitacionID('')

    if (selectedHotelId) {
      const hotel = hotelesPorSalida.find(
        (h: any) => h.id.toString() === selectedHotelId.toString()
      ); 

      if (hotel) {
        console.log("Habitaciones encontradas:", hotel.habitaciones);
        setHabitacionesPorSalida(hotel.habitaciones);
      } else {
        setHabitacionesPorSalida([]);
      }
    } else {
      setHabitacionesPorSalida([]);
    }
  }, [selectedHotelId]);

  console.log(habitacionesPorSalida)


  // if(selectedTipoHabitacionID){
  //   const habitacion = habitacionesPorSalida.filter((h: any) => h.id.toString() === selectedTipoHabitacionID.toString())
  //   console.log(habitacion)
  // }

  //BUSCADOR DE PAQUETES
  useEffect(() => {
    if(isFetchingPaquete){
      setNewDataPaqueteList([])
    }
  }, [isFetchingPaquete]);


  useEffect(() => {  
    if(dataPaquetesList){
      const dataPaquetes = dataPaquetesList.map((data: any) => ({
        ...data, 
        tipo_paquete_nombre: data?.tipo_paquete?.nombre,
        destino_nombre: data?.destino?.ciudad,
      }))

      //destino.ciuida

      if(dataAEditar){
        setNewDataPaqueteList([...dataPaquetes, dataAEditar.titular]);
      }
      else{
        console.log('dataPersonaList: ', dataPaquetes)
        setNewDataPaqueteList([...dataPaquetes])
      }
    }
  }, [dataAEditar, dataPaquetesList]); 


  console.log(newDataPaqueteList)

    useEffect(() => {
      if (!tipoPaqueteSelected) return;

      const tipo = quitarAcentos(tipoPaqueteSelected.nombre ?? "").toLowerCase();

      if (tipo === "aereo") {
        setValue("titularComoPasajero", false); // Desmarcar si es aereo
      } else {
        setValue("titularComoPasajero", true); // Marcar si es terrestre u otro
      }
    }, [tipoPaqueteSelected, setValue]);
  
  // Cálculos de paginación
  const totalItems = dataList?.length
  // const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * paginacion.pageSize
  const endIndex = startIndex + paginacion.pageSize
  // const paginatedPermisos = filteredPermissions.slice(startIndex, endIndex);

  // Función para cambiar página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  }

  // Función para cambiar items por página
  const handleItemsPerPageChange = (value: string) => {
    // setItemsPerPage(Number(value))
    setPaginacion(prevPagination => ({...prevPagination, pageSize: Number(value)}))
    setCurrentPage(1) // Reset a la primera página
  }

    useEffect(() => {
      if (!data) return;
      setPaginacion({
              next: data?.next ?? null,
              totalItems: data?.count ?? null,
              previous: data?.previous ??  null,
              totalPages: data?.totalPages,
              pageSize: data?.pageSize ?? null
            });
    }, [data])

  const handleReset = () => {
    startTransition(() => {
        // setSearchTerm("");
        setShowActiveOnly(true);
        setNombreABuscar("")
      });
  }

  const handleActiveOnly = () => {
    setShowActiveOnly(prev => !prev)
    setFiltros({ ...filtros, activo: !showActiveOnly })
    setCurrentPage(1);
  }


  const {mutate, isPending: isPendingReservation} = useMutation({
    mutationFn: nuevoDataFetch,
    onSuccess: (data) => {
        handleShowToast('Se ha creado una nueva reserva satisfactoriamente', 'success');
        reset({
          nombre: '',
          paquete: '',
        });

        console.log(data)
        // setTipoDePersonaCreacion(undefined);
        // setTipoPaqueteSelected(undefined);
        // setDistribuidoraSelected(undefined);
        
        // Cerrar modal de confirmación
        setIsConfirmModalOpen(false);
        setPayloadReservationData(null);
        // Abrir modal de recibo de pago
        setReservaRealizadaResponse(data)
        //setIsReceiptModalOpen(true);
        setIsSenialModalOpen(true)

        setSelectedPasajeros([])
        setSelectedPaqueteID("");
        setTipoPaqueteSelected(undefined);
        // setDistribuidoraSelected(undefined);
        handlePaqueteNoSeleccionada(undefined);
        setSelectedTitularData(undefined)

        // handleCancel(); 
        
        queryClient.invalidateQueries({
          queryKey: ['reservas'],
          exact: false
        });

        queryClient.invalidateQueries({
          queryKey: ['reservas-resumen'],
        });

        queryClient.invalidateQueries({
          queryKey: ['reservas-disponibles'],
        });


        queryClient.invalidateQueries({
          queryKey: ['usuarios'],
          exact: false
        });

        queryClient.invalidateQueries({
          queryKey: ['paquetes-disponibles'],
        });

        
        queryClient.invalidateQueries({
          queryKey: ['pasajeros-disponibles'],
        });
        
        queryClient.invalidateQueries({
          queryKey: ['personas-disponibles'],
        });

        queryClient.removeQueries({
          queryKey: ['hotel-por-salida'],
        });

        setActiveTabCatalogo('list');
    },
  });

  const {mutate: mutateGuardarEditado, isPending: isPendingEdit} = useMutation({
    mutationFn: guardarDataEditado,
    onSuccess: () => {
        handleShowToast('Se ha guardado el reserva satisfactoriamente', 'success');
        setDataAEditar(undefined);
        reset({
            tipo_paquete: '',
          });

        // setTipoDePersonaCreacion(undefined);
        // setTipoPaqueteSelected(undefined);
        // setDistribuidoraSelected(undefined);
        handleCancel();
        queryClient.invalidateQueries({ queryKey: ['reservas'], exact: false });
        queryClient.invalidateQueries({ queryKey: ['reservas-resumen'] });
        queryClient.invalidateQueries({ queryKey: ['reservas-disponibles'] });
        queryClient.invalidateQueries({
          queryKey: ['paquetes-disponibles'],
        });

        queryClient.invalidateQueries({
          queryKey: ['pasajeros-disponibles'],
        });
        
        queryClient.invalidateQueries({
          queryKey: ['personas-disponibles'],
        });
        
        queryClient.removeQueries({
          queryKey: ['hotel-por-salida'],
        });

        setActiveTabCatalogo('list');
    },
  });

  const {mutate: mutateDesactivar, isPending: isPendingDesactivar} = useMutation({
    mutationFn: async ({ dataId, activo }: { dataId: number; activo: boolean }) => {
      if (activo) {
        return await activarReserva(dataId);
      } else {
        return await desactivarReserva(dataId);
      }
    },
    onSuccess: () => {
        handleShowToast(`Se ha ${dataADesactivar?.activo ? 'desactivado' : 'activado'} la reserva satisfactoriamente`, 'success');
        setOnDesactivarData(false);
        setDataADesactivar(undefined);
        //desactivamos todas las queies
        queryClient.invalidateQueries({
          queryKey: ['reservas'],
          exact: false
        });
        queryClient.invalidateQueries({
          queryKey: ['reservas-resumen'],
        });
    },
  });


  const handleDataNoSeleccionada = (value: boolean | undefined) => {
    console.log(value)
  }

  const handleDataNoPersonaSeleccionada = (value: boolean | undefined) => {
    console.log(value)
    setPersonaNoSeleccionada(value);
  }

  const handleDataNoPaqueteSeleccionada = (value: boolean | undefined) => {
    setPaqueteNoSeleccionada(value);
  }


  if(selectedPaqueteID){
    console.log(selectedPaqueteID)
    console.log(dataPaquetesList)
    console.log(newDataPaqueteList)
    console.log(selectedPaqueteData)
    
    // paqueteSeleccionado = dataPaquetesList.filter((p: any) => p.id.toString() === selectedPaqueteID.toString())
    // console.log(paqueteSeleccionado)
  }


  const handleCancel = () => {
        setDataAEditar(undefined);
        setOnGuardar(false)
        setSelectedTitularData(undefined)
        setSelectedPaqueteData(undefined)
        setSelectedPaqueteID("");
        setTipoPaqueteSelected(undefined);
        // setDistribuidoraSelected(undefined);
        handlePaqueteNoSeleccionada(undefined)
        setSelectedPersonaID("");
        handleDataNoSeleccionada(undefined)
        handleDataNoPersonaSeleccionada(undefined)
        handleDataNoPaqueteSeleccionada(undefined)
        setNewDataPersonaList([]);
        setNewDataPaqueteList([])
        setSelectedPasajerosData([]);
        setSelectedPasajeros([]);
        setImagePreview(placeholderViaje);
        setSelectedSalidaID("");
        setSelectedHotelId('');
        setSelectedHotelData(undefined);
        setSelectedTipoHabitacionID('');
        setIsEditingSena(false);
        setMontoInicialAAbonar(0);
        setSeniaPorPersona(0);

        setIsReceiptModalOpen(false);
        setReservaRealizadaResponse(null);
        setCotizacionMonedaAlternativa(undefined);


        setIsConfirmModalOpen(false);
        setPayloadReservationData(null);
        // Abrir modal de recibo de pago
        setReservaRealizadaResponse(null)
        //setIsReceiptModalOpen(true);
        setIsSenialModalOpen(false)
        // setDistribuidoraSelected(undefined);
        // setSelectedServiciosAdicionales([]);
        // setServiciosAdicionalesSearchTerm("");
        reset({
            nombre: '',
            senia: '',
        });


        // setTipoDePersonaCreacion(undefined);
        // setTipoPaqueteSelected(undefined);
        // setDistribuidoraSelected(undefined);
        
        setActiveTabCatalogo('list');
  }


  const handleGuardarNuevaData = async (dataForm: any) => {
      console.log(dataForm)
      console.log('persona: ', selectedPersonaID);

      if (paqueteNoSeleccionada === undefined) {
        setPaqueteNoSeleccionada(true);
        return;
      }

      
      if(!selectedPaqueteData || !selectedSalidaID || !selectedTipoHabitacionID || !selectedPersonaID || !selectedTitularData){
        handleShowToast('Debes completar todos los pasos para registrar la reserva', 'error');
        return;
      }
      
      if(selectedPaqueteData.propio && selectedSalidaData.cupo < selectedTipoHabitacionData.capacidad){
        handleShowToast('No hay suficientes lugares disponibles para esta habitacion', 'error');
        return;
      }
      
      const pasajeros_data = selectedPasajerosData.map(p => ({persona_id: p.id}))
      console.log(pasajeros_data)
      console.log(selectedTitularData);
      console.log(selectedPasajerosData);
      console.log(selectedPaqueteID);
      console.log(dataForm)

      console.log(tipoPaqueteSelected)

      const payload = {
        ...dataForm,
        paquete_id: selectedPaqueteID,
        pasajeros_data: pasajeros_data, // Array de IDs
        salida_id: selectedSalidaID,
        habitacion_id: selectedTipoHabitacionID,
        persona: selectedPersonaID,
        titular_como_pasajero: dataForm.titularComoPasajero,
        activo: true,
      };

      console.log(titularComoPasajero)
      payload.titular_id = selectedTitularData?.id;

      // paymentType === 'total'
      //                                     ? Number(precioFinalPorPersona ?? 0) *
      //                                       Number(selectedTipoHabitacionData?.capacidad ?? 0)
      //                                     : Number(montoInicialAAbonar ?? 0) *
      //                                       Number(selectedTipoHabitacionData?.capacidad ?? 0)


      // if(paymentType === 'total'){
      //   payload.monto_pagado = Number(precioFinalPorPersona ?? 0) *
      //                                       Number(selectedTipoHabitacionData?.capacidad ?? 0);
      // }
      // else{
      //   payload.monto_pagado = Number(montoInicialAAbonar ?? 0) *
      //                                       Number(selectedTipoHabitacionData?.capacidad ?? 0)
      // }

      payload.monto_pagado = 0;

      // Eliminar campos que no se envían
      delete payload.numero;
      delete payload.senia;
      delete payload.tipo_paquete;
      delete payload.destino;
      delete payload.distribuidora;
      delete payload.moneda;
      delete payload.persona;
      delete payload.titularComoPasajero;

      console.log(payload);
      // Llamada al mutate enviando formData

  // {
  //   paquete_id: 120,
  //   pasajeros_data: [],
  //   salida_id: 213,
  //   habitacion_id: 3,
  //   activo: true,
  //   titular_id: 15,
  //   monto_pagado: 600
  // }
  //       {
  //   nombre: '',
  //   paquete_id: 120,
  //   pasajeros_data: [],
  //   salida_id: 213,
  //   habitacion_id: 18,
  //   activo: true,
  //   titular_id: 15,
  //   monto_pagado: 400
  // }

  // //  {
  //   "paquete_id": 5,
  //   "titular_id": 10,
  //   "salida_id": 3,
  //   "habitacion_id": 8,
  //   "monto_pagado": 2000.00,
  //   "pasajeros_data": [
  //     {"persona_id": 15},
  //     {"persona_id": 18},
  //     {"persona_id": 22}
  //   ],
  //   "observacion": "Grupo de amigos - viaje corporativo"
  // }

      // Preparar datos para el modal de confirmación
      const modalData = {
        package: selectedPaqueteData?.nombre || '',
        duration: `${getDaysBetweenDates(selectedSalidaData?.fecha_salida, selectedSalidaData?.fecha_regreso)} días`,
        departureDate: formatearFecha(selectedSalidaData?.fecha_salida),
        returnDate: formatearFecha(selectedSalidaData?.fecha_regreso),
        numberOfPeople: selectedTipoHabitacionData?.capacidad || 0,
        hotel: selectedHotelData?.nombre || '',
        hotelRating: selectedHotelData?.estrellas || 0,
        roomType: selectedTipoHabitacionData?.tipo || '',
        servicesIncluded: selectedPasajerosData?.length || 0,
        deposit: Number(montoInicialAAbonar ?? 0) * Number(selectedTipoHabitacionData?.capacidad ?? 0),
        depositPerPerson: Number(montoInicialAAbonar ?? 0),
        totalPrice: Number(precioFinalPorPersona ?? 0) * Number(selectedTipoHabitacionData?.capacidad ?? 0),
        pricePerPerson: Number(precioFinalPorPersona ?? 0),
        currency: selectedPaqueteData?.moneda || 'USD',
      };

      // Guardar payload y datos del modal
      setPayloadReservationData({ payload, modalData });

      // Mostrar modal de confirmación
      setIsConfirmModalOpen(true);
    };


  const handleGuardarDataEditado = async (dataForm: any) => {

    const payload = {
      ...dataForm,
      destino_id: selectedPaqueteID,
      tipo_paquete_id: tipoPaqueteSelected?.id,
      servicios_ids: selectedPasajeros,
      persona: selectedPersonaID,
    };

    // Limpiar campos que no deben enviarse
    delete payload.numero;
    delete payload.tipo_paquete;
    delete payload.paquete;
    delete payload.servicios;
    delete payload.distribuidora;

    if (watch("titularComoPasajero")) {
      delete payload.distribuidora_id;
    } else {
      delete payload.cantidad_pasajeros;
    }


    mutateGuardarEditado({
        data: payload,
        paqueteId: payload.id
      });
  };

  // Manejar la confirmación del modal
  const handleConfirmReservation = () => {
    if (payloadReservationData?.payload) {
      // Ejecutar la mutación para crear la reserva

      console.log(payloadReservationData?.payload)
      mutate(payloadReservationData.payload);
    }
  };

  // Manejar la confirmación del modal
  const handleConfirmSeniaPago = (payload: any, paymentType: "deposit" | "full") => {
    if (payload) {
      console.log(reservaRealizadaResponse)
      // console.log(pagoSeniaRealizadaResponse)
      console.log(payload)
      console.log(paymentType)

      if(paymentType === 'deposit')
        handlePagarSenia(reservaRealizadaResponse.id, payload)
      else
        handlePagoTotal(reservaRealizadaResponse.id, payload)
    }
  };

  // Manejar el cierre del modal
  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    // setPayloadReservationData(null);
  };

  const handleCloseSeniaModal = () => {
    setIsSenialModalOpen(false);
    handleCancel()
    // setPayloadReservationData(null);
  };
  
  useEffect(() => {
    if (dataAEditar) {
      console.log('reset data para editar: ', dataAEditar)
      reset({
        ...dataAEditar,
        persona: dataAEditar.titular.id.toString()
      });

      setSelectedPersonaID(dataAEditar.titular.id);
      handleDataNoSeleccionada(true);
    }
  }, [dataAEditar, reset]);


  const handleEditar = (data: Reserva) => {
  //   {
  //   id: 5,
  //   nombre: 'Paris Unico',
  //   tipo_paquete: { id: 2, nombre: 'Aereo' },
  //   destino: { id: 9, nombre: 'Paris', pais: { id: 19, nombre: 'Francia' } },
  //   distribuidora: { id: 1, nombre: 'Consorcio Travel' },
  //   moneda: { id: 2, nombre: 'Dolar', simbolo: '$', codigo: 'USD' },
  //   servicios: [
  //     { id: 9, nombre: 'Actividades Recreativas' },
  //     { id: 7, nombre: 'Asistencia Básica al Pasajero' },
  //     { id: 6, nombre: 'Desayuno Diario' },
  //     { id: 8, nombre: 'Seguro de Viaje' }
  //   ],
  //   precio: 2000,
  //   sena: 0,
  //   fecha_inicio: null,
  //   fecha_fin: null,
  //   personalizado: true,
  //   cantidad_pasajeros: null,
  //   titularComoPasajero: false,
  //   activo: true,
  //   imagen: null,
  //   imagen_url: null,
  //   fecha_creacion: '2025-09-09T10:49:05+0000',
  //   fecha_modificacion: '2025-09-09T10:49:05+0000',
  //   numero: 1
  // }

  // const servicios_ids = data.servicios.map(servicio => servicio.id)
    console.log('data: ', data)
    setActiveTabCatalogo('form');
    setDataAEditar(data);

    setSelectedPersonaID(data!.titular.id)
    

    //COMENTADO TEMPORALMENTE
      // setSelectedPaqueteID(data!.destino.id)
      // setTipoPaqueteSelected(data!.tipo_paquete)
      // setDistribuidoraSelected(data!.distribuidora);
      // setSelectedPasajeros(servicios_ids)
    
  }

  const toggleActivar = (modulo: Reserva) => {
    setOnDesactivarData(true);
    setDataADesactivar(modulo);
  }

  const handleCloseModal = () => {
    setOnDesactivarData(false);
  }

  const handleConfirmActivo = (activo=true) => {
    mutateDesactivar({ dataId: dataADesactivar!.id, activo, })
  }

  const handleVerDetalles = (data: Reserva) => {
    console.log(data)
    setDataDetalle(data);
    setOnVerDetalles(true);
  }

  const handleCloseVerDetalles = () => {
    setOnVerDetalles(false);
    setDataDetalle(undefined);
    setActiveTab('general');
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      console.log('cambiando nombre')
      setFiltros(filtroAnterior => ({...filtroAnterior, nombre: nombreABuscar}))
    }, 750) // ⏱️ medio segundo de espera

    return () => {
      clearTimeout(handler) // limpia el timeout si se sigue escribiendo
    }
  }, [nombreABuscar]);

  // BUSCADOR DE PASAJEROS
  useEffect(() => {
    setStartDebounce(true);
    const handler = setTimeout(() => {
      console.log('cambiando nombre')
      setFiltrosPasajeros(filtroPersona => ({...filtroPersona, busqueda: pasajerosSearchTerm}))
      setStartDebounce(false);
    }, 750) // ⏱️ medio segundo de espera

    return () => {
      clearTimeout(handler) // limpia el timeout si se sigue escribiendo
    }
  }, [pasajerosSearchTerm]);


  useEffect(() => {
    if(selectedPaqueteID){
      setSelectedSalidaID("");
      setSelectedSalidaData(undefined);
      setSelectedHotelId('');
      setSelectedHotelData(undefined);
      setSelectedTipoHabitacionID('');
      setSelectedPersonaID('')
      handleDataNoPersonaSeleccionada(undefined)
      setIsEditingSena(false);
      setMontoInicialAAbonar(0);
      setSeniaPorPersona(0);
      setValue('senia', '');
    }
    
    return () => {
      
    };
  }, [selectedPaqueteID, setValue]);
  
  useEffect(() => {
    console.log(selectedSalidaID)
    console.log(selectedPaqueteData)
    console.log(selectedPaqueteData?.salidas)

    if(selectedSalidaID && selectedPaqueteData){ 
      const salidas = selectedPaqueteData?.salidas;
      console.log(salidas);
      const salida = salidas?.filter((salida: any) => salida.id.toString() === selectedSalidaID.toString())
      console.log(salida)
      
      setSelectedSalidaData(salida.length ? salida[0] : undefined)

      // setHabitacionesResumenPrecios(hotel.resumen_precios);

      setSelectedHotelId('');
      setSelectedHotelData(undefined);
      setSelectedTipoHabitacionID('');
      setSelectedPersonaID('')
      handleDataNoPersonaSeleccionada(undefined)
      setIsEditingSena(false);
      setMontoInicialAAbonar(0);
      setSeniaPorPersona(0)
      setValue('senia', '');
    }
    
    return () => {
      
    };
  }, [selectedPaqueteData, selectedPaqueteData?.salidas, selectedSalidaID, setValue]);

  useEffect(() => {
    if(selectedSalidaID && selectedTipoHabitacionID && selectedHotelId && selectedSalidaData && selectedSalidaData?.senia){
      setSelectedPasajeros([]);
      setPasajerosSearchTerm("");;
      setSelectedPasajerosData([])
      setIsEditingSena(false);
      // setMontoInicialAAbonar(0);

      console.log(selectedSalidaData)
      console.log(selectedSalidaData?.precio_moneda_alternativa?.senia) 
      console.log(selectedSalidaData?.senia)
      console.log(selectedTipoHabitacionData?.capacidad)

      const senia = Number(selectedSalidaData?.senia ?? 0)
      console.log(senia);
      setMontoInicialAAbonar(senia);
      setSeniaPorPersona(senia);

      console.log(senia)
    }
    
    return () => {
      
    };
  }, [selectedSalidaID, selectedTipoHabitacionID, selectedHotelId, selectedSalidaData?.senia, 
    selectedSalidaData, selectedTipoHabitacionData?.capacidad]);

  // if(startDebounce)
  //   dataPasajerosList = []

  const handlePaqueteNoSeleccionada = (value: boolean | undefined) => {
    setPaqueteNoSeleccionada(value);
  }


  console.log('selectedPasajerosData: ', selectedPasajerosData)

  useEffect(() => {
    if(activeTabCatalogo === 'list'){
        queryClient.invalidateQueries({
                queryKey: ['puestos-disponibles'],
                exact: false
              });

        queryClient.invalidateQueries({
                queryKey: ['tipo-remuneracion-de-personas'],
                exact: false
              });
    }
  }, [activeTabCatalogo]);

  useEffect(() => {
    if (tipoPaqueteSelected?.nombre === 'Comision' || tipoPaqueteSelected?.nombre === 'Comisión') {
      setValue("salario", "");
      clearErrors("salario");
    }else if (tipoPaqueteSelected?.nombre === 'Salario fijo') {
      setValue("porcentaje_comision", "");
      clearErrors("porcentaje_comision");
    }
  }, [tipoPaqueteSelected, setValue, clearErrors]);


  const handlePasajeroToggle = (permissionId: number, pasajero: any) => {
    // 🔹 Primero actualizamos los ids seleccionados
    setSelectedPasajeros((prev) => {
      let updated;

      if (prev.includes(permissionId)) {
        updated = prev.filter((p) => p !== permissionId); // quitar
      } else {
        updated = [...prev, permissionId]; // agregar
      }

      return updated;
    });

    // 🔹 Luego actualizamos los pasajeros seleccionados
    setSelectedPasajerosData((prev) => {
      let updated;

      const exists = prev.some((p: any) => p.id === permissionId);

      if (exists) {
        updated = prev.filter((p: any) => p.id !== permissionId); // quitar pasajero
      } else {
        updated = [...prev, pasajero]; // agregar pasajero
      }

      return updated;
    });
  };


    const handlePaymentTypeChange = useCallback((type: 'minimum' | 'total') => {
      if (paymentType !== type) setPaymentType(type);
    }, [paymentType]);

    console.log(handlePaymentTypeChange);


    useEffect(() => {

      if(!selectedSalidaData || !selectedTipoHabitacionData || !selectedHotelData)
        return;

      setPrecioFinalPorPersona(selectedTipoHabitacionData?.precio_calculado?.precio_venta_final ?? 0)
    }, [selectedSalidaData, selectedTipoHabitacionData, selectedHotelData, selectedPaqueteData?.servicios]);

    
  const senia = watch('senia');
  console.log(senia)


  const titularComoPasajero = watch('titularComoPasajero');

  console.log(titularComoPasajero)

  const cantidadActualPasajeros = selectedHotelId && selectedTipoHabitacionID && selectedPersonaID ? (watch('titularComoPasajero') ? selectedPasajerosData?.length + 1: selectedPasajerosData?.length) : 0;

  useEffect(() => {
    console.log('El valor de titularComoPasajero cambió:', titularComoPasajero);
    setSelectedPasajeros([]);
    setPasajerosSearchTerm("");;
    setSelectedPasajerosData([])

    // if(!titularComoPasajero){
    //   setSelectedTitularData(undefined)
    // }
        
  // acá ponés lo que querés ejecutar cuando cambie
  }, [titularComoPasajero]);


  // const handleServicioToggle = (permissionId: number, precio: number) => {
  //   console.log(precio); 
  //   console.log(permissionId)
  //   setSelectedServiciosAdicionales((prev) => {
  //     const updated =
  //       prev.includes(permissionId)
  //         ? prev.filter((p) => p !== permissionId) // quitar
  //         : [...prev, permissionId];              // agregar


      
  //     // if(!prev.includes(permissionId))
  //     //   handleShowToast('Los servicios adicionales tiene un costo extra', 'warning');

  //     return updated;
  //   });
  // };



  // const handleCloseConfirm = () => {
  //   console.log('Modal de confirmación cerrado');
  //   setIsConfirmModalOpen(false);
  // };

  const handleCloseReceipt = () => {
    console.log('Modal de comprobante cerrado');
    handleCancel();
  };


  // const handleDescargar = () => {
  //    handleDescargarPDF(reservaRealizadaResponse?.id)
  // }



  return (
    <>
      {onVerDetalles && <Modal onClose={handleCloseVerDetalles} claseCss={'mdsdsodal-detalles'}>
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="modal-detalles-reserva bg-white/95 rounded-xl shadow-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto backdrop-blur-sm">
              <div className="relative">
                <img
                  src={dataDetalle!.paquete.imagen ?? placeholderViaje}
                  alt={dataDetalle?.paquete.nombre}
                  className="w-full h-74 object-cover rounded-t-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-t-xl" />

                <div className="absolute top-4 left-4 flex space-x-2">
                  <span className={`px-4 py-2 rounded-full text-xs font-medium ${
                    dataDetalle?.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {dataDetalle?.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className="px-4 py-2 bg-[rgba(0,0,0,0.2)] text-white text-xs font-medium rounded-full">
                    {dataDetalle?.paquete?.tipo_paquete.nombre}
                  </span>
                </div>
                
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Button disabled className="cursor-pointer w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </Button>
                  <Button disabled className="cursor-pointer w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </Button>
                  <Button disabled className="cursor-pointer w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200">
                    <Download className="w-5 h-5 text-gray-600" />
                  </Button>
                  <Button
                    onClick={handleCloseVerDetalles}
                    className="cursor-pointer w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </Button>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-4xl font-bold text-white mb-2">
                        {dataDetalle?.paquete?.nombre}
                      </h1>
                      <div className="flex items-center text-white/90 text-lg">
                        <MapPin className="w-5 h-5 mr-2" />
                        <span>{dataDetalle?.paquete?.destino?.ciudad}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-5xl font-bold text-white mb-1">
                        {dataDetalle?.paquete?.moneda?.simbolo}{formatearSeparadorMiles.format(dataDetalle?.precio_unitario ?? 0)}
                      </div>
                      <div className="text-white/80">por persona</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-8">
                  <button
                    onClick={() => setActiveTab('general')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 cursor-pointer ${
                      activeTab === 'general'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Información General
                  </button>
                  <button
                    onClick={() => setActiveTab('passengers')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 cursor-pointer ${
                      activeTab === 'passengers'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Pasajeros ({dataDetalle?.habitacion?.capacidad})
                  </button>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 cursor-pointer ${
                      activeTab === 'payments'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Pagos y Finanzas
                  </button>
                </nav>
              </div>

              <DetallesReservaContainer 
                activeTab={activeTab} 
                reservaId={dataDetalle?.id ?? 0}
                onClose={handleCloseVerDetalles}
                />
            </div>
          </div>

        </Modal>}

      {onDesactivarData && 
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="modal-detalles-reserva bg-white/95 rounded-xl shadow-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto backdrop-blur-sm">
              {/* <div className="relative"> */}
                      <Modal onClose={handleCloseModal} claseCss="modal">
                        <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${dataADesactivar!.activo ? 'bg-red-100 dark:bg-red-900/20': 'bg-green-100 dark:bg-green-900/20'} `}>
                            {dataADesactivar!.activo && <IoWarningOutline className="h-8 w-8 text-red-600 dark:text-red-400" />}
                            {!dataADesactivar!.activo && <IoCheckmarkCircleOutline className="h-8 w-8 text-green-600 dark:text-green-400" />}
                        </div>
                        <h2 className='text-center'>Confirmacion de operación</h2>
                      <p className=' text-gray-600 dark:text-gray-400 mt-2 text-justify'>
                        ¿Estás seguro de que deseas {dataADesactivar!.activo ? 'desactivar' : 'activar'} la reserva  
                        <b>
                            {' ' + (dataADesactivar?.codigo ?? '')}
                        </b>? 
                      </p>

                      <div className='modal-actions'>
                          <Button className="hover:bg-transparent cursor-pointer bg-transparent text-gray-700" onClick={handleCloseModal}>Cancelar</Button>
                          <Button 
                          disabled={isPendingDesactivar}
                          className={`cursor-pointer ${dataADesactivar!.activo ? 'bg-red-500 hover:bg-red-600': 'bg-green-500 hover:bg-green-600'} flex justify-center 
                            items-center shadow-none hover:shadow-none`}
                            onClick={() => handleConfirmActivo(!dataADesactivar!.activo)}>
                              {!isPendingDesactivar ? 'Aceptar': 'Procesando..'}
                          </Button>
                      </div>
                  </Modal>
              {/* </div> */}
            </div>
        </div> 
        }

      <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                  <Bus className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-3xl font-semibold text-gray-900">Reservas</h1>
              </div>
              <p className="text-gray-600">Gestiona los datos de reservas del sistema y su estado.</p>
            </div>
            <div className="flex gap-3">
              {siTienePermiso("reservas", "exportar") &&
                <Button
                  variant="outline"
                  className="border-emerald-200 text-emerald-700 cursor-pointer hover:bg-emerald-50 bg-transparent"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              }

              {siTienePermiso("reservas", "crear") && 
              <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer"
                onClick={() => setActiveTabCatalogo('form')}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Reserva
              </Button>
              }
            </div>
          </div>

          {/* Stats Cards */}
          <ResumenCardsDinamico resumen={dataResumen} isFetchingResumen={isFetchingResumen} isErrorResumen={isErrorResumen}/>

          {/* Main Content */}
          <Tabs value={activeTabCatalogo} onValueChange={setActiveTabCatalogo} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-80 bg-gray-100">
              <TabsTrigger value="list" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white cursor-pointer">
                Lista de Reservas
              </TabsTrigger>
              <TabsTrigger 
                disabled={!siTienePermiso("reservas", "crear")} 
                value="form" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white cursor-pointer">
                Crear Reserva
              </TabsTrigger>
            </TabsList>

            {/* Registration Form Tab */}
            <TabsContent value="form">
              <form onSubmit={handleSubmit(!dataAEditar ? handleGuardarNuevaData: handleGuardarDataEditado)}>
                <Card className="border-emerald-200 pt-0">
                  <CardHeader className="bg-emerald-50 border-b border-emerald-200 pt-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-emerald-900">Crear Nueva Reserva</CardTitle>
                        <CardDescription className="text-emerald-700">
                          Complete la información para crear un nuevo reserva
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* PASO 1 SELECCION DE PAQUETES */}
                        <Card className="space-y-2 md:col-span-2">
                          <CardHeader>
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-semibold">
                                1
                              </div>
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  <Package className="h-5 w-5" />
                                  Seleccionar Paquete
                                </CardTitle>
                                <CardDescription>Elija el paquete turístico para la reserva. Filtra por nombre del paquete o destino</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {/* PAQUETE */}
                                <div className="space-y-2 mi-select-wrapper">
                                  <Label htmlFor="paquete" className="text-gray-700 font-medium">
                                    Paquete *
                                  </Label>

                                  <div className="space-y-2">
                                    <DinamicSearchSelect
                                        disabled={!!dataAEditar}
                                        dataList={newDataPaqueteList || []}
                                        value={selectedPaqueteID}
                                        onValueChange={setSelectedPaqueteID}
                                        setSelectedTitularData={setSelectedPaqueteData}
                                        handleDataNoSeleccionada={handleDataNoPaqueteSeleccionada}
                                        onSearchChange={setPaqueteBusqueda} // 🔹 Aquí se notifica el cambio de búsqueda
                                        isFetchingPersonas={isFetchingPaquete}
                                        placeholder="Buscar paquete..."
                                        labelKey="nombre"
                                        //
                                        secondaryLabelKey="destino_nombre"
                                        thirdLabelKey="modalidad"
                                        fourthLabelKey="tipo_paquete_nombre"
                                        valueKey="id"
                                      />
                                  </div>

                                    {(paqueteNoSeleccionada === false || (onGuardar === true && paqueteNoSeleccionada === undefined)) && (
                                      <p className="text-red-400 text-sm">Este campo es requerido</p>
                                    )}
                                </div>
                            </div>     
                          </CardContent>
                            
                        </Card>

                        {/* PASO 2 SELECCTOR DE SALIDAS */}
                        {selectedPaqueteData &&
                          <Card className="space-y-2 md:col-span-2">
                            <CardHeader>
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-semibold">
                                  2
                                </div>
                                <div>
                                  <CardTitle className="flex items-center gap-2">
                                    <CalendarDays className="h-5 w-5" />
                                    Seleccionar Fecha de Salida
                                  </CardTitle>
                                  <CardDescription>Elija la fecha de salida que prefiere el cliente</CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {/* SELECTOR DE FECHAS DE SALIDAS */}
                              <FechaSalidaSelectorContainer
                                esDistribuidor={!selectedPaqueteData.propio}
                                fechaSalidasList={selectedPaqueteData?.salidas}
                                fechaSeleccionada={selectedSalidaID}
                                onFechaSeleccionada={setSelectedSalidaID}
                              />
                            </CardContent>
                          </Card>
                        }


                        {/* PASO 3 HOTEL Y HABIRACIONES */}
                        {selectedPaqueteData && selectedSalidaID &&
                          <Card className="space-y-2 md:col-span-2">
                            <CardHeader>
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-semibold">
                                  3
                                </div>
                                <div>
                                  <CardTitle className="flex items-center gap-2">
                                    <CalendarDays className="h-5 w-5" />
                                    Seleccionar Hotel y Habitación
                                  </CardTitle>
                                  <CardDescription>Este paquete es flexible, seleccione el hotel y tipo de habitación</CardDescription>
                                </div>
                              </div>

                              {!selectedPaqueteData.propio && 
                                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-1 border-amber-300 rounded-lg p-3 shadow-md">
                                    <div className="flex items-start gap-4">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 flex-shrink-0">
                                        <Building2 className="h-5 w-5 text-amber-700" />
                                      </div>
                                      <div className="flex-1">
                                        <h3 className="font-bold text-base text-amber-900 mb-1">Paquete de Distribuidora</h3>
                                        <p className="text-sm text-amber-800 leading-relaxed">
                                          Este es un paquete de distribuidora. Los lugares están sujetos a confirmación y
                                          disponibilidad por parte de la agencia. Los cupos se verificarán al momento de la
                                          reserva.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                }
                            </CardHeader>
                            <CardContent className="h-[70vh] flex flex-col">

                                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg w-fit mb-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setViewModeHabitacionList('detailed')
                                    }}
                                    className={`
                                      flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all cursor-pointer
                                      ${viewModeHabitacionList === 'detailed'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                      }
                                    `}
                                  >
                                    <List className="w-4 h-4" />
                                    Lista Completa
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setViewModeHabitacionList('grouped')
                                    }}
                                    className={`
                                      flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all cursor-pointer
                                      ${viewModeHabitacionList === 'grouped'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                      }
                                    `}
                                  >
                                    <LayoutGrid className="w-4 h-4" />
                                    Vista por Hotel
                                  </button>
                                </div>
                                  

                                  {viewModeHabitacionList === 'grouped' ? 
                                    <HotelHabitacionSelector
                                      esDistribuidor={!selectedPaqueteData.propio}
                                      hoteles={hotelesPorSalida}
                                      habitaciones={habitacionesPorSalida}
                                      selectedHotelId={selectedHotelId}
                                      selectedHabitacionId={selectedTipoHabitacionID}
                                      selectedSalidaCupo={selectedSalidaData?.cupo ?? 0}
                                      isLoading={isFetchingHotelesList}
                                      onSelectHotel={(hotel) => {
                                        setSelectedHotelId(hotel.id);
                                        setSelectedHotelData(hotel);
                                        setSelectedTipoHabitacionID("");
                                      }}
                                      onSelectHabitacion={(habitacion) => {
                                        setSelectedTipoHabitacionID(habitacion.id);
                                        setSelectedTipoHabitacionData(habitacion);
                                      }}
                                    />
                                  :

                                  // <p></p>

                                  <>
                                  {/* <p>SelectedTipoHabitacionID: {JSON.stringify(selectedTipoHabitacionID)}</p>
                                  <p>SelectedHotelData: {JSON.stringify(selectedHotelData)}</p>
                                  <p>SelectedTipoHabitacionID: {JSON.stringify(selectedTipoHabitacionID)}</p>
                                  <p>SelectedTipoHabitacionData: {JSON.stringify(selectedTipoHabitacionData)}</p> */}
                                  <HotelHabitacionSelectorListMode
                                      hoteles={hotelesPorSalida}
                                      esDistribuidor={!selectedPaqueteData.propio}
                                      habitaciones={habitacionesPorSalida}
                                      habitacionesResumenPrecios={habitacionesResumenPrecios}
                                      selectedHotelId={selectedHotelId}
                                      selectedHabitacionId={selectedTipoHabitacionID}
                                      selectedSalidaCupo={selectedSalidaData?.cupo ?? 0}
                                      isLoading={isFetchingHotelesList}
                                      onSelectItem={({ hotel, habitacion }) => {
                                        setSelectedHotelId(hotel.id);
                                        setSelectedHotelData(hotel);

                                        //habitacion_id
                                        console.log(habitacionesResumenPrecios)

                                        // Buscar la habitación correspondiente en habitacionesPorSalida del hotel seleccionado
                                        const habitacionEnHotel = hotel.habitaciones?.find(
                                          (h: any) => h.id.toString() === habitacion.habitacion_id.toString()
                                        );

                                        //id
                                        console.log(habitacionEnHotel)

                                        const cotizacionDelHotelFiltered = habitacionesResumenPrecios.filter(resumen => resumen.habitacion_id === habitacionEnHotel.id)
                                        const cotizacion = cotizacionDelHotelFiltered[0];
                                        console.log(cotizacion);
                                        console.log(cotizacion.precio_moneda_alternativa);
                                        setCotizacionMonedaAlternativa(cotizacion.precio_moneda_alternativa);

                                        if (habitacionEnHotel) {
                                          setSelectedTipoHabitacionID(habitacionEnHotel.id.toString());
                                          setSelectedTipoHabitacionData(habitacionEnHotel);
                                        }
                                      }}
                                    />
                                  </>

                                    
                                  }
                            </CardContent>
                          </Card>
                        }

                        {/* PASO 4 INFORMACION DEL TITULAR */}
                        {selectedTipoHabitacionID &&
                          <Card className="space-y-2 md:col-span-2">
                            <CardHeader>
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-semibold">
                                  4
                                </div>
                                <div>
                                  <CardTitle className="flex items-center gap-2">
                                    <CalendarDays className="h-5 w-5" />
                                    Información del Titular
                                  </CardTitle>
                                  <CardDescription>
                                    Seleccione o ingrese los datos de la persona responsable de la reserva
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Columna izquierda: Titular */}
                                <div className="space-y-2 mi-select-wrapper">
                                  <Label htmlFor="persona" className="text-gray-700 font-medium">
                                    Titular *
                                  </Label>

                                  <DinamicSearchSelect
                                    disabled={!!dataAEditar}
                                    dataList={newDataPersonaList || []}
                                    value={selectedPersonaID}
                                    onValueChange={setSelectedPersonaID}
                                    setSelectedTitularData={setSelectedTitularData}
                                    handleDataNoSeleccionada={handleDataNoPersonaSeleccionada}
                                    onSearchChange={setPersonaBusqueda}
                                    isFetchingPersonas={isFetchingPersonas}
                                    placeholder="Buscar titular por documento o nombre..."
                                    labelKey='documento'
                                    secondaryLabelKey='documento'
                                    thirdLabelKey='tipo_documento_nombre'
                                    valueKey="id"
                                  />

                                  {(personaNoSeleccionada === false ||
                                    (onGuardar === true && personaNoSeleccionada === undefined)) && (
                                    <p className="text-red-400 text-sm">Este campo es requerido</p>
                                  )}
                                </div>

                                {/* Columna derecha: Checkbox */}
                                <div className="flex items-center justify-center">
                                  <Controller
                                    name="titularComoPasajero"
                                    control={control}
                                    defaultValue={false}
                                    render={({ field }) => (
                                      <div className="flex items-center gap-3 cursor-pointer">
                                        <Checkbox
                                          id="titularComoPasajero"
                                          // disabled={!selectedPaqueteID}
                                          checked={field.value}
                                          onCheckedChange={(checked) => field.onChange(!!checked)}
                                          className="cursor-pointer border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 data-[state=checked]:text-white"
                                        />
                                        <Label
                                          htmlFor="titularComoPasajero"
                                          className="cursor-pointer text-gray-700"
                                        >
                                          El titular también viaja (incluir como pasajero)
                                        </Label>
                                      </div>
                                    )}
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        }

                      
                      {/* PASO 5 SELECCION DE PASAJEROS */}
                      {selectedTipoHabitacionID && selectedPersonaID && 
                        <Card className="space-y-2 md:col-span-2">
                          <CardHeader>
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-semibold">
                                5
                              </div>
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  <CalendarDays className="h-5 w-5" />
                                  Pasajeros
                                </CardTitle>
                                <CardDescription>
                                  Gestione la lista de pasajeros para esta reserva
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent>
                              <div className="space-y-2 md:col-span-2">
                                {/* selectedTipoHabitacionData: {JSON.stringify(selectedTipoHabitacionData)}<br/> */}
                                {/* selectedTipoHabitacionID: {JSON.stringify(selectedTipoHabitacionID)} 
                                
                                habitacionesPorSalida */}
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    {habitacionesPorSalida.filter((h: any) => (h.id.toString() === selectedTipoHabitacionID.toString()))
                                      .map((h: any) => <p className="text-sm font-medium text-blue-900">
                                        Capacidad requerida: {h.capacidad} {h.capacidad === 1 ? "pasajero" : "pasajeros"}
                                      </p>)
                                    }
                                    <p className="text-xs text-blue-700 mt-0">
                                      {selectedPaqueteData.modalidad === "flexible" && selectedTipoHabitacionID
                                        ? "Establecido automáticamente según la habitación seleccionada"
                                        : "Cantidad de pasajeros para esta reserva"}
                                    </p>
                                </div>

                                <div className="pl-2">
                                  <p className="text-sm font-medium text-gray-900">
                                    Pasajeros Seleccionados:  
                                      <span className="pl-1">{cantidadActualPasajeros} de {selectedTipoHabitacionData.capacidad}</span>
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {cantidadActualPasajeros === selectedTipoHabitacionData.capacidad ? (
                                      <span className="text-green-600 font-medium flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Todos los pasajeros han sido seleccionados
                                      </span>
                                    ) : (
                                      `Faltan ${selectedTipoHabitacionData.capacidad - cantidadActualPasajeros} 
                                      ${cantidadActualPasajeros === 1 ? "pasajero" : "pasajeros"} por seleccionar`
                                    )}
                                  </p>
                                </div>

                                {/* Mostrar titular como pasajero si está marcado */}
                                      {titularComoPasajero && selectedTitularData && (
                                        <div className="mb-6 mt-6">
                                          <h3 className="text-lg font-medium text-gray-900 mb-4">Titular (incluido como pasajero)</h3>
                                          <div className="p-4 bg-blue-50 rounded-lg">
                                            <div className="flex items-center space-x-4">
                                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <Crown className="w-5 h-5 text-blue-600" />
                                              </div>
                                              <div>
                                                <p className="font-medium text-gray-900">
                                                  {selectedTitularData.nombre}
                                                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">Titular</span>
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                  {/* {DOCUMENT_TYPES[formData.persona.tipo_documento || 'cedula']}: {formData.persona.numero_documento} */}
                                                  {selectedTitularData.documento}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                              </div>

                                <div className="space-y-2 md:col-span-2">
                                  <div className="flex gap-2 flex-wrap mt-8">
                                      {Array.from({ length: selectedTipoHabitacionData.capacidad }).map((_, index) => {
                                        const cantidad = Number(cantidadActualPasajeros ?? 0);

                                        let isFilled = false;

                                        if (titularComoPasajero) {
                                          // Si hay titular incluido:
                                          // - el slot 0 es siempre el titular (ocupado)
                                          // - los pasajeros adicionales ocupan los índices 1..cantidad
                                          if (index === 0) {
                                            isFilled = true;
                                          } else {
                                            // índices 1..cantidad deben marcarse si cantidad >= 1
                                            // isFilled = false;
                                            isFilled = index < cantidad;
                                          }
                                        } else {
                                          // Si no hay titular incluido:
                                          // - ocupados son índices 0..cantidad-1 (cantidad pasajeros)
                                          isFilled = index < cantidad;
                                        }

                                        const isHolderSlot = titularComoPasajero && index === 0;
                                        const passengerNumber = titularComoPasajero ? index : index + 1;
                                        const label = isHolderSlot ? "Titular" : `Pasajero ${passengerNumber}`;

                                        return (
                                          <div
                                            key={index}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                                              isFilled
                                                ? "border-blue-200 bg-blue-50"
                                                : "border-dashed border-gray-300 bg-gray-50"
                                            }`}
                                          >
                                            {isFilled ? (
                                              <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                            ) : (
                                              <Circle className="h-4 w-4 text-gray-400" />
                                            )}
                                            <span className="text-sm font-medium text-gray-700">{label}</span>
                                          </div>
                                        );
                                      })}
                                  </div>

                                    {selectedPasajerosData && selectedPasajerosData.length > 0 && (
                                        <div className="mb-6">
                                          <h3 className="text-lg font-medium text-gray-900 mb-4">Pasajeros Agregados</h3>
                                          <div className="space-y-3 max-h-95 overflow-y-auto">
                                            {selectedPasajerosData.map((pasajero: any) => (
                                              <div key={pasajero.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div className="flex items-center space-x-4">
                                                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-blue-600" />
                                                  </div>
                                                  <div>
                                                    <p className="font-medium text-gray-900">
                                                      {/* {getPrimerNombreApellido(pasajero.nombre, pasajero.apellido)} */}
                                                      {pasajero.nombre} {pasajero.apellido}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                      {pasajero.tipo_documento.nombre}: {pasajero.documento}
                                                    </p>
                                                  </div>
                                                </div>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      handlePasajeroToggle(pasajero.id, pasajero)
                                                    }}
                                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                                  >
                                                    <X className="w-4 h-4" />
                                                  </button>
                                                {/* )} */}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                </div>


                                {/* cantidadActualPasajeros: {JSON.stringify(cantidadActualPasajeros)}<br/>
                                selectedTipoHabitacionData: {JSON.stringify(selectedTipoHabitacionData)}<br/>
                                selectedTipoHabitacionData.capacidad: {JSON.stringify(selectedTipoHabitacionData.capacidad)}<br/>
                                cantidadActualPasajeros !== selectedTipoHabitacionData.capacidad: {JSON.stringify(cantidadActualPasajeros !== selectedTipoHabitacionData.capacidad)}<br/> */}

                              {selectedTipoHabitacionData && 
                                cantidadActualPasajeros !== selectedTipoHabitacionData.capacidad &&
                                <div className={`space-y-2 md:col-span-2 ${(cantidadActualPasajeros === 0 || cantidadActualPasajeros === 1 && titularComoPasajero) ? 'mt-8' : ''}`}>
                                    <Label className="text-gray-700 font-medium">Seleccione los pasajeros *</Label>

                                    {/* INPUT DE BUQUEDA DE PASAJERO */}
                                    <div className="relative mb-4">
                                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                      <Input
                                        placeholder="Buscar pasajeros por documento o nombre..."
                                        disabled={cantidadActualPasajeros === selectedTipoHabitacionData.capacidad}
                                        value={pasajerosSearchTerm}
                                        onChange={(e) => setPasajerosSearchTerm(e.target.value)}
                                        className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                      />
                                    </div>

                                    {/* PASAJEROS SELECCIONADOS */}
                                    {selectedPasajeros.length > 0 && (
                                      <div className="flex items-center gap-2 mb-3">
                                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                          {selectedPasajeros.length} pasajeros seleccionados
                                        </Badge>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setSelectedPasajeros([])}
                                          className="text-red-600 border-red-200 hover:bg-red-50"
                                        >
                                          <X className="h-3 w-3 mr-1" />
                                          Limpiar selección
                                        </Button>
                                      </div>
                                    )}

                                    {/* <div>
                                      dataPasajerosList: {JSON.stringify(dataPasajerosList)}
                                    </div> */}
                                    
                                    <div
                                        className={`grid grid-cols-1 ${
                                          pasajerosSearchTerm && (!isFetchingPasajeros && !startDebounce)
                                            ? 'md:grid-cols-2'
                                            : 'md:grid-cols-1'
                                        } gap-4 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4 w-full`}
                                      >
                                        {/* Loader */}
                                        {(isFetchingPasajeros || startDebounce) && (
                                          <div className="w-full flex items-center justify-center h-56">
                                            <Loader2Icon className="animate-spin w-10 h-10 text-gray-300" />
                                          </div>
                                        )}

                                        {/* Lista de resultados */}
                                        {pasajerosSearchTerm &&
                                          !isFetchingPasajeros &&
                                          !startDebounce &&
                                          dataPasajerosList &&
                                          dataPasajerosList.length > 0 &&
                                          dataPasajerosList
                                      
                                            .map((persona: any) => (
                                              <div
                                                key={persona.id}
                                                className={`relative cursor-pointer duration-200 hover:shadow-sm flex 
                                                  items-start p-3 rounded-lg hover:bg-gray-50 transition-colors
                                                  border border-gray-200
                                                  ${
                                                    selectedPasajeros.includes(persona.id)
                                                      ? 'ring-2 ring-blue-200 bg-blue-50/50 border-blue-200'
                                                      : ''
                                                  }`}
                                              >
                                                <div className="flex items-start w-full">
                                                  <div className="flex-shrink-0 mr-3 mt-0.5">
                                                    <Checkbox
                                                      id={`servicio-${persona.id}`}
                                                      checked={selectedPasajeros.includes(persona.id)}
                                                      onCheckedChange={() => handlePasajeroToggle(persona.id, persona)}
                                                    />
                                                  </div>
                                                  <div className="flex-1 min-w-0">
                                                    <Label
                                                      htmlFor={`servicio-${persona.id}`}
                                                      className="text-sm font-medium text-gray-900 cursor-pointer block"
                                                    >
                                                      {persona.nombre} {persona.apellido}
                                                    </Label>
                                                    <p className="text-xs text-gray-500 mt-1">{persona.descripcion}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                                        {persona.documento}
                                                      </Badge>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}

                                        {/* Mensaje inicial */}
                                        {!pasajerosSearchTerm && (
                                          <div
                                            className={`relative flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors
                                              border border-gray-200 w-full text-center`}
                                          >
                                            <div className="flex justify-center items-center w-full h-56 text-gray-500">
                                              Filtre una persona a través de su nombre o documento
                                            </div>
                                          </div>
                                        )}

                                        {/* Sin resultados */}
                                        {!isFetchingPasajeros &&
                                          !startDebounce &&
                                          pasajerosSearchTerm &&
                                          dataPasajerosList &&
                                          dataPasajerosList.length === 0 && ( 
                                            <div className="col-span-2 text-center py-8">
                                              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                <Search className="h-6 w-6 text-gray-400" />
                                              </div>
                                              <p className="text-gray-500 text-sm">
                                                No se encontraron pasajeros que coincidan con "{pasajerosSearchTerm}"
                                              </p>
                                              <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPasajerosSearchTerm('')}
                                                className="mt-2"
                                              >
                                                Limpiar búsqueda
                                              </Button>
                                            </div>
                                          )}
                                      </div>

                                </div>
                              } 
                          </CardContent>
                        </Card>
                      }


                      <div>
                        {/* cantidadActualPasajeros: {JSON.stringify(cantidadActualPasajeros)}<br/> */}
                        {/* selectedTipoHabitacionData: {JSON.stringify(selectedTipoHabitacionData)}<br/> */}
                        {/* SelectedSalidaData: {JSON.stringify(selectedSalidaData)}<br/>
                        SelectedSalidaData: {JSON.stringify(selectedSalidaData?.fecha_salida)}<br/>
                        SelectedSalidaData: {JSON.stringify(selectedSalidaData?.fecha_regreso)}<br/> */}
                        {/* selectedPaqueteData: {JSON.stringify(selectedPaqueteData)}<br/> */}
                      </div>


                       {/* PASO 6 INFORMACION DEL TITULAR */}
                        {selectedPaqueteID && selectedTipoHabitacionID && selectedPersonaID &&
                          <Card className="space-y-2 md:col-span-2">
                            <CardHeader>
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-semibold">
                                  6
                                </div>
                                <div>
                                  <CardTitle className="flex items-center gap-2">
                                    <CalendarDays className="h-5 w-5" />
                                    Servicios
                                  </CardTitle>
                                  <CardDescription>
                                    Revise los servicios incluidos. Puedes agregar servicios opcionales si posterior a la reservacíon
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-3">
                                  {selectedPaqueteData.servicios.map((service: any) => (
                                    <div
                                      key={service.servicio_id}
                                      className="bg-green-50 border border-green-200 rounded-lg p-3"
                                    >

                                      <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
                                          <CheckCircle className="w-5 h-5 text-green-700" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                            {service.nombre_servicio}
                                          </h4>
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded">
                                              Incluido
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* <div className="space-y-2 md:col-span-2 mt-6"> */}
                                    {/* 
                                    <Label className="text-gray-700 font-medium">Servicios Adicionales Opcionales</Label>
    
                                    
                                    <div className="relative mb-4">
                                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                      <Input
                                        placeholder="Buscar servicios..."
                                        value={serviciosAdicionalesSearchTerm}
                                        onChange={(e) => setServiciosAdicionalesSearchTerm(e.target.value)}
                                        className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                      />
                                    </div> */}
    
                                    
                                    {/* {selectedServiciosAdicionales.length > 0 && (
                                      <div className="flex items-center gap-2 mb-3">
                                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                          {selectedServiciosAdicionales.length} servicios seleccionados
                                        </Badge>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setSelectedServiciosAdicionales([])}
                                          className="text-red-600 border-red-200 hover:bg-red-50"
                                        >
                                          <X className="h-3 w-3 mr-1" />
                                          Limpiar selección
                                        </Button>
                                      </div>
                                    )} */}
    
                                    
                                    {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4 w-full">
                                      {isFetchingServicios && <div className="w-full flex items-center justify-center">
                                        <Loader2Icon className="animate-spin w-10 h-10 text-gray-300"/>
                                      </div>}
    
                                      {!isFetchingServicios && dataServiciosList && dataServiciosList
                                          .filter((servicio: any) => 
                                            
                                            servicio.nombre.toLowerCase().includes(serviciosAdicionalesSearchTerm.toLowerCase())
                                          
                                          )
                                          .map((servicio: any) => (
                                            <div
                                              key={servicio.id}
                                              className={`relative cursor-pointer duration-200 hover:shadow-sm flex 
                                                        items-start p-3 rounded-lg hover:bg-gray-50 transition-colors
                                                        border border-gray-200
                                                        ${selectedServiciosAdicionales.includes(servicio.id) 
                                                          ? 'ring-2 ring-blue-200 bg-blue-50/50 border-blue-200' 
                                                          : ''}`}
                                            >
                                              <div className="flex items-center justify-center w-full">
                                                  <div className="flex items-start w-full">
                                                    <div className="flex-shrink-0 mr-3 mt-0.5">
                                                      <Checkbox
                                                        id={`servicio-${servicio.id}`}
                                                        checked={selectedServiciosAdicionales.includes(servicio.id)}
                                                        onCheckedChange={() => handleServicioToggle(servicio.id)}
                                                      />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                      <Label
                                                        htmlFor={`servicio-${servicio.id}`}
                                                        className="text-sm font-medium text-gray-900 cursor-pointer block"
                                                      >
                                                        {servicio.nombre}
                                                        {selectedServiciosAdicionales.includes(servicio.id) && selectedPaqueteData.propio &&
                                                          <div className="col-span-2 flex gap-2 mt-2">  
                                                            <div>
                                                              <Input
                                                                  id="precio_base"
                                                                  type="text"
                                                                  value={servicio?.precio}
                                                                  disabled
                                                                  {...register('precio_base', )
                                                                    }
                                                                    placeholder="150"
                                                                    className={`h-8 flex-1 border-2 border-blue-200 focus:border-blue-500
                                                                      disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
                                                                />
                                                                <Label className="block text-xs font-light text-gray-700 mb-1">
                                                                  Precio por defecto
                                                                </Label>
                                                            </div>
                                                                
                                                            <div>
                                                              <Controller
                                                                name={`precio_personalizado_servicio_${servicio.id}`}   // 🔹 campo único por servicio
                                                                control={control}
                                                                defaultValue={''}
                                                                rules={{
                                                                  validate: (value) => {
                                                                    // ⚡ Solo validamos si tiene un valor
                                                                    if (value !== null && value !== undefined && value !== '' && isNaN(Number(value))) {
                                                                      return 'Valor inválido';
                                                                    }
                                                                    return true;
                                                                  },
                                                                }}
                                                                render={({ field, fieldState: { error } }) => (
                                                                  <div className="flex flex-col">
                                                                    <NumericFormat
                                                                      value={field.value ?? ''} 
                                                                      onValueChange={(values) => {
                                                                        field.onChange(values.floatValue ?? null);
                                                                      }}
                                                                      onBlur={field.onBlur}
                                                                      thousandSeparator="."
                                                                      decimalSeparator=","
                                                                      placeholder="50 $"
                                                                      className={`flex-1 p-1 pl-2.5 rounded-md border-2 ${
                                                                        error
                                                                          ? 'border-red-400 focus:!border-red-400 focus:ring-0 outline-none'
                                                                          : 'border-blue-200 focus:border-blue-500'
                                                                      }`}
                                                                    />
                                                                    {error && (
                                                                      <span className="text-red-400 text-xs mt-1">{error.message}</span>
                                                                    )}
                                                                  </div>
                                                                )}
                                                              />
    
    
                                                              <Label className="block text-xs font-light text-gray-700 mb-1">
                                                                Precio personalizado
                                                              </Label>
                                                            </div>
                                                          </div>
                                                        }
                                                      </Label>
                                                    </div>
    
                                                  </div>
                                                  <span onClick={() => handleServicioToggle(servicio.id, servicio?.precio ?? 0)}>
                                                    {selectedServiciosAdicionales.includes(servicio.id) ?
                                                      <Trash2 className="text-red-400 w-7 h-7 hover:bg-red-100 rounded-sm p-1" /> :
                                                      <CirclePlus className="text-blue-400 w-7 h-7 hover:bg-blue-100 rounded-sm p-1" />
                                                    }
                                                  </span>
                                              </div>
                                            </div>
                                          ))}
                                                                
                                      {dataServiciosList && dataServiciosList.filter(
                                        (servicio: any) =>
                                          servicio.nombre.toLowerCase().includes(serviciosAdicionalesSearchTerm.toLowerCase())
                                      ).length === 0 && (
                                        <div className="col-span-2 text-center py-8">
                                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                            <Search className="h-6 w-6 text-gray-400" />
                                          </div>
                                          <p className="text-gray-500 text-sm">
                                            No se encontraron servicios que coincidan con "{serviciosAdicionalesSearchTerm}"
                                          </p>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setServiciosAdicionalesSearchTerm("")}
                                            className="mt-2"
                                          >
                                            Limpiar búsqueda
                                          </Button>
                                        </div>
                                      )}
      
                                    </div> */}
    
                                    {/* <div className="flex items-center gap-2 pt-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
    
                                          const filteredPermissions = dataServiciosList.filter(
                                            (servicio: any) =>
                                              servicio.nombre.toLowerCase().includes(serviciosAdicionalesSearchTerm.toLowerCase())
                                          )
                                          const allFilteredSelected = filteredPermissions.every((p: any) =>
                                            selectedServiciosAdicionales.includes(p.id),
                                          )
    
                                          console.log('allFilteredSelected: ', allFilteredSelected )
    
                                          if (allFilteredSelected) {
                                            setSelectedServiciosAdicionales((prev) =>
                                              prev.filter((id) => !filteredPermissions.map((p: any) => p.id).includes(id)),
                                            )
                                          } else {
                                            const newSelections = filteredPermissions
                                              .map((p:any) => p.id)
                                              .filter((id:any) => !selectedServiciosAdicionales.includes(id))
                                            setSelectedServiciosAdicionales((prev) => [...prev, ...newSelections])
                                          }
                                        }}
                                        className="cursor-pointer text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                      >
                                        <Check className="h-3 w-3 mr-1" />
                                        {dataServiciosList && dataServiciosList
                                          .filter(
                                            (servicio: any) =>
                                              servicio.nombre.toLowerCase().includes(serviciosAdicionalesSearchTerm.toLowerCase())
                                          )
                                          .every((p: any) => selectedServiciosAdicionales.includes(p.id))
                                          ? "Deseleccionar todos"
                                          : "Seleccionar todos"}{" "}
                                        
                                      </Button>
  
                                      {onGuardar && selectedServiciosAdicionales.length ===0 && <span className='text-red-400 text-sm'>Debes seleccinar al menos un servicio</span>}
                                    </div> */}
    
                                  
                                {/* </div> */}
                            </CardContent>
                          </Card>
                        }


                      {/* PASO 7 RESUMEN DE LOS PRECIOS */}
                      {/* {cantidadActualPasajeros && cantidadActualPasajeros === selectedTipoHabitacionData?.capacidad && ( */}
                      {selectedPaqueteID && selectedTipoHabitacionID && selectedPersonaID && (
                        <div className="space-y-2 md:col-span-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-300">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Resumen de Reserva</h2>
                            {/* <DollarSign className="w-8 h-8 text-blue-600" /> */}
                            <span className="text-blue-600 font-bold text-2xl">{selectedSalidaData.moneda.simbolo} {selectedSalidaData.moneda.nombre}</span>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">Paquete:</span>
                              <span className="font-medium">{selectedPaqueteData?.nombre}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">Duración:</span>
                              <span className="font-medium">{getDaysBetweenDates(selectedSalidaData?.fecha_salida, selectedSalidaData?.fecha_regreso)} días</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">Fecha de salida:</span>
                              <span className="font-medium">{formatearFecha(selectedSalidaData?.fecha_salida, false)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">Fecha de regreso:</span>
                              <span className="font-medium">{formatearFecha(selectedSalidaData?.fecha_regreso, false)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">Número de personas:</span>
                              <span className="font-medium">{selectedTipoHabitacionData?.capacidad}</span>
                            </div>
                            {/* {selectedHotel && selectedRoomType && ( */}
                            {selectedHotelId && selectedTipoHabitacionID && (
                              <>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-700">Hotel:</span>
                                  {/* <span className="font-medium">{selectedHotel.name}</span> */}
                                  <span className="font-medium">{selectedHotelData.nombre}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-700">Habitación:</span>
                                  <span className="font-medium">{selectedTipoHabitacionData.tipo}</span>
                                </div>
                              </>
                            )}
                            {/* {selectedPackage?.includedServices.length > 0 && ( */}
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-700">Servicios incluidos:</span>
                                {/* <span className="font-medium">{selectedPackage.includedServices.length}</span> */}
                                <span className="font-medium">{selectedPaqueteData?.servicios.length}</span>
                              </div>
                            {/* )} */}
                          </div>

                          <div className="border-t-2 border-blue-300 pt-4">
                            <div className="flex justify-between items-center">
                              {/* Título y selector */}
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-gray-900">Seña Mínima:</span>
                              </div>

                              {/* Bloque de monto */}
                              <div className="flex items-center justify-end gap-1 w-40">
                                {/* Mostrar input editable solo si: no es TOTAL y está en modo edición */}
                                {paymentType !== 'total' && isEditingSena ? (
                                  <>
                                    
                                  </>
                                ) : (
                                  <>
                                    {/* Si paymentType = total, se muestra el monto total bloqueado */}
                                    <span
                                      className={`text-3xl font-bold ${
                                        paymentType === 'total' ? 'text-green-600' : 'text-blue-600'
                                      }`}
                                    >
                                      {selectedSalidaData.moneda.simbolo}{formatearSeparadorMiles.format(
                                        paymentType === 'total'
                                          ? Number(precioFinalPorPersona ?? 0) *
                                            Number(selectedTipoHabitacionData?.capacidad ?? 0)
                                          : Number(montoInicialAAbonar ?? 0) *
                                            Number(selectedTipoHabitacionData?.capacidad ?? 0)
                                      )}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                              

                            <p className="text-xs text-muted-foreground text-right">Precio en {selectedSalidaData?.precio_moneda_alternativa?.moneda} <span className="text-gray-900 font-bold">{formatearSeparadorMiles.format(selectedSalidaData?.precio_moneda_alternativa?.senia ?? 0)}</span></p> 
                            <p className="text-xs text-gray-600 text-right mt-1">
                              {formatearSeparadorMiles.format(Number(selectedSalidaData?.senia ?? 0))}{' '}
                              por persona 
                            </p>
                          </div>



                          <div className="border-t-2 border-blue-300 pt-4">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-gray-900">Precio Total:</span>
                              <span className="text-3xl font-bold text-green-600">
                                {selectedSalidaData.moneda.simbolo}{formatearSeparadorMiles.format(
                                  precioFinalPorPersona * Number(selectedTipoHabitacionData?.capacidad ?? 0)
                                )}
                              </span>
                            </div>

                            <p className="text-xs text-muted-foreground text-right">Precio en {cotizacionMonedaAlternativa?.moneda} <span className="text-gray-900 font-bold">{formatearSeparadorMiles.format(cotizacionMonedaAlternativa?.precio_venta_final ?? 0)}</span></p> 
                            <p className="text-xs text-gray-600 text-right mt-1">
                              {formatearSeparadorMiles.format(precioFinalPorPersona)} por persona
                            </p>
                          </div>

                          <div className="mt-5 bg-gradient-to-r from-amber-50 to-orange-50 border-1 border-amber-300 rounded-lg p-3 shadow-md">
                            <p className="text-balance text-sm text-amber-900 mb-1">
                              <strong>Nota:</strong> Al crear la reserva, esta quedará en estado pendiente de seña. En el siguiente paso
                              podrás optar por pagar la seña, pagar el total, o dejar la reserva pendiente para pagar más tarde.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Estado de la Reserva</h2>
                      
                        <div>
                          <Label htmlFor="estado" className="text-gray-700 font-medium">
                            Estado *
                          </Label>
                          <Controller
                              name="estado"
                              control={control}
                              rules={{ required: "Este campo es requerido" }}
                              render={({ field }) => (
                                <div className="w-full min-w-0 select-container">
                                  <Select
                                    value={field.value}
                                    onValueChange={(value) => {
                                              field.onChange(value)
                                              if (value) {
                                                clearErrors("estado") // Limpia el error cuando selecciona un valor
                                              }
                                            }}
                                    onOpenChange={(open) => {
                                        if (!open && !field.value) {
                                          field.onBlur(); 
                                        }
                                      }}
                                  >
                                    <SelectTrigger 
                                      className="cursor-pointer border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                                      <SelectValue placeholder="Selecciona el tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pendiente">
                                        <div className="flex items-center gap-2">
                                          <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                                          Pendiente
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="confirmada">
                                        <div className="flex items-center gap-2">
                                          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                          Confirmada
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="incompleta">
                                        <div className="flex items-center gap-2">
                                          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                          Incompleta
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="finalizada">
                                        <div className="flex items-center gap-2">
                                          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                          Finalizada
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="cancelada">
                                        <div className="flex items-center gap-2">
                                          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                          Cancelada
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            />
                            {errors.estado && (
                              <p className="text-red-400 text-sm">{errors.estado.message as string}</p>
                            )}

                          <p className="text-sm text-gray-500 mt-2">
                            <strong>Estados:</strong><br/>
                            • <strong>Pendiente:</strong> Reserva creada, sin pago<br/>
                            • <strong>Confirmada:</strong> Pago realizado, cupo asegurado<br/>
                            • <strong>Incompleta:</strong> Confirmada pero faltan datos de pasajeros<br/>
                            • <strong>Finalizada:</strong> Todo completo: pasajeros + pago<br/>
                            • <strong>Cancelada:</strong> Reserva cancelada
                          </p>
                        </div>
                      </div> */}
                    </div>

                    {/* CONTROLES DE BOTONES */}
                    <div className="flex gap-3">
                      {/* {isPendingReservation && <>
                      </>} */}

                      {!dataAEditar &&
                        <Button 
                            onClick={() => {
                              console.log('paqueteNoSeleccionada 1: ', paqueteNoSeleccionada);
                              setOnGuardar(true)
                              
                              if(paqueteNoSeleccionada === undefined){
                                  console.log('paqueteNoSeleccionada 2: ', paqueteNoSeleccionada);
                                  setPaqueteNoSeleccionada(false);
                                }
                            }}
                            disabled={isPendingReservation}
                            type="submit"
                            className="bg-emerald-500 hover:bg-emerald-600 cursor-pointer">
                          {isPendingReservation ? 
                              <>
                                  <Loader2Icon className="animate-spin w-10 h-10 text-gray-300"/>
                                  Creando...
                              </> : 
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Crear Reserva  
                              </>}
                        </Button>
                      }
                      {dataAEditar &&
                        <Button 
                          disabled={isPendingEdit}
                          type="submit"
                          className="bg-emerald-500 hover:bg-emerald-600 cursor-pointer">
                        {isPendingEdit ? 
                            <>
                                <Loader2Icon className="animate-spin w-10 h-10 text-gray-300"/>
                                Guardando...
                            </> : 
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Guardar Reserva  
                            </>}
                      </Button>}

                      <Button
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent cursor-pointer"
                        onClick={() => {
                            setSelectedPasajeros([])
                            setPasajerosSearchTerm("")
                            handleCancel()
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </form>
            </TabsContent>

            {/* Permissions List Tab */}
            <TabsContent value="list">
              <Card className="border-blue-200 pt-0">
                <CardHeader className="bg-blue-50 border-b border-blue-200 pt-8">
                  <div className="flex flex-col items-start justify-between">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-blue-900">Lista de Reserva</CardTitle>
                          <CardDescription className="text-blue-700">
                            Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} reservas
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 w-4/6">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <Button
                              variant={viewMode === "table" ? "default" : "ghost"}
                              size="sm"
                              onClick={() => setViewMode("table")}
                              className={`${viewMode === "table" ? "bg-emerald-500 text-white" : "text-gray-600"} font-sans`}
                            >
                              <Table2 className="h-4 w-4 mr-1" />
                              Tabla
                            </Button>
                            <Button
                              variant={viewMode === "cards" ? "default" : "ghost"}
                              size="sm"
                              onClick={() => setViewMode("cards")}
                              className={`${viewMode === "cards" ? "bg-emerald-500 text-white" : "text-gray-600"} font-sans`}
                            >
                              <Grid3X3 className="h-4 w-4 mr-1" />
                              Cards
                            </Button>
                          </div>

                          <div className="flex items-center gap-2 bg-emerald-50 rounded-full px-3 py-2 border border-emerald-200">
                            <Switch
                              checked={showActiveOnly}
                              onCheckedChange={handleActiveOnly}
                              id="active-filter"
                              className="data-[state=checked]:bg-emerald-500"
                            />
                            <Label htmlFor="active-filter" className="text-sm text-emerald-700 font-medium">
                              Solo activos
                            </Label>
                          </div>


                          {/* <Select 
                              value={filtros.tipo_paquete}
                              onValueChange={(val) => setFiltros({ ...filtros, tipo_paquete: val })}>
                              <SelectTrigger className="cursor-pointer w-40 border-blue-200 focus:border-blue-500">
                                <SelectValue placeholder="Tipo Persona" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                {tipoReservaFilterList && 
                                  tipoReservaFilterList.map((tipoPaquete: any) => 
                                  <SelectItem key={tipoPaquete.nombre} value={tipoPaquete.nombre}>{tipoPaquete.nombre}</SelectItem>
                                  )}
                              </SelectContent>
                            </Select>  */}
                          
                              <Select 
                                value={filtros.estado}
                                onValueChange={(val) => setFiltros({ ...filtros, estado: val })}>
                                <SelectTrigger className="cursor-pointer w-40 border-blue-200 focus:border-blue-500">
                                  <SelectValue placeholder="Propiedad" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">Todos</SelectItem>
                                  <SelectItem value="pendiente">Pendiente</SelectItem>
                                  <SelectItem value="confirmada">Confirmada</SelectItem>
                                  {/* <SelectItem value="incompleta">Incompleta</SelectItem> */}
                                  <SelectItem value="finalizada">Finalizada</SelectItem>
                                  <SelectItem value="cancelada">Cancelada</SelectItem>
                                </SelectContent>
                              </Select> 


                          <div className="relative w-6/8">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Buscar por nombre del titular, nombre de paquete..."
                              value={nombreABuscar}
                              onChange={(e) => setNombreABuscar(e.target.value)}
                              className="pl-10 w-full border-gray-300 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                    <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-blue-200 w-full flex-wrap">

                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-gray-600 font-medium">Fecha Reserva desde:</Label>
                        <Input
                          type="date"
                          value={filtros.fecha_desde}
                          onChange={(e) => setFiltros({...filtros, fecha_desde: e.target.value})}
                          className="w-40 border-blue-200 focus:border-blue-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-gray-600 font-medium">Fecha Reserva hasta:</Label>
                        <Input
                          type="date"
                          value={filtros.fecha_hasta}
                          onChange={(e) => setFiltros({...filtros, fecha_hasta: e.target.value})}
                          className="w-40 border-blue-200 focus:border-blue-500"
                        />
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFiltros({
                            activo: true,   // null = todos, true = solo activos
                            fecha_desde: "",
                            fecha_hasta: "",
                            nombre: "",
                            estado: "all",
                          });
                          setNombreABuscar(""); 
                        }}
                      className="cursor-pointer border-gray-300 text-gray-600 hover:bg-gray-50"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Limpiar filtros 
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {viewMode === "table" ? 
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableHead className="flex items-center justify-center w-10 font-semibold text-gray-700">#</TableHead>
                          <TableHead className="font-semibold text-gray-700 min-w-[120px]">Numéro</TableHead>
                          <TableHead className="font-semibold text-gray-700 min-w-[150px]">Titular</TableHead>
                          <TableHead className="font-semibold text-gray-700 min-w-[280px]">Paquete</TableHead>
                          <TableHead className="font-semibold text-gray-700 min-w-[140px]">Código Paquete</TableHead>
                          <TableHead className="font-semibold text-gray-700 min-w-[100px]">Pasajeros</TableHead>
                          <TableHead className="font-semibold text-gray-700 min-w-[120px]">Estado</TableHead>
                          <TableHead className="font-semibold text-gray-700 min-w-[150px]">Pago</TableHead>
                          <TableHead className="font-semibold text-gray-700 min-w-[130px]">Precio Unitario</TableHead>
                          <TableHead className="font-semibold text-gray-700 min-w-[140px]">Modalidad Factura</TableHead>
                          <TableHead className="font-semibold text-gray-700 min-w-[130px]">Condicion Pago</TableHead>
                          <TableHead className="w-20 font-semibold text-gray-700">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="w-full">
                        {isFetching && <TableRow className="w-full">
                                      <TableCell className="w-full absolute top-5/12">
                                        <div className="w-full flex items-center justify-center">
                                          <Loader2Icon className="animate-spin w-10 h-10 text-gray-500"/>
                                        </div>
                                      </TableCell>
                                    </TableRow>}
                        {!isFetching && dataList && dataList.length > 0 && siTienePermiso("reservas", "leer") && dataList.map((data: Reserva) => (
                          <TableRow
                            key={data.id}
                            className={`hover:bg-blue-50 transition-colors cursor-pointer`}
                          >
                            <TableCell>
                              <div>
                                <div className="font-medium text-gray-900 pl-2">{data?.numero}</div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div>
                                <div className="font-medium text-gray-900 pl-2">{data?.codigo}</div>
                                <div className="text-sm text-gray-500 truncate max-w-xs pl-2">{formatearFecha(data?.fecha_reserva, false)}</div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div>
                                <div className="font-medium text-gray-900 truncate max-w-xs">{data?.titular?.nombre}</div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">{data?.titular?.documento}</div>
                              </div>
                            </TableCell>

                            <TableCell className="min-w-[280px]">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={data?.paquete?.imagen ?? imagePreview}
                                  alt={data?.paquete?.nombre}
                                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-gray-900 truncate max-w-[200px]">{data?.paquete?.nombre}</div>
                                  <div className="text-sm text-gray-500 truncate max-w-[200px]">
                                    {data?.paquete?.destino?.ciudad}, {data?.paquete?.destino?.pais}
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="min-w-[140px]">
                                <div className="font-medium text-gray-900">{data?.paquete_codigo || '-'}</div>
                            </TableCell>

                            <TableCell>
                              <div>
                                    {/* <span>10/{data.cantidad_pasajeros}</span> */}
                                <div className="font-medium text-gray-900 flex items-start gap-1.5 truncate max-w-xs">
                                  <RiGroupLine className="h-4 w-4 text-gray-400" />
                                  <span >{data?.cantidad_pasajeros}</span>
                                </div>
                                {/* <div className="text-sm text-gray-500 truncate max-w-xs">{data.paquete.destino.pais.nombre}</div> */}
                              </div>
                            </TableCell>

                            <TableCell>
                              <div>
                                <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${RESERVATION_STATES[data.estado]?.color || 'bg-gray-100 text-gray-800'}`}
                                >
                                  {RESERVATION_STATES[data.estado]?.icon || '❔'} {data.estado_display || RESERVATION_STATES[data.estado]?.label}
                                </span>
                                {/* {RESERVATION_STATES[data.estado].icon} {RESERVATION_STATES[data.estado].label} */}
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="space-y-1 flex flex-col">
                                <span className={`px-2 py-1 text-xs font-medium w-fit rounded-full ${PAYMENT_STATUS[getPaymentStatus(data)].color}`}>
                                  {PAYMENT_STATUS[getPaymentStatus(data)].label}
                                </span>
                                <div className="w-full bg-gray-200 rounded-full h-1">
                                  <div 
                                    className={`h-1 rounded-full ${
                                      getPaymentStatus(data) === 'pago_completo' ? 'bg-green-500' : 
                                      getPaymentStatus(data) === 'pago_parcial' ? 'bg-yellow-500' : 
                                      getPaymentStatus(data) === 'sobrepago' ? 'bg-blue-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${Math.min(getPaymentPercentage(data), 100)}%` }}
                                  />
                                </div>
                                {/* const paymentStatus = getPaymentStatus(reserva);
                  const paymentPercentage = getPaymentPercentage(reserva); */}
                              </div>
                            </TableCell>

                            <TableCell>
                              <div>
                                <div className="font-medium text-gray-900 truncate max-w-xs">{data?.paquete?.moneda.simbolo}{formatearSeparadorMiles.format(data?.precio_unitario ?? 0)}</div>
                                {/* <div className="text-sm text-gray-500 truncate max-w-xs">{data.titular.telefono}</div> */}
                              </div>
                            </TableCell>     

                            <TableCell>
                               <Badge className={`${!data.modalidad_facturacion ? 'bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800': 
                                      'text-xs bg-blue-100 text-blue-700 border-blue-200'
                               }`}>
                                {/* {capitalizePrimeraLetra(data.modalidad_facturacion === 'global' ?
                                   'Por paquete' 
                                   : 'Por pasajero')} */}
                                   {!data.modalidad_facturacion ? 
                                    <>
                                       <BoxIcon  className="h-5 w-5 text-gray-500" />
                                       <span>Por asignarse</span>
                                    </>
                                   :
                                    <>
                                          {data.modalidad_facturacion === 'global' &&
                                              <>
                                                <BoxIcon  className="h-5 w-5 text-gray-500" />
                                                <span>Paquete</span>
                                              </>
                                            }

                                          {data.modalidad_facturacion === 'individual' &&
                                              <>
                                                <User  className="h-5 w-5 text-gray-500" />
                                                <span>Pasajero</span>
                                              </>}
                                    </>}
                                    
                              </Badge>
                            </TableCell>     

                            <TableCell>
                               <Badge className={`${!data.condicion_pago ? 'bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800': 
                                      'text-xs bg-blue-100 text-blue-700 border-blue-200'
                               }`}>
                                {/* {capitalizePrimeraLetra(data.modalidad_facturacion === 'global' ?
                                   'Por paquete' 
                                   : 'Por pasajero')} */}
                                   {!data.condicion_pago ? 
                                    <>
                                       <MdOutlinePending  className="h-5 w-5 text-gray-500" />
                                       <span>Por asignarse</span>
                                    </>
                                   :
                                    <>
                                    <TbInvoice className="h-5 w-5 text-gray-500" />
                                    <span>{data.condicion_pago_display}</span>
                                  </>}
                                    
                              </Badge>
                            </TableCell>     
                            {/* condicion_pago_display */}
                          
      
                            
                            
                            
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="border-gray-200">
                                  {siTienePermiso("reservas", "leer") &&
                                    <DropdownMenuItem className="hover:bg-blue-50 cursor-pointer"
                                      onClick={() => handleVerDetalles(data)}>
                                      <Eye className="h-4 w-4 mr-2 text-blue-500" />
                                      Ver detalles
                                    </DropdownMenuItem>
                                  }
                                  {siTienePermiso("reservas", "modificar") &&
                                  <DropdownMenuItem className="hover:bg-emerald-50 cursor-pointer" onClick={() => handleEditar(data)}>
                                    <Edit className="h-4 w-4 mr-2 text-emerald-500" />
                                    Editar
                                  </DropdownMenuItem>
                                  }

                                  {siTienePermiso("reservas", "modificar") && 
                                    <>
                                        <DropdownMenuSeparator />
                                      <DropdownMenuItem className={`${data.activo ? 'text-red-600 hover:bg-red-50': 'text-green-600 hover:bg-green-50'} cursor-pointer`}
                                        onClick={() => toggleActivar(data)}>
                                        
                                        {data.activo ? <Trash2 className="h-4 w-4 mr-2" /> : <CheckIcon className="h-4 w-4 mr-2" />}
                                        {data.activo ? 'Desactivar' : 'Activar'}
                                      </DropdownMenuItem>
                                    </>
                                  }
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}

                        {!isFetching && dataList.length === 0 && (
                          <TableRow className="">
                            <TableCell className="w-full flex items-center justify-center">
                              <div className="text-center py-12  absolute-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                  <Search className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron modulos</h3>
                                <p className="text-gray-500 mb-4">Intenta ajustar los filtros de búsqueda.</p>
                                <Button
                                  onClick={handleReset}
                                  className="bg-blue-500 hover:bg-blue-600 cursor-pointer"
                                >
                                  Limpiar filtros
                                </Button>
                              </div>
                            </TableCell>

                          </TableRow>
                          )}
                      </TableBody>
                    </Table>
                  
                  : 
                          (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dataList.map((pkg) => (
                          <Card
                            key={pkg.id}
                            className={`hover:shadow-lg transition-shadow cursor-pointer `}
                          >
                            <div className="relative">
                              <img
                                src={pkg.paquete.imagen || placeholderViaje}
                                alt={pkg.paquete.nombre}
                                className="w-full h-48 object-cover rounded-t-lg"
                              />
                              <div className="absolute top-3 left-3">
                                <Badge
                                  className={`${
                                    pkg.paquete.tipo_paquete.nombre === "Terrestre"
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : pkg.paquete.tipo_paquete.nombre === "Aéreo"
                                        ? "bg-blue-100 text-blue-700 border-blue-200"
                                        : "bg-cyan-100 text-cyan-700 border-cyan-200"
                                  } border font-sans`}
                                >
                                  {pkg.paquete.tipo_paquete.nombre}
                                </Badge>
                              </div>
                              <div className="absolute top-3 right-3">
                                <Checkbox
                                  // checked={selectedPackages.includes(pkg.id)}
                                  // onCheckedChange={() => handleSelectPackage(pkg.id)}
                                  className="bg-white"
                                />
                              </div>
                              <div className="absolute bottom-3 right-3">
                                <Badge
                                  className={
                                    pkg.activo
                                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                      : "bg-gray-100 text-gray-700 border-gray-200"
                                  }
                                >
                                  {pkg.activo ? "Activo" : "Inactivo"}
                                </Badge>
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div>
                                  <h3 className="font-semibold text-gray-900 text-lg font-sans">{pkg.paquete.nombre}</h3>
                                  <p className="text-gray-600 text-sm font-sans">{pkg.paquete.destino.ciudad}</p>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-semibold text-emerald-600 text-lg font-sans">
                                      {formatearSeparadorMiles.format(pkg?.paquete?.precio ?? 0)}
                                    </div>
                                    {pkg.paquete.sena > 0 
                                    &&  (
                                      <>
                                        <div className="text-sm text-gray-500 font-sans">Seña: {formatearSeparadorMiles.format(pkg?.paquete?.sena ?? 0)}</div>
                                      </>
                                    )}

                                  </div>
                                  <Badge
                                    className={`${
                                      pkg.paquete.propio
                                        ? "bg-blue-100 text-blue-700 border-blue-200"
                                        : "bg-orange-100 text-orange-700 border-orange-200"
                                    } border font-sans`}
                                  >
                                    {pkg.paquete.propio ? "Propio" : "Distribuidor"}
                                  </Badge>
                                </div>

                                {!pkg.paquete.personalizado && (
                                  <div className="text-sm text-gray-500 font-sans">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {formatearFecha(pkg.paquete.fecha_inicio ?? '', false)} - {formatearFecha(pkg.paquete.fecha_fin ?? '', false)}
                                    </div>
                                  </div>
                                )}

                                {pkg.cantidad_pasajeros && (
                                  <div className="text-sm text-gray-500 font-sans">
                                    <div className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {pkg.cantidad_pasajeros} pasajeros
                                    </div>
                                  </div>
                                )}

                                <div className="flex gap-2 pt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 font-sans bg-transparent"
                                    onClick={() => handleVerDetalles(pkg)}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    Ver
                                  </Button>
                                  <Button size="sm" className="flex-1 bg-emerald-500 hover:bg-emerald-600 font-sans">
                                    <Edit className="h-3 w-3 mr-1" />
                                    Editar
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                  }

                  {/* Controles de Paginación */}
                
                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-gray-600">Mostrar:</Label>
                        <Select value={paginacion?.pageSize?.toString() ?? 5} onValueChange={handleItemsPerPageChange}>
                          <SelectTrigger className="w-20 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="text-sm text-gray-600">por página</span>
                      </div>

                      <div className="text-sm text-gray-600">
                        Página {currentPage} de {paginacion?.totalPages ?? 0}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="h-8 cursor-pointer"
                        title="Primera"
                      >
                        <FaAngleDoubleLeft/>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 cursor-pointer"
                        title="Anterior"
                      >
                        <FaAngleLeft/>
                      </Button>

                      {/* Números de página */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, paginacion!.totalPages) }, (_, i) => {
                          let pageNumber
                          if (paginacion!.totalPages <= 5) {
                            pageNumber = i + 1
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1
                          } else if (currentPage >= paginacion!.totalPages - 2) {
                            pageNumber = paginacion!.totalPages - 4 + i
                          } else {
                            pageNumber = currentPage - 2 + i
                          }

                          return (
                            <Button
                              key={pageNumber}
                              variant={currentPage === pageNumber ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNumber)}
                              className={`h-8 w-8 cursor-pointer ${
                                currentPage === pageNumber ? "bg-blue-500 hover:bg-blue-600" : ""
                              }`}
                            >
                              {pageNumber}
                            </Button>
                          )
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => currentPage < paginacion!.totalPages && handlePageChange(currentPage + 1)}
                        disabled={currentPage === paginacion!.totalPages}
                        className="h-8 cursor-pointer"
                        title="Siguiente"
                      >
                        <FaAngleRight/>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => (currentPage > 1 || currentPage < paginacion?.totalPages) && handlePageChange(paginacion.totalPages)}
                        disabled={currentPage === paginacion!.totalPages}
                        className="h-8 cursor-pointer"
                        title="Última"
                      >
                        <FaAngleDoubleRight/>
                      </Button>
                    </div>
                  </div>
                

                  
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
      </div>

      {/* Modal de Confirmación de Reserva */}
      {payloadReservationData?.modalData && (
        <ReservationConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={handleCloseConfirmModal}
          onConfirm={handleConfirmReservation}
          reservationData={payloadReservationData.modalData}
          isPendingReservation={isPendingReservation}
          // reservationData={sampleReservation}
        />
      )}

      {/* Modal de Pago de seña */}
      {isSenialModalOpen && (
        <PagoSeniaModal
          isOpen={isSenialModalOpen}
          onClose={handleCloseSeniaModal}
          onConfirm={handleConfirmSeniaPago}
          isPendingPagarSenia={isPendingPagarSenia || isPendingPagoTotal}
          reservationResponse={reservaRealizadaResponse}
          seniaPorPersona={reservaRealizadaResponse?.pasajeros?.[0]?.seña_requerida || seniaPorPersona}
          cantidadActualPasajeros={reservaRealizadaResponse?.cantidad_pasajeros || reservaRealizadaResponse?.habitacion?.capacidad || cantidadActualPasajeros}
          precioFinalPorPersona={reservaRealizadaResponse?.pasajeros?.[0]?.precio_asignado || precioFinalPorPersona}
          selectedPasajerosData={reservaRealizadaResponse?.pasajeros?.filter((p: any) => !p.es_titular).map((p: any) => p.persona) || []}
          titular={reservaRealizadaResponse?.pasajeros?.find((p: any) => p.es_titular)?.persona || reservaRealizadaResponse?.titular}
        />
      )}

        {/* Modal de vista del comprobante de pago de seña */}
      {isReceiptModalOpen && <PaymentReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={handleCloseReceipt}
          isPendingDescargaComprobante={isPendingDescargaComprobante}
          receiptData={pagoSeniaRealizadaResponse}
          handleDescargarPDF={() => handleDescargarPDF(pagoSeniaRealizadaResponse?.comprobante?.id)}
        />}

    </>
  )
}
