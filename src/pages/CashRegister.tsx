
import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Coffee, CreditCard, ShoppingBag, Clock, BanknoteIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BonusSystem } from "@/components/bonus/BonusSystem";

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
  category: string;
}

interface SaleRecord {
  id: string;
  items: OrderItem[];
  total: number;
  timestamp: Date;
  bonusApplied?: number;
  customerPhone?: string;
  bonusEarned?: number;
}

const CashRegister = () => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [shiftOpen, setShiftOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("order");
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [shiftStats, setShiftStats] = useState({
    coffeeCount: 0,
    foodCount: 0,
    totalSales: 0,
    transactions: 0
  });
  const [bonusApplied, setBonusApplied] = useState(0);
  const [customerPhone, setCustomerPhone] = useState("");
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

  const rawTotalAmount = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  // Final total amount after applying bonuses
  const totalAmount = Math.max(0, rawTotalAmount - bonusApplied);

  const handleApplyBonus = (amount: number, phone: string) => {
    setBonusApplied(amount);
    setCustomerPhone(phone);
  };

  const handleCheckout = () => {
    if (orderItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Добавьте товары в заказ"
      });
      return;
    }

    // Default bonus percentage
    const bonusPercent = 5;
    const bonusEarned = customerPhone ? Math.floor(rawTotalAmount * bonusPercent / 100) : 0;

    // Create a sale record
    const saleRecord: SaleRecord = {
      id: `sale-${Date.now()}`,
      items: [...orderItems],
      total: totalAmount,
      timestamp: new Date(),
      bonusApplied: bonusApplied > 0 ? bonusApplied : undefined,
      customerPhone: customerPhone || undefined,
      bonusEarned: bonusEarned > 0 ? bonusEarned : undefined
    };

    // Update sales records
    setSales(prevSales => [...prevSales, saleRecord]);

    // Update shift statistics
    const coffeeSold = orderItems.filter(item => item.category === "coffee").reduce((sum, item) => sum + item.quantity, 0);
    const foodSold = orderItems.filter(item => item.category === "food").reduce((sum, item) => sum + item.quantity, 0);
    
    setShiftStats(prev => ({
      coffeeCount: prev.coffeeCount + coffeeSold,
      foodCount: prev.foodCount + foodSold,
      totalSales: prev.totalSales + totalAmount,
      transactions: prev.transactions + 1
    }));

    // Display appropriate message
    let description = `Сумма: ${totalAmount} ₽`;
    if (bonusApplied > 0) {
      description += `, бонусы: -${bonusApplied} ₽`;
    }
    if (bonusEarned > 0) {
      description += `, начислено: ${bonusEarned} ₽`;
    }

    toast({
      title: "Заказ оплачен",
      description
    });

    // Reset order
    setOrderItems([]);
    setBonusApplied(0);
    setCustomerPhone("");
  };

  const toggleShift = () => {
    if (shiftOpen) {
      toast({
        title: "Смена закрыта",
        description: `Итоги смены: ${shiftStats.totalSales} ₽, ${shiftStats.transactions} транзакций`
      });
      
      // Reset shift data when closing
      setSales([]);
      setShiftStats({
        coffeeCount: 0,
        foodCount: 0,
        totalSales: 0,
        transactions: 0
      });
    } else {
      toast({
        title: "Смена открыта",
        description: "Можно начинать работу"
      });
    }
    setShiftOpen(!shiftOpen);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
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

        {shiftOpen && (
          <Tabs defaultValue="order" value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="order">Текущий заказ</TabsTrigger>
              <TabsTrigger value="sales">Продажи</TabsTrigger>
              <TabsTrigger value="stats">Статистика</TabsTrigger>
            </TabsList>
            
            <TabsContent value="order">
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
                        
                        {orderItems.length > 0 && (
                          <BonusSystem 
                            orderAmount={rawTotalAmount} 
                            onApplyBonus={handleApplyBonus} 
                          />
                        )}
                        
                        <div className="space-y-2 pt-2">
                          {bonusApplied > 0 && (
                            <div className="flex items-center justify-between text-sm">
                              <span>Сумма заказа:</span>
                              <span>{rawTotalAmount} ₽</span>
                            </div>
                          )}
                          
                          {bonusApplied > 0 && (
                            <div className="flex items-center justify-between text-sm text-green-600">
                              <span>Бонусы:</span>
                              <span>-{bonusApplied} ₽</span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-medium">Итого:</span>
                            <span className="text-lg font-bold">{totalAmount} ₽</span>
                          </div>
                        </div>
                        
                        <Button
                          className="w-full"
                          onClick={handleCheckout}
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
            </TabsContent>
            
            <TabsContent value="sales">
              <Card>
                <CardHeader>
                  <CardTitle>История продаж за смену</CardTitle>
                  <CardDescription>Все продажи с момента открытия смены</CardDescription>
                </CardHeader>
                <CardContent>
                  {sales.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Время</TableHead>
                          <TableHead>Товары</TableHead>
                          <TableHead className="text-right">Сумма</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sales.map(sale => (
                          <TableRow key={sale.id}>
                            <TableCell>{formatTime(sale.timestamp)}</TableCell>
                            <TableCell>
                              <div className="flex flex-col space-y-1">
                                {sale.items.map((item, idx) => (
                                  <div key={idx} className="text-sm">
                                    {item.name} x{item.quantity}
                                  </div>
                                ))}
                                {sale.customerPhone && (
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    <Badge variant="outline" className="text-xs">
                                      Бонусная карта
                                    </Badge>
                                    {sale.bonusApplied ? (
                                      <Badge variant="outline" className="bg-green-50 text-xs text-green-700">
                                        -{sale.bonusApplied}₽ бонусами
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="bg-blue-50 text-xs text-blue-700">
                                        +{sale.bonusEarned}₽ бонусов
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {sale.total} ₽
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex h-40 items-center justify-center text-muted-foreground">
                      <p>Нет продаж за текущую смену</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="stats">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardDescription>Продано напитков</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center">
                      <Coffee className="mr-2 h-5 w-5 text-muted-foreground" />
                      <p className="text-2xl font-bold">{shiftStats.coffeeCount}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardDescription>Продано еды</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center">
                      <ShoppingBag className="mr-2 h-5 w-5 text-muted-foreground" />
                      <p className="text-2xl font-bold">{shiftStats.foodCount}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardDescription>Выручка за смену</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center">
                      <BanknoteIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                      <p className="text-2xl font-bold">{shiftStats.totalSales} ₽</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardDescription>Кол-во транзакций</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                      <p className="text-2xl font-bold">{shiftStats.transactions}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
        
        {!shiftOpen && (
          <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
            <Clock className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-semibold">Смена закрыта</h3>
            <p className="mb-4 text-muted-foreground">
              Откройте смену, чтобы начать работу с кассой
            </p>
            <Button onClick={toggleShift}>Открыть смену</Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CashRegister;
