/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Home, TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { 
  fetchResumenGeneral, 
  fetchAlertas, 
  fetchMetricasVentas, 
  fetchTopDestinos 
} from '@/components/utils/httpDashboard';
import type { 
  ResumenGeneralData, 
  AlertasData, 
  TopDestino,
  VentaDiaria,
  Alerta
} from '@/types/dashboard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const HomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumen, setResumen] = useState<ResumenGeneralData | null>(null);
  const [alertas, setAlertas] = useState<AlertasData | null>(null);
  const [topDestinos, setTopDestinos] = useState<TopDestino[]>([]);
  const [ventasDiarias, setVentasDiarias] = useState<VentaDiaria[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [periodo, setPeriodo] = useState<'hoy' | 'semana' | 'mes'>('mes');

  useEffect(() => {
    loadDashboard();
    
    // Auto-refresh cada 5 minutos
    const interval = setInterval(() => {
      loadDashboard();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [periodo]); // Recargar cuando cambia el período

  async function loadDashboard() {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar todos los datos en paralelo
      const [resumenData, alertasData, destinosData, ventasData] = await Promise.all([
        fetchResumenGeneral(periodo),
        fetchAlertas('todas'),
        fetchTopDestinos('mes', 5),
        fetchMetricasVentas('30d')
      ]);

      // 🔍 Debug: Ver qué devuelve el backend
      console.log('📊 Resumen General:', resumenData);
      console.log('💰 Datos Financieros:', resumenData.data.financiero);
      console.log('📅 Datos Reservas:', resumenData.data.reservas);
      console.log('🧾 Datos Facturación:', resumenData.data.facturacion);
      
      setResumen(resumenData.data);
      setAlertas(alertasData.data);
      setTopDestinos(destinosData.data.top_destinos);
      setVentasDiarias(ventasData.data.ventas_diarias);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error cargando dashboard:', err);
      setError('Error al cargar el dashboard. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  if (loading && !resumen) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !resumen) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center text-red-600">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium">{error}</p>
            <button
              onClick={loadDashboard}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!resumen) return null;

  const totalAlertas = (alertas?.criticas?.length || 0) + (alertas?.advertencias?.length || 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Última actualización: {format(lastUpdate, "HH:mm:ss", { locale: es })}
          </p>
        </div>
        
        {/* Selector de Período */}
        <div className="flex gap-2">
          <button
            onClick={() => setPeriodo('hoy')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              periodo === 'hoy'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => setPeriodo('semana')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              periodo === 'semana'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Esta Semana
          </button>
          <button
            onClick={() => setPeriodo('mes')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              periodo === 'mes'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Este Mes
          </button>
        </div>
      </div>

      {/* 💰 RESUMEN FINANCIERO */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            💰 RESUMEN FINANCIERO - {periodo.toUpperCase()}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Cajas Abiertas" 
              value={resumen.financiero.cajas_abiertas.toString()} 
              color="blue"
            />
            <MetricCard 
              title="Ingresos" 
              value={formatMoney(resumen.financiero.ingresos_periodo)} 
              color="green"
            />
            <MetricCard 
              title="Egresos" 
              value={formatMoney(resumen.financiero.egresos_periodo)} 
              color="orange"
            />
            <MetricCard 
              title="Balance" 
              value={formatMoney(resumen.financiero.balance_periodo)}
              positive={parseFloat(resumen.financiero.balance_periodo) > 0}
              color={parseFloat(resumen.financiero.balance_periodo) >= 0 ? "green" : "red"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Grid 2 columnas: Reservas y Facturación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 📅 RESERVAS */}
        <Card className="border-purple-200 bg-purple-50/30">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              📅 RESERVAS
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-purple-200">
                <span className="text-gray-600 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  Pendientes:
                </span>
                <span className="font-bold text-lg">{resumen.reservas.pendientes}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-purple-200">
                <span className="text-gray-600 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Confirmadas:
                </span>
                <span className="font-bold text-lg">{resumen.reservas.confirmadas}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-purple-200">
                <span className="text-gray-600">Próximas (7d):</span>
                <span className="font-bold text-lg">{resumen.reservas.proximas_salidas_7d}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-purple-100 px-3 -mx-3 rounded-lg mt-4">
                <span className="text-gray-700 font-medium">Ocupación:</span>
                <div className="text-right">
                  <span className="font-bold text-2xl text-purple-600">
                    {resumen.reservas.ocupacion_porcentaje.toFixed(1)}%
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    {resumen.reservas.cupos_ocupados} / {resumen.reservas.cupos_totales} cupos
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 🧾 FACTURACIÓN MES */}
        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              🧾 FACTURACIÓN DEL MES
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-green-200">
                <span className="text-gray-600">Emitidas:</span>
                <span className="font-bold text-lg">{resumen.facturacion.facturas_emitidas_mes}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-green-200">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold text-lg">{formatMoney(resumen.facturacion.monto_total_mes)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-green-200">
                <span className="text-gray-600">Por cobrar:</span>
                <span className="font-bold text-lg text-orange-600">
                  {formatMoney(resumen.facturacion.saldo_por_cobrar)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 bg-green-100 px-3 -mx-3 rounded-lg mt-4">
                <span className="text-gray-700 font-medium">Crecimiento:</span>
                <div className="flex items-center gap-2">
                  {getTendenciaIcon(resumen.facturacion.comparacion_mes_anterior.tendencia)}
                  <span className={`font-bold text-2xl ${getTendenciaColor(resumen.facturacion.comparacion_mes_anterior.tendencia)}`}>
                    {resumen.facturacion.comparacion_mes_anterior.porcentaje_crecimiento > 0 ? '+' : ''}
                    {resumen.facturacion.comparacion_mes_anterior.porcentaje_crecimiento.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ⚠️ ALERTAS Y ACCIONES REQUERIDAS */}
      {totalAlertas > 0 && alertas && (
        <Card className="border-red-200 bg-red-50/20">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-600" />
              ALERTAS Y ACCIONES REQUERIDAS ({totalAlertas})
            </h2>
            
            <div className="space-y-2 overflow-auto h-[20rem]">
              {/* Alertas críticas */}
              {alertas.criticas.map(alerta => (
                <AlertCard key={alerta.id} alerta={alerta} tipo="critical" navigate={navigate} />
              ))}
              
              {/* Advertencias */}
              {alertas.advertencias.map(alerta => (
                <AlertCard key={alerta.id} alerta={alerta} tipo="warning" navigate={navigate} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {totalAlertas === 0 && (
        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-700">¡Todo en orden!</p>
              <p className="text-gray-600 mt-2">No hay alertas pendientes en este momento</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid 2 columnas: Top Destinos y Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 🌍 TOP DESTINOS */}
        <Card className="border-indigo-200 bg-indigo-50/30">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              🌍 TOP DESTINOS DEL MES
            </h2>
            <div className="space-y-2">
              {topDestinos && topDestinos.length > 0 ? (
                topDestinos.map((destino, index) => (
                  <div 
                    key={destino.destino_id} 
                    className="flex justify-between items-center py-3 px-3 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-gray-800 font-medium">{destino.destino_completo}</p>
                        <p className="text-xs text-gray-500">{destino.paquetes_activos} paquete(s) activo(s)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg text-indigo-600">
                        {destino.cantidad_reservas}
                      </span>
                      <p className="text-xs text-gray-500">reservas</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay datos disponibles</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 📊 VENTAS (30 días) */}
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              📊 VENTAS (ÚLTIMOS 30 DÍAS)
            </h2>
            {ventasDiarias && ventasDiarias.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={ventasDiarias}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="fecha" 
                    tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatMoneyShort(value)}
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="monto_total" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Monto"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded">
                No hay datos de ventas disponibles
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;

// ========== COMPONENTES AUXILIARES ==========

interface MetricCardProps {
  title: string;
  value: string;
  positive?: boolean;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

function MetricCard({ title, value, color = 'blue' }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 border-blue-200 text-blue-900',
    green: 'bg-green-100 border-green-200 text-green-900',
    orange: 'bg-orange-100 border-orange-200 text-orange-900',
    red: 'bg-red-100 border-red-200 text-red-900',
    purple: 'bg-purple-100 border-purple-200 text-purple-900'
  };

  return (
    <div className={`p-4 rounded-lg text-center border ${colorClasses[color]}`}>
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="text-2xl font-bold">
        {value}
      </div>
    </div>
  );
}

interface AlertCardProps {
  alerta: Alerta;
  tipo: 'critical' | 'warning';
  navigate: (path: string) => void;
}

function AlertCard({ alerta, tipo, navigate }: AlertCardProps) {
  const isCritical = tipo === 'critical';
  const bgColor = isCritical ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200';
  const textColor = isCritical ? 'text-red-900' : 'text-yellow-900';
  const buttonColor = isCritical 
    ? 'bg-red-600 hover:bg-red-700 text-white' 
    : 'bg-yellow-600 hover:bg-yellow-700 text-white';

  const handleAction = () => {
    if (alerta.accion_url) {
      navigate(alerta.accion_url);
    }
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${bgColor}`}>
      <div className="flex-1">
        <p className={`${textColor} font-medium`}>
          • {alerta.mensaje}
        </p>
      </div>
      {alerta.accion_url && alerta.accion_texto && (
        <button
          onClick={handleAction}
          className={`ml-4 px-4 py-2 rounded text-sm font-medium ${buttonColor} transition-colors`}
        >
          {alerta.accion_texto}
        </button>
      )}
    </div>
  );
}

// Tooltip personalizado para el gráfico
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-700">
          {format(new Date(data.fecha), 'dd/MM/yyyy', { locale: es })}
        </p>
        <p className="text-lg font-bold text-blue-600 mt-1">
          {formatMoney(data.monto_total)}
        </p>
        <p className="text-sm text-gray-600">
          {data.cantidad_reservas} reserva(s)
        </p>
      </div>
    );
  }
  return null;
}

// ========== FUNCIONES HELPER ==========

function formatMoney(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M ₲`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K ₲`;
  }
  return `₲ ${num.toLocaleString('es-PY')}`;
}

function formatMoneyShort(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
}

function getTendenciaColor(tendencia: string): string {
  switch (tendencia) {
    case 'positiva':
      return 'text-green-600';
    case 'negativa':
      return 'text-red-600';
    case 'estable':
      return 'text-gray-600';
    case 'nueva':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
}

function getTendenciaIcon(tendencia: string) {
  switch (tendencia) {
    case 'positiva':
      return <TrendingUp className="h-5 w-5 text-green-600" />;
    case 'negativa':
      return <TrendingDown className="h-5 w-5 text-red-600" />;
    case 'estable':
      return <Minus className="h-5 w-5 text-gray-600" />;
    default:
      return null;
  }
}
