import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "@/contexts/NotificationContext";
import { ProductCategory, ProductIngredient } from "@/types/salary";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Tooltip,
  Legend
} from "recharts";

interface InventoryItem {
  id: number;
  name: string;
  amount: number;
  unit: string;
  status: "normal" | "low" | "critical";
  category?: string;
  isIngredient: boolean;
}

const DEFAULT_CATEGORIES: ProductCategory[] = [
  { id: "coffee", name: "Кофе", color: "#9b87f5" },
  { id: "tea", name: "Чай", color: "#62C99C" },
  { id: "dessert", name: "Десерты", color: "#FF8042" },
  { id: "other", name: "Прочее", color: "#FFC658" }
];

const Inventory = () => {
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState("inventory");
  const [categories, setCategories] = useState<ProductCategory[]>(DEFAULT_CATEGORIES);
  
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    {
      id: 1,
      name: "Кофейные зерна",
      amount: 12,
      unit: "кг",
      status: "normal",
      isIngredient: true
    },
    {
      id: 2,
      name: "Молоко",
      amount: 5,
      unit: "л",
      status: "low",
      isIngredient: true
    },
    {
      id: 3,
      name: "Шоколадный сироп",
      amount: 0.5,
      unit: "л",
      status: "critical",
      isIngredient: true
    },
    {
      id: 4,
      name: "Карамельный сироп",
      amount: 2,
      unit: "л",
      status: "normal",
      isIngredient: true
    },
    {
      id: 5,
      name: "Стаканы 250мл",
      amount: 350,
      unit: "шт",
      status: "normal",
      isIngredient: false
    },
    {
      id: 6,
      name: "Стаканы 350мл",
      amount: 150,
      unit: "шт",
      status: "low",
      isIngredient: false
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "low":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Мало</Badge>;
      case "critical":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Критично</Badge>;
      default:
        return <Badge variant="outline" className="bg-green-100 text-green-800">ОК</Badge>;
    }
  };

  const ingredientItems = inventoryItems.filter(item => item.isIngredient);
  const otherItems = inventoryItems.filter(item => !item.isIngredient);

  const checkInventory = () => {
    const lowItems = inventoryItems.filter(item => item.status !== "normal");
    if (lowItems.length > 0) {
      addNotification({
        title: "Проверка инвентаря",
        message: `Обнаружено ${lowItems.length} товаров с низким запасом. Пожалуйста, пополните склад.`,
        type: "warning"
      });
    } else {
      addNotification({
        title: "Проверка инвентаря",
        message: "Все запасы в норме.",
        type: "success"
      });
    }
  };

  const updateStockAfterSale = (usedIngredients: ProductIngredient[]) => {
    const updatedItems = [...inventoryItems];
    
    usedIngredients.forEach(usedItem => {
      const itemIndex = updatedItems.findIndex(item => 
        item.name.toLowerCase() === usedItem.name.toLowerCase()
      );
      
      if (itemIndex !== -1) {
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          amount: Math.max(0, updatedItems[itemIndex].amount - usedItem.amount)
        };
        
        if (updatedItems[itemIndex].amount === 0) {
          updatedItems[itemIndex].status = "critical";
        } else if (updatedItems[itemIndex].amount <= 2) {
          updatedItems[itemIndex].status = "low";
        }
      }
    });
    
    setInventoryItems(updatedItems);
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Учет товаров</h1>
          <Button 
            onClick={() => setActiveTab("sales")}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Выручка
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inventory">Инвентарь</TabsTrigger>
            <TabsTrigger value="sales">Аналитика продаж</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inventory">
            <div className="space-y-4">
              <div className="flex justify-between">
                <h2 className="text-lg font-medium">Ингредиенты</h2>
                <Button 
                  variant="outline" 
                  className="text-sm text-purple-600 hover:text-purple-700"
                  onClick={checkInventory}
                >
                  Проверить запасы
                </Button>
              </div>
              
              <Card>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Наименование</TableHead>
                        <TableHead>Количество</TableHead>
                        <TableHead>Статус</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ingredientItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.amount} {item.unit}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <h2 className="text-lg font-medium mt-6">Прочие товары</h2>
              <Card>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Наименование</TableHead>
                        <TableHead>Количество</TableHead>
                        <TableHead>Статус</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {otherItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.amount} {item.unit}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>Распределение продаж по категориям</CardTitle>
                <CardDescription>Процентное соотношение категорий в общей структуре продаж</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Кофе", value: 65, color: "#9b87f5" },
                          { name: "Чай", value: 15, color: "#62C99C" },
                          { name: "Десерты", value: 12, color: "#FF8042" },
                          { name: "Прочее", value: 8, color: "#FFC658" }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: "Кофе", value: 65, color: "#9b87f5" },
                          { name: "Чай", value: 15, color: "#62C99C" },
                          { name: "Десерты", value: 12, color: "#FF8042" },
                          { name: "Прочее", value: 8, color: "#FFC658" }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
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

export default Inventory;
