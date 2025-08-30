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
import type { Empleado, Persona, PersonaFisica, PersonaJuridica, RespuestaPaginada, TipoRemuneracion, } from "@/types/empleados"
import { capitalizePrimeraLetra, formatearFecha, formatearSeparadorMiles, getNombreCompleto } from "@/helper/formatter"
import { activarDesactivarData, fetchData, fetchResumen, guardarDataEditado, nuevoDataFetch, fetchDataTodo, fetchDataPuestosTodos } from "@/components/utils/httpEmpleado"
import {Controller, useForm } from "react-hook-form"
import { queryClient } from "@/components/utils/http"
import { ToastContext } from "@/context/ToastContext"
import Modal from "@/components/Modal"
import { IoCheckmarkCircleOutline, IoWarningOutline } from "react-icons/io5";
import ResumenCardsDinamico from "@/components/ResumenCardsDinamico"
import { GenericSearchSelect } from "@/components/SimpleSearchSelect"
import { fetchDataPersonasTodos } from "@/components/utils/httpPersona"
import { DinamicSearchSelect } from "@/components/DinamicSearchSelect"
import { useSessionStore } from "@/store/sessionStore"

// type ModuleKey = keyof typeof moduleColors; // "Usuarios" | "Paquetes" | "Empleados" | "Roles" | "Reservas" | "Reportes"


// const moduleColors = {
//   Usuarios: "bg-emerald-50 text-emerald-600 border-emerald-200",
//   Paquetes: "bg-purple-50 text-purple-600 border-purple-200",
//   Empleados: "bg-orange-50 text-orange-600 border-orange-200",
//   Roles: "bg-yellow-50 text-yellow-600 border-yellow-200",
//   Reservas: "bg-pink-50 text-pink-600 border-pink-200",
//   Reportes: "bg-indigo-50 text-indigo-600 border-indigo-200",
// }

const tipoPersonaColores = {
  fisica: "bg-blue-100 text-blue-700 border-blue-200",
  juridica: "bg-purple-100 text-purple-700 border-purple-200",
}

// const tipoRemuneracionColores = {
//   salario: "bg-blue-100 text-blue-700 border-blue-200",
//   comision: "bg-blue-100 text-blue-700 border-blue-200",
//   mixto: "bg-purple-100 text-purple-700 border-purple-200",
// }

let dataList: Empleado[] = [];

export default function ModulosPage() {
  const {siTienePermiso} = useSessionStore();
  // const [setSearchTerm] = useState("")
  const [selectedPuestosID, setSelectedPuestosID] = useState<number | "">("");
  const [selectedPersonaID, setSelectedPersonaID] = useState<number | "">("");
  const [puestoNoSeleccionada, setPuestoNoSeleccionada] = useState<boolean | undefined>();
  const [newDataPersonaList, setNewDataPersonaList] = useState<Persona[]>();
  const [personaNoSeleccionada, setPersonaNoSeleccionada] = useState<boolean | undefined>();
  const [nombreABuscar, setNombreABuscar] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [dataAEditar, setDataAEditar] = useState<Empleado>();
  const [dataADesactivar, setDataADesactivar] = useState<Empleado>();
  const [onDesactivarData, setOnDesactivarData] = useState(false);
  const [onVerDetalles, setOnVerDetalles] = useState(false);
  const [tipoRemuneracionSelected, setTipoRemuneracionSelected] = useState<TipoRemuneracion>();
  const [dataDetalle, setDataDetalle] = useState<Empleado>();
  const {handleShowToast} = use(ToastContext);
  const [personaBusqueda, setPersonaBusqueda] = useState<string>("");
  const [filtros, setFiltros] = useState({
                  activo: true,   // null = todos, true = solo activos
                  fecha_desde: "",
                  fecha_hasta: "",
                  nombre: ""
                });
  
  // DATOS DEL FORMULARIO 
  const {control, register, handleSubmit, setValue, formState: {errors, },clearErrors, reset} = 
            useForm<any>({
              mode: "onBlur",
              defaultValues: {
                salario: '',
                porcentaje_comision: '',
                puesto: '',
                persona: '',
                tipo_remuneracion: '',
                fecha_ingreso: ''
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
                                              

  const {data: dataPuestosList, isFetching: isFetchingPuestos,} = useQuery({
      queryKey: ['puestos-disponibles',], //data cached
      queryFn: () => fetchDataPuestosTodos(),
      staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
    });

  const {data: dataPersonaList, isFetching: isFetchingPersonas,} = useQuery({
      queryKey: ['personas-disponibles', personaBusqueda], //data cached
      queryFn: () => fetchDataPersonasTodos(personaBusqueda),
      staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
    });

  const {data: dataTipoRemuneracionList, isFetching: isFetchingTipoRemuneracion,} = useQuery({
      queryKey: ['tipo-remuneracion-de-personas',], //data cached
      queryFn: () => fetchDataTodo(),
      staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
    });

  const {data, isFetching, isError} = useQuery({
    queryKey: ['empleados', currentPage, paginacion.pageSize, filtros], //data cached
    queryFn: () => fetchData(currentPage, paginacion.pageSize, filtros),
    staleTime: 5 * 60 * 1000, //despues de 5min los datos se consideran obsoletos
    enabled: !((filtros.fecha_desde && !filtros.fecha_hasta) || (!filtros.fecha_desde && filtros.fecha_hasta))
  ,
  });

  const {data: dataResumen, isFetching: isFetchingResumen, isError: isErrorResumen} = useQuery({
    queryKey: ['empleados-resumen'], //data cached
    queryFn: () => fetchResumen(),
    staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
  });

  // let filteredPermissions: Modulo[] = [];
  

  if(!isFetching && !isError){
    if(data?.results){
      dataList = data.results.map((per: Empleado, index: number) => ({...per, numero: index + 1}));
    }
    // else
      // dataList = [];
  }


  if(!isFetchingPersonas){
    console.log('dataListPersonas: ', dataPersonaList)
  }


  useEffect(() => {  
    if(dataPersonaList){
      if(dataAEditar){
        setNewDataPersonaList([...dataPersonaList, dataAEditar.persona]);
      }
      else{
        setNewDataPersonaList([...dataPersonaList])
      }
    }
  }, [dataAEditar, dataPersonaList]);
  
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
        reset({
          salario: '',
          porcentaje_comision: '',
          puesto: '',
          persona: '',
          tipo_remuneracion: '',
          fecha_ingreso: ''
        });

        // setTipoDePersonaCreacion(undefined);
        // setTipoRemuneracionSelected(undefined);
        setActiveTab('list');
        queryClient.invalidateQueries({
          queryKey: ['empleados'],
          exact: false
        });

        queryClient.invalidateQueries({
          queryKey: ['empleados-resumen'],
        });

        queryClient.invalidateQueries({
          queryKey: ['empleados-disponibles'],
        });


        queryClient.invalidateQueries({
          queryKey: ['usuarios'],
          exact: false
        });

        queryClient.invalidateQueries({
          queryKey: ['usuarios-resumen'],
        });


        // setSelectedPersonaID("");
        // setSelectedPuestosID("");
        // setPersonaNoSeleccionada(undefined);
        // setPuestoNoSeleccionada(undefined);

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
            salario: '',
            porcentaje_comision: '',
            puesto: '',
            persona: '',
            tipo_remuneracion: '',
            fecha_ingreso: ''
          });


        // setTipoDePersonaCreacion(undefined);
        // setTipoRemuneracionSelected(undefined);
        setActiveTab('list');
        queryClient.invalidateQueries({
          queryKey: ['empleados'],
          exact: false
        });

        queryClient.invalidateQueries({
          queryKey: ['empleados-resumen'],
        });

        queryClient.invalidateQueries({
          queryKey: ['empleados-disponibles'],
        });


        queryClient.invalidateQueries({
          queryKey: ['usuarios'],
          exact: false
        });

        queryClient.invalidateQueries({
          queryKey: ['usuarios-resumen'],
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
          queryKey: ['empleados'],
          exact: false
        });
        queryClient.invalidateQueries({
          queryKey: ['empleados-resumen'],
        });
    },
  });


  const handleCancel = () => {
        setDataAEditar(undefined);
        setSelectedPuestosID("");
        setSelectedPersonaID("");
        handleDataNoSeleccionada(undefined)
        handleDataNoPersonaSeleccionada(undefined)
        setNewDataPersonaList([...dataPersonaList])
        reset({
          salario: '',
            porcentaje_comision: '',
            puesto: '',
            persona: '',
            tipo_remuneracion: '',
            fecha_ingreso: ''
        });


        // setTipoDePersonaCreacion(undefined);
        // setTipoRemuneracionSelected(undefined);
        
        setActiveTab('list');
  }


  const handleGuardarNuevaData = async (dataForm: any) => {
    console.log('dataForm: ', dataForm)
    console.log('puesto: ', selectedPuestosID);
    console.log('persona: ', selectedPersonaID);

    const tipoRemuneracion = dataTipoRemuneracionList.filter((doc: TipoRemuneracion) => doc.id.toString() === tipoRemuneracionSelected?.id.toString())
    let salario: number = 0;
    let porcentaje_comision: number = 0;

    if(tipoRemuneracion && (tipoRemuneracion[0].nombre === 'Salario fijo')){
      salario = dataForm?.salario;
    }
    

    if(tipoRemuneracion && (tipoRemuneracion[0].nombre === 'Comisión' || tipoRemuneracion[0].nombre === 'Comision')){
      porcentaje_comision = dataForm.porcentaje_comision;
    }
    
    if(tipoRemuneracion && (tipoRemuneracion[0].nombre === 'Mixto')){
        porcentaje_comision = dataForm.porcentaje_comision;
    }


    const payload = {...dataForm, 
          puesto: selectedPuestosID,
          persona: selectedPersonaID,
          activo: true,
          porcentaje_comision,
          salario
        }

    delete payload.numero

    // const payload = {...dataForm, 
    //       puesto: selectedPuestosID,
    //       persona: selectedPersonaID,
    //       activo: true
    //     }

    console.log('payload: ', payload)
//     {
//     "salario": "10000000",
//     "porcentaje_comision": "10",
//     "tipo_remuneracion": "2",
//     "fecha_ingreso": "2025-08-24"
// }

//     {
//     "persona": null,
//     "puesto": null,
//     "tipo_remuneracion": null,
//     "salario": null,
//     "porcentaje_comision": null,
//     "activo": false,
//     "fecha_ingreso": null
// }
    // if(dataForm.tipo === 'fisica'){
    //   dataForm.nacionalidad = selectedPuestosID;
    //   delete dataForm.razon_social;
    // }
    // else{
    //   delete dataForm.nombre;
    //   delete dataForm.apellido;
    //   delete dataForm.sexo;
    //   delete dataForm.fecha_nacimiento;
    //   delete dataForm.nacionalidad;
    // }

    // console.log('dataForm cleaned: ', dataForm);
    // reset({
    //       nombre: '',
    //       apellido: '',
    //       direccion: '',
    //       documento: '',
    //       telefono: '',
    //       nacionalidad: '',
    //       fecha_nacimiento: getFechaPorDefecto(),
    //       tipo: '',
    //       tipo_documento: '',
    //       sexo: '',
    //       razon_social: '',
    //       email: '',
    //     });


    mutate(payload);
  }

  const handleGuardarDataEditado = async (dataForm: any) => {
    const dataEditado = {...dataAEditar, ...dataForm};
    delete dataEditado.numero;

    console.log('dataForm editar: ', dataForm)
    // console.log('puesto: ', selectedPuestosID);
    // console.log('persona: ', selectedPersonaID);
    const tipoRemuneracion = dataTipoRemuneracionList.filter((doc: TipoRemuneracion) => doc.id.toString() === tipoRemuneracionSelected?.id.toString())

    console.log('tipoRemuneracion: ', tipoRemuneracion)

    let salario: number = 0;
    let porcentaje_comision: number = 0;
    if(tipoRemuneracion && (tipoRemuneracion[0].nombre === 'Salario fijo')){
      console.log('aca 1');
      salario = dataForm?.salario;
      porcentaje_comision = dataAEditar!.porcentaje_comision;
    }
    

    if(tipoRemuneracion && (tipoRemuneracion[0].nombre === 'Comisión' || tipoRemuneracion[0].nombre === 'Comision')){
      console.log('aca 2');
      porcentaje_comision = dataForm.porcentaje_comision;
      salario = dataAEditar!.salario;
    }
    
    if(tipoRemuneracion && (tipoRemuneracion[0].nombre === 'Mixto')){
        porcentaje_comision = dataForm.porcentaje_comision;
        salario = dataForm?.salario;
    }


    const payload = {...dataForm, 
          puesto: selectedPuestosID,
          persona: selectedPersonaID,
          activo: true,
          porcentaje_comision,
          salario
        }

    delete payload.numero

    console.log('dataAEditar: ', dataAEditar)
    console.log('payload editar: ', payload)

    // if(dataForm.tipo === 'fisica'){
    //   dataEditado.nacionalidad = selectedPuestosID;
    //   delete dataEditado.razon_social;
    // }
    // else{
    //   delete dataEditado.nombre;
    //   delete dataEditado.apellido;
    //   delete dataEditado.sexo;
    //   delete dataEditado.fecha_nacimiento;
    //   delete dataEditado.nacionalidad;
    // }
    mutateGuardarEditado(payload);
  }


  /********************************
   * CORREGIR ESTA PARTE
   *******************************/
  /********************************
   * CORREGIR ESTA PARTE
   *******************************/
  useEffect(() => {
    if (dataAEditar) {
      console.log('reset data para editar: ', dataAEditar)
      reset({
        ...dataAEditar,
        tipo_remuneracion: dataAEditar.tipo_remuneracion.id.toString(),
        persona: dataAEditar.persona.id.toString()
      });

      // const item = dataPersonaList.find((c: any) => c[valueKey] === value);
      console.log('dataAEditar.persona.id: ', dataAEditar.persona.id)
      setSelectedPersonaID(dataAEditar.persona.id);
      // setNewDataPersonaList([...dataPersonaList, dataAEditar.persona]);
      handleDataNoSeleccionada(true);
    }
  }, [dataAEditar, reset]);


  const handleEditar = (data: Empleado) => {
    console.log('data: ', data)
    setActiveTab('form');
    setDataAEditar(data);
    // setTipoDePersonaCreacion(data.persona.tipo);

    // if(data.persona.tipo === 'fisica'){
      setSelectedPuestosID(data!.puesto.id)
      setSelectedPersonaID(data!.persona.id)
      setTipoRemuneracionSelected(data?.tipo_remuneracion)
    // }
  }

  const toggleActivar = (modulo: Empleado) => {
    setOnDesactivarData(true);
    setDataADesactivar(modulo);
  }

  const handleCloseModal = () => {
    setOnDesactivarData(false);
  }

  const handleConfirmActivo = (activo=true) => {
    mutateDesactivar({ dataId: dataADesactivar!.id, activo, })
  }

  const handleVerDetalles = (data: Empleado) => {
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
    setPuestoNoSeleccionada(value);
  }

  const handleDataNoPersonaSeleccionada = (value: boolean | undefined) => {
    setPersonaNoSeleccionada(value);
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

  useEffect(() => {
    if (tipoRemuneracionSelected?.nombre === 'Comision' || tipoRemuneracionSelected?.nombre === 'Comisión') {
      setValue("salario", "");
      clearErrors("salario");
    }else if (tipoRemuneracionSelected?.nombre === 'Salario fijo') {
      setValue("porcentaje_comision", "");
      clearErrors("porcentaje_comision");
    }
  }, [tipoRemuneracionSelected, setValue, clearErrors]);

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
                        {dataDetalle?.persona.tipo === 'fisica' ? dataDetalle?.persona.nombre : (dataDetalle?.persona as PersonaJuridica)?.razon_social}
                      </h2>
                      <p className="text-gray-600">Detalles completos del empleado</p>
                    </div>
                  </div>
                </div>

                
                 <div className="p-3 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">DATOS LABORALES</h3>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Puesto:</span>
                              <Badge className='border bg-blue-100 text-blue-700 border-blue-200'>
                                {capitalizePrimeraLetra(dataDetalle?.puesto.nombre ?? '')}
                              </Badge>
                            </div>

                            <div className="flex justify-between mt-1">
                              <span className="text-gray-600">Tipo Remuneración:</span>
                              <Badge className='border bg-blue-100 text-blue-700 border-blue-200'>
                                {capitalizePrimeraLetra(dataDetalle?.tipo_remuneracion.nombre ?? '')}
                              </Badge>
                            </div>

                          <div className="space-y-3">
                            {/* {dataDetalle?.persona.tipo === 'fisica' && */}
                              <> 
                                <div className="flex justify-between mt-1">
                                  <span className="text-gray-600">Salario:</span>
                                  <span className="font-medium">
                                    {formatearSeparadorMiles.format(dataDetalle?.salario ?? 0)} Gs.
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Porcetanje de comisión:</span>
                                  <span className="font-medium">
                                    {dataDetalle?.porcentaje_comision} %
                                  </span>
                                </div>

                                 
                              </>
                            {/* } */}

                            {/* {dataDetalle?.persona?.tipo === 'juridica' &&
                              <div className="flex justify-between">
                                <span className="text-gray-600">Razon social:</span>
                                <span className="font-medium">
                                  {(dataDetalle?.persona as PersonaJuridica).razon_social}
                                </span>
                              </div>
                            } */}

                           
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">DOCUMENTO</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tipo Documento:</span>
                              <Badge className='border bg-blue-100 text-blue-700 border-blue-200'>
                                {dataDetalle?.persona?.tipo_documento.nombre}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Número:</span>
                              <span className="font-medium">{dataDetalle?.persona?.documento}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">INFORMACIÓN PERSONAL</h3>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tipo:</span>
                              <Badge className='border bg-blue-100 text-blue-700 border-blue-200'>
                                {capitalizePrimeraLetra(dataDetalle?.persona.tipo ?? '')}
                              </Badge>
                            </div>

                          <div className="space-y-3">
                            {dataDetalle?.persona.tipo === 'fisica' &&
                              <> 
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Nombre completo:</span>
                                  <span className="font-medium">
                                    {dataDetalle?.persona.nombre} {dataDetalle?.persona.apellido}
                                  </span>
                                </div>

                                 <div className="flex justify-between">
                                  <span className="text-gray-600">Fecha de nacimiento:</span>
                                  <span className="font-medium">{formatearFecha(dataDetalle?.persona?.fecha_nacimiento ?? '', false)}</span>
                                </div>
                                {/* <div className="flex justify-between">
                                  <span className="text-gray-600">Edad:</span>
                                  <span className="font-medium">{dataDetalle?.persona?.edad} años</span>
                                </div> */}
                                {/* <div className="flex justify-between">
                                  <span className="text-gray-600">Género:</span>
                                  <Badge className={`${genderColors[dataDetalle?.persona?.sexo ?? 'M']} border`}>
                                    {dataDetalle?.persona?.sexo === 'F' ? 'Femenino': 'Masculino'}
                                  </Badge>
                                </div> */}
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Nacionalidad:</span>
                                  <span className="font-medium">{dataDetalle?.persona?.nacionalidad?.nombre}</span>
                                </div>
                              </>
                            }

                            {dataDetalle?.persona?.tipo === 'juridica' &&
                              <div className="flex justify-between">
                                <span className="text-gray-600">Razon social:</span>
                                <span className="font-medium">
                                  {(dataDetalle?.persona as PersonaJuridica).razon_social}
                                </span>
                              </div>
                            }

                           
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">DOCUMENTO</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tipo Documento:</span>
                              <Badge className='border bg-blue-100 text-blue-700 border-blue-200'>
                                {dataDetalle?.persona?.tipo_documento.nombre}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Número:</span>
                              <span className="font-medium">{dataDetalle?.persona?.documento}</span>
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
                              <span className="font-medium">{dataDetalle?.persona?.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Teléfono:</span>
                              <span className="font-medium">{dataDetalle?.persona?.telefono}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Dirección:</span>
                              <span className="font-medium text-right">{dataDetalle?.persona?.direccion}</span>
                            </div>
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
                              <span className="text-gray-600">Fecha de ingreso:</span>
                              <span className="font-medium">{formatearFecha(dataDetalle?.fecha_ingreso ?? '')}</span>
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
               ¿Estás seguro de que deseas {dataADesactivar!.activo ? 'desactivar' : 'activar'} al empleado  
               <b>
                  {' ' + capitalizePrimeraLetra((dataADesactivar?.persona as PersonaFisica)?.nombre ?? 
                      ((dataADesactivar?.persona as PersonaJuridica)?.razon_social ?? ''))}
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
        </Modal>}

      <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                   <User className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-3xl font-semibold text-gray-900">Empleados</h1>
              </div>
              <p className="text-gray-600">Gestiona los datos de empleados del sistema y su estado.</p>
            </div>
            <div className="flex gap-3">
              {siTienePermiso("empleados", "exportar") &&
                <Button
                  variant="outline"
                  className="border-emerald-200 text-emerald-700 cursor-pointer hover:bg-emerald-50 bg-transparent"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              }

              {siTienePermiso("empleados", "exportar") && 
              <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer"
                onClick={() => setActiveTab('form')}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Empleado
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
                Lista de Empleados
              </TabsTrigger>
              <TabsTrigger 
                disabled={!siTienePermiso("empleados", "crear")} 
                value="form" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white cursor-pointer">
                Crear Empleado
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
                        <CardTitle className="text-emerald-900">Crear Nueva Empleado</CardTitle>
                        <CardDescription className="text-emerald-700">
                          Complete la información para crear una nueva persona
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {/* LISTADO DE PERSONAS */}
                          <div className="space-y-2 mi-select-wrapper">
                            <Label htmlFor="persona" className="text-gray-700 font-medium">
                              Persona *
                            </Label>
                            
                              <div className="space-y-2">
                                  <DinamicSearchSelect
                                    disabled={!!dataAEditar}
                                    dataList={newDataPersonaList || []}
                                    value={selectedPersonaID}
                                    onValueChange={setSelectedPersonaID}
                                    handleDataNoSeleccionada={handleDataNoPersonaSeleccionada}
                                    onSearchChange={setPersonaBusqueda} // 🔹 Aquí se notifica el cambio de búsqueda
                                    isFetchingPersonas={isFetchingPersonas}
                                    placeholder="Buscar persona..."
                                    valueKey="id"
                                  />
                              </div>

                              {personaNoSeleccionada === false && (
                                <p className="text-red-400 text-sm">Este campo es requerido</p>
                              )}
                          </div>

                              {/* REMUNERACION */}
                            <div className="space-y-2">
                                <Label htmlFor="tipo_remuneracion" className="text-gray-700 font-medium">
                                  Tipo de Remuneracion *
                                </Label>

                                {isFetchingTipoRemuneracion && (
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

                                {!isFetchingTipoRemuneracion && 
                                  <Controller
                                    name="tipo_remuneracion"
                                    control={control}
                                    rules={{ required: "Este campo es requerido" }}
                                    render={({ field }) => (
                                      <div className="w-full min-w-0 select-container"> {/* Contenedor para controlar el layout */}
                                        <Select
                                          value={field.value}
                                          onValueChange={(value) => {
                                            field.onChange(value)
                                            if (value) {
                                              clearErrors("tipo_remuneracion")
                                            }

                                            console.log('value: ', value);
                                            const tipoRemuneracion = dataTipoRemuneracionList.filter((doc: TipoRemuneracion) => doc.id.toString() === value)
                                            console.log('tipoRemuneracion: ', tipoRemuneracion[0])
                                            setTipoRemuneracionSelected(tipoRemuneracion[0]);
                                          }}
                                          onOpenChange={(open) => {
                                            if (!open && !field.value) {
                                              field.onBlur(); 
                                            }
                                          }}
                                        >
                                          <SelectTrigger className="w-full cursor-pointer border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-left">
                                            <SelectValue placeholder="Selecciona el tipo de pago" />
                                          </SelectTrigger>
                                          <SelectContent className="min-w-[var(--radix-select-trigger-width)] max-h-60">
                                            {dataTipoRemuneracionList.map((tipo_documento: {id:number, nombre: string}) => 
                                              <SelectItem 
                                                key={tipo_documento.id} 
                                                value={tipo_documento.id.toString()}
                                                className="pl-2 pr-4"
                                              >
                                                <div className="flex items-center gap-2 min-w-0">
                                                  <div className="flex-shrink-0 w-3 h-3 bg-blue-400 rounded-full"></div>
                                                  <span className="truncate">{tipo_documento.nombre}</span>
                                                </div>
                                              </SelectItem>
                                            )}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    )}
                                  />
                                }

                                {errors.tipo_remuneracion && (
                                  <p className="text-red-400 text-sm">{errors.tipo_remuneracion.message as string}</p>
                                )}
                            </div>

                      
                          {/* MONTO SALARIO */}
                          <div className="space-y-2">
                            <Label htmlFor="salario" className="text-gray-700 font-medium">
                              Monto Salario *
                            </Label>
                            <Input
                              id="salario"
                              autoComplete="salario"
                              disabled={tipoRemuneracionSelected?.nombre === 'Comisión' || tipoRemuneracionSelected?.nombre === 'Comision'}
                              placeholder="Monto salario"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              {...register('salario', {
                                      validate: (value) => {
                                        if (tipoRemuneracionSelected?.nombre === 'Comisión' || tipoRemuneracionSelected?.nombre === 'Comision') {
                                          return true; // ✅ No validar si está deshabilitado
                                        }
                                        if (!value || !value.toString().trim()) {
                                          return 'Este campo es requerido';
                                        }
                                        if (value.length < 5) {
                                          return 'El monto debe tener mínimo 5 dígitos';
                                        }
                                        return true;
                                      }
                                    })}
                            />
                            <div>
                              {errors.salario && (
                                    <span className="text-red-400 text-sm">{errors.salario.message as string}</span>
                                  )}
                            </div>
                          </div>

                          <div className="space-y-2">
                          <Label htmlFor="porcentaje_comision" className="text-gray-700 font-medium">
                            Porcentaje Comision *
                          </Label>
                          <Input
                            id="porcentaje_comision"
                            autoComplete="porcentaje_comision"
                            placeholder="Porcentaje comision"
                            disabled={tipoRemuneracionSelected?.nombre === "Salario fijo"}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            {...register('porcentaje_comision', {
                                      validate: (value) => {
                                        if (tipoRemuneracionSelected?.nombre === 'Salario fijo') {
                                          return true; // ✅ No validar si está deshabilitado
                                        }
                                        if (!value || !value.toString().trim()) {
                                          return 'Este campo es requerido';
                                        }
                                        if (value.length > 2) {
                                          return 'El porcentaje debe tener como maximo 2 digitos';
                                        }
                                        return true;
                                      }
                                    })}
                          />
                          <div>
                            {errors.porcentaje_comision && (
                                    <span className="text-red-400 text-sm">{errors.porcentaje_comision.message as string}</span>
                                  )}
                          </div>
                          </div>

                          <div className="space-y-2">
                              <Label htmlFor="fecha_ingreso" className="text-gray-700 font-medium">
                                  Fecha de Ingreso *
                              </Label>
                              <Input
                                id="fecha_ingreso"
                                type="date"
                                autoComplete="fecha_ingreso"
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                {...register('fecha_ingreso', {
                                required: true, 
                                validate: {blankSpace: (value) => !!value.trim()},})}
                              />
                              <div>
                                {(errors?.fecha_ingreso?.type === 'required' || errors?.fecha_ingreso?.type === 'blankSpace') && <span className='text-red-400 text-sm'>Este campo es requerido</span>}
                              </div>
                          </div>

                          {/* LISTADO DE CARGOS */}
                          <div className="space-y-2 mi-select-wrapper">
                            <Label htmlFor="puesto" className="text-gray-700 font-medium">
                              Cargo / Función *
                            </Label>

                            {isFetchingPuestos &&
                            <Select>
                              <SelectTrigger className="cursor-pointer border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 w-46 flex">
                                <div className="w-full flex items-center justify-center">
                                  <Loader2Icon className="animate-spin w-6 h-6 text-gray-300"/>
                                </div>
                              </SelectTrigger>
                            </Select>
                            }
                            {!isFetchingPuestos && 
                              <>
                                <div className="space-y-2">
                                  <GenericSearchSelect
                                    dataList={dataPuestosList}
                                    value={selectedPuestosID}
                                    onValueChange={setSelectedPuestosID}
                                    handleDataNoSeleccionada={handleDataNoSeleccionada}
                                    placeholder="Selecciona el cargo..."
                                    labelKey="nombre"
                                    valueKey="id"
                                  />
                              </div>
                              </>
                            }

                              {puestoNoSeleccionada === false && (
                                <p className="text-red-400 text-sm">Este campo es requerido</p>
                              )}
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
                                Crear Empleado  
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
                          <CardTitle className="text-blue-900">Lista de Empleado</CardTitle>
                          <CardDescription className="text-blue-700">
                            Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} empleados
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
                            placeholder="Buscar por nombre, apellido, razon social, documento o teléfono..."
                            value={nombreABuscar}
                            onChange={(e) => setNombreABuscar(e.target.value)}
                            className="pl-10 w-full border-gray-300 focus:border-blue-500"
                          />
                        </div>

                        {/* <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Buscar por razon social..."
                            value={razonSocialABuscar}
                            onChange={(e) => setRazonSocialABuscar(e.target.value)}
                            className="pl-10 w-72 border-gray-300 focus:border-blue-500"
                          />
                        </div> */}

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

                    <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-blue-200 w-full flex-wrap">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-gray-600 font-medium">Fecha Ingreso desde:</Label>
                        <Input
                          type="date"
                          value={filtros.fecha_desde}
                          onChange={(e) => setFiltros({...filtros, fecha_desde: e.target.value})}
                          className="w-40 border-blue-200 focus:border-blue-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-gray-600 font-medium">Fecha Ingreso hasta:</Label>
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
                        <TableHead className="font-semibold text-gray-700">Tipo</TableHead>
                        <TableHead className="font-semibold text-gray-700">Información</TableHead>
                        <TableHead className="font-semibold text-gray-700">Contacto</TableHead>
                        <TableHead className="font-semibold text-gray-700">Documento</TableHead>
                        <TableHead className="font-semibold text-gray-700">Puesto</TableHead>
                        <TableHead className="font-semibold text-gray-700">Remuneración</TableHead>
                        {/* <TableHead className="font-semibold text-gray-700">Genero</TableHead> */}
                        <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                        {/* <TableHead className="font-semibold text-gray-700">Uso</TableHead> */}
                        {/* <TableHead className="font-semibold text-gray-700">Prioridad</TableHead> */}
                        <TableHead className="font-semibold text-gray-700">Fecha Registro</TableHead>
                        <TableHead className="font-semibold text-gray-700">Fecha Ingreso</TableHead>
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
                      {!isFetching && dataList.length > 0 && siTienePermiso("empleados", "leer") && dataList.map((data: Empleado) => (
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
                            <Badge
                              className={tipoPersonaColores[`${data?.persona?.tipo}`]}
                            >
                              {data.persona.tipo === 'fisica' ? 
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
                                {capitalizePrimeraLetra(data?.persona?.tipo === 'fisica' ? getNombreCompleto(data?.persona?.nombre, data?.persona?.apellido) : ((data?.persona as PersonaJuridica)?.razon_social ?? ''))}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{capitalizePrimeraLetra((data?.persona as PersonaFisica)?.nacionalidad?.nombre ?? '')}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900 truncate max-w-xs">{data?.persona?.email}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{data?.persona?.telefono}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <Badge className='bg-blue-100 text-blue-700 border-blue-200'>
                                {data?.persona?.tipo_documento.nombre}
                              </Badge>
                              <div className="text-sm text-gray-500 mt-1">{data.persona?.documento}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm text-gray-500 mt-1 truncate max-w-xs">{data?.puesto?.nombre}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <Badge className={`${data?.tipo_remuneracion?.nombre === 'Comisión' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                          (data?.tipo_remuneracion?.nombre === 'Mixto' ? 'bg-purple-100 text-purple-700 border-purple-200': 'bg-green-100 text-green-700 border-green-200')
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

                          {/* <TableCell>
                            {data?.persona?.tipo === 'fisica' ? 
                             <div>
                              <Badge className={`${genderColors[`${data?.persona?.sexo ?? 'M'}`]}`}>{data.persona?.sexo === 'F'? 'Femenino': 'Masculino'}</Badge>
                            </div>: '-'}
                            
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
                                {formatearFecha(data.fecha_ingreso, false)}
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
                                {siTienePermiso("empleados", "leer") &&
                                  <DropdownMenuItem className="hover:bg-blue-50 cursor-pointer"
                                    onClick={() => handleVerDetalles(data)}>
                                    <Eye className="h-4 w-4 mr-2 text-blue-500" />
                                    Ver detalles
                                  </DropdownMenuItem>
                                }
                                {siTienePermiso("empleados", "modificar") &&
                                <DropdownMenuItem className="hover:bg-emerald-50 cursor-pointer" onClick={() => handleEditar(data)}>
                                  <Edit className="h-4 w-4 mr-2 text-emerald-500" />
                                  Editar
                                </DropdownMenuItem>
                                }

                                {siTienePermiso("empleados", "modificar") && 
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
