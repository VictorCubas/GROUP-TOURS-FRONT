import type { SalidaPaquete } from "@/types/paquetes";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Normaliza la estructura de precios_catalogo para que siempre tenga el formato:
 * [{ habitacion_id: x, precio_catalogo: xxx }]
 *
 * También filtra las habitaciones que pertenecen a hoteles presentes en precios_catalogo_hoteles.
 *
 * @param precios - Array de precios de catálogo
 * @param preciosCatalogoHoteles - Array de precios de hoteles (para filtrar habitaciones de esos hoteles)
 * @param dataHotelesList - Lista de hoteles disponibles con sus habitaciones
 */
export const normalizarPreciosCatalogo = (
  precios: any[],
  preciosCatalogoHoteles: any[] = [],
  dataHotelesList: any[] = []
): any[] => {
  if (!precios || precios.length === 0) return [];

  // Obtener IDs de hoteles que están en precios_catalogo_hoteles
  const hotelesEnCatalogo = new Set(
    preciosCatalogoHoteles.map((p: any) => p.hotel_id || p.hotel?.id).filter(Boolean)
  );

  // Crear un mapa de habitacion_id -> hotel_id desde dataHotelesList
  const habitacionAHotelMap = new Map<number, number>();
  if (dataHotelesList && dataHotelesList.length > 0) {
    dataHotelesList.forEach((hotel: any) => {
      if (hotel.habitaciones && Array.isArray(hotel.habitaciones)) {
        hotel.habitaciones.forEach((hab: any) => {
          if (hab.id) {
            habitacionAHotelMap.set(hab.id, hotel.id);
          }
        });
      }
    });
  }

  const preciosNormalizados = precios.map((precio: any) => {
    let habitacionId: number | undefined;
    let hotelId: number | undefined;

    // Si ya tiene habitacion_id (estructura normalizada - salida editada)
    if (precio.habitacion_id !== undefined) {
      habitacionId = precio.habitacion_id;
      // Buscar el hotel_id en el mapa solo si habitacionId es válido
      if (habitacionId !== undefined) {
        hotelId = habitacionAHotelMap.get(habitacionId);
      }
    }
    // Si tiene la estructura expandida con el objeto habitacion (salida no editada del backend)
    else if (precio.habitacion && precio.habitacion.id !== undefined) {
      habitacionId = precio.habitacion.id;
      // Buscar el hotel_id en el mapa solo si habitacionId es válido
      if (habitacionId !== undefined) {
        hotelId = habitacionAHotelMap.get(habitacionId);
      }
    }

    // Si encontramos el hotel y está en precios_catalogo_hoteles, excluir esta habitación
    if (hotelId && hotelesEnCatalogo.has(hotelId)) {
      return null; // Marcar para filtrar
    }

    return {
      habitacion_id: habitacionId,
      precio_catalogo: precio.precio_catalogo
    };
  });

  // Filtrar los elementos nulos (habitaciones de hoteles en precios_catalogo_hoteles)
  return preciosNormalizados.filter((p) => p !== null);
};

/**
 * Normaliza la estructura de precios_catalogo_hoteles para que siempre tenga el formato:
 * [{ hotel_id: xx, precio_catalogo: xxx }]
 */
export const normalizarPreciosCatalogoHoteles = (precios: any[]): any[] => {
  if (!precios || precios.length === 0) return [];

  return precios.map((precio: any) => {
    // Si ya tiene hotel_id, retornar tal cual
    if (precio.hotel_id !== undefined) {
      return {
        hotel_id: precio.hotel_id,
        precio_catalogo: precio.precio_catalogo
      };
    }

    // Si tiene la estructura expandida con el objeto hotel
    if (precio.hotel && precio.hotel.id !== undefined) {
      return {
        hotel_id: precio.hotel.id,
        precio_catalogo: precio.precio_catalogo
      };
    }

    // Retornar tal cual si no coincide con ningún patrón
    return precio;
  });
};
export const getPayload = (salidas: any[], dataForm: any, propio: boolean, selectedDestinoID: any,
    serviciosListSelected: any [], paqueteModalidad: 'flexible' | 'fijo'): any => {

    const salidasTemp = salidas.map((salida: any) => {
        const sal: any = {
        fecha_salida: salida.fecha_salida_v2,
        fecha_regreso: salida.fecha_regreso_v2,
        senia: salida.senia,
        precio_actual: salida.precio_actual,
        hoteles: salida.hoteles_ids,
        cupo: salida?.cupo ? parseInt(salida.cupo, 10) : null, // Entero
        moneda_id: dataForm.moneda,
        temporada_id: salida?.temporada_id || null, // Opcional
      }

      if(paqueteModalidad === 'fijo')
        sal.habitacion_fija = salida.habitacion_fija;

      if(propio){
        sal.ganancia = salida.ganancia;
        sal.cupos_habitaciones = salida.cupos_habitaciones;
      }
      else{
        sal.precios_catalogo = salida.precios_catalogo;
        sal.precios_catalogo_hoteles = salida.precios_catalogo_hoteles;
        sal.comision = salida.comision;
      }

      if(salida.precio_final)
        sal.precio_final = salida.precio_final;

      return sal;
    }

  )

  const payload = {
    ...dataForm,
    destino_id: selectedDestinoID,
    tipo_paquete_id: dataForm.tipo_paquete,
    servicios_data: serviciosListSelected, 
    moneda_id: dataForm.moneda,
    fecha_inicio: dataForm.fecha_salida,
    fecha_fin: dataForm.fecha_regreso,
    salidas: salidasTemp,
    modalidad: paqueteModalidad,
    activo: true,
  };


  console.log(payload)

  

  // Eliminar campos que no se envían
  delete payload.numero;
  delete payload.tipo_paquete;
  delete payload.destino;
  delete payload.distribuidora;
  delete payload.moneda;
  delete payload.fecha_salida;
  delete payload.fecha_regreso;
  delete payload.imagen; // 🔹 MUY IMPORTANTE

  if (propio) {
    delete payload.distribuidora;
    delete payload.distribuidora_id;
  } else {
    delete payload.cantidad_pasajeros;
  }


  return payload;
}


export const calcularRangoPrecio = (
  hoteles: any[],
  fechaIngreso: string | Date,
  fechaRegreso: string | Date
): { 
  precioMin: number; 
  precioMax: number; 
  dias: number; 
  noches: number } => {
  
  const diffDias = calculateNoches(fechaIngreso, fechaRegreso); // Corrección aquí;
  // Noches = días
  const diffNoches = diffDias;

  const precios: number[] = hoteles.flatMap(hotel =>
    hotel.habitaciones.map((h: any) => h.precio_noche)
  );

  if (precios.length === 0) {
    return { precioMin: 0, precioMax: 0, dias: diffDias, noches: diffNoches };
  }

  const precioMin = Math.min(...precios) * diffNoches;
  const precioMax = Math.max(...precios) * diffNoches;

  return { precioMin, precioMax, dias: diffDias, noches: diffNoches };
};


export const calculateNoches = (fechaIngreso: string | Date, fechaRegreso: string | Date) => {
    const inicio = parseFechaLocal(fechaIngreso);
    const fin = parseFechaLocal(fechaRegreso);

    // Normalizar horas
    inicio.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);

    const msEnDia = 1000 * 60 * 60 * 24;

    // Diferencia en días calendario exacta
    const diffDias = Math.floor((fin.getTime() - inicio.getTime()) / msEnDia);

    return diffDias;

}

// Función auxiliar para parsear fechas como local
const parseFechaLocal = (fecha: string | Date): Date => {
  if (fecha instanceof Date) return fecha;
  const [y, m, d] = fecha.split('-').map(Number);
  return new Date(y, m - 1, d); // mes 0-indexado
};





/**
 * Calcula el costo total del paquete sumando el total de servicios
 * al menor precio_actual y al mayor precio_final del array.
 */
export function calcularCostoPaquete(
  salidas: SalidaPaquete[],
  totalPrecioServicios: number
) {
  if (!salidas || salidas.length === 0) {
    return {
      precio_actual_total: totalPrecioServicios,
      precio_final_total: totalPrecioServicios,
    };
  }


  console.log(totalPrecioServicios);

  // 🔹 Convertir a número y buscar min y max
  const preciosActual = salidas.map((s: any) => Number(s.precio_actual ? s.precio_actual : s.precio));
  const preciosFinal = salidas.map((s) => Number(s.precio_final));

  const menorPrecioActual = Math.min(...preciosActual);
  const mayorPrecioFinal = Math.max(...preciosFinal);

  // 🔹 Calcular sumas finales
  const precio_actual_total = menorPrecioActual + totalPrecioServicios;
  const precio_final_total = mayorPrecioFinal + totalPrecioServicios;

  return {
    precio_actual_total,
    precio_final_total,
  };
}