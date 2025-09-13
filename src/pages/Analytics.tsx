import React from 'react';
import { useParams } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  Activity,
  Calendar,
  Download,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

// Mock data for analytics
const generateMockData = () => {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    return {
      date: format(date, 'MMM dd', { locale: es }),
      fullDate: date,
      users: Math.floor(Math.random() * 100) + 50,
      sessions: Math.floor(Math.random() * 150) + 100,
      completions: Math.floor(Math.random() * 30) + 10,
      engagement: Math.floor(Math.random() * 40) + 60,
    };
  });

  const moduleData = [
    { name: 'Introducción a React', completed: 85, total: 100, color: 'hsl(var(--primary))' },
    { name: 'Estado y Props', completed: 72, total: 100, color: 'hsl(var(--accent))' },
    { name: 'Hooks Avanzados', completed: 64, total: 100, color: 'hsl(var(--stepable-success))' },
    { name: 'Testing', completed: 45, total: 100, color: 'hsl(var(--stepable-warning))' },
    { name: 'Deployment', completed: 28, total: 100, color: 'hsl(var(--stepable-error))' },
  ];

  const deviceData = [
    { name: 'Desktop', value: 65, color: 'hsl(var(--primary))' },
    { name: 'Mobile', value: 25, color: 'hsl(var(--accent))' },
    { name: 'Tablet', value: 10, color: 'hsl(var(--stepable-success))' },
  ];

  const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      day: format(date, 'EEE', { locale: es }),
      hours: Math.floor(Math.random() * 8) + 2,
      modules: Math.floor(Math.random() * 5) + 1,
    };
  });

  return { last30Days, moduleData, deviceData, weeklyActivity };
};

const Analytics = () => {
  const { projectId } = useParams();
  const { last30Days, moduleData, deviceData, weeklyActivity } = generateMockData();

  const keyMetrics = [
    {
      title: 'Usuarios Activos',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      description: 'En los últimos 30 días',
    },
    {
      title: 'Tiempo Promedio',
      value: '4.2h',
      change: '+8.2%',
      trend: 'up',
      icon: Clock,
      description: 'Por sesión de estudio',
    },
    {
      title: 'Tasa de Completitud',
      value: '78%',
      change: '+5.1%',
      trend: 'up',
      icon: Target,
      description: 'Módulos completados',
    },
    {
      title: 'Engagement Score',
      value: '8.4/10',
      change: '+0.8',
      trend: 'up',
      icon: Activity,
      description: 'Satisfacción general',
    },
  ];

  const recentActivity = [
    {
      user: 'María González',
      action: 'Completó el módulo "React Hooks"',
      time: 'Hace 2 horas',
      avatar: 'MG',
    },
    {
      user: 'Carlos Ruiz',
      action: 'Inició "Testing con Jest"',
      time: 'Hace 3 horas',
      avatar: 'CR',
    },
    {
      user: 'Ana Martín',
      action: 'Logró certificación Bronze',
      time: 'Hace 5 horas',
      avatar: 'AM',
    },
    {
      user: 'Diego López',
      action: 'Completó ejercicio práctico',
      time: 'Hace 1 día',
      avatar: 'DL',
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-stepable-3xl font-bold text-foreground">
            Análisis del Proyecto
          </h1>
          <p className="text-muted-foreground mt-2">
            Métricas y progreso del proyecto #{projectId}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="30d">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="90d">90 días</SelectItem>
              <SelectItem value="1y">1 año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => (
          <Card key={index} className="stepable-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-stepable-2xl font-bold text-foreground">
                {metric.value}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 text-stepable-success mr-1" />
                <span className="text-stepable-success font-medium">{metric.change}</span>
                <span className="ml-1">{metric.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="modules">Módulos</TabsTrigger>
          <TabsTrigger value="devices">Dispositivos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Chart */}
            <Card className="stepable-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Actividad Diaria
                </CardTitle>
                <CardDescription>
                  Usuarios activos en los últimos 30 días
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    users: {
                      label: "Usuarios",
                      color: "hsl(var(--primary))",
                    },
                    sessions: {
                      label: "Sesiones",
                      color: "hsl(var(--accent))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={last30Days}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false}
                        tickLine={false}
                        className="text-xs"
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        className="text-xs"
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="users"
                        stackId="1"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey="sessions"
                        stackId="1"
                        stroke="hsl(var(--accent))"
                        fill="hsl(var(--accent))"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Weekly Activity */}
            <Card className="stepable-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Actividad Semanal
                </CardTitle>
                <CardDescription>
                  Horas de estudio por día de la semana
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    hours: {
                      label: "Horas",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyActivity}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="hours" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Module Progress */}
            <Card className="stepable-card">
              <CardHeader>
                <CardTitle>Progreso por Módulo</CardTitle>
                <CardDescription>
                  Porcentaje de completitud de cada módulo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {moduleData.map((module, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{module.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {module.completed}%
                      </span>
                    </div>
                    <Progress value={module.completed} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Device Usage */}
            <Card className="stepable-card">
              <CardHeader>
                <CardTitle>Uso por Dispositivo</CardTitle>
                <CardDescription>
                  Distribución de accesos por tipo de dispositivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    desktop: {
                      label: "Desktop",
                      color: "hsl(var(--primary))",
                    },
                    mobile: {
                      label: "Mobile",
                      color: "hsl(var(--accent))",
                    },
                    tablet: {
                      label: "Tablet",
                      color: "hsl(var(--stepable-success))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name} ${value}%`}
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="stepable-card">
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>
                Últimas acciones de los usuarios en el proyecto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {activity.avatar}
                      </span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.user}</p>
                      <p className="text-xs text-muted-foreground">{activity.action}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {deviceData.map((device, index) => (
              <Card key={index} className="stepable-card">
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">{device.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-stepable-3xl font-bold text-primary mb-2">
                    {device.value}%
                  </div>
                  <Progress value={device.value} className="h-2 mb-4" />
                  <Badge variant="secondary" className="text-xs">
                    {Math.floor(device.value * 28)} usuarios
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;