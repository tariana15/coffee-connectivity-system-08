
import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Coffee, CreditCard, Plus, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Demo data
const MENU_ITEMS = [
  { id: 1, name: "Эспрессо", price: 150, category: "coffee" },
  { id: 2, name: "Американо", price: 170, category: "coffee" },
  { id: 3, name: "Капучино", price: 250, category: "coffee" },
  { id: 4, name: "Латте", price: 270, category: "coffee" },
  { id: 5, name: "Моккачино", price: 290, category: "coffee" },
  { id: 6, name: "Круассан", price: 150, category: "food" },
  { id: 7, name: "Сэндвич", price: 250, category: "food" },
  { id: 8, name: "Маффин", price: 180, category: "food" }
];

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string; // Added the missing category property
}

const CashRegister = () => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [shiftOpen, setShiftOpen] = useState(false);
  const { toast } = useToast();

  const addToOrder = (item: typeof MENU_ITEMS[0]) => {
    const existingItem = orderItems.find(i => i.id === item.id);
    if (existingItem) {
      setOrderItems(
        orderItems.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setOrderItems([...orderItems, { ...item, quantity: 1 }]);
    }
  };

  const removeFromOrder = (id: number) => {
    const existingItem = orderItems.find(i => i.id === id);
    if (existingItem && existingItem.quantity > 1) {
      setOrderItems(
        orderItems.map(i =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        )
      );
    } else {
      setOrderItems(orderItems.filter(i => i.id !== id));
    }
  };

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (orderItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Добавьте товары в заказ"
      });
      return;
    }

    toast({
      title: "Заказ оплачен",
      description: `Сумма: ${totalAmount} ₽`
    });
    setOrderItems([]);
  };

  const toggleShift = () => {
    if (shiftOpen) {
      toast({
        title: "Смена закрыта",
        description: "Итоги смены отправлены в отчет"
      });
    } else {
      toast({
        title: "Смена открыта",
        description: "Можно начинать работу"
      });
    }
    setShiftOpen(!shiftOpen);
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Касса</h1>
          <Button onClick={toggleShift} variant={shiftOpen ? "destructive" : "default"}>
            {shiftOpen ? "Закрыть смену" : "Открыть смену"}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-base">Товары</CardTitle>
              <CardDescription>Выберите товары для заказа</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {MENU_ITEMS.map(item => (
                  <Button
                    key={item.id}
                    variant="outline"
                    className="h-auto justify-start p-3 text-left"
                    onClick={() => addToOrder(item)}
                    disabled={!shiftOpen}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center">
                        {item.category === "coffee" ? (
                          <Coffee className="mr-2 h-4 w-4" />
                        ) : (
                          <ShoppingBag className="mr-2 h-4 w-4" />
                        )}
                        <span>{item.name}</span>
                      </div>
                      <span>{item.price} ₽</span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-base">Текущий заказ</CardTitle>
              <CardDescription>
                {orderItems.length === 0
                  ? "Заказ пуст"
                  : `${orderItems.reduce((sum, item) => sum + item.quantity, 0)} товаров в заказе`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {orderItems.length > 0 ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Товар</TableHead>
                        <TableHead className="text-right">Кол-во</TableHead>
                        <TableHead className="text-right">Цена</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full"
                                onClick={() => removeFromOrder(item.id)}
                              >
                                -
                              </Button>
                              <span>{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full"
                                onClick={() => addToOrder(item)}
                              >
                                +
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {item.price * item.quantity} ₽
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">Итого:</span>
                    <span className="text-lg font-bold">{totalAmount} ₽</span>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleCheckout}
                    disabled={!shiftOpen}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Оплатить
                  </Button>
                </div>
              ) : (
                <div className="flex h-[200px] flex-col items-center justify-center text-muted-foreground">
                  <ShoppingBag className="mb-2 h-12 w-12 opacity-20" />
                  <p>Добавьте товары в заказ</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default CashRegister;
