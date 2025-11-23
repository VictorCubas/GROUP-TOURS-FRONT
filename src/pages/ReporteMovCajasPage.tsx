/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { use, useEffect, useState } from "react"
import {
  Search,
  Download,
  Eye,
  Loader2Icon,
  FileText,
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
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

import type { MovimientoCajaListado, RespuestaPaginada } from "@/types/reporteMovimientos"
import { formatearFecha, formatearSeparadorMiles } from "@/helper/formatter"
import { fetchReporteMovimientos, fetchCajasParaFiltro, exportarReporteMovimientosPDF, exportarReporteMovimientosExcel } from "@/components/utils/httpReportesMovimientos"
import Modal from "@/components/Modal"
import { useSessionStore } from "@/store/sessionStore"
import { ToastContext } from "@/context/ToastContext"

let dataList: MovimientoCajaListado[] = []

export default function ReporteMovCajasPage() {
  const { siTienePermiso, hasRole } = useSessionStore()
  const { handleShowToast } = use(ToastContext)
  
  const [onVerDetalles, setOnVerDetalles] = useState(false)
  const [dataDetalle, setDataDetalle] = useState<MovimientoCajaListado>()
  const [exportando, setExportando] = useState(false)

  // Obtener fechas por defecto (últimos 30 días)
  const getFechaDefecto = () => {
    const hoy = new Date()
    const hace30Dias = new Date()
    hace30Dias.setDate(hoy.getDate() - 30)
    
    return {
      desde: hace30Dias.toISOString().split('T')[0],
      hasta: hoy.toISOString().split('T')[0]
    }
  }

  const fechasDefault = getFechaDefecto()

  const [filtros, setFiltros] = useState({
    fecha_desde: fechasDefault.desde,
    fecha_hasta: fechasDefault.hasta,
    caja_id: null as number | null,
    tipo_movimiento: "todas",
    metodo_pago: "",
    busqueda: ""
  })

  const [busquedaLocal, setBusquedaLocal] = useState("")

  const [currentPage, setCurrentPage] = useState(1)
  const [paginacion, setPaginacion] = useState<RespuestaPaginada>({
    next: null,
    totalItems: 0,
    previous: null,
    totalPages: 1,
    pageSize: 20
  })

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltros(prev => ({ ...prev, busqueda: busquedaLocal }))
      setCurrentPage(1)
    }, 750)

    return () => clearTimeout(timer)
  }, [busquedaLocal])

  // Query para obtener el reporte
  const { data, isFetching, isError, error } = useQuery({
    queryKey: ['reporte-movimientos', currentPage, paginacion.pageSize, filtros],
    queryFn: () => fetchReporteMovimientos(currentPage, paginacion.pageSize, filtros),
    staleTime: 5 * 60 * 1000,
    enabled: !!(filtros.fecha_desde && filtros.fecha_hasta) // Solo ejecutar si hay fechas
  })

  // Query para obtener cajas
  const { data: cajasList, isFetching: isFetchingCajas } = useQuery({
    queryKey: ['cajas-filtro'],
    queryFn: fetchCajasParaFiltro,
    staleTime: 10 * 60 * 1000
  })

  // Procesar datos
  if (!isFetching && !isError && data?.data?.results) {
    dataList = data.data.results.map((mov: MovimientoCajaListado, index: number) => ({
      ...mov,
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

  const handleVerDetalles = (movimiento: MovimientoCajaListado) => {
    setDataDetalle(movimiento)
    setOnVerDetalles(true)
  }

  const handleCloseVerDetalles = () => {
    setOnVerDetalles(false)
    setDataDetalle(undefined)
  }

  const handleLimpiarFiltros = () => {
    const fechasDefault = getFechaDefecto()
    setFiltros({
      fecha_desde: fechasDefault.desde,
      fecha_hasta: fechasDefault.hasta,
      caja_id: null,
      tipo_movimiento: "todas",
      metodo_pago: "",
      busqueda: ""
    })
    setBusquedaLocal("")
    setCurrentPage(1)
  }

  const handleExportar = async (formato: 'pdf' | 'excel') => {
    try {
      setExportando(true)
      
      if (formato === 'pdf') {
        await exportarReporteMovimientosPDF(filtros)
        handleShowToast('Reporte PDF descargado exitosamente', 'success')
      } else {
        await exportarReporteMovimientosExcel(filtros)
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
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {dataDetalle.numero_movimiento}
                      </h2>
                      <p className="text-gray-600">Detalles del movimiento de caja</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Tipo y Monto */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Tipo de Movimiento</Label>
                      <div className="mt-1">
                        <Badge
                          className={dataDetalle.tipo_movimiento === 'ingreso'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-red-100 text-red-700 border-red-200'}
                        >
                          {dataDetalle.tipo_movimiento_display}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Monto Registrado</Label>
                      {/* Mostrar en moneda original primero */}
                      {dataDetalle.moneda_original === 'USD' ? (
                        <>
                          <p className="mt-1 text-2xl font-bold text-blue-900">
                            USD {Number(dataDetalle.monto_usd ?? dataDetalle.monto ?? 0).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            ≈ Gs. {formatearSeparadorMiles.format(Number(dataDetalle.monto_gs ?? 0))}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                              Registrado en USD
                            </Badge>
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="mt-1 text-2xl font-bold text-gray-900">
                            Gs. {formatearSeparadorMiles.format(Number(dataDetalle.monto_gs ?? dataDetalle.monto ?? 0))}
                          </p>
                          <p className="text-sm text-gray-600">
                            ≈ USD {Number(dataDetalle.monto_usd ?? 0).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                              Registrado en Gs.
                            </Badge>
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Caja y Usuario */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Caja</Label>
                      <p className="mt-1 text-gray-900 font-medium">
                        {dataDetalle.caja_nombre}
                      </p>
                      <p className="text-sm text-gray-500">
                        Número: {dataDetalle.caja_numero}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Usuario Registro</Label>
                      <p className="mt-1 text-gray-900 font-medium">
                        {dataDetalle.usuario_registro}
                      </p>
                    </div>
                  </div>

                  {/* Concepto y Método de Pago */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Concepto</Label>
                      <p className="mt-1 text-gray-900">{dataDetalle.concepto_display}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Método de Pago</Label>
                      <p className="mt-1 text-gray-900">{dataDetalle.metodo_pago_display}</p>
                    </div>
                  </div>

                  {/* Descripción y Referencia */}
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Descripción</Label>
                    <p className="mt-1 text-gray-900">{dataDetalle.descripcion || '-'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Referencia</Label>
                      <p className="mt-1 text-gray-900">{dataDetalle.referencia || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Comprobante</Label>
                      <p className="mt-1 text-gray-900">{dataDetalle.comprobante_numero || '-'}</p>
                    </div>
                  </div>

                  {/* Fecha */}
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Fecha y Hora</Label>
                    <p className="mt-1 text-gray-900">
                      {formatearFecha(dataDetalle.fecha_hora)}
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
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-semibold text-gray-900">Reporte de Movimientos de Caja</h1>
            </div>
            <p className="text-gray-600">Visualiza y analiza todos los movimientos (ingresos y egresos) de las cajas.</p>
          </div>
          <div className="flex gap-3">
            {(siTienePermiso("reportes", "exportar") || hasRole('Gerencial')) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-emerald-200 text-emerald-700 cursor-pointer hover:bg-emerald-50 bg-transparent"
                    disabled={exportando || !filtros.fecha_desde || !filtros.fecha_hasta}
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
                <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.resumen.total_registros}</div>
                <p className="text-xs text-muted-foreground">
                  {data.resumen.ingresos_count} ingresos, {data.resumen.egresos_count} egresos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-600">
                  Gs. {formatearSeparadorMiles.format(Number(data.resumen.total_ingresos_gs))}
                </div>
                <p className="text-xs text-green-600/70 mt-1">
                  USD {Number(data.resumen.total_ingresos_usd).toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Egresos</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-red-600">
                  Gs. {formatearSeparadorMiles.format(Number(data.resumen.total_egresos_gs))}
                </div>
                <p className="text-xs text-red-600/70 mt-1">
                  USD {Number(data.resumen.total_egresos_usd).toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-blue-600">
                  Gs. {formatearSeparadorMiles.format(Number(data.resumen.balance_gs))}
                </div>
                <p className="text-xs text-blue-600/70 mt-1">
                  USD {Number(data.resumen.balance_usd).toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content - Tabla con filtros */}
        <Card className="border-blue-200 pt-0">
          <CardHeader className="bg-blue-50 border-b border-blue-200 pt-8">
            <div className="flex flex-col items-start justify-between gap-4">
              <div className="w-full">
                <CardTitle className="text-blue-900">Listado de Movimientos</CardTitle>
                <CardDescription className="text-blue-700">
                  {!isFetching && dataList.length > 0 
                    ? `Mostrando ${startIndex + 1}-${Math.min(endIndex, totalItems)} de ${data?.data.totalItems || 0} movimientos`
                    : 'Cargando movimientos...'}
                </CardDescription>
              </div>

              {/* Filtros */}
              <div className="w-full space-y-4">
                {/* Fechas OBLIGATORIAS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Fecha Desde *</Label>
                    <Input
                      type="date"
                      value={filtros.fecha_desde}
                      onChange={(e) => {
                        setFiltros({ ...filtros, fecha_desde: e.target.value })
                        setCurrentPage(1)
                      }}
                      className="border-blue-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Fecha Hasta *</Label>
                    <Input
                      type="date"
                      value={filtros.fecha_hasta}
                      onChange={(e) => {
                        setFiltros({ ...filtros, fecha_hasta: e.target.value })
                        setCurrentPage(1)
                      }}
                      className="border-blue-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Caja</Label>
                    <Select
                      value={filtros.caja_id?.toString() || "todas"}
                      onValueChange={(val) => {
                        setFiltros({ ...filtros, caja_id: val === "todas" ? null : Number(val) })
                        setCurrentPage(1)
                      }}
                    >
                      <SelectTrigger className="cursor-pointer border-blue-200">
                        <SelectValue placeholder="Todas las cajas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas las cajas</SelectItem>
                        {!isFetchingCajas && cajasList?.map((caja: any) => (
                          <SelectItem key={caja.id} value={caja.id.toString()}>
                            {caja.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tipo de Movimiento</Label>
                    <Select
                      value={filtros.tipo_movimiento}
                      onValueChange={(val) => {
                        setFiltros({ ...filtros, tipo_movimiento: val })
                        setCurrentPage(1)
                      }}
                    >
                      <SelectTrigger className="cursor-pointer border-blue-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todos</SelectItem>
                        <SelectItem value="ingreso">Ingresos</SelectItem>
                        <SelectItem value="egreso">Egresos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

               {/* Búsqueda */}
               <div className="flex items-center gap-4">
                 <div className="relative flex-1">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                   <Input
                     placeholder="Buscar por descripción, referencia o número de movimiento..."
                     value={busquedaLocal}
                     onChange={(e) => setBusquedaLocal(e.target.value)}
                     className="pl-10 border-blue-200"
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
            {/* Mostrar error si no hay fechas */}
            {(!filtros.fecha_desde || !filtros.fecha_hasta) && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Fechas requeridas</h3>
                <p className="text-gray-500">Por favor selecciona un rango de fechas para ver el reporte.</p>
              </div>
            )}

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
            {filtros.fecha_desde && filtros.fecha_hasta && !isError && (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="flex items-center justify-center w-10 font-semibold text-gray-700">#</TableHead>
                    <TableHead className="font-semibold text-gray-700">Número</TableHead>
                    <TableHead className="font-semibold text-gray-700">Tipo</TableHead>
                    <TableHead className="font-semibold text-gray-700">Concepto</TableHead>
                    <TableHead className="font-semibold text-gray-700">Monto</TableHead>
                    <TableHead className="font-semibold text-gray-700">Método Pago</TableHead>
                    <TableHead className="font-semibold text-gray-700">Fecha</TableHead>
                    <TableHead className="font-semibold text-gray-700">Caja</TableHead>
                    <TableHead className="w-20 font-semibold text-gray-700">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isFetching && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <Loader2Icon className="animate-spin w-10 h-10 text-gray-500 mx-auto" />
                      </TableCell>
                    </TableRow>
                  )}

                  {!isFetching && dataList.length > 0 && dataList.map((movimiento: any) => (
                    <TableRow
                      key={movimiento.id}
                      className="hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <TableCell>
                        <div className="font-medium text-gray-900 pl-2">
                          {movimiento.numero}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium text-gray-900 truncate max-w-xs">
                          {movimiento.numero_movimiento}
                        </div>
                        {movimiento.comprobante_numero && (
                          <div className="text-xs text-gray-500">
                            {movimiento.comprobante_numero}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge className={movimiento.tipo_movimiento === 'ingreso'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-red-100 text-red-700 border-red-200'}>
                          {movimiento.tipo_movimiento === 'ingreso' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {movimiento.tipo_movimiento_display}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm text-gray-900">
                          {movimiento.concepto_display}
                        </div>
                      </TableCell>

                      <TableCell>
                        {/* Monto en moneda original (destacado) */}
                        {movimiento.moneda_original === 'USD' ? (
                          <>
                            <div className="font-bold text-blue-900">
                              USD {Number(movimiento.monto_usd ?? movimiento.monto ?? 0).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Gs. {formatearSeparadorMiles.format(Number(movimiento.monto_gs ?? 0))}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="font-medium text-gray-900">
                              Gs. {formatearSeparadorMiles.format(Number(movimiento.monto_gs ?? movimiento.monto ?? 0))}
                            </div>
                            <div className="text-xs text-gray-500">
                              USD {Number(movimiento.monto_usd ?? 0).toFixed(2)}
                            </div>
                          </>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {movimiento.metodo_pago_display}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm text-gray-900">
                          {formatearFecha(movimiento.fecha_hora)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {movimiento.usuario_registro}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm text-gray-900 truncate max-w-xs">
                          {movimiento.caja_nombre}
                        </div>
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
                              className="hover:bg-blue-50 cursor-pointer"
                              onClick={() => handleVerDetalles(movimiento)}
                            >
                              <Eye className="h-4 w-4 mr-2 text-blue-500" />
                              Ver detalles
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}

                  {!isFetching && dataList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Search className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron movimientos</h3>
                          <p className="text-gray-500 mb-4">Intenta ajustar los filtros de búsqueda.</p>
                          <Button
                            onClick={handleLimpiarFiltros}
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
