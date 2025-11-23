/* eslint-disable @typescript-eslint/no-unused-vars */
import type React from "react"
import { useMutation, useQuery } from '@tanstack/react-query';
import { use, useEffect, useState } from "react"
import { ToastContext } from '@/context/ToastContext';
import { useSessionStore } from '@/store/sessionStore';
import { DollarSign, Calendar, TrendingUp, Info, BarChartBig as ChartBar, X, Loader2Icon, CheckCircle2 } from "lucide-react"
import { registrarCotizaccicon } from "./utils/httpUsuario";
import { Button } from "./ui/button";
import { fetchDataMonedaTodos } from "./utils/httpPaquete";
import type { Moneda } from "@/types/paquetes";

const currentRate = 0;

const RegistrarCotizacionDelDiaModal = () => {
  const {setCotizacionDiariaCargada} = useSessionStore();
  const {handleShowToast} = use(ToastContext);
  const [moneda, setMoneda] = useState<Moneda | null>(null)
  const [cotizacion, setCotizacion] = useState<string>(
    currentRate > 0 ? currentRate.toLocaleString("es-PY") : ""
  )
  // Obtener fecha local en formato YYYY-MM-DD sin conversión UTC
  const obtenerFechaLocal = () => {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  };

  const [fecha, setFecha] = useState<string>(obtenerFechaLocal())
  const [observaciones, setObservaciones] = useState<string>("")
  const [error, setError] = useState<string>("")


  const {data: dataMonedaList, isFetching: isFetchingMoneda,} = useQuery({
    queryKey: ['monedas-disponibles',], //data cached
    queryFn: () => fetchDataMonedaTodos(),
    staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
  });

  
  useEffect(() => {
    if (dataMonedaList) {
      const moneda = dataMonedaList.find((moneda: Moneda) => moneda.codigo === 'USD');
      if (moneda) {
        setMoneda(moneda)
      }
    }
  }, [dataMonedaList])  


  const handleGuardar = () => {
    const cotizacionLimpia = cotizacion.replace(/\./g, "")
    const cotizacionNumerica = Number.parseFloat(cotizacionLimpia)

    if (isNaN(cotizacionNumerica) || cotizacionNumerica <= 0) {
      handleShowToast('Por favor ingresa una cotización válida', 'error')
      return
    }

    const payload = {
      moneda: moneda?.id,
      valor_en_guaranies: cotizacionNumerica,
      fecha_vigencia: fecha,
      observaciones: observaciones
    }

    console.log({...payload})
    mutate({...payload})
    // setError("")
  }

  const handleCotizacionChange = (valor: string) => {
    const valorLimpio = valor.replace(/\D/g, "")
    if (valorLimpio === "") {
      setCotizacion("")
      setError("")
      return
    }
    const valorNumerico = Number.parseInt(valorLimpio)
    setCotizacion(valorNumerico.toLocaleString("es-PY"))
    setError("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !error) {
      handleGuardar()
    }
  }

  const cotizacionLimpia = cotizacion.replace(/\./g, "")
  const cotizacionNumerica = Number.parseFloat(cotizacionLimpia) || 0
  const ejemplosConversion = [
    { usd: 100, pyg: cotizacionNumerica * 100 },
    { usd: 500, pyg: cotizacionNumerica * 500 },
    { usd: 1000, pyg: cotizacionNumerica * 1000 },
    { usd: 1200, pyg: cotizacionNumerica * 1200 },
    { usd: 1500, pyg: cotizacionNumerica * 1500 },
  ]

  const onClose = () => {

  }


  const {mutate, isPending} = useMutation({
        mutationFn: registrarCotizaccicon,
        onSuccess: () => {
            handleShowToast('Se ha registrado la cotización satisfactoriamente', 'success');
            setCotizacionDiariaCargada(true);
            // setErrors([]);
            // if (success) {
            //     setSuccess(false);
            // }
            // reset({
            //   salario: '',
            //   porcentaje_comision: '',
            //   puesto: '',
            //   persona: '',
            //   tipo_remuneracion: '',
            //   fecha_ingreso: ''
            // });
        },
    })


  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
      // style={{ zIndex: 99999 }}
    >
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ChartBar className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Registrar Cotización del Dólar (USD)
                </h2>
              </div>
              <button
                onClick={onClose}
                type="button"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Cotización del Día */}
              <div className="space-y-4">
                <h3 className="font-semibold text-base border-b border-gray-200 pb-2">Cotización del Día</h3>

                {/* Moneda (campo fijo) */}
                <div className="space-y-2">
                  <label htmlFor="moneda" className="block text-sm font-medium text-gray-700">
                    Moneda
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="moneda"
                      type="text"
                      value="Dólar Americano (USD)"
                      disabled
                      className="w-full px-4 py-3 pl-9 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Valor en Guaraníes */}
                <div className="space-y-2">
                  <label htmlFor="cotizacion" className="block text-sm font-medium text-gray-700">
                    Valor en Guaraníes (Gs) <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="cotizacion"
                      type="text"
                      value={cotizacion}
                      onChange={(e) => handleCotizacionChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="7,300"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-base font-semibold"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                      Gs
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 pl-1">¿Cuántos guaraníes vale 1 dólar hoy?</p>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                </div>

                {/* Fecha de Vigencia */}
                <div className="space-y-2">
                  <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
                    Fecha de Vigencia <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="fecha"
                      type="date"
                      disabled
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      className="w-full px-4 py-3 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                  <p className="text-xs text-gray-500 pl-1">Por defecto: Hoy</p>
                </div>
              </div>

              {/* Información Adicional */}
              <div className="space-y-4">
                <h3 className="font-semibold text-base border-b border-gray-200 pb-2">
                  Información Adicional (Opcional)
                </h3>

                <div className="space-y-2">
                  <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">
                    Observaciones
                  </label>
                  <textarea
                    id="observaciones"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder='Ej: "Cotización del BCP" o "Promedio SET"'
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-none"
                  />
                </div>
              </div>

              {/* Información Importante */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-blue-900">ℹ️  Información Importante</h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Solo se registra una cotización del dólar por día</li>
                      <li>• Esta cotización se aplica automáticamente a todas las facturas</li>
                      <li>• Las facturas con paquetes en USD se convertirán a guaraníes</li>
                      {/* <li>• Si ya existe cotización para hoy, se actualizará</li> */}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Vista Previa de Conversión */}
              {cotizacionNumerica > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    📈 Vista Previa de Conversión
                  </div>

                  <div className="bg-white rounded-md p-3 border-l-4 border-blue-600">
                    <p className="text-base font-bold text-gray-800">
                      1 USD = {cotizacionNumerica.toLocaleString("es-PY")} Gs
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Ejemplos de paquetes:</p>
                    <div className="space-y-1.5">
                      {ejemplosConversion.map((conversion) => (
                        <div
                          key={conversion.usd}
                          className="flex items-center justify-between text-sm bg-white rounded-md p-2 border border-gray-200"
                        >
                          <span className="font-medium text-gray-800">
                            ${conversion.usd.toLocaleString("es-PY")} USD
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="font-semibold text-blue-600">
                            {conversion.pyg.toLocaleString("es-PY", { maximumFractionDigits: 0 })} Gs
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6 py-5 text-gray-700 font-medium border border-gray-300 rounded-lg
                            cursor-pointer hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleGuardar}
                disabled={!!error || !cotizacion || isPending}
                className="px-6 py-5 bg-green-600 text-white font-medium rounded-lg
                        cursor-pointer hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ?
                  <>
                      <Loader2Icon className="animate-spin w-4 h-4"/>
                      Guardando...
                  </> :
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Guardar
                  </>}
              </Button>
            </div>
          </div>
        
      </div>
    </div>
  )
}


export default RegistrarCotizacionDelDiaModal;