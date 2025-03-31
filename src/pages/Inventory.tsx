
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/contexts/NotificationContext";

const Inventory = () => {
  const { addNotification } = useNotifications();

  // Demo data
  const inventoryItems = [
    {
      id: 1,
      name: "Кофейные зерна",
      amount: 12,
      unit: "кг",
      status: "normal" // normal, low, critical
    },
    {
      id: 2,
      name: "Молоко",
      amount: 5,
      unit: "л",
      status: "low"
    },
    {
      id: 3,
      name: "Шоколадный сироп",
      amount: 0.5,
      unit: "л",
      status: "critical"
    },
    {
      id: 4,
      name: "Карамельный сироп",
      amount: 2,
      unit: "л",
      status: "normal"
    },
    {
      id: 5,
      name: "Стаканы 250мл",
      amount: 350,
      unit: "шт",
      status: "normal"
    },
    {
      id: 6,
      name: "Стаканы 350мл",
      amount: 150,
      unit: "шт",
      status: "low"
    }
  ];

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

  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Учет товаров</h1>
        <div className="flex justify-between">
          <h2 className="text-lg font-medium">Остатки на складе</h2>
          <button 
            className="text-sm text-coffee-purple hover:underline"
            onClick={() => {
              addNotification({
                title: "Проверка инвентаря",
                message: "Обнаружены товары с низким запасом. Пожалуйста, пополните склад.",
                type: "warning"
              });
            }}
          >
            Проверить запасы
          </button>
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
