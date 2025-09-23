/* eslint-disable @typescript-eslint/no-explicit-any */
export const getPayload = (salidas: any[], dataForm: any, propio: boolean, selectedDestinoID: any, selectedPermissions: any []): any => {
    const salidasTemp = salidas.map((salida: any) => ({
      fecha_salida: salida.fecha_salida_v2,
      fecha_regreso: salida.fecha_regreso_v2,
      senia: salida.senia,
      precio_actual: salida.precio,
      cupo: parseInt(salida.cupo, 10), // Entero
      moneda_id: dataForm.moneda,
      temporada_id: salida?.temporada_id || null, // Opcional
    }))

  const payload = {
    ...dataForm,
    destino_id: selectedDestinoID,
    tipo_paquete_id: dataForm.tipo_paquete,
    servicios_ids: selectedPermissions, 
    moneda_id: dataForm.moneda,
    fecha_inicio: dataForm.fecha_salida,
    fecha_fin: dataForm.fecha_regreso,
    salidas: salidasTemp,
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