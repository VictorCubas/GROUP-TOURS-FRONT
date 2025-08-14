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
  X,
  Shield,
  Users,
  Package,
  User,
  Download,
  RefreshCw,
  Eye,
  Calendar,
  AlertCircle,
  Loader2Icon,
  CheckIcon,
  FileText,
  Activity,
  Tag,
} from "lucide-react"

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
import type { NuevoPermisoFormData, Permiso, RespuestaPaginada } from "@/types/permisos"
import { formatearFecha } from "@/helper/formatter"
import { activarDesactivarPermiso, fetchData, fetchResumenPermiso, guardarPermisoEditado, nuevoPermisoFetch } from "@/components/utils/httpPermisos"
import { Controller, useForm } from "react-hook-form"
import { queryClient } from "@/components/utils/http"
import { ToastContext } from "@/context/ToastContext"
import Modal from "@/components/Modal"
import { IoCheckmarkCircleOutline, IoWarningOutline } from "react-icons/io5";
import { fetchDataModulo } from "@/components/utils/httpModulos"

type TypePermission = keyof typeof typeColors;


const typeColors = {
  Lectura: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Creacion: "bg-blue-100 text-blue-700 border-blue-200",
  Exportar: "bg-blue-100 text-blue-700 border-blue-200",
  Modificacion: "bg-amber-100 text-amber-700 border-amber-200",
  Eliminacion: "bg-red-100 text-red-700 border-red-200",
}

// type ModuleKey = keyof typeof moduleColors; // "Usuarios" | "Paquetes" | "Empleados" | "Roles" | "Reservas" | "Reportes"


// const moduleColors = {
//   Usuarios: "bg-emerald-50 text-emerald-600 border-emerald-200",
//   Paquetes: "bg-purple-50 text-purple-600 border-purple-200",
//   Empleados: "bg-orange-50 text-orange-600 border-orange-200",
//   Roles: "bg-yellow-50 text-yellow-600 border-yellow-200",
//   Reservas: "bg-pink-50 text-pink-600 border-pink-200",
//   Reportes: "bg-indigo-50 text-indigo-600 border-indigo-200",
// }

interface StatsCardsProps{
  total_permisos: number;
  total_activos: number;
  total_inactivos: number;
  total_en_uso: number;
  isFetchingResumen: boolean
}

const StatsCards: React.FC<StatsCardsProps> = 
              ({total_permisos, total_activos, total_inactivos, total_en_uso, isFetchingResumen}) => {
  // console.log(dataResumen)
  // let stats: any = [];

  // if(dataResumen){
   const stats = [
      { title: "Total", value: total_permisos, icon: Shield, color: "border-blue-200 bg-blue-50", iconColor: "text-blue-500" },
      {
        title: "Activos",
        value: total_activos,
        icon: Check,
        color: "border-emerald-200 bg-emerald-50",
        iconColor: "text-emerald-500",
      },
      { title: "Inactivos", value: total_inactivos, icon: Eye, color: "border-purple-200 bg-purple-50", iconColor: "text-purple-500" },
      { title: "En Uso", value: total_en_uso, icon: AlertCircle, color: "border-red-200 bg-red-50", iconColor: "text-red-500" },
    ]
  // }

  return (
    <>
      {isFetchingResumen && <div className="h-32 flex items-center justify-center w-full">
        <Loader2Icon className="animate-spin w-10 h-10 text-gray-300"/>
        </div>}
      {!isFetchingResumen &&
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className={`border ${stat.color} hover:shadow-md transition-shadow`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }
    </>
  )
}

export default function PermisosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [nombrePaquetePorBuscar, setNombrePaquetePorBuscar] = useState("")
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [permisoAEditar, setPermisoAEditar] = useState<Permiso>();
  const [permisoADesactivar, setPermisoADesactivar] = useState<Permiso>();
  const [tipoDePermiso, setTipoDePermiso] = useState<'C' | 'R' | 'U' | 'D' | 'E' | 'all'>("all");
  const [onDesactivarPermiso, setOnDesactivarPermiso] = useState(false);
  const [onVerPermiso, setOnVerPermiso] = useState(false);
  const [permisoDetalle, setPermisoDetalle] = useState<Permiso>();
  const {handleShowToast} = use(ToastContext);
  
  // DATOS DEL FORMULARIO 
  const {control, register, handleSubmit, formState: {errors, }, clearErrors, reset} = 
            useForm<NuevoPermisoFormData>({
              mode: "onBlur",
              defaultValues: {
                nombre: "",
                descripcion: "",
                tipo: "",     // valor inicial vacío
                modulo: "",   // valor inicial vacío
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
                                              

  const {data: dataModuloList, isFetching: isFetchingModulo, isError: isErrorModulo} = useQuery({
    queryKey: ['moduos-permisos',], //data cached
    queryFn: () => fetchDataModulo(),
    staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
  });


  console.log('dataModuloList: ', dataModuloList);

  const {data, isFetching, isError} = useQuery({
    queryKey: ['permisos', currentPage, paginacion.pageSize, tipoDePermiso, nombrePaquetePorBuscar, showActiveOnly], //data cached
    queryFn: () => fetchData(currentPage, paginacion.pageSize, tipoDePermiso, nombrePaquetePorBuscar, showActiveOnly),
    staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
  });

  const {data: dataResumen, isFetching: isFetchingResumen} = useQuery({
    queryKey: ['resumen'], //data cached
    queryFn: () => fetchResumenPermiso(),
    staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
  });

  // let filteredPermissions: Permiso[] = [];
  let permisos: Permiso[] = [];

  if(!isFetching && !isError){
    permisos = data.results.map((per: Permiso, index: number) => ({...per, numero: index + 1}));
  }

  // if(!isFetchingResumen && dataResumen && !isErrorResumen){
  //   console.log('dataResumen 1: ', dataResumen);
  //   // setPermisoResumen()
  //   // setResumenPermiso(dataResumen.results)
  // }
  
  // Cálculos de paginación
  const totalItems = permisos?.length
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
  
    // Reset página cuando cambian los filtros
    // useEffect(() => {
    //   setCurrentPage(1);
    // }, [showActiveOnly])

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
      setNombrePaquetePorBuscar(searchTerm);
  }

  const handleReset = () => {
    startTransition(() => {
        setSearchTerm("");
        setTipoDePermiso("all");
        setShowActiveOnly(true);
        setNombrePaquetePorBuscar("")
      });
  }

  const handleActiveOnly = () => {
    setShowActiveOnly(prev => !prev)
    setCurrentPage(1);
  }


  const {mutate, isPending: isPendingMutation} = useMutation({
    mutationFn: nuevoPermisoFetch,
    onSuccess: () => {
        handleShowToast('Se ha creado un nuevo permiso satisfactoriamente', 'success');
        reset({
            nombre: "",
            descripcion: "",
            tipo: "",
            modulo: "",
          });
        setActiveTab('list');
         queryClient.invalidateQueries({
          queryKey: ['permisos'],
          exact: false
        });

        queryClient.invalidateQueries({
          queryKey: ['resumen'],
        });
    },
  });

  const {mutate: mutateGuardarEditado, isPending: isPendingEdit} = useMutation({
    mutationFn: guardarPermisoEditado,
    onSuccess: () => {
        handleShowToast('Se ha guardado el permiso satisfactoriamente', 'success');
        setPermisoAEditar(undefined);
        reset({
            nombre: "",
            descripcion: "",
            tipo: "",
            modulo: "",
          });
        setActiveTab('list');
         queryClient.invalidateQueries({
          queryKey: ['permisos'],
          exact: false
        });
    },
  });

  const {mutate: mutateDesactivar, isPending: isPendingDesactivar} = useMutation({
    mutationFn: activarDesactivarPermiso,
    onSuccess: () => {
        handleShowToast('Se ha desactivado el permiso satisfactoriamente', 'success');
        setOnDesactivarPermiso(false);
        setPermisoADesactivar(undefined);
        //desactivamos todas las queies
        queryClient.invalidateQueries({
          queryKey: ['permisos'],
          exact: false
        });
        queryClient.invalidateQueries({
          queryKey: ['resumen'],
        });
    },
  });


  const handleCancel = () => {
        setPermisoAEditar(undefined);
        reset({
            nombre: "",
            descripcion: "",
            tipo: "",
            modulo: "",
          });
        setActiveTab('list');
  }


  const handleGuardarNuevoPermiso = async (dataForm: any) => {
    // console.log('dataForm: ', dataForm)
    const modulo_id = dataForm.modulo;
    delete dataForm.modulo;
    const payLoad = {...dataForm, activo: true, en_uso: false, modulo_id}

      mutate(payLoad);
  }

  const handleGuardarPermisosEditado = async (dataForm: any) => {
    const modulo_id = dataForm.modulo;

    const dataPermisoEditado = {...permisoAEditar, ...dataForm, modulo_id};
    console.log('dataForm: ', dataForm)
    console.log('dataPermisoEditado: ', dataPermisoEditado);
    delete dataPermisoEditado.numero;
    delete dataPermisoEditado.modulo;

    // const payLoad = {}
    console.log('payload: ', dataPermisoEditado)
    mutateGuardarEditado({...dataPermisoEditado});
  }



  useEffect(() => {
    let tipo: "" | "C" | "R" | "U" | "D" | "E" = "C"

    if((permisoAEditar?.tipo as any) === 'Eliminacion'){
      tipo = 'D';
    }
    else if((permisoAEditar?.tipo as any) === 'Modificacion'){
      tipo = 'U';
    }
    else if((permisoAEditar?.tipo as any) === 'Lectura'){
      tipo = 'R';
    }
    else if((permisoAEditar?.tipo as any) === 'Exportar'){
      tipo = 'E';
    }
    
    if (permisoAEditar) {
      reset({
        nombre: permisoAEditar.nombre,
        descripcion: permisoAEditar.descripcion,
        tipo: tipo,
        modulo: permisoAEditar.modulo.id.toString()
      });
    }
  }, [permisoAEditar, reset]);


  const handleEditar = (permission: Permiso) => {
    setActiveTab('form');
    setPermisoAEditar(permission);
  }

  const handleDesactivar = (permiso: Permiso) => {
    setOnDesactivarPermiso(true);
    setPermisoADesactivar(permiso);
  }

  const handleCloseModal = () => {
    setOnDesactivarPermiso(false);
  }

  const handleConfirmActivo = (activo=true) => {
    mutateDesactivar({ permisoId: permisoADesactivar!.id, activo })
  }

  const handleVerDetalles = (permiso: Permiso) => {
    setOnVerPermiso(true);
    setPermisoDetalle(permiso);
  }

  const handleCloseVerDetalles = () => {
    setOnVerPermiso(false);
    setPermisoDetalle(undefined);
  }

  return (
    <>
       {onVerPermiso && <Modal onClose={handleCloseVerDetalles} claseCss={'modal-detalles'}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Detalles del Permiso</h2>
                  </div>
                </div>
                <button
                  onClick={handleCloseVerDetalles}
                  className="cursor-pointer w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Header Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{permisoDetalle?.nombre}</h3>
                <p className="text-gray-700">{permisoDetalle?.descripcion}</p>
              </div>

              {/* Status and Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <h4 className="font-medium text-gray-900">Tipo</h4>
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border bg-blue-100 text-blue-800 border-blue-200`}>
                    {permisoDetalle?.tipo}
                  </span>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-4 h-4 text-gray-500" />
                    <h4 className="font-medium text-gray-900">Estado</h4>
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${permisoDetalle?.activo ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} border`}>
                    {permisoDetalle?.activo ? 'Activo': 'Inactivo'}
                  </span>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <h4 className="font-medium text-gray-900">En uso</h4>
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${
                    permisoDetalle?.en_uso 
                      ? 'bg-orange-100 text-orange-800 border-orange-200' 
                      : 'bg-gray-100 text-gray-800 border-gray-200'
                  }`}>
                    {permisoDetalle?.en_uso ? 'Asignado' : 'Sin asignar'}
                  </span>
                </div>
              </div>

              {/* Module and Creation Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <h4 className="font-medium text-gray-900">Módulo</h4>
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-indigo-900 text-white`}>
                    {permisoDetalle?.modulo?.nombre}
                  </span>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <h4 className="font-medium text-gray-900">Fecha de Creación</h4>
                  </div>
                  <p className="text-sm text-gray-700">{formatearFecha(permisoDetalle!.fechaCreacion)}</p>
                </div>
              </div>
            
              <div className='modal-actions'>
                    <Button 
                      className={`cursor-pointer bg-blue-500 hover:bg-blue-600 flex justify-center 
                                  items-center shadow-none hover:shadow-none`}
                                  onClick={handleCloseVerDetalles}>
                                    Aceptar
                    </Button>
              </div>
              
            </div>
        </Modal>}

       {onDesactivarPermiso && <Modal onClose={handleCloseModal} claseCss="modal">
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${permisoADesactivar!.activo ? 'bg-red-100 dark:bg-red-900/20': 'bg-green-100 dark:bg-green-900/20'} `}>
                  {permisoADesactivar!.activo && <IoWarningOutline className="h-8 w-8 text-red-600 dark:text-red-400" />}
                  {!permisoADesactivar!.activo && <IoCheckmarkCircleOutline className="h-8 w-8 text-green-600 dark:text-green-400" />}
                   
               </div>
              <h2 className='text-center'>Confirmacion de operación</h2>
             <p className=' text-gray-600 dark:text-gray-400 mt-2 text-justify'>
               ¿Estás seguro de que deseas {permisoADesactivar!.activo ? 'desactivar' : 'activar'} el permiso <b>{permisoADesactivar?.nombre}</b>? 
             </p>

             <div className='modal-actions'>
                   <Button className="hover:bg-transparent cursor-pointer bg-transparent text-gray-700" onClick={handleCloseModal}>Cancelar</Button>
                   <Button 
                    disabled={isPendingDesactivar}
                    className={`cursor-pointer ${permisoADesactivar!.activo ? 'bg-red-500 hover:bg-red-600': 'bg-green-500 hover:bg-green-600'} flex justify-center 
                                 items-center shadow-none hover:shadow-none`}
                                 onClick={() => handleConfirmActivo(!permisoADesactivar!.activo)}>
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
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-3xl font-semibold text-gray-900">Permisos</h1>
              </div>
              <p className="text-gray-600">Gestiona los permisos del sistema de manera eficiente</p>
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
                Nuevo Permiso
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards {...dataResumen} isFetchingResumen={isFetchingResumen}/>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-80 bg-gray-100">
              <TabsTrigger value="list" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white cursor-pointer">
                Lista de Permisos
              </TabsTrigger>
              <TabsTrigger value="form" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white cursor-pointer">
                Crear Permiso
              </TabsTrigger>
            </TabsList>

            {/* Registration Form Tab */}
            <TabsContent value="form">
              <form onSubmit={handleSubmit(!permisoAEditar ? handleGuardarNuevoPermiso: handleGuardarPermisosEditado)}>
                <Card className="border-emerald-200 pt-0">
                  <CardHeader className="bg-emerald-50 border-b border-emerald-200 pt-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                        <Plus className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-emerald-900">Crear Nuevo Permiso</CardTitle>
                        <CardDescription className="text-emerald-700">
                          Complete la información para crear un nuevo permiso
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="nombre" className="text-gray-700 font-medium">
                          Nombre del Permiso *
                        </Label>
                        <Input
                          id="nombre"
                          autoComplete="nombre"
                          placeholder="Nombre del permiso"
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
                        <Label htmlFor="type" className="text-gray-700 font-medium">
                          Tipo *
                        </Label>
                        <Controller
                            name="tipo"
                            control={control}
                            rules={{ required: "Este campo es requerido" }}
                            render={({ field }) => (
                              <Select
                                value={field.value}
                                onValueChange={(value) => {
                                          field.onChange(value)
                                          if (value) {
                                            clearErrors("tipo") // Limpia el error cuando selecciona un valor
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
                                  <SelectItem value="R">
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                                      Lectura
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="C">
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                      Creación
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="U">
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                                      Modificación
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="D">
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                      Eliminación
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="E">
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                                      Exportación
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {errors.tipo && (
                            <p className="text-red-400 text-sm">{errors.tipo.message}</p>
                          )}
                        </div>

                      <div className="space-y-2">
                        <Label htmlFor="form" className="text-gray-700 font-medium">
                          Módulo *
                        </Label>

                        {isFetchingModulo &&
                        <Select>
                          <SelectTrigger className="cursor-pointer border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 w-46 flex">
                            <div className="w-full flex items-center justify-center">
                              <Loader2Icon className="animate-spin w-6 h-6 text-gray-300"/>
                            </div>
                          </SelectTrigger>
                        </Select>}

                        {!isFetchingModulo && 
                          <Controller
                            name="modulo"
                            control={control}
                            rules={{ required: "Este campo es requerido" }}
                            render={({ field }) => (
                              <Select
                                value={field.value}
                                onValueChange={(value) => {
                                          field.onChange(value)
                                          if (value) {
                                            clearErrors("modulo") // Limpia el error cuando selecciona un valor
                                          }
                                        }}
                                onOpenChange={(open) => {
                                    if (!open && !field.value) {
                                      field.onBlur(); 
                                    }
                                  }}>
                                
                                <SelectTrigger className="cursor-pointer border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                                  <SelectValue placeholder="Selecciona el módulo" />
                                </SelectTrigger>
                                <SelectContent>
                                  {dataModuloList.map((modulo: {id:number, nombre: string}) => 
                                          <SelectItem key={modulo.id} value={modulo.id.toString()}>
                                          <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-emerald-500" />
                                            {modulo.nombre}
                                          </div>
                                        </SelectItem>)}
                              
                                  
                                </SelectContent>
                              </Select>
                            )}
                        /> }

                          {errors.modulo && (
                            <p className="text-red-400 text-sm">{errors.modulo.message}</p>
                          )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="descripcion" className="text-gray-700 font-medium">
                          Descripción *
                        </Label>
                        <Textarea
                          id="descripcion"
                          autoComplete="descripcion"
                          placeholder="Describe el permiso"
                          className="min-h-[100px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          {...register('descripcion', {
                          required: true, 
                          validate: {blankSpace: (value) => !!value.trim()},
                          minLength: 15})}
                          />
                          <div>
                            {(errors?.descripcion?.type === 'required' || errors?.descripcion?.type === 'blankSpace') && <span className='text-red-400 text-sm'>Este campo es requerido</span>}
                            {errors?.descripcion?.type === 'minLength' && <span className='text-red-400 text-sm'>El username debe tener minimo 15 caracteres</span>}
                          </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {/* {isPendingMutation && <>
                      </>} */}

                      {!permisoAEditar &&
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
                                Crear Permiso  
                              </>}
                        </Button>
                      }
                      {permisoAEditar &&
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
                              Guardar Permiso  
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
                        <CardTitle className="text-blue-900">Lista de Permisos</CardTitle>
                        <CardDescription className="text-blue-700">
                          Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} permisos
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

                      <Select value={tipoDePermiso} onValueChange={(value) => setTipoDePermiso(value as 'C' | 'R' | 'U' | 'D' | 'E' | 'all')}>
                        <SelectTrigger className="w-40 border-purple-200 focus:border-purple-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="R">Lectura</SelectItem>
                          <SelectItem value="C">Creacion</SelectItem>
                          <SelectItem value="U">Modificación</SelectItem>
                          <SelectItem value="D">Eliminación</SelectItem>
                          <SelectItem value="E">Exportación</SelectItem>
                        </SelectContent>
                      </Select>

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
                        <TableHead className="font-semibold text-gray-700">Tipo</TableHead>
                        <TableHead className="font-semibold text-gray-700">Módulo</TableHead>
                        <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                        <TableHead className="font-semibold text-gray-700">Uso</TableHead>
                        {/* <TableHead className="font-semibold text-gray-700">Prioridad</TableHead> */}
                        <TableHead className="font-semibold text-gray-700">Fecha Creación</TableHead>
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
                      {!isFetching && permisos.length > 0 && permisos.map((permission: Permiso) => (
                        <TableRow
                          key={permission.id}
                          className={`hover:bg-blue-50 transition-colors cursor-pointer`}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900 pl-2">{permission.numero}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{permission.nombre}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{permission.descripcion}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${typeColors[permission.tipo as TypePermission]} border`}>{permission.tipo}</Badge>
                          </TableCell>

                          <TableCell>
                            {/* <Badge className={`${moduleColors[permission.modulo as ModuleKey]} border`}>{permission.modulo}</Badge> */}
                            <Badge className={`bg-purple-50 text-purple-600 border-purple-200 border`}>{permission.modulo.nombre}</Badge>
                          </TableCell>

                          <TableCell>
                            <Badge
                              className={
                                permission.activo
                                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                  : "bg-gray-100 text-gray-700 border-gray-200"
                              }
                            >
                              {permission.activo ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center">
                              {permission.en_uso ? (
                                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                  <Check className="h-4 w-4 text-emerald-600" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                  <X className="h-4 w-4 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatearFecha(permission.fechaCreacion)}
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
                                  onClick={() => handleVerDetalles(permission)}>
                                  <Eye className="h-4 w-4 mr-2 text-blue-500" />
                                  Ver
                                </DropdownMenuItem>
                                <DropdownMenuItem className="hover:bg-emerald-50 cursor-pointer" onClick={() => handleEditar(permission)}>
                                  <Edit className="h-4 w-4 mr-2 text-emerald-500" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className={`${permission.activo ? 'text-red-600 hover:bg-red-50': 'text-green-600 hover:bg-green-50'} cursor-pointer`}
                                  onClick={() => handleDesactivar(permission)}>
                                  
                                  {permission.activo ? <Trash2 className="h-4 w-4 mr-2" /> : <CheckIcon className="h-4 w-4 mr-2" />}
                                  {permission.activo ? 'Desactivar' : 'Activar'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}

                      {!isFetching && permisos.length === 0 && (
                        <TableRow className="">
                          <TableCell className="w-full flex items-center justify-center">
                            <div className="text-center py-12  absolute-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Search className="h-8 w-8 text-gray-400" />
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron permisos</h3>
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
