
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

const Analytics = () => {
  const isMobile = useIsMobile();
  
  // Demo data
  const monthlyData = [
    { name: "Янв", revenue: 250000, profit: 125000 },
    { name: "Фев", revenue: 280000, profit: 140000 },
    { name: "Мар", revenue: 300000, profit: 150000 },
    { name: "Апр", revenue: 320000, profit: 160000 },
    { name: "Май", revenue: 350000, profit: 175000 },
    { name: "Июн", revenue: 400000, profit: 200000 }
  ];

  const salesByCategory = [
    { name: "Кофе", value: 65 },
    { name: "Чай", value: 15 },
    { name: "Десерты", value: 10 },
    { name: "Сэндвичи", value: 8 },
    { name: "Другое", value: 2 }
  ];

  const COLORS = ["#9b87f5", "#62C99C", "#FF8042", "#FFC658", "#D6BCFA"];

  const dailyCustomers = [
    { name: "Пн", customers: 80 },
    { name: "Вт", customers: 95 },
    { name: "Ср", customers: 110 },
    { name: "Чт", customers: 125 },
    { name: "Пт", customers: 150 },
    { name: "Сб", customers: 180 },
    { name: "Вс", customers: 160 }
  ];

  return (
    <MainLayout>
      <div className="space-y-3">
        <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold`}>Аналитика</h1>

        <Tabs defaultValue="revenue" className="space-y-3">
          <TabsList className={`${isMobile ? 'flex flex-wrap' : 'grid grid-cols-3'} w-full`}>
            <TabsTrigger value="revenue" className={isMobile ? 'flex-1 text-xs px-1' : ''}>Выручка</TabsTrigger>
            <TabsTrigger value="sales" className={isMobile ? 'flex-1 text-xs px-1' : ''}>Продажи</TabsTrigger>
            <TabsTrigger value="customers" className={isMobile ? 'flex-1 text-xs px-1' : ''}>Посетители</TabsTrigger>
          </TabsList>
          
          <TabsContent value="revenue">
            <Card>
              <CardHeader className={`${isMobile ? 'p-2 pb-1' : 'p-4 pb-2'}`}>
                <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>Выручка и прибыль</CardTitle>
                <CardDescription className="text-xs">
                  Динамика выручки и прибыли по месяцам
                </CardDescription>
              </CardHeader>
              <CardContent className={`${isMobile ? 'p-1' : 'p-4'}`}>
                <div className={`${isMobile ? 'h-[200px]' : 'h-[300px]'} w-full`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyData}
                      margin={isMobile ? { top: 5, right: 5, left: -15, bottom: 5 } : { top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: isMobile ? 8 : 12 }} />
                      <YAxis tick={{ fontSize: isMobile ? 8 : 12 }} />
                      <Tooltip 
                        formatter={(value: number) => [`${value.toLocaleString()} ₽`, undefined]}
                        contentStyle={isMobile ? { fontSize: '10px' } : undefined}
                      />
                      <Legend wrapperStyle={{ fontSize: isMobile ? 8 : 12 }} />
                      <Bar dataKey="revenue" name="Выручка" fill="#9b87f5" />
                      <Bar dataKey="profit" name="Прибыль" fill="#62C99C" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sales">
            <Card>
              <CardHeader className={`${isMobile ? 'p-2 pb-1' : 'p-4 pb-2'}`}>
                <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>Структура продаж</CardTitle>
                <CardDescription className="text-xs">
                  Распределение по категориям товаров
                </CardDescription>
              </CardHeader>
              <CardContent className={`${isMobile ? 'p-1' : 'p-4'}`}>
                <div className={`${isMobile ? 'h-[200px]' : 'h-[300px]'} w-full`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={!isMobile}
                        label={({ name, percent }) => isMobile ? `${(percent * 100).toFixed(0)}%` : `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={isMobile ? 60 : 100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {salesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={isMobile ? { fontSize: '10px' } : undefined} />
                      <Legend layout={isMobile ? "horizontal" : "vertical"} verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: isMobile ? 8 : 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="customers">
            <Card>
              <CardHeader className={`${isMobile ? 'p-2 pb-1' : 'p-4 pb-2'}`}>
                <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>Посетители</CardTitle>
                <CardDescription className="text-xs">
                  Динамика количества посетителей по дням недели
                </CardDescription>
              </CardHeader>
              <CardContent className={`${isMobile ? 'p-1' : 'p-4'}`}>
                <div className={`${isMobile ? 'h-[200px]' : 'h-[300px]'} w-full`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dailyCustomers}
                      margin={isMobile ? { top: 5, right: 5, left: -15, bottom: 5 } : { top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: isMobile ? 8 : 12 }} />
                      <YAxis tick={{ fontSize: isMobile ? 8 : 12 }} />
                      <Tooltip contentStyle={isMobile ? { fontSize: '10px' } : undefined} />
                      <Legend wrapperStyle={{ fontSize: isMobile ? 8 : 12 }} />
                      <Line type="monotone" dataKey="customers" name="Посетители" stroke="#9b87f5" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Analytics;
