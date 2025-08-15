/* eslint-disable no-constant-condition */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect, use, startTransition } from "react"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Check,
  X,
  Users,
  Download,
  RefreshCw,
  Eye,
  Calendar,
  UserCheck,
  Loader2Icon,
  CheckIcon,
  Boxes,
  Shield,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleLeft, FaAngleRight } from "react-icons/fa"
import { useMutation, useQuery } from "@tanstack/react-query"
import { activarDesactivarData, fetchData, fetchDataPermisos, fetchResumen, guardarDataEditado, nuevoRolFetch } from "@/components/utils/httpRoles"
import ResumenCards from "@/components/ResumenCards"
import type { Rol, RolPaginatedResponse } from "@/types/roles"
import { ToastContext } from "@/context/ToastContext"
import { useForm } from "react-hook-form"
import { capitalizePrimeraLetra, formatearFecha } from "@/helper/formatter"
import { queryClient } from "@/components/utils/http"
import Modal from "@/components/Modal"
import { IoCheckmarkCircleOutline, IoWarningOutline } from "react-icons/io5"

type TipoPermiso = 'C' | 'R' | 'U' | 'D' | 'E'; 
const permissions = [
  {
    id: 1,
    name: "Gestión de Usuarios",
    type: "Modificación",
    active: true,
    description: "Permite crear, editar y eliminar usuarios del sistema",
    form: "Usuarios",
  },
  {
    id: 2,
    name: "Visualizar Paquetes",
    type: "Lectura",
    active: true,
    description: "Permite visualizar la información de paquetes de viaje",
    form: "Paquetes",
  },
  {
    id: 3,
    name: "Eliminar Reservas",
    type: "Eliminación",
    active: true,
    description: "Permite eliminar reservas del sistema",
    form: "Reservas",
  },
  {
    id: 4,
    name: "Crear Reportes",
    type: "Escritura",
    active: true,
    description: "Permite generar y exportar reportes del sistema",
    form: "Reportes",
  },
  {
    id: 5,
    name: "Configurar Sistema",
    type: "Administración",
    active: true,
    description: "Permite configurar parámetros del sistema",
    form: "Sistema",
  },
]

const roles = [
  {
    id: 1,
    name: "Administrador",
    description: "Acceso completo al sistema con todos los permisos",
    active: true,
    assignedUsers: 5,
    permissions: [1, 2, 3, 4, 5],
    createdAt: "2024-01-15",
    lastModified: "2024-01-22",
  },
  {
    id: 2,
    name: "Editor",
    description: "Puede crear y modificar contenido pero no eliminar",
    active: true,
    assignedUsers: 12,
    permissions: [1, 2, 4],
    createdAt: "2024-01-10",
    lastModified: "2024-01-20",
  },
  {
    id: 3,
    name: "Visualizador",
    description: "Solo puede ver información, sin permisos de modificación",
    active: true,
    assignedUsers: 8,
    permissions: [2],
    createdAt: "2024-01-05",
    lastModified: "2024-01-18",
  },
  {
    id: 4,
    name: "Supervisor",
    description: "Puede supervisar y generar reportes del sistema",
    active: true,
    assignedUsers: 0,
    permissions: [2, 4],
    createdAt: "2024-01-12",
    lastModified: "2024-01-21",
  },
  {
    id: 5,
    name: "Supervis2or1",
    description: "Puede supervisar y generar reportes del sistema",
    active: true,
    assignedUsers: 0,
    permissions: [2, 4],
    createdAt: "2024-01-12",
    lastModified: "2024-01-21",
  },
  {
    id: 6,
    name: "Supervisor2",
    description: "Puede supervisar y generar reportes del sistema",
    active: true,
    assignedUsers: 0,
    permissions: [2, 4],
    createdAt: "2024-01-12",
    lastModified: "2024-01-21",
  },
  {
    id: 7,
    name: "Supervisor3",
    description: "Puede supervisar y generar reportes del sistema",
    active: true,
    assignedUsers: 0,
    permissions: [2, 4],
    createdAt: "2024-01-12",
    lastModified: "2024-01-21",
  },
  {
    id: 8,
    name: "Supervisor4",
    description: "Puede supervisar y generar reportes del sistema",
    active: true,
    assignedUsers: 0,
    permissions: [2, 4],
    createdAt: "2024-01-12",
    lastModified: "2024-01-21",
  },
  {
    id: 9,
    name: "Supervisor5",
    description: "Puede supervisar y generar reportes del sistema",
    active: true,
    assignedUsers: 0,
    permissions: [2, 4],
    createdAt: "2024-01-12",
    lastModified: "2024-01-21",
  },
  {
    id: 10,
    name: "Supervisor6",
    description: "Puede supervisar y generar reportes del sistema",
    active: true,
    assignedUsers: 0,
    permissions: [2, 4],
    createdAt: "2024-01-12",
    lastModified: "2024-01-21",
  },
  {
    id: 11,
    name: "Supervisor7",
    description: "Puede supervisar y generar reportes del sistema",
    active: true,
    assignedUsers: 0,
    permissions: [2, 4],
    createdAt: "2024-01-12",
    lastModified: "2024-01-21",
  },
  {
    id: 12,
    name: "Supervisor8",
    description: "Puede supervisar y generar reportes del sistema",
    active: true,
    assignedUsers: 0,
    permissions: [2, 4],
    createdAt: "2024-01-12",
    lastModified: "2024-01-21",
  },
  {
    id: 13,
    name: "Supervisor9",
    description: "Puede supervisar y generar reportes del sistema",
    active: true,
    assignedUsers: 0,
    permissions: [2, 4],
    createdAt: "2024-01-12",
    lastModified: "2024-01-21",
  },
  {
    id: 14,
    name: "Supervisor10",
    description: "Puede supervisar y generar reportes del sistema",
    active: true,
    assignedUsers: 0,
    permissions: [2, 4],
    createdAt: "2024-01-12",
    lastModified: "2024-01-21",
  },
  {
    id: 15,
    name: "Supervisor11",
    description: "Puede supervisar y generar reportes del sistema",
    active: true,
    assignedUsers: 0,
    permissions: [2, 4],
    createdAt: "2024-01-12",
    lastModified: "2024-01-21",
  },
]


const roleStatusColors = {
  true: "bg-emerald-100 text-emerald-700 border-emerald-200",
  false: "bg-gray-100 text-gray-700 border-gray-200",
}

const enUsoColors = {
  false: "bg-red-100 text-red-700 border-red-200",
  true: "bg-green-100 text-green-700 border-green-200",
}


const tiposPermisosList: Record<TipoPermiso, string> = {
  C: 'Creacion',
  R: 'Lectura',
  U: 'Modificación',
  D: 'Eliminación',
  E: 'Exportación',
};

export default function RolesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [nombreABuscar, setNombreABuscar] = useState("")
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [dataAEditar, setDataAEditar] = useState<Rol>();
  const [dataADesactivar, setDataADesactivar] = useState<Rol>();
  const [onDesactivarData, setOnDesactivarData] = useState(false);
  const [onVerData, setOnVerData] = useState(false);
  const [dataDetalle, setDataDetalle] = useState<Rol>();
  const {handleShowToast} = use(ToastContext);
  const [permissionSearchTerm, setPermissionSearchTerm] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])
  const [onGuardar, setOnGuardar] = useState(false)
  
  // DATOS DEL FORMULARIO 
  const {register, handleSubmit, formState: {errors, }, reset} = 
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
  const [paginacion, setPaginacion] = useState<RolPaginatedResponse>({
                                                      next: null,
                                                      totalItems: 5,
                                                      previous: null,
                                                      totalPages: 5,
                                                      results: [],
                                                      pageSize: 10
                                              });


  const {data, isFetching, isError} = useQuery({
      queryKey: ['roles', currentPage, paginacion.pageSize, nombreABuscar, showActiveOnly], //data cached
      queryFn: () => fetchData(currentPage, paginacion.pageSize, nombreABuscar, showActiveOnly),
      staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
    });

  const {data: dataResumen, isFetching: isFetchingResumen, isError: isErrorResumen} = useQuery({
    queryKey: ['roles-resumen'], //data cached
    queryFn: () => fetchResumen(),
    staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
  });

  const {data: dataPermisosList, isFetching: isFetchingPermisos,} = useQuery({
      queryKey: ['todos-permisos',], //data cached
      queryFn: () => fetchDataPermisos(),
      staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
  });


  let dataList: Rol[] = [];

  if(!isFetching && !isError){
    dataList = data.results.map((per: Rol, index: number) => ({...per, numero: index + 1}));
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
              results: [],
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
    mutationFn: nuevoRolFetch,
    onSuccess: () => {
        handleShowToast('Se ha creado un nuevo rol satisfactoriamente', 'success');
        reset({
            nombre: "",
            descripcion: "",
          });

        setSelectedPermissions([])
        setOnGuardar(false);

        setActiveTab('list');
         queryClient.invalidateQueries({
          queryKey: ['roles'],
          exact: false
        });

        queryClient.invalidateQueries({
          queryKey: ['roles-resumen'],
        });
    },
  });

  const {mutate: mutateGuardarEditado, isPending: isPendingEdit} = useMutation({
    mutationFn: guardarDataEditado,
    onSuccess: () => {
        handleShowToast('Se ha guardado el modulo satisfactoriamente', 'success');
        setDataAEditar(undefined);
        reset({
            nombre: "",
            descripcion: "",
          });
        setActiveTab('list');
         queryClient.invalidateQueries({
          queryKey: ['roles'],
          exact: false
        });

        queryClient.invalidateQueries({
          queryKey: ['permisos'],
          exact: false
        });
    },
  });

  const {mutate: mutateDesactivar, isPending: isPendingDesactivar} = useMutation({
    mutationFn: activarDesactivarData,
    onSuccess: () => {
        handleShowToast('Se ha desactivado el modulo satisfactoriamente', 'success');
        setOnDesactivarData(false);
        setDataADesactivar(undefined);
        //desactivamos todas las queies
        queryClient.invalidateQueries({
          queryKey: ['roles'],
          exact: false
        });
        queryClient.invalidateQueries({
          queryKey: ['roles-resumen'],
        });
    },
  });


  const handleCancel = () => {
        setOnGuardar(false);
        setDataAEditar(undefined);
        reset({
            nombre: "",
            descripcion: "",
          });
        setActiveTab('list');
  }


  const handleGuardarNuevaData = async (dataForm: any) => {
    console.log('dataForm: ', dataForm);
    console.log('selectedPermissions: ', selectedPermissions)
    if(selectedPermissions.length){
      mutate({...dataForm, activo: true, en_uso: false, permisos_id: selectedPermissions});
    }
  }

  const handleGuardarDataEditado = async (dataForm: any) => {
    const dataEditado = {...dataAEditar, ...dataForm};
    delete dataEditado.numero;
    delete dataEditado.permisos;
    delete dataEditado.fecha_creacion;
    delete dataEditado.fecha_modificacion;


    if(selectedPermissions.length){
      const payLoad = {...dataEditado, permisos_id: selectedPermissions};
      console.log('payload: ', payLoad)
      mutateGuardarEditado(payLoad);
    }
  }



  useEffect(() => {
    if (dataAEditar) {
      reset({
        nombre: dataAEditar.nombre,
        descripcion: dataAEditar.descripcion,
      });
    }
  }, [dataAEditar, reset]);


  const handleEditar = (data: Rol) => {
    setActiveTab('form');
    setDataAEditar(data);
    const permisos = data.permisos;
    const permisosIds = permisos.map(rol => rol.id)
    console.log(data)
    setSelectedPermissions(permisosIds);
  }

  const toggleActivar = (modulo: Rol) => {
    setOnDesactivarData(true);
    setDataADesactivar(modulo);
  }

  const handleCloseModal = () => {
    setOnDesactivarData(false);
  }

  const handleConfirmActivo = (activo=true) => {
    mutateDesactivar({ dataId: dataADesactivar!.id, activo })
  }

  const handleVerDetalles = (data: Rol) => {
    setDataDetalle(data);
    setOnVerData(true);
  }

  const handleCloseVerDetalles = () => {
    setOnVerData(false);
    setDataDetalle(undefined);
  }

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId) ? prev.filter((p) => p !== permissionId) : [...prev, permissionId],
    )
  }

  return (
    <>
      {onVerData && <Modal onClose={handleCloseVerDetalles} claseCss={'modal-detalles'}>
            <div className=" bg-white rounded-lg shadow-lg p-6">
                {/* Header */}
                <div className="mb-6 border-b pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center">
                      <Boxes className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 capitalize">
                        {dataDetalle?.nombre}
                      </h2>
                      <p className="text-gray-600">Detalles completos del rol</p>
                    </div>
                  </div>
                </div>

                
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Estado</Label>
                        <div className="mt-1">
                          <Badge
                            className={roleStatusColors[dataDetalle?.activo.toString() as keyof typeof roleStatusColors]}
                          >
                            {dataDetalle?.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">En uso</Label>
                        <div className="mt-1">
                          <Badge className={enUsoColors[dataDetalle?.en_uso.toString() as keyof typeof enUsoColors]}>
                            {dataDetalle?.en_uso ? "Asigando" : "Sin asignar"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">Descripción</Label>
                      <p className="mt-1 text-gray-900">{dataDetalle?.descripcion}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Permisos Asignados ({dataDetalle?.permisos.length})
                      </Label>
                      <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                        {dataDetalle?.permisos.map((per, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <Shield className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">{per.nombre}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Usuarios Asignados</Label>
                        <div className="mt-1 flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">6 usuarios</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Fecha de Creación</Label>
                        <p className="mt-1 text-gray-900">
                          {formatearFecha(dataDetalle?.fecha_creacion ?? '')}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">Última Modificación</Label>
                      <p className="mt-1 text-gray-900">
                        {formatearFecha(dataDetalle?.fecha_modificacion ?? '')}
                      </p>
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

      {onDesactivarData && 
        <Modal onClose={handleCloseModal} claseCss="modal">
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${dataADesactivar!.activo ? 'bg-red-100 dark:bg-red-900/20': 'bg-green-100 dark:bg-green-900/20'} `}>
                    {dataADesactivar!.activo && <IoWarningOutline className="h-8 w-8 text-red-600 dark:text-red-400" />}
                    {!dataADesactivar!.activo && <IoCheckmarkCircleOutline className="h-8 w-8 text-green-600 dark:text-green-400" />}
                    
                </div>
                <h2 className='text-center'>Confirmacion de operación</h2>
              <p className=' text-gray-600 dark:text-gray-400 mt-2 text-justify'>
                ¿Estás seguro de que deseas {dataADesactivar!.activo ? 'desactivar' : 'activar'} el rol de <b>{capitalizePrimeraLetra(dataADesactivar?.nombre ?? '')}</b>? 
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
              <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-semibold text-gray-900">Roles</h1>
            </div>
            <p className="text-gray-600">Gestiona los roles del sistema de manera eficiente</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer"
              onClick={() => setActiveTab('form')}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Rol
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <ResumenCards {...dataResumen} isFetchingResumen={isFetchingResumen} isErrorResumen={isErrorResumen}/>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-80 bg-gray-100">
            <TabsTrigger value="list" className="cursor-pointer data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Lista de Roles
            </TabsTrigger>
            <TabsTrigger value="form" className="cursor-pointer data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              Crear Rol
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
                      <CardTitle className="text-emerald-900">Crear Nuevo Rol</CardTitle>
                      <CardDescription className="text-emerald-700">
                        Complete la información para crear un nuevo rol
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 font-medium">
                        Nombre del Rol *
                      </Label>
                    <Input
                        id="nombre"
                        autoComplete="nombre"
                        placeholder="Nombre del rol"
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
                      <Label htmlFor="description" className="text-gray-700 font-medium">
                        Descripción *
                      </Label>
                      <Textarea
                          id="descripcion"
                          autoComplete="descripcion"
                          placeholder="Describe el rol y su funcionalidad"
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

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-gray-700 font-medium">Seleccione los permisos *</Label>

                      
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar permisos..."
                          value={permissionSearchTerm}
                          onChange={(e) => setPermissionSearchTerm(e.target.value)}
                          className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      
                      {selectedPermissions.length > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                            {selectedPermissions.length} permisos seleccionados
                          </Badge>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPermissions([])}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Limpiar selección
                          </Button>
                        </div>
                      )}

                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4">
                        {dataPermisosList && dataPermisosList
                          .filter(
                            (permission: any) => 
                              permission.nombre.toLowerCase().includes(permissionSearchTerm.toLowerCase()) ||
                              permission.descripcion.toLowerCase().includes(permissionSearchTerm.toLowerCase()) ||
                              permission.tipo.toLowerCase().includes(permissionSearchTerm.toLowerCase()) ||
                              permission.modulo.nombre.toLowerCase().includes(permissionSearchTerm.toLowerCase()),
                            
                          )
                          .map((permission: any) => (
                            <div
                              key={permission.id}
                              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Checkbox
                                id={`permission-${permission.id}`}
                                checked={selectedPermissions.includes(permission.id)}
                                onCheckedChange={() => handlePermissionToggle(permission.id)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <Label
                                  htmlFor={`permission-${permission.id}`}
                                  className="text-sm font-medium text-gray-900 cursor-pointer"
                                >
                                  {permission.nombre}
                                </Label>
                                <p className="text-xs text-gray-500 mt-1">{permission.descripcion}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge
                                    className={`text-xs ${
                                      permission.tipo === "R"
                                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                        : permission.tipo === "C"
                                          ? "bg-blue-100 text-blue-700 border-blue-200"
                                          : permission.tipo === "U"
                                            ? "bg-amber-100 text-amber-700 border-amber-200"
                                            : permission.tipo === "D"
                                              ? "bg-red-100 text-red-700 border-red-200"
                                              : "bg-purple-100 text-purple-700 border-purple-200"
                                    }`}
                                  >
                                    {tiposPermisosList[`${permission.tipo as TipoPermiso}`]}
                                  </Badge>
                                  <Badge className="text-xs bg-gray-100 text-gray-600 border-gray-200">
                                    {permission.modulo.nombre}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        
                        {dataPermisosList && dataPermisosList.filter(
                          (permission: any) =>
                            permission.nombre.toLowerCase().includes(permissionSearchTerm.toLowerCase()) ||
                            permission.descripcion.toLowerCase().includes(permissionSearchTerm.toLowerCase()) ||
                            permission.tipo.toLowerCase().includes(permissionSearchTerm.toLowerCase()) ||
                            permission.modulo.nombre.toLowerCase().includes(permissionSearchTerm.toLowerCase()),
                        ).length === 0 && (
                          <div className="col-span-2 text-center py-8">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                              <Search className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-sm">
                              No se encontraron permisos que coincidan con "{permissionSearchTerm}"
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

                      {onGuardar && selectedPermissions.length ===0 && <span className='text-red-400 text-sm'>Debes seleccinar al menos un permiso</span>}
                      
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const filteredPermissions = dataPermisosList.filter(
                              (permission: any) =>
                                permission.nombre.toLowerCase().includes(permissionSearchTerm.toLowerCase()) ||
                                permission.descripcion.toLowerCase().includes(permissionSearchTerm.toLowerCase()) ||
                                permission.tipo.toLowerCase().includes(permissionSearchTerm.toLowerCase()) ||
                                permission.modulo.nombre.toLowerCase().includes(permissionSearchTerm.toLowerCase()),
                            )
                            const allFilteredSelected = filteredPermissions.every((p: any) =>
                              selectedPermissions.includes(p.id),
                            )

                            if (allFilteredSelected) {
                              setSelectedPermissions((prev) =>
                                prev.filter((id) => !filteredPermissions.map((p: any) => p.id).includes(id)),
                              )
                            } else {
                              const newSelections = filteredPermissions
                                .map((p:any) => p.id)
                                .filter((id:any) => !selectedPermissions.includes(id))
                              setSelectedPermissions((prev) => [...prev, ...newSelections])
                            }
                          }}
                          className="cursor-pointer text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          {dataPermisosList && dataPermisosList
                            .filter(
                              (permission: any) =>
                                permission.nombre.toLowerCase().includes(permissionSearchTerm.toLowerCase()) ||
                                permission.descripcion.toLowerCase().includes(permissionSearchTerm.toLowerCase()) ||
                                permission.tipo.toLowerCase().includes(permissionSearchTerm.toLowerCase()) ||
                                permission.modulo.nombre.toLowerCase().includes(permissionSearchTerm.toLowerCase()),
                            )
                            .every((p: any) => selectedPermissions.includes(p.id))
                            ? "Deseleccionar"
                            : "Seleccionar"}{" "}
                          todos
                        </Button>

                        {/* <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPermissions(permissions.map((p) => p.id))}
                          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Seleccionar todos
                        </Button> */}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {!dataAEditar &&
                        <Button 
                            disabled={isPendingMutation}
                            type="submit"
                            onClick={() => setOnGuardar(true)}
                            className="bg-emerald-500 hover:bg-emerald-600 cursor-pointer">
                          {isPendingMutation ? 
                              <>
                                  <Loader2Icon className="animate-spin w-10 h-10 text-gray-300"/>
                                  Creando...
                              </> : 
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Crear Rol
                              </>}
                        </Button>
                          }

                        {dataAEditar &&
                            <Button 
                                disabled={isPendingEdit}
                                type="submit"
                                onClick={() => setOnGuardar(true)}
                                className="bg-emerald-500 hover:bg-emerald-600 cursor-pointer">
                              {isPendingMutation ? 
                                  <>
                                      <Loader2Icon className="animate-spin w-10 h-10 text-gray-300"/>
                                      Guardando...
                                  </> : 
                                  <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Guardar Rol
                                  </>}
                            </Button>
                          }
                    <Button
                      variant="outline"
                      className="cursor-pointer border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                      onClick={() => {
                        // setNewRoleName("")
                        // setNewRoleDescription("")
                        setSelectedPermissions([])
                        setPermissionSearchTerm("")
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

          {/* Roles List Tab */}
          <TabsContent value="list">
            <Card className="border-blue-200 pt-0">
              <CardHeader className="bg-blue-50 border-b border-blue-200 pt-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-blue-900">Lista de Roles</CardTitle>
                      <CardDescription className="text-blue-700">
                        Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} roles
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
                      className="border-gray-300 hover:bg-gray-50 bg-transparent"
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
                      {/* <TableHead className="font-semibold text-gray-700">Usuarios Asignados</TableHead> */}
                      {/* <TableHead className="font-semibold text-gray-700">Permisos</TableHead> */}
                      <TableHead className="font-semibold text-gray-700">Fecha Creación</TableHead>
                      <TableHead className="font-semibold text-gray-700">Última Modificación</TableHead>
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
                    
                      {!isFetching && dataList.length > 0 && dataList.map((data: Rol) => (
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
                                  <div className="font-medium text-gray-900">{data.nombre}</div>
                                  <div className="text-sm text-gray-500 truncate max-w-xs">{data.descripcion}</div>
                                </div>
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
                              {/* <TableCell>
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium">{data.assignedUsers}</span>
                                </div>
                              </TableCell> */}
                              {/* <TableCell>
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                  {data.permisos.slice(0, 2).map((permId) => {
                                    const permission = permissions?.find((p) => p.id === permId)
                                    return permission ? (
                                      <Badge key={permId} className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                                        {permission.name}
                                      </Badge>
                                    ) : null
                                  })}
                                  {data.permisos.length > 2 && (
                                    <Badge className="text-xs bg-gray-100 text-gray-600 border-gray-200">
                                      +{data.permisos.length - 2} más
                                    </Badge>
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
  );
}
