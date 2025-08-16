/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  RefreshCw,
  Eye,
  Calendar,
  // AlertCircle,
  Loader2Icon,
  CheckIcon,
  // FileText,
  // Activity,
  // Tag,
  Boxes,
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
import { Textarea } from "@/components/ui/textarea"
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
import { capitalizePrimeraLetra, formatearFecha } from "@/helper/formatter"
import { activarDesactivarData, fetchData, fetchResumen, guardarDataEditado, nuevoPermisoFetch } from "@/components/utils/httpTipoDocumentos"
import {useForm } from "react-hook-form"
import { queryClient } from "@/components/utils/http"
import { ToastContext } from "@/context/ToastContext"
import Modal from "@/components/Modal"
import { IoCheckmarkCircleOutline, IoDocumentSharp, IoWarningOutline } from "react-icons/io5";
import ResumenCards from "@/components/ResumenCards"
import type { aEditarDataForm, RespuestaPaginada, TipoDocumento } from "@/types/tipoDocumentos"

// type ModuleKey = keyof typeof moduleColors; // "Usuarios" | "Paquetes" | "Empleados" | "Roles" | "Reservas" | "Reportes"


// const moduleColors = {
//   Usuarios: "bg-emerald-50 text-emerald-600 border-emerald-200",
//   Paquetes: "bg-purple-50 text-purple-600 border-purple-200",
//   Empleados: "bg-orange-50 text-orange-600 border-orange-200",
//   Roles: "bg-yellow-50 text-yellow-600 border-yellow-200",
//   Reservas: "bg-pink-50 text-pink-600 border-pink-200",
//   Reportes: "bg-indigo-50 text-indigo-600 border-indigo-200",
// }

export default function ModulosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [nombreABuscar, setNombreABuscar] = useState("")
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [dataAEditar, setDataAEditar] = useState<TipoDocumento>();
  const [dataADesactivar, setDataADesactivar] = useState<TipoDocumento>();
  const [onDesactivarData, setOnDesactivarData] = useState(false);
  const [onVerData, setOnVerData] = useState(false);
  const [dataDetalle, setDataDetalle] = useState<TipoDocumento>();
  const [textActivarDesactivar, setTextActivarDesactivar] = useState('');
  const {handleShowToast} = use(ToastContext);
  
  // DATOS DEL FORMULARIO 
  const {register, handleSubmit, formState: {errors, }, reset} = 
            useForm<aEditarDataForm>({
              mode: "onBlur",
              defaultValues: {
                nombre: "",
                descripcion: "",
              }
            });
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
                                              

  const {data, isFetching, isError} = useQuery({
    queryKey: ['tipo-documentos', currentPage, paginacion.pageSize, nombreABuscar, showActiveOnly], //data cached
    queryFn: () => fetchData(currentPage, paginacion.pageSize, nombreABuscar, showActiveOnly),
    staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
  });

  const {data: dataResumen, isFetching: isFetchingResumen, isError: isErrorResumen} = useQuery({
    queryKey: ['tipo-documentos-resumen'], //data cached
    queryFn: () => fetchResumen(),
    staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
  });

  // let filteredPermissions: Modulo[] = [];
  let dataList: TipoDocumento[] = [];

  if(!isFetching && !isError){
    dataList = data.results.map((per: TipoDocumento, index: number) => ({...per, numero: index + 1}));
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


  const handleBuscarPorNombre = () => {
      setNombreABuscar(searchTerm);
  }

  const handleReset = () => {
    startTransition(() => {
        setSearchTerm("");
        setShowActiveOnly(true);
        setNombreABuscar("")
      });
  }

  const handleActiveOnly = () => {
    setShowActiveOnly(prev => !prev)
    setCurrentPage(1);
  }


  const {mutate, isPending: isPendingMutation} = useMutation({
    mutationFn: nuevoPermisoFetch,
    onSuccess: () => {
        handleShowToast('Se ha creado un nuevo tipo de documento satisfactoriamente', 'success');
        reset({
            nombre: "",
            descripcion: "",
          });
        setActiveTab('list');
        
         queryClient.invalidateQueries({
          queryKey: ['tipo-documentos'],
          exact: false
        });

        queryClient.invalidateQueries({
          queryKey: ['tipo-documentos-resumen'],
        });

        queryClient.invalidateQueries({
          queryKey: ['personas'],
          exact: false
        });

        queryClient.invalidateQueries({
          queryKey: ['tipo-documentos-de-personas'],
          exact: false
        });
    },
  });

  const {mutate: mutateGuardarEditado, isPending: isPendingEdit} = useMutation({
    mutationFn: guardarDataEditado,
    onSuccess: () => {
        handleShowToast('Se ha guardado el tipo de documento satisfactoriamente', 'success');
        setDataAEditar(undefined);
        reset({
            nombre: "",
            descripcion: "",
          });
        setActiveTab('list');
         queryClient.invalidateQueries({
          queryKey: ['tipo-documentos'],
          exact: false
        });

        queryClient.invalidateQueries({
          queryKey: ['tipo-documentos-resumen'],
        });

        queryClient.invalidateQueries({
          queryKey: ['personas'],
          exact: false
        });

        queryClient.invalidateQueries({
          queryKey: ['tipo-documentos-de-personas'],
          exact: false
        });
    },
  });

  const {mutate: mutateDesactivar, isPending: isPendingDesactivar} = useMutation({
    mutationFn: activarDesactivarData,
    onSuccess: () => {
        handleShowToast(`Se ha ${textActivarDesactivar} el tipo de documentos satisfactoriamente`, 'success');
        setOnDesactivarData(false);
        setDataADesactivar(undefined);
        setTextActivarDesactivar('');
        //desactivamos todas las queies
        queryClient.invalidateQueries({
          queryKey: ['tipo-documentos'],
          exact: false
        });

        queryClient.invalidateQueries({
          queryKey: ['tipo-documentos-resumen'],
        });

        queryClient.invalidateQueries({
          queryKey: ['personas'],
          exact: false
        });

        queryClient.invalidateQueries({
          queryKey: ['tipo-documentos-de-personas'],
          exact: false
        });
    },
  });


  const handleCancel = () => {
        setDataAEditar(undefined);
        reset({
            nombre: "",
            descripcion: "",
          });
        setActiveTab('list');
  }


  const handleGuardarNuevaData = async (dataForm: any) => {
      mutate({...dataForm, activo: true, en_uso: false});
  }

  const handleGuardarDataEditado = async (dataForm: any) => {
    const dataEditado = {...dataAEditar, ...dataForm};
    delete dataEditado.numero;
    mutateGuardarEditado({...dataEditado, ...dataForm});
  }



  useEffect(() => {
    if (dataAEditar) {
      reset({
        nombre: dataAEditar.nombre,
        descripcion: dataAEditar.descripcion,
      });
    }
  }, [dataAEditar, reset]);


  const handleEditar = (data: TipoDocumento) => {
    setActiveTab('form');
    setDataAEditar(data);
  }

  const toggleActivar = (modulo: TipoDocumento) => {
    setOnDesactivarData(true);
    setDataADesactivar(modulo);
  }

  const handleCloseModal = () => {
    setOnDesactivarData(false);
  }

  const handleConfirmActivo = (activo=true) => {
    setTextActivarDesactivar(activo ? 'activado': 'desactivado');
    mutateDesactivar({ dataId: dataADesactivar!.id, activo })
  }

  const handleVerDetalles = (data: TipoDocumento) => {
    setDataDetalle(data);
    setOnVerData(true);
  }

  const handleCloseVerDetalles = () => {
    setOnVerData(false);
    setDataDetalle(undefined);
  }

  return (
    <>
       {onVerData && <Modal onClose={handleCloseVerDetalles} claseCss={'modal-detalles'}>
            <div className=" bg-white rounded-lg shadow-lg p-6">
                {/* Header */}
                <div className="mb-6 border-b pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <IoDocumentSharp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 capitalize">
                        {dataDetalle?.nombre}
                      </h2>
                      <p className="text-gray-600">Detalles completos del tipo de documento</p>
                    </div>
                  </div>
                </div>

                
                  <div className="space-y-6">
                    {/* Estado */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-gray-700">Estado:</div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                            dataDetalle?.activo
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-gray-100 text-gray-600 border-gray-300"
                          }`}
                        >
                          {dataDetalle?.activo ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </div>

                    {/* Descripción */}
                    <div className="space-y-3">
                      <label className="text-base font-semibold text-gray-900">Descripción</label>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-gray-700 leading-relaxed">{dataDetalle?.descripcion}</p>
                      </div>
                    </div>

                    {/* Fechas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">Fecha de Creación</label>
                        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <Calendar className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm text-gray-700">
                            {formatearFecha(dataDetalle?.fecha_creacion ?? '')}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">Última Modificación</label>
                        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <Calendar className="h-4 w-4 text-orange-600" />
                          <span className="text-sm text-gray-700">
                            {formatearFecha(dataDetalle?.fecha_modificacion ?? '')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Información del Módulo */}
                    <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <Boxes className="h-4 w-4 text-white" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-cyan-900">Información del Módulo</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Nombre:</span>
                              <span className="ml-2 font-medium text-gray-900 capitalize">
                                {dataDetalle?.nombre}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Estado:</span>
                              <span
                                className={`ml-2 font-medium ${
                                  dataDetalle?.activo ? "text-emerald-600" : "text-gray-600"
                                }`}
                              >
                                {dataDetalle?.activo ? "Activo" : "Inactivo"}
                              </span>
                            </div>
                          </div>
                        </div>
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
                    {/* <button
                      onClick={() => {}}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Editar Módulo
                    </button> */}
                </div>
              </div>

        </Modal>}

       {onDesactivarData && <Modal onClose={handleCloseModal} claseCss="modal">
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${dataADesactivar!.activo ? 'bg-red-100 dark:bg-red-900/20': 'bg-green-100 dark:bg-green-900/20'} `}>
                  {dataADesactivar!.activo && <IoWarningOutline className="h-8 w-8 text-red-600 dark:text-red-400" />}
                  {!dataADesactivar!.activo && <IoCheckmarkCircleOutline className="h-8 w-8 text-green-600 dark:text-green-400" />}
                   
               </div>
              <h2 className='text-center'>Confirmacion de operación</h2>
             <p className=' text-gray-600 dark:text-gray-400 mt-2 text-justify'>
               ¿Estás seguro de que deseas {dataADesactivar!.activo ? 'desactivar' : 'activar'} el tipo de documento <b>{capitalizePrimeraLetra(dataADesactivar?.nombre ?? '')}</b>? 
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
        </Modal>}

      <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                   <IoDocumentSharp className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-3xl font-semibold text-gray-900">Tipo Documentos</h1>
              </div>
              <p className="text-gray-600">Gestiona los tipos de documentos del sistema y sus estados.</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-emerald-200 text-emerald-700 cursor-pointer hover:bg-emerald-50 bg-transparent"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer"
                onClick={() => setActiveTab('form')}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Tipo Documento
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <ResumenCards {...dataResumen} isFetchingResumen={isFetchingResumen} isErrorResumen={isErrorResumen}/>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-fit bg-gray-100">
              <TabsTrigger value="list" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white cursor-pointer">
                Lista de Tipo Documentos
              </TabsTrigger>
              <TabsTrigger value="form" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white cursor-pointer">
                Crear Modulo
              </TabsTrigger>
            </TabsList>

            {/* Registration Form Tab */}
            <TabsContent value="form">
              <form onSubmit={handleSubmit(!dataAEditar ? handleGuardarNuevaData: handleGuardarDataEditado)}>
                <Card className="border-emerald-200 pt-0">
                  <CardHeader className="bg-emerald-50 border-b border-emerald-200 pt-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                        <Plus className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-emerald-900">Crear Nuevo Modulo</CardTitle>
                        <CardDescription className="text-emerald-700">
                          Complete la información para crear un nuevo tipo de documento
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="nombre" className="text-gray-700 font-medium">
                          Nombre del Modulo *
                        </Label>
                        <Input
                          id="nombre"
                          autoComplete="nombre"
                          placeholder="Nombre del modulo"
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

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="descripcion" className="text-gray-700 font-medium">
                          Descripción *
                        </Label>
                        <Textarea
                          id="descripcion"
                          autoComplete="descripcion"
                          placeholder="Describe el modulo y su funcionalidad"
                          className="min-h-[100px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          {...register('descripcion', {
                          required: true, 
                          validate: {blankSpace: (value) => !!value.trim()},
                          minLength: 5})}
                          />
                          <div>
                            {(errors?.descripcion?.type === 'required' || errors?.descripcion?.type === 'blankSpace') && <span className='text-red-400 text-sm'>Este campo es requerido</span>}
                            {errors?.descripcion?.type === 'minLength' && <span className='text-red-400 text-sm'>El username debe tener minimo 5 caracteres</span>}
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
                                Crear Modulo  
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
                              Guardar Modulo  
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
                  <div className="flex items-center justify-between ">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-blue-900">Lista de Tipo Documentos</CardTitle>
                        <CardDescription className="text-blue-700">
                          Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} tipos de documentos
                        </CardDescription>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
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

                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64 border-gray-300 focus:border-blue-500"
                        />
                      </div>

                      <Button
                        onClick={handleBuscarPorNombre}
                        variant="outline"
                        size="icon"
                        className="border-gray-300 hover:bg-gray-50 bg-transparent cursor-pointer"
                      >
                        <RefreshCw className="h-4 w-4" />
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
                        <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                        {/* <TableHead className="font-semibold text-gray-700">Uso</TableHead> */}
                        {/* <TableHead className="font-semibold text-gray-700">Prioridad</TableHead> */}
                        <TableHead className="font-semibold text-gray-700">Fecha Creación</TableHead>
                        <TableHead className="font-semibold text-gray-700">Fecha Modificación</TableHead>
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
                      {!isFetching && dataList.length > 0 && dataList.map((data: TipoDocumento) => (
                        <TableRow
                          key={data.id}
                          className={`hover:bg-blue-50 transition-colors cursor-pointer`}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900 pl-2">{data.numero}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{capitalizePrimeraLetra(data.nombre)}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{data.descripcion}</div>
                            </div>
                          </TableCell>
                          {/* <TableCell>
                            <Badge className={`${typeColors[data.tipo as TypePermission]} border`}>{data.tipo}</Badge>
                          </TableCell> */}

                          {/* <TableCell>
                            <Badge className={`bg-purple-50 text-purple-600 border-purple-200 border`}>{data.modulo}</Badge>
                          </TableCell> */}

                          <TableCell>
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
                          {/* <TableCell>
                            <div className="flex items-center justify-center">
                              {data.en_uso ? (
                                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                  <Check className="h-4 w-4 text-emerald-600" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                  <X className="h-4 w-4 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </TableCell> */}
                          
                          <TableCell>
                            <div className="text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatearFecha(data.fecha_creacion)}
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatearFecha(data.fecha_modificacion)}
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
                                <DropdownMenuItem className="hover:bg-blue-50 cursor-pointer"
                                  onClick={() => handleVerDetalles(data)}>
                                  <Eye className="h-4 w-4 mr-2 text-blue-500" />
                                  Ver detalles
                                </DropdownMenuItem>
                                <DropdownMenuItem className="hover:bg-emerald-50 cursor-pointer" onClick={() => handleEditar(data)}>
                                  <Edit className="h-4 w-4 mr-2 text-emerald-500" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className={`${data.activo ? 'text-red-600 hover:bg-red-50': 'text-green-600 hover:bg-green-50'} cursor-pointer`}
                                  onClick={() => toggleActivar(data)}>
                                  
                                  {data.activo ? <Trash2 className="h-4 w-4 mr-2" /> : <CheckIcon className="h-4 w-4 mr-2" />}
                                  {data.activo ? 'Desactivar' : 'Activar'}
                                </DropdownMenuItem>
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
