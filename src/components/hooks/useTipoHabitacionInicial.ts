import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { fetchDataTodo } from "../utils/httpTipoHabitacion";
import type { TipoHabitacionTodos } from "@/types/tipoHabitacion";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const useTipoHabitacionInicial = (setNewRoom: any) => {
    const {data: dataTipoHabitacinesList, isFetching: isFetchingTipoHabitaciones,} = useQuery({
        queryKey: ['tipo-habitaciones-disponibles',], //data cached
        queryFn: () => fetchDataTodo(),
        staleTime: 5 * 60 * 1000 //despues de 5min los datos se consideran obsoletos
      });

    const tipoHabitacinInicial = useMemo(() => {
      if (!isFetchingTipoHabitaciones && dataTipoHabitacinesList?.length) {
        return dataTipoHabitacinesList.find((m: TipoHabitacionTodos) => m.capacidad === 2);
      }
      return undefined;
    }, [isFetchingTipoHabitaciones, dataTipoHabitacinesList]);

    useEffect(() => {
      if (tipoHabitacinInicial) {
        setNewRoom({id: tipoHabitacinInicial.id});
      }
    }, [tipoHabitacinInicial, setNewRoom]);

    return { dataTipoHabitacinesList, isFetchingTipoHabitaciones, tipoHabitacinInicial };
  };