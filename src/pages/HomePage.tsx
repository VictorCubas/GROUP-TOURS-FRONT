
import { Card, CardContent } from "@/components/ui/card"
import { Home, Check, Eye, UserCheck, Plane } from "lucide-react"


const HomePage = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <p className="text-gray-600">Gestiona tus tours y clientes de manera eficiente</p>
          </div>
          
        </div>

        {/* Stats Cards */}
        <StatsCards />

        
    </div>
  )
}

export default HomePage


function StatsCards() {
  const stats = [
    { title: "Tours Activos", value: "24", icon: Plane, color: "border-blue-200 bg-blue-50", iconColor: "text-blue-500" },
    {
      title: "Reservas Activas",
      value: "18",
      icon: Check,
      color: "border-emerald-200 bg-emerald-50",
      iconColor: "text-emerald-500",
    },
    { title: "Tours Completados", value: "12", icon: Eye, color: "border-purple-200 bg-purple-50", iconColor: "text-purple-500" },
    { title: "Nuevos clientes", value: "3", icon: UserCheck, color: "border-red-200 bg-red-50", iconColor: "text-red-500" },
  ]

  return (
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
  )
}