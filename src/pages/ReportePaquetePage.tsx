/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { use, useEffect, useState, useMemo } from "react"
import {
  Search,
  Download,
  Eye,
  Loader2Icon,
  FileText,
  X,
  Package,
  MapPin,
  Users,
  TrendingUp,
  Bus,
  Plane,
  Croissant,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight } from "react-icons/fa"
import { useQuery } from '@tanstack/react-query'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { PaqueteListado, RespuestaPaginada } from "@/types/reportePaquetes"
import { formatearFecha, formatearSeparadorMiles, quitarAcentos } from "@/helper/formatter"
import {
  fetchReportePaquetes, 
  fetchDestinosParaFiltro,
  fetchPaisesParaFiltro,
  fetchDistribuidorasParaFiltro,
  fetchTiposPaqueteParaFiltro,
  exportarReportePaquetesPDF, 
  exportarReportePaquetesExcel 
} from "@/components/utils/httpReportesPaquetes"
import { fetchDataZonasGeograficasTodos } from "@/components/utils/httpNacionalidades"
import Modal from "@/components/Modal"
import { useSessionStore } from "@/store/sessionStore"
import { ToastContext } from "@/context/ToastContext"

let dataList: PaqueteListado[] = []

export default function ReportePaquetePage() {
  const { siTienePermiso } = useSessionStore()
  const { handleShowToast } = use(ToastContext)
  
  const [onVerDetalles, setOnVerDetalles] = useState(false)
  const [dataDetalle, setDataDetalle] = useState<PaqueteListado>()
  const [exportando, setExportando] = useState(false)

  // Calcular fechas por defecto: primer día del mes actual y hoy
  const obtenerFechasPorDefecto = () => {
    const hoy = new Date()
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    
    return {
      fecha_desde: primerDiaMes.toISOString().split('T')[0],
      fecha_hasta: hoy.toISOString().split('T')[0]
    }
  }

  const fechasDefecto = obtenerFechasPorDefecto()

  const [filtros, setFiltros] = useState({
    fecha_desde: fechasDefecto.fecha_desde,
    fecha_hasta: fechasDefecto.fecha_hasta,
    fecha_salida_desde: "",
    fecha_salida_hasta: "",
    destino_id: null as number | null,
    pais_id: null as number | null,
    zona_geografica_id: null as number | null,
    tipo_paquete_id: null as number | null,
    estado: "activo",
    personalizado: null as boolean | null,
    propio: null as boolean | null,
    distribuidora_id: null as number | null,
    busqueda: "",
    fecha_salida_proxima: null as number | null,
    tiene_cupos_disponibles: null as boolean | null
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [paginacion, setPaginacion] = useState<RespuestaPaginada>({
    next: null,
    totalItems: 0,
    previous: null,
    totalPages: 1,
    pageSize: 20
  })

  // Query para obtener el reporte
  const { data, isFetching, isError, error } = useQuery({
    queryKey: ['reporte-paquetes', currentPage, paginacion.pageSize, filtros],
    queryFn: () => fetchReportePaquetes(currentPage, paginacion.pageSize, filtros),
    staleTime: 5 * 60 * 1000
  })

  // Query para obtener destinos
  const { data: destinosData, isFetching: isFetchingDestinos } = useQuery({
    queryKey: ['destinos-filtro'],
    queryFn: fetchDestinosParaFiltro,
    staleTime: 10 * 60 * 1000
  })

  // Normalizar destinosList para asegurarnos de que siempre sea un array
  const destinosList = useMemo(() => {
    return Array.isArray(destinosData) ? destinosData : []
  }, [destinosData])

  // Query para obtener zonas geográficas
  const { data: dataZonaGeograficaList, isFetching: isFetchingZonaGeografica } = useQuery({
    queryKey: ['todos-zona-geografica'],
    queryFn: () => fetchDataZonasGeograficasTodos(),
    staleTime: 5 * 60 * 1000
  })

  // Query para obtener países
  const { data: dataPaisesList, isFetching: isFetchingPaises } = useQuery({
    queryKey: ['paises-filtro'],
    queryFn: fetchPaisesParaFiltro,
    staleTime: 10 * 60 * 1000
  })

  // Query para obtener distribuidoras
  const { data: dataDistribuidorasList, isFetching: isFetchingDistribuidoras } = useQuery({
    queryKey: ['distribuidoras-filtro'],
    queryFn: fetchDistribuidorasParaFiltro,
    staleTime: 10 * 60 * 1000
  })

  // Query para obtener tipos de paquete
  const { data: dataTiposPaquetesList, isFetching: isFetchingTiposPaquetes } = useQuery({
    queryKey: ['tipos-paquete-filtro'],
    queryFn: fetchTiposPaqueteParaFiltro,
    staleTime: 10 * 60 * 1000
  })

  // Procesar datos
  if (!isFetching && !isError && data?.data?.results) {
    dataList = data.data.results.map((paq: PaqueteListado, index: number) => ({
      ...paq,
      numero: (currentPage - 1) * paginacion.pageSize + index + 1
    }))
  }

  const totalItems = dataList?.length
  const startIndex = (currentPage - 1) * paginacion.pageSize
  const endIndex = startIndex + paginacion.pageSize

  // Actualizar paginación cuando lleguen los datos
  useEffect(() => {
    if (!data) return
    setPaginacion({
      next: null,
      totalItems: data.data.totalItems ?? 0,
      previous: null,
      totalPages: data.data.totalPages ?? 1,
      pageSize: data.data.pageSize ?? 20
    })
  }, [data])

  // Funciones de paginación
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: string) => {
    setPaginacion(prevPagination => ({ ...prevPagination, pageSize: Number(value) }))
    setCurrentPage(1)
  }

  const handleVerDetalles = (paquete: PaqueteListado) => {
    setDataDetalle(paquete)
    setOnVerDetalles(true)
  }

  const handleCloseVerDetalles = () => {
    setOnVerDetalles(false)
    setDataDetalle(undefined)
  }

  const handleLimpiarFiltros = () => {
    const fechasDefecto = obtenerFechasPorDefecto()
    setFiltros({
      fecha_desde: fechasDefecto.fecha_desde,
      fecha_hasta: fechasDefecto.fecha_hasta,
      fecha_salida_desde: "",
      fecha_salida_hasta: "",
      destino_id: null,
      pais_id: null,
      zona_geografica_id: null,
      tipo_paquete_id: null,
      estado: "activo",
      personalizado: null,
      propio: null,
      distribuidora_id: null,
      busqueda: "",
      fecha_salida_proxima: null,
      tiene_cupos_disponibles: null
    })
    setCurrentPage(1)
  }

  const handleExportar = async (formato: 'pdf' | 'excel') => {
    try {
      setExportando(true)
      
      if (formato === 'pdf') {
        await exportarReportePaquetesPDF(filtros)
        handleShowToast('Reporte PDF descargado exitosamente', 'success')
      } else {
        await exportarReportePaquetesExcel(filtros)
        handleShowToast('Reporte Excel descargado exitosamente', 'success')
      }
    } catch (error: any) {
      console.error('Error al exportar:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al exportar el reporte'
      handleShowToast(errorMessage, 'error')
    } finally {
      setExportando(false)
    }
  }

  return (
    <>
      {/* Modal Ver Detalles */}
      {onVerDetalles && dataDetalle && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="modal-detalles-reserva bg-white/95 rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto backdrop-blur-sm">
            <Modal onClose={handleCloseVerDetalles} claseCss={'modal-detalles'}>
              <div className="bg-white rounded-lg shadow-lg p-6">
                {/* Header */}
                <div className="mb-6 border-b pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {dataDetalle.nombre}
                      </h2>
                      <p className="text-gray-600">{dataDetalle.codigo}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Información General */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Tipo de Paquete</Label>
                      <p className="mt-1 text-gray-900 font-medium">
                        {dataDetalle.tipo_paquete}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Estado</Label>
                      <div className="mt-1">
                        <Badge className={dataDetalle.activo
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'}>
                          {dataDetalle.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Destino */}
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Destino</Label>
                    <p className="mt-1 text-gray-900">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      {dataDetalle.destino_completo}
                    </p>
                  </div>

                  {/* Distribuidora */}
                  {dataDetalle.distribuidora && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Distribuidora</Label>
                      <p className="mt-1 text-gray-900">{dataDetalle.distribuidora}</p>
                    </div>
                  )}

                  {/* Precios */}
                  <div className="grid grid-cols-3 gap-4 bg-purple-50 p-4 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Precio</Label>
                      <p className="text-lg font-bold text-gray-900">
                        {dataDetalle.moneda === 'USD' ? 'USD' : 'Gs.'} {formatearSeparadorMiles.format(Number(dataDetalle.precio))}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Precio Unitario</Label>
                      <p className="text-lg font-bold text-gray-900">
                        {dataDetalle.moneda === 'USD' ? 'USD' : 'Gs.'} {formatearSeparadorMiles.format(Number(dataDetalle.precio_unitario))}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Seña</Label>
                      <p className="text-lg font-bold text-gray-900">
                        {dataDetalle.moneda === 'USD' ? 'USD' : 'Gs.'} {formatearSeparadorMiles.format(Number(dataDetalle.sena))}
                      </p>
                    </div>
                  </div>

                  {/* Fechas y Duración */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Fecha Inicio</Label>
                      <p className="mt-1 text-gray-900">
                        {dataDetalle.fecha_inicio ? formatearFecha(dataDetalle.fecha_inicio) : '-'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Fecha Fin</Label>
                      <p className="mt-1 text-gray-900">
                        {dataDetalle.fecha_fin ? formatearFecha(dataDetalle.fecha_fin) : '-'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Duración</Label>
                      <p className="mt-1 text-gray-900">{dataDetalle.duracion_dias} días</p>
                    </div>
                  </div>

                  {/* Cupos */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Cantidad Pasajeros</Label>
                      <p className="mt-1 text-gray-900 font-medium">
                        <Users className="h-4 w-4 inline mr-1" />
                        {dataDetalle.cantidad_pasajeros}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Cupos Ocupados</Label>
                      <p className="mt-1 text-red-600 font-medium">{dataDetalle.cupos_ocupados}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Cupos Disponibles</Label>
                      <p className="mt-1 text-green-600 font-medium">{dataDetalle.cupos_disponibles}</p>
                    </div>
                  </div>

                  {/* Características */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Personalizado</Label>
                      <div className="mt-1">
                        <Badge className={dataDetalle.personalizado
                          ? 'bg-blue-100 text-blue-700 border-blue-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'}>
                          {dataDetalle.personalizado ? 'Sí' : 'No'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Propio</Label>
                      <div className="mt-1">
                        <Badge className={dataDetalle.propio
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'}>
                          {dataDetalle.propio ? 'Sí' : 'No'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Reservas</Label>
                      <p className="mt-1 text-gray-900 font-medium">{dataDetalle.reservas_count}</p>
                    </div>
                  </div>

                  {/* Servicios */}
                  {dataDetalle.servicios && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Servicios Incluidos</Label>
                      <p className="mt-1 text-gray-900">{dataDetalle.servicios}</p>
                    </div>
                  )}

                  {/* Fecha de Creación */}
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Fecha de Creación</Label>
                    <p className="mt-1 text-gray-900">
                      {formatearFecha(dataDetalle.fecha_creacion)}
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
                </div>
              </div>
            </Modal>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-semibold text-gray-900">Reporte de Paquetes Turísticos</h1>
            </div>
            <p className="text-gray-600">Visualiza y analiza todos los paquetes turísticos disponibles.</p>
          </div>
          <div className="flex gap-3">
            {siTienePermiso("reportes", "exportar") && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-emerald-200 text-emerald-700 cursor-pointer hover:bg-emerald-50 bg-transparent"
                    disabled={exportando}
                  >
                    {exportando ? (
                      <>
                        <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                        Exportando...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem 
                    onClick={() => handleExportar('pdf')} 
                    className="cursor-pointer"
                    disabled={exportando}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleExportar('excel')} 
                    className="cursor-pointer"
                    disabled={exportando}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Stats Cards - Resumen */}
        {data?.resumen && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Paquetes</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.resumen.total_registros}</div>
                <p className="text-xs text-muted-foreground">
                  {data.resumen.paquetes_activos} activos, {data.resumen.paquetes_inactivos} inactivos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-blue-600">
                  Gs. {formatearSeparadorMiles.format(Number(data.resumen.precio_promedio))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Precio Mínimo</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-600">
                  Gs. {formatearSeparadorMiles.format(Number(data.resumen.precio_minimo))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Precio Máximo</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-red-600">
                  Gs. {formatearSeparadorMiles.format(Number(data.resumen.precio_maximo))}
                </div>
              </CardContent>
            </Card>

            {data.resumen.paquetes_personalizados > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Paquetes Personalizados</CardTitle>
                  <Package className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {data.resumen.paquetes_personalizados}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {((data.resumen.paquetes_personalizados / data.resumen.total_registros) * 100).toFixed(1)}% del total
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Main Content - Tabla con filtros */}
        <Card className="border-purple-200 pt-0">
          <CardHeader className="bg-purple-50 border-b border-purple-200 pt-8">
            <div className="flex flex-col items-start justify-between gap-4">
              <div className="w-full flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-purple-900">Listado de Paquetes</CardTitle>
                    {!isFetching && data?.data?.totalItems !== undefined && (
                      <Badge className="bg-purple-600 text-white border-purple-700 px-3 py-1 text-sm font-semibold">
                        Total: {formatearSeparadorMiles.format(data.data.totalItems)} paquete{data.data.totalItems !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-purple-700 mt-1">
                    {!isFetching && dataList.length > 0 
                      ? `Mostrando ${startIndex + 1}-${Math.min(endIndex, totalItems)} de ${data?.data.totalItems || 0} resultados`
                      : 'Cargando paquetes...'}
                  </CardDescription>
                </div>
              </div>

               {/* Filtros */}
               <div className="w-full space-y-4">
                 {/* Fila 1: Fechas de Creación, Zona Geográfica y País */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   <div className="space-y-2">
                     <Label className="text-sm font-medium">Fecha Creación Desde</Label>
                     <Input
                       type="date"
                       value={filtros.fecha_desde}
                       onChange={(e) => {
                         setFiltros({ ...filtros, fecha_desde: e.target.value })
                         setCurrentPage(1)
                       }}
                       className="border-purple-200"
                     />
                   </div>

                   <div className="space-y-2">
                     <Label className="text-sm font-medium">Fecha Creación Hasta</Label>
                     <Input
                       type="date"
                       value={filtros.fecha_hasta}
                       onChange={(e) => {
                         setFiltros({ ...filtros, fecha_hasta: e.target.value })
                         setCurrentPage(1)
                       }}
                       className="border-purple-200"
                     />
                   </div>

                   <div className="space-y-2">
                     <Label className="text-sm font-medium">Zona Geográfica</Label>
                     <Select
                       value={filtros.zona_geografica_id?.toString() || "todos"}
                       onValueChange={(val) => {
                         setFiltros({ ...filtros, zona_geografica_id: val === "todos" ? null : Number(val) })
                         setCurrentPage(1)
                       }}
                     >
                       <SelectTrigger className="cursor-pointer border-purple-200">
                         <SelectValue placeholder="Todas las zonas" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="todos">Todas las zonas</SelectItem>
                         {!isFetchingZonaGeografica && Array.isArray(dataZonaGeograficaList) && dataZonaGeograficaList.length > 0 ? (
                           dataZonaGeograficaList.map((zona: any) => (
                             <SelectItem key={zona.id} value={zona.id.toString()}>
                               {zona.nombre}
                             </SelectItem>
                           ))
                         ) : (
                           !isFetchingZonaGeografica && (
                             <SelectItem value="sin-datos" disabled>
                               No hay zonas disponibles
                             </SelectItem>
                           )
                         )}
                       </SelectContent>
                     </Select>
                   </div>

                   <div className="space-y-2">
                     <Label className="text-sm font-medium">País</Label>
                     <Select
                       value={filtros.pais_id?.toString() || "todos"}
                       onValueChange={(val) => {
                         setFiltros({ ...filtros, pais_id: val === "todos" ? null : Number(val) })
                         setCurrentPage(1)
                       }}
                     >
                       <SelectTrigger className="cursor-pointer border-purple-200">
                         <SelectValue placeholder="Todos los países" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="todos">Todos los países</SelectItem>
                         {!isFetchingPaises && Array.isArray(dataPaisesList) && dataPaisesList.length > 0 ? (
                           dataPaisesList.map((pais: any) => (
                             <SelectItem key={pais.id} value={pais.id.toString()}>
                               {pais.nombre}
                             </SelectItem>
                           ))
                         ) : (
                           !isFetchingPaises && (
                             <SelectItem value="sin-datos" disabled>
                               No hay países disponibles
                             </SelectItem>
                           )
                         )}
                       </SelectContent>
                     </Select>
                   </div>
                 </div>

                 {/* Fila 2: Estado, Destino, Tipo Paquete, Propiedad */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   <div className="space-y-2">
                     <Label className="text-sm font-medium">Estado</Label>
                     <Select
                       value={filtros.estado}
                       onValueChange={(val) => {
                         setFiltros({ ...filtros, estado: val as 'activo' | 'inactivo' | 'todos' })
                         setCurrentPage(1)
                       }}
                     >
                       <SelectTrigger className="cursor-pointer border-purple-200">
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="activo">Activos</SelectItem>
                         <SelectItem value="inactivo">Inactivos</SelectItem>
                         <SelectItem value="todos">Todos</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>

                   <div className="space-y-2">
                     <Label className="text-sm font-medium">Destino</Label>
                     <Select
                       value={filtros.destino_id?.toString() || "todos"}
                       onValueChange={(val) => {
                         setFiltros({ ...filtros, destino_id: val === "todos" ? null : Number(val) })
                         setCurrentPage(1)
                       }}
                     >
                       <SelectTrigger className="cursor-pointer border-purple-200">
                         <SelectValue placeholder="Todos los destinos" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="todos">Todos los destinos</SelectItem>
                         {!isFetchingDestinos && Array.isArray(destinosList) && destinosList.length > 0 ? (
                           destinosList.map((destino: any) => {
                             const ciudad = destino.ciudad || {}
                             const nombreCiudad = ciudad.nombre || destino.nombre || 'Sin nombre'
                             const nombrePais = ciudad.pais_nombre || destino.pais_nombre || ''
                             const textoCompleto = nombrePais ? `${nombreCiudad}, ${nombrePais}` : nombreCiudad
                             
                             return (
                               <SelectItem key={destino.id} value={destino.id.toString()}>
                                 {textoCompleto}
                               </SelectItem>
                             )
                           })
                         ) : (
                           !isFetchingDestinos && (
                             <SelectItem value="sin-datos" disabled>
                               No hay destinos disponibles
                             </SelectItem>
                           )
                         )}
                       </SelectContent>
                     </Select>
                   </div>

                   <div className="space-y-2">
                     <Label className="text-sm font-medium">Tipo de Paquete</Label>
                     {isFetchingTiposPaquetes && (
                       <Select>
                         <SelectTrigger className="cursor-pointer border-purple-200 flex">
                           <div className="w-full flex items-center justify-center">
                             <Loader2Icon className="animate-spin w-6 h-6 text-gray-300"/>
                           </div>
                         </SelectTrigger>
                       </Select>
                     )}
                     {!isFetchingTiposPaquetes && (
                       <Select
                         value={filtros.tipo_paquete_id?.toString() || "todos"}
                         onValueChange={(val) => {
                           setFiltros({ ...filtros, tipo_paquete_id: val === "todos" ? null : Number(val) })
                           setCurrentPage(1)
                         }}
                       >
                         <SelectTrigger className="cursor-pointer border-purple-200">
                           <SelectValue placeholder="Todos los tipos" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="todos">Todos los tipos</SelectItem>
                           {Array.isArray(dataTiposPaquetesList) && dataTiposPaquetesList.length > 0 ? (
                             dataTiposPaquetesList.map((tipo: any) => (
                               <SelectItem key={tipo.id} value={tipo.id.toString()}>
                                 {tipo.nombre}
                               </SelectItem>
                             ))
                           ) : (
                             !isFetchingTiposPaquetes && (
                               <SelectItem value="sin-datos" disabled>
                                 No hay tipos disponibles
                               </SelectItem>
                             )
                           )}
                         </SelectContent>
                       </Select>
                     )}
                   </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Propiedad</Label>
                    <Select
                      value={filtros.propio === null ? "todos" : filtros.propio.toString()}
                      onValueChange={(val) => {
                        const nuevoPropio = val === "todos" ? null : val === "true"
                        setFiltros({ 
                          ...filtros, 
                          propio: nuevoPropio,
                          // Si selecciona "Propio", limpiar el filtro de distribuidora
                          distribuidora_id: nuevoPropio === true ? null : filtros.distribuidora_id
                        })
                        setCurrentPage(1)
                      }}
                    >
                      <SelectTrigger className="cursor-pointer border-purple-200">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="true">Propios</SelectItem>
                        <SelectItem value="false">Distribuidor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                 </div>

                 {/* Fila 3: Distribuidora, Salida Próxima, Disponibilidad de Cupos */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Distribuidora</Label>
                    {isFetchingDistribuidoras && (
                      <Select>
                        <SelectTrigger className="cursor-pointer border-purple-200 flex">
                          <div className="w-full flex items-center justify-center">
                            <Loader2Icon className="animate-spin w-6 h-6 text-gray-300"/>
                          </div>
                        </SelectTrigger>
                      </Select>
                    )}
                    {!isFetchingDistribuidoras && (
                      <Select
                        value={filtros.distribuidora_id?.toString() || "todos"}
                        onValueChange={(val) => {
                          setFiltros({ ...filtros, distribuidora_id: val === "todos" ? null : Number(val) })
                          setCurrentPage(1)
                        }}
                        disabled={filtros.propio === true}
                      >
                        <SelectTrigger className={`cursor-pointer border-purple-200 ${filtros.propio === true ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <SelectValue placeholder={filtros.propio === true ? "No aplica para paquetes propios" : "Todas"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todas</SelectItem>
                          {Array.isArray(dataDistribuidorasList) && dataDistribuidorasList.length > 0 ? (
                            dataDistribuidorasList.map((distribuidora: any) => (
                              <SelectItem key={distribuidora.id} value={distribuidora.id.toString()}>
                                {distribuidora.nombre || distribuidora.razon_social}
                              </SelectItem>
                            ))
                          ) : (
                            !isFetchingDistribuidoras && (
                              <SelectItem value="sin-datos" disabled>
                                No hay distribuidoras
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                   <div className="space-y-2">
                     <Label className="text-sm font-medium">Salida Próxima</Label>
                     <Select
                       value={filtros.fecha_salida_proxima?.toString() || "todos"}
                       onValueChange={(val) => {
                         setFiltros({ ...filtros, fecha_salida_proxima: val === "todos" ? null : Number(val) })
                         setCurrentPage(1)
                       }}
                     >
                       <SelectTrigger className="cursor-pointer border-purple-200">
                         <SelectValue placeholder="Todas" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="todos">Todas</SelectItem>
                         <SelectItem value="7">Próximos 7 días</SelectItem>
                         <SelectItem value="15">Próximos 15 días</SelectItem>
                         <SelectItem value="30">Próximos 30 días</SelectItem>
                         <SelectItem value="60">Próximos 60 días</SelectItem>
                         <SelectItem value="90">Próximos 90 días</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>

                   <div className="space-y-2">
                     <Label className="text-sm font-medium">Disponibilidad de Cupos</Label>
                     <Select
                       value={filtros.tiene_cupos_disponibles === null ? "todos" : filtros.tiene_cupos_disponibles.toString()}
                       onValueChange={(val) => {
                         setFiltros({ 
                           ...filtros, 
                           tiene_cupos_disponibles: val === "todos" ? null : val === "true" 
                         })
                         setCurrentPage(1)
                       }}
                     >
                       <SelectTrigger className="cursor-pointer border-purple-200">
                         <SelectValue placeholder="Todos" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="todos">Todos</SelectItem>
                         <SelectItem value="true">Con cupos</SelectItem>
                         <SelectItem value="false">Sin cupos</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                 </div>

                {/* Búsqueda */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nombre de paquete..."
                      value={filtros.busqueda}
                      onChange={(e) => {
                        setFiltros({ ...filtros, busqueda: e.target.value })
                        setCurrentPage(1)
                      }}
                      className="pl-10 border-purple-200"
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLimpiarFiltros}
                    className="cursor-pointer border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpiar
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Mostrar error de API */}
            {isError && error && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <X className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar datos</h3>
                <p className="text-gray-500">{(error as any)?.message || 'Ocurrió un error al cargar el reporte'}</p>
              </div>
            )}

            {/* Tabla de datos */}
            {!isError && (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="flex items-center justify-center w-10 font-semibold text-gray-700">#</TableHead>
                    <TableHead className="font-semibold text-gray-700">Código</TableHead>
                    <TableHead className="font-semibold text-gray-700">Nombre</TableHead>
                    <TableHead className="font-semibold text-gray-700">Destino</TableHead>
                    <TableHead className="font-semibold text-gray-700">Tipo</TableHead>
                    <TableHead className="font-semibold text-gray-700">Precio</TableHead>
                    <TableHead className="font-semibold text-gray-700">Cupos Disponibles</TableHead>
                    <TableHead className="font-semibold text-gray-700">Propiedad</TableHead>
                    <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                    <TableHead className="w-20 font-semibold text-gray-700">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isFetching && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-12">
                        <Loader2Icon className="animate-spin w-10 h-10 text-gray-500 mx-auto" />
                      </TableCell>
                    </TableRow>
                  )}

                  {!isFetching && dataList.length > 0 && dataList.map((paquete: any) => (
                    <TableRow
                      key={paquete.id}
                      className="hover:bg-purple-50 transition-colors cursor-pointer"
                    >
                      <TableCell>
                        <div className="font-medium text-gray-900 pl-2">
                          {paquete.numero}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {paquete.codigo}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm text-gray-900 font-medium max-w-xs truncate">
                          {paquete.nombre}
                        </div>
                        {paquete.personalizado && (
                          <Badge className="mt-1 bg-blue-100 text-blue-700 border-blue-200 text-xs">
                            Personalizado
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="text-sm text-gray-900">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {paquete.destino_ciudad}
                        </div>
                        <div className="text-xs text-gray-500">
                          {paquete.destino_pais}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={`${
                            quitarAcentos(paquete.tipo_paquete.toLowerCase()) === "terrestre"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : quitarAcentos(paquete.tipo_paquete.toLowerCase()) === "aereo"
                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                : "bg-cyan-100 text-cyan-700 border-cyan-200"
                          } border font-sans flex items-center gap-1`}
                        >
                          {quitarAcentos(paquete.tipo_paquete.toLowerCase()) === "terrestre" ? (
                            <Bus className="h-3 w-3" />
                          ) : quitarAcentos(paquete.tipo_paquete.toLowerCase()) === "aereo" ? (
                            <Plane className="h-3 w-3" />
                          ) : (
                            <Croissant className="h-3 w-3" />
                          )}
                          <span>{paquete.tipo_paquete}</span>
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {paquete.moneda === 'USD' ? 'USD' : 'Gs.'} {formatearSeparadorMiles.format(Number(paquete.precio))}
                        </div>
                      </TableCell>

                      <TableCell>
                        {paquete.propio && paquete.cantidad_pasajeros ? (
                          <div className="text-sm">
                            <span className="text-green-600 font-medium">
                              {paquete.cupos_disponibles ?? 0}
                            </span>
                            <span className="text-gray-400"> / </span>
                            <span className="text-gray-600">{paquete.cantidad_pasajeros}</span>
                            <div className="text-xs text-gray-500 mt-1">
                              Ocupados: {paquete.cupos_ocupados ?? 0}
                            </div>
                          </div>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                            Sujeto a disponibilidad
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <div>
                          <Badge className={`border ${paquete.propio ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                            {paquete.propio ? 'Propio' : 'Distribuidor'}
                          </Badge>
                          {!paquete.propio && paquete.distribuidora_nombre && (
                            <div className="text-xs text-gray-500 mt-1">{paquete.distribuidora_nombre}</div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge className={paquete.activo
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'}>
                          {paquete.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-gray-100 cursor-pointer">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="hover:bg-purple-50 cursor-pointer"
                              onClick={() => handleVerDetalles(paquete)}
                            >
                              <Eye className="h-4 w-4 mr-2 text-purple-500" />
                              Ver detalles
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}

                  {!isFetching && dataList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10}>
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Search className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron paquetes</h3>
                          <p className="text-gray-500 mb-4">Intenta ajustar los filtros de búsqueda.</p>
                          <Button
                            onClick={handleLimpiarFiltros}
                            className="bg-purple-500 hover:bg-purple-600 cursor-pointer"
                          >
                            Limpiar filtros
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            {/* Paginación */}
            {!isFetching && dataList.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-gray-600">Mostrar:</Label>
                    <Select value={paginacion.pageSize.toString()} onValueChange={handleItemsPerPageChange}>
                      <SelectTrigger className="w-20 h-8 cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-600">por página</span>
                  </div>

                  <div className="text-sm text-gray-600">
                    Página {currentPage} de {paginacion.totalPages}
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
                    <FaAngleDoubleLeft />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 cursor-pointer"
                    title="Anterior"
                  >
                    <FaAngleLeft />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, paginacion.totalPages) }, (_, i) => {
                      let pageNumber
                      if (paginacion.totalPages <= 5) {
                        pageNumber = i + 1
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1
                      } else if (currentPage >= paginacion.totalPages - 2) {
                        pageNumber = paginacion.totalPages - 4 + i
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
                            currentPage === pageNumber ? "bg-purple-500 hover:bg-purple-600" : ""
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
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === paginacion.totalPages}
                    className="h-8 cursor-pointer"
                    title="Siguiente"
                  >
                    <FaAngleRight />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(paginacion.totalPages)}
                    disabled={currentPage === paginacion.totalPages}
                    className="h-8 cursor-pointer"
                    title="Última"
                  >
                    <FaAngleDoubleRight />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

