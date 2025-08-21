/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { AlertCircle, Check, Eye, Loader2Icon, Shield } from "lucide-react";
import { Card, CardContent } from "./ui/card";

const ResumenCardsDinamico: React.FC<ResumenCardsProps> = 
              ({resumen, isFetchingResumen, isErrorResumen}) => {

  let stats: any = [];

  if(!isFetchingResumen && resumen && resumen.length > 0){
    stats = [
      { title: resumen[0].texto, value: resumen[0].valor, icon: Shield, color: "border-blue-200 bg-blue-50", iconColor: "text-blue-500" },
      {
        title: resumen[1].texto,
        value: resumen[1].valor,
        icon: Check,
        color: "border-emerald-200 bg-emerald-50",
        iconColor: "text-emerald-500",
      },
      { title: resumen[2].texto, value: resumen[2].valor, icon: Eye, color: "border-purple-200 bg-purple-50", iconColor: "text-purple-500" },
      { title: resumen[3].texto, value: resumen[3].valor, icon: AlertCircle, color: "border-red-200 bg-red-50", iconColor: "text-red-500" },
    ]
  }

  return (
    <>
      {isFetchingResumen && <div className="h-32 flex items-center justify-center w-full">
        <Loader2Icon className="animate-spin w-10 h-10 text-gray-300"/>
        </div>}
      {!isFetchingResumen && isErrorResumen && <>
          <div className="h-32 flex items-center justify-center w-full">
            <p>No se pudieron recuperar los datos</p>
          </div>
      </>}
      {!isFetchingResumen && !isErrorResumen &&
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat: any, index: number) => (
            <Card key={index} className={`border ${stat.color} hover:shadow-md transition-shadow`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }
    </>
  )
}
export default ResumenCardsDinamico;



// interface ResumenCardsProps{
//   total: number;
//   total_activos: number;
//   total_inactivos: number;
//   total_en_uso: number;
//   isFetchingResumen: boolean
//   isErrorResumen: boolean
// }


interface ResumenCardsProps{
  resumen: ResumenItem[];
  isFetchingResumen: boolean
  isErrorResumen: boolean
}

export interface ResumenItem {
    texto: string;
    valor: string;
}