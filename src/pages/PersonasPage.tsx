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
  User,
  Building,
  X,
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
import type { aEditarDataForm, Persona, RespuestaPaginada } from "@/types/personas"
import { capitalizePrimeraLetra, formatearFecha, getNombreCompleto } from "@/helper/formatter"
import { activarDesactivarData, fetchData, fetchResumen, guardarDataEditado, nuevoDataFetch } from "@/components/utils/httpPersona"
import {Controller, useForm } from "react-hook-form"
import { queryClient } from "@/components/utils/http"
import { ToastContext } from "@/context/ToastContext"
import Modal from "@/components/Modal"
import { IoCheckmarkCircleOutline, IoWarningOutline } from "react-icons/io5";
import ResumenCardsDinamico from "@/components/ResumenCardsDinamico"
import { fetchDataTodo } from "@/components/utils/httpTipoDocumentos"

// type ModuleKey = keyof typeof moduleColors; // "Usuarios" | "Paquetes" | "Empleados" | "Roles" | "Reservas" | "Reportes"


// const moduleColors = {
//   Usuarios: "bg-emerald-50 text-emerald-600 border-emerald-200",
//   Paquetes: "bg-purple-50 text-purple-600 border-purple-200",
//   Empleados: "bg-orange-50 text-orange-600 border-orange-200",
//   Roles: "bg-yellow-50 text-yellow-600 border-yellow-200",
//   Reservas: "bg-pink-50 text-pink-600 border-pink-200",
//   Reportes: "bg-indigo-50 text-indigo-600 border-indigo-200",
// }

const genderColors = {
  M: "bg-blue-100 text-blue-700 border-blue-200",
  F: "bg-pink-100 text-pink-700 border-pink-200",
}

const tipoPersonaColores = {
  fisica: "bg-blue-100 text-blue-700 border-blue-200",
  juridica: "bg-purple-100 text-purple-700 border-purple-200",
}

let dataList: Persona[] = [];

export default function ModulosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [nombreABuscar, setNombreABuscar] = useState("");
  const [buscarPorDocumento, setBuscarPorDocumento] = useState("");
  const [buscarPorTelefono, setBuscarPorTelefono] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [dataAEditar, setDataAEditar] = useState<Persona>();
  const [dataADesactivar, setDataADesactivar] = useState<Persona>();
  const [onDesactivarData, setOnDesactivarData] = useState(false);
  const [onVerDetalles, setOnVerDetalles] = useState(false);
  const [dataDetalle, setDataDetalle] = useState<Persona>();
  const {handleShowToast} = use(ToastContext);
  const [filtros, setFiltros] = useState({
                  activo: true,   // null = todos, true = solo activos
                  tipo: "all",                      // fisica | juridica | all
                  sexo: "all",                      // M | F | all
                  documento: "",
                  telefono: "",
                  fecha_desde: "",
                  fecha_hasta: "",
                  nombre: ""
                });
  
  // DATOS DEL FORMULARIO 
  const {control, register, handleSubmit, formState: {errors, },clearErrors, reset} = 
            useForm<any>({
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
                                              

  const {data: dataTipoDocumentoList, isFetching: isFetchingTipoDocumento,} = useQuery({
      queryKey: ['tipo-documentos-de-personas',], //data cached
      queryFn: () => fetchDataTodo(),
      staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
    });

  const {data, isFetching, isError} = useQuery({
    queryKey: ['personas', currentPage, paginacion.pageSize, filtros], //data cached
    queryFn: () => fetchData(currentPage, paginacion.pageSize, filtros),
    staleTime: 5 * 60 * 1000, //despues de 5min los datos se consideran obsoletos
    enabled: !((filtros.fecha_desde && !filtros.fecha_hasta) || (!filtros.fecha_desde && filtros.fecha_hasta))
  ,
  });

  const {data: dataResumen, isFetching: isFetchingResumen, isError: isErrorResumen} = useQuery({
    queryKey: ['personas-resumen'], //data cached
    queryFn: () => fetchResumen(),
    staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
  });

  // let filteredPermissions: Modulo[] = [];
  

  if(!isFetching && !isError){
    if(data?.results){
      dataList = data.results.map((per: Persona, index: number) => ({...per, numero: index + 1}));
    }
    // else
      // dataList = [];
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

  const handleReset = () => {
    startTransition(() => {
        setSearchTerm("");
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
        reset({
            nombre: "",
            descripcion: "",
          });
        setActiveTab('list');
        queryClient.invalidateQueries({
          queryKey: ['personas'],
          exact: false
        });

        queryClient.invalidateQueries({
          queryKey: ['personas-resumen'],
        });

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
        handleShowToast('Se ha guardado la persona satisfactoriamente', 'success');
        setDataAEditar(undefined);
        reset({
            nombre: "",
            descripcion: "",
          });
        setActiveTab('list');
        queryClient.invalidateQueries({
          queryKey: ['personas'],
          exact: false
        });

        queryClient.invalidateQueries({
          queryKey: ['personas-resumen'],
        });

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

  const {mutate: mutateDesactivar, isPending: isPendingDesactivar} = useMutation({
    mutationFn: activarDesactivarData,
    onSuccess: () => {
        handleShowToast('Se ha desactivado el persona satisfactoriamente', 'success');
        setOnDesactivarData(false);
        setDataADesactivar(undefined);
        //desactivamos todas las queies
        queryClient.invalidateQueries({
          queryKey: ['personas'],
          exact: false
        });
        queryClient.invalidateQueries({
          queryKey: ['personas-resumen'],
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
    console.log('dataForm: ', dataForm)
      mutate({...dataForm, activo: true, en_uso: false});
  }

  const handleGuardarDataEditado = async (dataForm: any) => {
    const dataEditado = {...dataAEditar, ...dataForm};
    delete dataEditado.numero;

    console.log('dataEditado: ', dataEditado);
    mutateGuardarEditado({...dataEditado, ...dataForm});
  }


  /********************************
   * CORREGIR ESTA PARTE
   *******************************/
  /********************************
   * CORREGIR ESTA PARTE
   *******************************/
  useEffect(() => {
    if (dataAEditar) {
      console.log('reset data: ', dataAEditar)
      reset({
        ...dataAEditar,
        tipo_documento: dataAEditar.tipo_documento.id.toString()
      });
    }
  }, [dataAEditar, reset]);


  const handleEditar = (data: Persona) => {
    setActiveTab('form');
    setDataAEditar(data);
  }

  const toggleActivar = (modulo: Persona) => {
    setOnDesactivarData(true);
    setDataADesactivar(modulo);
  }

  const handleCloseModal = () => {
    setOnDesactivarData(false);
  }

  const handleConfirmActivo = (activo=true) => {
    mutateDesactivar({ dataId: dataADesactivar!.id, activo, tipo: dataADesactivar!.tipo })
  }

  const handleVerDetalles = (data: Persona) => {
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
    const handler = setTimeout(() => {
      setFiltros(filtroAnterior => ({...filtroAnterior, documento: buscarPorDocumento}))
    }, 750) // ⏱️ medio segundo de espera

    return () => {
      clearTimeout(handler) // limpia el timeout si se sigue escribiendo
    }
  }, [buscarPorDocumento]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setFiltros(filtroAnterior => ({...filtroAnterior, telefono: buscarPorTelefono}))
    }, 750) // ⏱️ medio segundo de espera

    return () => {
      clearTimeout(handler) // limpia el timeout si se sigue escribiendo
    }
  }, [buscarPorTelefono]);

  return (
    <>
       {onVerDetalles && <Modal onClose={handleCloseVerDetalles} claseCss={'modal-detalles'}>
            <div className=" bg-white rounded-lg shadow-lg p-6">
                {/* Header */}
                <div className="mb-6 border-b pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 capitalize">
                        {dataDetalle?.nombre}
                      </h2>
                      <p className="text-gray-600">Detalles completos de la persona</p>
                    </div>
                  </div>
                </div>

                
                 <div className="p-3 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">INFORMACIÓN PERSONAL</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Nombre completo:</span>
                              <span className="font-medium">
                                {dataDetalle?.nombre} {dataDetalle?.apellido}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Fecha de nacimiento:</span>
                              <span className="font-medium">{formatearFecha(dataDetalle?.fecha_nacimiento ?? '', false)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Edad:</span>
                              <span className="font-medium">{dataDetalle?.edad} años</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Género:</span>
                              <Badge className={`${genderColors[dataDetalle?.sexo ?? 'M']} border`}>
                                {dataDetalle?.sexo === 'F' ? 'Femenino': 'Masculino'}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Nacionalidad:</span>
                              <span className="font-medium">{dataDetalle?.nacionalidad}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">DOCUMENTO</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tipo:</span>
                              <Badge className='border bg-blue-100 text-blue-700 border-blue-200'>
                                {dataDetalle?.tipo_documento.nombre}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Número:</span>
                              <span className="font-medium">{dataDetalle?.documento}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">CONTACTO</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Email:</span>
                              <span className="font-medium">{dataDetalle?.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Teléfono:</span>
                              <span className="font-medium">{dataDetalle?.telefono}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Dirección:</span>
                              <span className="font-medium text-right">{dataDetalle?.direccion}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">ESTADO Y FECHAS</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Estado:</span>
                              <Badge
                                className={
                                  dataDetalle?.activo
                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                    : "bg-gray-100 text-gray-700 border-gray-200"
                                }
                              >
                                {dataDetalle?.activo ? "Activa" : "Inactiva"}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Fecha de registro:</span>
                              <span className="font-medium">{formatearFecha(dataDetalle?.fecha_creacion ?? '')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Última modificación:</span>
                              <span className="font-medium">{formatearFecha(dataDetalle?.fecha_modificacion ?? '')}</span>
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
               ¿Estás seguro de que deseas {dataADesactivar!.activo ? 'desactivar' : 'activar'} los datos de la persona <b>{capitalizePrimeraLetra(dataADesactivar?.nombre ?? '')}</b>? 
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
                   <User className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-3xl font-semibold text-gray-900">Personas</h1>
              </div>
              <p className="text-gray-600">Gestiona los datos de personas del sistema y su estado.</p>
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
                Nueva Persona
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <ResumenCardsDinamico resumen={dataResumen} isFetchingResumen={isFetchingResumen} isErrorResumen={isErrorResumen}/>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-80 bg-gray-100">
              <TabsTrigger value="list" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white cursor-pointer">
                Lista de Personas
              </TabsTrigger>
              <TabsTrigger value="form" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white cursor-pointer">
                Crear Persona
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
                        <CardTitle className="text-emerald-900">Crear Nueva Persona</CardTitle>
                        <CardDescription className="text-emerald-700">
                          Complete la información para crear una nueva persona
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="nombre" className="text-gray-700 font-medium">
                          Nombre *
                        </Label>
                        <Input
                          id="nombre"
                          autoComplete="nombre"
                          placeholder="Nombre de la persona"
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
                        <Label htmlFor="apellido" className="text-gray-700 font-medium">
                          Apellido *
                        </Label>
                        <Input
                          id="apellido"
                          autoComplete="apellido"
                          placeholder="Apellido"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          {...register('apellido', {
                          required: true, 
                          validate: {blankSpace: (value) => !!value.trim()},
                          minLength: 3})}
                        />
                        <div>
                          {(errors?.apellido?.type === 'required' || errors?.apellido?.type === 'blankSpace') && <span className='text-red-400 text-sm'>Este campo es requerido</span>}
                          {errors?.apellido?.type === 'minLength' && <span className='text-red-400 text-sm'>El username debe tener minimo 3 caracteres</span>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 font-medium">
                          Email *
                        </Label>
                        <Input
                          id="email"
                          autoComplete="email"
                          placeholder="correo@gmail.com"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          {...register('email', {
                          required: true, 
                          validate: {blankSpace: (value) => !!value.trim()},
                          minLength: 3})}
                        />
                        <div>
                          {(errors?.email?.type === 'required' || errors?.email?.type === 'blankSpace') && <span className='text-red-400 text-sm'>Este campo es requerido</span>}
                          {errors?.email?.type === 'minLength' && <span className='text-red-400 text-sm'>El email debe tener minimo 3 caracteres</span>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefono" className="text-gray-700 font-medium">
                          Telélfono *
                        </Label>
                        <Input
                          id="telefono"
                          autoComplete="telefono"
                          placeholder="0981123456"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          {...register('telefono', {
                          required: true, 
                          validate: {blankSpace: (value) => !!value.trim()},
                          minLength: 3})}
                        />
                        <div>
                          {(errors?.telefono?.type === 'required' || errors?.telefono?.type === 'blankSpace') && <span className='text-red-400 text-sm'>Este campo es requerido</span>}
                          {errors?.telefono?.type === 'minLength' && <span className='text-red-400 text-sm'>El telefono debe tener minimo 3 caracteres</span>}
                        </div>
                      </div>

                      <div className="space-y-2 mi-select-wrapper">
                        <Label htmlFor="tipo_documento" className="text-gray-700 font-medium">
                          Tipo Documento *
                        </Label>

                        {isFetchingTipoDocumento &&
                        <Select>
                          <SelectTrigger className="cursor-pointer border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 w-46 flex">
                            <div className="w-full flex items-center justify-center">
                              <Loader2Icon className="animate-spin w-6 h-6 text-gray-300"/>
                            </div>
                          </SelectTrigger>
                        </Select>}

                        {!isFetchingTipoDocumento && 
                          <Controller
                            name="tipo_documento"
                            control={control}
                            rules={{ required: "Este campo es requerido" }}
                            render={({ field }) => (
                              <Select
                                value={field.value}
                                onValueChange={(value) => {
                                          field.onChange(value)
                                          if (value) {
                                            clearErrors("tipo_documento") // Limpia el error cuando selecciona un valor
                                          }
                                        }}
                                onOpenChange={(open) => {
                                    if (!open && !field.value) {
                                      field.onBlur(); 
                                    }
                                  }}>
                                
                                <SelectTrigger className="cursor-pointer border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                                  <SelectValue placeholder="Selecciona el tipo de documento" />
                                </SelectTrigger>
                                <SelectContent>
                                  {dataTipoDocumentoList.map((tipo_documento: {id:number, nombre: string}) => 
                                          <SelectItem key={tipo_documento.id} value={tipo_documento.id.toString()}>
                                          <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                            {tipo_documento.nombre}
                                          </div>
                                        </SelectItem>)}
                              
                                  
                                </SelectContent>
                              </Select>
                            )}
                        /> }

                          {errors.tipo_documento && (
                            <p className="text-red-400 text-sm">{errors.tipo_documento.message as string}</p>
                          )}
                      </div>


                        <div className="space-y-2">
                            <Label htmlFor="documento" className="text-gray-700 font-medium">
                              Documento *
                            </Label>
                            <Input
                              id="documento"
                              autoComplete="documento"
                              placeholder="123456"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              {...register('documento', {
                              required: true, 
                              validate: {blankSpace: (value) => !!value.trim()},
                              minLength: 3})}
                            />
                            <div>
                              {(errors?.documento?.type === 'required' || errors?.documento?.type === 'blankSpace') && <span className='text-red-400 text-sm'>Este campo es requerido</span>}
                              {errors?.documento?.type === 'minLength' && <span className='text-red-400 text-sm'>El campo debe tener minimo 3 caracteres</span>}
                            </div>
                        </div>


                        <div className="space-y-2">
                            <Label htmlFor="fecha_nacimiento" className="text-gray-700 font-medium">
                               Fecha de Nacimiento *
                            </Label>
                            <Input
                              id="fecha_nacimiento"
                              type="date"
                              autoComplete="fecha_nacimiento"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              {...register('fecha_nacimiento', {
                              required: true, 
                              validate: {blankSpace: (value) => !!value.trim()},
                              minLength: 3})}
                            />
                            <div>
                              {(errors?.fecha_nacimiento?.type === 'required' || errors?.fecha_nacimiento?.type === 'blankSpace') && <span className='text-red-400 text-sm'>Este campo es requerido</span>}
                              {/* {errors?.documento?.type === 'minLength' && <span className='text-red-400 text-sm'>El campo debe tener minimo 3 caracteres</span>} */}
                            </div>
                        </div>


                        <div className="space-y-2">
                        <Label htmlFor="sexo" className="text-gray-700 font-medium">
                          Genero *
                        </Label>
                        <Controller
                            name="sexo"
                            control={control}
                            rules={{ required: "Este campo es requerido" }}
                            render={({ field }) => (
                              <Select
                                value={field.value}
                                onValueChange={(value) => {
                                          field.onChange(value)
                                          if (value) {
                                            clearErrors("sexo") // Limpia el error cuando selecciona un valor
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
                                  <SelectItem value="M">
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                                      Masculino
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="F">
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                      Femenino
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {errors.sexo && (
                            <p className="text-red-400 text-sm">{errors.sexo.message as string}</p>
                          )}
                        </div>

                        
                        <div className="space-y-2">
                        <Label htmlFor="sexo" className="text-gray-700 font-medium">
                          Tipo Persona *
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
                                            clearErrors("sexo") // Limpia el error cuando selecciona un valor
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
                                  <SelectValue placeholder="Selecciona el tipo de persona" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="fisica">
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                                        Persona Física
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="F">
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                        Persona Jurídica
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {errors.tipo && (
                            <p className="text-red-400 text-sm">{errors.tipo.message as string}</p>
                          )}
                        </div>

                          <div className="space-y-2">
                            <Label htmlFor="nacionalidad" className="text-gray-700 font-medium">
                              Nacionalidad *
                            </Label>
                            <Input
                              id="nacionalidad"
                              autoComplete="nacionalidad"
                              placeholder="Paraguaya"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              {...register('nacionalidad', {
                              required: true, 
                              validate: {blankSpace: (value) => !!value.trim()},
                              minLength: 3})}
                            />
                            <div>
                              {(errors?.nacionalidad?.type === 'required' || errors?.nacionalidad?.type === 'blankSpace') && <span className='text-red-400 text-sm'>Este campo es requerido</span>}
                              {errors?.nacionalidad?.type === 'minLength' && <span className='text-red-400 text-sm'>El campo debe tener minimo 3 caracteres</span>}
                            </div>
                        </div>


                         <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="direccion" className="text-gray-700 font-medium">
                              Direccion *
                            </Label>
                            <Input
                              id="direccion"
                              autoComplete="direccion"
                              placeholder="Calle 123 Capiata"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              {...register('direccion', {
                              required: true, 
                              validate: {blankSpace: (value) => !!value.trim()},
                              minLength: 3})}
                            />
                            <div>
                              {(errors?.direccion?.type === 'required' || errors?.direccion?.type === 'blankSpace') && <span className='text-red-400 text-sm'>Este campo es requerido</span>}
                              {errors?.direccion?.type === 'minLength' && <span className='text-red-400 text-sm'>El campo debe tener minimo 3 caracteres</span>}
                            </div>
                        </div>


                        {/* <div className="space-y-2">
                        <Label htmlFor="fecha_nacimiento" className="text-gray-700 font-medium">
                          Fecha de Nacimiento *
                        </Label>
                        <Input
                          id="fecha_nacimiento"
                          type="date"
                          className="border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                        />
                      </div> */}

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
                  <div className="flex flex-col items-start justify-between">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-blue-900">Lista de Personas</CardTitle>
                          <CardDescription className="text-blue-700">
                            Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} personas
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

                        <Select 
                          value={filtros.tipo}
                          onValueChange={(val) => setFiltros({ ...filtros, tipo: val })}>
                          <SelectTrigger className="cursor-pointer w-40 border-blue-200 focus:border-blue-500">
                            <SelectValue placeholder="Tipo Persona" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="fisica">Física</SelectItem>
                            <SelectItem value="juridica">Jurídica</SelectItem>
                          </SelectContent>
                        </Select> 

                        <Select 
                          value={filtros.sexo}
                          onValueChange={(val) => setFiltros({ ...filtros, sexo: val })}>
                          <SelectTrigger className="cursor-pointer w-40 border-blue-200 focus:border-blue-500">
                            <SelectValue placeholder="Sexo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="M">Masculino</SelectItem>
                            <SelectItem value="F">Femenino</SelectItem>
                          </SelectContent>
                        </Select> 

                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Buscar por nombre..."
                            value={nombreABuscar}
                            onChange={(e) => setNombreABuscar(e.target.value)}
                            className="pl-10 w-64 border-gray-300 focus:border-blue-500"
                          />
                        </div>

                        {/* <Button
                          onClick={handleBuscarPorNombre}
                          variant="outline"
                          size="icon"
                          className="border-gray-300 hover:bg-gray-50 bg-transparent cursor-pointer"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button> */}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-blue-200">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-gray-600 font-medium">Fecha desde:</Label>
                        <Input
                          type="date"
                          value={filtros.fecha_desde}
                          onChange={(e) => setFiltros({...filtros, fecha_desde: e.target.value})}
                          className="w-40 border-blue-200 focus:border-blue-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-gray-600 font-medium">Fecha hasta:</Label>
                        <Input
                          type="date"
                          value={filtros.fecha_hasta}
                          onChange={(e) => setFiltros({...filtros, fecha_hasta: e.target.value})}
                          className="w-40 border-blue-200 focus:border-blue-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        {/* <Label className="text-sm text-gray-600 font-medium">Documento:</Label> */}
                        <Input
                          placeholder="Buscar por documento.."
                          value={buscarPorDocumento}
                            onChange={(e) => setBuscarPorDocumento(e.target.value)}
                          className="w-48 border-indigo-200 focus:border-indigo-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        {/* <Label className="text-sm text-gray-600 font-medium">Teléfono:</Label> */}
                        <Input
                          placeholder="Buscar por teléfono.."
                          value={buscarPorTelefono}
                          onChange={(e) => setBuscarPorTelefono(e.target.value)}
                          className="w-48 border-green-200 focus:border-green-500"
                        />
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFiltros({
                            activo: true,   // null = todos, true = solo activos
                            tipo: "all",                      // fisica | juridica | all
                            sexo: "all",                      // M | F | all
                            documento: "",
                            telefono: "",
                            fecha_desde: "",
                            fecha_hasta: "",
                            nombre: ""
                          });
                          setBuscarPorDocumento("");
                          setBuscarPorTelefono("");
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
                        <TableHead className="font-semibold text-gray-700">Tipo</TableHead>
                        <TableHead className="font-semibold text-gray-700">Información</TableHead>
                        <TableHead className="font-semibold text-gray-700">Contacto</TableHead>
                        <TableHead className="font-semibold text-gray-700">Documento</TableHead>
                        <TableHead className="font-semibold text-gray-700">Edad</TableHead>
                        <TableHead className="font-semibold text-gray-700">Genero</TableHead>
                        <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                        {/* <TableHead className="font-semibold text-gray-700">Uso</TableHead> */}
                        {/* <TableHead className="font-semibold text-gray-700">Prioridad</TableHead> */}
                        <TableHead className="font-semibold text-gray-700">Fecha Registro</TableHead>
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
                      {!isFetching && dataList.length > 0 && dataList.map((data: Persona) => (
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
                            <Badge
                              className={tipoPersonaColores[`${data.tipo}`]}
                            >
                              {data.tipo === 'fisica' ? 
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    Física
                                  </div> :
                                  <div className="flex items-center gap-1">
                                    <Building className="h-3 w-3" />
                                    Jurídica
                                  </div>
                                }
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900 truncate max-w-xs">
                                {capitalizePrimeraLetra(data.tipo === 'fisica' ? getNombreCompleto(data.nombre, data?.apellido) : (data?.razon_social ?? ''))}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{capitalizePrimeraLetra(data.nacionalidad ?? '')}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900 truncate max-w-xs">{data?.email}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{data?.telefono}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <Badge className='bg-blue-100 text-blue-700 border-blue-200'>
                                {data.tipo_documento.nombre}
                              </Badge>
                              <div className="text-sm text-gray-500 mt-1">{data.documento}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900 truncate max-w-xs">
                                {data.tipo === 'fisica' ? `${data?.edad} años` : ''}
                                

                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {data.tipo === 'fisica' ? formatearFecha(data?.fecha_nacimiento ?? '', false) : '-'}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            {data.tipo === 'fisica' ? 
                             <div>
                              <Badge className={`${genderColors[`${data.sexo ?? 'M'}`]}`}>{data.sexo === 'F'? 'Femenino': 'Masculino'}</Badge>
                            </div>: '-'}
                            
                          </TableCell>

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
