import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart, 
  Area
} from "recharts";
import { SalesData } from "@/types/salary";
import { useIsMobile } from "@/hooks/use-mobile";

const SalesAnalytics = () => {
  const [period, setPeriod] = useState("today");
  const [activeTab, setActiveTab] = useState("categories");
  const isMobile = useIsMobile();
  
  const [salesData, setSalesData] = useState<{[key: string]: SalesData}>({
    today: {
      categories: [
        { name: "Кофе", value: 65, color: "#9b87f5" },
        { name: "Чай", value: 15, color: "#62C99C" },
        { name: "Десерты", value: 12, color: "#FF8042" },
        { name: "Прочее", value: 8, color: "#FFC658" }
      ],
      products: [
        { id: "1", name: "Эспрессо", quantity: 120, category: "Кофе" },
        { id: "2", name: "Американо", quantity: 95, category: "Кофе" },
        { id: "3", name: "Капучино", quantity: 150, category: "Кофе" },
        { id: "4", name: "Латте", quantity: 180, category: "Кофе" },
        { id: "5", name: "Чай зеленый", quantity: 70, category: "Чай" },
        { id: "6", name: "Чай черный", quantity: 65, category: "Чай" },
        { id: "7", name: "Круассан", quantity: 85, category: "Десерты" },
        { id: "8", name: "Маффин", quantity: 60, category: "Десерты" }
      ]
    },
    week: {
      categories: [
        { name: "Кофе", value: 62, color: "#9b87f5" },
        { name: "Чай", value: 18, color: "#62C99C" },
        { name: "Десерты", value: 14, color: "#FF8042" },
        { name: "Прочее", value: 6, color: "#FFC658" }
      ],
      products: [
        { id: "1", name: "Эспрессо", quantity: 820, category: "Кофе" },
        { id: "2", name: "Американо", quantity: 705, category: "Кофе" },
        { id: "3", name: "Капучино", quantity: 950, category: "Кофе" },
        { id: "4", name: "Латте", quantity: 1100, category: "Кофе" },
        { id: "5", name: "Чай зеленый", quantity: 480, category: "Чай" },
        { id: "6", name: "Чай черный", quantity: 420, category: "Чай" },
        { id: "7", name: "Круассан", quantity: 550, category: "Десерты" },
        { id: "8", name: "Маффин", quantity: 380, category: "Десерты" }
      ]
    },
    month: {
      categories: [
        { name: "Кофе", value: 59, color: "#9b87f5" },
        { name: "Чай", value: 20, color: "#62C99C" },
        { name: "Десерты", value: 16, color: "#FF8042" },
        { name: "Прочее", value: 5, color: "#FFC658" }
      ],
      products: [
        { id: "1", name: "Эспрессо", quantity: 3500, category: "Кофе" },
        { id: "2", name: "Американо", quantity: 2800, category: "Кофе" },
        { id: "3", name: "Капучино", quantity: 4200, category: "Кофе" },
        { id: "4", name: "Латте", quantity: 4800, category: "Кофе" },
        { id: "5", name: "Чай зеленый", quantity: 2100, category: "Чай" },
        { id: "6", name: "Чай черный", quantity: 1900, category: "Чай" },
        { id: "7", name: "Круассан", quantity: 2400, category: "Десерты" },
        { id: "8", name: "Маффин", quantity: 1600, category: "Десерты" }
      ]
    }
  });

  const revenueData = {
    today: [
      { time: "9:00", revenue: 3500 },
      { time: "10:00", revenue: 5200 },
      { time: "11:00", revenue: 6800 },
      { time: "12:00", revenue: 8900 },
      { time: "13:00", revenue: 11000 },
      { time: "14:00", revenue: 9800 },
      { time: "15:00", revenue: 8200 },
      { time: "16:00", revenue: 7500 },
      { time: "17:00", revenue: 9300 },
      { time: "18:00", revenue: 12500 },
      { time: "19:00", revenue: 10800 },
      { time: "20:00", revenue: 8600 }
    ],
    week: [
      { time: "Пн", revenue: 45000 },
      { time: "Вт", revenue: 42000 },
      { time: "Ср", revenue: 48000 },
      { time: "Чт", revenue: 51000 },
      { time: "Пт", revenue: 68000 },
      { time: "Сб", revenue: 82000 },
      { time: "Вс", revenue: 76000 }
    ],
    month: [
      { time: "Нед 1", revenue: 320000 },
      { time: "Нед 2", revenue: 340000 },
      { time: "Нед 3", revenue: 360000 },
      { time: "Нед 4", revenue: 380000 }
    ]
  };

  const metricsData = {
    today: {
      revenue: "83000 ₽",
      profit: "41500 ₽",
      averageCheck: "358 ₽",
      checks: 232
    },
    week: {
      revenue: "412000 ₽",
      profit: "206000 ₽",
      averageCheck: "372 ₽",
      checks: 1108
    },
    month: {
      revenue: "1420000 ₽",
      profit: "710000 ₽",
      averageCheck: "365 ₽",
      checks: 3890
    }
  };

  const currentSalesData = salesData[period];
  const currentRevenueData = revenueData[period as keyof typeof revenueData];
  const currentMetrics = metricsData[period as keyof typeof metricsData];

  const sortedProducts = [...currentSalesData.products]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <MainLayout>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold">Аналитика продаж</h1>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className={`${isMobile ? 'w-28' : 'w-32'}`}>
              <SelectValue placeholder="Период" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Сегодня</SelectItem>
              <SelectItem value="week">Неделя</SelectItem>
              <SelectItem value="month">Месяц</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Card className="metric-card">
            <CardHeader className={`${isMobile ? 'p-2 pb-0' : 'p-3 pb-0'}`}>
              <CardDescription>Выручка</CardDescription>
            </CardHeader>
            <CardContent className={`${isMobile ? 'p-2 pt-0' : 'p-3 pt-0'}`}>
              <p className="text-lg font-bold">{currentMetrics.revenue}</p>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardHeader className={`${isMobile ? 'p-2 pb-0' : 'p-3 pb-0'}`}>
              <CardDescription>Прибыль</CardDescription>
            </CardHeader>
            <CardContent className={`${isMobile ? 'p-2 pt-0' : 'p-3 pt-0'}`}>
              <p className="text-lg font-bold">{currentMetrics.profit}</p>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardHeader className={`${isMobile ? 'p-2 pb-0' : 'p-3 pb-0'}`}>
              <CardDescription>Средний чек</CardDescription>
            </CardHeader>
            <CardContent className={`${isMobile ? 'p-2 pt-0' : 'p-3 pt-0'}`}>
              <p className="text-lg font-bold">{currentMetrics.averageCheck}</p>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardHeader className={`${isMobile ? 'p-2 pb-0' : 'p-3 pb-0'}`}>
              <CardDescription>Кол-во чеков</CardDescription>
            </CardHeader>
            <CardContent className={`${isMobile ? 'p-2 pt-0' : 'p-3 pt-0'}`}>
              <p className="text-lg font-bold">{currentMetrics.checks}</p>
            </CardContent>
          </Card>
        </div>
          
        <Card>
          <CardHeader className={`${isMobile ? 'p-3 pb-1' : 'p-4 pb-2'}`}>
            <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>Динамика выручки</CardTitle>
            <CardDescription className="text-xs">
              График выручки за {period === "today" ? "день" : period === "week" ? "неделю" : "месяц"}
            </CardDescription>
          </CardHeader>
          <CardContent className={`${isMobile ? 'p-2' : 'p-4'}`}>
            <div className={`${isMobile ? 'h-48' : 'h-60'} w-full`}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={currentRevenueData}
                  margin={isMobile ? { top: 10, right: 10, left: 10, bottom: 0 } : { top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: isMobile ? 10 : 12 }} />
                  <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                  <Tooltip formatter={(value) => [`${value} ₽`, "Выручка"]} />
                  <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Выручка" 
                    fill="#9b87f5" 
                    stroke="#7E69AB" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">По категориям</TabsTrigger>
            <TabsTrigger value="products">По продуктам</TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories">
            <Card>
              <CardHeader className={`${isMobile ? 'p-3 pb-1' : 'p-4 pb-2'}`}>
                <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>Распределение продаж</CardTitle>
                <CardDescription className="text-xs">
                  Процентное соотношение категорий
                </CardDescription>
              </CardHeader>
              <CardContent className={`${isMobile ? 'p-2' : 'p-4'}`}>
                <div className={`${isMobile ? 'h-[250px]' : 'h-[300px]'} w-full`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={currentSalesData.categories}
                        cx="50%"
                        cy="50%"
                        labelLine={!isMobile}
                        label={({ name, percent }) => isMobile ? `${(percent * 100).toFixed(0)}%` : `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={isMobile ? 80 : 100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {currentSalesData.categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend layout={isMobile ? "horizontal" : "vertical"} verticalAlign={isMobile ? "bottom" : "middle"} align={isMobile ? "center" : "right"} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="products">
            <Card>
              <CardHeader className={`${isMobile ? 'p-3 pb-1' : 'p-4 pb-2'}`}>
                <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>Топ продаваемых товаров</CardTitle>
                <CardDescription className="text-xs">
                  Наиболее популярные товары
                </CardDescription>
              </CardHeader>
              <CardContent className={`${isMobile ? 'p-2' : 'p-4'}`}>
                <div className={`${isMobile ? 'h-[250px]' : 'h-[300px]'} w-full`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sortedProducts}
                      layout="vertical"
                      margin={isMobile ? { top: 5, right: 10, left: 80, bottom: 5 } : { top: 20, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: isMobile ? 10 : 12 }} />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        tick={{ fontSize: isMobile ? 10 : 14 }}
                        width={isMobile ? 80 : 100}
                      />
                      <Tooltip />
                      <Bar 
                        dataKey="quantity" 
                        name="Количество" 
                        fill="#9b87f5" 
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
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

export default SalesAnalytics;
