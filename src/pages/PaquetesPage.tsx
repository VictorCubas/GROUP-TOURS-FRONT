/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { cn } from "@/lib/utils"
import { startTransition, use, useEffect, useMemo, useRef, useState } from "react"
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
  Plane,
  Croissant,
  Car,
  Upload,
  Heart,
  Share2,
  MapPin,
  Clock,
  Users,
  Star,
  Hotel,
  Building2,
  Table2,
  Grid3X3,
  User,
  UserCheck,
  Users2,
  Bed,
  Tag,
  AlertCircle,
  CirclePlus,
  Info,
  DoorOpen,
} from "lucide-react"

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
import { TbBus } from "react-icons/tb";
// import { FaUserGroup } from "react-icons/fa6";
import { RiGroupLine } from "react-icons/ri";



import "flatpickr/dist/themes/material_green.css";
// import Flatpickr from "react-flatpickr"; 


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Distribuidora, Moneda, Paquete, PriceMode, RespuestaPaginada, SalidaPaquete, TipoPaquete, } from "@/types/paquetes"
import { capitalizePrimeraLetra, formatearFecha, formatearSeparadorMiles, getDaysBetweenDates, quitarAcentos } from "@/helper/formatter"
import { activarDesactivarData, fetchData, fetchResumen, guardarDataEditado, nuevoDataFetch, fetchDataTiposPaquetesTodos, fetchDataDistribuidoraTodos, fetchDataServiciosTodos, fetchDataMonedaTodos, fetchCotizacionVigente } from "@/components/utils/httpPaquete"
import {Controller, useForm, useWatch } from "react-hook-form"
import { queryClient } from "@/components/utils/http"
import { ToastContext } from "@/context/ToastContext"
import Modal from "@/components/Modal"
import { IoCheckmarkCircleOutline, IoWarningOutline } from "react-icons/io5";
import ResumenCardsDinamico from "@/components/ResumenCardsDinamico"
import { GenericSearchSelect } from "@/components/GenericSearchSelect"
import { useSessionStore } from "@/store/sessionStore"
import placeholderViaje from "@/assets/paquete_default.png";
import { fetchDataDestinosTodos, fetchDataHoteles } from "@/components/utils/httpDestino"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { calcularCostoPaquete, calcularRangoPrecio, calculateNoches, getPayload, normalizarPreciosCatalogo, normalizarPreciosCatalogoHoteles } from "@/helper/paquete";
import { NumericFormat } from 'react-number-format';
import { fetchDataZonasGeograficasTodos } from "@/components/utils/httpNacionalidades"
import { fetchTiposCostoTodos } from "@/components/utils/httpTipoCosto"


let dataList: Paquete[] = [];
let tipoPaqueteFilterList: any[] = [];
let habitacionesList: any[] = [];




const getRoomIcon = (roomType: string) => {
  switch (roomType) {
    case "single":
      return <User className="w-4 h-4" />
    case "doble":
      return <UserCheck className="w-4 h-4" />
    case "triple":
      return <Users2 className="w-4 h-4" />
    default:
      return <Bed className="w-4 h-4" />
  }
}

const getRoomTypeLabel = (roomType: string) => {
  switch (roomType) {
    case "single":
      return "Individual"
    case "doble":
      return "Doble"
    case "triple":
      return "Triple"
    default:
      return roomType
  }
}

export default function ModulosPage() {
  const {siTienePermiso} = useSessionStore();
  // const [setSearchTerm] = useState("")
  const [imagePreview, setImagePreview] = useState<string | undefined>(placeholderViaje);
  const [selectedDestinoID, setSelectedDestinoID] = useState<number | "">("");
  const [destinoNoSeleccionada, setDestinoNoSeleccionada] = useState<boolean | undefined>();
  const [nombreABuscar, setNombreABuscar] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [validando, setValidando] = useState(false);
  const [dataAEditar, setDataAEditar] = useState<Paquete>();
  const [dataADesactivar, setDataADesactivar] = useState<Paquete>();
  const [onDesactivarData, setOnDesactivarData] = useState(false);
  const [onVerDetalles, setOnVerDetalles] = useState(false);
  const [tipoPaqueteSelected, setTipoPaqueteSelected] = useState<TipoPaquete>();
  const [distribuidoraSelected, setDistribuidoraSelected] = useState<Distribuidora>();
  const [permissionSearchTerm, setPermissionSearchTerm] = useState("");
  const [selectedServicios, setSelectedServicios] = useState<number[]>([])
  const [dataDetalle, setDataDetalle] = useState<Paquete>();
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")
  const {handleShowToast} = use(ToastContext);
  const [onGuardar, setOnGuardar] = useState(false);
  const [modoPrecio, setModoPrecio] = useState<Record<string, PriceMode>>({})
  const [totalPrecioServiciosEdicion, setTotalPrecioServiciosEdicion] = useState<number | null>(null);


  // const [rangoPrecio, setRangoPrecio] = useState<{ precioMin: number; precioMax: number; dias: number; noches: number }>();
  const [ciudadDataSelected, setCiudadDataSelected] = useState<any>();
  const [ciudadDataCompleto, setCiudadDataCompleto] = useState<any>();
  const [selectedHotels, setSelectedHotels] = useState<Set<string>>(new Set());
  const [hotelPrices, setHotelPrices] = useState<Record<string, { single: number; doble: number; triple: number }>>({});
  const [selectedZonaGeograficaID, setSelectedZonaGeograficaID] = useState<number | "">("");
  
  const [filtros, setFiltros] = useState({
                  activo: true,   // null = todos, true = solo activos
                  fecha_desde: "",
                  fecha_hasta: "",
                  nombre: "",
                  tipo_paquete: "all",                      // fisica | juridica | all
                  tipo_propiedad: "all",  
                });

  const [preciosCatalogoTrigger, setPreciosCatalogoTrigger] = useState(0); // Para forzar recálculo
  
  // DATOS DEL FORMULARIO 
  const {control,  register, watch, handleSubmit, setValue, formState: {errors, },clearErrors, reset} = 
            useForm<any>({
              mode: "onBlur",
              defaultValues: {
                distribuidora_id: '',
                propio: true,
                personalizado: false,
                zona_geografica: "",
              }
            });

    // console.log(trigger);
  // DATOS DEL FORMULARIO 



  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('list');
  const [paginacion, setPaginacion] = useState<RespuestaPaginada>({
                                                      next: null,
                                                      totalItems: 5,
                                                      previous: null,
                                                      totalPages: 5,
                                                      pageSize: 10
                                              });

  // DATOS DE SALIDOS


  // const {control,trigger,  register, watch, handleSubmit, setValue, formState: {errors, },clearErrors, reset} = 
  const {
    control: controlSalida,
    register: registerSalida,
    handleSubmit: handleSubmitSalida,
    watch: watchSalida,
    setValue: setValueSalida,
    formState: {
      errors: errorsSalida,
    },
    reset: resetSalida,
    getValues: getValuesSalida,
    trigger
  } = useForm<any>({
    mode: "onBlur", // 🔹 Cambio clave: Valida en submit para evitar issues en primer render
    reValidateMode: 'onChange', //
    defaultValues: {
      precio_desde: '',
      precio_desde_editable: '',
      precio_hasta_editable: '',
      cantidadNoche: '',
      precio_hasta: '',
      senia: '',
      fecha_salida_v2: '',
      fecha_regreso_v2: '',
      cupo: '',
      ganancia: '',
      comision: '',
    },
  });

  const [nuevaSalida, setNuevaSalida] = useState({
      fecha_salida_v2: "",
      fecha_regreso_v2: "",
      precio: '',
      senia: '',
      cupo: "",
      ganancia: "",
      comision: ""
    })

    const [salidas, setSalidas] = useState<any[]>([])
    const originalSalidasRef = useRef<any[]>([])
    const [isEditMode, setIsEditMode] = useState(false)
    const [editingSalidaId, setEditingSalidaId] = useState<string | null>(null);
    const [isAddSalidaOpen, setIsAddSalidaOpen] = useState(false);
    // DATOS DE SALIDOS

    // DUMMY — costos por defecto del paquete (reemplazar con estado real al integrar)
    const [itemsCostoDefecto, setItemsCostoDefecto] = useState<any[]>([]);
    // DUMMY — costos de la salida (override, reemplazar con estado real al integrar)
    const [itemsCostoSalida, setItemsCostoSalida] = useState<any[]>([]);
    // const [precioVentaFinal, setPrecioVentaFinal] = useState<number | null>(null);

    console.log(distribuidoraSelected)

  const {data: dataDestinoList, isFetching: isFetchingDestino,} = useQuery({
      queryKey: ['destinos-disponibles',], //data cached
      queryFn: () => fetchDataDestinosTodos(),
      staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
    });

  // const {data: dataPersonaList, isFetching: isFetchingPersonas,} = useQuery({
  //     queryKey: ['personas-disponibles', personaBusqueda], //data cached
  //     queryFn: () => fetchDataPersonasTodos(personaBusqueda),
  //     staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
  //   });

  const {data: dataTipoPaqueteList, isFetching: isFetchingTipoPaquetes,} = useQuery({
      queryKey: ['tipos-paquetes-disponibles',], //data cached
      queryFn: () => fetchDataTiposPaquetesTodos(),
      staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
    });

  const {data: dataMonedaList, isFetching: isFetchingMoneda,} = useQuery({
      queryKey: ['monedas-disponibles',], //data cached
      queryFn: () => fetchDataMonedaTodos(),
      staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
    });

  const {data: dataServiciosList, isFetching: isFetchingServicios,} = useQuery({
      queryKey: ['servicios-disponibles',], //data cached
      queryFn: () => fetchDataServiciosTodos(),
      staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
    });


  //se invalida la peticion de servicios-disponibles al hacer unmount del componente
  useEffect(() => {
    return () => {
      queryClient.invalidateQueries({
                queryKey: ['servicios-disponibles'],
                exact: false
              });
    }
  }, [])

  const {data: dataDistribuidoraList, isFetching: isFetchingDistribuidora,} = useQuery({
      queryKey: ['distribuidoras-disponibles',], //data cached
      queryFn: () => fetchDataDistribuidoraTodos(),
      staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
    });

  const {data, isFetching, isError} = useQuery({
    queryKey: ['paquetes', currentPage, paginacion.pageSize, filtros], //data cached
    queryFn: () => fetchData(currentPage, paginacion.pageSize, filtros),
    staleTime: 5 * 60 * 1000, //despues de 5min los datos se consideran obsoletos
    enabled: !((filtros.fecha_desde && !filtros.fecha_hasta) || (!filtros.fecha_desde && filtros.fecha_hasta))
  ,
  });

  const {data: dataResumen, isFetching: isFetchingResumen, isError: isErrorResumen} = useQuery({
    queryKey: ['paquetes-resumen'], //data cached
    queryFn: () => fetchResumen(),
    staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
  });


  const {data: dataZonaGeograficaList, isFetching: isFetchingZonaGeografica,} = useQuery({
        queryKey: ['todos-zona-geografica',], //data cached
        queryFn: () => fetchDataZonasGeograficasTodos(),
        staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
    });

  const {data: dataCotizacion, isFetching: isFetchingCotizacion} = useQuery({
        queryKey: ['cotizacion-vigente',], //data cached
        queryFn: () => fetchCotizacionVigente(),
        staleTime: 30 * 60 * 1000 //despues de 30min los datos se consideran obsoletos
    });


  console.log(ciudadDataSelected)

  const {data: dataHotelesList, isFetching: isFetchingHoteles,} = useQuery({
        queryKey: ['todos-hoteles-paquetes', ciudadDataSelected], //data cached
        queryFn: () => fetchDataHoteles(ciudadDataSelected),
        staleTime: 5 * 60 * 1000, //despues de 5min los datos se consideran obsoletos
        enabled: Boolean(ciudadDataSelected),
    });

  const { data: dataTipoCostoList } = useQuery({
    queryKey: ['tipos-costo-todos'],
    queryFn: fetchTiposCostoTodos,
    staleTime: 10 * 60 * 1000,
  });

  // let filteredPermissions: Modulo[] = [];

    console.log(dataHotelesList); 
    console.log(isFetchingHoteles)

    if(ciudadDataSelected && dataHotelesList){
      console.log(ciudadDataSelected)
      console.log(ciudadDataCompleto)

      habitacionesList = [...dataHotelesList]; 
      console.log(habitacionesList)
    }
    

  if(dataTipoPaqueteList && dataTipoPaqueteList.length){
    tipoPaqueteFilterList = [...dataTipoPaqueteList];
  }
  

  if(!isFetching && !isError){
    if(data?.results){
      dataList = data.results.map((per: Paquete, index: number) => ({...per, numero: index + 1}));
    }
  }


  // if(!isFetchingPersonas){
  //   console.log('dataListPersonas: ', dataPersonaList)
  // }


  // useEffect(() => {  
  //   if(dataPersonaList){
  //     if(dataAEditar){
  //       //COMENTADO TEMPORALMENTE
  //       // setNewDataPersonaList([...dataPersonaList, dataAEditar.persona]);
  //     }
  //     else{
  //       setNewDataPersonaList([...dataPersonaList])
  //     }
  //   }
  // }, [dataAEditar, dataPersonaList]);


    useEffect(() => {
      if (!tipoPaqueteSelected) return;

      const tipo = quitarAcentos(tipoPaqueteSelected.nombre ?? "").toLowerCase();

      if (tipo === "aereo") {
        setValue("propio", false); // Desmarcar si es aereo
      } else {
        setValue("propio", true); // Marcar si es terrestre u otro
      }
    }, [tipoPaqueteSelected, setValue]);
  
  // Cálculos de paginación
  const totalItems = dataList?.length
  // const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * paginacion.pageSize
  const endIndex = startIndex + paginacion.pageSize
  // const paginatedPermisos = filteredPermissions.slice(startIndex, endIndex);


  const propio = watch('propio');
  const cantidadPasajeros = watch('cantidad_pasajeros');
  const personalizado = watch('personalizado');
  const cantidadNoche = watchSalida('cantidadNoche');
  // const precioDesde = watchSalida('precio_desde');
  const monedaSeleccionada = watch('moneda');
  // const precioHasta = watchSalida('precio_hasta');


  console.log(monedaSeleccionada)
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
        setNombreABuscar("");
        setSelectedZonaGeograficaID("")
      });
  }

  const handleActiveOnly = () => {
    setShowActiveOnly(prev => !prev)
    setFiltros({ ...filtros, activo: !showActiveOnly })
    setCurrentPage(1);
  }


  const {mutate, isPending: isPendingMutation} = useMutation({
    mutationFn: nuevoDataFetch,
    onSuccess: () => {
        handleShowToast('Se ha creado un nuevo paquete satisfactoriamente', 'success');
        reset({
          nombre: '',
          tipo_paquete: '',
          precio: '',
          senia: '',
          fecha_salida: '',
          fecha_regreso: '',
          distribuidora_id: '',
          destino: '',
          cantidad_pasajeros: '',
          moneda: '',
          personalizado: false,
          propio: true,
          imagen: '',
        });

        // setTipoDePersonaCreacion(undefined);
        // setTipoPaqueteSelected(undefined);
        // setDistribuidoraSelected(undefined);
        setImagePreview(placeholderViaje);
        setSelectedServicios([])
        setSelectedDestinoID("");
        setTipoPaqueteSelected(undefined);
        setDistribuidoraSelected(undefined);
        handleDestinoNoSeleccionada(undefined)
        handleCancel();
        
        setActiveTab('list');
        queryClient.invalidateQueries({
          queryKey: ['paquetes'],
          exact: false
        });

        queryClient.invalidateQueries({
          queryKey: ['paquetes-resumen'],
        });

        queryClient.invalidateQueries({
          queryKey: ['paquetes-disponibles'],
        });

        queryClient.invalidateQueries({ queryKey: ['salidas'], exact: false });
        queryClient.invalidateQueries({ queryKey: ['salidas-resumen'] });
        queryClient.invalidateQueries({ queryKey: ['salida-detalle'], exact: false });
        queryClient.invalidateQueries({ queryKey: ['paquetes-disponibles-salidas'], exact: false });
        queryClient.invalidateQueries({ queryKey: ['paquetes-filtro-salidas'], exact: false });

        queryClient.invalidateQueries({
          queryKey: ['usuarios'],
          exact: false
        });

        queryClient.invalidateQueries({
          queryKey: ['usuarios-resumen'],
        });


        // setSelectedPersonaID("");
        // setSelectedDestinoID("");
        // setPersonaNoSeleccionada(undefined);
        // setDestinoNoSeleccionada(undefined);

        // queryClient.invalidateQueries({
        //   queryKey: ['permisos'],
        //   exact: false
        // });

        // queryClient.invalidateQueries({
        //   queryKey: ['roles'],
        //   exact: false
        // });

        // queryClient.invalidateQueries({
        //   queryKey: ['tipo-documentos-de-personas'],
        //   exact: false
        // });
    },
  });

  const {mutate: mutateGuardarEditado, isPending: isPendingEdit} = useMutation({
    mutationFn: guardarDataEditado,
    onSuccess: () => {
        handleShowToast('Se ha guardado el paquete satisfactoriamente', 'success');
        setDataAEditar(undefined);
        reset({
            precio: '',
            senia: '',
            tipo_paquete: '',
            fecha_salida: '',
            fecha_regreso: '',
            distribuidora_id: '',
           imagen: '',
          });


          handleCancel();
          setImagePreview(placeholderViaje);
        // setTipoDePersonaCreacion(undefined);
        // setTipoPaqueteSelected(undefined);
        // setDistribuidoraSelected(undefined);
        setActiveTab('list');
        queryClient.invalidateQueries({ queryKey: ['paquetes'], exact: false });
        queryClient.invalidateQueries({ queryKey: ['paquetes-resumen'] });
        queryClient.invalidateQueries({ queryKey: ['paquetes-disponibles'] });
        queryClient.invalidateQueries({ queryKey: ['salidas'], exact: false });
        queryClient.invalidateQueries({ queryKey: ['salidas-resumen'] });
        queryClient.invalidateQueries({ queryKey: ['salida-detalle'], exact: false });
        queryClient.invalidateQueries({ queryKey: ['paquetes-disponibles-salidas'], exact: false });
        queryClient.invalidateQueries({ queryKey: ['paquetes-filtro-salidas'], exact: false });
        queryClient.invalidateQueries({ queryKey: ['usuarios'], exact: false });
        queryClient.invalidateQueries({ queryKey: ['usuarios-resumen'] });
    },
  });

  const {mutate: mutateDesactivar, isPending: isPendingDesactivar} = useMutation({
    mutationFn: activarDesactivarData,
    onSuccess: () => {
        handleShowToast('Se ha desactivado el paquete satisfactoriamente', 'success');
        setOnDesactivarData(false);
        setDataADesactivar(undefined);
        //desactivamos todas las queies
        queryClient.invalidateQueries({
          queryKey: ['paquetes'],
          exact: false
        });
        queryClient.invalidateQueries({
          queryKey: ['paquetes-resumen'],
        });
    },
  });


  const handleCancel = () => {
        setDataAEditar(undefined);
        setOnGuardar(false)
        setSelectedDestinoID("");
        setTipoPaqueteSelected(undefined);
        setDistribuidoraSelected(undefined);
        handleDestinoNoSeleccionada(undefined)
        setCiudadDataSelected(undefined);
        // setNewDataPersonaList([...dataPersonaList])
        setImagePreview(placeholderViaje);
        setSalidas([]);
        setSelectedServicios([]);
        setPermissionSearchTerm("");
        setSelectedHotels(new Set());
        setModoPrecio({}); // Resetear modo de precio

        // 🔹 Limpiar campos dinámicos de precios_catalogo y cupos
        const formValues = getValuesSalida();
        Object.keys(formValues).forEach((key) => {
          if (key.startsWith('precio_paquete_habitacion_') || key.startsWith('precio_habitacion_por_hotel_') || key.startsWith('cupo_habitacion_')) {
            setValueSalida(key, undefined);
          }
        });

        reset({
            nombre: '',
            tipo_paquete: '',
            precio: '',
            senia: '',
            fecha_salida: '',
            fecha_regreso: '',
            distribuidora_id: '',
            imagen: '',
            moneda: '',
            zona_geografica: ''
        });

        resetSalida({
          precio_desde: '',
          cantidadNoche: '',
          precio_hasta: '',
          precio_hasta_editable: '',
          precio_desde_editable: '',
          senia: '',
          fecha_salida_v2: '',
          fecha_regreso_v2: '',
          ganancia: '',
          comision: '',
          cupo: '',
        });


        // setTipoDePersonaCreacion(undefined);
        // setTipoPaqueteSelected(undefined);
        // setDistribuidoraSelected(undefined);
        
        setActiveTab('list');
  }

  

  const handleGuardarNuevaData = async (dataForm: any) => {
    console.log(selectedServicios) 

    const serviciosListSelected = selectedServicios.map(s => {
      return {
        servicio_id: s,
        // precio: watch(`precio_personalizado_servicio_${s}`) ?? ''
      }
    })


    console.log(serviciosListSelected);  
    console.log(salidas);
    console.log(dataServiciosList);
    const prePayload = getPayload(salidas, dataForm, watch("propio"), selectedDestinoID, serviciosListSelected);

    if (destinoNoSeleccionada === undefined || !prePayload.destino_id) {
      console.log('destino no seleccionado...')
      setDestinoNoSeleccionada(true);
      return;
    }


    if(selectedServicios.length === 0){
      handleShowToast('Debes agregar al menos un servicio', 'error');
      return;
    }

    if (propio && itemsCostoDefecto.length < 2) {
      handleShowToast('Debes agregar al menos 2 ítems de costo al paquete', 'error');
      return;
    }

    if (propio && itemsCostoDefecto.some((i: any) => !i.tipo_costo_id || i.monto == null)) {
      handleShowToast('Todos los ítems de costo deben estar completos', 'error');
      return;
    }
 
    console.log('prePayload: ', prePayload); 

    const formData = new FormData();

    // 🔹 Imagen opcional
    if (dataForm.imagen && dataForm.imagen[0] instanceof File) {
      formData.append("imagen", dataForm.imagen[0]);
    }


    if(salidas.length === 0 && !personalizado){
      handleShowToast('Debes agregar al menos una salida', 'error');
      return;
    }


    console.log(salidas);

    // Agregar el resto de campos
    Object.keys(prePayload).forEach((key) => {
      const value = prePayload[key];
      if (value !== undefined && value !== null) {
        if (key === "salidas" || key === 'servicios_data') {
          formData.append(key, JSON.stringify(value));
        }else if (Array.isArray(value)) {
          value.forEach((v) => formData.append(key, v));
        } else {
          formData.append(key, value);
        }
      }
    });

    if (propio) {
      const itemsCostoData = itemsCostoDefecto.map((i: any) => ({
        tipo_costo_id: i.tipo_costo_id,
        monto: i.monto,
      }));
      formData.append('items_costo_data', JSON.stringify(itemsCostoData));
    }

    console.log("FormData listo:", [...formData.entries()]); 
    mutate(formData);  
  };


  const handleGuardarDataEditado = async (dataForm: any) => {
    if(salidas.length === 0){
      handleShowToast('Debes agregar al menos una salida', 'error');
      return;
    }

    const salidasTemp = salidas.map((salida: any) => {
      const salActualizada: any = {
        id: salida.id,
        fecha_salida: salida.fecha_salida_v2,
        fecha_regreso: salida.fecha_regreso_v2,
        senia: salida.senia,
        moneda_id: dataForm.moneda,
        hoteles: salida.hoteles_ids,
        temporada_id: salida?.temporada_id || null,
      };

      if(propio) {
        if(salida.cupo) salActualizada.cupo = parseInt(salida.cupo, 10);
        salActualizada.cupos_habitaciones = salida.cupos_habitaciones;
        if(salida.ganancia !== undefined && salida.ganancia !== '')
          salActualizada.ganancia = salida.ganancia;
        if (salida.items_costo_override_data !== undefined)
          salActualizada.items_costo_override_data = salida.items_costo_override_data;
      } else {
        salActualizada.comision = salida.comision;
      }

      salActualizada.precios_catalogo_habitaciones = normalizarPreciosCatalogo(
        salida.precios_catalogo_habitaciones,
        salida.precios_catalogo_hoteles,
        dataHotelesList || []
      );
      salActualizada.precios_catalogo_hoteles = normalizarPreciosCatalogoHoteles(salida.precios_catalogo_hoteles);

      return salActualizada;
    });

    // Helper para comparar valores ignorando diferencias de tipo string/number/null
    const str = (v: any) => (v === null || v === undefined || v === '') ? '' : String(v);

    const diff: Record<string, any> = {};

    // Campos escalares — solo incluir si cambiaron
    const camposEscalares: Record<string, { actual: any; original: any }> = {
      nombre:         { actual: dataForm.nombre,          original: dataAEditar!.nombre },
      propio:         { actual: dataForm.propio,           original: dataAEditar!.propio },
      personalizado:  { actual: dataForm.personalizado,    original: dataAEditar!.personalizado },
      destino_id:     { actual: selectedDestinoID,         original: dataAEditar!.destino.id },
      tipo_paquete_id:{ actual: tipoPaqueteSelected?.id,   original: dataAEditar!.tipo_paquete.id },
      moneda_id:      { actual: dataForm.moneda,           original: dataAEditar!.moneda.id },
    };

    if (propio) {
      camposEscalares.cantidad_pasajeros = { actual: dataForm.cantidad_pasajeros, original: dataAEditar!.cantidad_pasajeros };
    } else {
      camposEscalares.distribuidora_id = { actual: dataForm.distribuidora_id, original: dataAEditar!.distribuidora?.id };
    }

    for (const [key, { actual, original }] of Object.entries(camposEscalares)) {
      if (str(actual) !== str(original)) {
        diff[key] = actual;
      }
    }

    // Salidas — comparar contra snapshot al abrir el formulario de edición
    if (JSON.stringify(salidas) !== JSON.stringify(originalSalidasRef.current)) {
      diff.salidas = salidasTemp;
    }

    // Servicios: aplica a todos los tipos
    const currentServiciosIds = [...selectedServicios].sort((a, b) => a - b);
    const originalServiciosIds = [...dataAEditar!.servicios.map((s: any) => s.servicio_id ?? s.id)].sort((a, b) => a - b);
    if (JSON.stringify(currentServiciosIds) !== JSON.stringify(originalServiciosIds)) {
      diff.servicios_data = selectedServicios.map(s => ({ servicio_id: s }));
    }

    // Items de costo: solo para propios
    if (propio) {
      const currentItemsCosto = itemsCostoDefecto.map((i: any) => ({ tipo_costo_id: i.tipo_costo_id, monto: Number(i.monto) }));
      const originalItemsCosto = (dataAEditar!.items_costo_default ?? []).map((i: any) => ({ tipo_costo_id: i.tipo_costo?.id, monto: Number(i.monto) }));
      if (JSON.stringify(currentItemsCosto) !== JSON.stringify(originalItemsCosto)) {
        diff.items_costo_data = currentItemsCosto;
      }
    }

    const tieneImagenNueva = dataForm.imagen?.[0] instanceof File;

    if (Object.keys(diff).length === 0 && !tieneImagenNueva) {
      handleShowToast('No hay cambios para guardar', 'warning');
      return;
    }

    const formData = new FormData();

    if (tieneImagenNueva) {
      formData.append("imagen", dataForm.imagen[0]);
    }

    Object.entries(diff).forEach(([key, value]) => {
      if (key === 'salidas' || key === 'servicios_data' || key === 'items_costo_data') {
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value as any);
      }
    });

    console.log("PATCH diff:", [...formData.entries()]);

    mutateGuardarEditado({ data: formData, paqueteId: dataAEditar!.id });
  };




  useEffect(() => {
    console.log(selectedDestinoID);
    let timeout: ReturnType<typeof setTimeout>;
    
    if(selectedDestinoID){
      const selectedDestino = dataDestinoList.filter((destino: any) => destino.id.toString() === selectedDestinoID.toString());
      console.log(selectedDestino) 

      if(selectedDestino.length){  
        console.log('selectedDestino[0]: ', selectedDestino[0])
        // setValue('nombre', selectedDestino[0].ciudad_nombre);
        setCiudadDataSelected(selectedDestino[0].id); // 🔹 Cambio: Ahora guardamos el ID de la ciudad
        setCiudadDataCompleto(selectedDestino[0]);

        //zona_geografica_nombre
        //zona_geografica_nombre
        timeout = setTimeout(() => {
          setValue('zona_geografica', selectedDestino[0]?.zona_geografica_nombre ?? 'No tiene zona asignada')
        }, 0);
      }
    }

    return () => clearTimeout(timeout);
  }, [dataDestinoList, selectedDestinoID, setValue]);



  useEffect(() => {
      // if(!selectedZonaGeograficaID) return;
    const handler = setTimeout(() => {
      // console.log('cambiando nombre')

      const selectedZona = dataZonaGeograficaList.filter((zona: any) => zona.id.toString() === selectedZonaGeograficaID.toString());
      console.log(selectedZona)

      setFiltros(filtroAnterior => ({...filtroAnterior, zona_geografica: selectedZona[0]?.nombre}))
    }, 750) // ⏱️ medio segundo de espera

    return () => {
      clearTimeout(handler) // limpia el timeout si se sigue escribiendo
    }
  }, [dataZonaGeograficaList, selectedZonaGeograficaID]);

  /********************************
   * CORREGIR ESTA PARTE
   *******************************/
  /********************************
   * CORREGIR ESTA PARTE
   *******************************/
  useEffect(() => {
    if (dataAEditar) {
      console.log('reset data para editar: ', dataAEditar)

      // fecha_creacion: '2025-09-09T10:49:05+0000',
      // fecha_modificacion: '2025-09-09T10:49:05+0000',

      console.log(dataAEditar.moneda.id);
      console.log(dataAEditar.tipo_paquete.id);
      reset({
        ...dataAEditar,
        tipo_paquete: dataAEditar.tipo_paquete.id.toString(),
        moneda: dataAEditar.moneda.id.toString(),
        distribuidora_id: dataAEditar?.distribuidora?.id?.toString(),
        fecha_salida: dataAEditar?.fecha_inicio ? formatearFecha(dataAEditar?.fecha_inicio ?? '', false) : '',
        fecha_regreso: dataAEditar?.fecha_fin ? formatearFecha(dataAEditar?.fecha_fin ?? '', false) : '',
        //COMENTADO TEMPORALMENTE
        // tipo_remuneracion: dataAEditar.tipo_remuneracion.id.toString(),
        // persona: dataAEditar.persona.id.toString()
      });


      if (dataAEditar?.imagen_url) {
        setImagePreview(dataAEditar?.imagen_url); // Mostrar la imagen que viene del backend
      }


      //COMENTADO TEMPORALMENTE
      // console.log('dataAEditar.persona.id: ', dataAEditar.persona.id)
      // setSelectedPersonaID(dataAEditar.persona.id);
      handleDestinoNoSeleccionada(true);
    }
  }, [dataAEditar, reset]);

  /**
   * RESETEO DE LOS CAMPOS DE PRECIO PERSONALIZADO
   */
  useEffect(() => {
    console.log(dataAEditar)
    if (dataAEditar?.propio && dataAEditar?.servicios?.length) {
      dataAEditar.servicios.forEach((servicio: any) => { 
        setValue(`precio_personalizado_servicio_${servicio.servicio_id}`, servicio.precio ?? '');
      });
    }
  }, [dataAEditar, reset, setValue]);


  const handleEditar = (data: Paquete) => {
    const servicios_ids = data.servicios.map((servicio: any) => {
      return servicio.servicio_id;
    });

    console.log(servicios_ids)
    console.log('data: ', data)
    setActiveTab('form');
    setDataAEditar(data);
    

    //COMENTADO TEMPORALMENTE
      setSelectedDestinoID(data!.destino.id)
      // setSelectedPersonaID(data!.persona.id)
      setTipoPaqueteSelected(data!.tipo_paquete)
      setDistribuidoraSelected(data!.distribuidora);
      console.log(servicios_ids)
      setSelectedServicios(servicios_ids);

    const salidas = data.salidas.map((salida: SalidaPaquete) => {
      // let precios_catalogo_hoteles: any[] = [];

      // if(!data.propio && salida?.precios_catalogo_hoteles){
      //   precios_catalogo_hoteles = salida?.precios_catalogo_hoteles.map((precio: any) => {
      //       console.log(precio);
      //       return {
      //         hotel_id: precio.hotel.id,
      //         precio_catalogo: precio.precio_catalogo 
      //       }
      //   })

      //   console.log(precios_catalogo_hoteles);
      // }
      
      // let precios_catalogo: any[] = [];

      // if(!data.propio && salida?.precios_catalogo){
      //   precios_catalogo = salida?.precios_catalogo.map((precio: any) => {
      //       console.log(precio);
      //       return {
      //         habitacion_id: precio.habitacion.id,
      //         precio_catalogo: precio.precio_catalogo 
      //       }
      //   })

      //   console.log(precios_catalogo);
      // }

      const sal: any =  {
        id: salida.id,
        fecha_salida_v2: salida.fecha_salida,
        fecha_regreso_v2: salida.fecha_regreso,
        moneda: salida.moneda.id,
        precio: salida.costo_base_desde,
        costo_base_hasta: salida.costo_base_hasta,
        senia: salida.senia,
        cupo: data.propio ? salida.cupo : null,
        cupos_habitaciones: salida.cupos_habitaciones,
        precios_catalogo_habitaciones: salida.precios_catalogo_habitaciones,
        precios_catalogo_hoteles: salida.precios_catalogo_hoteles,
        hoteles_ids: salida.hoteles.map((hotel: any) => hotel?.id),
        items_costo: salida.items_costo ?? [],
      }

      // if(data.propio)
      //   sal.ganancia = salida.ganancia;
      // else{
      //   sal.comision = salida.comision;
      // }
      

      return sal;
    })

    console.log('todas salidas: ', salidas);

    setSalidas(salidas);
    originalSalidasRef.current = JSON.parse(JSON.stringify(salidas));

    // Cargar ítems de costo por defecto del paquete
    if (data.propio && data.items_costo_default?.length) {
      setItemsCostoDefecto(data.items_costo_default.map((item: any) => ({
        tipo_costo_id: item.tipo_costo?.id,
        nombre: item.tipo_costo?.nombre,
        monto: Number(item.monto),
        dividir_por_pasajeros: item.tipo_costo?.dividir_por_pasajeros,
        _id: item.tipo_costo?.id,
      })));
    }
  }

  console.log(salidas)

  const toggleActivar = (modulo: Paquete) => {
    setOnDesactivarData(true);
    setDataADesactivar(modulo);
  }

  const handleCloseModal = () => {
    setOnDesactivarData(false);
  }

  const handleConfirmActivo = (activo=true) => {
    mutateDesactivar({ dataId: dataADesactivar!.id, activo, }) 
  }

  const handleVerDetalles = (data: Paquete) => {
    console.log(data)
    setDataDetalle(data);
    setOnVerDetalles(true);
  }

  const handleCloseVerDetalles = () => {
    setOnVerDetalles(false);
    setDataDetalle(undefined);
  }

  const handleDestinoNoSeleccionada = (value: boolean | undefined) => {
    setDestinoNoSeleccionada(value);
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


  useEffect(() => {
    if(activeTab === 'list'){
        queryClient.invalidateQueries({
                queryKey: ['puestos-disponibles'],
                exact: false
              });

        queryClient.invalidateQueries({
                queryKey: ['tipo-remuneracion-de-personas'],
                exact: false
              });
    }
  }, [activeTab]);

  useEffect(() => {
    if (tipoPaqueteSelected?.nombre === 'Comision' || tipoPaqueteSelected?.nombre === 'Comisión') {
      setValue("salario", "");
      clearErrors("salario");
    }else if (tipoPaqueteSelected?.nombre === 'Salario fijo') {
      setValue("porcentaje_comision", "");
      clearErrors("porcentaje_comision");
    }
  }, [tipoPaqueteSelected, setValue, clearErrors]);


  useEffect(() => {
    if (!propio) {
      setValueSalida('cupo', '', { shouldValidate: false }); // Limpia cupo si no es propio
      resetSalida({ cupo: '' }, { keepDefaultValues: true }); // Resetea solo cupo

      setValueSalida('ganancia', '', { shouldValidate: false }); // Limpia cupo si no es propio
      resetSalida({ ganancia: '' }, { keepDefaultValues: true }); // Resetea solo cupo
    }
    else{
      setValueSalida('precio_desde_editable', '', { shouldValidate: false }); // Limpia cupo si no es propio
      resetSalida({ precio_desde_editable: '' }, { keepDefaultValues: true }); // Resetea solo cupo

      setValueSalida('comision', '', { shouldValidate: false }); // Limpia cupo si no es propio
      resetSalida({ comision: '' }, { keepDefaultValues: true }); // Resetea solo cupo
    }
  }, [propio, setValueSalida, resetSalida]);



  const handleServicioToggle = (servicioId: number, precio: number) => {
    console.log(precio); 
    console.log(servicioId)
    console.log('selectedServicios: ', selectedServicios)

    setSelectedServicios((prev) => {
      const updated =
        prev.includes(servicioId)
          ? prev.filter((p) => p !== servicioId) // quitar
          : [...prev, servicioId];              // agregar

      return updated;
    });
  };


  /******************************************************
   *        INICIO DEL INICIALIZAR LOS CAMPO DE 
   *          precio_personalizado_servicio_ID
   *        
   ******************************************************/

    // 🔹 Observamos los precios personalizados
  const preciosPersonalizadosServicios = useWatch({ control });

// 🔹 Calculamos el total de servicios
const totalPrecioServiciosMemo = useMemo(() => {
  // 🧩 Si el paquete no es propio, no sumamos servicios
  if (!propio) {
    return 0;
  }

  // 🧩 Modo edición
  if (dataAEditar) {
    const hayCambios =
      selectedServicios.length > 0 ||
      Object.keys(preciosPersonalizadosServicios).length > 0;

    // 🔹 Si hay cambios activos, recalcular dinámicamente
    if (hayCambios) {
      return selectedServicios.reduce((acc, id) => {
        const servicio = dataServiciosList.find((s: any) => s.id === id);
        if (!servicio) return acc;

        const precioCustom =
          preciosPersonalizadosServicios?.[`precio_personalizado_servicio_${id}`] ?? null;

        const precioFinal =
          precioCustom !== null && precioCustom !== undefined && precioCustom !== ""
            ? Number(precioCustom)
            : Number(servicio.precio) > 0
            ? Number(servicio.precio)
            : Number(servicio.precio_base);

        return acc + (isNaN(precioFinal) ? 0 : precioFinal);
      }, 0);
    }

    // 🔹 Si no hay cambios, usar valor inicial del backend
    return totalPrecioServiciosEdicion ?? 0;
  }

  // 🔹 Modo creación
  return selectedServicios.reduce((acc, id) => {
    const servicio = dataServiciosList.find((s: any) => s.id === id);
    if (!servicio) return acc;

    const precioCustom =
      preciosPersonalizadosServicios?.[`precio_personalizado_servicio_${id}`] ?? null;

    const precioFinal =
      precioCustom !== null && precioCustom !== undefined && precioCustom !== ""
        ? Number(precioCustom)
        : Number(servicio.precio) > 0
        ? Number(servicio.precio)
        : Number(servicio.precio_base);

    return acc + (isNaN(precioFinal) ? 0 : precioFinal);
  }, 0);
}, [
  propio,
  dataAEditar,
  selectedServicios,
  preciosPersonalizadosServicios,
  totalPrecioServiciosEdicion,
  dataServiciosList,
]);

// 🔹 Calculamos el costo total del paquete
// Si no es propio, ignora los servicios (solo hoteles)
const costoTotalPaquete = calcularCostoPaquete(salidas, 0);

console.log("Costo total paquete:", costoTotalPaquete);
console.log("Total servicios memo:", totalPrecioServiciosMemo);

// 🔹 Inicializamos los campos de precios personalizados al entrar en edición
useEffect(() => {
  // 🧩 Solo si es propio cargamos los servicios
  if (propio && dataAEditar?.servicios?.length) {
    dataAEditar.servicios.forEach((servicio: any) => {
      const valor =
        servicio.precio && Number(servicio.precio) > 0
          ? servicio.precio
          : servicio.precio_base;
      setValue(`precio_personalizado_servicio_${servicio.servicio_id}`, valor);
    });

    // Calculamos y seteamos el total inicial
    const totalServicios = dataAEditar.servicios.reduce((acc, s: any) => {
      const precioValido =
        s.precio && Number(s.precio) > 0
          ? Number(s.precio)
          : Number(s.precio_base);
      return acc + (isNaN(precioValido) ? 0 : precioValido);
    }, 0);

    setTotalPrecioServiciosEdicion(totalServicios);
  }
}, [dataAEditar, propio, setValue]);

  useEffect(() => {
    if (!dataTipoCostoList?.length) return;
    const codigos = ['BUS', 'COORDINADOR'];
    const preseleccionados = dataTipoCostoList
      .filter((t: any) => codigos.includes(t.codigo))
      .map((t: any) => ({
        _id: Date.now() + t.id,
        tipo_costo_id: t.id,
        nombre: t.nombre,
        monto: null,
        dividir_por_pasajeros: t.dividir_por_pasajeros,
      }));
    setItemsCostoDefecto(preseleccionados);
  }, [dataTipoCostoList]);


  // FUNCIONES DE SALIDAS

  const handleOpenModal = () => {
    const monedaValue = watch('moneda');

    if (!selectedDestinoID) {
      handleShowToast('Debes seleccionar primero el destino', 'error');
      return;
    }

    if (!monedaValue) {
      handleShowToast('Debes seleccionar primero la moneda', 'error');
      return;
    }

    if(quitarAcentos(tipoPaqueteSelected?.nombre ?? '')?.toLowerCase() === 'terrestre' && !watch('cantidad_pasajeros')
      && watch('propio')){
      handleShowToast('Debes agregar la cantidad de pasajeros', 'error');
      return;
    }
      
    if(quitarAcentos(tipoPaqueteSelected?.nombre ?? '')?.toLowerCase() === 'terrestre')
        setValueSalida('cupo', watch('cantidad_pasajeros')); 

    setIsAddSalidaOpen(true);
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url); // Mostrar preview de la nueva imagen
    }
  };


  console.log(salidas)
    console.log([...selectedHotels])

  const selectedHotelsRef = useRef(selectedHotels);

  useEffect(() => {
    selectedHotelsRef.current = selectedHotels;
  }, [selectedHotels]);

  const handleAddSalida = async (dataForm: any) => {
    setValidando(true);
    const hotelesIds = Array.from(selectedHotelsRef.current);
    console.log(selectedHotelsRef);

    console.log(salidas)
    console.log(hotelesIds)
    console.log(selectedHotels)

    console.log(dataForm);
    console.log(nuevaSalida);

    const habitacionesCuposList = Object.entries(dataForm)
        .filter(([key, value]) => key.startsWith('cupo_habitacion_') && value != null)
        .map(([key, value]) => {
          // 🔹 Guardamos el valor
          const habitacion_id = Number(key.replace('cupo_habitacion_', ''));
          const cupo = Number(value);

          // 🔹 Eliminamos la propiedad del dataForm
          delete dataForm[key];

          return { habitacion_id, cupo };
        });

    // Primero recolectar precios por hotel (precio_habitacion_por_hotel_${hotel_id})
    const preciosCatalogoHoteles = Object.entries(dataForm)
        .filter(([key, value]) => key.startsWith('precio_habitacion_por_hotel_') && value != null)
        .map(([key, value]) => {
          // 🔹 Guardamos el valor
          const hotel_id = Number(key.replace('precio_habitacion_por_hotel_', ''));
          const precio_catalogo = Number(value);

          // 🔹 Eliminamos la propiedad del dataForm
          delete dataForm[key];

          return { hotel_id, precio_catalogo };
      });

    // Obtener IDs de hoteles que están en modo "hotel" (para excluir sus habitaciones)
    const hotelesEnModoHotel = preciosCatalogoHoteles.map(p => p.hotel_id);

    // Crear un Set de habitacion_ids que pertenecen a hoteles en modo "hotel"
    const habitacionesExcluidas = new Set<number>();
    dataHotelesList?.forEach((hotel: any) => {
      if (hotelesEnModoHotel.includes(hotel.id)) {
        hotel?.habitaciones?.forEach((habitacion: any) => {
          habitacionesExcluidas.add(habitacion.id);
        });
      }
    });

    // Recolectar precios por habitación (precio_paquete_habitacion_*)
    // SOLO de habitaciones que NO pertenecen a hoteles en modo "hotel"
    const precioCatalogoDistribuidora = Object.entries(dataForm)
        .filter(([key, value]) => key.startsWith('precio_paquete_habitacion_') && value != null)
        .map(([key, value]) => {
          // 🔹 Guardamos el valor
          const habitacion_id = Number(key.replace('precio_paquete_habitacion_', ''));
          const precio_catalogo = Number(value);

          // 🔹 Eliminamos la propiedad del dataForm
          delete dataForm[key];

          return { habitacion_id, precio_catalogo };
      })
      .filter(item => !habitacionesExcluidas.has(item.habitacion_id)); // Excluir habitaciones de hoteles en modo "hotel"

      console.log('Precios por habitación (solo modo room):', precioCatalogoDistribuidora);
      console.log('Precios por hotel (modo hotel):', preciosCatalogoHoteles); 
      console.log('Habitaciones excluidas:', Array.from(habitacionesExcluidas));
 

        // precio_paquete_habitacion_ precio_habitacion_por_hotel

      console.log(precioCatalogoDistribuidora); 
      console.log(dataForm); // 


    console.log(selectedHotels)
    

    console.log(hotelesIds)

    console.log(isEditMode);
    console.log(editingSalidaId);

    if (isEditMode && editingSalidaId) {
        console.log(precioCatalogoDistribuidora)
        console.log(preciosCatalogoHoteles)

      // 🔹 Editando habitación existente
      const salidaEdited: any = {...dataForm,
        costo_base_desde: dataForm.precio_desde_editable,
        costo_base_hasta: dataForm?.precio_hasta_editable,
        hoteles_ids:hotelesIds,
        cupos_habitaciones: habitacionesCuposList,
        precios_catalogo_habitaciones: precioCatalogoDistribuidora,
        precios_catalogo_hoteles: preciosCatalogoHoteles,
        currency: watch('moneda')};

      delete salidaEdited.precio;
      
      delete salidaEdited.precio_desde_editable;
      delete salidaEdited.precio_hasta_editable;
      delete salidaEdited.precio_desde;
      delete salidaEdited.precio_hasta;

      if(!propio && !salidaEdited?.costo_base_hasta){
        delete salidaEdited.costo_base_hasta;
      }

      if (propio) {
        salidaEdited.items_costo_override_data = itemsCostoSalida
          .filter((i: any) => i.origen === 'override')
          .map((i: any) => ({ tipo_costo_id: i.tipo_costo_id, monto: i.monto }));
      }

      console.log(salidas)
      console.log(salidaEdited)
      console.log(editingSalidaId)

      setSalidas((prev) =>
        prev.map((salida) => {
          console.log(salida)
          console.log(editingSalidaId)
          if(salida.id === editingSalidaId){
            console.log('iguales');
            return { 
              // ...salida,
              ...salidaEdited, 
              senia: salidaEdited.senia  
            };
          }
            // Reemplazamos los valores con los del formulario
          else{
            console.log('no iguales');
            return salida;
          }
        })
      );
    } else {
      console.log(nuevaSalida);
      console.log(dataForm)
      const salida: any = {
        id: Date.now().toString(), // ID temporal
        ...dataForm,
        costo_base_desde: dataForm.precio_desde_editable,
        costo_base_hasta: dataForm?.precio_hasta_editable,
        cupos_habitaciones: habitacionesCuposList,
        precios_catalogo_habitaciones: precioCatalogoDistribuidora,
        precios_catalogo_hoteles: preciosCatalogoHoteles,
        hoteles_ids: hotelesIds,
        currency: watch('moneda'), // o nuevaSalida.currency
      };


      delete salida.precio_desde_editable;
      delete salida.precio_desde;
      delete salida.precio_hasta_editable;
      delete salida.precio_hasta;
      if(!propio && !salida?.costo_base_hasta){
        delete salida.costo_base_hasta;
      }

      if (!propio) delete salida.ganancia;
      if (propio) delete salida.comision;

      if (propio) {
        const overridesNueva = itemsCostoSalida.filter((i: any) => i.origen === 'override');
        if (overridesNueva.length > 0) {
          salida.items_costo_override_data = overridesNueva.map((i: any) => ({
            tipo_costo_id: i.tipo_costo_id,
            monto: i.monto,
          }));
        }
      }

      console.log(salida);

      setSalidas((prev) => {
        console.log(prev)
        return [...prev, salida]
      });
    }


    setIsAddSalidaOpen(false); // 🔹 Cerrar modal inmediatamente
    // Resetear formulario
    resetSalidaForm();
  };

  const handleDeleteRoom = (roomId: string) => {
    setSalidas((prev) => prev.filter((salida) => salida.id !== roomId))
  }


  const handleCadenaNoSeleccionada = (value: boolean | undefined) => {
    console.log(value)
    console.log(selectedZonaGeograficaID)
    // setCadenaNoSeleccionada(value); 
  }

  const resetSalidaForm = () => {
    setSelectedHotels(new Set());
    // setSalidas([])

    setNuevaSalida({
      fecha_salida_v2: "",
      fecha_regreso_v2: "",
      precio: '',
      senia: '',
      cupo: "",
      ganancia: '',
      comision: '',
    })

    // 🔹 Limpiar campos dinámicos de precios_catalogo
    const formValues = getValuesSalida();
    Object.keys(formValues).forEach((key) => {
      if (key.startsWith('precio_paquete_habitacion_') || key.startsWith('precio_habitacion_por_hotel_') || key.startsWith('cupo_habitacion_')) {
        setValueSalida(key, undefined);
      }
    });

    resetSalida({
      precio_desde: '',
      cantidadNoche: '',
      precio_hasta: '',
      precio_hasta_editable: '',
      precio_desde_editable: '',
      senia: '',
      fecha_salida_v2: '',
      ganancia: '',
      comision: '',
      cupo: propio ? '' : undefined,
    });
    setIsAddSalidaOpen(false);
    setIsEditMode(false);
    setEditingSalidaId(null);
    setValidando(false);
    setModoPrecio({}) // Resetear modo de precio
  }
  

const handleSubmitClick = async () => {
    if (validando) return;

    setValidando(true);
    const isValid = await trigger();
    if (isValid) {
      setTimeout(() => {
        handleSubmitSalida(handleAddSalida)();
      }, 0);
    } else {
      if (errorsSalida?.fecha_salida_v2) {
        const errorMessage = typeof errorsSalida.fecha_salida_v2.message === 'string'
          ? errorsSalida.fecha_salida_v2.message
          : 'La fecha de salida es inválida';
        handleShowToast(errorMessage, 'error');
      } else if (errorsSalida?.fecha_regreso_v2) {
        const errorMessage = typeof errorsSalida.fecha_regreso_v2.message === 'string'
          ? errorsSalida.fecha_regreso_v2.message
          : 'La fecha de regreso es inválida';
        handleShowToast(errorMessage, 'error');
      } else {
        handleShowToast('Debes completar los campos requeridos', 'error');
      }
      setValidando(false);
    }
  };


  /**
   * RESETEO DE LOS CAMPOS DEL FORMULARIO SALIDA
   */
  // useEffect(() => {
  //   if (!editingSalidaId || !isAddSalidaOpen) return;

  //   const salida = dataAEditar?.salidas?.find(
  //     (s: any) => s.id.toString() === editingSalidaId.toString()
  //   );

  //   if (!salida) return;

  //   salida.cupos_habitaciones?.forEach((habitacion: any) => {
  //     const fieldName = `cupo_habitacion_${habitacion.habitacion.id}`;
  //     const value = habitacion.cupo ?? '';
  //     setValueSalida(fieldName, value);
  //   });
  // }, [editingSalidaId, selectedHotels, isAddSalidaOpen, dataAEditar?.salidas, setValueSalida]);

  /**
   * RESETEO DE LOS CAMPOS DEL FORMULARIO SALIDA
   */
  useEffect(() => {
    if (!editingSalidaId || !isAddSalidaOpen) return;

    const salida = salidas?.find(
      (s: any) => s.id.toString() === editingSalidaId.toString()
    );

    if (!salida) return;

    // Cupos por habitación
    salida.cupos_habitaciones?.forEach((habitacion: any) => {
      const habitacionId = habitacion.habitacion?.id ?? habitacion.habitacion_id;
      if (habitacionId) setValueSalida(`cupo_habitacion_${habitacionId}`, habitacion.cupo ?? '');
    });

    // Precios por hotel (precio_habitacion_por_hotel_)
    salida.precios_catalogo_hoteles?.forEach((ph: any) => {
      const hotelId = ph.hotel?.id ?? ph.hotel_id;
      if (hotelId) setValueSalida(`precio_habitacion_por_hotel_${hotelId}`, ph.precio_catalogo ?? '');
    });

    // Precios por habitación individual (solo para hoteles en modo habitación)
    salida.precios_catalogo_habitaciones?.forEach((pc: any) => {
      const habitacionId = pc.habitacion?.id ?? pc.habitacion_id;
      if (habitacionId) setValueSalida(`precio_paquete_habitacion_${habitacionId}`, pc.precio_catalogo ?? '');
    });
  }, [editingSalidaId, selectedHotels, isAddSalidaOpen, salidas, setValueSalida]);

  useEffect(() => {
    if (!isAddSalidaOpen || isEditMode) return;
    setItemsCostoSalida(
      itemsCostoDefecto.map((item: any) => ({
        tipo_costo_id: item.tipo_costo_id,
        nombre: item.nombre,
        monto: item.monto,
        dividir_por_pasajeros: item.dividir_por_pasajeros,
        origen: 'paquete',
      }))
    );
  }, [isAddSalidaOpen]);


  const handleEditSalida = (salida: any) => {
    console.log('salida a editar: ', salida);
    console.log('salida a editar: ', salida.precios_catalogo_habitaciones);
    // console.log(propio);

    // Construir el objeto de reset incluyendo precios por habitación y por hotel
    const resetObj: any = {
      ...salida,
      precio_desde_editable: salida.precio ?? salida.costo_base_desde,
      precio_hasta_editable: salida?.costo_base_hasta,
      precio_hasta: salida?.costo_base_hasta ?? '',
      precio_desde: salida.precio ?? salida.costo_base_desde,
    };

  //   [
  //   {
  //     habitacion: {
  //       id: 103,
  //       tipo_habitacion: 'Doble',
  //       capacidad: 2,
  //       hotel: 'Hotel Prueba Las Vegas'
  //     },
  //     precio_catalogo: 2400000
  //   },
  //   {
  //     habitacion: {
  //       id: 104,
  //       tipo_habitacion: 'Triple',
  //       capacidad: 3,
  //       hotel: 'Hotel Prueba Las Vegas'
  //     },
  //     precio_catalogo: 2400000
  //   }
  // ]

  console.log('resetObj: ', resetObj)

    // Precios por habitación (de precios_catalogo_habitaciones)
    salida.precios_catalogo_habitaciones?.forEach((hab: any) => {
      const habitacionId = hab.habitacion?.id ?? hab.habitacion_id;
      console.log(habitacionId)
      if (habitacionId) resetObj[`precio_paquete_habitacion_${habitacionId}`] = hab.precio_catalogo; 
    });


  //     {
  //   id: 288,
  //   fecha_salida_v2: '2026-04-19',
  //   fecha_regreso_v2: '2026-04-26',
  //   moneda: 1,
  //   precio: 2200000,
  //   costo_base_hasta: 2600000,
  //   senia: 450000,
  //   cupo: 46,
  //   cupos_habitaciones: [
  //     {
  //       habitacion: {
  //         id: 104,
  //         tipo_habitacion: 'Triple',
  //         capacidad: 3,
  //         hotel: 'Hotel Prueba Las Vegas'
  //       },
  //       cupo: 3
  //     },
  //     {
  //       habitacion: {
  //         id: 103,
  //         tipo_habitacion: 'Doble',
  //         capacidad: 2,
  //         hotel: 'Hotel Prueba Las Vegas'
  //       },
  //       cupo: 10
  //     },
  //     {
  //       habitacion: {
  //         id: 102,
  //         tipo_habitacion: 'Doble',
  //         capacidad: 2,
  //         hotel: 'Hotel Prueba Reserva 2'
  //       },
  //       cupo: 5
  //     },
  //     {
  //       habitacion: {
  //         id: 101,
  //         tipo_habitacion: 'Single',
  //         capacidad: 1,
  //         hotel: 'Hotel Prueba Reserva 2'
  //       },
  //       cupo: 7
  //     }
  //   ],
  //   precios_catalogo_habitaciones: [
  //     {
  //       habitacion: {
  //         id: 103,
  //         tipo_habitacion: 'Doble',
  //         capacidad: 2,
  //         hotel: 'Hotel Prueba Las Vegas'
  //       },
  //       precio_catalogo: 2400000
  //     },
  //     {
  //       habitacion: {
  //         id: 104,
  //         tipo_habitacion: 'Triple',
  //         capacidad: 3,
  //         hotel: 'Hotel Prueba Las Vegas'
  //       },
  //       precio_catalogo: 2400000
  //     }
  //   ],
  //   precios_catalogo_hoteles: [
  //     {
  //       hotel: { id: 47, nombre: 'Hotel Prueba Las Vegas' },
  //       precio_catalogo: 2400000
  //     }
  //   ],
  //   hoteles_ids: [ 47, 46 ],
  //   items_costo: [
  //     {
  //       tipo_costo_id: 1,
  //       nombre: 'Bus',
  //       dividir_por_pasajeros: true,
  //       monto: 4200000,
  //       monto_por_pasajero: 91304.34782608696,
  //       origen: 'paquete'
  //     },
  //     {
  //       tipo_costo_id: 2,
  //       nombre: 'Coordinador',
  //       dividir_por_pasajeros: false,
  //       monto: 400000,
  //       monto_por_pasajero: 400000,
  //       origen: 'paquete'
  //     }
  //   ],
  //   ganancia: null,
  //   precio_desde_editable: 2200000,
  //   precio_hasta_editable: 2600000,
  //   precio_hasta: 2600000,
  //   precio_desde: 2200000,
  //   precio_paquete_habitacion_103: 2400000,
  //   precio_paquete_habitacion_104: 2400000
  // }

    console.log('resetObj: ', resetObj)

    // Precio por hotel (de precios_catalogo_hoteles)
    salida.precios_catalogo_hoteles?.forEach((ph: any) => {
      const hotelId = ph.hotel?.id ?? ph.hotel_id;
      if (hotelId) resetObj[`precio_habitacion_por_hotel_${hotelId}`] = ph.precio_catalogo;
    });

    // precio_paquete_habitacion_103: 2400000,
    // precio_paquete_habitacion_104: 2400000,
    // precio_habitacion_por_hotel_47: 2400000
    console.log('resetObj: ', resetObj)

    resetSalida(resetObj);

    setEditingSalidaId(salida.id);
    setIsEditMode(true);
    setIsAddSalidaOpen(true);

    if (salida.items_costo && salida.items_costo.length > 0) {
      setItemsCostoSalida(salida.items_costo.map((item: any) => ({
        tipo_costo_id: item.tipo_costo_id,
        nombre: item.nombre,
        monto: Number(item.monto),
        dividir_por_pasajeros: item.dividir_por_pasajeros,
        origen: item.origen,
      })));
    } else {
      setItemsCostoSalida(itemsCostoDefecto.map((item: any) => ({
        tipo_costo_id: item.tipo_costo_id,
        nombre: item.nombre,
        monto: item.monto,
        dividir_por_pasajeros: item.dividir_por_pasajeros,
        origen: 'paquete',
      })));
    }

    console.log(salidas);
    console.log(salida.hoteles_ids)
    // const hotelesIds = salida.hoteles_ids.map((hotel: any) => hotel.id);
    console.log(salida.hoteles_ids);

    setSelectedHotels(new Set(salida.hoteles_ids.map(Number)));

    console.log(salida);
    console.log(salida.moneda);
    console.log(salida.currency);
    // Si usas react-hook-form u otro Controller, setea también el value del select/Controller
    setValue('moneda', salida?.moneda?.toString() ?? salida?.currency?.toString());

    // Determinar el modo de precio para cada hotel basado en los datos guardados
    const nuevoModoPrecio: Record<string, PriceMode> = {};

    salida.hoteles_ids.forEach((hotelId: number) => {
      // Si el hotel aparece en precios_catalogo_hoteles, está en modo "hotel"
      const precioHotel = salida.precios_catalogo_hoteles?.find((ph: any) => (ph.hotel?.id ?? ph.hotel_id) === hotelId);

      if (precioHotel) {
        nuevoModoPrecio[hotelId] = 'hotel';
      } else {
        nuevoModoPrecio[hotelId] = 'room';
      }
    });

    setModoPrecio(nuevoModoPrecio);
  };

    // FUNCIONES DE SALIDAS


    const fechaSalida = watchSalida('fecha_salida_v2');
    const fechaRegreso = watchSalida('fecha_regreso_v2');
    console.log(fechaSalida, fechaRegreso) 

    // console.log(rangoPrecio);

    useEffect(() => {
      // console.log(dataHotelesList)
      console.log(selectedHotels); 
      console.log(fechaSalida);
      console.log(fechaRegreso);
      console.log(dataHotelesList);
      console.log([...selectedHotels].length);  


      if(fechaSalida){
          const selectedDate = new Date(fechaSalida);
          console.log(selectedDate)
          const today = new Date();
          console.log(today)
          today.setHours(0, 0, 0, 0); 

          if (selectedDate < today) {
            handleShowToast('La fecha de salida no puede ser anterior a hoy', 'error');
          }
      }

      if(fechaRegreso){
          const selectedDate = new Date(fechaRegreso);
          console.log(selectedDate)
          const today = new Date();
          console.log(today)
          today.setHours(0, 0, 0, 0); 

          if (selectedDate < today) {
            handleShowToast('La fecha de regreso no puede ser anterior a hoy', 'error');
          }
      }

      // const idsSeleccionados = Array.from(selectedHotels).map(id => Number(id));

      if (selectedHotels && [...selectedHotels].length && fechaSalida && fechaRegreso && dataHotelesList) {
        if(fechaRegreso < fechaSalida){
          handleShowToast('La fecha de regreso debe ser mayor a la fecha de salida', 'error');
          return;
        }

        const hotelesFiltrados = dataHotelesList?.filter((hotel: any) =>
          selectedHotels.has(hotel.id) // o idsSeleccionados.includes(hotel.id)
        );

        // console.log(selectedHotels); 
        // console.log(dataHotelesList)
        // console.log('[debug] hotelesFiltrados: ', hotelesFiltrados); 
        // console.log(fechaSalida, fechaRegreso)
          // { min: 1680, max: 1760, dias: 8, noches: 8 }                  
        const monedaActual = dataMonedaList?.find((m: Moneda) => m.id.toString() === monedaSeleccionada?.toString());
        const monedaPaqueteCodigo = monedaActual?.codigo ?? 'USD';
        const cotizacionVigente = dataCotizacion?.valor_en_guaranies ? Number(dataCotizacion.valor_en_guaranies) : undefined;

        const rangoPrecioDesdeHasta = calcularRangoPrecio(hotelesFiltrados, fechaSalida, fechaRegreso, monedaPaqueteCodigo, cotizacionVigente);
        if(propio){
          if(rangoPrecioDesdeHasta.sinCotizacion){
            handleShowToast('No hay cotización vigente. No se puede calcular el precio para habitaciones con moneda diferente al paquete.', 'error');
            setValueSalida('precio_desde', '');
            setValueSalida('precio_hasta', '');
          } else {
            const precioDesdeConvertido = Math.round(rangoPrecioDesdeHasta.precioMin);
            const precioHastaConvertido = Math.round(rangoPrecioDesdeHasta.precioMax);
            setValueSalida('precio_desde', precioDesdeConvertido.toString());
            setValueSalida('precio_hasta', precioHastaConvertido.toString());
          }
        }

      } 

      if(fechaSalida && fechaRegreso){
        if(fechaRegreso < fechaSalida){
          handleShowToast('La fecha de regreso debe ser mayor a la fecha de salida', 'error');
          return;
        }
        setValueSalida('cantidadNoche', calculateNoches(fechaSalida, fechaRegreso).toString());
      }
      // 👇 dependencias simples, sin llamadas complejas
    }, [selectedHotels, fechaSalida, fechaRegreso, setValueSalida, dataHotelesList, monedaSeleccionada, dataMonedaList, dataCotizacion, propio]);


    // 🔹 Auto-calcular precio_desde / precio_hasta a partir de los precios ingresados
    // Los precios ingresados son PRECIOS FINALES TOTALES en la MISMA moneda del paquete
    // Aplica tanto para paquetes propios como de distribuidora
    useEffect(() => {
      // Observar todos los valores del formulario de salida
      const formValues = getValuesSalida();
      
      // Extraer precios del catálogo (precio_paquete_habitacion_* y precio_habitacion_por_hotel_*)
      const preciosCatalogo: number[] = [];
      
      Object.entries(formValues).forEach(([key, value]) => {
        if ((key.startsWith('precio_paquete_habitacion_') || key.startsWith('precio_habitacion_por_hotel_')) && value) {
          const precio = Number(value);
          if (!isNaN(precio) && precio > 0) {
            preciosCatalogo.push(precio);
          }
        }
      });

      console.log('🔹 [DISTRIBUIDORA] Precios del catálogo extraídos:', preciosCatalogo);

      if (preciosCatalogo.length === 0) {
        // Si no hay precios, limpiar los campos
        setValueSalida('precio_desde_editable', '');
        setValueSalida('precio_hasta_editable', '');
        return;
      }

      // Calcular mínimo y máximo DIRECTAMENTE de los precios finales ingresados
      // ⚠️ NO SE MULTIPLICA POR NOCHES (ya son precios finales)
      // ⚠️ NO SE APLICA CONVERSIÓN (ya están en la moneda del paquete)
      const precioMin = Math.min(...preciosCatalogo);
      const precioMax = Math.max(...preciosCatalogo);

      console.log('🔹 [DISTRIBUIDORA] Precio mínimo:', precioMin);
      console.log('🔹 [DISTRIBUIDORA] Precio máximo:', precioMax);

      // Actualizar los campos directamente (sin conversión)
      setValueSalida('precio_desde_editable', precioMin.toString());
      
      setValueSalida('precio_hasta_editable', precioMax.toString());
    }, [
      propio,
      getValuesSalida,
      setValueSalida,
      preciosCatalogoTrigger, // Se actualiza cuando cambian los precios del catálogo
    ]);


    //FUCNIONES DE HOTELES DE LAS SALIDAS
    // FUNCIONES DE HOTELES DE LAS SALIDAS
  const handleHotelToggle = (hotelId: string, hotel: any) => {
    console.log(hotel);

    {
      // Selección múltiple
      const newSelected = new Set(selectedHotels);
      const newPrices = { ...hotelPrices };

      if (newSelected.has(hotelId)) {
        newSelected.delete(hotelId);
        delete newPrices[hotelId];
      } else {
        newSelected.add(hotelId);
        newPrices[hotelId] = { single: 0, doble: 0, triple: 0 };

        // Inicializar modo de precio si no existe
        if (!modoPrecio[hotelId]) {
          setModoPrecio(prev => ({
            ...prev,
            [hotelId]: 'hotel'
          }));
        }

        // Si modoPrecio de este hotel === 'hotel', asignar el valor de precio_habitacion_por_hotel_${hotelId} a los campos precio_paquete_habitacion_*
        if (modoPrecio[hotelId] === 'hotel') {
          const precioHotel = getValuesSalida(`precio_habitacion_por_hotel_${hotelId}`);
          if (precioHotel && precioHotel > 0) {
            hotel?.habitaciones?.forEach((habitacion: any) => {
              setValueSalida(`precio_paquete_habitacion_${habitacion.id}`, precioHotel);
            });
          }
        }
      }

      setSelectedHotels(newSelected);
      setHotelPrices(newPrices);
    }
  };


    //FUCNIONES DE HOTELES DE LAS SALIDAS


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



  const handleModeChange = (hotelId: string, newMode: PriceMode) => {
    setModoPrecio(prev => ({
      ...prev,
      [hotelId]: newMode
    }))

    // Si se cambia a modo 'hotel', resetear los campos precio_paquete_habitacion_* de este hotel con el valor de precio_habitacion_por_hotel
    if (newMode === 'hotel') {
      const hotel = dataHotelesList?.find((h: any) => h.id === hotelId);
      if (hotel) {
        const precioHotel = getValuesSalida(`precio_habitacion_por_hotel_${hotelId}`);
        if (precioHotel && precioHotel > 0) {
          hotel?.habitaciones?.forEach((habitacion: any) => {
            setValueSalida(`precio_paquete_habitacion_${habitacion.id}`, precioHotel);
          });
        }
      }
    }

    // if (onPriceChange && price) {
    //   onPriceChange(Number.parseFloat(price), newMode)
    // }
  }


  return (
    <>
      {onVerDetalles &&
        <Modal onClose={handleCloseVerDetalles} claseCss={'mdsdsodal-detalles'}>
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="modal-detalles-reserva bg-white/95 rounded-xl shadow-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto backdrop-blur-sm">
                    {/* Header con imagen */}
                    <div className="relative">
                      <img
                        src={dataDetalle!.imagen ?? placeholderViaje}
                        alt={dataDetalle?.nombre}
                        className="w-full h-90 object-cover rounded-t-xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-t-xl" />

                      <div className="absolute top-4 left-4 flex space-x-2">
                        <span className={`px-4 py-2 rounded-full text-xs font-medium ${
                          dataDetalle?.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {dataDetalle?.activo ? 'Activo' : 'Inactivo'}
                        </span>
                        <span className="px-4 py-2 bg-[rgba(0,0,0,0.2)] text-white text-xs font-medium rounded-full">
                          {dataDetalle?.tipo_paquete.nombre}
                        </span>
                      </div>
                      
                      {/* Botones de acción en la imagen */}
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

                      {/* Información superpuesta */}
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex items-start justify-between">
                          <div>
                            {/* <div className="flex items-center space-x-3 mb-3">
                              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(pkg.category)}`}>
                                {getCategoryLabel(pkg.category)}
                              </span>
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                pkg.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                              }`}>
                                <div className={`w-2 h-2 rounded-full mr-2 ${
                                  pkg.isActive ? 'bg-green-200' : 'bg-red-200'
                                }`} />
                                {pkg.isActive ? 'Activo' : 'Inactivo'}
                              </div>
                            </div> */}
                            <h1 className="text-4xl font-bold text-white mb-2">{dataDetalle?.nombre}</h1>
                            {dataDetalle?.codigo && (
                              <div className="mb-2">
                                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 font-mono text-lg px-3 py-1">
                                  {dataDetalle.codigo}
                                </Badge>
                              </div>
                            )}
                            <div className="flex items-center text-white/90 text-lg">
                              <MapPin className="w-5 h-5 mr-2" />
                              <span>{dataDetalle?.destino.ciudad}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-5xl font-bold text-white mb-1">{dataDetalle?.moneda.simbolo}{formatearSeparadorMiles.format(dataDetalle?.precio_venta_desde ?? 0)}</div>
                            <div className="text-white/80">por persona</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {!dataDetalle?.propio && 
                      <>
                        <div className="p-4 bg-blue-50 border-l-4 border-l-blue-500">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-blue-900">Distribuido por</div>
                                <div className="text-lg font-bold text-blue-800">{dataDetalle?.distribuidora?.nombre}</div>
                              </div>
                            </div>
                          
                          </div>
                        </div>
                        <Separator />
                      </>
                    }

                    {/* Contenido principal */}
                    <div className="p-8">
                      {/* Métricas principales */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {dataDetalle?.fecha_inicio &&
                          <div className="bg-blue-50 p-6 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                              <Clock className="w-8 h-8 text-blue-600" />
                              <span className="text-2xl font-bold text-blue-600">{getDaysBetweenDates(dataDetalle?.fecha_inicio ?? '', dataDetalle?.fecha_fin ?? '')}</span>
                            </div>
                            <h3 className="font-semibold text-gray-900">Duración</h3>
                            <p className="text-sm text-gray-600">días de viaje</p>
                          </div>
                        }

                        {!dataDetalle?.fecha_inicio &&
                          <div className="bg-blue-50 p-6 rounded-xl">
                            <div className="flex items-center justify-center mb-3">
                              <Clock className="w-8 h-8 text-blue-600" />
                              {/* <span className="text-2xl font-bold text-blue-600">{getDaysBetweenDates(dataDetalle?.fecha_inicio ?? '', dataDetalle?.fecha_fin ?? '')}</span> */}
                            </div>
                            <h3 className="font-semibold text-gray-900 flex items-center justify-center">Variable</h3>
                            <p className="text-sm text-gray-600 flex items-center justify-center">Duracion segun fechas</p>
                          </div>
                        }

                        {dataDetalle?.propio && 
                          <div className="bg-green-50 p-6 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                              <Users className="w-8 h-8 text-green-600" />
                              <span className="text-2xl font-bold text-green-600">10/{dataDetalle?.cantidad_pasajeros}</span>
                            </div>
                            <h3 className="font-semibold text-gray-900">Ocupación</h3>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                // style={{ width: `${occupancyPercentage}%` }}
                              />
                            </div>
                          </div>
                        }

                        {!dataDetalle?.propio && 
                          <div className="bg-green-50 p-6 rounded-xl">
                            <div className="flex items-center justify-center mb-3">
                              <Users className="w-8 h-8 text-green-600" />
                              {/* <span className="text-2xl font-bold text-green-600">10/{dataDetalle?.cantidad_pasajeros}</span> */}
                            </div>
                            <h3 className="font-semibold text-gray-900 flex items-center justify-center">Flexible</h3>
                            <div className="w-full rounded-full flex items-center justify-center text-center">
                              {/* <div 
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                
                              /> */}
                              Pasajeros según solicitud
                            </div>
                          </div>
                        }

                        {dataDetalle?.fecha_inicio &&
                          <div className="bg-emerald-50 p-6 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                              <Calendar className="w-8 h-8 text-emerald-600" />
                              <div className="text-right">
                                <div className="text-lg font-bold text-emerald-600">
                                  {new Date(dataDetalle!.fecha_inicio ?? '').toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                                </div>
                              </div>
                            </div>
                            <h3 className="font-semibold text-gray-900">Inicio</h3>
                            <p className="text-sm text-gray-600">{new Date(dataDetalle!.fecha_inicio ?? '').toLocaleDateString()}</p>
                          </div>
                        }

                        {!dataDetalle?.fecha_inicio &&
                          <div className="bg-emerald-50 p-6 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-right flex items-center justify-center w-full">
                                <div className="font-semibold flex items-center justify-center ">
                                  {/* {new Date(dataDetalle!.fecha_inicio ?? '').toLocaleDateString('es', { day: 'numeric', month: 'short' })} */}
                              <Calendar className="w-8 h-8 text-emerald-600" />
                                  {/* Flexible */}
                                </div>
                              </div>
                            </div>
                            <h3 className="font-semibold text-gray-900 flex items-center justify-center">Flexible</h3>
                            <p className="text-sm text-gray-600 flex items-center justify-center">Fechas a coordinar</p>
                          </div>
                        }

                        <div className="bg-orange-50 p-6 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <Star className="w-8 h-8 text-orange-600" />
                            <span className="text-2xl font-bold text-orange-600">4.8</span>
                          </div>
                          <h3 className="font-semibold text-gray-900">Valoración</h3>
                          <p className="text-sm text-gray-600">basada en 127 reseñas</p>
                        </div>
                      </div>

                      {/* Descripción */}
                      <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Detallles del Viaje</h2>
                        {/* <p className="text-gray-700 leading-relaxed text-lg">{dataDetalle?.description}</p> */}
                      </div>

                      {/* Fechas detalladas */}
                      <div className="bg-gray-50 p-6 rounded-xl mb-8">
                        {(quitarAcentos(dataDetalle?.tipo_paquete?.nombre ?? "").toLowerCase() === 'terrestre' && dataDetalle?.fecha_inicio)
                            &&
                              <>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Salida más próxima</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                      <Plane className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-gray-900">Salida</h4>
                                      <p className="text-gray-600">{new Date(dataDetalle!.fecha_inicio ?? '').toLocaleDateString('es', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' ,
                                        timeZone: 'UTC', 
                                      })}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                      <Calendar className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-gray-900">Regreso</h4>
                                      <p className="text-gray-600">{new Date(dataDetalle!.fecha_fin ?? '').toLocaleDateString('es', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' ,
                                        timeZone: 'UTC', 
                                      })}</p>
                                    </div>
                                  </div>
                                </div>
                              </>
                            }

                            {(quitarAcentos(dataDetalle?.tipo_paquete?.nombre ?? "").toLowerCase() !== 'terrestre' || !dataDetalle?.fecha_inicio) &&
                              <>
                                <div className="p-4 bg-gradient-to-r from-sky-50 to-sky-100 border-l-4 border-l-sky-500">
                                  <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-sky-200 flex items-center justify-center shadow-sm">
                                      <Calendar className="h-6 w-6 text-sky-700" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-sky-700 uppercase tracking-wide">Paquete {dataDetalle?.tipo_paquete.nombre}</div>
                                      <div className="text-lg font-bold text-sky-900">Fechas y pasajeros flexibles</div>
                                      <div className="text-sm text-sky-700 mt-1">
                                        Disponible todo el año • Grupos de cualquier tamaño • Salidas programadas
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <Separator />
                                </>
                            }
                      </div>

                      <div className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                          Zona Geográfica
                        </h3>
                        <div className="flex items-center gap-3 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl px-5 py-4">
                          <MapPin size={24} className="text-blue-600" />
                          <span className="text-lg font-medium text-slate-800">{dataDetalle?.zona_geografica?.nombre ?? 'Zona no asignada'}</span>
                        </div>
                      </div>

                      {/* Servicios incluidos y excluidos */}
                      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 mb-8">
  {/* Columna: Salidas */}
  <div>
    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
      <div className="w-3 h-3 bg-green-500 rounded-full mr-3" />
      Salidas
    </h3>

    <div className="space-y-4 max-h-60 overflow-y-auto">
      {dataDetalle?.salidas?.map((item, index) => (
        <div key={index} className="flex flex-wrap justify-between gap-4 p-4 bg-green-50 rounded-lg">
          
          {/* Salida */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-2 rounded-xl">
              <Plane className="text-green-600 transform rotate-45" size={16} /> 
            </div>
            <div>
              <p className="text-sm text-slate-500">Salida</p>
              <p className="font-semibold text-slate-800">
                {formatearFecha(item?.fecha_salida, false)}
              </p>
            </div>
          </div>

          {/* Regreso */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-100 to-red-100 p-2 rounded-xl">
              <Plane className="text-orange-600 transform -rotate-45" size={16} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Regreso</p>
              <p className="font-semibold text-slate-800">
                {formatearFecha(item?.fecha_regreso, false)}
              </p>
            </div>
          </div>

          {/* Precio actual */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-100 to-blue-100 p-2 rounded-xl text-blue-600">
              {dataDetalle?.moneda?.simbolo}
            </div>
            <div>
              <p className="text-sm text-slate-500">Precio actual</p>
              <p className="font-semibold text-slate-800">
                {/* {formatearSeparadorMiles.format(item?.precio_actual)} */}
                {formatearSeparadorMiles.format(item?.precio_venta_total_min ?? 0)}
              </p>
            </div>
          </div>

          {/* Precio final en guaranies*/}
          <div className="flex items-center gap-3">
            {item?.precio_moneda_alternativa?.moneda === 'PYG' ?
              <div className="bg-gradient-to-br from-blue-100 to-blue-100 p-2 rounded-xl text-blue-600">
                Gs
              </div>
             :
              <div className="bg-gradient-to-br from-blue-100 to-blue-100 p-2 rounded-xl text-blue-600">
                $
              </div>
             }

            
            

            {item?.moneda?.nombre?.toLowerCase() === 'dolar'}
            <div>
              <p className="text-sm text-slate-500">Precio (conversion)</p>
              <p className="font-semibold text-slate-800">
                {formatearSeparadorMiles.format(item?.precio_moneda_alternativa?.precio_venta_min ?? 0)}
              </p>
            </div>
          </div>

        </div>
      ))}
    </div>
  </div>

  {/* Columna: Servicios Incluidos */}
  <div>
    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
      <div className="w-3 h-3 bg-green-500 rounded-full mr-3" />
      Servicios Incluidos
    </h3>

    <div className="space-y-4 max-h-60 overflow-y-auto">
      {dataDetalle?.servicios?.map((item, index) => (
        <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            {index === 0 && <Hotel className="w-3 h-3 text-green-600" />}
            {index === 1 && <Car className="w-3 h-3 text-green-600" />}
            {index === 2 && <Users className="w-3 h-3 text-green-600" />}
            {index > 2 && <div className="w-2 h-2 bg-green-600 rounded-full" />}
          </div>
          <div>
            <p className="font-medium text-green-900">{item.nombre_servicio}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>


                      {/* Información adicional */}
                      <div className="bg-blue-50 p-6 rounded-xl mb-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Información Adicional</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                          <div>
                            {dataDetalle?.codigo && (
                              <p className="text-gray-600 mb-2">
                                <strong>Código:</strong> 
                                <Badge className="ml-2 bg-blue-100 text-blue-700 border-blue-200 font-mono font-semibold">
                                  {dataDetalle.codigo}
                                </Badge>
                              </p>
                            )}
                            <p className="text-gray-600 mb-2"><strong>Creado:</strong> {new Date(dataDetalle!.fecha_creacion).toLocaleDateString()}</p>
                            <p className="text-gray-600"><strong>Última actualización:</strong> {new Date(dataDetalle!.fecha_modificacion).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-2"><strong>Capacidad máxima:</strong> {dataDetalle?.cantidad_pasajeros ? `${dataDetalle?.cantidad_pasajeros} personas`: 'Flexible según distribuidora'}</p>
                            <p className="text-gray-600 mb-2"><strong>Reservas actuales:</strong> {dataDetalle?.propio ? `${dataDetalle?.cantidad_pasajeros} personas`: 'Bajo demanda'}</p>
                            <p className="text-gray-600"><strong>Disponibilidad:</strong> X espacios libres</p>
                          </div>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                          onClick={handleCloseVerDetalles}
                          className="cursor-pointer px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                        >
                          Cerrar
                        </button>
                        {/* <button
                          onClick={() => {
                            onEdit(pkg);
                            onClose();
                          }}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 font-medium"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Editar Paquete</span>
                        </button> */}
                      </div>
                    </div>
                  </div>
                </div>
              </Modal>
            }

       {onDesactivarData &&
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="modal-detalles-reserva bg-white/95 rounded-xl shadow-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto backdrop-blur-sm">
                  <Modal onClose={handleCloseModal} claseCss="modal">
                              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${dataADesactivar!.activo ? 'bg-red-100 dark:bg-red-900/20': 'bg-green-100 dark:bg-green-900/20'} `}>
                                  {dataADesactivar!.activo && <IoWarningOutline className="h-8 w-8 text-red-600 dark:text-red-400" />}
                                  {!dataADesactivar!.activo && <IoCheckmarkCircleOutline className="h-8 w-8 text-green-600 dark:text-green-400" />}
                                  
                              </div>
                              <h2 className='text-center'>Confirmacion de operación</h2>
                            <p className=' text-gray-600 dark:text-gray-400 mt-2 text-justify'>
                              ¿Estás seguro de que deseas {dataADesactivar!.activo ? 'desactivar' : 'activar'} al paquete  
                              <b>
                                  {' ' + capitalizePrimeraLetra((dataADesactivar?.nombre) ?? '')}
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
            </div>
          </div>
            }

      <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[95vw] mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                   <Bus className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-3xl font-semibold text-gray-900">Paquetes</h1>
              </div>
              <p className="text-gray-600">Gestiona los datos de paquetes del sistema y su estado.</p>
            </div>
            <div className="flex gap-3">
              {/* {siTienePermiso("paquetes", "exportar") &&
                <Button
                  variant="outline"
                  className="border-emerald-200 text-emerald-700 cursor-pointer hover:bg-emerald-50 bg-transparent"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              } */}

              {siTienePermiso("paquetes", "exportar") && 
              <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer"
                onClick={() => setActiveTab('form')}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Paquete
              </Button>
              }
            </div>
          </div>

          {/* Stats Cards */}
          <ResumenCardsDinamico resumen={dataResumen} isFetchingResumen={isFetchingResumen} isErrorResumen={isErrorResumen}/>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-80 bg-gray-100">
              <TabsTrigger value="list" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white cursor-pointer">
                Lista de Paquetes
              </TabsTrigger>
              <TabsTrigger 
                disabled={!siTienePermiso("paquetes", "crear")} 
                value="form" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white cursor-pointer">
                Crear Paquete
              </TabsTrigger>
            </TabsList>

            {/* Registration Form Tab */}
            <TabsContent value="form">
              <form id="mainForm" onSubmit={handleSubmit(!dataAEditar ? handleGuardarNuevaData: handleGuardarDataEditado)}>
                <Card className="border-emerald-200 pt-0">
                  <CardHeader className="bg-emerald-50 border-b border-emerald-200 pt-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-emerald-900">Crear Nueva Paquete</CardTitle>
                        <CardDescription className="text-emerald-700">
                          Complete la información para crear un nuevo paquete
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* NOMBRE DE LA PERSONA */}
                        <div className="space-y-2">
                          <Label htmlFor="nombre" className="text-gray-700 font-medium">
                            Nombre *
                          </Label>
                          <Input
                            id="nombre"
                            autoComplete="nombre"
                            placeholder="Nombre"
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            {...register('nombre', {
                            required: true, 
                            validate: {blankSpace: (value) => !!value.trim()},
                            minLength: 3})}
                          />
                          <div>
                            {(errors?.nombre?.type === 'required' || errors?.nombre?.type === 'blankSpace') && <span className='text-red-400 text-sm'>Este campo es requerido</span>}
                            {errors?.nombre?.type === 'minLength' && <span className='text-red-400 text-sm'>El nombre debe tener minimo 3 caracteres</span>}
                          </div>
                        </div>

                          {/* TIPO PAQUETE */}
                          <div className="space-y-2">
                            <Label htmlFor="tipo_paquete" className="text-gray-700 font-medium">
                              Tipo de Paquete *
                            </Label>

                            {isFetchingTipoPaquetes && (
                              <div className="w-full"> {/* Contenedor adicional para controlar el ancho */}
                                <Select>
                                  <SelectTrigger className="w-full cursor-pointer border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 flex">
                                  <div className="w-full flex items-center justify-center">
                                    <Loader2Icon className="animate-spin w-6 h-6 text-gray-300"/>
                                  </div>
                                  </SelectTrigger>
                                </Select>
                              </div>
                            )}

                            {!isFetchingTipoPaquetes && 
                              <Controller
                                name="tipo_paquete"
                                control={control}
                                rules={{ required: "Este campo es requerido" }}
                                render={({ field }) => (
                                  <div className="w-full min-w-0 select-container"> {/* Contenedor para controlar el layout */}
                                    <Select
                                      // disabled={!!dataAEditar}
                                      value={field.value}
                                      onValueChange={(value) => {
                                        field.onChange(value)
                                        if (value) {
                                          clearErrors("tipo_paquete")
                                        }

                                        console.log('value: ', value);
                                        const tipoPaquete = dataTipoPaqueteList.filter((doc: TipoPaquete) => doc.id.toString() === value)
                                        console.log('tipo_paquete 1: ', tipoPaquete[0])
                                        setTipoPaqueteSelected(tipoPaquete[0]);
                                      }}
                                      onOpenChange={(open) => {
                                        if (!open && !field.value) {
                                          field.onBlur(); 
                                        }
                                      }}
                                    >
                                      <SelectTrigger className="w-full cursor-pointer border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-left">
                                        <SelectValue placeholder="Selecciona el tipo de paquete" />
                                      </SelectTrigger>
                                      <SelectContent className="min-w-[var(--radix-select-trigger-width)] max-h-60">
                                        {dataTipoPaqueteList.map((data: TipoPaquete) => 
                                          <SelectItem 
                                            key={data.id} 
                                            value={data.id.toString()}
                                            className="pl-2 pr-4"
                                          >
                                            <div className="flex items-center gap-2 min-w-0">
                                              <div className="flex-shrink-0 w-3 h-3 bg-blue-400 rounded-full"></div>
                                              <span className="truncate">{data.nombre}</span>
                                            </div>
                                          </SelectItem>
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                              />
                            }

                            {errors.tipo_paquete && (
                              <p className="text-red-400 text-sm">{errors.tipo_paquete.message as string}</p>
                            )}
                        </div>


                        {/* DESTINO */}
                          <div className="space-y-2 mi-select-wrapper">
                            <Label htmlFor="destino" className="text-gray-700 font-medium">
                              Destino *
                            </Label>

                            {isFetchingDestino &&
                            <Select>
                              <SelectTrigger className="cursor-pointer border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 w-46 flex">
                                <div className="w-full flex items-center justify-center">
                                  <Loader2Icon className="animate-spin w-6 h-6 text-gray-300"/>
                                </div>
                              </SelectTrigger>
                            </Select>
                            }
                            {!isFetchingDestino && 
                              <>
                                <div className="space-y-2 ">
                                  <GenericSearchSelect
                                    dataList={dataDestinoList}
                                    value={selectedDestinoID}
                                    // disabled={!!dataAEditar}
                                    onValueChange={setSelectedDestinoID}
                                    handleDataNoSeleccionada={handleDestinoNoSeleccionada}
                                    placeholder="Selecciona el destino..."
                                    labelKey="ciudad_nombre"
                                    secondaryLabelKey="pais_nombre"
                                    valueKey="id"
                                  />
                              </div>
                              </>
                            }

                              {destinoNoSeleccionada === false && (
                                <p className="text-red-400 text-sm">Este campo es requerido</p>
                              )}

                              {onGuardar && !destinoNoSeleccionada && 
                                  <p className="text-red-400 text-sm">Este campo es requerido</p>}
                          </div>


                          {/* ZONA GEOGRAFICA*/}
                          <div className="space-y-1">
                            <div className="flex gap-3">
                              <Label htmlFor="name" className="text-gray-700 font-medium">
                                Zona Geográfica *
                              </Label>
      
                              <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                Solo lectura
                              </span>
                            </div>
                            <Input
                                id="zona_geografica"
                                disabled
                                autoComplete="zona_geografica"
                                placeholder="Se determinará según el destino seleccionado"
                                className={` border-gray-300 focus:border-blue-500 focus:ring-blue-500
                                    w-full px-3 py-4 border-2 border-dashed rounded-lg bg-gradient-to-r from-gray-50 to-teal-50 text-gray-900 font-medium
                                    !text-lg placeholder:text-lg disabled:pointer-events-auto disabled:cursor-not-allowed`}
                                {...register('zona_geografica', {
                                // required: true,
                                // validate: {blankSpace: (value) => !!value.trim()},
                                // minLength: 3
                                })}
                              />
                            <div>
                              {(errors?.nombre?.type === 'required' || errors?.nombre?.type === 'blankSpace') && <span className='text-red-400 text-sm'>Este campo es requerido</span>}
                              {errors?.nombre?.type === 'minLength' && <span className='text-red-400 text-sm'>El username debe tener minimo 3 caracteres</span>}
                            </div>
                          </div>

                          <div className="space-y-2 flex items-center justify-center gap-20">
                            <Controller
                                name="propio"
                                control={control}
                                defaultValue={false}
                                render={({ field }) => {
                                  const isDisabled =
                                    quitarAcentos(tipoPaqueteSelected?.nombre.toLowerCase() ?? "") ===
                                    "aereo" || !!dataAEditar;

                                  return (
                                    <div className="flex items-center gap-3 cursor-pointer m-0">
                                      <Checkbox
                                        id="propio"
                                        checked={field.value}
                                        disabled={isDisabled} // 🔹 Desactiva visualmente y funcionalmente
                                        onCheckedChange={(checked) => {
                                          if (!isDisabled) {
                                            field.onChange(!!checked);
                                          }
                                        }}
                                        className="cursor-pointer border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 data-[state=checked]:text-white"
                                      />
                                      <Label
                                        htmlFor="propio"
                                        className={`cursor-pointer ${isDisabled ? "opacity-50" : ""}`}
                                      >
                                        Paquete Propio
                                      </Label>
                                    </div>
                                  );
                                }}
                              />


                            {/* PERSONALIZADO */}
                            <Controller
                              name="personalizado"
                              control={control}
                              defaultValue={false}
                              render={({ field }) => (
                                <div className="flex items-center gap-3 cursor-pointer m-0">
                                  <Checkbox
                                    // disabled={!!dataAEditar}
                                    id="personalizado"
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                      const isChecked = !!checked;
                                      field.onChange(isChecked);
                                    }}
                                    className="cursor-pointer border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 data-[state=checked]:text-white"
                                  />
                                  <Label htmlFor="personalizado" className="cursor-pointer">Personalizado</Label>
                                </div>
                              )}
                            />
                          </div>


                          {/* CANTIDAD PASAJEROS */}
                          {propio  && 
                            <div className="space-y-2">
                              <Label htmlFor="cantidad_pasajeros" className="text-gray-700 font-medium">
                                Cantidad máxima *
                              </Label>
                              <Input
                                id="cantidad_pasajeros"
                                autoComplete="cantidad_pasajeros"
                                placeholder="Ingrese la cantidad de pasajeros"
                                // disabled={!!dataAEditar}
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-auto disabled:cursor-not-allowed"
                                {...register('cantidad_pasajeros', {
                                  required: {
                                    value: true,
                                    message: 'Este campo es requerido'
                                  }
                                })}
                              />
                              <div>
                                {errors.cantidad_pasajeros && (
                                  <span className="text-red-400 text-sm">
                                    {errors.cantidad_pasajeros.message as string}
                                  </span>
                                )}
                              </div>
                            </div>
                          }


                          {/* LISTADO DE DISTRIBUIDORA */}
                          { !propio && 
                            <div className="space-y-2">
                              <Label htmlFor="distribuidora_id" className="text-gray-700 font-medium">
                                Distribuidora *
                              </Label>

                              {isFetchingDistribuidora && (
                                <div className="w-full"> {/* Contenedor adicional para controlar el ancho */}
                                  <Select >
                                    <SelectTrigger 
                                        className="w-full cursor-pointer border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 flex">
                                      <div className="w-full flex items-center justify-center">
                                        <Loader2Icon className="animate-spin w-6 h-6 text-gray-300"/>
                                      </div>
                                    </SelectTrigger>
                                  </Select>
                                </div>
                              )}

                              {!isFetchingDistribuidora && 
                                <Controller
                                  name="distribuidora_id"
                                  control={control}
                                  rules={{ required: "Este campo es requerido" }}
                                  render={({ field }) => (
                                    <div className="w-full min-w-0 select-container"> {/* Contenedor para controlar el layout */}
                                      <Select
                                        value={field.value}
                                        // disabled={!!dataAEditar}
                                        onValueChange={(value) => {
                                          field.onChange(value)
                                          if (value) {
                                            clearErrors("distribuidora_id")
                                          }

                                          console.log('value: ', value);
                                          const distribuidora = dataDistribuidoraList.filter((doc: Distribuidora) => doc.id.toString() === value)
                                          console.log('distribuidora: ', distribuidora[0])
                                          setDistribuidoraSelected(distribuidora[0]);
                                        }}
                                        onOpenChange={(open) => {
                                          if (!open && !field.value) {
                                            field.onBlur(); 
                                          }
                                        }}
                                      >
                                        <SelectTrigger className="w-full cursor-pointer border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-left">
                                          <SelectValue placeholder="Selecciona la distribuidora" />
                                        </SelectTrigger>
                                        <SelectContent className="min-w-[var(--radix-select-trigger-width)] max-h-60">
                                          {dataDistribuidoraList.map((data: Distribuidora) => 
                                            <SelectItem 
                                              key={data.id} 
                                              value={data.id.toString()}
                                              className="pl-2 pr-4"
                                            >
                                              <div className="flex items-center gap-2 min-w-0">
                                                <div className="flex-shrink-0 w-3 h-3 bg-blue-400 rounded-full"></div>
                                                <span className="truncate">{data.nombre}</span>
                                              </div>
                                            </SelectItem>
                                          )}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}
                                />
                              }

                              {errors.distribuidora_id && (
                                <p className="text-red-400 text-sm">{errors.distribuidora_id.message as string}</p>
                              )}
                          </div>
                          }


                                                    {/* TIPO PAQUETE */}
                          <div className="space-y-2">
                            <Label htmlFor="moneda" className="text-gray-700 font-medium">
                              Moneda *
                            </Label>

                            {isFetchingTipoPaquetes && (
                              <div className="w-full"> {/* Contenedor adicional para controlar el ancho */}
                                <Select>
                                  <SelectTrigger className="w-full cursor-pointer border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 flex">
                                  <div className="w-full flex items-center justify-center">
                                    <Loader2Icon className="animate-spin w-6 h-6 text-gray-300"/>
                                  </div>
                                  </SelectTrigger>
                                </Select>
                              </div>
                            )}

                            {!isFetchingMoneda && 
                              <Controller
                                name="moneda"
                                control={control}
                                rules={{ required: "Este campo es requerido" }}
                                render={({ field }) => (
                                  <div className="w-full min-w-0 select-container"> {/* Contenedor para controlar el layout */}
                                    <Select
                                      value={field.value}
                                      onValueChange={(value) => {
                                        field.onChange(value)
                                        if (value) {
                                          clearErrors("moneda")
                                        }

                                        console.log('value: ', value);
                                        // const tipoPaquete = dataTipoPaqueteList.filter((doc: TipoPaquete) => doc.id.toString() === value)
                                        // console.log('moneda: ', tipoPaquete[0])
                                        // setMone(tipoPaquete[0]);
                                      }}
                                      onOpenChange={(open) => {
                                        if (!open && !field.value) {
                                          field.onBlur(); 
                                        }
                                      }}
                                    >
                                      <SelectTrigger className="w-full cursor-pointer border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-left">
                                        <SelectValue placeholder="Selecciona el tipo de moneda" />
                                      </SelectTrigger>
                                      <SelectContent className="min-w-[var(--radix-select-trigger-width)] max-h-60">
                                        {dataMonedaList.map((data: Moneda) => 
                                          <SelectItem 
                                            key={data.id} 
                                            value={data.id.toString()}
                                            className="pl-2 pr-4"
                                          >
                                            <div className="flex items-center gap-2 min-w-0">
                                              <div className="flex-shrink-0 w-3 h-3 bg-blue-400 rounded-full"></div>
                                              <span className="truncate">{data.nombre}</span>
                                              <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                                                {data.codigo}
                                              </Badge>
                                            </div>
                                          </SelectItem>
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                              />
                            }

                            {errors.moneda && (
                              <p className="text-red-400 text-sm">{errors.moneda.message as string}</p>
                            )}
                        </div>
                      
                          {/* MONTO PRECIO */}
                          {/* <div className="space-y-2">
                            <Label htmlFor="precio" className="text-gray-700 font-medium">
                              Precio *
                            </Label>
                            <Input
                              id="precio"
                              autoComplete="precio"
                              disabled
                              placeholder="Precio del paquete"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              {...register('precio', {

                              })}
                            />
                            
                          </div>           */}
                
                            {/* <div className="space-y-2">
                                <Label htmlFor="fecha_salida" className="text-gray-700 font-medium">
                                  Fecha de Salida *
                                </Label>

                                <Controller
                                  name="fecha_salida"
                                  control={control}
                                  rules={{}} // Sin validación required
                                  render={({ field }) => (
                                    <Flatpickr
                                      value={field.value}
                                      onChange={(date) => {
                                        if (date[0]) {
                                          const fecha = date[0];
                                          const año = fecha.getFullYear();
                                          const mes = String(fecha.getMonth() + 1).padStart(2, "0");
                                          const dia = String(fecha.getDate()).padStart(2, "0");
                                          field.onChange(`${año}-${mes}-${dia}`);
                                        } else {
                                          field.onChange(null);
                                        }
                                        trigger("fecha_salida");
                                      }}
                                      onClose={() => trigger("fecha_salida")}
                                      className="disabled-fecha-vencimiento mt-1 bg-blue-50 border border-blue-200 w-full rounded-lg p-2
                                        focus:border-gray-500 focus:outline focus:outline-gray-500"
                                      placeholder="DD/MM/YYYY"
                                      disabled
                                    />
                                  )}
                                />

                                {errors.fecha_salida?.message && (
                                  <span className="text-red-400 text-sm">
                                    {errors.fecha_salida.message as string}
                                  </span>
                                )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="fecha_regreso" className="text-gray-700 font-medium">
                                Fecha de Regreso *
                              </Label>

                              <Controller
                                name="fecha_regreso"
                                control={control}
                                rules={{}} // Sin validación required
                                render={({ field }) => (
                                  <Flatpickr
                                    value={field.value}
                                    onChange={(date) => {
                                      if (date[0]) {
                                        const fecha = date[0];
                                        const año = fecha.getFullYear();
                                        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
                                        const dia = String(fecha.getDate()).padStart(2, "0");
                                        field.onChange(`${año}-${mes}-${dia}`);
                                      } else {
                                        field.onChange(null);
                                      }
                                      trigger("fecha_regreso");
                                    }}
                                    onClose={() => trigger("fecha_regreso")}
                                    className="disabled-fecha-vencimiento mt-1 bg-blue-50 border border-blue-200 w-full rounded-lg p-2
                                      focus:border-gray-500 focus:outline focus:outline-gray-500"
                                    placeholder="DD/MM/YYYY"
                                    disabled
                                  />
                                )}
                              />

                              {errors.fecha_regreso?.message && (
                                <span className="text-red-400 text-sm">
                                  {errors.fecha_regreso.message as string}
                                </span>
                              )}
                            </div> */}


                            <div className="space-y-2 md:col-span-2">
                              <div className="space-y-2 md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Imagen del Paquete
                                  </label>
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      {...register("imagen")} // 📌 Registro del campo en useForm
                                      onChange={(e) => {
                                        register("imagen").onChange(e); // Mantener registro
                                        handleImageChange(e); // Manejar preview
                                      }}
                                      className="hidden"
                                      id="imagen-upload"
                                    />
                                    <label
                                      htmlFor="imagen-upload"
                                      className="cursor-pointer flex flex-col items-center space-y-2"
                                    >
                                      {imagePreview ? (
                                        <div className="relative">
                                          <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-32 h-32 object-cover rounded-lg"
                                          />
                                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 hover:opacity-40 transition-opacity">
                                            <Upload className="text-white" size={24} />
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <Upload className="text-gray-400" size={48} />
                                          <div className="text-center">
                                            <p className="text-gray-600">Haz clic para subir una imagen</p>
                                            <p className="text-sm text-gray-400">PNG, JPG hasta 10MB</p>
                                          </div>
                                        </>
                                      )}
                                    </label>
                                  </div>
                              </div>
                          </div>

                            {costoTotalPaquete && salidas.length > 0 && (
                              <Card className="transition-all duration-200 bg-emerald-50 border-emerald-300 space-y-2 md:col-span-2">
                                <CardContent className="space-y-4 w-full">
                                  <div className="flex items-start justify-between w-full">
                                    <div>
                                      <Label className="text-base mb-2 flex items-center gap-2">
                                        Estimación de Precio
                                        <Info className="w-4 h-4 text-muted-foreground" />
                                      </Label>
                                      <div className="mt-3 w-full">
                                        <div className="flex items-baseline gap-2">
                                          <span className="text-md text-muted-foreground">Desde</span>
                                          <span className="text-3xl font-bold text-emerald-600">
                                            {dataMonedaList
                                              .filter((moneda: any) => moneda?.id?.toString() === monedaSeleccionada?.toString())
                                              .map((moneda: any) => (
                                                <p key={moneda.id}>
                                                  {moneda.simbolo} {formatearSeparadorMiles.format(costoTotalPaquete.precio_actual_total)}
                                                </p>
                                              ))}
                                          </span>
                                          {/* <span>{}</span> */}
                                          {!!costoTotalPaquete?.precio_final_total &&
                                            <>
                                              <span className="text-md text-muted-foreground">Hasta</span>
                                              <span className="text-3xl font-bold text-emerald-600">
                                                {dataMonedaList
                                                  .filter((moneda: any) => moneda?.id?.toString() === monedaSeleccionada?.toString())
                                                  .map((moneda: any) => (
                                                    <p key={moneda.id}>
                                                      {/* {costoTotalPaquete.precio_final_total ? moneda.simbolo + ' ' + formatearSeparadorMiles.format(costoTotalPaquete.precio_final_total) :''} */}
                                                      {moneda.simbolo} {formatearSeparadorMiles.format(costoTotalPaquete.precio_final_total)}
                                                    </p>
                                                  ))}
                                              </span>
                                            </>
                                          }
                                          {!!costoTotalPaquete?.precio_final_total && 
                                            <span className="text-sm text-muted-foreground">-</span>
                                          }
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">
                                          por persona • Incluye alojamiento + servicios • {salidas.length} salida
                                          {salidas.length > 1 ? "s" : ""} disponible{salidas.length > 1 ? "s" : ""}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}



                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-gray-700 font-medium">Seleccione los servicios *</Label>

                                
                                <div className="relative mb-4">
                                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <Input
                                    placeholder="Buscar servicios..."
                                    value={permissionSearchTerm}
                                    onChange={(e) => setPermissionSearchTerm(e.target.value)}
                                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                  />
                                </div>

                                
                                {selectedServicios.length > 0 && (
                                  <div className="flex items-center gap-2 mb-3">
                                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                      {selectedServicios.length} servicios seleccionados
                                    </Badge>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setSelectedServicios([])}
                                      className="text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                      <X className="h-3 w-3 mr-1" />
                                      Limpiar selección
                                    </Button>
                                  </div>
                                )}

                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4 w-full">
                                  {isFetchingServicios && <div className="w-full flex items-center justify-center">
                                    <Loader2Icon className="animate-spin w-10 h-10 text-gray-300"/>
                                  </div>}

                                  {!isFetchingServicios && dataServiciosList && dataServiciosList
                                      .filter((servicio: any) =>

                                        servicio.nombre.toLowerCase().includes(permissionSearchTerm.toLowerCase())

                                      )
                                      .sort((a: any, b: any) => {
                                        const aSelected = selectedServicios.includes(a.id);
                                        const bSelected = selectedServicios.includes(b.id);
                                        if (aSelected && !bSelected) return -1;
                                        if (!aSelected && bSelected) return 1;
                                        return 0;
                                      })
                                      .map((servicio: any) => (
                                        <div
                                          key={servicio.id}
                                          className={`relative cursor-pointer duration-200 hover:shadow-sm flex 
                                                    items-start p-3 rounded-lg hover:bg-gray-50 transition-colors
                                                    border border-gray-200
                                                    ${selectedServicios.includes(servicio.id) 
                                                      ? 'ring-2 ring-blue-200 bg-blue-50/50 border-blue-200' 
                                                      : ''}`}
                                                  onClick={() => handleServicioToggle(servicio.id, servicio?.precio ?? 0)}
                                        >
                                          <div className="flex items-center justify-center w-full"
                                          >
                                              <div className="flex items-start w-full">
                                                <div className="flex-shrink-0 mr-3 mt-0.5"
                                                  onClick={(e) => e.stopPropagation()}>
                                                  <Checkbox
                                                    id={`servicio-${servicio.id}`}
                                                    checked={selectedServicios.includes(servicio.id)}
                                                    onCheckedChange={() => handleServicioToggle(servicio.id, servicio?.precio ?? 0)}
                                                  />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <Label
                                                    className="text-sm font-medium text-gray-900 cursor-pointer block"
                                                  >
                                                    {servicio.nombre}
                                                    {selectedServicios.includes(servicio.id) && propio &&
                                                      <div className="col-span-2 flex gap-2 mt-2">  
                                                        {/* <div>
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
                                                        </div> */}
                                                            
                                                        {/* <div>
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
                                                        </div> */}
                                                      </div>
                                                    }
                                                  </Label>
                                                  {/* <p className="text-xs text-gray-500 mt-1">{servicio.descripcion}</p> */}
                                                </div>

                                              </div>
                                              <span>
                                                {selectedServicios.includes(servicio.id) ?
                                                  <Trash2 className="text-red-400 w-7 h-7 hover:bg-red-100 rounded-sm p-1" /> :
                                                  <CirclePlus className="text-blue-400 w-7 h-7 hover:bg-blue-100 rounded-sm p-1" />
                                                }
                                              </span>
                                          </div>
                                        </div>
                                      ))}
                                                            
                                  {dataServiciosList && dataServiciosList.filter(
                                    (servicio: any) =>
                                      servicio.nombre.toLowerCase().includes(permissionSearchTerm.toLowerCase())
                                  ).length === 0 && (
                                    <div className="col-span-2 text-center py-8">
                                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <Search className="h-6 w-6 text-gray-400" />
                                      </div>
                                      <p className="text-gray-500 text-sm">
                                        No se encontraron servicios que coincidan con "{permissionSearchTerm}"
                                      </p>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPermissionSearchTerm("")}
                                        className="mt-2"
                                      >
                                        Limpiar búsqueda
                                      </Button>
                                    </div>
                                  )}
 
                                </div>

                                  <div className="flex items-center gap-2 pt-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {

                                      const filteredPermissions = dataServiciosList.filter(
                                        (servicio: any) =>
                                          servicio.nombre.toLowerCase().includes(permissionSearchTerm.toLowerCase())
                                      )
                                      const allFilteredSelected = filteredPermissions.every((p: any) =>
                                        selectedServicios.includes(p.id),
                                      )

                                      console.log('allFilteredSelected: ', allFilteredSelected )

                                      if (allFilteredSelected) {
                                        setSelectedServicios((prev) =>
                                          prev.filter((id) => !filteredPermissions.map((p: any) => p.id).includes(id)),
                                        )
                                      } else {
                                        const newSelections = filteredPermissions
                                          .map((p:any) => p.id)
                                          .filter((id:any) => !selectedServicios.includes(id))
                                        setSelectedServicios((prev) => [...prev, ...newSelections])
                                      }
                                    }}
                                    className="cursor-pointer text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    {dataServiciosList && dataServiciosList
                                      .filter(
                                        (servicio: any) =>
                                          servicio.nombre.toLowerCase().includes(permissionSearchTerm.toLowerCase())
                                      )
                                      .every((p: any) => selectedServicios.includes(p.id))
                                      ? "Deseleccionar todos"
                                      : "Seleccionar todos"}{" "}
                                    
                                  </Button>

                                  {/* {JSON.stringify(selectedServicios)}
                                  {JSON.stringify(onGuardar)} */}
                                  {propio && onGuardar && selectedServicios.length ===0 && <span className='text-red-400 text-sm'>Debes seleccinar al menos un servicio</span>}
                                </div>


                                {/* SECCIÓN: Costos por Defecto del Paquete */}
                                {propio && quitarAcentos(tipoPaqueteSelected?.nombre ?? '').toLowerCase() === 'terrestre' && (
                                  <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                                    <div className="mb-4">
                                      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Tag className="w-5 h-5 text-emerald-600" />
                                        Costos por Defecto del Paquete
                                      </h2>
                                      <p className="text-sm text-gray-500 mt-1">
                                        Estos montos se pre-cargarán en cada salida. Podés ajustarlos individualmente por salida si cambian.
                                      </p>
                                    </div>

                                    {itemsCostoDefecto.length === 0 ? (
                                      <div className="border-2 border-dashed border-gray-200 rounded-lg py-8 text-center text-gray-400">
                                        <Tag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                        <p className="text-sm font-medium">Sin costos configurados</p>
                                        <p className="text-xs mt-0.5">Agregá al menos 2 ítems para poder guardar el paquete</p>
                                      </div>
                                    ) : (
                                      <div className="border rounded-lg overflow-hidden">
                                        <Table>
                                          <TableHeader>
                                            <TableRow className="bg-gray-50">
                                              <TableHead>Tipo de costo</TableHead>
                                              <TableHead>Monto por defecto (₲)</TableHead>
                                              <TableHead className="w-10 text-right pr-3">
                                                <span className="text-xs text-gray-400 font-normal">Estado</span>
                                              </TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {itemsCostoDefecto.map((item) => {
                                              const incompleto = !item.tipo_costo_id || item.monto == null;
                                              return (
                                                <TableRow key={item._id} className={incompleto ? 'bg-amber-50/60' : ''}>
                                                  <TableCell>
                                                    <div>
                                                      <Select
                                                        value={item.tipo_costo_id?.toString() ?? ''}
                                                        onValueChange={(val) => {
                                                          const tipo = (dataTipoCostoList ?? []).find((t: any) => t.id === Number(val));
                                                          setItemsCostoDefecto(prev => prev.map(i =>
                                                            i._id === item._id
                                                              ? { ...i, tipo_costo_id: Number(val), nombre: tipo?.nombre ?? '', dividir_por_pasajeros: tipo?.dividir_por_pasajeros ?? false }
                                                              : i
                                                          ));
                                                        }}
                                                      >
                                                        <SelectTrigger className={`w-52 ${!item.tipo_costo_id ? 'border-amber-300' : ''}`}>
                                                          <SelectValue placeholder="Seleccioná un tipo" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                          {(dataTipoCostoList ?? []).filter((t: any) =>
                                                            t.activo && !itemsCostoDefecto.some(i => i.tipo_costo_id === t.id && i._id !== item._id)
                                                          ).map((t: any) => (
                                                            <SelectItem key={t.id} value={t.id.toString()}>{t.nombre}</SelectItem>
                                                          ))}
                                                        </SelectContent>
                                                      </Select>
                                                      {item.tipo_costo_id && (
                                                        <p className="text-xs mt-1">
                                                          {item.dividir_por_pasajeros
                                                            ? <span className="text-blue-600">✓ Se dividirá por cupo</span>
                                                            : <span className="text-gray-500">— Costo directo por pasajero</span>
                                                          }
                                                        </p>
                                                      )}
                                                    </div>
                                                  </TableCell>
                                                  <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                      <span className="text-gray-400 text-sm">₲</span>
                                                      <NumericFormat
                                                        value={item.monto ?? ''}
                                                        onValueChange={(values) => {
                                                          setItemsCostoDefecto(prev => prev.map(i =>
                                                            i._id === item._id ? { ...i, monto: values.floatValue ?? null } : i
                                                          ));
                                                        }}
                                                        thousandSeparator="."
                                                        decimalSeparator=","
                                                        placeholder="0"
                                                        className={`p-1 pl-2.5 rounded-md border-2 w-44 ${item.monto == null ? 'border-amber-300 bg-amber-50/40' : 'border-blue-200 focus:border-blue-500'}`}
                                                      />
                                                    </div>
                                                  </TableCell>
                                                  <TableCell className="text-right pr-3">
                                                    {incompleto ? (
                                                      <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                        Incompleto
                                                      </span>
                                                    ) : (
                                                      <button
                                                        type="button"
                                                        onClick={() => setItemsCostoDefecto(prev => prev.filter(i => i._id !== item._id))}
                                                        className="text-red-400 hover:bg-red-50 rounded p-1 cursor-pointer"
                                                      >
                                                        <Trash2 className="w-4 h-4" />
                                                      </button>
                                                    )}
                                                  </TableCell>
                                                </TableRow>
                                              );
                                            })}
                                          </TableBody>
                                          {itemsCostoDefecto.some(i => i.monto != null) && (
                                            <tfoot>
                                              <tr className="bg-gray-50 border-t">
                                                <td className="px-4 py-2 text-sm font-semibold text-gray-700">Total por defecto</td>
                                                <td className="px-4 py-2 text-sm font-bold text-gray-900">
                                                  ₲ {formatearSeparadorMiles.format(itemsCostoDefecto.reduce((acc, i) => acc + (i.monto ?? 0), 0))}
                                                </td>
                                                <td />
                                              </tr>
                                            </tfoot>
                                          )}
                                        </Table>
                                      </div>
                                    )}

                                    <div className="flex items-center justify-between mt-3">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 cursor-pointer"
                                        onClick={() => setItemsCostoDefecto(prev => [
                                          ...prev,
                                          { _id: Date.now(), tipo_costo_id: null, nombre: '', monto: null, dividir_por_pasajeros: false }
                                        ])}
                                      >
                                        <CirclePlus className="w-4 h-4 mr-1" />
                                        Agregar costo por defecto
                                      </Button>
                                      {onGuardar && itemsCostoDefecto.length < 2 && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                          <AlertCircle className="w-4 h-4" />
                                          Se requieren al menos 2 ítems de costo para guardar el paquete
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* {quitarAcentos(tipoPaqueteSelected?.nombre ?? '')?.toLowerCase() === 'terrestre' &&  */}
                                   <Card className="mt-8">
                                      <CardHeader>
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <CardTitle>Gestión de Salidas</CardTitle>
                                            <CardDescription>Administre las salidas y sus tarifas</CardDescription>
                                            {onGuardar && 
                                              quitarAcentos(tipoPaqueteSelected?.nombre ?? '').toLowerCase() === 'terrestre' &&
                                              !personalizado
                                              && 
                                              salidas.length === 0 &&
                                              <p className="text-red-400">Debes agregar al menos una salida</p>
                                            }
                                          </div>
                                          <div className="flex flex-col items-end gap-2">
                                            <Dialog 
                                            open={isAddSalidaOpen}
                                              onOpenChange={(open) => {
                                                if (!open) resetSalidaForm()
                                                setIsAddSalidaOpen(open)
                                              }}
                                            >
                                              <Button
                                                type="button"
                                                className="cursor-pointer bg-emerald-500 hover:bg-emerald-600"
                                                onClick={handleOpenModal}
                                              >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Agregar Salidas
                                              </Button>
                                              <DialogContent className="sm:max-w-[1100px] max-h-[90vh] overflow-hidden p-0">
                                                <div className="max-h-[90vh] overflow-y-auto p-6">
                                                    <form 
                                                        id="salidaForm" 
                                                        onSubmit={async (e) => {
                                                          e.preventDefault();
                                                          e.stopPropagation();
                                                          handleSubmitClick()
                                                        }}
                                                      >
              
                                                    <DialogHeader>
                                                      <DialogTitle>Agregar Nueva Salida</DialogTitle>
                                                      <DialogDescription>
                                                        Complete los datos de la nueva salida para agregarla al al paquete.
                                                      </DialogDescription>
                                                    </DialogHeader>

                                                    {/* 💡 Card Informativo sobre la Moneda del Catálogo */}
                                                    {!propio && (() => {
                                                      const monedaActual = dataMonedaList?.find((m: Moneda) => m.id.toString() === monedaSeleccionada?.toString());
                                                      if (monedaActual) {
                                                        return (
                                                          <Card className="mt-4 border-blue-200 bg-blue-50">
                                                            <CardContent className="pt-4">
                                                              <div className="flex items-start gap-3">
                                                                <div className="flex-shrink-0 mt-0.5">
                                                                  <Info className="h-5 w-5 text-blue-600" />
                                                                </div>
                                                                <div className="flex-1">
                                                                  <h3 className="text-sm font-semibold text-blue-900 mb-1">
                                                                    💰 Información sobre Precios del Catálogo
                                                                  </h3>
                                                                  <p className="text-sm text-blue-800">
                                                                    Los precios del catálogo de la distribuidora deben ingresarse en <span className="font-bold">{monedaActual.nombre} ({monedaActual.simbolo})</span>, que es la moneda seleccionada para este paquete.
                                                                  </p>
                                                                </div>
                                                              </div>
                                                            </CardContent>
                                                          </Card>
                                                        );
                                                      }
                                                      return null;
                                                    })()}

                                                    <div className="grid gap-4 py-4">
                                                        <div className="bg-white rounded-lg shadow-md p-6">
                                                          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de Salidas</h2>
                                                            <div className="grid grid-cols-2 items-center gap-4">
                                                              <div className="grid grid-cols-4 items-center gap-4">
                                                                  <Label className="text-sm text-gray-600 font-medium">Fecha Salida *</Label>
                                                                    <Input
                                                                      type="date"
                                                                      id="fecha_salida_v2"
                                                                      min={new Date().toISOString().split('T')[0]}
                                                                      {...registerSalida('fecha_salida_v2', {
                                                                        required: 'La fecha de salida es requerida',
                                                                        validate: (value) => {
                                                                            const selectedDate = new Date(value);
                                                                            const today = new Date();
                                                                            today.setHours(0, 0, 0, 0);

                                                                            if (selectedDate < today) {
                                                                              return 'La fecha de salida no puede ser anterior a hoy';
                                                                            }

                                                                            // Validar que la fecha de salida sea menor a la de regreso
                                                                            const fechaRegreso = getValuesSalida('fecha_regreso_v2');
                                                                            if (fechaRegreso) {
                                                                              const regresoDate = new Date(fechaRegreso);
                                                                              if (selectedDate >= regresoDate) {
                                                                                return 'La fecha de salida debe ser menor a la fecha de regreso';
                                                                              }
                                                                            }

                                                                            return true;
                                                                          }
                                                                      })}
                                                                      onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        setValueSalida('fecha_salida_v2', value);
                                                                        // Revalidar fecha_regreso_v2 cuando cambie fecha_salida_v2
                                                                        if (getValuesSalida('fecha_regreso_v2')) {
                                                                          trigger('fecha_regreso_v2');
                                                                        }
                                                                      }}
                                                                      className={`flex-1 w-40 ${errorsSalida?.fecha_salida_v2 ?
                                                                          'border-2 !border-red-400 focus:!border-red-400 focus:ring-0 outline-none':
                                                                          'border-2 border-blue-200 focus:border-blue-500'}`}
                                                                    />
                                                              </div>
                                                              <div className="grid grid-cols-4 items-center gap-4">
                                                                  <Label className="text-sm text-gray-600 font-medium">Fecha Regreso *</Label>
                                                                    <Input
                                                                      type="date"
                                                                      id="fecha_regreso_v2"
                                                                      min={new Date().toISOString().split('T')[0]}
                                                                      {...registerSalida('fecha_regreso_v2', {
                                                                        required: 'La fecha de regreso es requerida',
                                                                        validate: (value) => {
                                                                            const selectedDate = new Date(value);
                                                                            const today = new Date();
                                                                            today.setHours(0, 0, 0, 0);

                                                                            if (selectedDate < today) {
                                                                              return 'La fecha de regreso no puede ser anterior a hoy';
                                                                            }

                                                                            // Validar que la fecha de regreso sea mayor a la de salida
                                                                            const fechaSalida = getValuesSalida('fecha_salida_v2');
                                                                            if (fechaSalida) {
                                                                              const salidaDate = new Date(fechaSalida);
                                                                              if (selectedDate <= salidaDate) {
                                                                                return 'La fecha de regreso debe ser mayor a la fecha de salida';
                                                                              }
                                                                            }

                                                                            return true;
                                                                          }
                                                                      })}
                                                                      onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        setValueSalida('fecha_regreso_v2', value);
                                                                        // Revalidar fecha_salida_v2 cuando cambie fecha_regreso_v2
                                                                        if (getValuesSalida('fecha_salida_v2')) {
                                                                          trigger('fecha_salida_v2');
                                                                        }
                                                                      }}
                                                                      className={`flex-1 w-40 ${errorsSalida?.fecha_regreso_v2 ?
                                                                          'border-2 !border-red-400 focus:!border-red-400 focus:ring-0 outline-none':
                                                                          'border-2 border-blue-200 focus:border-blue-500'}`}
                                                                    />
                                                              </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 items-center gap-4 pt-4">

                                                              {/* MONTO SEÑA */}
                                                              <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label htmlFor="senia" className="text-gray-700 font-medium">
                                                                  Seña *
                                                                </Label>

                                                              <div className="col-span-3 flex gap-2">  
                                                                <Controller
                                                                  name="senia"
                                                                  control={controlSalida}
                                                                  rules={{
                                                                    required: 'Debes completar este campo',
                                                                    validate: (value) => {
                                                                      if (value === null || value === undefined || value === '' || isNaN(Number(value))) {
                                                                        return 'Valor inválido';
                                                                      }
                                                                      if (Number(value) <= 0) {
                                                                        return 'El valor debe ser mayor que cero';
                                                                      }
                                                                      return true;
                                                                    },
                                                                  }}
                                                                  render={({ field, fieldState: { error } }) => (
                                                                    <div className="flex flex-col w-full">
                                                                      <NumericFormat
                                                                        value={field.value ?? ''}
                                                                        onValueChange={(values) => {
                                                                          const val = values.floatValue ?? null;
                                                                          if (val === null || val <= 0) {
                                                                            field.onChange(null);
                                                                          } else {
                                                                            field.onChange(val);
                                                                          }
                                                                        }}
                                                                        onBlur={field.onBlur}
                                                                        thousandSeparator="."
                                                                        decimalSeparator=","
                                                                        allowNegative={false}          // ❌ no permite números negativos
                                                                        decimalScale={0}               // ❌ sin decimales
                                                                        allowLeadingZeros={false}      // evita números tipo 0001
                                                                        placeholder="ej: 250"
                                                                        className={`flex-1 p-1 pl-2.5 rounded-md border-2 ${
                                                                          error
                                                                            ? 'border-red-400 focus:!border-red-400 focus:ring-0 outline-none'
                                                                            : 'border-blue-200 focus:border-blue-500'
                                                                        }`}
                                                                      />
                                                                      {/* Mensaje informativo sobre la moneda */}
                                                                      {(() => {
                                                                        const monedaActual = dataMonedaList?.find((m: Moneda) => m.id.toString() === monedaSeleccionada?.toString());
                                                                        if (monedaActual) {
                                                                          return (
                                                                            <p className="text-xs text-gray-600 mt-1 font-medium">
                                                                              Monto en {monedaActual.nombre} ({monedaActual.simbolo})
                                                                            </p>
                                                                          );
                                                                        }
                                                                        return null;
                                                                      })()}
                                                                    </div>
                                                                  )}
                                                                />
                                                              </div>
                                                            </div>  

                                                            {propio &&
                                                              <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label htmlFor="cupo" className="text-right">
                                                                  Cupo *
                                                                </Label>
                                                                <div className="col-span-3 flex gap-2">  
                                                                  <Controller
                                                                    name="cupo"
                                                                    control={controlSalida}
                                                                    rules={{
                                                                      required: 'Debes completar este campo',
                                                                      validate: (value) => {
                                                                        if (value === null || value === undefined || value === '' || isNaN(Number(value))) {
                                                                          return 'Valor inválido';
                                                                        }
                                                                        if (Number(value) <= 0) {
                                                                          return 'El valor debe ser mayor que cero';
                                                                        }

                                                                        if(Number(value) > cantidadPasajeros){
                                                                          handleShowToast('El cupo por salida no puede superar a la cantidad maxima de pasajeros', 'error')
                                                                          return 'El cupo por salida no puede superar a la cantidad maxima de pasajeros';
                                                                        }

                                                                        return true;
                                                                      },
                                                                    }}
                                                                    render={({ field, fieldState: { error } }) => (
                                                                      <div className="flex flex-col w-full">
                                                                        <NumericFormat
                                                                          value={field.value ?? ''}
                                                                          onValueChange={(values) => {
                                                                            const val = values.floatValue ?? null;
                                                                            if (val === null || val <= 0) {
                                                                              field.onChange(null);
                                                                            } else {
                                                                              field.onChange(val);
                                                                            }
                                                                          }}
                                                                          onBlur={field.onBlur}
                                                                          thousandSeparator="."
                                                                          decimalSeparator=","
                                                                          allowNegative={false}          // ❌ no permite números negativos
                                                                          decimalScale={0}               // ❌ sin decimales
                                                                          allowLeadingZeros={false}      // evita números tipo 0001
                                                                          placeholder="ej: 46"
                                                                          className={`flex-1 p-1 pl-2.5 rounded-md border-2 ${
                                                                            error
                                                                              ? 'border-red-400 focus:!border-red-400 focus:ring-0 outline-none'
                                                                              : 'border-blue-200 focus:border-blue-500'
                                                                          }`}
                                                                        />
                                                                        {/* Mensaje de error (si quieres mostrarlo): */}
                                                                        {/* {error && (
                                                                          <span className="text-red-400 text-sm mt-1">{error.message}</span>
                                                                        )} */}
                                                                      </div>
                                                                    )}
                                                                  />
                                                                </div>
                                                              </div>
                                                            } 


                                                              <div className="grid grid-cols-4 items-center gap-4">
                                                                  <Label htmlFor="precio_desde" className="text-right">
                                                                    Precio Desde * 
                                                                  </Label>

                                                                  {propio ?
                                                                    <div className="col-span-3">
                                                                      {!watchSalida('precio_desde_editable') ? (
                                                                        <p className="text-sm text-amber-600 flex items-center gap-1.5">
                                                                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                                          Ingresá los precios de las habitaciones para ver el rango de precio
                                                                        </p>
                                                                      ) : (
                                                                        <div className="text-2xl font-bold text-blue-600">
                                                                          {formatearSeparadorMiles.format(+(watchSalida('precio_desde_editable') ?? 0))}
                                                                        </div>
                                                                      )}
                                                                      {(() => {
                                                                        const monedaActual = dataMonedaList?.find((m: Moneda) => m.id.toString() === monedaSeleccionada?.toString());
                                                                        const esGuaranies = monedaActual?.codigo === 'PYG';
                                                                        const esUSD = monedaActual?.codigo === 'USD';
                                                                        const cotizacionVigente = dataCotizacion?.valor_en_guaranies;

                                                                        console.log('monedaActual: ', monedaActual);
                                                                        console.log('esGuaranies: ', esGuaranies);
                                                                        console.log('esUSD: ', esUSD);
                                                                        console.log('cotizacionVigente: ', cotizacionVigente);
                                                                        
                                                                        if (esGuaranies && cotizacionVigente && !isFetchingCotizacion) {
                                                                          return (
                                                                            <p className="text-xs text-gray-500 mt-1">
                                                                              Calculado automáticamente según la cotización del día (1 USD = Gs. {Number(cotizacionVigente).toLocaleString('es-PY')})
                                                                            </p>
                                                                          );
                                                                        }
                                                                        
                                                                        if (esUSD) {
                                                                          return (
                                                                            <p className="text-xs text-gray-500 mt-1">
                                                                              Precio calculado automáticamente en USD
                                                                            </p>
                                                                          );
                                                                        }
                                                                        
                                                                        return null;
                                                                      })()}
                                                                    </div> :

                                                                    <div className="col-span-3">
                                                                      <div className="text-2xl font-bold text-blue-600">
                                                                        {formatearSeparadorMiles.format(+(watchSalida('precio_desde_editable') ?? 0))}
                                                                      </div>
                                                                      {(() => {
                                                                        const monedaActual = dataMonedaList?.find((m: Moneda) => m.id.toString() === monedaSeleccionada?.toString());
                                                                        
                                                                        if (monedaActual) {
                                                                          return (
                                                                            <p className="text-xs text-gray-500 mt-1">
                                                                              Precio mínimo calculado del catálogo en {monedaActual.nombre} ({monedaActual.simbolo})
                                                                            </p>
                                                                          );
                                                                        }
                                                                        
                                                                        return null;
                                                                      })()}
                                                                    </div>
                                                                  }
                                                              </div>

                                                              <div className="grid grid-cols-4 items-center gap-4">
                                                                  <Label htmlFor="precio_hasta" className="text-right">
                                                                    Precio Hasta {propio && <span>*</span>} 
                                                                  </Label>

                                                                  {propio ?
                                                                    <div className="col-span-3">
                                                                      <div className="text-2xl font-bold text-blue-600 flex">
                                                                        {formatearSeparadorMiles.format(+(watchSalida('precio_hasta_editable') ?? 0))}
                                                                      </div>
                                                                      {(() => {
                                                                        const monedaActual = dataMonedaList?.find((m: Moneda) => m.id.toString() === monedaSeleccionada?.toString());
                                                                        const esGuaranies = monedaActual?.codigo === 'PYG';
                                                                        const esUSD = monedaActual?.codigo === 'USD';
                                                                        const cotizacionVigente = dataCotizacion?.valor_en_guaranies;

                                                                        if (esGuaranies && cotizacionVigente && !isFetchingCotizacion) {
                                                                          return (
                                                                            <p className="text-xs text-gray-500 mt-1">
                                                                              Precio máximo calculado con cotización vigente
                                                                            </p>
                                                                          );
                                                                        }

                                                                        if (esUSD) {
                                                                          return (
                                                                            <p className="text-xs text-gray-500 mt-1">
                                                                              Precio máximo calculado automáticamente en USD
                                                                            </p>
                                                                          );
                                                                        }

                                                                        return null;
                                                                      })()}
                                                                    </div> :

                                                                    <div className="col-span-3">
                                                                      <div className="text-2xl font-bold text-blue-600 flex">
                                                                        {formatearSeparadorMiles.format(+(watchSalida('precio_hasta_editable') ?? 0))}
                                                                      </div>
                                                                      {(() => {
                                                                        const monedaActual = dataMonedaList?.find((m: Moneda) => m.id.toString() === monedaSeleccionada?.toString());

                                                                        if (monedaActual) {
                                                                          return (
                                                                            <p className="text-xs text-gray-500 mt-1">
                                                                              Precio máximo calculado del catálogo en {monedaActual.nombre} ({monedaActual.simbolo})
                                                                            </p>
                                                                          );
                                                                        }

                                                                        return null;
                                                                      })()}
                                                                    </div>
                                                                  }
                                                              </div>

                                                              <div className="grid grid-cols-4 items-center gap-4">
                                                                  <Label htmlFor="cantidadNoche" className="text-right">
                                                                    Cantidad noches 
                                                                  </Label>
                                                                <div className="text-2xl font-bold text-blue-600">
                                                                  {cantidadNoche ? cantidadNoche : 0}
                                                                </div>
                                                              </div>


                                                               {/* PORCENTAJE DE GANANCIA — oculto temporalmente */}
                                                               {/* PORCENTAJE DE COMISION — oculto temporalmente */}
                                                                

                                                            </div>
                                                        </div>    
                                                  

                                                        <Card className="bg-gray-50">
                                                              <CardHeader>
                                                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                                                  <Building2 className="w-5 h-5 text-primary" />
                                                                  Hoteles y Precios
                                                                </h3>
                                                                <p className="text-sm text-muted-foreground">
                                                                  Selecciona los hoteles disponibles y configura los precios por tipo de habitación
                                                                </p>

                                                                {!propio && <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-1 border-amber-300 rounded-lg p-3 shadow-md">
                                                                  <div className="flex items-start gap-4">
                                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 flex-shrink-0">
                                                                      <Building2 className="h-5 w-5 text-amber-700" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                      <h3 className="font-bold text-base text-amber-900 mb-1">Paquete de Distribuidora</h3>
                                                                      <p className="text-sm text-amber-800 leading-relaxed mt-2">
                                                                        El precio puede ser único por hotel o variar según la habitación.
                                                                      </p>
                                                                    </div>
                                                                  </div>
                                                                </div>}

                                                              </CardHeader>
                                                              <CardContent className="space-y-4 overflow-y-auto max-h-[60vh]" >
                                                                {dataHotelesList && dataHotelesList?.map((hotel: any) => (
                                                                  <Card
                                                                      key={hotel.id}
                                                                      className={`transition-all duration-200 border-2 ${selectedHotels.has(hotel.id) ? "border-blue-300 bg-blue-50/30" : "border-gray-200 bg-white"}`}
                                                                    >
                                                                    <CardContent className="p-4">
                                                                      {/* Header del hotel */}
                                                                      <div className="flex items-start justify-between gap-4">
                                                                        {/* Izquierda: checkbox + info */}
                                                                        <div className="flex items-start gap-3">
                                                                          <Checkbox
                                                                            id={hotel.id}
                                                                            checked={selectedHotels.has(hotel.id)}
                                                                            onCheckedChange={() => handleHotelToggle(hotel.id, hotel)}
                                                                            className="mt-1"
                                                                          />
                                                                          <div>
                                                                            <Label htmlFor={hotel.id} className="text-base font-semibold cursor-pointer leading-tight">
                                                                              {hotel.nombre}
                                                                            </Label>
                                                                            <div className="flex items-center gap-3 mt-1">
                                                                              {renderStars(hotel.estrellas)}
                                                                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                                <MapPin className="w-3 h-3" />
                                                                                <span>{hotel.direccion}</span>
                                                                              </div>
                                                                            </div>
                                                                          </div>
                                                                        </div>

                                                                        {/* Derecha: toggle modo precio */}
                                                                        {selectedHotels.has(hotel.id) && (
                                                                          <div className="flex flex-col items-end gap-1 shrink-0">
                                                                            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Modo de Precio</span>
                                                                            <div className="inline-flex rounded-lg bg-gray-100 p-0.5">
                                                                              <button
                                                                                type="button"
                                                                                onClick={(e) => { e.preventDefault(); handleModeChange(hotel.id, "hotel"); }}
                                                                                className={cn(
                                                                                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                                                                                  modoPrecio[hotel.id] === "hotel" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-800"
                                                                                )}
                                                                              >
                                                                                <Building2 className="h-3.5 w-3.5" />
                                                                                Por Hotel
                                                                              </button>
                                                                              <button
                                                                                type="button"
                                                                                onClick={(e) => { e.preventDefault(); handleModeChange(hotel.id, "room"); }}
                                                                                className={cn(
                                                                                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                                                                                  modoPrecio[hotel.id] === "room" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-800"
                                                                                )}
                                                                              >
                                                                                <DoorOpen className="h-3.5 w-3.5" />
                                                                                Por Habitación
                                                                              </button>
                                                                            </div>
                                                                          </div>
                                                                        )}
                                                                      </div>

                                                                      {/* Sección de configuración (solo cuando hotel seleccionado) */}
                                                                      {selectedHotels.has(hotel.id) && (
                                                                        <div className="mt-4">
                                                                          {/* Campo precio por hotel (modo hotel) */}
                                                                          {modoPrecio[hotel.id] === 'hotel' && (
                                                                            <div className="mb-4 flex items-center gap-3">
                                                                              <Label className="text-sm font-medium text-gray-700 shrink-0">
                                                                                Precio Final del Hotel *
                                                                              </Label>
                                                                              <div className="w-48">
                                                                                <Controller
                                                                                  name={`precio_habitacion_por_hotel_${hotel.id}`}
                                                                                  control={controlSalida}
                                                                                  rules={{
                                                                                    required: 'Debes completar este campo',
                                                                                    validate: (value) => {
                                                                                      if (value === null || value === undefined || value === '' || isNaN(Number(value))) return 'Valor inválido';
                                                                                      if (Number(value) <= 0) return 'Debe ser mayor que cero';
                                                                                      return true;
                                                                                    },
                                                                                  }}
                                                                                  render={({ field, fieldState: { error } }) => (
                                                                                    <div className="flex flex-col">
                                                                                      <NumericFormat
                                                                                        value={field.value ?? ''}
                                                                                        onValueChange={(values) => {
                                                                                          const val = values.floatValue ?? null;
                                                                                          if (val === null || val <= 0) { field.onChange(null); }
                                                                                          else {
                                                                                            console.log('field: ', field);
                                                                                            console.log('modoPrecio: ', modoPrecio)
                                                                                            field.onChange(val);
                                                                                            if (modoPrecio[hotel.id] === 'hotel') {
                                                                                              hotel?.habitaciones?.forEach((habitacion: any) => {
                                                                                                setValueSalida(`precio_paquete_habitacion_${habitacion.id}`, val);
                                                                                              });
                                                                                            }
                                                                                            setPreciosCatalogoTrigger(prev => prev + 1);
                                                                                          }
                                                                                        }}
                                                                                        onBlur={field.onBlur}
                                                                                        thousandSeparator="." decimalSeparator="," allowNegative={false} decimalScale={0} allowLeadingZeros={false}
                                                                                        placeholder="ej: 2.500.000"
                                                                                        className={`w-full p-1.5 pl-2.5 rounded-md border-2 text-sm ${error ? 'border-red-400' : 'border-blue-200 focus:border-blue-500'}`}
                                                                                      />
                                                                                      {error && <p className="text-xs text-red-500 mt-0.5">{error.message}</p>}
                                                                                    </div>
                                                                                  )}
                                                                                />
                                                                              </div>
                                                                              <p className="text-xs text-blue-600 font-medium">Precio único para todas las habitaciones</p>
                                                                            </div>
                                                                          )}

                                                                          {/* Header de habitaciones + stats */}
                                                                          <div className="mb-3">
                                                                            <p className="text-sm font-semibold text-gray-800">Configuración por tipo de habitación</p>
                                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                              {modoPrecio[hotel.id] === 'hotel'
                                                                                ? 'El precio del paquete es igual para todas las habitaciones. Asigná el cupo para cada tipo.'
                                                                                : 'Ingresá el cupo y el precio del paquete para cada tipo de habitación.'}
                                                                            </p>
                                                                            {/* Stats badges */}
                                                                            {(() => {
                                                                              const total = hotel?.habitaciones?.length ?? 0;
                                                                              const cupoTotal = hotel?.habitaciones?.reduce((acc: number, h: any) => {
                                                                                const v = getValuesSalida(`cupo_habitacion_${h.id}`);
                                                                                return acc + (Number(v) || 0);
                                                                              }, 0);
                                                                              const sinCompletar = hotel?.habitaciones?.filter((h: any) => {
                                                                                const cupo = getValuesSalida(`cupo_habitacion_${h.id}`);
                                                                                const precio = getValuesSalida(`precio_paquete_habitacion_${h.id}`);
                                                                                return !(propio && Number(cupo) > 0 && Number(precio) > 0 || !propio && Number(precio) > 0);
                                                                              }).length ?? 0;
                                                                              return (
                                                                                <div className="flex flex-wrap gap-2 mt-2">
                                                                                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                                                                                    {total} tipo{total !== 1 ? 's' : ''} habilitado{total !== 1 ? 's' : ''}
                                                                                  </span>
                                                                                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                                                                                    {propio ? `${cupoTotal} cupos totales` : 'Sujeto a disponibilidad'} 
                                                                                  </span>
                                                                                  {sinCompletar > 0 && (
                                                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                                                                                      {sinCompletar} sin completar
                                                                                    </span>
                                                                                  )}
                                                                                </div>
                                                                              );
                                                                            })()}
                                                                          </div>

                                                                          {/* Grid de cards por habitación */}
                                                                          {hotel?.habitaciones?.length === 0 ? (
                                                                            <p className="text-sm text-red-400">No tiene habitaciones asignadas</p>
                                                                          ) : (
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                              {hotel?.habitaciones?.map((habitacion: any) => {
                                                                                const cupoVal = Number(getValuesSalida(`cupo_habitacion_${habitacion.id}`)) || 0;
                                                                                const precioVal = modoPrecio[hotel.id] === 'hotel'
                                                                                  ? Number(getValuesSalida(`precio_habitacion_por_hotel_${hotel.id}`)) || 0
                                                                                  : Number(getValuesSalida(`precio_paquete_habitacion_${habitacion.id}`)) || 0;
                                                                                const isComplete = propio && cupoVal > 0 && precioVal > 0 || !propio && precioVal > 0;

                                                                                return (
                                                                                  <div
                                                                                    key={habitacion.id}
                                                                                    className="rounded-xl border-2 p-3 transition-all border-gray-200"
                                                                                  >
                                                                                    {/* Card header: icono + nombre + badge */}
                                                                                    <div className="flex items-center justify-between mb-3">
                                                                                      <div className="flex items-center gap-2">
                                                                                        {getRoomIcon(habitacion.tipo)}
                                                                                        <div>
                                                                                          <p className="text-sm font-semibold text-gray-800">{getRoomTypeLabel(habitacion.tipo)}</p>
                                                                                          {habitacion.capacidad && (
                                                                                            <p className="text-xs text-gray-400">{habitacion.capacidad} {habitacion.capacidad === 1 ? 'persona' : 'personas'}</p>
                                                                                          )}
                                                                                        </div>
                                                                                      </div>
                                                                                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border ${
                                                                                        isComplete
                                                                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                                          : 'bg-amber-50 text-amber-700 border-amber-200'
                                                                                      }`}>
                                                                                        <span className={`w-1.5 h-1.5 rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                                                                                        {isComplete ? 'Completo' : 'Pendiente'}
                                                                                      </span>
                                                                                    </div>

                                                                                    {/* Campos */}
                                                                                    <div className="grid grid-cols-2 gap-3">
                                                                                        {/* CUPOS DISPONIBLES (solo propio) */}
                                                                                        {propio && (
                                                                                          <div>
                                                                                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Cupos Disponibles</p>
                                                                                            <Controller
                                                                                              name={`cupo_habitacion_${habitacion.id}`}
                                                                                              control={controlSalida}
                                                                                              rules={{
                                                                                                required: 'Requerido',
                                                                                                validate: (value) => {
                                                                                                  if (value === null || value === undefined || value === '' || isNaN(Number(value))) return 'Inválido';
                                                                                                  if (Number(value) <= 0) return 'Debe ser > 0';
                                                                                                  return true;
                                                                                                },
                                                                                              }}
                                                                                              render={({ field, fieldState: { error } }) => (
                                                                                                <div>
                                                                                                  <NumericFormat
                                                                                                    value={field.value ?? ''}
                                                                                                    onValueChange={(values) => {
                                                                                                      const val = values.floatValue ?? null;
                                                                                                      field.onChange(val && val > 0 ? val : null);
                                                                                                    }}
                                                                                                    onBlur={field.onBlur}
                                                                                                    thousandSeparator="." decimalSeparator="," allowNegative={false} decimalScale={0} allowLeadingZeros={false}
                                                                                                    placeholder="ej: 20"
                                                                                                    className={`w-full p-1.5 pl-2 rounded-md border-2 text-sm ${error ? 'border-red-400' : 'border-gray-200 focus:border-blue-400'}`}
                                                                                                  />
                                                                                                  <p className="text-[10px] text-gray-400 mt-0.5">Habitaciones disponibles para este tipo</p>
                                                                                                </div>
                                                                                              )}
                                                                                            />
                                                                                          </div>
                                                                                        )}

                                                                                        {/* PRECIO DEL PAQUETE */}
                                                                                        <div className={propio ? '' : 'col-span-2'}>
                                                                                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Precio del Paquete</p>
                                                                                          <Controller
                                                                                            name={`precio_paquete_habitacion_${habitacion.id}`}
                                                                                            control={controlSalida}
                                                                                            rules={{
                                                                                              required: modoPrecio[hotel.id] === 'hotel' ? false : 'Requerido',
                                                                                              validate: (value) => {
                                                                                                if (modoPrecio[hotel.id] === 'hotel') return true;
                                                                                                if (value === null || value === undefined || value === '' || isNaN(Number(value))) return 'Inválido';
                                                                                                if (Number(value) <= 0) return 'Debe ser > 0';
                                                                                                return true;
                                                                                              },
                                                                                            }}
                                                                                            render={({ field, fieldState: { error } }) => (
                                                                                              <div>
                                                                                                <NumericFormat
                                                                                                  value={modoPrecio[hotel.id] === 'hotel' ? (watchSalida(`precio_habitacion_por_hotel_${hotel.id}`) ?? '') : (watchSalida(`precio_paquete_habitacion_${habitacion.id}`) ?? '')}
                                                                                                  onValueChange={(values) => {
                                                                                                    const val = values.floatValue ?? null;
                                                                                                    field.onChange(val && val > 0 ? val : null);
                                                                                                    setPreciosCatalogoTrigger(prev => prev + 1);
                                                                                                  }}
                                                                                                  onBlur={field.onBlur}
                                                                                                  thousandSeparator="." decimalSeparator="," allowNegative={false} decimalScale={0} allowLeadingZeros={false}
                                                                                                  placeholder="₲ 0"
                                                                                                  disabled={modoPrecio[hotel.id] === 'hotel'}
                                                                                                  className={`w-full p-1.5 pl-2 rounded-md border-2 text-sm ${error ? 'border-red-400' : 'border-gray-200 focus:border-blue-400'} ${modoPrecio[hotel.id] === 'hotel' ? 'bg-gray-50 cursor-not-allowed text-gray-500' : ''}`}
                                                                                                />
                                                                                                <p className="text-[10px] text-gray-400 mt-0.5">
                                                                                                  {modoPrecio[hotel.id] === 'hotel' ? 'Precio tomado del hotel' : 'Precio total del paquete para esta habitación'}
                                                                                                </p>
                                                                                              </div>
                                                                                            )}
                                                                                          />
                                                                                        </div>
                                                                                      </div>
                                                                                  </div>
                                                                                );
                                                                              })}
                                                                            </div>
                                                                          )}
                                                                        </div>
                                                                      )}
                                                                    </CardContent>
                                                                  </Card>
                                                                ))}
                                                              </CardContent>
                                                        </Card>
                                                    </div>

                                                    {/* SECCIÓN: Costos de la Salida */}
                                                    {propio && (
                                                      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                                                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                          <Tag className="w-5 h-5 text-emerald-600" />
                                                          Costos de la Salida
                                                        </h2>

                                                        {(() => {
                                                          const cupoSalida = Number(watchSalida('cupo')) || 0;
                                                          const costosPax = itemsCostoSalida.map(item => ({
                                                            ...item,
                                                            costo_pax: item.dividir_por_pasajeros && cupoSalida > 0
                                                              ? (item.monto ?? 0) / cupoSalida
                                                              : (item.monto ?? 0),
                                                          }));
                                                          const totalCostosPax = costosPax.reduce((acc, c) => acc + c.costo_pax, 0);
                                                          return (
                                                            <div className="border rounded-lg overflow-hidden">
                                                              <Table>
                                                                <TableHeader>
                                                                  <TableRow className="bg-gray-50">
                                                                    <TableHead>Tipo</TableHead>
                                                                    <TableHead>Monto total (₲)</TableHead>
                                                                    <TableHead className="text-right">Costo/pax (₲)</TableHead>
                                                                    <TableHead>Estado</TableHead>
                                                                  </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                  {costosPax.map((item) => {
                                                                    const esOverride = item.origen === 'override';
                                                                    return (
                                                                      <TableRow
                                                                        key={item.tipo_costo_id}
                                                                        className={esOverride ? 'bg-blue-50/40 border-l-2 border-l-blue-400' : ''}
                                                                      >
                                                                        <TableCell>
                                                                          <div className="font-medium text-gray-900">{item.nombre}</div>
                                                                          <div className="text-xs text-gray-500 mt-0.5">
                                                                            {item.dividir_por_pasajeros
                                                                              ? <span className="text-blue-600">÷ {cupoSalida || '—'} pasajeros</span>
                                                                              : <span>Por pasajero</span>
                                                                            }
                                                                          </div>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                          {esOverride ? (
                                                                            <div className="flex items-center gap-1">
                                                                              <span className="text-gray-400 text-sm">₲</span>
                                                                              <NumericFormat
                                                                                value={item.monto ?? ''}
                                                                                onValueChange={(values) => {
                                                                                  setItemsCostoSalida(prev => prev.map(i =>
                                                                                    i.tipo_costo_id === item.tipo_costo_id
                                                                                      ? { ...i, monto: values.floatValue ?? null }
                                                                                      : i
                                                                                  ));
                                                                                }}
                                                                                thousandSeparator="."
                                                                                decimalSeparator=","
                                                                                className="p-1 pl-2 rounded-md border-2 border-blue-200 focus:border-blue-500 w-36"
                                                                              />
                                                                            </div>
                                                                          ) : (
                                                                            <span className="text-gray-700 font-medium">
                                                                              ₲ {formatearSeparadorMiles.format(item.monto ?? 0)}
                                                                            </span>
                                                                          )}
                                                                        </TableCell>
                                                                        <TableCell className="text-right">
                                                                          <span className={`font-semibold text-sm ${esOverride ? 'text-blue-700' : 'text-gray-700'}`}>
                                                                            ₲ {formatearSeparadorMiles.format(Math.round(item.costo_pax))}
                                                                          </span>
                                                                          {item.dividir_por_pasajeros && item.monto && cupoSalida > 0 && (
                                                                            <div className="text-xs text-gray-400 mt-0.5">
                                                                              {formatearSeparadorMiles.format(item.monto ?? 0)} ÷ {cupoSalida}
                                                                            </div>
                                                                          )}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                          {esOverride ? (
                                                                            <div className="flex items-center gap-1.5">
                                                                              <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 text-xs whitespace-nowrap">
                                                                                ✏️ Personalizado
                                                                              </Badge>
                                                                              <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="text-gray-400 hover:text-gray-700 text-xs cursor-pointer h-6 px-1.5"
                                                                                onClick={() => setItemsCostoSalida(prev => prev.map(i =>
                                                                                  i.tipo_costo_id === item.tipo_costo_id
                                                                                    ? { ...i, monto: itemsCostoDefecto.find(d => d.tipo_costo_id === item.tipo_costo_id)?.monto ?? i.monto, origen: 'paquete' }
                                                                                    : i
                                                                                ))}
                                                                                title="Volver al monto del paquete"
                                                                              >
                                                                                ↩ Reset
                                                                              </Button>
                                                                              <button
                                                                                type="button"
                                                                                className="text-red-300 hover:text-red-500 hover:bg-red-50 rounded p-0.5 cursor-pointer"
                                                                                onClick={() => setItemsCostoSalida(prev => prev.filter(i => i.tipo_costo_id !== item.tipo_costo_id))}
                                                                              >
                                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                              </button>
                                                                            </div>
                                                                          ) : (
                                                                            <div className="flex items-center gap-1.5">
                                                                              <Badge variant="outline" className="text-gray-400 border-gray-200 bg-gray-50 text-xs whitespace-nowrap">
                                                                                📦 Paquete
                                                                              </Badge>
                                                                              <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 text-xs cursor-pointer h-6 px-1.5"
                                                                                onClick={() => setItemsCostoSalida(prev => prev.map(i =>
                                                                                  i.tipo_costo_id === item.tipo_costo_id ? { ...i, origen: 'override' } : i
                                                                                ))}
                                                                              >
                                                                                ✏️ Editar
                                                                              </Button>
                                                                            </div>
                                                                          )}
                                                                        </TableCell>
                                                                      </TableRow>
                                                                    );
                                                                  })}
                                                                </TableBody>
                                                                {itemsCostoSalida.length > 0 && (
                                                                  <tfoot>
                                                                    <tr className="bg-gray-50 border-t-2 border-gray-200">
                                                                      <td className="px-4 py-2 text-sm font-semibold text-gray-700" colSpan={2}>
                                                                        Subtotal costos operativos
                                                                      </td>
                                                                      <td className="px-4 py-2 text-sm font-bold text-gray-900 text-right">
                                                                        ₲ {formatearSeparadorMiles.format(Math.round(totalCostosPax))}
                                                                      </td>
                                                                      <td />
                                                                    </tr>
                                                                  </tfoot>
                                                                )}
                                                              </Table>
                                                            </div>
                                                          );
                                                        })()}

                                                        <Button
                                                          type="button"
                                                          variant="outline"
                                                          size="sm"
                                                          className="mt-3 text-emerald-600 border-emerald-200 hover:bg-emerald-50 cursor-pointer"
                                                          onClick={() => {
                                                            const tiposUsados = itemsCostoSalida.map(i => i.tipo_costo_id);
                                                            const tiposDisponibles = (dataTipoCostoList ?? []).filter((t: any) => t.activo && !tiposUsados.includes(t.id));
                                                            if (tiposDisponibles.length === 0) return;
                                                            const tipo = tiposDisponibles[0];
                                                            setItemsCostoSalida(prev => [
                                                              ...prev,
                                                              { tipo_costo_id: tipo.id, nombre: tipo.nombre, monto: null, dividir_por_pasajeros: tipo.dividir_por_pasajeros, origen: 'override' }
                                                            ]);
                                                          }}
                                                        >
                                                          <CirclePlus className="w-4 h-4 mr-1" />
                                                          Agregar costo extra solo para esta salida
                                                        </Button>
                                                      </div>
                                                    )}

                                                    {/* SECCIÓN: Resumen de Precios */}
                                                    {propio && (() => {
                                                      const cupo = Number(watchSalida('cupo')) || 0;
                                                      const precioVenta = Number(watchSalida('precio_desde_editable')) || 0;
                                                      const precioHasta = Number(watchSalida('precio_hasta_editable')) || 0;
                                                      const costoServicios = 0;

                                                      const costosCostos = itemsCostoSalida.map(item => ({
                                                        ...item,
                                                        monto_por_pasajero: item.dividir_por_pasajeros && cupo > 0
                                                          ? (item.monto ?? 0) / cupo
                                                          : (item.monto ?? 0),
                                                      }));
                                                      const totalCostos = costosCostos.reduce((acc, c) => acc + c.monto_por_pasajero, 0);
                                                      const costoTotal = costoServicios + totalCostos;
                                                      const margen = costoTotal > 0 && precioVenta > 0 ? ((precioVenta / costoTotal) - 1) * 100 : 0;
                                                      const esVentaPerdida = precioVenta > 0 && costoTotal > 0 && precioVenta < costoTotal;
                                                      const sinPrecio = precioVenta === 0;

                                                      return (
                                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mt-4">
                                                          <h2 className="text-base font-semibold text-gray-800 mb-4">Resumen de Precios</h2>

                                                          {/* Costos operativos — siempre visibles si hay ítems */}
                                                          {costoTotal > 0 && (
                                                            <>
                                                              {/* Barra de proporción visual */}
                                                              <div className="mb-4">
                                                                <div className="flex h-3 rounded-full overflow-hidden gap-px mb-1.5">
                                                                  {costoServicios > 0 && (
                                                                    <div
                                                                      className="bg-blue-400 transition-all"
                                                                      style={{ width: `${(costoServicios / costoTotal) * 100}%` }}
                                                                      title={`Servicios: ${((costoServicios / costoTotal) * 100).toFixed(1)}%`}
                                                                    />
                                                                  )}
                                                                  {costosCostos.map(item => item.monto_por_pasajero > 0 && (
                                                                    <div
                                                                      key={item.tipo_costo_id}
                                                                      className={`transition-all ${item.origen === 'override' ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                                                      style={{ width: `${(item.monto_por_pasajero / costoTotal) * 100}%` }}
                                                                      title={`${item.nombre}: ${((item.monto_por_pasajero / costoTotal) * 100).toFixed(1)}%`}
                                                                    />
                                                                  ))}
                                                                </div>
                                                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                                                                  {costoServicios > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Servicios</span>}
                                                                  {costosCostos.filter(c => c.monto_por_pasajero > 0).map(item => (
                                                                    <span key={item.tipo_costo_id} className="flex items-center gap-1">
                                                                      <span className={`w-2 h-2 rounded-full inline-block ${item.origen === 'override' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                                                                      {item.nombre}
                                                                    </span>
                                                                  ))}
                                                                </div>
                                                              </div>

                                                              <Separator className="mb-3" />

                                                              {/* Desglose línea a línea */}
                                                              <div className="space-y-1.5 text-sm mb-4">
                                                                {costoServicios > 0 && (
                                                                  <div className="flex justify-between text-gray-600">
                                                                    <span className="flex items-center gap-1.5">
                                                                      <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                                                                      Servicios:
                                                                    </span>
                                                                    <span>₲ {formatearSeparadorMiles.format(costoServicios)}</span>
                                                                  </div>
                                                                )}
                                                                {costosCostos.map(item => (
                                                                  <div key={item.tipo_costo_id} className="flex justify-between text-gray-600">
                                                                    <span className="flex items-center gap-1.5">
                                                                      <span className={`w-2 h-2 rounded-full inline-block ${item.origen === 'override' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                                                                      {item.nombre}{item.dividir_por_pasajeros && cupo > 0 ? ` (÷ ${cupo} pax)` : ''}:
                                                                    </span>
                                                                    <span className="flex items-center gap-1 tabular-nums">
                                                                      ₲ {formatearSeparadorMiles.format(Math.round(item.monto_por_pasajero))}
                                                                      <span className="text-xs opacity-60">{item.origen === 'override' ? '✏️' : '📦'}</span>
                                                                    </span>
                                                                  </div>
                                                                ))}
                                                                <Separator />
                                                                <div className="flex justify-between font-semibold text-gray-800 pt-0.5">
                                                                  <span>Costo operativo total/pax:</span>
                                                                  <span className="tabular-nums">₲ {formatearSeparadorMiles.format(Math.round(costoTotal))}</span>
                                                                </div>
                                                              </div>
                                                            </>
                                                          )}

                                                          {/* Precio de venta — solo si está ingresado */}
                                                          {sinPrecio ? (
                                                            <p className="text-sm text-amber-600 flex items-center gap-1.5">
                                                              <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                              Ingresá los precios de las habitaciones para ver el precio de venta
                                                            </p>
                                                          ) : (
                                                            <div className={`rounded-xl border-2 p-4 ${
                                                              esVentaPerdida
                                                                ? 'border-red-300 bg-red-50'
                                                                : costoTotal > 0 && margen < 10
                                                                ? 'border-amber-300 bg-amber-50'
                                                                : 'border-emerald-300 bg-emerald-50'
                                                            }`}>
                                                              <div className="flex items-start justify-between flex-wrap gap-4">
                                                                <div className="flex items-end gap-3">
                                                                  <div>
                                                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-0.5">
                                                                      Precio desde
                                                                    </p>
                                                                    <p className={`text-3xl font-bold tabular-nums ${
                                                                      esVentaPerdida ? 'text-red-600' : costoTotal > 0 && margen < 10 ? 'text-amber-700' : 'text-emerald-700'
                                                                    }`}>
                                                                      ₲ {formatearSeparadorMiles.format(Math.round(precioVenta))}
                                                                    </p>
                                                                  </div>
                                                                  {precioHasta > 0 && (
                                                                    <>
                                                                      <span className="text-gray-400 text-xl mb-1">—</span>
                                                                      <div>
                                                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-0.5">
                                                                          Hasta
                                                                        </p>
                                                                        <p className={`text-3xl font-bold tabular-nums ${
                                                                          esVentaPerdida ? 'text-red-600' : costoTotal > 0 && margen < 10 ? 'text-amber-700' : 'text-emerald-700'
                                                                        }`}>
                                                                          ₲ {formatearSeparadorMiles.format(Math.round(precioHasta))}
                                                                        </p>
                                                                      </div>
                                                                    </>
                                                                  )}
                                                                </div>
                                                                {/* {costoTotal > 0 && (
                                                                  <div className="text-center">
                                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                                                                      Margen
                                                                      <span className="ml-1 text-gray-400 normal-case font-normal" title="(Precio de venta / Costo operativo - 1) × 100">ⓘ</span>
                                                                    </p>
                                                                    <p className={`text-2xl font-bold ${
                                                                      esVentaPerdida ? 'text-red-600' : margen < 10 ? 'text-amber-700' : 'text-emerald-700'
                                                                    }`}>
                                                                      {margen.toFixed(1)}%
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 tabular-nums">
                                                                      ₲ {formatearSeparadorMiles.format(Math.round(precioVenta - costoTotal))}
                                                                    </p>
                                                                  </div>
                                                                )} */}
                                                              </div>
                                                              <div className={`mt-3 pt-3 border-t flex items-center gap-1.5 text-xs font-medium ${
                                                                esVentaPerdida
                                                                  ? 'border-red-200 text-red-600'
                                                                  : costoTotal > 0 && margen < 10
                                                                  ? 'border-amber-200 text-amber-700'
                                                                  : 'border-emerald-200 text-emerald-700'
                                                              }`}>
                                                                {/* {esVentaPerdida ? (
                                                                  <><AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> Precio por debajo del costo operativo — revisá los costos</>
                                                                ) : costoTotal === 0 ? (
                                                                  <><CheckIcon className="w-3.5 h-3.5 flex-shrink-0" /> Precio ingresado — cargá los costos para ver el margen</>
                                                                ) : margen < 10 ? (
                                                                  <><AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> Margen bajo — revisá si el precio es suficiente</>
                                                                ) : (
                                                                  <><CheckIcon className="w-3.5 h-3.5 flex-shrink-0" /> Precio saludable</>
                                                                )} */}
                                                              </div>
                                                            </div>
                                                          )}
                                                        </div>
                                                      );
                                                    })()}


                                                    <DialogFooter>
                                                      <Button type="button" variant="outline" className="cursor-pointer" 
                                                          onClick={resetSalidaForm}
                                                          >
                                                        Cancelar
                                                      </Button>
                                                      <Button 
                                                        disabled={validando}
                                                        type="submit" 
                                                        aria-disabled={validando}
                                                        // onClick={() => setValidando(true)}
                                                        className="bg-emerald-500 hover:bg-emerald-600 cursor-pointer"
                                                          >
                                                            {/* {isEditMode ? 'Actualizar Salida' : 'Agregar Salida'} */}

                                                            {validando ? 
                                                            <>
                                                              <Loader2Icon className="animate-spin w-10 h-10 text-gray-300"/>
                                                              Procesando...
                                                            </> : 
                                                            (isEditMode ? 'Actualizar Salida' : 'Agregar Salida')}
                                                      </Button>
                                                    </DialogFooter>
                                                    </form>
                                                </div>
                                              </DialogContent>
                                          </Dialog>
                                        </div>
                                        </div>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="rounded-md border">
                                          <Table>
                                            <TableHeader>
                                              <TableRow>
                                                <TableHead>Fecha Salida</TableHead>
                                                <TableHead>Fecha Regreso</TableHead>
                                                <TableHead>Precio Desde</TableHead>
                                                <TableHead>Precio Hasta</TableHead>
                                                <TableHead>Seña</TableHead>
                                                <TableHead>Cupo</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {salidas.map((salida: any) => (
                                                <TableRow key={salida.id}>
                                                  <TableCell className="font-medium">{formatearFecha(salida.fecha_salida_v2, false)}</TableCell>
                                                  <TableCell>{formatearFecha(salida?.fecha_regreso_v2, false)}</TableCell>
                                                  <TableCell>{formatearSeparadorMiles.format(salida.precio ?? salida.costo_base_desde)}</TableCell>
                                                  <TableCell>{salida?.costo_base_hasta ?
                                                          formatearSeparadorMiles.format(salida?.costo_base_hasta) : 
                                                          <Badge
                                                            className="bg-gray-100 text-gray-700 border-gray-200">
                                                            Sin tope
                                                          </Badge>
                                                      }
                                                  </TableCell>
                                                  <TableCell>{formatearSeparadorMiles.format(salida.senia)}</TableCell>
                                                  <TableCell>
                                                    {propio ? salida.cupo : 
                                                    <Badge
                                                      className="bg-gray-100 text-gray-700 border-gray-200">
                                                      Sujeto a disponibilidad
                                                    </Badge>}
                                                  </TableCell>
                                                  
                                                  <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                      <Button type="button" variant="ghost" size="sm" 
                                                            className="cursor-pointer"
                                                            onClick={() => handleEditSalida(salida)}
                                                            > 
                                                        <Edit className="h-4 w-4" />
                                                      </Button>
                                                      {!dataAEditar && 
                                                        <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          className="text-destructive hover:text-destructive"
                                                          onClick={() => handleDeleteRoom(salida.id)}
                                                        >
                                                          <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                      }
                                                    </div>
                                                  </TableCell>
                                                </TableRow>
                                              ))}
                                            </TableBody>
                                          </Table>
                                        </div>
                                      </CardContent>
                                    </Card>
                                
                              </div>
                    </div>

                    <div className="flex gap-3">
                      {/* {isPendingMutation && <>
                      </>} */}

                      {!dataAEditar &&
                        <Button 
                            onClick={() => {
                              console.log('destinoNoSeleccionada 1: ', destinoNoSeleccionada);
                              setOnGuardar(true)
                              
                              if(destinoNoSeleccionada === undefined){
                                  console.log('destinoNoSeleccionada 2: ', destinoNoSeleccionada);
                                  setDestinoNoSeleccionada(false);
                                }
                            }}
                            disabled={isPendingMutation}
                            type="submit"
                            className="bg-emerald-500 hover:bg-emerald-600 cursor-pointer">
                          {isPendingMutation ? 
                              <>
                                  <Loader2Icon className="animate-spin w-10 h-10 text-gray-300"/>
                                  Creando...
                              </> : 
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Crear Paquete  
                              </>}
                        </Button>
                      }
                      {dataAEditar &&
                        <Button 
                          disabled={isPendingEdit}
                          onClick={() => {
                              setOnGuardar(true)
                              
                              if(destinoNoSeleccionada === undefined){
                                  setDestinoNoSeleccionada(false);
                                }
                            }}
                          type="submit"
                          className="bg-emerald-500 hover:bg-emerald-600 cursor-pointer">
                        {isPendingEdit ? 
                            <>
                                <Loader2Icon className="animate-spin w-10 h-10 text-gray-300"/>
                                Guardando...
                            </> : 
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Guardar Paquete  
                            </>}
                      </Button>}

                      <Button
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent cursor-pointer"
                        onClick={() => {
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
                          <CardTitle className="text-blue-900">Lista de Paquete</CardTitle>
                          <CardDescription className="text-blue-700">
                            Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} paquetes
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


                         <Select 
                            value={filtros.tipo_paquete}
                            onValueChange={(val) => setFiltros({ ...filtros, tipo_paquete: val })}>
                            <SelectTrigger className="cursor-pointer w-40 border-blue-200 focus:border-blue-500">
                              <SelectValue placeholder="Tipo Persona" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos</SelectItem>
                              {tipoPaqueteFilterList && 
                                tipoPaqueteFilterList.map((tipoPaquete: any) => 
                                <SelectItem key={tipoPaquete.nombre} value={tipoPaquete.nombre}>{tipoPaquete.nombre}</SelectItem>
                                )}
                              {/* <SelectItem value="juridica">Aereo</SelectItem> */}
                            </SelectContent>
                          </Select> 
                        
                            <Select 
                              value={filtros.tipo_propiedad}
                              onValueChange={(val) => setFiltros({ ...filtros, tipo_propiedad: val })}>
                              <SelectTrigger className="cursor-pointer w-40 border-blue-200 focus:border-blue-500">
                                <SelectValue placeholder="Propiedad" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="Propio">Propio</SelectItem>
                                <SelectItem value="Distribuidor">Distribuidor</SelectItem>
                              </SelectContent>
                            </Select> 


                        <div className="relative w-6/8">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Buscar por nombre, apellido, razon social, documento o teléfono..."
                            value={nombreABuscar}
                            onChange={(e) => setNombreABuscar(e.target.value)}
                            className="pl-10 w-full border-gray-300 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-blue-200 w-full flex-wrap">

                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-gray-600 font-medium">Fecha Registro desde:</Label>
                        <Input
                          type="date"
                          value={filtros.fecha_desde}
                          onChange={(e) => setFiltros({...filtros, fecha_desde: e.target.value})}
                          className="w-40 border-blue-200 focus:border-blue-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-gray-600 font-medium">Fecha Registro hasta:</Label>
                        <Input
                          type="date"
                          value={filtros.fecha_hasta}
                          onChange={(e) => setFiltros({...filtros, fecha_hasta: e.target.value})}
                          className="w-40 border-blue-200 focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-2 mi-select-wrapper w-2/5">
                          {isFetchingZonaGeografica &&
                          <Select>
                            <SelectTrigger className="cursor-pointer border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 w-46 flex">
                              <div className="w-full flex items-center justify-center">
                                <Loader2Icon className="animate-spin w-6 h-6 text-gray-300"/>
                              </div>
                            </SelectTrigger>
                          </Select>
                          }
                          {!isFetchingZonaGeografica && 
                            <>
                              <div className="space-y-2 w-full">
                                <GenericSearchSelect
                                  dataList={dataZonaGeograficaList}
                                  value={selectedZonaGeograficaID}
                                  onValueChange={setSelectedZonaGeograficaID}
                                  handleDataNoSeleccionada={handleCadenaNoSeleccionada}
                                  placeholder="Selecciona la zona geografica..."
                                  labelKey="nombre"
                                  // secondaryLabelKey="destino"
                                  // thirdLabelKey="pais"
                                  valueKey="id"
                                />
                            </div>
                            </>
                          }
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
                            tipo_paquete: "all",
                            tipo_propiedad: "all"
                          });
                          setNombreABuscar("");
                          setSelectedZonaGeograficaID("");
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
                          <TableHead className="font-semibold text-gray-700 min-w-[120px]">Código</TableHead>
                          <TableHead className="font-semibold text-gray-700 min-w-[280px]">Información</TableHead>
                          <TableHead className="font-semibold text-gray-700 min-w-[140px]">Tipo</TableHead>
                          <TableHead className="font-semibold text-gray-700 min-w-[150px]">Destino</TableHead>
                          <TableHead className="font-semibold text-gray-700 min-w-[150px]">Precio Desde</TableHead>
                          {/* <TableHead className="font-semibold text-gray-700">Tipo</TableHead> */}
                          <TableHead className="font-semibold text-gray-700 min-w-[140px]">Fechas</TableHead>
                          <TableHead className="font-semibold text-gray-700 min-w-[140px]">Propiedad</TableHead>
                          {/* <TableHead className="font-semibold text-gray-700">Genero</TableHead> */}
                          <TableHead className="font-semibold text-gray-700 min-w-[100px]">Estado</TableHead>
                          {/* <TableHead className="font-semibold text-gray-700">Uso</TableHead> */}
                          {/* <TableHead className="font-semibold text-gray-700">Prioridad</TableHead> */}
                          <TableHead className="font-semibold text-gray-700 min-w-[110px]">Pasajeros</TableHead>
                          {/* <TableHead className="font-semibold text-gray-700">Fecha Modificación</TableHead> */}
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
                        {!isFetching && dataList.length > 0 && siTienePermiso("paquetes", "leer") && dataList.map((data: Paquete) => (
                          <TableRow
                            key={data.id}
                            className={`hover:bg-blue-50 transition-colors cursor-pointer`}
                          >
                            <TableCell>
                              <div>
                                <div className="font-medium text-gray-900 pl-2">{data?.numero}</div>
                              </div>
                            </TableCell>

                            <TableCell className="min-w-[120px]">
                              <div>
                                <Badge className="bg-gray-100 text-gray-700 border-gray-200 font-mono font-semibold">
                                  {data?.codigo || 'N/A'}
                                </Badge>
                              </div>
                            </TableCell>

                            <TableCell className="min-w-[280px]">
                              {/* <div className="flex items-center gap-3"> */}
                              <div className="flex items-center gap-3">
                                <img
                                    src={data.imagen || placeholderViaje}
                                    alt={data.nombre || "Imagen de paquete de viaje"}
                                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-gray-900 font-sans truncate max-w-[300px]">{data.nombre}</div>
                                  <div className="text-sm text-gray-500 font-sans">
                                    {data.personalizado ? "Personalizado" : "Fechas fijas"}
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="min-w-[140px]">
                              {/* <Badge
                                className={tipoPersonaColores[`${data?.persona?.tipo}`]}
                              > */}
                              <Badge
                                  className={`${
                                    data.tipo_paquete.nombre.toLocaleLowerCase() === "terrestre"
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : quitarAcentos(data.tipo_paquete.nombre.toLocaleLowerCase()) === "aereo"
                                        ? "bg-blue-100 text-blue-700 border-blue-200"
                                        : "bg-cyan-100 text-cyan-700 border-cyan-200"
                                  } border font-sans`}
                                >
                                  <>
                                    {data.tipo_paquete.nombre.toLocaleLowerCase() === "terrestre"
                                          ? <TbBus  className="h-5 w-5 text-gray-500" />
                                          : quitarAcentos(data.tipo_paquete.nombre.toLocaleLowerCase()) === "aereo"
                                            ? <Plane className="h-5 w-5 text-gray-500" />
                                            : <Croissant className="h-5 w-5 text-gray-500" />
                                      }
                                    
                                    <span>{data.tipo_paquete.nombre}</span>
                                  </>
                                </Badge>
                            </TableCell>

                            <TableCell className="min-w-[150px]">
                              <div>
                                <div className="font-medium text-gray-900 truncate max-w-[130px]">{data.destino.ciudad}</div>
                                <div className="text-sm text-gray-500 truncate max-w-[130px]">{data.destino.pais}</div>
                              </div>
                            </TableCell>

                            <TableCell className="min-w-[150px]">
                              <div>
                                <div className="font-medium text-green-600 truncate max-w-[130px]">{data.moneda.simbolo} 
                                                  {formatearSeparadorMiles.format(data.precio_venta_desde)}</div>
                                <div className="text-sm text-gray-500 truncate max-w-[130px]">Seña: {data.moneda.simbolo} {formatearSeparadorMiles.format(data.senia)}</div>
                              </div>
                            </TableCell>
                            

                            <TableCell className="min-w-[140px]">
                                <div>
                                  {data.personalizado && !data?.fecha_inicio ?
                                    <Badge className='bg-emerald-100 text-emerald-700 border-emerald-200'>
                                        Personalizado
                                    </Badge>
                                    : <>
                                      <div className="font-medium text-gray-900 truncate max-w-[120px]">{formatearFecha(data?.fecha_inicio ?? '', false)}</div>
                                      <div className="text-sm text-gray-500 truncate max-w-[120px]">{formatearFecha(data?.fecha_fin ?? '', false)}</div>
                                    </>}
                                </div>
                            </TableCell>

                            <TableCell className="min-w-[140px]">
                              <div>
                                <Badge className={`border font-sans ${data.propio ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                                  {data.propio ? 'Propio' : 'Distruidor'}
                                </Badge>
                                {!data.propio &&  <div className="text-xs text-gray-500 mt-1 font-sans truncate max-w-[120px]">{data?.distribuidora?.nombre}</div>}
                              </div>
                            </TableCell>

                          
                            {/*<TableCell>
                              <div>
                                <Badge className={`${data?.tipo_remuneracion?.nombre === 'Comisión' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                            (data?.tipo_remuneracion?.nombre === 'Mixto' ? 'bg-emerald-100 text-emerald-700 border-emerald-200': 'bg-green-100 text-green-700 border-green-200')
                                }`}>
                                    {data?.tipo_remuneracion?.nombre}
                                </Badge>
                                <div className="text-sm font-medium text-gray-500 truncate max-w-xs">
                                  {data?.tipo_remuneracion?.nombre === 'Comisión' ?  '% ' + formatearSeparadorMiles.format(data?.porcentaje_comision) : 
                                  (data?.tipo_remuneracion?.nombre === 'Mixto' ? 
                                    <>
                                    <p className="font-medium"> 
                                      {'Gs. ' + formatearSeparadorMiles.format(data?.salario)}</p>
                                    <p className="font-medium"> 
                                      {'% ' + formatearSeparadorMiles.format(data?.porcentaje_comision)}
                                    </p>
                                    </>
                                    : <p className="font-medium"> 
                                        {'Gs. ' + formatearSeparadorMiles.format(data?.salario)}
                                    </p>
                                    )}
                                </div>
                              </div> 
                            </TableCell>
                              */}

                            {/* <TableCell>
                              {data?.persona?.tipo === 'fisica' ? 
                              <div>
                                <Badge className={`${genderColors[`${data?.persona?.sexo ?? 'M'}`]}`}>{data.persona?.sexo === 'F'? 'Femenino': 'Masculino'}</Badge>
                              </div>: '-'}
                              
                            </TableCell> */}

                            <TableCell className="min-w-[100px]">
                              <Badge
                                className={
                                  data.activo
                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                    : "bg-gray-100 text-gray-700 border-gray-200"
                                }
                              >
                                {data.activo ? "Activo" : "Inactivo"}
                              </Badge>
                            </TableCell>
      
                            
                            <TableCell className="min-w-[110px]">
                              <div className="text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  {data.propio ? 
                                  <>
                                    <RiGroupLine className="h-4 w-4 text-gray-400" />
                                    <span>10/{data.cantidad_pasajeros}</span>
                                  </>: 
                                    <Badge
                                      className="bg-gray-100 text-gray-700 border-gray-200">
                                      Sujeto a disponibilidad
                                    </Badge>}
                                  {/* {formatearFecha(data.fecha_creacion)} */}
                                </div>
                              </div>
                            </TableCell>
                            
                            
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="border-gray-200">
                                  {siTienePermiso("paquetes", "leer") &&
                                    <DropdownMenuItem className="hover:bg-blue-50 cursor-pointer"
                                      onClick={() => handleVerDetalles(data)}>
                                      <Eye className="h-4 w-4 mr-2 text-blue-500" />
                                      Ver detalles
                                    </DropdownMenuItem>
                                  }
                                  {siTienePermiso("paquetes", "modificar") &&
                                  <DropdownMenuItem className="hover:bg-emerald-50 cursor-pointer" onClick={() => handleEditar(data)}>
                                    <Edit className="h-4 w-4 mr-2 text-emerald-500" />
                                    Editar
                                  </DropdownMenuItem>
                                  }

                                  {siTienePermiso("paquetes", "modificar") && 
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
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron paquetes</h3>
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
                            className={`hover:shadow-lg transition-shadow cursor-pointer mt-0 pt-0 `}
                          >
                            <div className="relative">
                              <img
                                src={pkg.imagen || placeholderViaje}
                                alt={pkg.nombre}
                                className="w-full h-48 object-cover rounded-t-lg"
                              />
                              <div className="absolute top-3 left-3">
                                <Badge
                                  className={`${
                                    pkg.tipo_paquete.nombre === "Terrestre"
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : pkg.tipo_paquete.nombre === "Aéreo"
                                        ? "bg-blue-100 text-blue-700 border-blue-200"
                                        : "bg-cyan-100 text-cyan-700 border-cyan-200"
                                  } border font-sans`}
                                >
                                  {pkg.tipo_paquete.nombre}
                                </Badge>
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
                                  <h3 className="font-semibold text-gray-900 text-lg font-sans">{pkg.nombre}</h3>
                                  <p className="text-gray-600 text-sm font-sans">{pkg.destino.ciudad}</p>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-semibold text-emerald-600 text-lg font-sans">
                                      {formatearSeparadorMiles.format(pkg?.precio_venta_desde ?? 0)}
                                    </div>
                                    {pkg.senia > 0 && (
                                      <div className="text-sm text-gray-500 font-sans">Seña: {formatearSeparadorMiles.format(pkg?.senia ?? 0)}</div>
                                    )}
                                  </div>
                                  <Badge
                                    className={`${
                                      pkg.propio
                                        ? "bg-blue-100 text-blue-700 border-blue-200"
                                        : "bg-orange-100 text-orange-700 border-orange-200"
                                    } border font-sans`}
                                  >
                                    {pkg.propio ? "Propio" : "Distribuidor"}
                                  </Badge>
                                </div>

                                {!pkg.personalizado && (
                                  <div className="text-sm text-gray-500 font-sans">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {formatearFecha(pkg.fecha_inicio ?? '', false)} - {formatearFecha(pkg.fecha_fin ?? '', false)}
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
                                  {siTienePermiso("paquetes", "leer") && 
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex-1 font-sans bg-transparent"
                                      onClick={() => handleVerDetalles(pkg)}
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      Ver
                                    </Button>
                                  }

                                  {siTienePermiso("paquetes", "modificar") &&
                                    <Button size="sm" className="flex-1 bg-emerald-500 hover:bg-emerald-600 font-sans"
                                      onClick={() => handleEditar(pkg)}>
                                      <Edit className="h-3 w-3 mr-1" />
                                      Editar
                                    </Button>
                                  }
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
      </div>
    </>

  )
}
