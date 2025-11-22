/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/service/axiosInterceptor";
import type {
  ResumenGeneralResponse,
  AlertasResponse,
  MetricasVentasResponse,
  TopDestinosResponse
} from "@/types/dashboard";

/**
 * Servicio para consumir los endpoints del dashboard
 */

/**
 * Obtener resumen general del dashboard
 * @param periodo - 'hoy', 'semana', 'mes'
 */
export async function fetchResumenGeneral(periodo: 'hoy' | 'semana' | 'mes' = 'hoy'): Promise<ResumenGeneralResponse> {
  const response = await axiosInstance.get('/dashboard/resumen-general/', {
    params: { periodo }
  });
  return response.data;
}

/**
 * Obtener alertas del sistema
 * @param tipo - 'criticas', 'advertencias', 'todas'
 */
export async function fetchAlertas(tipo: 'criticas' | 'advertencias' | 'todas' = 'todas'): Promise<AlertasResponse> {
  const response = await axiosInstance.get('/dashboard/alertas/', {
    params: { tipo }
  });
  return response.data;
}

/**
 * Obtener métricas de ventas para gráficos
 * @param periodo - '7d', '30d'
 */
export async function fetchMetricasVentas(periodo: '7d' | '30d' = '30d'): Promise<MetricasVentasResponse> {
  const response = await axiosInstance.get('/dashboard/metricas-ventas/', {
    params: { periodo }
  });
  return response.data;
}

/**
 * Obtener top destinos más vendidos
 * @param periodo - 'mes', 'trimestre', 'año'
 * @param limite - cantidad de resultados (default: 5)
 */
export async function fetchTopDestinos(
  periodo: 'mes' | 'trimestre' | 'año' = 'mes',
  limite: number = 5
): Promise<TopDestinosResponse> {
  const response = await axiosInstance.get('/dashboard/top-destinos/', {
    params: { periodo, limite }
  });
  return response.data;
}


