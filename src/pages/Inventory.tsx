
import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { getAllInventoryItems, updateInventoryItem } from "@/services/inventoryService";
import { InventoryItem } from "@/types/inventory";

const Inventory = () => {
  const { addNotification } = useNotifications();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  
  useEffect(() => {
    // Загружаем инвентарь при монтировании компонента
    setInventoryItems(getAllInventoryItems());
  }, []);

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

  const checkInventoryLevels = () => {
    const lowItems = inventoryItems.filter(item => item.status === "low" || item.status === "critical");
    
    if (lowItems.length > 0) {
      lowItems.forEach(item => {
        addNotification({
          title: item.status === "critical" ? "Критический запас!" : "Низкий запас",
          message: `${item.name}: осталось ${item.amount} ${item.unit}`,
          type: item.status === "critical" ? "error" : "warning"
        });
      });
    } else {
      addNotification({
        title: "Проверка инвентаря",
        message: "Все товары в достаточном количестве",
        type: "success"
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Учет товаров</h1>
        <div className="flex justify-between">
          <h2 className="text-lg font-medium">Остатки на складе</h2>
          <Button 
            variant="outline"
            onClick={checkInventoryLevels}
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
                {inventoryItems.map((item) => (
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
    </MainLayout>
  );
};

export default Inventory;
