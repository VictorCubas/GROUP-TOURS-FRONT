import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./ui/table";
import type { HotelReserva } from "@/types/reservas";
import { formatearSeparadorMiles } from "@/helper/formatter";
import { useBloqueoHabitacionContext } from "@/context/BloqueoHabitacionContext";


export const BloqueoHabitacionesSeleccionadosCard = () => {
  const { bloqueoData, hotelesPorSalida, montoTotalBloqueos } = useBloqueoHabitacionContext();

  return (
    <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Bloqueos seleccionados</CardTitle>
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-md border tabla-bloqueos">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hotel Reserva</TableHead>
                    <TableHead>Habitación</TableHead>
                    <TableHead>Capacidad</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Pasajeros</TableHead>
                    <TableHead>Precio Unitario</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hotelesPorSalida.map((hotel: HotelReserva) => {
                    return hotel.habitaciones.map(habitacion => {
                      const bloqueo = bloqueoData.find(bloqueo => bloqueo.habitacion_id.toString() === habitacion.id.toString());

                      if(bloqueo){
                        const { capacidad = 0, cantidad: cantidadBloqueada = 0 } = bloqueo;
                        // const cantidadBloqueada = bloqueoData.find(bloqueo => bloqueo.habitacion_id.toString() === habitacion.id.toString())?.cantidad ?? 0;

                        return <TableRow key={bloqueo.habitacion_id}>
                                  <TableCell className="font-medium">{hotel?.nombre}</TableCell>
                                  <TableCell>{habitacion.tipo_habitacion_nombre}</TableCell>
                                  {/* <TableCell>{formatearSeparadorMiles.format(salida.precio ?? salida.costo_base_desde)}</TableCell> */}
                                  <TableCell>{bloqueo.cantidad}</TableCell>
                                  <TableCell>{bloqueo.capacidad}</TableCell>
                                  <TableCell>{bloqueo.cantidad * bloqueo.capacidad}</TableCell>
                                  <TableCell>{formatearSeparadorMiles.format(parseFloat(habitacion.precio_calculado.precio_venta_final))}</TableCell>
                                  <TableCell className="text-blue-600 font-bold">
                                    {formatearSeparadorMiles.format((cantidadBloqueada * capacidad) * parseFloat(habitacion.precio_calculado.precio_venta_final))}
                                  </TableCell>
                              </TableRow>
                      }
                    });

                  })}
                </TableBody>

                {!!montoTotalBloqueos && 
                  <TableFooter>
                    <TableRow >
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell className="font-semibold text-gray-900">TOTAL</TableCell>
                      <TableCell className="font-bold text-lg text-blue-600">
                        {formatearSeparadorMiles.format(montoTotalBloqueos)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                }
                </Table>
            </div>
          </CardContent>
        </Card>
  )
}
