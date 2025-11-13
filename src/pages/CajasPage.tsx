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
  Calendar,
  // AlertCircle,
  Loader2Icon,
  CheckIcon,
  // FileText,
  // Activity,
  // Tag,
  // Boxes,
  User,
  X,
  Mail,
  UserCheck,
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
import type { Caja, RespuestaPaginada, } from "@/types/cajas"
import { capitalizePrimeraLetra, formatearFecha, formatearSeparadorMiles } from "@/helper/formatter"
import { activarDesactivarData, fetchData, fetchResumen, guardarDataEditado, nuevoDataFetch, fetchDataRoles } from "@/components/utils/httpCajas"
import { Controller, useForm } from "react-hook-form"
import { queryClient } from "@/components/utils/http"
import { ToastContext } from "@/context/ToastContext"
import Modal from "@/components/Modal"
import { IoCheckmarkCircleOutline, IoWarningOutline } from "react-icons/io5";
import ResumenCardsDinamico from "@/components/ResumenCardsDinamico"
import { GenericSearchSelect } from "@/components/GenericSearchSelect"
import { fetchDataEmpleadosTodos } from "@/components/utils/httpEmpleado"
import { Checkbox } from "@/components/ui/checkbox"
import { useSessionStore } from "@/store/sessionStore"
import { Textarea } from "@/components/ui/textarea"
import { fetchDataPuntoExpedicionTodo } from "@/components/utils/httpFacturacion"
import type { PuntoExpedicion } from "@/types/facturacion"


const usuariosStatusColors = {
  true: "bg-emerald-100 text-emerald-700 border-emerald-200",
  false: "bg-gray-100 text-gray-700 border-gray-200",
}


let dataList: Caja[] = [];

export default function CajasPage() {
  // const [setSearchTerm] = useState("")
  const {siTienePermiso } = useSessionStore();
  const [empleadoNoSeleccionada, setEmpleadoNoSeleccionada] = useState<boolean | undefined>();
  const [newDataPuntoExpedicionList, setNewDataPuntoExpedicionList] = useState<any[]>();
  const [puntoExpedicionSelected, setPuntoExpedicionSelected] = useState<any>();
  const [nombreABuscar, setNombreABuscar] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [dataAEditar, setDataAEditar] = useState<Caja>();
  const [dataADesactivar, setDataADesactivar] = useState<Caja>();
  const [onDesactivarData, setOnDesactivarData] = useState(false);
  const [onVerDetalles, setOnVerDetalles] = useState(false);
  const [dataDetalle, setDataDetalle] = useState<Caja>();
  const {handleShowToast} = use(ToastContext);

  const [filtros, setFiltros] = useState({
                  activo: true,   // null = todos, true = solo activos
                  estado: "all",
                  nombre: ""
                });

  const [onGuardar, setOnGuardar] = useState(false);
  

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
    queryKey: ['cajas', currentPage, paginacion.pageSize, filtros], //data cached
    queryFn: () => fetchData(currentPage, paginacion.pageSize, filtros),
    staleTime: 5 * 60 * 1000, //despues de 5min los datos se consideran obsoletos
    // enabled: !((filtros.fecha_desde && !filtros.fecha_hasta) || (!filtros.fecha_desde && filtros.fecha_hasta))
    // enabled: 
  // ,
  });

  const {data: dataResumen, isFetching: isFetchingResumen, isError: isErrorResumen} = useQuery({
    queryKey: ['cajas-resumen'], //data cached
    queryFn: () => fetchResumen(),
    staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
  });

  const {data: dataPuntoExpedicionList, isFetching: isFetchingPuntoExpedicion,} = useQuery({
        queryKey: ['puntos-expedicion-todos',], //data cached
        queryFn: () => fetchDataPuntoExpedicionTodo(),
        staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
      });
  

    // console.log('tengo mis permisos?: ', siTienePermiso("caja", "crear"))
    // console.log('tengo mis permisos?: ', siTienePermiso("caja", "leer"))
    console.log('tengo mis permisos?: ', siTienePermiso("cajas", "modificar"))
    // console.log('tengo mis permisos?: ', siTienePermiso("caja", "eliminar"))
    // console.log('tengo mis permisos?: ', siTienePermiso("caja", "exportar"))

  // let filteredPermissions: Modulo[] = [];
  

  if(!isFetching && !isError){
    if(data?.results){
      dataList = data.results.map((per: Caja, index: number) => ({...per, numero: index + 1}));
    }
  }

  useEffect(() => {  
    if(dataPuntoExpedicionList){
      if(dataAEditar){
        setNewDataPuntoExpedicionList([...dataPuntoExpedicionList, {id: dataAEditar.punto_expedicion, nombre_completo: dataAEditar.punto_expedicion_nombre}]);
      }
      else{
        setPuntoExpedicionSelected([...dataPuntoExpedicionList])
      }
    }
  }, [dataAEditar, dataPuntoExpedicionList]);
  
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


  const {mutate, isPending: isPendingMutation} = useMutation({
    mutationFn: nuevoDataFetch,
    onSuccess: () => {
        handleShowToast('Se ha creado un nueva persona satisfactoriamente', 'success');

        handleCancel();

        queryClient.invalidateQueries({
          queryKey: ['cajas'],
          exact: false
        });

        queryClient.invalidateQueries({
          queryKey: ['cajas-resumen'],
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
          queryKey: ['cajas'],
          exact: false
        });

        queryClient.invalidateQueries({
          queryKey: ['cajas-resumen'],
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
          queryKey: ['cajas'],
          exact: false
        });
        queryClient.invalidateQueries({
          queryKey: ['cajas-resumen'],
        });
    },
  });


  // DATOS DEL FORMULARIO 
    const {control, register, handleSubmit, watch, formState: {errors, }, clearErrors, reset} = 
              useForm<any>({
                mode: "onBlur",
                defaultValues: {
                  nombre: "",
                  ubicacion: "",
                  descripcion: "",
                  emiteFactura: true
                }
              });


  const handleCancel = () => {
        setDataAEditar(undefined);
        setNewDataPuntoExpedicionList([...dataPuntoExpedicionList]);
        setPuntoExpedicionSelected(undefined);
        setOnDesactivarData(false);
        setDataADesactivar(undefined);
        reset({
          nombre: "",
          ubicacion: "",
          descripcion: "",
          emiteFactura: true,
          punto_expedicion: '',
        });
        setActiveTab('list');

  }


  const handleGuardarNuevaData = async (dataForm: any) => { 
    console.log(dataForm)
    const payload = { 
      ...dataForm,
      activo: true
    }

    delete payload.emiteFactura;

    if(!dataForm.emiteFactura)
      delete payload.punto_expedicion;

    console.log(payload);
    // mutate(payload);
    
  }

  const handleGuardarDataEditado = async (dataForm: any) => {
    console.log('dataForm editar: ', dataForm) 

    const payload = { 
      nombre: dataForm.nombre,
      ubicacion: dataForm.ubicacion,
      descripcion: dataForm.descripcion,
      id: dataAEditar?.id,
      activo: dataAEditar?.activo,
      emite_facturas: dataForm.emiteFactura,
      punto_expedicion: dataForm.punto_expedicion
    }


    console.log('dataAEditar: ', dataAEditar)
    console.log('payload editar: ', payload)

    mutateGuardarEditado(payload);
  }


  useEffect(() => {
    if (dataAEditar && dataPuntoExpedicionList && dataPuntoExpedicionList.length > 0) {
      console.log('reset data para editar: ', dataAEditar)

      // Buscar el punto de expedición correspondiente
      const puntoExpedicion = dataPuntoExpedicionList.find(
        (punto: PuntoExpedicion) => punto.id.toString() === dataAEditar.punto_expedicion.toString()
      );

      console.log('Punto expedición encontrado: ', puntoExpedicion)

      // Establecer el estado del punto seleccionado
      if (puntoExpedicion) {
        setPuntoExpedicionSelected(puntoExpedicion);
      }

      // Resetear el formulario con todos los valores, incluyendo el punto_expedicion
      reset({
        nombre: dataAEditar.nombre,
        ubicacion: dataAEditar.ubicacion,
        descripcion: dataAEditar.descripcion,
        emiteFactura: dataAEditar.emite_facturas,
        punto_expedicion: dataAEditar.punto_expedicion.toString(), // Convertir a string para el selector
      });

      handleDataNoSeleccionada(true);
    }
  }, [dataAEditar, dataPuntoExpedicionList, reset]);


  const handleEditar = (data: Caja) => {
    console.log('data: ', data)
    setDataAEditar(data);
    setActiveTab('form');
    
  }

  const toggleActivar = (modulo: Caja) => {
    setOnDesactivarData(true);
    setDataADesactivar(modulo);
  }

  const handleCloseModal = () => {
    setOnDesactivarData(false);
  }

  const handleConfirmActivo = (activo=true) => {
    mutateDesactivar({ dataId: dataADesactivar!.id, activo, })
  }

  const handleVerDetalles = (data: Caja) => {
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

  const handleDataNoSeleccionada = (value: boolean | undefined) => {
    setEmpleadoNoSeleccionada(value);
  }

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


  const emiteFactura = watch('emiteFactura');


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
                              {dataDetalle?.nombre}
                            </h2>
                            <p className="text-gray-600">Detalles completos de la caja</p>
                          </div>
                        </div>
                      </div>


                        <div className="space-y-6">
                          {/* Información básica */}
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Número de Caja</Label>
                            <p className="mt-1 text-gray-900 font-semibold">{dataDetalle?.numero_caja}</p>
                          </div>

                          {/* Estado y configuración */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Estado Actual</Label>
                              <div className="mt-1">
                                <Badge
                                  className={dataDetalle?.estado_actual === 'abierta'
                                    ? 'bg-green-100 text-green-700 border-green-200'
                                    : 'bg-gray-100 text-gray-700 border-gray-200'}
                                >
                                  {dataDetalle?.estado_actual === 'abierta' ? 'Abierta' : 'Cerrada'}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Estado</Label>
                              <div className="mt-1">
                                <Badge
                                  className={usuariosStatusColors[dataDetalle?.activo.toString() as keyof typeof usuariosStatusColors]}
                                >
                                  {dataDetalle?.activo ? "Activo" : "Inactivo"}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Punto de expedición */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Punto de Expedición</Label>
                              <p className="mt-1 text-gray-900">{dataDetalle?.punto_expedicion_nombre}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Emite Facturas</Label>
                              <div className="mt-1">
                                <Badge className={dataDetalle?.emite_facturas
                                  ? 'bg-green-100 text-green-700 border-green-200'
                                  : 'bg-red-100 text-red-700 border-red-200'}>
                                  {dataDetalle?.emite_facturas ? 'Sí' : 'No'}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Saldos */}
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <Label className="text-sm font-medium text-gray-700 mb-3 block">Información de Saldos</Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-500">Saldo Actual (Gs.)</Label>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                  {dataDetalle?.saldo_actual?.toLocaleString() ?? '0'}
                                </p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-500">
                                  Saldo Alternativo ({dataDetalle?.moneda_alternativa})
                                </Label>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                  {dataDetalle?.saldo_actual_alternativo !== undefined
                                    ? Number(dataDetalle.saldo_actual_alternativo).toFixed(2)
                                    : '0.00'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Ubicación y descripción */}
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Ubicación</Label>
                            <p className="mt-1 text-gray-900">{dataDetalle?.ubicacion || 'No especificada'}</p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-500">Descripción</Label>
                            <p className="mt-1 text-gray-900">{dataDetalle?.descripcion || 'Sin descripción'}</p>
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
                      ¿Estás seguro de que deseas {dataADesactivar!.activo ? 'desactivar' : 'activar'} al caja con nombre
                      <b>
                          {' ' + capitalizePrimeraLetra((dataADesactivar?.nombre?? ''))}
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
                <h1 className="text-3xl font-semibold text-gray-900">Cajas</h1>
              </div>
              <p className="text-gray-600">Gestiona los datos de los cajas del sistema y su estado.</p>
            </div>
            <div className="flex gap-3">
              {siTienePermiso("cajas", "exportar") && 
                  <Button
                    variant="outline"
                    className="border-emerald-200 text-emerald-700 cursor-pointer hover:bg-emerald-50 bg-transparent"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
              }

              {siTienePermiso("cajas", "crear") && (
                <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer"
                  onClick={() => setActiveTab('form')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Caja
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
                Lista de Caja
              </TabsTrigger>
              <TabsTrigger disabled={!siTienePermiso("cajas", "crear")} 
                  title={siTienePermiso("cajas", "crear") ? 'Crear Caja' : 'No tienes los permisos para crear'}
                  value="form" 
                  className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white cursor-pointer">
                {dataAEditar ?  'Editar Caja' : 'Crear Caja'}
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
                        <CardTitle className="text-emerald-900">Crear Nueva Caja</CardTitle>
                        <CardDescription className="text-emerald-700">
                          Complete la información para crear una nueva caja
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="nombre" className="text-gray-700 font-medium">
                          Nombre de la caja *
                        </Label>
                        <Input
                          id="nombre"
                          autoComplete="nombre"
                          placeholder="Nombre de la caja"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          {...register('nombre', {
                          required: true, 
                          validate: {blankSpace: (value) => !!value.trim()},
                          minLength: 3})}
                        />
                        <div>
                          {(errors?.nombre?.type === 'required' || errors?.nombre?.type === 'blankSpace') && <span className='text-red-400 text-sm'>Este campo es requerido</span>}
                          {errors?.nombre?.type === 'minLength' && <span className='text-red-400 text-sm'>El username debe tener minimo 3 caracteres</span>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ubicacion" className="text-gray-700 font-medium">
                          Ubicación de la caja *
                        </Label>
                        <Input
                          id="ubicacion"
                          autoComplete="ubicacion"
                          placeholder="Ubicación de la caja"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          {...register('ubicacion', {
                            required: true, 
                            validate: {blankSpace: (value) => !!value.trim()},
                            minLength: 3})}
                        />
                        <div>
                          {(errors?.ubicacion?.type === 'required' || errors?.ubicacion?.type === 'blankSpace') && <span className='text-red-400 text-sm'>Este campo es requerido</span>}
                          {errors?.ubicacion?.type === 'minLength' && <span className='text-red-400 text-sm'>La ubicación debe tener minimo 3 caracteres</span>}
                        </div>
                      </div>
                      
                        {/* EMITE FACTURA */}
                      <div className="space-y-2">
                        <Controller
                          name="emiteFactura"
                          control={control}
                          defaultValue={false}
                          render={({ field }) => (
                            <div className="flex flex-col items-start gap-3 cursor-pointer mt-2">
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  disabled={!!dataAEditar}
                                  id="emiteFactura"
                                  checked={field.value}
                                  onCheckedChange={(checked) => field.onChange(!!checked)}
                                  className="cursor-pointer border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 data-[state=checked]:text-white"
                                />
                                <Label htmlFor="emiteFactura" className="cursor-pointer">Emite Factura Electrónica</Label>
                              </div>
                              <p className="text-gray-600 text-sm">Si la caja emite facturas, debe tener un punto de expedición asociado.</p>
                            </div>

                          )}
                        />

                      </div>

                       {/* PUNTO DE EXPEDICION */}
                      <div className="space-y-2">
                        <Label htmlFor="punto_expedicion" className="text-gray-700 font-medium">
                          Punto de Expedición {emiteFactura && '*'}
                        </Label>

                        {isFetchingPuntoExpedicion && (
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

                        {!isFetchingPuntoExpedicion &&
                          <Controller
                            name="punto_expedicion"
                            control={control}
                            rules={{
                              required: emiteFactura ? "Este campo es requerido cuando la caja emite facturas" : false
                            }}
                            render={({ field }) => (
                              <div className="w-full min-w-0 select-container"> {/* Contenedor para controlar el layout */}
                                <Select
                                  disabled={!!dataAEditar || !emiteFactura}
                                  value={field.value}
                                  onValueChange={(value) => {
                                    field.onChange(value)
                                    if (value) {
                                      clearErrors("punto_expedicion")
                                    }

                                    console.log('value: ', value);
                                    const puntoExpediccion = dataPuntoExpedicionList.filter((doc: PuntoExpedicion) => doc.id.toString() === value)
                                    console.log('tipo_paquete 1: ', puntoExpediccion[0])
                                    setPuntoExpedicionSelected(puntoExpediccion[0]);
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
                                    {dataPuntoExpedicionList.map((data: PuntoExpedicion) => 
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
                                              {data.establecimiento.nombre}
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

                        {errors.punto_expedicion && (
                          <p className="text-red-400 text-sm">{errors.punto_expedicion.message as string}</p>
                        )}
                        {!emiteFactura && (
                          <p className="text-gray-500 text-sm flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            Este campo solo es necesario cuando la caja emite facturas.
                          </p>
                        )}
                    </div>
                      
                    {/* DESCRIPCION */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="descripcion" className="text-gray-700 font-medium">
                        Descripción *
                      </Label>
                      <Textarea
                        id="descripcion"
                        autoComplete="descripcion"
                        placeholder="Describe de la caja"
                        className="min-h-[100px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        {...register('descripcion', {
                        required: true, 
                        validate: {blankSpace: (value) => !!value.trim()},
                        minLength: 15})}
                        />
                        <div>
                          {(errors?.descripcion?.type === 'required' || errors?.descripcion?.type === 'blankSpace') && <span className='text-red-400 text-sm'>Este campo es requerido</span>}
                          {errors?.descripcion?.type === 'minLength' && <span className='text-red-400 text-sm'>La descripcion debe tener minimo 15 caracteres</span>}
                        </div>
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
                                Crear Caja
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
                              Guardar Caja  
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
                          <CardTitle className="text-blue-900">Lista de Cajas</CardTitle>
                          <CardDescription className="text-blue-700">
                            Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} cajas
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
                        <TableHead className="font-semibold text-gray-700">Información</TableHead>
                        <TableHead className="font-semibold text-gray-700">Ubicación</TableHead>
                        <TableHead className="font-semibold text-gray-700">Punto Expedicion</TableHead>
                        <TableHead className="font-semibold text-gray-700">Facturación</TableHead>
                        <TableHead className="font-semibold text-gray-700">Saldo actual</TableHead>
                        <TableHead className="font-semibold text-gray-700">Estado actual</TableHead>
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
                      {!isFetching && dataList.length > 0 &&  siTienePermiso("cajas", "leer") && dataList.map((data: Caja) => (
                        <TableRow
                          key={data.id}
                          className={`hover:bg-blue-50 transition-colors cursor-pointer`}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900 pl-2">{
                                data?.numero}
                              </div>
                            </div>
                          </TableCell>
       
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900 truncate max-w-xs">
                                {data?.nombre}
                              </div>

                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {data?.numero_caja}
                              </div>
                            
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {data?.ubicacion} 
                                </div>
                            </div>

                          </TableCell>

                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900 truncate max-w-xs">
                                {data?.punto_expedicion_nombre}
                                </div>
                              {/* <div className="text-sm text-gray-500 truncate max-w-xs">
                                Punto {data?.punto_expedicion}
                                </div> */}
                            </div>
                          </TableCell>
                          
                          

                          
                          {/* <TableCell> */}
                          <TableCell>
                            <Badge className={`text-xs ${data.emite_facturas ? 'bg-green-100 text-green-600 border-green-200': 'bg-gray-100 text-gray-600 border-gray-200'}  `}>
                              {data.emite_facturas ? 'Habilitada' : 'Deshabilitada'}
                            </Badge>
                          </TableCell>

                          {/* </TableCell> */}
                          
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900 truncate max-w-xs">
                                {data?.moneda_alternativa === 'USD' ? 'Gs.' : '$'} {formatearSeparadorMiles.format(Number(data?.saldo_actual ?? 0))}
                              </div>

                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {data?.moneda_alternativa} {data?.saldo_actual_alternativo}
                                </div>
                            </div>

                          </TableCell>


                          <TableCell>
                            <Badge className={`text-xs ${data?.estado_actual === 'abierta' ? 'bg-green-100 text-green-600 border-green-200': data?.estado_actual === 'cerrada'? 'bg-red-100 text-red-600 border-red-200': 'bg-gray-100 text-gray-600 border-gray-200'}  `}>
                              {capitalizePrimeraLetra(data?.estado_actual)}
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
                                {siTienePermiso("cajas", "leer") &&
                                  <DropdownMenuItem className="hover:bg-blue-50 cursor-pointer"
                                    onClick={() => handleVerDetalles(data)}>
                                    <Eye className="h-4 w-4 mr-2 text-blue-500" />
                                    Ver detalles
                                  </DropdownMenuItem>
                                }
                                {siTienePermiso("cajas", "modificar") &&
                                  <DropdownMenuItem className="hover:bg-emerald-50 cursor-pointer" onClick={() => handleEditar(data)}>
                                    <Edit className="h-4 w-4 mr-2 text-emerald-500" />
                                    Editar
                                  </DropdownMenuItem>
                                }
                                <DropdownMenuSeparator />
                                {siTienePermiso("cajas", "eliminar") &&
                                  <DropdownMenuItem className={`${data.activo ? 'text-red-600 hover:bg-red-50': 'text-green-600 hover:bg-green-50'} cursor-pointer`}
                                    onClick={() => toggleActivar(data)}>
                                    
                                    {data.activo ? <Trash2 className="h-4 w-4 mr-2" /> : <CheckIcon className="h-4 w-4 mr-2" />}
                                    {data.activo ? 'Desactivar' : 'Activar'}
                                  </DropdownMenuItem>
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
