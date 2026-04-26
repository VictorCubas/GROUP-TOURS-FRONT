/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { cn } from "@/lib/utils"
import { use, useCallback, useEffect, useRef, useState } from "react"
import {
  Search,
  Check,
  X,
  Loader2Icon,
  Building2,
  User,
  UserCheck,
  Users2,
  Bed,
  AlertCircle,
  DoorOpen,
  Star,
  MapPin,
  Eye,
  Trash2,
  Plus,
  MoreHorizontal,
  Plane,
  Calendar,
  Users,
  TrendingUp,
  Download,
  Tag,
  CirclePlus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight } from "react-icons/fa"
import { FaAngleDoubleRight } from "react-icons/fa"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { PriceMode, SalidaListado, RespuestaPaginadaSalida, PasajeroSalida } from "@/types/salidas"
import { formatearFecha, formatearSeparadorMiles, quitarAcentos } from "@/helper/formatter"
import {
  fetchData,
  fetchResumen,
  nuevoDataFetch,
  desactivarSalida,
  fetchSalidaDetalle,
  fetchPasajerosSalida,
  exportarPasajerosExcel,
} from "@/components/utils/httpSalidas"
import { fetchDataPaquetes } from "@/components/utils/httpReservas"
import { fetchTiposCostoTodos } from "@/components/utils/httpTipoCosto"
import { fetchDataHoteles } from "@/components/utils/httpDestino"
import { Controller, useForm } from "react-hook-form"
import { queryClient } from "@/components/utils/http"
import { ToastContext } from "@/context/ToastContext"
import Modal from "@/components/Modal"
import { IoWarningOutline } from "react-icons/io5"
import ResumenCardsDinamico from "@/components/ResumenCardsDinamico"
import { useSessionStore } from "@/store/sessionStore"
import {
  calculateNoches,
  normalizarPreciosCatalogo,
  normalizarPreciosCatalogoHoteles,
} from "@/helper/paquete"
import { NumericFormat } from "react-number-format"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { DinamicSearchSelect } from "@/components/DinamicSearchSelect"

let dataList: SalidaListado[] = []

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

export default function SalidasPage() {
  const { siTienePermiso } = useSessionStore()
  const { handleShowToast } = use(ToastContext)

  // --- Paquete selection ---
  const [selectedPaqueteID, setSelectedPaqueteID] = useState<number | "">("")
  const [selectedPaqueteData, setSelectedPaqueteData] = useState<any>()
  const [paqueteBusqueda, setPaqueteBusqueda] = useState("")

  // Derived from selected paquete
  const propio: boolean = selectedPaqueteData?.propio ?? true
  const paqueteModalidad: "flexible" | "fijo" = selectedPaqueteData?.modalidad ?? "flexible"
  const ciudadDataSelected = selectedPaqueteData?.destino?.id
  const cantidadPasajeros: number | null = selectedPaqueteData?.cantidad_pasajeros ?? null
  const esTerrestre = quitarAcentos(selectedPaqueteData?.tipo_paquete?.nombre ?? "").toLowerCase() === "terrestre"

  // --- Hotel/room selection ---
  const [selectedHotels, setSelectedHotels] = useState<Set<any>>(new Set())
  const [hotelPrices, setHotelPrices] = useState<Record<string, any>>({})
  const [modoPrecio, setModoPrecio] = useState<Record<string, PriceMode>>({})
  const [fixedRoomTypeId, setFixedRoomTypeId] = useState("")
  const fixedRoomTypeIdRef = useRef(fixedRoomTypeId)
  const selectedHotelsRef = useRef(selectedHotels)
  const [preciosCatalogoTrigger, setPreciosCatalogoTrigger] = useState(0)

  // --- Items de costo ---
  const [itemsCostoSalida, setItemsCostoSalida] = useState<any[]>([])

  // --- UI state ---
  const [validando, setValidando] = useState(false)
  const [activeTab, setActiveTab] = useState("list")
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [busquedaInput, setBusquedaInput] = useState("")
  const [filtros, setFiltros] = useState({
    activo: true,
    busqueda: "",
    fecha_desde: "",
    fecha_hasta: "",
    paquete_id: "",
  })

  // --- Filtro paquete (lista) ---
  const [paqueteFiltroID, setPaqueteFiltroID] = useState<number | "">("")
  const [paqueteFiltrosBusqueda, setPaqueteFiltrosBusqueda] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [paginacion, setPaginacion] = useState<RespuestaPaginadaSalida>({
    next: null,
    totalItems: 0,
    previous: null,
    totalPages: 1,
    pageSize: 10,
  })

  // --- Detail / deactivate state ---
  const [dataADesactivar, setDataADesactivar] = useState<SalidaListado>()
  const [onDesactivarData, setOnDesactivarData] = useState(false)
  const [onVerDetalles, setOnVerDetalles] = useState(false)
  const [dataDetalle, setDataDetalle] = useState<SalidaListado>()
  const [dataPasajeros, setDataPasajeros] = useState<PasajeroSalida []>([])
  const [activeDetailTab, setActiveDetailTab] = useState<"general" | "pasajeros">("general")
  const [isExporting, setIsExporting] = useState(false)

  // --- Form ---
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
    reset,
    trigger,
  } = useForm<any>({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      precio_desde_editable: "",
      precio_hasta_editable: "",
      cantidadNoche: "",
      senia: "",
      fecha_salida_v2: "",
      fecha_regreso_v2: "",
      cupo: "",
      moneda: "",
    },
  })

  // Keep refs in sync
  useEffect(() => {
    fixedRoomTypeIdRef.current = fixedRoomTypeId
  }, [fixedRoomTypeId])

  useEffect(() => {
    selectedHotelsRef.current = selectedHotels
  }, [selectedHotels])

  // Watch values
  const fechaSalida = watch("fecha_salida_v2")
  const fechaRegreso = watch("fecha_regreso_v2")
  const cantidadNoche = watch("cantidadNoche")

  // --- Queries ---
  const { data: dataPaquetesList, isFetching: isFetchingPaquetes } = useQuery({
    queryKey: ["paquetes-disponibles-salidas", paqueteBusqueda],
    queryFn: () => fetchDataPaquetes(1, 20, { busqueda: paqueteBusqueda, activo: true }),
    staleTime: 5 * 60 * 1000,
  })

  const { data: dataPaquetesFiltroList, isFetching: isFetchingFiltrosPaquetes } = useQuery({
    queryKey: ["paquetes-filtro-salidas", paqueteFiltrosBusqueda],
    queryFn: () => fetchDataPaquetes(1, 20, { busqueda: paqueteFiltrosBusqueda, activo: true }),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(paqueteFiltrosBusqueda),
  })

  const { data: dataTipoCostoList } = useQuery({
    queryKey: ["tipos-costo-todos"],
    queryFn: fetchTiposCostoTodos,
    staleTime: 10 * 60 * 1000,
  })

  const { data: dataHotelesList, isFetching: isFetchingHoteles } = useQuery({
    queryKey: ["hoteles-salidas", ciudadDataSelected],
    queryFn: () => fetchDataHoteles(ciudadDataSelected),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(ciudadDataSelected),
  })

  const { data, isFetching, isError } = useQuery({
    queryKey: ["salidas", currentPage, paginacion.pageSize, filtros],
    queryFn: () => fetchData(currentPage, paginacion.pageSize, filtros),
    staleTime: 5 * 60 * 1000,
    enabled: !((filtros.fecha_desde && !filtros.fecha_hasta) || (!filtros.fecha_desde && filtros.fecha_hasta)),
  })

  const { data: dataResumen, isFetching: isFetchingResumen, isError: isErrorResumen } = useQuery({
    queryKey: ["salidas-resumen"],
    queryFn: fetchResumen,
    staleTime: 5 * 60 * 1000,
  })

  const { data: dataSalidaDetalle, isFetching: isFetchingDetalle } = useQuery({
    queryKey: ["salida-detalle", dataDetalle?.id],
    queryFn: ({ signal }) => fetchSalidaDetalle({ id: dataDetalle!.id, signal }),
    staleTime: 2 * 60 * 1000,
    enabled: onVerDetalles && !!dataDetalle?.id,
  })

  const { data: dataPasajerosResp, isFetching: isFetchingPasajeros } = useQuery({
    queryKey: ["salida-pasajeros", dataDetalle?.id],
    queryFn: ({ signal }) => fetchPasajerosSalida({ id: dataDetalle!.id, signal }),
    staleTime: 2 * 60 * 1000,
    enabled: onVerDetalles && !!dataDetalle?.id && activeDetailTab === "pasajeros",
  })

  // Populate list
  if (!isFetching && !isError && data?.results) {
    dataList = data.results.map((s: SalidaListado, i: number) => ({ ...s, numero: i + 1 }))
  }

  //update pasajeros
  useEffect(() => {
    if(!dataPasajerosResp || !dataPasajerosResp?.pasajeros.length) return
    
    setDataPasajeros(dataPasajerosResp?.pasajeros);
  }, [dataPasajerosResp]);

  // Update pagination
  useEffect(() => {
    if (!data) return
    setPaginacion({
      next: data?.next ?? null,
      totalItems: data?.count ?? 0,
      previous: data?.previous ?? null,
      totalPages: data?.totalPages,
      pageSize: data?.pageSize ?? 10,
    })
  }, [data])

  // Debounce busqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setFiltros((prev) => ({ ...prev, busqueda: busquedaInput }))
      setCurrentPage(1)
    }, 750)
    return () => clearTimeout(handler)
  }, [busquedaInput])

  // Prefill moneda y cupo cuando cambia el paquete
  useEffect(() => {
    if (selectedPaqueteData?.moneda?.id) {
      setValue("moneda", selectedPaqueteData.moneda.id.toString())
    }
    if (esTerrestre && cantidadPasajeros) {
      setValue("cupo", cantidadPasajeros)
    }
  }, [selectedPaqueteData, setValue, esTerrestre, cantidadPasajeros])

  // Initialize items de costo from paquete's defaults
  useEffect(() => {
    if (!selectedPaqueteData) {
      setItemsCostoSalida([])
      return
    }
    if (propio && selectedPaqueteData.items_costo_default?.length) {
      setItemsCostoSalida(
        selectedPaqueteData.items_costo_default.map((item: any) => ({
          tipo_costo_id: item.tipo_costo?.id ?? item.tipo_costo_id,
          nombre: item.tipo_costo?.nombre ?? item.nombre,
          monto: Number(item.monto),
          dividir_por_pasajeros: item.tipo_costo?.dividir_por_pasajeros ?? item.dividir_por_pasajeros ?? false,
          origen: 'paquete' as const,
        }))
      )
    } else {
      setItemsCostoSalida([])
    }
  }, [selectedPaqueteData, propio])

  // --- Validación de fechas y cálculo de noches ---
  useEffect(() => {
    if (fechaSalida) {
      const selectedDate = new Date(fechaSalida)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        handleShowToast("La fecha de salida no puede ser anterior a hoy", "error")
      }
    }

    if (fechaRegreso) {
      const selectedDate = new Date(fechaRegreso)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        handleShowToast("La fecha de regreso no puede ser anterior a hoy", "error")
      }
    }

    if (fechaSalida && fechaRegreso) {
      if (fechaRegreso < fechaSalida) {
        handleShowToast("La fecha de regreso debe ser mayor a la fecha de salida", "error")
        return
      }
      setValue("cantidadNoche", calculateNoches(fechaSalida, fechaRegreso).toString())
    }
  }, [fechaSalida, fechaRegreso, setValue, handleShowToast])

  // --- Price auto-calculation (propio y distribuidora) ---
  useEffect(() => {
    const formValues = getValues()
    const preciosCatalogo: number[] = []

    Object.entries(formValues).forEach(([key, value]) => {
      if (
        (key.startsWith("precio_paquete_habitacion_") || key.startsWith("precio_habitacion_por_hotel_")) &&
        value
      ) {
        const precio = Number(value)
        if (!isNaN(precio) && precio > 0) preciosCatalogo.push(precio)
      }
    })

    if (preciosCatalogo.length === 0) {
      setValue("precio_desde_editable", "")
      setValue("precio_hasta_editable", "")
      return
    }

    const precioMin = Math.min(...preciosCatalogo)
    const precioMax = Math.max(...preciosCatalogo)
    setValue("precio_desde_editable", precioMin.toString())
    setValue(
      "precio_hasta_editable",
      paqueteModalidad === "flexible" ? precioMax.toString() : ""
    )
  }, [propio, paqueteModalidad, getValues, setValue, preciosCatalogoTrigger])

  // Clear fields when propio changes
  useEffect(() => {
    if (!propio) {
      setValue("cupo", "", { shouldValidate: false })
    }
  }, [propio, setValue])

  // --- Mutations ---
  const { mutate, isPending: isPendingMutation } = useMutation({
    mutationFn: nuevoDataFetch,
    onSuccess: () => {
      handleShowToast("Se ha creado la salida satisfactoriamente", "success")
      resetForm()
      setActiveTab("list")
      queryClient.invalidateQueries({ queryKey: ["salidas"], exact: false })
      queryClient.invalidateQueries({ queryKey: ["salidas-resumen"] })
    },
  })

  const { mutate: mutateDesactivar, isPending: isPendingDesactivar } = useMutation({
    mutationFn: desactivarSalida,
    onSuccess: () => {
      handleShowToast("Se ha desactivado la salida satisfactoriamente", "success")
      setOnDesactivarData(false)
      setDataADesactivar(undefined)
      queryClient.invalidateQueries({ queryKey: ["salidas"], exact: false })
      queryClient.invalidateQueries({ queryKey: ["salidas-resumen"] })
    },
  })

  // --- Reset form ---
  const resetForm = () => {
    setSelectedPaqueteID("")
    setSelectedPaqueteData(undefined)
    setSelectedHotels(new Set())
    setHotelPrices({})
    setModoPrecio({})
    setFixedRoomTypeId("")
    setItemsCostoSalida([])
    const formValues = getValues()
    Object.keys(formValues).forEach((key) => {
      if (
        key.startsWith("precio_paquete_habitacion_") ||
        key.startsWith("precio_habitacion_por_hotel_") ||
        key.startsWith("cupo_habitacion_")
      ) {
        setValue(key, undefined)
      }
    })

    reset({
      precio_desde_editable: "",
      precio_hasta_editable: "",
      cantidadNoche: "",
      senia: "",
      fecha_salida_v2: "",
      fecha_regreso_v2: "",
      cupo: "",
      moneda: "",
    })
    setValidando(false)
  }

  // --- Hotel handlers ---
  const handleHotelToggle = (hotelId: string, hotel: any) => {
    if (paqueteModalidad === "fijo") {
      setFixedRoomTypeId("")

      if (propio && hotel.habitaciones.length === 0) {
        handleShowToast(
          "Se debe cargar las habitaciones a este hotel para este tipo de paquete",
          "error"
        )
        return
      }

      setSelectedHotels(new Set([hotelId]))
      setHotelPrices({ [hotelId]: { single: 0, doble: 0, triple: 0 } })

      if (!modoPrecio[hotelId]) {
        setModoPrecio((prev) => ({ ...prev, [hotelId]: "hotel" }))
      }
      if (modoPrecio[hotelId] === "hotel") {
        const precioHotel = getValues(`precio_habitacion_por_hotel_${hotelId}`)
        if (precioHotel && precioHotel > 0) {
          hotel?.habitaciones?.forEach((hab: any) =>
            setValue(`precio_paquete_habitacion_${hab.id}`, precioHotel)
          )
        }
      }
    } else {
      const newSelected = new Set(selectedHotels)
      const newPrices = { ...hotelPrices }

      if (newSelected.has(hotelId)) {
        newSelected.delete(hotelId)
        delete newPrices[hotelId]
      } else {
        newSelected.add(hotelId)
        newPrices[hotelId] = { single: 0, doble: 0, triple: 0 }

        if (!modoPrecio[hotelId]) {
          setModoPrecio((prev) => ({ ...prev, [hotelId]: "hotel" }))
        }
        if (modoPrecio[hotelId] === "hotel") {
          const precioHotel = getValues(`precio_habitacion_por_hotel_${hotelId}`)
          if (precioHotel && precioHotel > 0) {
            hotel?.habitaciones?.forEach((hab: any) =>
              setValue(`precio_paquete_habitacion_${hab.id}`, precioHotel)
            )
          }
        }
      }

      setSelectedHotels(newSelected)
      setHotelPrices(newPrices)
    }
  }

  const handleModeChange = (hotelId: string, newMode: PriceMode) => {
    setModoPrecio((prev) => ({ ...prev, [hotelId]: newMode }))
    if (newMode === "hotel") {
      const hotel = dataHotelesList?.find((h: any) => h.id === hotelId)
      if (hotel) {
        const precioHotel = getValues(`precio_habitacion_por_hotel_${hotelId}`)
        if (precioHotel && precioHotel > 0) {
          hotel?.habitaciones?.forEach((hab: any) =>
            setValue(`precio_paquete_habitacion_${hab.id}`, precioHotel)
          )
        }
      }
    }
  }

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">({rating})</span>
    </div>
  )

  // --- Crear salida ---
  const handleCrearSalida = async (dataForm: any) => {
    setValidando(true)
    const hotelesIds = Array.from(selectedHotelsRef.current)

    if (paqueteModalidad === "fijo") {
      if (!fixedRoomTypeIdRef.current || !hotelesIds.length) {
        handleShowToast("Debes seleccionar un hotel y una habitación", "error")
        setValidando(false)
        return
      }
    }

    if (!hotelesIds.length) {
      handleShowToast("Debes seleccionar al menos un hotel", "error")
      setValidando(false)
      return
    }

    // Extract dynamic cupo fields
    let habitacionesCuposList = Object.entries(dataForm)
      .filter(([key, value]) => key.startsWith("cupo_habitacion_") && value != null)
      .map(([key, value]) => {
        const habitacion_id = Number(key.replace("cupo_habitacion_", ""))
        const cupo = Number(value)
        delete dataForm[key]
        return { habitacion_id, cupo }
      })

    // Extract hotel-level prices
    const preciosCatalogoHoteles = Object.entries(dataForm)
      .filter(([key, value]) => key.startsWith("precio_habitacion_por_hotel_") && value != null)
      .map(([key, value]) => {
        const hotel_id = Number(key.replace("precio_habitacion_por_hotel_", ""))
        const precio_catalogo = Number(value)
        delete dataForm[key]
        return { hotel_id, precio_catalogo }
      })

    // Build excluded habitaciones set (hotels in mode "hotel")
    const hotelesEnModoHotel = preciosCatalogoHoteles.map((p) => p.hotel_id)
    const habitacionesExcluidas = new Set<number>()
    dataHotelesList?.forEach((hotel: any) => {
      if (hotelesEnModoHotel.includes(hotel.id)) {
        hotel?.habitaciones?.forEach((hab: any) => habitacionesExcluidas.add(hab.id))
      }
    })

    // Extract room-level prices (excluding rooms of hotels in mode "hotel")
    let precioCatalogoDistribuidora = Object.entries(dataForm)
      .filter(([key, value]) => key.startsWith("precio_paquete_habitacion_") && value != null)
      .map(([key, value]) => {
        const habitacion_id = Number(key.replace("precio_paquete_habitacion_", ""))
        const precio_catalogo = Number(value)
        delete dataForm[key]
        return { habitacion_id, precio_catalogo }
      })
      .filter((item) => !habitacionesExcluidas.has(item.habitacion_id))

    // Filter by fixed room type if fijo
    if (paqueteModalidad === "fijo" && fixedRoomTypeIdRef.current) {
      habitacionesCuposList = habitacionesCuposList.filter(
        (h) => h.habitacion_id.toString() === fixedRoomTypeIdRef.current.toString()
      )
      precioCatalogoDistribuidora = precioCatalogoDistribuidora.filter(
        (h) => h.habitacion_id.toString() === fixedRoomTypeIdRef.current.toString()
      )
    }

    // Build payload
    const payload: any = {
      paquete_id: selectedPaqueteID,
      fecha_salida: dataForm.fecha_salida_v2,
      fecha_regreso: dataForm.fecha_regreso_v2,
      moneda_id: dataForm.moneda,
      senia: dataForm.senia,
      hoteles_ids: hotelesIds,
    }

    // Precios de catálogo — aplica a propios y distribuidoras
    payload.precios_catalogo_hoteles = normalizarPreciosCatalogoHoteles(preciosCatalogoHoteles)
    payload.precios_catalogo_habitaciones = normalizarPreciosCatalogo(
      precioCatalogoDistribuidora,
      preciosCatalogoHoteles,
      dataHotelesList || []
    )

    payload.costo_base_desde = dataForm.precio_desde_editable
    if (paqueteModalidad === "flexible" && dataForm.precio_hasta_editable) {
      payload.costo_base_hasta = dataForm.precio_hasta_editable
    }

    if (propio) {
      payload.cupo = parseInt(dataForm.cupo, 10)
      payload.cupos_habitaciones = habitacionesCuposList

      // Items de costo: solo enviar overrides
      const overrides = itemsCostoSalida.filter((i: any) => i.origen === 'override')
      if (overrides.length > 0) {
        payload.items_costo_override_data = overrides.map((i: any) => ({
          tipo_costo_id: i.tipo_costo_id,
          monto: i.monto,
        }))
      }
    }

    if (paqueteModalidad === "fijo" && fixedRoomTypeIdRef.current) {
      payload.habitacion_fija_id = fixedRoomTypeIdRef.current
    }

    mutate(payload)
  }

  const handleSubmitClick = useCallback(async () => {
    if (validando) return

    if (!selectedPaqueteID) {
      handleShowToast("Debes seleccionar un paquete", "error")
      return
    }

    setValidando(true)
    const isValidForm = await trigger()

    if (isValidForm) {
      setTimeout(() => {
        handleSubmit(handleCrearSalida)()
      }, 0)
    } else {
      if (errors?.fecha_salida_v2) {
        const msg =
          typeof errors.fecha_salida_v2.message === "string"
            ? errors.fecha_salida_v2.message
            : "Fecha de salida inválida"
        handleShowToast(msg, "error")
      } else if (errors?.fecha_regreso_v2) {
        const msg =
          typeof errors.fecha_regreso_v2.message === "string"
            ? errors.fecha_regreso_v2.message
            : "Fecha de regreso inválida"
        handleShowToast(msg, "error")
      } else {
        handleShowToast("Debes completar los campos requeridos", "error")
      }
      setValidando(false)
    }
  }, [trigger, validando, selectedPaqueteID, handleSubmit, errors, handleShowToast])

  // --- Pagination ---
  const handlePageChange = (page: number) => setCurrentPage(page)

  const handleItemsPerPageChange = (value: string) => {
    setPaginacion((prev) => ({ ...prev, pageSize: Number(value) }))
    setCurrentPage(1)
  }

  const handleActiveOnly = () => {
    setShowActiveOnly((prev) => !prev)
    setFiltros((prev) => ({ ...prev, activo: !showActiveOnly }))
    setCurrentPage(1)
  }

  const toggleDesactivar = (salida: SalidaListado) => {
    setOnDesactivarData(true)
    setDataADesactivar(salida)
  }

  const handleCloseModal = () => setOnDesactivarData(false)

  const handleConfirmDesactivar = () => {
    mutateDesactivar(dataADesactivar!.id)
  }

  const handleVerDetalles = (data: SalidaListado) => {
    setDataDetalle(data)
    setActiveDetailTab("general")
    setOnVerDetalles(true)
  }

  const handleCloseVerDetalles = () => {
    setOnVerDetalles(false)
    setDataDetalle(undefined)
  }

  return (
    <>
      {/* Detail modal */}
      {onVerDetalles && dataDetalle && (
        <Modal onClose={handleCloseVerDetalles} claseCss="modal-detalles-reserva">
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="modal-detalles-reserva bg-white/95 rounded-xl shadow-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto backdrop-blur-sm">

              {/* ── Hero header (gradient instead of image) ── */}
              <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-t-xl px-8 py-10">
                {/* Status & type badges */}
                <div className="absolute top-4 left-4 flex space-x-2">
                  <span className={`px-4 py-2 rounded-full text-xs font-medium ${
                    dataDetalle.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {dataDetalle.activo ? "Activo" : "Inactivo"}
                  </span>
                  <span className="px-4 py-2 bg-white/20 text-white text-xs font-medium rounded-full font-mono">
                    {dataDetalle.codigo}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Button
                    disabled
                    className="cursor-pointer w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200 p-0"
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                  </Button>
                  <Button
                    onClick={handleCloseVerDetalles}
                    className="cursor-pointer w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200 p-0"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </Button>
                </div>

                {/* Main info */}
                `` <div className="flex items-end justify-between mt-6">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {dataDetalle.paquete_nombre}
                    </h1>
                    <div className="flex items-center text-white/90">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{dataDetalle.destino.ciudad}, {dataDetalle.destino.pais}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-white">
                      {dataDetalle.moneda.simbolo} {formatearSeparadorMiles.format(Number(dataDetalle.costo_base_desde))}
                    </div>
                    <div className="text-white/80 text-sm mt-1">Precio actual</div>
                  </div>
                </div>
              </div>

              {/* ── Tab navigation ── */}
              <div className="border-b border-gray-200">
                <nav className="flex items-center px-8">
                  <div className="flex space-x-8 flex-1">
                    <button
                      onClick={() => setActiveDetailTab("general")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 cursor-pointer ${
                        activeDetailTab === "general"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Información General
                    </button>
                    <button
                      onClick={() => setActiveDetailTab("pasajeros")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 cursor-pointer ${
                        activeDetailTab === "pasajeros"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Pasajeros ({dataDetalle.cupo_total - dataDetalle.cupo_disponible})
                    </button>
                  </div>
                  {activeDetailTab === "pasajeros" && dataPasajeros.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mb-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                      disabled={isExporting}
                      onClick={async () => {
                        setIsExporting(true);
                        try {
                          await exportarPasajerosExcel(dataDetalle.id);
                        } finally {
                          setIsExporting(false);
                        }
                      }}
                    >
                      {isExporting
                        ? <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                        : <Download className="h-4 w-4 mr-2" />
                      }
                      Exportar Excel
                    </Button>
                  )}
                </nav>
              </div>

              {/* ── Tab content ── */}
              <div className="p-8">

                {/* INFORMACIÓN GENERAL */}
                {activeDetailTab === "general" && (
                  <div className="space-y-6 min-h-[420px]">
                    {isFetchingDetalle ? (
                      <div className="flex items-center justify-center min-h-[420px]">
                        <Loader2Icon className="animate-spin w-8 h-8 text-blue-400" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Fechas */}
                        <Card className="border-blue-100">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-blue-600" />
                              </div>
                              <CardTitle className="text-sm font-semibold text-gray-700">Fechas</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-500">Salida</p>
                              <p className="font-semibold text-gray-900">{formatearFecha(dataDetalle.fecha_salida, false)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Regreso</p>
                              <p className="font-semibold text-gray-900">
                                {dataDetalle.fecha_regreso ? formatearFecha(dataDetalle.fecha_regreso, false) : "—"}
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Precios */}
                        <Card className="border-green-100">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                              </div>
                              <CardTitle className="text-sm font-semibold text-gray-700">Precios</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-500">Precio actual</p>
                              <p className="font-bold text-green-600 text-lg">
                                {dataDetalle.moneda.simbolo} {formatearSeparadorMiles.format(Number(dataDetalle.costo_base_desde))}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Seña</p>
                              <p className="font-semibold text-gray-900">
                                {dataDetalle.moneda.simbolo} {formatearSeparadorMiles.format(Number(dataDetalle.senia))}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Venta sugerida</p>
                              <p className="text-sm text-gray-700">
                                {dataDetalle.moneda.simbolo} {formatearSeparadorMiles.format(Number(dataDetalle.precio_venta_sugerido_min))}
                                {" — "}
                                {dataDetalle.moneda.simbolo} {formatearSeparadorMiles.format(Number(dataDetalle.precio_venta_sugerido_max))}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Moneda</p>
                              <p className="text-sm text-gray-700">{dataDetalle.moneda.nombre} ({dataDetalle.moneda.simbolo})</p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Cupos y reservas */}
                        <Card className="border-purple-100">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Users className="w-4 h-4 text-purple-600" />
                              </div>
                              <CardTitle className="text-sm font-semibold text-gray-700">Cupos y Reservas</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-500">Cupo disponible</p>
                              <p className="font-bold text-gray-900 text-lg">
                                {dataSalidaDetalle?.cupo_disponible ?? dataDetalle.cupo_disponible}
                                <span className="text-gray-400 font-normal text-sm"> / {dataSalidaDetalle?.cupo_total ?? dataDetalle.cupo_total}</span>
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Total reservas</p>
                              <p className="font-semibold text-gray-900">{dataSalidaDetalle?.total_reservas ?? dataDetalle.total_reservas}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Estado</p>
                              <Badge className={dataDetalle.activo ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}>
                                {dataDetalle.activo ? "Activo" : "Inactivo"}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Datos adicionales del detalle */}
                        {dataSalidaDetalle && (
                          <Card className="md:col-span-3 border-gray-100">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm font-semibold text-gray-700">Detalles adicionales</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {dataSalidaDetalle.hoteles?.length > 0 && (
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Hoteles</p>
                                    <div className="space-y-1">
                                      {dataSalidaDetalle.hoteles.map((h: any) => (
                                        <div key={h.id} className="flex items-center gap-1 text-sm text-gray-700">
                                          <Building2 className="w-3 h-3 text-gray-400" />
                                          {h.nombre}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {/* Ganancia / Comision — oculto post-refactor */}
                                {dataSalidaDetalle.costo_base_hasta != null && (
                                  <div>
                                    <p className="text-xs text-gray-500">Precio final</p>
                                    <p className="font-semibold text-gray-900">
                                      {dataDetalle.moneda.simbolo} {formatearSeparadorMiles.format(Number(dataSalidaDetalle.costo_base_hasta))}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* PASAJEROS */}
                {activeDetailTab === "pasajeros" && (
                  <div className="min-h-[420px]">
                    {isFetchingPasajeros ? (
                      <div className="flex items-center justify-center min-h-[420px]">
                        <Loader2Icon className="animate-spin w-8 h-8 text-blue-400" />
                      </div>
                    ) : !dataPasajeros?.length ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Users className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Sin pasajeros aún</h3>
                        <p className="text-gray-500">No hay pasajeros registrados para esta salida.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                              <TableHead className="font-semibold text-gray-700 w-10">#</TableHead>
                              <TableHead className="font-semibold text-gray-700 min-w-[160px]">Reserva</TableHead>
                              <TableHead className="font-semibold text-gray-700 min-w-[180px]">Pasajero</TableHead>
                              <TableHead className="font-semibold text-gray-700 min-w-[180px]">Edad</TableHead>
                              <TableHead className="font-semibold text-gray-700 min-w-[140px]">Documento</TableHead>
                              <TableHead className="font-semibold text-gray-700 min-w-[130px]">Precio asignado</TableHead>
                              <TableHead className="font-semibold text-gray-700 min-w-[130px]">Monto pagado</TableHead>
                              <TableHead className="font-semibold text-gray-700 min-w-[130px]">Saldo pendiente</TableHead>
                              <TableHead className="font-semibold text-gray-700 min-w-[120px]">Estado pago</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dataPasajeros.map((p: any, i: number) => (
                              <TableRow key={p.id ?? i} className="hover:bg-blue-50">
                                <TableCell className="text-gray-500 pl-4">{i + 1}</TableCell>

                                {/* Reserva */}
                                <TableCell>
                                  <Badge className="bg-gray-100 text-gray-700 font-mono text-xs mb-1 block w-fit">
                                    {p.reserva_codigo ?? "—"}
                                  </Badge>
                                  <Badge className={
                                    p.reserva_estado === "pendiente"
                                      ? "bg-yellow-100 text-yellow-700 text-xs"
                                      : p.reserva_estado === "confirmada" && p.reserva_estado_display?.toLowerCase().includes("completo") && !p.reserva_estado_display?.toLowerCase().includes("incompleto")
                                      ? "bg-blue-100 text-blue-700 text-xs"
                                      : p.reserva_estado === "confirmada"
                                      ? "bg-orange-100 text-orange-700 text-xs"
                                      : p.reserva_estado === "finalizada"
                                      ? "bg-emerald-100 text-emerald-700 text-xs"
                                      : p.reserva_estado === "cancelada"
                                      ? "bg-red-100 text-red-700 text-xs"
                                      : "bg-gray-100 text-gray-600 text-xs"
                                  }>
                                    {p.reserva_estado_display ?? "—"}
                                  </Badge>
                                </TableCell>

                                {/* Pasajero */}
                                <TableCell>
                                  {!p.por_asignar && 
                                    <div className="font-medium text-gray-900">
                                      {p.nombre} {p.apellido}
                                    </div>
                                  }
                                  <div className="flex gap-1 mt-1 flex-wrap">
                                    {p.es_titular && (
                                      <Badge className="bg-blue-100 text-blue-700 text-xs">Titular</Badge>
                                    )}
                                    {p.por_asignar && (
                                      <Badge className="bg-orange-100 text-orange-700 text-xs">Por asignar</Badge>
                                    )}
                                  </div>
                                </TableCell>

                                <TableCell>
                                   <div>
                                    <div className="font-medium text-gray-900 truncate max-w-xs">
                                    {p?.edad} años
                                      

                                    </div>
                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                      {formatearFecha(p?.fecha_nacimiento ?? '', false)}
                                    </div>
                                  </div>
                                </TableCell>

                                {/* Documento */}
                                <TableCell>
                                  <div className="text-sm text-gray-500">{p.tipo_documento}</div>

                                  {!p.por_asignar ? 
                                    <div className="font-medium text-gray-900">{p.documento ?? "—"}</div> :  
                                    <Badge className="bg-gray-100 text-gray-700 text-xs">Sin documento</Badge>
                                  
                                  }
                                </TableCell>

                                {/* Precio asignado */}
                                <TableCell className="font-semibold text-gray-900">
                                  {p.precio_asignado != null
                                    ? `${dataDetalle.moneda.simbolo} ${formatearSeparadorMiles.format(Number(p.precio_asignado))}`
                                    : "—"}
                                </TableCell>

                                {/* Monto pagado */}
                                <TableCell className="font-semibold text-emerald-600">
                                  {p.monto_pagado != null
                                    ? `${dataDetalle.moneda.simbolo} ${formatearSeparadorMiles.format(Number(p.monto_pagado))}`
                                    : "—"}
                                </TableCell>

                                {/* Saldo pendiente */}
                                <TableCell className={p.saldo_pendiente > 0 ? "font-semibold text-red-500" : "font-semibold text-gray-400"}>
                                  {p.saldo_pendiente != null
                                    ? `${dataDetalle.moneda.simbolo} ${formatearSeparadorMiles.format(Number(p.saldo_pendiente))}`
                                    : "—"}
                                </TableCell>

                                {/* Estado pago */}
                                <TableCell>
                                  {p.esta_totalmente_pagado ? (
                                    <Badge className="bg-emerald-100 text-emerald-700">Pagado</Badge>
                                  ) : p.tiene_sena_pagada ? (
                                    <Badge className="bg-yellow-100 text-yellow-700">Seña pagada</Badge>
                                  ) : (
                                    <Badge className="bg-red-100 text-red-700">Sin seña</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Deactivate confirmation modal */}
      {onDesactivarData && (
        <Modal onClose={handleCloseModal} claseCss="">
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex flex-col items-center gap-4">
                <IoWarningOutline className="text-yellow-500 w-16 h-16" />
                <h2 className="text-lg font-bold">¿Confirmar desactivación?</h2>
                <p className="text-gray-600 text-center">
                  ¿Estás seguro de que deseas desactivar la salida{" "}
                  <strong>{dataADesactivar?.codigo}</strong>?
                </p>
                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    className="flex-1 cursor-pointer"
                    onClick={handleCloseModal}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-red-500 hover:bg-red-600 cursor-pointer"
                    disabled={isPendingDesactivar}
                    onClick={handleConfirmDesactivar}
                  >
                    {isPendingDesactivar ? (
                      <Loader2Icon className="animate-spin w-4 h-4 mr-2" />
                    ) : null}
                    Desactivar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-[95vw] mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Plane className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-3xl font-semibold text-gray-900">Salidas</h1>
              </div>
              <p className="text-gray-600">Gestiona las salidas de los paquetes de viaje.</p>
            </div>
            <div className="flex gap-3">
              {siTienePermiso("salidas", "crear") && (
                <Button
                  className="bg-blue-500 hover:bg-blue-600 cursor-pointer"
                  onClick={() => setActiveTab("form")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Salida
                </Button>
              )}
            </div>
          </div>

          {/* Resumen cards */}
          <ResumenCardsDinamico resumen={dataResumen} isFetchingResumen={isFetchingResumen} isErrorResumen={isErrorResumen} />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-80 bg-gray-100">
              <TabsTrigger value="list" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white cursor-pointer">
                Lista de Salidas
              </TabsTrigger>
              <TabsTrigger
                disabled={!siTienePermiso("salidas", "crear")}
                value="form"
                className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white cursor-pointer"
              >
                Crear Salida
              </TabsTrigger>
            </TabsList>

            {/* ─── LIST TAB ─── */}
            <TabsContent value="list">
              <Card className="border-blue-200 pt-0">
                <CardHeader className="bg-blue-50 border-b border-blue-200 pt-8">
                  <div className="flex flex-col items-start justify-between">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                          <Plane className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-blue-900">Lista de Salidas</CardTitle>
                          <CardDescription className="text-blue-700">
                            {paginacion.totalItems} salidas encontradas
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-4">
                        <div className="flex items-center gap-2 bg-emerald-50 rounded-full px-3 py-2 border border-emerald-200">
                          <Switch
                            checked={showActiveOnly}
                            onCheckedChange={handleActiveOnly}
                            id="active-filter-salidas"
                            className="data-[state=checked]:bg-emerald-500"
                          />
                          <Label
                            htmlFor="active-filter-salidas"
                            className="text-sm text-emerald-700 font-medium"
                          >
                            Solo activos
                          </Label>
                        </div>

                        <div className="relative min-w-[280px]">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Buscar por código, paquete, destino..."
                            value={busquedaInput}
                            onChange={(e) => setBusquedaInput(e.target.value)}
                            className="pl-10 border-gray-300 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-blue-200 w-full flex-wrap">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-gray-600 font-medium whitespace-nowrap">Fecha salida desde:</Label>
                        <Input
                          type="date"
                          value={filtros.fecha_desde}
                          onChange={(e) => setFiltros({ ...filtros, fecha_desde: e.target.value })}
                          className="w-40 border-blue-200 focus:border-blue-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-gray-600 font-medium whitespace-nowrap">Fecha salida hasta:</Label>
                        <Input
                          type="date"
                          value={filtros.fecha_hasta}
                          onChange={(e) => setFiltros({ ...filtros, fecha_hasta: e.target.value })}
                          className="w-40 border-blue-200 focus:border-blue-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-gray-600 font-medium whitespace-nowrap">Paquete:</Label>
                        <div className="min-w-[400px]">
                          <DinamicSearchSelect
                            value={paqueteFiltroID}
                            onValueChange={(val) => {
                              setPaqueteFiltroID(val as number | "")
                              setFiltros((prev) => ({ ...prev, paquete_id: val ? String(val) : "" }))
                              setCurrentPage(1)
                            }}
                            onSearchChange={setPaqueteFiltrosBusqueda}
                            isFetchingPersonas={isFetchingFiltrosPaquetes}
                            dataList={dataPaquetesFiltroList ?? []}
                            labelKey="nombre"
                            valueKey="id"
                            placeholder="Filtrar por paquete..."
                            mostrarPreview={false}
                          />
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setBusquedaInput("")
                          setPaqueteFiltroID("")
                          setPaqueteFiltrosBusqueda("")
                          setFiltros({ activo: true, busqueda: "", fecha_desde: "", fecha_hasta: "", paquete_id: "" })
                          setShowActiveOnly(true)
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
                        <TableHead className="font-semibold text-gray-700 w-10">#</TableHead>
                        <TableHead className="font-semibold text-gray-700 min-w-[120px]">
                          Código
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 min-w-[200px]">
                          Paquete
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 min-w-[150px]">
                          Destino
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 min-w-[150px]">
                          Precio
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 min-w-[140px]">
                          Fechas
                        </TableHead>

                        <TableHead className="font-semibold text-gray-700 min-w-[120px]">Días p/Salida</TableHead>

                        <TableHead className="font-semibold text-gray-700 min-w-[100px]">
                          Cupo
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 min-w-[100px]">
                          Reservas
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 min-w-[100px]">
                          Estado
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 w-20">
                          Acciones
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isFetching && (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8">
                            <Loader2Icon className="animate-spin w-8 h-8 text-gray-400 mx-auto" />
                          </TableCell>
                        </TableRow>
                      )}
                      {!isFetching && dataList.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={10}>
                            <div className="text-center py-12 absolute-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Search className="h-8 w-8 text-gray-400" />
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron salidas</h3>
                              <p className="text-gray-500 mb-4">Intenta ajustar los filtros de búsqueda.</p>
                              <Button
                                onClick={() => {
                                  setBusquedaInput("")
                                  setPaqueteFiltroID("")
                                  setPaqueteFiltrosBusqueda("")
                                  setFiltros({ activo: true, busqueda: "", fecha_desde: "", fecha_hasta: "", paquete_id: "" })
                                  setShowActiveOnly(true)
                                }}
                                className="bg-blue-500 hover:bg-blue-600 cursor-pointer"
                              >
                                Limpiar filtros
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      {!isFetching &&
                        dataList.map((salida: SalidaListado) => (
                          <TableRow
                            key={salida.id}
                            className="hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <TableCell>
                              <div className="font-medium text-gray-900 pl-2">{salida.numero}</div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-gray-100 text-gray-700 border-gray-200 font-mono font-semibold">
                                {salida.codigo}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-gray-900 truncate max-w-[250px]">
                                {salida.paquete_nombre}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-gray-900 truncate max-w-[130px]">
                                {salida.destino.ciudad}
                              </div>
                              <div className="text-sm text-gray-500">{salida.destino.pais}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-green-600">
                                {salida.moneda.simbolo}{" "}
                                {formatearSeparadorMiles.format(Number(salida.costo_base_desde))}
                              </div>
                              <div className="text-sm text-gray-500">
                                Seña: {salida.moneda.simbolo}{" "}
                                {formatearSeparadorMiles.format(Number(salida.senia))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-gray-900">
                                {formatearFecha(salida.fecha_salida, false)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {salida.fecha_regreso
                                  ? formatearFecha(salida.fecha_regreso, false)
                                  : "-"}
                              </div>
                            </TableCell>
                            
                             <TableCell>
                              <div className="flex items-center justify-center">
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                  salida?.dias_hasta_salida !== undefined && salida?.dias_hasta_salida !== null
                                    ? salida.dias_hasta_salida <= 7
                                        ? salida.dias_hasta_salida < 0 ? 'bg-gray-100 text-gray-700 border border-gray-300' : 'bg-red-100 text-red-700 border border-red-300'
                                      : salida.dias_hasta_salida <= 30
                                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                                      : 'bg-green-100 text-green-700 border border-green-300'
                                    : 'bg-gray-100 text-gray-500'
                                }`}>
                                  {salida?.dias_hasta_salida !== undefined && salida?.dias_hasta_salida !== null
                                    ? `${salida.dias_hasta_salida > 1 ? salida.dias_hasta_salida + ' días': 
                                        salida.dias_hasta_salida === 0 ? 'Es hoy': 'Hace ' + salida.dias_hasta_salida * -1 + 
                                        (salida.dias_hasta_salida * -1 === 1 ? ' dia' : ' dias')} `
                                    : '-'}
                                </span>


                                {/* {data?.dias_hasta_salida !== undefined && data?.dias_hasta_salida !== null
                                    ? `${data.dias_hasta_salida > 1 ? data.dias_hasta_salida + ' días':
                                        `${data.dias_hasta_salida === 0 ? 'Es hoy': 'Salida fin'
                                    } `
                                    : '-'} */}
                              </div>
                            </TableCell>

                            <TableCell>
                              {salida.paquete_propio ? (() => {
                                const pct = salida.cupo_total > 0 ? salida.cupo_disponible / salida.cupo_total : 0;
                                const cls = salida.cupo_disponible === 0
                                  ? 'bg-red-100 text-red-700 border-red-300'
                                  : pct <= 0.2
                                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                                  : pct <= 0.5
                                  ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                                  : 'bg-green-100 text-green-700 border-green-300';
                                return (
                                  <Badge className={cls}>
                                    {salida.cupo_disponible === 0 ? 'Sin cupo' : `${salida.cupo_disponible} / ${salida.cupo_total}`}
                                  </Badge>
                                );
                              })() :
                                <Badge className="bg-gray-100 text-gray-700 border-gray-300">
                                  Sujeto a disponibilidad
                                </Badge>
                              }
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                {salida.total_reservas}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  salida.activo
                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                    : "bg-gray-100 text-gray-700 border-gray-200"
                                }
                              >
                                {salida.activo ? "Activo" : "Inactivo"}
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
                                  <DropdownMenuItem
                                    className="hover:bg-blue-50 cursor-pointer"
                                    onClick={() => handleVerDetalles(salida)}
                                  >
                                    <Eye className="h-4 w-4 mr-2 text-blue-500" />
                                    Ver detalles
                                  </DropdownMenuItem>
                                  {siTienePermiso("salidas", "eliminar") && salida.activo && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-red-600 hover:bg-red-50 cursor-pointer"
                                        onClick={() => toggleDesactivar(salida)}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Desactivar
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-gray-600">Mostrar:</Label>
                        <Select
                          value={paginacion?.pageSize?.toString() ?? "10"}
                          onValueChange={handleItemsPerPageChange}
                        >
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
                      >
                        <FaAngleDoubleLeft />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 cursor-pointer"
                      >
                        <FaAngleLeft />
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, paginacion!.totalPages) },
                          (_, i) => {
                            let pageNumber: number
                            if (paginacion!.totalPages <= 5) pageNumber = i + 1
                            else if (currentPage <= 3) pageNumber = i + 1
                            else if (currentPage >= paginacion!.totalPages - 2)
                              pageNumber = paginacion!.totalPages - 4 + i
                            else pageNumber = currentPage - 2 + i

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
                          }
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          currentPage < paginacion!.totalPages &&
                          handlePageChange(currentPage + 1)
                        }
                        disabled={currentPage === paginacion!.totalPages}
                        className="h-8 cursor-pointer"
                      >
                        <FaAngleRight />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(paginacion!.totalPages)}
                        disabled={currentPage === paginacion!.totalPages}
                        className="h-8 cursor-pointer"
                      >
                        <FaAngleDoubleRight />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── FORM TAB ─── */}
            <TabsContent value="form">
              <div className="space-y-6">
                {/* Step 1: Paquete selector */}
                <Card className="border-emerald-200 pt-0">
                  <CardHeader className="bg-emerald-50 border-b border-emerald-200 pt-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-emerald-900">Crear Nueva Salida</CardTitle>
                        <CardDescription className="text-emerald-700">
                          Complete la información para crear una nueva salida
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Paquete *</Label>
                      <DinamicSearchSelect
                        value={selectedPaqueteID}
                        onValueChange={(val) => setSelectedPaqueteID(val as number | "")}
                        setSelectedTitularData={setSelectedPaqueteData}
                        onSearchChange={setPaqueteBusqueda}
                        isFetchingPersonas={isFetchingPaquetes}
                        dataList={dataPaquetesList ?? []}
                        labelKey="nombre"
                        valueKey="id"
                        placeholder="Buscar paquete..."
                        mostrarPreview={true}
                      />
                      {selectedPaqueteData && (
                        <div className="flex gap-3 mt-2 flex-wrap">
                          <Badge
                            className={
                              selectedPaqueteData.propio
                                ? "bg-blue-100 text-blue-700"
                                : "bg-orange-100 text-orange-700"
                            }
                          >
                            {selectedPaqueteData.propio ? "Propio" : "Distribuidor"}
                          </Badge>
                          <Badge
                            className={
                              selectedPaqueteData.modalidad === "flexible"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-orange-100 text-orange-700"
                            }
                          >
                            {selectedPaqueteData.modalidad}
                          </Badge>
                          {selectedPaqueteData.destino && (
                            <Badge className="bg-gray-100 text-gray-700">
                              <MapPin className="w-3 h-3 mr-1" />
                              {selectedPaqueteData.destino.ciudad ??
                                selectedPaqueteData.destino_nombre}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Step 2: Salida form (visible after paquete selected) */}
                {selectedPaqueteID && (
                  <form>
                    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Paso 2: Datos de la Salida
                      </h2>

                      {/* Moneda — tomada automáticamente del paquete */}
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">Moneda</Label>
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700">
                          {selectedPaqueteData?.moneda
                            ? <><span className="font-medium">{selectedPaqueteData.moneda.nombre}</span><span className="text-gray-400">({selectedPaqueteData.moneda.simbolo})</span></>
                            : <span className="text-gray-400 italic">Se asignará al seleccionar un paquete</span>
                          }
                        </div>
                      </div>

                      {/* Fechas */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-medium">Fecha Salida *</Label>
                          <Input
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            className={
                              errors?.fecha_salida_v2
                                ? "border-2 !border-red-400 focus:!border-red-400 focus:ring-0 outline-none"
                                : "border-2 border-blue-200 focus:border-blue-500"
                            }
                            {...register("fecha_salida_v2", {
                              required: "La fecha de salida es requerida",
                              validate: (value) => {
                                const selectedDate = new Date(value)
                                const today = new Date()
                                today.setHours(0, 0, 0, 0)
                                if (selectedDate < today)
                                  return "La fecha de salida no puede ser anterior a hoy"
                                const fechaReg = getValues("fecha_regreso_v2")
                                if (fechaReg && new Date(value) >= new Date(fechaReg))
                                  return "La fecha de salida debe ser menor a la fecha de regreso"
                                return true
                              },
                            })}
                            onChange={(e) => {
                              setValue("fecha_salida_v2", e.target.value)
                              if (getValues("fecha_regreso_v2")) trigger("fecha_regreso_v2")
                            }}
                          />
                          {errors?.fecha_salida_v2 && (
                            <p className="text-red-400 text-sm">
                              {errors.fecha_salida_v2.message as string}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-700 font-medium">Fecha Regreso *</Label>
                          <Input
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            className={
                              errors?.fecha_regreso_v2
                                ? "border-2 !border-red-400 focus:!border-red-400 focus:ring-0 outline-none"
                                : "border-2 border-blue-200 focus:border-blue-500"
                            }
                            {...register("fecha_regreso_v2", {
                              required: "La fecha de regreso es requerida",
                              validate: (value) => {
                                const selectedDate = new Date(value)
                                const today = new Date()
                                today.setHours(0, 0, 0, 0)
                                if (selectedDate < today)
                                  return "La fecha de regreso no puede ser anterior a hoy"
                                const fechaSal = getValues("fecha_salida_v2")
                                if (fechaSal && new Date(value) <= new Date(fechaSal))
                                  return "La fecha de regreso debe ser mayor a la fecha de salida"
                                return true
                              },
                            })}
                            onChange={(e) => {
                              setValue("fecha_regreso_v2", e.target.value)
                              if (getValues("fecha_salida_v2")) trigger("fecha_salida_v2")
                            }}
                          />
                          {errors?.fecha_regreso_v2 && (
                            <p className="text-red-400 text-sm">
                              {errors.fecha_regreso_v2.message as string}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Auto-calculated prices */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
                        <div className="space-y-1">
                          <Label className="text-gray-600 text-sm">Cantidad noches</Label>
                          <div className="text-2xl font-bold text-blue-600">
                            {cantidadNoche || 0}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-gray-600 text-sm">Precio Desde</Label>
                          <div className="text-2xl font-bold text-blue-600">
                            {!watch("precio_desde_editable") ? (
                              <span className="text-sm text-amber-600 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                Ingresá los precios de las habitaciones
                              </span>
                            ) : (
                              formatearSeparadorMiles.format(+(watch("precio_desde_editable") ?? 0))
                            )}
                          </div>
                          <p className="text-xs text-gray-500">Mín. del catálogo</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-gray-600 text-sm">Precio Hasta</Label>
                          <div className="text-2xl font-bold text-blue-600">
                            {paqueteModalidad === "fijo" ? (
                              <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                                No aplica
                              </Badge>
                            ) : (
                              formatearSeparadorMiles.format(+(watch("precio_hasta_editable") ?? 0))
                            )}
                          </div>
                          {paqueteModalidad === "flexible" && (
                            <p className="text-xs text-gray-500">Máx. del catálogo</p>
                          )}
                        </div>
                      </div>

                      {/* Seña + Cupo */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-medium">Seña *</Label>
                          <Controller
                            name="senia"
                            control={control}
                            rules={{
                              required: "Debes completar este campo",
                              validate: (v) => {
                                if (
                                  v === null ||
                                  v === undefined ||
                                  v === "" ||
                                  isNaN(Number(v))
                                )
                                  return "Valor inválido"
                                if (Number(v) <= 0) return "El valor debe ser mayor que cero"
                                return true
                              },
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <div className="flex flex-col">
                                <NumericFormat
                                  value={field.value ?? ""}
                                  onValueChange={(vals) =>
                                    field.onChange(vals.floatValue ?? null)
                                  }
                                  onBlur={field.onBlur}
                                  thousandSeparator="."
                                  decimalSeparator=","
                                  allowNegative={false}
                                  decimalScale={0}
                                  allowLeadingZeros={false}
                                  placeholder="ej: 250"
                                  className={`flex-1 p-1 pl-2.5 rounded-md border-2 ${
                                    error
                                      ? "border-red-400 focus:!border-red-400 focus:ring-0 outline-none"
                                      : "border-blue-200 focus:border-blue-500"
                                  }`}
                                />
                                {error && (
                                  <span className="text-red-400 text-sm mt-1">
                                    {error.message}
                                  </span>
                                )}
                              </div>
                            )}
                          />
                        </div>

                        {/* Cupo (solo propio) */}
                        {propio && (
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Cupo *</Label>
                            <Controller
                              name="cupo"
                              control={control}
                              rules={{
                                required: "Debes completar este campo",
                                validate: (v) => {
                                  if (
                                    v === null ||
                                    v === undefined ||
                                    v === "" ||
                                    isNaN(Number(v))
                                  )
                                    return "Valor inválido"
                                  if (Number(v) <= 0) return "El valor debe ser mayor que cero"
                                  if (cantidadPasajeros && Number(v) > cantidadPasajeros) {
                                    handleShowToast("El cupo por salida no puede superar a la cantidad máxima de pasajeros", "error")
                                    return "El cupo no puede superar la cantidad máxima de pasajeros del paquete"
                                  }
                                  return true
                                },
                              }}
                              render={({ field, fieldState: { error } }) => (
                                <div className="flex flex-col">
                                  <NumericFormat
                                    value={field.value ?? ""}
                                    onValueChange={(vals) =>
                                      field.onChange(vals.floatValue ?? null)
                                    }
                                    onBlur={field.onBlur}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    allowNegative={false}
                                    decimalScale={0}
                                    allowLeadingZeros={false}
                                    placeholder="ej: 46"
                                    className={`flex-1 p-1 pl-2.5 rounded-md border-2 ${
                                      error
                                        ? "border-red-400 focus:!border-red-400 focus:ring-0 outline-none"
                                        : "border-blue-200 focus:border-blue-500"
                                    }`}
                                  />
                                  {error && (
                                    <span className="text-red-400 text-sm mt-1">
                                      {error.message}
                                    </span>
                                  )}
                                </div>
                              )}
                            />
                          </div>
                        )}
                      </div>

                      {/* Ganancia / Comision — oculto temporalmente */}

                      {/* Hotels section */}
                      <Card className="bg-gray-50">
                        <CardHeader>
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-primary" />
                            Hoteles y Precios
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Selecciona los hoteles disponibles y configura los precios por tipo de
                            habitación
                          </p>

                          {!propio && (
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-lg p-3 shadow-md">
                              <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 flex-shrink-0">
                                  <Building2 className="h-5 w-5 text-amber-700" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-base text-amber-900 mb-1">
                                    Paquete de Distribuidora
                                  </h4>
                                  <p className="text-sm text-amber-800 leading-relaxed mt-2">
                                    El precio puede ser único por hotel o variar según la
                                    habitación.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {paqueteModalidad === "fijo" && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                              <div className="flex items-center text-orange-800">
                                <AlertCircle className="w-5 h-5 mr-2" />
                                <span className="font-medium text-sm">
                                  Selecciona un hotel y tipo de habitación específicos para esta
                                  salida
                                </span>
                              </div>
                            </div>
                          )}
                        </CardHeader>

                        <CardContent className="space-y-4 overflow-y-auto max-h-[40vh]">
                          {isFetchingHoteles && (
                            <div className="flex justify-center py-4">
                              <Loader2Icon className="animate-spin w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          {!isFetchingHoteles && !dataHotelesList?.length && ciudadDataSelected && (
                            <p className="text-gray-500 text-sm text-center py-4">
                              No hay hoteles disponibles para este destino
                            </p>
                          )}
                          {!ciudadDataSelected && (
                            <p className="text-gray-500 text-sm text-center py-4">
                              El paquete seleccionado no tiene destino configurado
                            </p>
                          )}

                          {dataHotelesList?.map((hotel: any) => (
                            <Card
                              key={hotel.id}
                              className={`transition-all duration-200 border-2 ${
                                selectedHotels.has(hotel.id)
                                  ? "border-blue-300 bg-blue-50/30"
                                  : "border-gray-200 bg-white"
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="space-y-4">
                                  {/* Hotel header */}
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                      <Checkbox
                                        id={`hotel-${hotel.id}`}
                                        checked={selectedHotels.has(hotel.id)}
                                        onCheckedChange={() => handleHotelToggle(hotel.id, hotel)}
                                      />
                                      <div>
                                        <Label
                                          htmlFor={`hotel-${hotel.id}`}
                                          className="text-base font-semibold cursor-pointer"
                                        >
                                          {hotel.nombre}
                                        </Label>
                                        <div className="flex items-center gap-4 mt-1">
                                          <Badge
                                            variant="outline"
                                            className="bg-blue-50 text-blue-700 border-blue-300 font-medium"
                                          >
                                            {renderStars(hotel.estrellas)}
                                          </Badge>
                                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <MapPin className="w-3 h-3" />
                                            <span>{hotel.direccion}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Mode toggle — visible para todos (propio y distribuidora) */}
                                    {selectedHotels.has(hotel.id) && (
                                      <div className="flex flex-col items-end gap-1 shrink-0">
                                        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Modo de Precio</span>
                                        <div className="inline-flex rounded-lg bg-gray-100 p-0.5">
                                          <button
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); handleModeChange(hotel.id, "hotel") }}
                                            className={cn(
                                              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                                              modoPrecio[hotel.id] === "hotel"
                                                ? "bg-white text-blue-600 shadow-sm"
                                                : "text-gray-500 hover:text-gray-800"
                                            )}
                                          >
                                            <Building2 className="h-3.5 w-3.5" />
                                            Por Hotel
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); handleModeChange(hotel.id, "room") }}
                                            className={cn(
                                              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                                              modoPrecio[hotel.id] === "room"
                                                ? "bg-white text-emerald-600 shadow-sm"
                                                : "text-gray-500 hover:text-gray-800"
                                            )}
                                          >
                                            <DoorOpen className="h-3.5 w-3.5" />
                                            Por Habitación
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Configuración de habitaciones (solo cuando hotel seleccionado) */}
                                  {selectedHotels.has(hotel.id) && (
                                    <div className="mt-4">
                                      {/* Campo precio por hotel (modo hotel) */}
                                      {modoPrecio[hotel.id] === "hotel" && (
                                        <div className="mb-4 flex items-center gap-3">
                                          <Label className="text-sm font-medium text-gray-700 shrink-0">
                                            Precio Final del Hotel *
                                          </Label>
                                          <div className="w-48">
                                            <Controller
                                              name={`precio_habitacion_por_hotel_${hotel.id}`}
                                              control={control}
                                              rules={{
                                                required: "Debes completar este campo",
                                                validate: (v) => {
                                                  if (!v || isNaN(Number(v)) || Number(v) <= 0)
                                                    return "Debe ser mayor que cero"
                                                  return true
                                                },
                                              }}
                                              render={({ field, fieldState: { error } }) => (
                                                <div className="flex flex-col">
                                                  <NumericFormat
                                                    value={field.value ?? ""}
                                                    onValueChange={(vals) => {
                                                      const val = vals.floatValue ?? null
                                                      field.onChange(val)
                                                      if (val && val > 0 && modoPrecio[hotel.id] === "hotel") {
                                                        hotel?.habitaciones?.forEach((hab: any) =>
                                                          setValue(`precio_paquete_habitacion_${hab.id}`, val)
                                                        )
                                                      }
                                                      setPreciosCatalogoTrigger((t) => t + 1)
                                                    }}
                                                    onBlur={field.onBlur}
                                                    thousandSeparator="."
                                                    decimalSeparator=","
                                                    allowNegative={false}
                                                    decimalScale={0}
                                                    allowLeadingZeros={false}
                                                    placeholder="ej: 2.500.000"
                                                    className={`w-full p-1.5 pl-2.5 rounded-md border-2 text-sm ${
                                                      error ? "border-red-400" : "border-blue-200 focus:border-blue-500"
                                                    }`}
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
                                          {modoPrecio[hotel.id] === "hotel"
                                            ? "El precio del paquete es igual para todas las habitaciones. Asigná el cupo para cada tipo."
                                            : "Ingresá el cupo y el precio del paquete para cada tipo de habitación."}
                                        </p>
                                        {(() => {
                                          const total = hotel?.habitaciones?.length ?? 0
                                          const cupoTotal = hotel?.habitaciones?.reduce((acc: number, h: any) =>
                                            acc + (Number(getValues(`cupo_habitacion_${h.id}`)) || 0), 0)
                                          const sinCompletar = hotel?.habitaciones?.filter((h: any) => {
                                            const cupoV = getValues(`cupo_habitacion_${h.id}`)
                                            const precioV = getValues(`precio_paquete_habitacion_${h.id}`)
                                            return !(Number(cupoV) > 0 && Number(precioV) > 0)
                                          }).length ?? 0
                                          return (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                                                {total} tipo{total !== 1 ? "s" : ""} habilitado{total !== 1 ? "s" : ""}
                                              </span>
                                              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                                                {cupoTotal} cupos totales
                                              </span>
                                              {sinCompletar > 0 && (
                                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                                                  {sinCompletar} sin completar
                                                </span>
                                              )}
                                            </div>
                                          )
                                        })()}
                                      </div>

                                      {/* Grid de cards por habitación */}
                                      {hotel.habitaciones?.length === 0 ? (
                                        <p className="text-sm text-red-400">No tiene habitaciones asignadas</p>
                                      ) : (
                                        <div className={`grid gap-3 ${paqueteModalidad === "fijo" ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
                                          {hotel.habitaciones?.map((habitacion: any) => {
                                            const cupoVal = Number(getValues(`cupo_habitacion_${habitacion.id}`)) || 0
                                            const precioVal = modoPrecio[hotel.id] === "hotel"
                                              ? Number(getValues(`precio_habitacion_por_hotel_${hotel.id}`)) || 0
                                              : Number(getValues(`precio_paquete_habitacion_${habitacion.id}`)) || 0
                                            const isComplete = (propio ? cupoVal > 0 : true) && precioVal > 0
                                            const isFixedSelected = paqueteModalidad === "fijo" && fixedRoomTypeId === habitacion.id.toString()
                                            const showFields = paqueteModalidad === "flexible" || isFixedSelected

                                            return (
                                              <div
                                                key={habitacion.id}
                                                onClick={paqueteModalidad === "fijo" ? () => setFixedRoomTypeId(isFixedSelected ? "" : habitacion.id.toString()) : undefined}
                                                className={`rounded-xl border-2 p-3 transition-all ${
                                                  isFixedSelected
                                                    ? "border-green-400 bg-green-50 cursor-pointer"
                                                    : paqueteModalidad === "fijo"
                                                    ? "border-gray-200 hover:border-gray-300 cursor-pointer"
                                                    : "border-gray-200"
                                                }`}
                                              >
                                                {/* Card header: icono + nombre + badge */}
                                                <div className="flex items-center justify-between mb-3">
                                                  <div className="flex items-center gap-2">
                                                    {paqueteModalidad === "fijo" && (
                                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isFixedSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}>
                                                        {isFixedSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                                      </div>
                                                    )}
                                                    {getRoomIcon(habitacion.tipo)}
                                                    <div>
                                                      <p className="text-sm font-semibold text-gray-800">{getRoomTypeLabel(habitacion.tipo)}</p>
                                                      {habitacion.capacidad && (
                                                        <p className="text-xs text-gray-400">{habitacion.capacidad} {habitacion.capacidad === 1 ? "persona" : "personas"}</p>
                                                      )}
                                                    </div>
                                                  </div>
                                                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border ${
                                                    isComplete
                                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                      : "bg-amber-50 text-amber-700 border-amber-200"
                                                  }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isComplete ? "bg-emerald-500" : "bg-amber-400"}`} />
                                                    {isComplete ? "Completo" : "Pendiente"}
                                                  </span>
                                                </div>

                                                {/* Campos */}
                                                {showFields ? (
                                                  <div className="grid grid-cols-2 gap-3">
                                                    {/* Cupos (solo propio) */}
                                                    {propio && (
                                                      <div>
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Cupos Disponibles</p>
                                                        <Controller
                                                          name={`cupo_habitacion_${habitacion.id}`}
                                                          control={control}
                                                          rules={{
                                                            required: "Requerido",
                                                            validate: (v) => (!v || isNaN(Number(v)) || Number(v) <= 0) ? "Inválido" : true,
                                                          }}
                                                          render={({ field, fieldState: { error } }) => (
                                                            <div>
                                                              <NumericFormat
                                                                value={field.value ?? ""}
                                                                onValueChange={(vals) => field.onChange(vals.floatValue ?? null)}
                                                                onBlur={field.onBlur}
                                                                thousandSeparator="."
                                                                decimalSeparator=","
                                                                allowNegative={false}
                                                                decimalScale={0}
                                                                allowLeadingZeros={false}
                                                                placeholder="ej: 20"
                                                                className={`w-full p-1.5 pl-2 rounded-md border-2 text-sm ${error ? "border-red-400" : "border-gray-200 focus:border-blue-400"}`}
                                                                onClick={(e: any) => e.stopPropagation()}
                                                              />
                                                              <p className="text-[10px] text-gray-400 mt-0.5">Habitaciones disponibles</p>
                                                            </div>
                                                          )}
                                                        />
                                                      </div>
                                                    )}

                                                    {/* Precio catálogo (propio y distribuidora) */}
                                                    <div className={propio ? "" : "col-span-2"}>
                                                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Precio del Paquete</p>
                                                      <Controller
                                                        name={`precio_paquete_habitacion_${habitacion.id}`}
                                                        control={control}
                                                        rules={{
                                                          required: modoPrecio[hotel.id] === "hotel" ? false : "Requerido",
                                                          validate: (v) => {
                                                            if (modoPrecio[hotel.id] === "hotel") return true
                                                            if (!v || isNaN(Number(v)) || Number(v) <= 0) return "Inválido"
                                                            return true
                                                          },
                                                        }}
                                                        render={({ field, fieldState: { error } }) => (
                                                          <div>
                                                            <NumericFormat
                                                              value={modoPrecio[hotel.id] === "hotel"
                                                                ? (watch(`precio_habitacion_por_hotel_${hotel.id}`) ?? "")
                                                                : (watch(`precio_paquete_habitacion_${habitacion.id}`) ?? "")}
                                                              onValueChange={(vals) => {
                                                                const val = vals.floatValue ?? null
                                                                field.onChange(val && val > 0 ? val : null)
                                                                setPreciosCatalogoTrigger((t) => t + 1)
                                                              }}
                                                              onBlur={field.onBlur}
                                                              thousandSeparator="."
                                                              decimalSeparator=","
                                                              allowNegative={false}
                                                              decimalScale={0}
                                                              allowLeadingZeros={false}
                                                              placeholder="₲ 0"
                                                              disabled={modoPrecio[hotel.id] === "hotel"}
                                                              className={`w-full p-1.5 pl-2 rounded-md border-2 text-sm ${error ? "border-red-400" : "border-gray-200 focus:border-blue-400"} ${modoPrecio[hotel.id] === "hotel" ? "bg-gray-50 cursor-not-allowed text-gray-500" : ""}`}
                                                              onClick={(e: any) => e.stopPropagation()}
                                                            />
                                                            <p className="text-[10px] text-gray-400 mt-0.5">
                                                              {modoPrecio[hotel.id] === "hotel" ? "Precio tomado del hotel" : "Precio total del paquete para esta habitación"}
                                                            </p>
                                                          </div>
                                                        )}
                                                      />
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <p className="text-xs text-gray-400 text-center py-2">Seleccioná esta habitación para configurarla</p>
                                                )}
                                              </div>
                                            )
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </CardContent>
                      </Card>

                      {/* SECCIÓN: Costos de la Salida */}
                      {propio && (
                        <div className="bg-white rounded-lg shadow-md p-6 mt-2">
                          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Tag className="w-5 h-5 text-emerald-600" />
                            Costos de la Salida
                          </h2>

                          {(() => {
                            const cupoSalida = Number(watch('cupo')) || 0;
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
                                                      ? { ...i, monto: selectedPaqueteData?.items_costo_default?.find((d: any) => (d.tipo_costo?.id ?? d.tipo_costo_id) === item.tipo_costo_id)?.monto ?? i.monto, origen: 'paquete' }
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
                        const cupo = Number(watch('cupo')) || 0;
                        const precioVenta = Number(watch('precio_desde_editable')) || 0;
                        const precioHasta = Number(watch('precio_hasta_editable')) || 0;
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
                                    {paqueteModalidad === 'flexible' && precioHasta > 0 && (
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
                                </div>
                                <div className={`mt-3 pt-3 border-t flex items-center gap-1.5 text-xs font-medium ${
                                  esVentaPerdida
                                    ? 'border-red-200 text-red-600'
                                    : costoTotal > 0 && margen < 10
                                    ? 'border-amber-200 text-amber-700'
                                    : 'border-emerald-200 text-emerald-700'
                                }`}>
                                  {/* Margen y mensajes — comentado temporalmente */}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Action buttons */}
                      <div className="flex justify-end gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent cursor-pointer"
                          onClick={() => {
                            resetForm()
                            setActiveTab("list")
                          }}
                        >
                          Cancelar
                        </Button>
                        {siTienePermiso("salidas", "crear") && (
                          <Button
                            type="button"
                            className="bg-emerald-500 hover:bg-emerald-600 cursor-pointer"
                            disabled={isPendingMutation || validando}
                            onClick={handleSubmitClick}
                          >
                            {isPendingMutation ? (
                              <>
                                <Loader2Icon className="animate-spin w-4 h-4 mr-2" />
                                Creando...
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Crear Salida
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
