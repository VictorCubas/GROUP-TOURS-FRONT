/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/service/axiosInterceptor";
import type { RespuestaReporteMovimientos } from "@/types/reporteMovimientos";

interface FiltrosReporteMovimientos {
  activo?: boolean | null;
  fecha_desde?: string;
  fecha_hasta?: string;
  caja_id?: number | null;
  tipo_movimiento?: string;
  metodo_pago?: string;
  concepto?: string;
  busqueda?: string;
}

/**
 * Obtiene el reporte de movimientos de caja
 * NOTA: fecha_desde y fecha_hasta son OBLIGATORIOS en el backend
 */
export const fetchReporteMovimientos = async (
  page: number = 1,
  pageSize: number = 20,
  filtros: FiltrosReporteMovimientos = {}
): Promise<RespuestaReporteMovimientos> => {
  try {
    // Validar que las fechas estén presentes
    if (!filtros.fecha_desde || !filtros.fecha_hasta) {
      throw new Error('Las fechas desde y hasta son obligatorias');
    }

    const params: Record<string, any> = {
      page,
      page_size: pageSize,
      fecha_desde: filtros.fecha_desde,
      fecha_hasta: filtros.fecha_hasta,
    };

    // Agregar filtros opcionales solo si tienen valor
    if (filtros.caja_id) params.caja_id = filtros.caja_id;
    if (filtros.tipo_movimiento && filtros.tipo_movimiento !== 'todas') {
      params.tipo_movimiento = filtros.tipo_movimiento;
    }
    if (filtros.metodo_pago) params.metodo_pago = filtros.metodo_pago;
    if (filtros.concepto) params.concepto = filtros.concepto;
    if (filtros.busqueda) params.busqueda = filtros.busqueda;

    const response = await axiosInstance.get('/dashboard/reportes/movimientos-cajas/', {
      params
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching reporte movimientos:', error);
    throw error;
  }
};

/**
 * Obtiene la lista de cajas disponibles para el filtro
 */
export const fetchCajasParaFiltro = async () => {
  try {
    const response = await axiosInstance.get('/arqueo-caja/cajas/', {
      params: {
        activo: true,
        page_size: 100 // Traer todas las cajas activas
      }
    });
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching cajas:', error);
    return [];
  }
};

/**
 * Exportar reporte a PDF
 * Endpoint: /api/dashboard/reportes/movimientos-cajas/exportar-pdf/
 */
export const exportarReporteMovimientosPDF = async (filtros: FiltrosReporteMovimientos) => {
  try {
    // Validar que las fechas estén presentes (OBLIGATORIO para este reporte)
    if (!filtros.fecha_desde || !filtros.fecha_hasta) {
      throw new Error('Las fechas desde y hasta son obligatorias para exportar');
    }

    const params: Record<string, any> = {
      fecha_desde: filtros.fecha_desde,
      fecha_hasta: filtros.fecha_hasta,
    };

    // Agregar filtros opcionales solo si tienen valor
    if (filtros.caja_id) params.caja_id = filtros.caja_id;
    if (filtros.tipo_movimiento && filtros.tipo_movimiento !== 'todas') {
      params.tipo_movimiento = filtros.tipo_movimiento;
    }
    if (filtros.metodo_pago) params.metodo_pago = filtros.metodo_pago;
    if (filtros.concepto) params.concepto = filtros.concepto;
    if (filtros.busqueda) params.busqueda = filtros.busqueda;

    const response = await axiosInstance.get('/dashboard/reportes/movimientos-cajas/exportar-pdf/', {
      params,
      responseType: 'blob'
    });

    // Crear URL para descargar
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Obtener el nombre del archivo desde el header Content-Disposition o usar uno por defecto
    const contentDisposition = response.headers['content-disposition'];
    let fileName = `movimientos_cajas_${new Date().toISOString().split('T')[0]}.pdf`;
    
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = fileNameMatch[1].replace(/['"]/g, '');
      }
    }
    
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    // Limpiar la URL del blob
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exportando PDF:', error);
    throw error;
  }
};

/**
 * Exportar reporte a Excel
 * Endpoint: /api/dashboard/reportes/movimientos-cajas/exportar-excel/
 */
export const exportarReporteMovimientosExcel = async (filtros: FiltrosReporteMovimientos) => {
  try {
    // Validar que las fechas estén presentes (OBLIGATORIO para este reporte)
    if (!filtros.fecha_desde || !filtros.fecha_hasta) {
      throw new Error('Las fechas desde y hasta son obligatorias para exportar');
    }

    const params: Record<string, any> = {
      fecha_desde: filtros.fecha_desde,
      fecha_hasta: filtros.fecha_hasta,
    };

    // Agregar filtros opcionales solo si tienen valor
    if (filtros.caja_id) params.caja_id = filtros.caja_id;
    if (filtros.tipo_movimiento && filtros.tipo_movimiento !== 'todas') {
      params.tipo_movimiento = filtros.tipo_movimiento;
    }
    if (filtros.metodo_pago) params.metodo_pago = filtros.metodo_pago;
    if (filtros.concepto) params.concepto = filtros.concepto;
    if (filtros.busqueda) params.busqueda = filtros.busqueda;

    const response = await axiosInstance.get('/dashboard/reportes/movimientos-cajas/exportar-excel/', {
      params,
      responseType: 'blob'
    });

    // Crear URL para descargar
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Obtener el nombre del archivo desde el header Content-Disposition o usar uno por defecto
    const contentDisposition = response.headers['content-disposition'];
    let fileName = `movimientos_cajas_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = fileNameMatch[1].replace(/['"]/g, '');
      }
    }
    
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    // Limpiar la URL del blob
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exportando Excel:', error);
    throw error;
  }
};

