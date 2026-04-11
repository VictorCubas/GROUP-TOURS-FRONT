import { useQuery } from "@tanstack/react-query";
import { fetchDataMonedaTodos } from "../utils/httpPaquete";
import { useEffect, useMemo } from "react";
import type { Moneda } from "@/types/paquetes";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const useMonedaInicial = (setValue: any) => {
    const { data: dataMonedaList, isFetching } = useQuery({
      queryKey: ['monedas-disponibles'],
      queryFn: () => fetchDataMonedaTodos(),
      staleTime: 5 * 60 * 1000,
    });

    const monedaInicial = useMemo(() => {
      if (!isFetching && dataMonedaList?.length) {
        return dataMonedaList.find((m: Moneda) => m.codigo === 'USD');
      }
      return undefined;
    }, [isFetching, dataMonedaList]);

    useEffect(() => {
      if (monedaInicial) {
        setValue('moneda', monedaInicial.id.toString());
      }
    }, [monedaInicial, setValue]);

    return { dataMonedaList, isFetching, monedaInicial };
  };