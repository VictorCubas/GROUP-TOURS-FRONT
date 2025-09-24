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
import Flatpickr from "react-flatpickr"; 


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Distribuidora, Moneda, Paquete, RespuestaPaginada, SalidaPaquete, TipoPaquete, } from "@/types/paquetes"
import { capitalizePrimeraLetra, formatearFecha, formatearSeparadorMiles, getDaysBetweenDates, quitarAcentos } from "@/helper/formatter"
import { activarDesactivarData, fetchData, fetchResumen, guardarDataEditado, nuevoDataFetch, fetchDataTiposPaquetesTodos, fetchDataDistribuidoraTodos, fetchDataServiciosTodos, fetchDataMonedaTodos } from "@/components/utils/httpPaquete"
import {Controller, useForm } from "react-hook-form"
import { queryClient } from "@/components/utils/http"
import { ToastContext } from "@/context/ToastContext"
import Modal from "@/components/Modal"
import { IoCheckmarkCircleOutline, IoWarningOutline } from "react-icons/io5";
import ResumenCardsDinamico from "@/components/ResumenCardsDinamico"
import { GenericSearchSelect } from "@/components/GenericSearchSelect"
import { useSessionStore } from "@/store/sessionStore"
import placeholderViaje from "@/assets/paquete_default.png";
import { fetchDataDestinosTodos } from "@/components/utils/httpDestino"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getPayload } from "@/helper/paquete"

let dataList: Paquete[] = [];
let tipoPaqueteFilterList: any[] = [];

export default function ModulosPage() {
  const {siTienePermiso} = useSessionStore();
  // const [setSearchTerm] = useState("")
  const [imagePreview, setImagePreview] = useState<string | undefined>(placeholderViaje);
  const [selectedDestinoID, setSelectedDestinoID] = useState<number | "">("");
  const [destinoNoSeleccionada, setDestinoNoSeleccionada] = useState<boolean | undefined>();
  const [nombreABuscar, setNombreABuscar] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [dataAEditar, setDataAEditar] = useState<Paquete>();
  const [dataADesactivar, setDataADesactivar] = useState<Paquete>();
  const [onDesactivarData, setOnDesactivarData] = useState(false);
  const [onVerDetalles, setOnVerDetalles] = useState(false);
  const [tipoPaqueteSelected, setTipoPaqueteSelected] = useState<TipoPaquete>();
  const [distribuidoraSelected, setDistribuidoraSelected] = useState<Distribuidora>();
  const [permissionSearchTerm, setPermissionSearchTerm] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])
  const [dataDetalle, setDataDetalle] = useState<Paquete>();
   const [viewMode, setViewMode] = useState<"table" | "cards">("table")
  const {handleShowToast} = use(ToastContext);
  const [onGuardar, setOnGuardar] = useState(false);
  
  const [filtros, setFiltros] = useState({
                  activo: true,   // null = todos, true = solo activos
                  fecha_desde: "",
                  fecha_hasta: "",
                  nombre: "",
                  tipo_paquete: "all",                      // fisica | juridica | all
                  tipo_propiedad: "all",  
                });
  
  // DATOS DEL FORMULARIO 
  const {control,trigger,  register, watch, handleSubmit, setValue, formState: {errors, },clearErrors, reset} = 
            useForm<any>({
              mode: "onBlur",
              defaultValues: {
                distribuidora_id: '',
                propio: true,
                personalizado: false,
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

  // DATOS DE SALIDOS


  // const {control,trigger,  register, watch, handleSubmit, setValue, formState: {errors, },clearErrors, reset} = 
  const {
    control: controlSalida,
    register: registerSalida,
    handleSubmit: handleSubmitSalida,
    setValue: setValueSalida,
    formState: { errors: errorsSalida },
    reset: resetSalida,
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      precio: '',
      senia: '',
      fecha_salida_v2: '',
      fecha_regreso_v2: '',
      cupo: '',
    },
  });

  const [nuevaSalida, setNuevaSalida] = useState({
      fecha_salida_v2: "",
      fecha_regreso_v2: "",
      precio: '',
      senia: '',
      cupo: "",
    })

    const [salidas, setSalidas] = useState<any[]>([])
    const [isEditMode, setIsEditMode] = useState(false)
    const [editingSalidaId, setEditingSalidaId] = useState<string | null>(null);
    const [isAddRoomOpen, setIsAddSalidaOpen] = useState(false);
    // DATOS DE SALIDOS
   
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

  // let filteredPermissions: Modulo[] = [];


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
        setSelectedPermissions([])
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
        // setNewDataPersonaList([...dataPersonaList])
        setImagePreview(placeholderViaje);
        setSalidas([]);
        reset({
            nombre: '',
            tipo_paquete: '',
            precio: '',
            senia: '',
            fecha_salida: '',
            fecha_regreso: '',
            distribuidora_id: '',
            imagen: '',
            moneda: ''
        });


        // setTipoDePersonaCreacion(undefined);
        // setTipoPaqueteSelected(undefined);
        // setDistribuidoraSelected(undefined);
        
        setActiveTab('list');
  }


  const handleGuardarNuevaData = async (dataForm: any) => {
    console.log(selectedPermissions)
    const prePayload = getPayload(salidas, dataForm, watch("propio"), selectedDestinoID, selectedPermissions)

    if (destinoNoSeleccionada === undefined || !prePayload.destino_id) {
      console.log('destino no seleccionado...')
      setDestinoNoSeleccionada(true);
      return;
    }


    if(selectedPermissions.length === 0){
      handleShowToast('Debes agregar al menos un servicio', 'error');
      return;
    }

    const formData = new FormData();

    // 🔹 Imagen opcional
    if (dataForm.imagen && dataForm.imagen[0] instanceof File) {
      formData.append("imagen", dataForm.imagen[0]);
    }


    if(salidas.length === 0 && !watch('personalizado') 
      && quitarAcentos(tipoPaqueteSelected?.nombre ?? '')?.toLocaleLowerCase() === 'terrestre'){
      handleShowToast('Debes agregar al menos una salida', 'error');
      return;
    }

    // Agregar el resto de campos
    Object.keys(prePayload).forEach((key) => {
      const value = prePayload[key];
      if (value !== undefined && value !== null) {
        if (key === "salidas") {
          // 👇 Serializamos el array de objetos
          console.log(JSON.stringify(value))
          formData.append(key ,JSON.stringify(value));
        }else if (Array.isArray(value)) {
          value.forEach((v) => formData.append(key, v));
        } else {
          formData.append(key, value);
        }
      }
    });

    console.log("FormData listo:", [...formData.entries()]);
    mutate(formData);
  };



  const handleGuardarDataEditado = async (dataForm: any) => {
    const fecha_inicio = dataForm.fecha_salida ? formatearFechaDDMMYY(dataForm.fecha_salida) : null;
    const fecha_fin = dataForm.fecha_regreso ? formatearFechaDDMMYY(dataForm.fecha_regreso) : null;

    console.log(salidas)

    const salidasTemp = salidas.map((salida: any) => ({
      fecha_salida: salida.fecha_salida_v2,
      fecha_regreso: salida.fecha_regreso_v2,
      precio_actual: salida.precio,
      senia: salida.senia,
      cupo: parseInt(salida.cupo, 10), // Entero
      moneda_id: dataForm.moneda,
      temporada_id: salida?.temporada_id || null, // Opcional
    }))


    console.log(salidasTemp)

    const payload = {
      ...dataForm,
      destino_id: selectedDestinoID,
      tipo_paquete_id: tipoPaqueteSelected?.id,
      servicios_ids: selectedPermissions,
      moneda_id: dataForm.moneda,
      fecha_inicio,
      fecha_fin,
      salidas: salidasTemp
    };

    // Limpiar campos que no deben enviarse
    delete payload.numero;
    delete payload.tipo_paquete;
    delete payload.destino;
    delete payload.moneda;
    delete payload.servicios;
    delete payload.fecha_regreso;
    delete payload.fecha_salida;
    delete payload.distribuidora;

    if (watch("propio")) {
      delete payload.distribuidora_id;
    } else {
      delete payload.cantidad_pasajeros;
    }


    if(salidas.length === 0){
      handleShowToast('Debes agregar al menos una salida', 'error');
      return;
    }


    const formData = new FormData();

    // ✅ Agregar imagen solo si es nueva (File)
    if (
      dataForm.imagen &&
      dataForm.imagen.length > 0 &&
      dataForm.imagen[0] instanceof File
    ) {
      formData.append("imagen", dataForm.imagen[0]);
    }

    // Agregar el resto de campos
    Object.entries(payload).forEach(([key, value]) => {
      if (key === 'imagen' || key === 'imagen_url') {
        if (value instanceof File) {
          formData.append(key, value);
        }
      } 
      else if (key === "salidas") {
        // 👇 Serializamos el array de objetos
        console.log(JSON.stringify(value))
        formData.append(key ,JSON.stringify(value));
      }
      else if (Array.isArray(value)) {
        value.forEach((v) => formData.append(key, v));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value as any);
      }
    });

    console.log("FormData listo:", [...formData.entries()]);
    // Debug para ver lo que se envía
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    mutateGuardarEditado({
        data: formData,
        paqueteId: payload.id
      });
  };




  function formatearFechaDDMMYY(fecha: string): string {
    // Verifica si la fecha contiene "/" y coincide con el patrón DD/MM/YYYY
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;

    if (regex.test(fecha)) {
      const [dia, mes, anio] = fecha.split("/");
      // Retorna en formato YYYY-MM-D (quitando ceros a la izquierda del día)
      return `${anio}-${mes}-${parseInt(dia, 10)}`;
    }

    // Si no cumple el formato esperado, devuelve la misma fecha
    return fecha;
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


  const handleEditar = (data: Paquete) => {
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
  //   senia: 0,
  //   fecha_inicio: null,
  //   fecha_fin: null,
  //   personalizado: true,
  //   cantidad_pasajeros: null,
  //   propio: false,
  //   activo: true,
  //   imagen: null,
  //   imagen_url: null,
  //   fecha_creacion: '2025-09-09T10:49:05+0000',
  //   fecha_modificacion: '2025-09-09T10:49:05+0000',
  //   numero: 1
  // }

  const servicios_ids = data.servicios.map(servicio => servicio.id);
    console.log('data: ', data)
    setActiveTab('form');
    setDataAEditar(data);
    

    //COMENTADO TEMPORALMENTE
      setSelectedDestinoID(data!.destino.id)
      // setSelectedPersonaID(data!.persona.id)
      setTipoPaqueteSelected(data!.tipo_paquete)
      setDistribuidoraSelected(data!.distribuidora);
      setSelectedPermissions(servicios_ids);

    const salidas = data.salidas.map((salida: SalidaPaquete) => ({
      id: salida.id,
      fecha_salida_v2: salida.fecha_salida,
      fecha_regreso_v2: salida.fecha_regreso,
      moneda: salida.moneda.id,
      precio: salida.precio_actual,
      senia: salida.senia,
      cupo: salida.cupo,
    }))

    setSalidas(salidas);
  }

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

  useEffect(() => {
    const handler = setTimeout(() => {
      console.log('cambiando nombre')
      setFiltros(filtroAnterior => ({...filtroAnterior, nombre: nombreABuscar}))
    }, 750) // ⏱️ medio segundo de espera

    return () => {
      clearTimeout(handler) // limpia el timeout si se sigue escribiendo
    }
  }, [nombreABuscar]);

  const handleDestinoNoSeleccionada = (value: boolean | undefined) => {
    setDestinoNoSeleccionada(value);
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
    if (tipoPaqueteSelected?.nombre === 'Comision' || tipoPaqueteSelected?.nombre === 'Comisión') {
      setValue("salario", "");
      clearErrors("salario");
    }else if (tipoPaqueteSelected?.nombre === 'Salario fijo') {
      setValue("porcentaje_comision", "");
      clearErrors("porcentaje_comision");
    }
  }, [tipoPaqueteSelected, setValue, clearErrors]);


  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions((prev) => {
      const updated =
        prev.includes(permissionId)
          ? prev.filter((p) => p !== permissionId) // quitar
          : [...prev, permissionId];              // agregar

      return updated;
    });
  };


  // FUNCIONES DE SALIDAS

   const handleOpenModal = () => {
    const monedaValue = watch('moneda');
    if (!monedaValue) {
      handleShowToast('Debes seleccionar primero la moneda', 'error');
      return;
    }
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

  const handleAddSalida = async (dataForm: any) => {

    console.log(dataForm);
    console.log(nuevaSalida);

  

    console.log(isEditMode);
    console.log(editingSalidaId);

    if (isEditMode && editingSalidaId) {
      // 🔹 Editando habitación existente
      const salidaEdited = {...dataForm, currency: watch('moneda')};
      console.log(salidaEdited)
      setSalidas((prev) =>
        prev.map((salida) =>
          salida.id === editingSalidaId
            ? { ...salida, ...salidaEdited, senia: salidaEdited.senia } // Reemplazamos los valores con los del formulario
            : salida
        )
      );
    } else {
      // 🔹 Agregando nueva habitación

  //   {
  //   precio: '2000',
  //   senia: '250',
  //   fecha_salida_v2: '2025-09-23',
  //   fecha_regreso_v2: '2025-09-27',
  //   cupo: '34'
  // }
    
      console.log(nuevaSalida);
      console.log(dataForm)
      const salida: any = {
        id: Date.now().toString(), // ID temporal
        ...dataForm,
        currency: watch('moneda'), // o nuevaSalida.currency
      };

      console.log(salida)
      setSalidas((prev) => {
        console.log(prev)
        return [...prev, salida]
      });
    }

    // Resetear formulario
    resetSalidaForm();
  };

  const handleDeleteRoom = (roomId: string) => {
    setSalidas((prev) => prev.filter((salida) => salida.id !== roomId))
  }

  const resetSalidaForm = () => {
    setNuevaSalida({
      fecha_salida_v2: "",
      fecha_regreso_v2: "",
      precio: '',
      senia: '',
      cupo: "",
    })

    resetSalida({
      precio: '',
      senia: '',
      fecha_salida_v2: '',
      fecha_regreso_v2: '',
      cupo: '',
    });
    setIsAddSalidaOpen(false);
    setIsEditMode(false);
    setEditingSalidaId(null);
  }
  
    //   {
  //   id: 2,
  //   fecha_salida_v2: '2025-09-21',
  //   moneda: 2,
  //   precio: 2000,
  //   cupo: 45
  // }

  const handleEditSalida = (salida: any) => {
    console.log(salida);
    // Cargamos los valores en el state que controla los <Input />
    setNuevaSalida({
      fecha_salida_v2: salida.fecha_salida_v2,
      // si no tienes fecha_regreso aún, usa cadena vacía para <input type="date" />
      fecha_regreso_v2: salida.fecha_regreso_v2 ?? '',
      precio: salida.precio,
      cupo: salida.cupo,
      senia: salida?.senia ?? '',
      // moneda: salida.moneda,
    });

    resetSalida({
      ...salida
    })

    setEditingSalidaId(salida.id);
    setIsEditMode(true);
    setIsAddSalidaOpen(true);

    // Si usas react-hook-form u otro Controller, setea también el value del select/Controller
    setValue('moneda', salida.moneda.toString());
  };

    // FUNCIONES DE SALIDAS

  return (
    <>
       {onVerDetalles && <Modal onClose={handleCloseVerDetalles} claseCss={'mdsdsodal-detalles'}>
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 rounded-xl shadow-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto backdrop-blur-sm">
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
                      <div className="flex items-center text-white/90 text-lg">
                        <MapPin className="w-5 h-5 mr-2" />
                        <span>{dataDetalle?.destino.ciudad}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-5xl font-bold text-white mb-1">{dataDetalle?.moneda.simbolo}{formatearSeparadorMiles.format(dataDetalle?.precio ?? 0)}</div>
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
                          <h3 className="text-xl font-semibold text-gray-900 mb-4">Fechas del Viaje</h3>
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
                                  day: 'numeric' 
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
                                  day: 'numeric' 
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

                {/* Servicios incluidos y excluidos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3" />
                      Servicios Incluidos
                    </h3>
                    <div className="space-y-4 max-h-60 overflow-y-auto">
                      
                      {[...dataDetalle!.servicios].map((item, index) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            {index === 0 && <Hotel className="w-3 h-3 text-green-600" />}
                            {index === 1 && <Car className="w-3 h-3 text-green-600" />}
                            {index === 2 && <Users className="w-3 h-3 text-green-600" />}
                            {index > 2 && <div className="w-2 h-2 bg-green-600 rounded-full" />}
                          </div>
                          <div>
                            <p className="font-medium text-green-900">{item.nombre}</p>
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

        </Modal>}

       {onDesactivarData && <Modal onClose={handleCloseModal} claseCss="modal">
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
        </Modal>}

      <div className="max-w-7xl mx-auto space-y-8">
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
              {siTienePermiso("paquetes", "exportar") &&
                <Button
                  variant="outline"
                  className="border-emerald-200 text-emerald-700 cursor-pointer hover:bg-emerald-50 bg-transparent"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              }

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
                                <div className="space-y-2">
                                  <GenericSearchSelect
                                    dataList={dataDestinoList}
                                    value={selectedDestinoID}
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

                          <div className="space-y-2 flex items-center justify-center gap-20">
                            <Controller
                                name="propio"
                                control={control}
                                defaultValue={false}
                                render={({ field }) => {
                                  const isDisabled =
                                    quitarAcentos(tipoPaqueteSelected?.nombre.toLowerCase() ?? "") ===
                                    "aereo";

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
                                    id="personalizado"
                                    checked={field.value}
                                    onCheckedChange={(checked) => field.onChange(!!checked)}
                                    className="cursor-pointer border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 data-[state=checked]:text-white"
                                  />
                                  <Label htmlFor="personalizado" className="cursor-pointer">Personalizado</Label>
                                </div>
                              )}
                            />
                          </div>


                          {/* CANTIDAD PASAJEROS */}
                          {watch("propio")  && 
                            <div className="space-y-2">
                              <Label htmlFor="cantidad_pasajeros" className="text-gray-700 font-medium">
                                Cantidad de pasajeros *
                              </Label>
                              <Input
                                id="cantidad_pasajeros"
                                autoComplete="cantidad_pasajeros"
                                placeholder="Ingrese la cantidad de pasajeros"
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                          { !watch("propio") && 
                            <div className="space-y-2">
                              <Label htmlFor="distribuidora_id" className="text-gray-700 font-medium">
                                Distribuidora *
                              </Label>

                              {isFetchingDistribuidora && (
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

                              {!isFetchingDistribuidora && 
                                <Controller
                                  name="distribuidora_id"
                                  control={control}
                                  rules={{ required: "Este campo es requerido" }}
                                  render={({ field }) => (
                                    <div className="w-full min-w-0 select-container"> {/* Contenedor para controlar el layout */}
                                      <Select
                                        value={field.value}
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

                                
                                {selectedPermissions.length > 0 && (
                                  <div className="flex items-center gap-2 mb-3">
                                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                      {selectedPermissions.length} servicios seleccionados
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

                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4 w-full">
                                  {isFetchingServicios && <div className="w-full flex items-center justify-center">
                                    <Loader2Icon className="animate-spin w-10 h-10 text-gray-300"/>
                                  </div>}

                                  {!isFetchingServicios && dataServiciosList && dataServiciosList
                                      .filter((servicio: any) => 
                                        
                                        servicio.nombre.toLowerCase().includes(permissionSearchTerm.toLowerCase())
                                      
                                      )
                                      .map((servicio: any) => (
                                        <div
                                          key={servicio.id}
                                          className={`relative cursor-pointer duration-200 hover:shadow-sm flex 
                                                    items-start p-3 rounded-lg hover:bg-gray-50 transition-colors
                                                    border border-gray-200
                                                    ${selectedPermissions.includes(servicio.id) 
                                                      ? 'ring-2 ring-blue-200 bg-blue-50/50 border-blue-200' 
                                                      : ''}`}
                                        >
                                          <div className="flex items-start w-full">
                                            <div className="flex-shrink-0 mr-3 mt-0.5">
                                              <Checkbox
                                                id={`servicio-${servicio.id}`}
                                                checked={selectedPermissions.includes(servicio.id)}
                                                onCheckedChange={() => handlePermissionToggle(servicio.id)}
                                              />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <Label
                                                htmlFor={`servicio-${servicio.id}`}
                                                className="text-sm font-medium text-gray-900 cursor-pointer block"
                                              >
                                                {servicio.nombre}
                                              </Label>
                                              <p className="text-xs text-gray-500 mt-1">{servicio.descripcion}</p>
                                            </div>
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
                                        selectedPermissions.includes(p.id),
                                      )

                                      console.log('allFilteredSelected: ', allFilteredSelected )

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
                                    {dataServiciosList && dataServiciosList
                                      .filter(
                                        (servicio: any) =>
                                          servicio.nombre.toLowerCase().includes(permissionSearchTerm.toLowerCase())
                                      )
                                      .every((p: any) => selectedPermissions.includes(p.id))
                                      ? "Deseleccionar todos"
                                      : "Seleccionar todos"}{" "}
                                    
                                  </Button>

                                  {onGuardar && selectedPermissions.length ===0 && <span className='text-red-400 text-sm'>Debes seleccinar al menos un servicio</span>}
                                </div>

                                {quitarAcentos(tipoPaqueteSelected?.nombre ?? '')?.toLowerCase() === 'terrestre' && 
                                   <Card className="mt-8">
                                    <CardHeader>
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <CardTitle>Gestión de Salidas</CardTitle>
                                          <CardDescription>Administre las salidas y sus tarifas</CardDescription>
                                          {onGuardar && 
                                            quitarAcentos(tipoPaqueteSelected?.nombre ?? '').toLowerCase() === 'terrestre' &&
                                            !watch('personalizado')
                                            && 
                                            salidas.length === 0 &&
                                            <p className="text-red-400">Debes agregar al menos una salida</p>
                                          }
                                        </div>
                                        <Dialog 
                                        open={isAddRoomOpen}
                                          onOpenChange={(open) => {
                                            if (!open) resetSalidaForm()
                                            setIsAddSalidaOpen(open)
                                          }}
                                        >
                                           {/* <DialogTrigger asChild> */}
                                                <Button
                                                  type="button"
                                                  className="bg-emerald-500 hover:bg-emerald-600 cursor-pointer"
                                                  onClick={handleOpenModal} // 👈 validación antes de abrir
                                                >
                                                  <Plus className="h-4 w-4 mr-2" />
                                                  Agregar Salidas
                                                </Button>
                                            {/* </DialogTrigger> */}
                                          <DialogContent className="sm:max-w-[650px]">
                                            <form id="salidaForm" 
                                             onSubmit={(e) => {
                                                  e.stopPropagation(); // evita que el submit burbujee al form padre
                                                  handleSubmitSalida(handleAddSalida)(e);
                                                }}>
                                              <DialogHeader>
                                                <DialogTitle>Agregar Nueva Salida</DialogTitle>
                                                <DialogDescription>
                                                  Complete los datos de la nueva salida para agregarla al al paquete.
                                                </DialogDescription>
                                              </DialogHeader>
                                              <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-2 items-center gap-4">
                                                  <div className="grid grid-cols-4 items-center gap-4">
                                                      <Label className="text-sm text-gray-600 font-medium">Fecha Salida *</Label>
                                                        <Input
                                                          type="date"
                                                          id="fecha_salida_v2"
                                                          {...registerSalida('fecha_salida_v2', { required: true })}
                                                          className={`flex-1 w-40 ${errorsSalida?.fecha_salida_v2?.type === 'required' ? 
                                                              'border-2 border-red-200 focus:border-red-500': 'border-2 border-blue-200 focus:border-blue-500'}`}
                                                        />
                                                  </div>
                                                  <div className="grid grid-cols-4 items-center gap-4">
                                                      <Label className="text-sm text-gray-600 font-medium">Fecha Regreso *</Label>
                                                        <Input
                                                          type="date"
                                                          id="fecha_regreso_v2"
                                                          {...registerSalida('fecha_regreso_v2', {
                                                            required: true, 
                                                          })
                                                          }
                                                          className={`flex-1 w-40  ${errorsSalida?.fecha_regreso_v2?.type === 'required' ? 
                                                              'border-2 border-red-200 focus:border-red-500': 'border-2 border-blue-200 focus:border-blue-500'}`}
                                                        />
                                                  </div>
                                                </div>

                                                <div className="grid grid-cols-2 items-center gap-4">
                                                  <div className="grid grid-cols-4 items-center gap-4">
                                                      <Label htmlFor="precio" className="text-right">
                                                        Precio * 
                                                      </Label>
                                                      <div className="col-span-3 flex gap-2">
                                                          <Input
                                                            id="precio"
                                                            type="text"
                                                            {...registerSalida('precio', {
                                                              required: true, 
                                                              })
                                                            }
                                                            placeholder="2000"
                                                            className={`flex-1 ${errorsSalida?.precio?.type === 'required' ? 
                                                                'border-2 border-red-200 focus:border-red-500': 'border-2 border-blue-200 focus:border-blue-500'}`}
                                                          />
                                                      </div>
                                                  </div>

                                                  {/* MONTO SEÑA */}
                                                  <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="senia" className="text-gray-700 font-medium">
                                                      Seña *
                                                    </Label>
                                                    <div className="col-span-3 flex gap-2">
                                                      <Input
                                                        id="senia"
                                                        type="text"
                                                        {...registerSalida('senia', {
                                                            required: true, })
                                                          }
                                                          placeholder="150"
                                                          className={`flex-1 ${errorsSalida?.senia?.type === 'required' ? 'border-2 border-red-200 focus:border-red-500':
                                                              'border-2 border-blue-200 focus:border-blue-500'}`}
                                                      />
                                                    </div>
                                                    
                                                  </div>  

                                                  <div className="grid grid-cols-4 items-center gap-4">
                                                      <Label htmlFor="cupo" className="text-right">
                                                        Cupo * 
                                                      </Label>
                                                      <div className="col-span-3 flex gap-2">
                                                          <Input
                                                            id="cupo"
                                                            type="text"
                                                            {...registerSalida('cupo', { required: true })}
                                                            placeholder="46"
                                                            className={`flex-1 ${errorsSalida?.cupo?.type === 'required' ? 'border-2 border-red-200 focus:border-red-500': 
                                                              'border-2 border-blue-200 focus:border-blue-500'}`}
                                                          />
                                                      </div>
                                                  </div>
                                                </div>
                                              
                                              </div>
                                              <DialogFooter>
                                                <Button type="button" variant="outline" className="cursor-pointer" 
                                                    onClick={resetSalidaForm}
                                                    >
                                                  Cancelar
                                                </Button>
                                                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 cursor-pointer"
                                                    >
                                                      Agregar Salida
                                                </Button>
                                              </DialogFooter>
                                              </form>
                                            </DialogContent>
                                        </Dialog>
                                      </div>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="rounded-md border">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>Fecha Salida</TableHead>
                                              <TableHead>Fecha Regreso</TableHead>
                                              <TableHead>Precio</TableHead>
                                              <TableHead>Seña</TableHead>
                                              <TableHead>Cupo</TableHead>
                                              <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {salidas.map((salida: any) => (
                                              <TableRow key={salida.id}>
                                                <TableCell className="font-medium">{formatearFecha(salida.fecha_salida_v2, false)}</TableCell>
                                                <TableCell>{salida.fecha_regreso_v2}</TableCell>
                                                <TableCell>{formatearSeparadorMiles.format(salida.precio)}</TableCell>
                                                <TableCell>{formatearSeparadorMiles.format(salida.senia)}</TableCell>
                                                <TableCell>
                                                  {salida.cupo}
                                                  {/* {dataMonedaList.filter((moneda: Moneda) => moneda.id == salida.currency)[0].simbolo } ({dataMonedaList.filter((moneda: Moneda) => moneda.id == salida.currency)[0].codigo }) */}
                                                </TableCell>
                                                
                                                <TableCell className="text-right">
                                                  <div className="flex items-center justify-end gap-2">
                                                    <Button type="button" variant="ghost" size="sm" 
                                                          onClick={() => handleEditSalida(salida)}
                                                          > 
                                                      <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      className="text-destructive hover:text-destructive"
                                                      onClick={() => handleDeleteRoom(salida.id)}
                                                    >
                                                      <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                  </div>
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </CardContent>
                                  </Card>
                                }
                                
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
                          <TableHead className="font-semibold text-gray-700">Información</TableHead>
                          <TableHead className="font-semibold text-gray-700">Tipo</TableHead>
                          <TableHead className="font-semibold text-gray-700">Destino</TableHead>
                          <TableHead className="font-semibold text-gray-700">Precio</TableHead>
                          {/* <TableHead className="font-semibold text-gray-700">Tipo</TableHead> */}
                          <TableHead className="font-semibold text-gray-700">Fechas</TableHead>
                          <TableHead className="font-semibold text-gray-700">Propiedad</TableHead>
                          {/* <TableHead className="font-semibold text-gray-700">Genero</TableHead> */}
                          <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                          {/* <TableHead className="font-semibold text-gray-700">Uso</TableHead> */}
                          {/* <TableHead className="font-semibold text-gray-700">Prioridad</TableHead> */}
                          <TableHead className="font-semibold text-gray-700">Pasajeros</TableHead>
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

                            <TableCell>
                              {/* <div className="flex items-center gap-3"> */}
                              <div className="flex items-center gap-3 font-medium text-gray-900 max-w-6xl">
                                <img
                                    src={data.imagen || placeholderViaje}
                                    alt={data.nombre || "Imagen de paquete de viaje"}
                                    className="w-12 h-12 rounded-lg object-cover"
                                />
                                <div>
                                  <div className="font-medium text-gray-900 font-sans">{data.nombre}</div>
                                  <div className="text-sm text-gray-500 font-sans">
                                    {data.personalizado ? "Personalizado" : "Fechas fijas"}
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
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

                            <TableCell>
                              <div>
                                <div className="font-medium text-gray-900 truncate max-w-xs">{data.destino.ciudad}</div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">{data.destino.pais}</div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div>
                                <div className="font-medium text-green-600 truncate max-w-xs">{data.moneda.simbolo} {formatearSeparadorMiles.format(data.precio)}</div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">Seña: {data.moneda.simbolo} {formatearSeparadorMiles.format(data.senia)}</div>
                              </div>
                            </TableCell>
                            

                            <TableCell>
                                <div>
                                  {data.personalizado && !data?.fecha_inicio ?
                                    <Badge className='bg-emerald-100 text-emerald-700 border-emerald-200'>
                                        Personalizado
                                    </Badge>
                                    : <>
                                      <div className="font-medium text-gray-900 truncate max-w-xs">{formatearFecha(data?.fecha_inicio ?? '', false)}</div>
                                      <div className="text-sm text-gray-500 truncate max-w-xs">{formatearFecha(data?.fecha_fin ?? '', false)}</div>
                                    </>}
                                </div>
                            </TableCell>

                            <TableCell>
                              <div>
                                <Badge className={`border font-sans ${data.propio ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-orange-100 text-orange-700 border-orange-200'} truncate max-w-xs`}>
                                  {data.propio ? 'Propio' : 'Distruidor'}
                                </Badge>
                                {!data.propio &&  <div className="text-xs text-gray-500 mt-1 font-sans">{data?.distribuidora?.nombre}</div>}
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
                                      {formatearSeparadorMiles.format(pkg?.precio ?? 0)}
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
    </>

  )
}
