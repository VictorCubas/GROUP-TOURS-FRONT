import { AlertCircle, Check, Eye, Loader2Icon, Shield } from "lucide-react";
import { Card, CardContent } from "./ui/card";

const ResumenCards: React.FC<ResumenCardsProps> = 
              ({total_permisos, total_activos, total_inactivos, total_en_uso, isFetchingResumen, isErrorResumen}) => {

   const stats = [
      { title: "Total", value: total_permisos, icon: Shield, color: "border-blue-200 bg-blue-50", iconColor: "text-blue-500" },
      {
        title: "Activos",
        value: total_activos,
        icon: Check,
        color: "border-emerald-200 bg-emerald-50",
        iconColor: "text-emerald-500",
      },
      { title: "Inactivos", value: total_inactivos, icon: Eye, color: "border-purple-200 bg-purple-50", iconColor: "text-purple-500" },
      { title: "En Uso", value: total_en_uso, icon: AlertCircle, color: "border-red-200 bg-red-50", iconColor: "text-red-500" },
    ]
  // }

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
          {stats.map((stat, index) => (
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
export default ResumenCards;



interface ResumenCardsProps{
  total_permisos: number;
  total_activos: number;
  total_inactivos: number;
  total_en_uso: number;
  isFetchingResumen: boolean
  isErrorResumen: boolean
}
