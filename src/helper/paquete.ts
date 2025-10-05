/* eslint-disable @typescript-eslint/no-explicit-any */
export const getPayload = (salidas: any[], dataForm: any, propio: boolean, selectedDestinoID: any,
 serviciosListSelected: any [], paqueteModalidad: 'flexible' | 'fijo'): any => {

    const salidasTemp = salidas.map((salida: any) => {
        const sal: any = {
        fecha_salida: salida.fecha_salida_v2,
        fecha_regreso: salida.fecha_regreso_v2,
        senia: salida.senia,
        precio_actual: salida.precio_actual,
        hoteles: salida.hoteles_ids,
        cupo: parseInt(salida.cupo, 10), // Entero
        moneda_id: dataForm.moneda,
        cupos_habitaciones: salida.cupos_habitaciones,
        temporada_id: salida?.temporada_id || null, // Opcional
      }

      if(paqueteModalidad === 'fijo')
        sal.habitacion_fija = salida.habitacion_fija;

      if(propio)
        sal.ganancia = salida.ganancia;
      else
        sal.comision = salida.comision;

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