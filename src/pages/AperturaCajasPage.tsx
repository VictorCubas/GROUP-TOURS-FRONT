/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { startTransition, use, useEffect, useState } from "react"
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
  Loader2Icon,
  CheckIcon,
  User,
  X,
  Info,
} from "lucide-react"

// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"

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


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AperturaListado, Caja, RespuestaPaginada, } from "@/types/cajas"
import { capitalizePrimeraLetra, formatearFecha, formatearSeparadorMiles } from "@/helper/formatter"
import { activarDesactivarData, fetchCajasDisponibles, fetchContizacion, fetchData, fetchDataResponsable, fetchResumen, guardarDataEditado, nuevoDataFetch, } from "@/components/utils/httpAperturasCajas"
import { Controller, useForm } from "react-hook-form"
import { queryClient } from "@/components/utils/http"
import { ToastContext } from "@/context/ToastContext"
import Modal from "@/components/Modal"
import { IoCheckmarkCircleOutline, IoWarningOutline } from "react-icons/io5";
import ResumenCardsDinamico from "@/components/ResumenCardsDinamico"
import { Checkbox } from "@/components/ui/checkbox"
import { useSessionStore } from "@/store/sessionStore"
import { Textarea } from "@/components/ui/textarea"
import { fetchDataPuntoExpedicionTodo } from "@/components/utils/httpFacturacion"
import type { PuntoExpedicion } from "@/types/facturacion"
import { DinamicSearchSelect } from "@/components/DinamicSearchSelect"
import { NumericFormat } from "react-number-format"


const usuariosStatusColors = {
  true: "bg-emerald-100 text-emerald-700 border-emerald-200",
  false: "bg-gray-100 text-gray-700 border-gray-200",
}


let dataList: any[] = [];
const filtrosParaCajas = {
                  activo: true,   // null = todos, true = solo activos
                  estado: "cerrada",
                }

export default function AperturaCajasPage() {
  // const [setSearchTerm] = useState("")
  const {siTienePermiso } = useSessionStore();
  const [nombreABuscar, setNombreABuscar] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [dataAEditar, setDataAEditar] = useState<AperturaListado>();
  const [dataADesactivar, setDataADesactivar] = useState<AperturaListado>();
  const [onDesactivarData, setOnDesactivarData] = useState(false);
  const [onVerDetalles, setOnVerDetalles] = useState(false);
  const [dataDetalle, setDataDetalle] = useState<AperturaListado>();
  const [newDataPersonaList, setNewDataPersonaList] = useState<any[]>();
  const [personaBusqueda, setPersonaBusqueda] = useState<string>("");
  const [montoAlternativo, setMontoAlternativo] = useState<number>(0);
  const [selectedPersonaID, setSelectedPersonaID] = useState<number | "">("");
  const [selectedTitularData, setSelectedTitularData] = useState<any | undefined>();
  const [personaNoSeleccionada, setPersonaNoSeleccionada] = useState<boolean | undefined>();
  const [onGuardar, setOnGuardar] = useState(false);
  const [cajaListFinal, setCajaListFinal] = useState<Caja[]>([]);
  const {handleShowToast} = use(ToastContext);

  const [filtros, setFiltros] = useState({
                  activo: true,   // null = todos, true = solo activos
                  estado: "all",
                  nombre: ""
                });
  

  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('list');
  const [paginacion, setPaginacion] = useState<RespuestaPaginada>({
                                                      next: null,
                                                      totalItems: 5,
                                                      previous: null,
                                                      totalPages: 5,
                                                      pageSize: 10
                                              });

  const {data, isFetching, isError} = useQuery({
    queryKey: ['aperturas', currentPage, paginacion.pageSize, filtros], //data cached
    queryFn: () => fetchData(currentPage, paginacion.pageSize, filtros),
    staleTime: 5 * 60 * 1000, //despues de 5min los datos se consideran obsoletos
    // enabled: !((filtros.fecha_desde && !filtros.fecha_hasta) || (!filtros.fecha_desde && filtros.fecha_hasta))
    // enabled: 
  // ,
  });

  const {data: dataResumen, isFetching: isFetchingResumen, isError: isErrorResumen} = useQuery({
    queryKey: ['aperturas-resumen'], //data cached
    queryFn: () => fetchResumen(),
    staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
  });

  const {data: dataCotizacion, isFetching: isFetchingCotizacion, isError: isErrorContizacion} = useQuery({
    queryKey: ['contizacion-al-dia'], //data cached
    queryFn: () => fetchContizacion(),
    staleTime: 30 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
  });


  console.log(dataCotizacion)

  const {data: dataCajaList, isFetching: isFetchingCajas,} = useQuery({
        queryKey: ['cajas-todos',], //data cached
        queryFn: () =>fetchCajasDisponibles(1, 50, filtrosParaCajas),
        staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
      });
  

    console.log(dataCajaList);

    // console.log('tengo mis permisos?: ', siTienePermiso("apertura", "crear"))
    // console.log('tengo mis permisos?: ', siTienePermiso("apertura", "leer"))
    console.log('tengo mis permisos?: ', siTienePermiso("aperturas", "modificar"))
    // console.log('tengo mis permisos?: ', siTienePermiso("apertura", "eliminar"))
    // console.log('tengo mis permisos?: ', siTienePermiso("apertura", "exportar"))

  // let filteredPermissions: Modulo[] = [];
  

  if(!isFetching && !isError){
    if(data?.results){
      dataList = data.results.map((per: AperturaListado, index: number) => ({...per, numero: index + 1}));
    }
  }

  
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

  const {data: dataPersonaList, isFetching: isFetchingPersonas} = useQuery({
      queryKey: ['responsables-disponibles', 1, 10, {activo: true, tipo: 'fisica', sexo: 'all', busqueda: personaBusqueda}], //data cached 
      queryFn: () => fetchDataResponsable(1, 10, {activo: true, tipo: 'fisica', sexo: 'all', busqueda: personaBusqueda}),
      staleTime: 5 * 60 * 1000, //despues de 5min los datos se consideran obsoletos
      // enabled: !((filtros.fecha_desde && !filtros.fecha_hasta) || (!filtros.fecha_desde && filtros.fecha_hasta))
      // enabled: Boolean(personaBusqueda)
    // ,
    });

  console.log(dataPersonaList )

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

  useEffect(() => {
    if(isFetchingPersonas){
      setNewDataPersonaList([])
    }
  }, [isFetchingPersonas]);



  const {mutate, isPending: isPendingMutation} = useMutation({
    mutationFn: nuevoDataFetch,
    onSuccess: () => {
        handleShowToast('Se ha creado un nueva persona satisfactoriamente', 'success');

        handleCancel();

        queryClient.invalidateQueries({
          queryKey: ['aperturas'],
          exact: false
        });

        queryClient.invalidateQueries({
          queryKey: ['aperturas-resumen'],
        });
    },
  }); 

  const {mutate: mutateGuardarEditado, isPending: isPendingEdit} = useMutation({
    mutationFn: guardarDataEditado,
    onSuccess: () => {
        handleShowToast('Se ha guardado la persona satisfactoriamente', 'success');
        handleCancel()

        setActiveTab('list');
        queryClient.invalidateQueries({
          queryKey: ['aperturas'],
          exact: false
        });

        queryClient.invalidateQueries({
          queryKey: ['aperturas-resumen'],
        });
    },
  });

  const {mutate: mutateDesactivar, isPending: isPendingDesactivar} = useMutation({
    mutationFn: activarDesactivarData,
    onSuccess: () => {
        handleShowToast('Se ha desactivado el persona satisfactoriamente', 'success');

        handleCancel()
        //desactivamos todas las queies
        queryClient.invalidateQueries({
          queryKey: ['aperturas'],
          exact: false
        });
        queryClient.invalidateQueries({
          queryKey: ['aperturas-resumen'],
        });
    },
  });


  // Función para obtener la fecha y hora local en formato YYYY-MM-DDTHH:mm
  const getFechaHoraLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // DATOS DEL FORMULARIO
    const {control, register, handleSubmit, watch, formState: {errors, }, clearErrors, reset, setValue} =
              useForm<any>({
                mode: "onBlur",
                defaultValues: {
                  nombre: "",
                  ubicacion: "",
                  observaciones_apertura: "",
                  monto_inicial: null,
                  monto_inicial_alternativo: null,
                  fecha_hora_apertura: getFechaHoraLocal()
                }
              });


  const handleCancel = () => {
        setDataAEditar(undefined);
        setOnDesactivarData(false);
        setDataADesactivar(undefined);
        setSelectedTitularData(undefined)
        handleDataNoPersonaSeleccionada(undefined)
        handleDataNoSeleccionada(undefined)
        setNewDataPersonaList([]);
        setSelectedPersonaID("");
        setMontoAlternativo(0);
        setCajaListFinal(dataCajaList || []); // Resetear a la lista original de cajas
        reset({
          nombre: "",
          ubicacion: "",
          observaciones_apertura: "",
          caja: '',
          monto_inicial: null,
          monto_inicial_alternativo: null,
          fecha_hora_apertura: getFechaHoraLocal()
        });
        setActiveTab('list');

  }


  const handleGuardarNuevaData = async (dataForm: any) => {
    if(!selectedPersonaID){
        handleShowToast('Debes seleccionar el responsable', 'error');
        return;
      }

    // Convertir la fecha del input datetime-local a formato ISO UTC
    const fechaLocal = new Date(dataForm.fecha_hora_apertura);
    const fechaISO = fechaLocal.toISOString();

    // Construir el payload según lo que espera el backend
    const payload = {
      caja: Number(dataForm.caja),
      // responsable: Number(selectedPersonaID),
      responsable: null,
      fecha_hora_apertura: fechaISO,
      monto_inicial: Number(dataForm.monto_inicial).toFixed(2),
      monto_inicial_alternativo: Number(dataForm.monto_inicial_alternativo).toFixed(2),
      observaciones_apertura: dataForm.observaciones_apertura || ""
    }

    // {
    //   "caja": 1,
    //   "responsable": 9,
    //   "fecha_hora_apertura": "2025-11-14T10:30:00.000Z",
    //   "monto_inicial": "300000.00",
    //   "monto_inicial_alternativo": "42.13",
    //   "observaciones_apertura": ""
    // }

    console.log('Payload a enviar:', payload);
    mutate(payload);
  }

  const handleGuardarDataEditado = async (dataForm: any) => {
    console.log('dataForm editar: ', dataForm)

    if(!selectedPersonaID){
        handleShowToast('Debes seleccionar el responsable', 'error');
        return;
    }

    // Convertir la fecha del input datetime-local a formato ISO UTC
    const fechaLocal = new Date(dataForm.fecha_hora_apertura);
    const fechaISO = fechaLocal.toISOString();

    const payload = {
      id: dataAEditar?.id,
      caja: Number(dataForm.caja),
      responsable: null,
      // responsable: Number(selectedPersonaID),
      fecha_hora_apertura: fechaISO,
      monto_inicial: Number(dataForm.monto_inicial).toFixed(2),
      monto_inicial_alternativo: Number(dataForm.monto_inicial_alternativo).toFixed(2),
      observaciones_apertura: dataForm.observaciones_apertura || ""
    }

    console.log('dataAEditar: ', dataAEditar)
    console.log('payload editar: ', payload)

    mutateGuardarEditado(payload);
  }


  // Este useEffect ya no es necesario, se maneja en el useEffect de abajo
  // useEffect(() => {
  //   if (dataAEditar && dataCajaList && dataCajaList.length > 0) {
  //     console.log('reset data para editar: ', dataAEditar)
  //   }
  // }, [dataAEditar, dataCajaList, reset]);


  useEffect(() => {
    if(dataPersonaList){
        console.log(dataPersonaList);

        const dataPersonasResponsables = dataPersonaList.map((data: any) => ({
          ...data, tipo_documento_nombre: data?.tipo_documento?.nombre
        }))

      if(dataAEditar){
        // Verificar si el responsable actual ya está en la lista
        const responsableYaEnLista = dataPersonasResponsables.some(
          (persona: any) => persona.empleado_id === dataAEditar.responsable
        );

        // Si el responsable no está en la lista, crear un objeto temporal con los datos disponibles
        if (!responsableYaEnLista) {
          const responsableActual = {
            empleado_id: dataAEditar.responsable,
            nombre_completo: dataAEditar.responsable_nombre,
            puesto: dataAEditar.responsable_puesto,
            email: '', // No disponible en el listado
            telefono: '', // No disponible en el listado
            roles: []
          };
          setNewDataPersonaList([responsableActual, ...dataPersonasResponsables]);
        } else {
          setNewDataPersonaList([...dataPersonasResponsables]);
        }
      }
      else{
        console.log(dataPersonasResponsables)
        console.log('dataPersonaList: ', dataPersonasResponsables)
        setNewDataPersonaList([...dataPersonasResponsables])
      }
    }
  }, [dataAEditar, dataPersonaList]); 

  console.log(newDataPersonaList);

  // Efecto para manejar la lista de cajas, incluyendo la caja actual si se está editando
  useEffect(() => {
    if (dataCajaList && dataCajaList.length > 0) {
      if (dataAEditar) {
        // Verificar si la caja actual ya está en la lista
        const cajaYaEnLista = dataCajaList.some(
          (caja: Caja) => caja.id === dataAEditar.caja
        );

        // Si la caja no está en la lista (porque está abierta), agregarla temporalmente
        if (!cajaYaEnLista) {
          const cajaActual: any = {
            id: dataAEditar.caja,
            nombre: dataAEditar.caja_nombre,
            numero_caja: dataAEditar.caja_numero,
            punto_expedicion: 0, // No disponible en el listado de aperturas
            punto_expedicion_nombre: '',
            establecimiento_nombre: '',
            establecimiento_codigo: '',
            observaciones_apertura: "",
            emite_facturas: false,
            ubicacion: '',
            estado_actual: 'abierta',
            saldo_actual: '0',
            activo: true,
            saldo_actual_alternativo: 0,
            moneda_alternativa: 'USD'
          };
          setCajaListFinal([cajaActual, ...dataCajaList]);
        } else {
          setCajaListFinal([...dataCajaList]);
        }
      } else {
        setCajaListFinal([...dataCajaList]);
      }
    } else {
      setCajaListFinal([]);
    }
  }, [dataCajaList, dataAEditar]);

  useEffect(() => {
    if (dataAEditar) {
      console.log('reset data para editar: ', dataAEditar)

      // Convertir la fecha ISO a formato datetime-local (YYYY-MM-DDTHH:mm)
      let fechaLocal = getFechaHoraLocal();
      if (dataAEditar.fecha_hora_apertura) {
        const fecha = new Date(dataAEditar.fecha_hora_apertura);
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        const hours = String(fecha.getHours()).padStart(2, '0');
        const minutes = String(fecha.getMinutes()).padStart(2, '0');
        fechaLocal = `${year}-${month}-${day}T${hours}:${minutes}`;
      }

      reset({
        caja: dataAEditar.caja.toString(),
        monto_inicial: Number(dataAEditar.monto_inicial),
        monto_inicial_alternativo: dataAEditar.monto_inicial_alternativo ? Number(dataAEditar.monto_inicial_alternativo) : null,
        fecha_hora_apertura: fechaLocal,
        observaciones_apertura: dataAEditar.observaciones_apertura // Las observaciones no vienen en el listado
      });

      console.log(dataAEditar.responsable)
      setSelectedPersonaID(dataAEditar.responsable); 
      handleDataNoSeleccionada(true);
    }
  }, [dataAEditar, reset]);


  const handleEditar = (data: AperturaListado) => {
    console.log('data: ', data)
    setDataAEditar(data);
    setSelectedPersonaID(data!.responsable)
    setActiveTab('form');
    
  }

  const handleDataNoSeleccionada = (value: boolean | undefined) => {
    console.log(value)
  }

  const toggleActivar = (modulo: AperturaListado) => {
    setOnDesactivarData(true);
    setDataADesactivar(modulo);
  }

  const handleCloseModal = () => {
    setOnDesactivarData(false);
  }

  const handleConfirmActivo = (activo=true) => {
    mutateDesactivar({ dataId: dataADesactivar!.id, activo, })
  }

  const handleVerDetalles = (data: AperturaListado) => {
    setDataDetalle(data);
    setOnVerDetalles(true);
  }

  const handleCloseVerDetalles = () => {
    setOnVerDetalles(false);
    setDataDetalle(undefined);
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


  const handleDataNoPersonaSeleccionada = (value: boolean | undefined) => {
    console.log(value)
    setPersonaNoSeleccionada(value);
  }


  const montoInicial = watch('monto_inicial');

  // Cálculo automático del monto alternativo en USD
  useEffect(() => {
    console.log(dataCotizacion)
    console.log(montoInicial)
    console.log(dataCotizacion?.valor_en_guaranies)
    if (montoInicial && dataCotizacion?.valor_en_guaranies) {
      
      const montoEnDolares = Number(montoInicial) / Number(dataCotizacion.valor_en_guaranies);
      console.log(montoEnDolares)
      setValue('monto_inicial_alternativo', parseFloat(montoEnDolares.toFixed(2)));
    } else {
      setValue('monto_inicial_alternativo', null);
    }
  }, [montoInicial, dataCotizacion, setValue]);


  console.log(dataDetalle)

  // Cálculo automático del monto alternativo en USD
  useEffect(() => {
    console.log(dataCotizacion)
    console.log(dataDetalle)
    if (dataDetalle && dataCotizacion?.valor_en_guaranies) {
      
      const montoEnDolares = Number(dataDetalle.monto_inicial) / Number(dataCotizacion.valor_en_guaranies);
      console.log(montoEnDolares)
      setMontoAlternativo(parseFloat(montoEnDolares.toFixed(2)));
    } else {
      setMontoAlternativo(0);
    }
  }, [dataCotizacion, dataDetalle]);


  const montoEnDolares = (monto: number) => {
    if(!dataCotizacion) return;

      const montoEnDolares = Number(monto) / Number(dataCotizacion.valor_en_guaranies);
      return parseFloat(montoEnDolares.toFixed(2));
  }


  return (
    <>
        {onVerDetalles && 
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="modal-detalles-reserva bg-white/95 rounded-xl shadow-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto backdrop-blur-sm">
              <Modal onClose={handleCloseVerDetalles} claseCss={'modal-detalles'}>
                  <div className=" bg-white rounded-lg shadow-lg p-6">
                      {/* Header */}
                      <div className="mb-6 border-b pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                            <Shield className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                              {dataDetalle?.codigo_apertura}
                            </h2>
                            <p className="text-gray-600">Detalles completos de la apertura</p>
                          </div>
                        </div>
                      </div>


                        <div className="space-y-6">
                          {/* Información básica */}
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Código de Apertura</Label>
                            <p className="mt-1 text-gray-900 font-semibold">
                              {dataDetalle?.codigo_apertura}
                            </p>
                          </div>

                          {/* Estado y configuración */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Estado de la Caja</Label>
                              <div className="mt-1">
                                <Badge
                                  className={dataDetalle?.esta_abierta
                                    ? 'bg-green-100 text-green-700 border-green-200'
                                    : 'bg-red-100 text-red-700 border-red-200'}
                                >
                                  {dataDetalle?.esta_abierta ? 'Abierta' : 'Cerrada'}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Estado de Registro</Label>
                              <div className="mt-1">
                                <Badge
                                  className={usuariosStatusColors[dataDetalle?.activo.toString() as keyof typeof usuariosStatusColors]}
                                >
                                  {dataDetalle?.activo ? "Activo" : "Inactivo"}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Información de la caja y responsable */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Caja</Label>
                              <p className="mt-1 text-gray-900 font-medium">
                                {dataDetalle?.caja_nombre}
                              </p>
                              <p className="text-sm text-gray-500">
                                Número: {dataDetalle?.caja_numero}
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Responsable</Label>
                              <p className="mt-1 text-gray-900 font-medium">
                                {dataDetalle?.responsable_nombre}
                              </p>
                              <p className="text-sm text-gray-500">
                                {dataDetalle?.responsable_puesto}
                              </p>
                            </div>
                          </div>

                          {/* Montos */}
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <Label className="text-sm font-medium text-gray-700 mb-3 block">Información de Montos Iniciales</Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-500">Monto Inicial (Gs.)</Label>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                  {formatearSeparadorMiles.format(Number(dataDetalle?.monto_inicial ?? 0))}
                                </p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-500">Monto Alternativo (USD)</Label>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                  $ {montoAlternativo}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Información adicional */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Fecha y Hora de Apertura</Label>
                              <p className="mt-1 text-gray-900">
                                {formatearFecha(dataDetalle?.fecha_hora_apertura ?? '')}
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Cantidad de Movimientos</Label>
                              <p className="mt-1 text-gray-900 font-semibold">
                                {dataDetalle?.movimientos_count ?? 0}
                              </p>
                            </div>
                          </div>
                        </div>


                      {/* Footer */}
                      <div className="flex justify-end gap-3 mt-6">
                        <button
                          onClick={handleCloseVerDetalles}
                          className="cursor-pointer border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>

              </Modal>
            </div>
      </div>}

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
                      ¿Estás seguro de que deseas {dataADesactivar!.activo ? 'desactivar' : 'activar'} la apertura con código
                      <b>
                          {' ' + dataADesactivar?.codigo_apertura}
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
      </div>}

      <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-3xl font-semibold text-gray-900">Aperturas</h1>
              </div>
              <p className="text-gray-600">Gestiona los datos de los aperturas del sistema y su estado.</p>
            </div>
            <div className="flex gap-3">
              {siTienePermiso("aperturas", "exportar") && 
                  <Button
                    variant="outline"
                    className="border-emerald-200 text-emerald-700 cursor-pointer hover:bg-emerald-50 bg-transparent"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
              }

              {siTienePermiso("aperturas", "crear") && (
                <Button
                  disabled={true}
                  title="Las aperturas solo se pueden crear desde la vista de Cajas"
                  className="bg-blue-500 hover:bg-blue-600 cursor-not-allowed opacity-50"
                  onClick={() => setActiveTab('form')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Apertura Caja
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <ResumenCardsDinamico resumen={dataResumen} isFetchingResumen={isFetchingResumen} isErrorResumen={isErrorResumen}/>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-80 bg-gray-100">
              <TabsTrigger value="list" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white cursor-pointer">
                Lista de Aperturas
              </TabsTrigger>
              <TabsTrigger disabled={true}
                  title="Las aperturas solo se pueden crear desde la vista de Cajas"
                  value="form"
                  className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white cursor-not-allowed">
                {dataAEditar ?  'Editar Apertura' : 'Crear Apertura'}
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
                        <CardTitle className="text-emerald-900">
                          {dataAEditar ? 'Editar Apertura' : 'Crear Nueva Apertura'}
                        </CardTitle>
                        <CardDescription className="text-emerald-700">
                          {dataAEditar
                            ? 'Modifique los datos de la apertura seleccionada'
                            : 'Complete la información para crear una nueva apertura'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* CAJA */}
                      <div className="space-y-2">
                        <Label htmlFor="caja" className="text-gray-700 font-medium">
                          Caja *
                        </Label>

                        {isFetchingCajas && (
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

                        {!isFetchingCajas &&
                          <Controller
                            name="caja"
                            control={control}
                            rules={{
                              required: "Este campo es requerido"
                            }}
                            render={({ field }) => (
                              <div className="w-full min-w-0 select-container"> {/* Contenedor para controlar el layout */}
                                <Select
                                  disabled={!!dataAEditar}
                                  value={field.value}
                                  onValueChange={(value) => {
                                    field.onChange(value)
                                    if (value) {
                                      clearErrors("caja")
                                    }

                                    console.log('value: ', value);
                                  }}
                                  onOpenChange={(open) => {
                                    if (!open && !field.value) {
                                      field.onBlur(); 
                                    }
                                  }}
                                >
                                  <SelectTrigger className="w-full cursor-pointer border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-left">
                                    <SelectValue placeholder="Selecciona la caja" />
                                  </SelectTrigger>
                                  <SelectContent className="min-w-[var(--radix-select-trigger-width)] max-h-60">
                                    {cajaListFinal.map((data: Caja) => 
                                      <SelectItem 
                                        key={data.id} 
                                        value={data.id.toString()}
                                        className="pl-2 pr-4"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div className="flex-shrink-0 w-3 h-3 bg-blue-400 rounded-full"></div>
                                          <span className="truncate">{data.nombre}</span>

                                          <span>
                                            <Badge className={`text-xs bg-gray-100 text-gray-600 border-gray-200 `}>
                                              {data.establecimiento_nombre}
                                            </Badge>
                                            </span>
                                        </div>
                                      </SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          />
                        }

                        {errors.caja && (
                          <p className="text-red-400 text-sm">{errors.caja.message as string}</p>
                        )}
                        
                    </div>

                    <div className="space-y-2 mi-select-wrapper">
                        <Label htmlFor="persona" className="text-gray-700 font-medium">
                          Responsable *
                        </Label>

                        <DinamicSearchSelect
                          // disabled={!!dataAEditar}
                          dataList={newDataPersonaList || []}
                          value={selectedPersonaID}
                          onValueChange={setSelectedPersonaID}
                          setSelectedTitularData={setSelectedTitularData}
                          handleDataNoSeleccionada={handleDataNoPersonaSeleccionada}
                          onSearchChange={setPersonaBusqueda}
                          isFetchingPersonas={isFetchingPersonas}
                          placeholder="Buscar un responsable por documento o nombre..."
                          labelKey='nombre_completo'
                          secondaryLabelKey='email'
                          // thirdLabelKey='tipo_documento_nombre'
                          valueKey="empleado_id"
                        />

                        {(personaNoSeleccionada === false ||
                          (onGuardar === true && personaNoSeleccionada === undefined)) && (
                          <p className="text-red-400 text-sm">Este campo es requerido</p>
                        )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="monto_inicial" className="text-gray-700 font-medium">
                        Monto inicial (Gs) *
                      </Label>

                    <div className="col-span-3 flex gap-2">  
                      <Controller
                        name="monto_inicial"
                        control={control}
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
                              placeholder="ej: 300.000"
                              className={`flex-1 p-1 pl-2.5 rounded-md border-2 ${
                                error
                                  ? 'border-red-400 focus:!border-red-400 focus:ring-0 outline-none'
                                  : 'border-blue-200 focus:border-blue-500'
                              }`}
                            />
                            {error && (
                              <span className="text-red-400 text-sm mt-1">{error.message}</span>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </div>  
                  
                  {/* {
  "id": 8,
  "moneda": 2,
  "moneda_nombre": "Dolar",
  "moneda_codigo": "USD",
  "moneda_simbolo": "$",
  "valor_en_guaranies": 7120,
  "fecha_vigencia": "2025-11-14",
  "usuario_registro": 10,
  "usuario_nombre": "andrea.tutoriaescurra",
  "observaciones": "",
  "fecha_creacion": "2025-11-14T01:37:21+0000",
  "fecha_modificacion": "2025-11-14T01:37:21+0000"
} */}
                     {/* MONTO ALTERNATIVO (CALCULADO AUTOMÁTICAMENTE) */}
                    <div className="space-y-2">
                      <Label htmlFor="monto_inicial_alternativo" className="text-gray-700 font-medium">
                        Monto Alternativo (USD)
                      </Label>

                    <div className="col-span-3 flex gap-2">
                      <Controller
                        name="monto_inicial_alternativo"
                        control={control}
                        render={({ field }) => (
                          <div className="flex flex-col w-full">
                            <NumericFormat
                              value={field.value ?? ''}
                              disabled={true}
                              onBlur={field.onBlur}
                              thousandSeparator="."
                              decimalSeparator=","
                              allowNegative={false}
                              decimalScale={2}
                              fixedDecimalScale={true}
                              allowLeadingZeros={false}
                              placeholder="Se calcula automáticamente"
                              className="flex-1 p-1 pl-2.5 rounded-md border-2 border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Calculado automáticamente según la cotización del día (1 USD = Gs. {dataCotizacion?.valor_en_guaranies ? Number(dataCotizacion.valor_en_guaranies).toLocaleString('es-PY') : '---'})
                            </p>
                          </div>
                        )}
                      />
                    </div>
                  </div>  

                    {/* FECHA Y HORA DE APERTURA */}
                    <div className="space-y-2">
                      <Label htmlFor="fecha_hora_apertura" className="text-gray-700 font-medium">
                        Fecha y hora de apertura *
                      </Label>
                      <Input
                        disabled
                        id="fecha_hora_apertura"
                        type="datetime-local"
                        className="flex-1 p-1 pl-2.5 rounded-md border-2 border-gray-300 bg-gray-50 text-gray-900 cursor-not-allowed"
                        {...register('fecha_hora_apertura', {
                          required: 'Este campo es requerido'
                        })}
                      />
                      {errors?.fecha_hora_apertura && (
                        <span className='text-red-400 text-sm'>{errors.fecha_hora_apertura.message as string}</span>
                      )}
                    </div>
                    
                      
                    {/*OBSERVACIONES */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="observaciones_apertura" className="text-gray-700 font-medium">
                        Observaciones (opcional)
                      </Label>
                      <Textarea
                        id="observaciones_apertura"
                        autoComplete="observaciones_apertura"
                        placeholder="Observaciones o comentarios sobre la apertura"
                        className="min-h-[100px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        {...register('observaciones_apertura', {
                          required: false,
                          })
                        }
                        />
                    </div>
                  </div>

                    <div className="flex gap-3">
                      {/* {isPendingMutation && <>
                      </>} */}

                      {!dataAEditar &&
                        <Button 
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
                                Crear Apertura
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
                              Guardar Apertura
                            </>}
                      </Button>}

                      <Button
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent cursor-pointer"
                        onClick={handleCancel}
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
                          <CardTitle className="text-blue-900">Lista de Aperturas</CardTitle>
                          <CardDescription className="text-blue-700">
                            Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} aperturas
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 w-4/6">
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


                        <div className="relative w-6/8">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Buscar por nombre o punto de expedición..."
                            value={nombreABuscar}
                            onChange={(e) => setNombreABuscar(e.target.value)}
                            className="pl-10 w-full border-gray-300 focus:border-blue-500"
                          />
                        </div>

                        <Select 
                              value={filtros.estado}
                              onValueChange={(val) => setFiltros({ ...filtros, estado: val })}
                              >
                              <SelectTrigger className="cursor-pointer w-40 border-blue-200 focus:border-blue-500">
                                <SelectValue placeholder="Estado" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="abierta">Abierta</SelectItem>
                                <SelectItem value="cerrada">Cerrada</SelectItem>
                              </SelectContent>
                            </Select> 
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 mt-4 pt-4 border-t border-blue-200 w-full flex-wrap">
                      {/* <div className="flex items-center gap-2">
                        <Label className="text-sm text-gray-600 font-medium">Fecha creación desde:</Label>
                        <Input
                          type="date"
                          value={filtros.fecha_desde}
                          onChange={(e) => setFiltros({...filtros, fecha_desde: e.target.value})}
                          className="w-40 border-blue-200 focus:border-blue-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-gray-600 font-medium">Fecha Creación hasta:</Label>
                        <Input
                          type="date"
                          value={filtros.fecha_hasta}
                          onChange={(e) => setFiltros({...filtros, fecha_hasta: e.target.value})}
                          className="w-40 border-blue-200 focus:border-blue-500"
                        />
                      </div> */}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFiltros({
                            activo: true,   // null = todos, true = solo activos
                            estado: "all",
                            nombre: ""
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
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="flex items-center justify-center w-10 font-semibold text-gray-700">#</TableHead>
                        <TableHead className="font-semibold text-gray-700">Código</TableHead>
                        <TableHead className="font-semibold text-gray-700">Caja</TableHead>
                        <TableHead className="font-semibold text-gray-700">Usuario</TableHead>
                        <TableHead className="font-semibold text-gray-700">Apertura</TableHead>
                        <TableHead className="font-semibold text-gray-700">Monto Inicial</TableHead>
                        {/* <TableHead className="font-semibold text-gray-700">Ingresos</TableHead> */}
                        {/* <TableHead className="font-semibold text-gray-700">Egresos</TableHead>
                        <TableHead className="font-semibold text-gray-700">Balance Final</TableHead> */}
                        {/* <TableHead className="font-semibold text-gray-700">Diferencia</TableHead> */}
                        <TableHead className="font-semibold text-gray-700">Estado</TableHead>
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
                      {!isFetching && dataList.length > 0 &&  siTienePermiso("aperturas", "leer") && dataList.map((data: AperturaListado) => (
                        <TableRow
                          key={data.id}
                          className={`hover:bg-blue-50 transition-colors cursor-pointer`}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900 pl-2">
                                {data?.numero}
                              </div>
                            </div>
                          </TableCell>
       
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900 truncate max-w-xs">
                                {data?.codigo_apertura}
                              </div>
                            
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {/* {data?.ubicacion}  */}
                                {data?.caja_nombre}
                              </div>
                            </div>

                          </TableCell>

                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900 truncate max-w-xs">
                                {/* {data?.establecimiento_nombre} */}
                                {data?.responsable_nombre}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900 truncate max-w-xs">
                                {formatearFecha(data?.fecha_hora_apertura)}
                              </div>
                            </div>
                          </TableCell>
                          
                          {/* <TableCell> */}
                          <TableCell>
                            {/* <Badge className={`text-xs ${data.emite_facturas ? 'bg-green-100 text-green-600 border-green-200': 'bg-gray-100 text-gray-600 border-gray-200'}  `}>
                              {data.emite_facturas ? 'Habilitada' : 'Deshabilitada'}
                            </Badge> */}
                            <div className="font-medium text-gray-900 truncate max-w-xs">
                                Gs. {formatearSeparadorMiles.format(Number(data?.monto_inicial ?? 0))}
                              </div>

                              
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                $ {montoEnDolares(Number(data?.monto_inicial ?? 0))} 
                              </div>
                          </TableCell>

                          {/* </TableCell> */}
                          
                        


                          <TableCell>
                            <Badge className={`text-xs ${data?.esta_abierta ? 'bg-green-100 text-green-600 border-green-200': 'bg-red-100 text-red-600 border-red-200'}  `}>
                              {data?.esta_abierta ? 'Abierta': 'Cerrada'}
                            </Badge>
                          </TableCell>
    

                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="border-gray-200">
                                {siTienePermiso("aperturas", "leer") &&
                                  <DropdownMenuItem className="hover:bg-blue-50 cursor-pointer"
                                    onClick={() => handleVerDetalles(data)}>
                                    <Eye className="h-4 w-4 mr-2 text-blue-500" />
                                    Ver detalles
                                  </DropdownMenuItem>
                                }
                                {/* {siTienePermiso("aperturas", "modificar") &&
                                  <DropdownMenuItem className="hover:bg-emerald-50 cursor-pointer" onClick={() => handleEditar(data)}>
                                    <Edit className="h-4 w-4 mr-2 text-emerald-500" />
                                    Editar
                                  </DropdownMenuItem>
                                }
                                <DropdownMenuSeparator />
                                {siTienePermiso("aperturas", "eliminar") &&
                                  <DropdownMenuItem className={`${data.activo ? 'text-red-600 hover:bg-red-50': 'text-green-600 hover:bg-green-50'} cursor-pointer`}
                                    onClick={() => toggleActivar(data)}>
                                    
                                    {data.activo ? <Trash2 className="h-4 w-4 mr-2" /> : <CheckIcon className="h-4 w-4 mr-2" />}
                                    {data.activo ? 'Desactivar' : 'Activar'}
                                  </DropdownMenuItem>
                                } */}
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
                                onClick={() => {
                                  handleReset();
                                  setFiltros({
                                      activo: true,   // null = todos, true = solo activos
                                      estado: "all",
                                      nombre: ""
                                    });
                                    setNombreABuscar(""); 
                                }}
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
    </>

  )
}
