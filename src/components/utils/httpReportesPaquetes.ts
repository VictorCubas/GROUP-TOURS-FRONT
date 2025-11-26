/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/service/axiosInterceptor";
import type { RespuestaReportePaquetes } from "@/types/reportePaquetes";

interface FiltrosReportePaquetes {
  fecha_desde?: string;
  fecha_hasta?: string;
  fecha_salida_desde?: string;
  fecha_salida_hasta?: string;
  destino_id?: number | null;
  pais_id?: number | null;
  tipo_paquete_id?: number | null;
  estado?: string;
  personalizado?: boolean | null;
  propio?: boolean | null;
  distribuidora_id?: number | null;
  busqueda?: string;
  ordenar_por?: string;
  zona_geografica_id?: number | null;
  fecha_salida_proxima?: number | null;
  tiene_cupos_disponibles?: boolean | null;
}

/**
 * Obtiene el reporte de paquetes turísticos
 * NOTA: Todos los filtros son opcionales para este reporte
 */
export const fetchReportePaquetes = async (
  page: number = 1,
  pageSize: number = 20,
  filtros: FiltrosReportePaquetes = {}
): Promise<RespuestaReportePaquetes> => {
  try {
    const params: Record<string, any> = {
      page,
      page_size: pageSize,
    };

    // Agregar filtros opcionales solo si tienen valor
    if (filtros.fecha_desde) params.fecha_desde = filtros.fecha_desde;
    if (filtros.fecha_hasta) params.fecha_hasta = filtros.fecha_hasta;
    if (filtros.fecha_salida_desde) params.fecha_salida_desde = filtros.fecha_salida_desde;
    if (filtros.fecha_salida_hasta) params.fecha_salida_hasta = filtros.fecha_salida_hasta;
    if (filtros.destino_id) params.destino_id = filtros.destino_id;
    if (filtros.pais_id) params.pais_id = filtros.pais_id;
    if (filtros.tipo_paquete_id) params.tipo_paquete_id = filtros.tipo_paquete_id;
    if (filtros.estado && filtros.estado !== 'todos') params.estado = filtros.estado;
    if (filtros.personalizado !== null && filtros.personalizado !== undefined) {
      params.personalizado = filtros.personalizado;
    }
    if (filtros.propio !== null && filtros.propio !== undefined) {
      params.propio = filtros.propio;
    }
    if (filtros.distribuidora_id) params.distribuidora_id = filtros.distribuidora_id;
    if (filtros.busqueda) params.busqueda = filtros.busqueda;
    if (filtros.ordenar_por) params.ordenar_por = filtros.ordenar_por;
    if (filtros.zona_geografica_id) params.zona_geografica_id = filtros.zona_geografica_id;
    if (filtros.fecha_salida_proxima) params.fecha_salida_proxima = filtros.fecha_salida_proxima;
    if (filtros.tiene_cupos_disponibles !== null && filtros.tiene_cupos_disponibles !== undefined) {
      params.tiene_cupos_disponibles = filtros.tiene_cupos_disponibles;
    }

    const response = await axiosInstance.get('/dashboard/reportes/paquetes/', {
      params
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching reporte paquetes:', error);
    throw error;
  }
};

/**
 * Obtiene la lista de destinos disponibles para el filtro
 */
export const fetchDestinosParaFiltro = async () => {
  try {
    const response = await axiosInstance.get('/destino/', {
      params: {
        activo: true,
        page_size: 100
      }
    });
    
    // Manejar diferentes estructuras de respuesta
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.results && Array.isArray(response.data.results)) {
      return response.data.results;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    console.warn('Estructura de destinos no reconocida:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching destinos:', error);
    return [];
  }
};

/**
 * Obtiene la lista de tipos de paquete para el filtro
 * Endpoint: /api/tipo_paquete/todos/
 */
export const fetchTiposPaqueteParaFiltro = async () => {
  try {
    const response = await axiosInstance.get('/tipo_paquete/todos/');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching tipos paquete:', error);
    return [];
  }
};

/**
 * Obtiene la lista de distribuidoras para el filtro
 * Endpoint: /api/distribuidora/todos/
 */
export const fetchDistribuidorasParaFiltro = async () => {
  try {
    const response = await axiosInstance.get('/distribuidora/todos/', {
      params: {
        activo: true,
        page_size: 100
      }
    });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching distribuidoras:', error);
    return [];
  }
};

/**
 * Obtiene la lista de países disponibles para el filtro
 * Endpoint: /api/nacionalidades/todos/
 */
export const fetchPaisesParaFiltro = async () => {
  try {
    const response = await axiosInstance.get('/nacionalidades/todos/');
    
    // La respuesta es un array directo con la estructura:
    // [{ id, nombre, codigo_alpha2, zona_geografica__nombre }, ...]
    const paises = response.data || [];
    
    // Ordenar alfabéticamente por nombre
    return paises.sort((a: any, b: any) => 
      a.nombre.localeCompare(b.nombre)
    );
  } catch (error) {
    console.error('Error fetching países:', error);
    return [];
  }
};

/**
 * Exportar reporte a PDF
 * Endpoint: /api/dashboard/reportes/paquetes/exportar-pdf/
 */
export const exportarReportePaquetesPDF = async (filtros: FiltrosReportePaquetes) => {
  try {
    const params: Record<string, any> = {};

    // Agregar filtros opcionales solo si tienen valor
    if (filtros.fecha_desde) params.fecha_desde = filtros.fecha_desde;
    if (filtros.fecha_hasta) params.fecha_hasta = filtros.fecha_hasta;
    if (filtros.fecha_salida_desde) params.fecha_salida_desde = filtros.fecha_salida_desde;
    if (filtros.fecha_salida_hasta) params.fecha_salida_hasta = filtros.fecha_salida_hasta;
    if (filtros.destino_id) params.destino_id = filtros.destino_id;
    if (filtros.pais_id) params.pais_id = filtros.pais_id;
    if (filtros.tipo_paquete_id) params.tipo_paquete_id = filtros.tipo_paquete_id;
    if (filtros.estado && filtros.estado !== 'todos') params.estado = filtros.estado;
    if (filtros.personalizado !== null && filtros.personalizado !== undefined) {
      params.personalizado = filtros.personalizado;
    }
    if (filtros.propio !== null && filtros.propio !== undefined) {
      params.propio = filtros.propio;
    }
    if (filtros.distribuidora_id) params.distribuidora_id = filtros.distribuidora_id;
    if (filtros.busqueda) params.busqueda = filtros.busqueda;
    if (filtros.zona_geografica_id) params.zona_geografica_id = filtros.zona_geografica_id;
    if (filtros.fecha_salida_proxima) params.fecha_salida_proxima = filtros.fecha_salida_proxima;
    if (filtros.tiene_cupos_disponibles !== null && filtros.tiene_cupos_disponibles !== undefined) {
      params.tiene_cupos_disponibles = filtros.tiene_cupos_disponibles;
    }

    const response = await axiosInstance.get('/dashboard/reportes/paquetes/exportar-pdf/', {
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
    let fileName = `paquetes_${new Date().toISOString().split('T')[0]}.pdf`;
    
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
 * Endpoint: /api/dashboard/reportes/paquetes/exportar-excel/
 */
export const exportarReportePaquetesExcel = async (filtros: FiltrosReportePaquetes) => {
  try {
    const params: Record<string, any> = {};

    // Agregar filtros opcionales solo si tienen valor
    if (filtros.fecha_desde) params.fecha_desde = filtros.fecha_desde;
    if (filtros.fecha_hasta) params.fecha_hasta = filtros.fecha_hasta;
    if (filtros.fecha_salida_desde) params.fecha_salida_desde = filtros.fecha_salida_desde;
    if (filtros.fecha_salida_hasta) params.fecha_salida_hasta = filtros.fecha_salida_hasta;
    if (filtros.destino_id) params.destino_id = filtros.destino_id;
    if (filtros.pais_id) params.pais_id = filtros.pais_id;
    if (filtros.tipo_paquete_id) params.tipo_paquete_id = filtros.tipo_paquete_id;
    if (filtros.estado && filtros.estado !== 'todos') params.estado = filtros.estado;
    if (filtros.personalizado !== null && filtros.personalizado !== undefined) {
      params.personalizado = filtros.personalizado;
    }
    if (filtros.propio !== null && filtros.propio !== undefined) {
      params.propio = filtros.propio;
    }
    if (filtros.distribuidora_id) params.distribuidora_id = filtros.distribuidora_id;
    if (filtros.busqueda) params.busqueda = filtros.busqueda;
    if (filtros.zona_geografica_id) params.zona_geografica_id = filtros.zona_geografica_id;
    if (filtros.fecha_salida_proxima) params.fecha_salida_proxima = filtros.fecha_salida_proxima;
    if (filtros.tiene_cupos_disponibles !== null && filtros.tiene_cupos_disponibles !== undefined) {
      params.tiene_cupos_disponibles = filtros.tiene_cupos_disponibles;
    }

    const response = await axiosInstance.get('/dashboard/reportes/paquetes/exportar-excel/', {
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
    let fileName = `paquetes_${new Date().toISOString().split('T')[0]}.xlsx`;
    
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

