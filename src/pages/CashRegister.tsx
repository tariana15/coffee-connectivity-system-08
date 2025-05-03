
import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coffee, CreditCard, ShoppingBag, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { deductIngredientsForSale } from "@/services/inventoryService";
import { getRecipeByProductId } from "@/services/recipeService";
import { OrderItem, SaleRecord, ShiftStats, Recipe } from "@/types/inventory";
import { useNotifications } from "@/contexts/NotificationContext";
import { getMenuItems } from "@/services/menuItems";
import ProductList from "@/components/cash-register/ProductList";
import OrderSummary from "@/components/cash-register/OrderSummary";
import SalesHistory from "@/components/cash-register/SalesHistory";
import ShiftStatsDisplay from "@/components/cash-register/ShiftStats";
import { sendReceiptToFiscal, checkFiscalServiceConnection } from "@/services/fiscalService";
import { supabase } from "@/services/supabaseClient";

const CashRegister = () => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [shiftOpen, setShiftOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("order");
  const [sales, setSales] = useState<SaleRecord[]>([]);
  // Reset all stats to zero
  const [shiftStats, setShiftStats] = useState<ShiftStats>({
    coffeeCount: 0,
    foodCount: 0,
    totalSales: 0,
    transactions: 0
  });
  const [bonusApplied, setBonusApplied] = useState(0);
  const [customerPhone, setCustomerPhone] = useState("");
  const [fiscalConnected, setFiscalConnected] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [shiftId, setShiftId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  // Load menu items and check fiscal connection
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      
      // Check if there's an open shift in the database
      const { data: shiftData } = await supabase
        .from('shifts')
        .select('*')
        .eq('is_open', true)
        .maybeSingle();
      
      if (shiftData) {
        setShiftOpen(true);
        setShiftId(shiftData.id);
        
        // Load sales for this shift
        const { data: salesData } = await supabase
          .from('sales')
          .select('*')
          .eq('shift_id', shiftData.id)
          .order('timestamp', { ascending: false });
        
        if (salesData) {
          setSales(salesData.map((sale: any) => ({
            ...sale,
            timestamp: new Date(sale.timestamp),
            items: JSON.parse(sale.items_json || '[]')
          })));
          
          // Calculate shift stats from sales
          calculateShiftStats(salesData);
        }
      }
      
      // Load menu items
      try {
        const items = await getMenuItems();
        setMenuItems(items);
      } catch (error) {
        console.error('Error loading menu items:', error);
        toast({
          variant: "destructive",
          title: "Ошибка загрузки меню",
          description: "Не удалось загрузить товары"
        });
      }
      
      // Check fiscal connection
      try {
        const connected = await checkFiscalServiceConnection();
        setFiscalConnected(connected);
        
        if (connected) {
          toast({
            title: "Подключено к ЭВОТОР",
            description: "ККТ готова к работе"
          });
        } else {
          toast({
            variant: "destructive",
            title: "Ошибка подключения к ЭВОТОР",
            description: "Проверьте настройки фискального регистратора"
          });
        }
      } catch (error) {
        console.error('Error checking fiscal connection:', error);
      }
      
      setLoading(false);
    };
    
    initialize();
  }, [toast]);

  // Calculate shift stats from sales data
  const calculateShiftStats = (salesData: any[]) => {
    const stats = salesData.reduce((acc: ShiftStats, sale: any) => {
      const items = JSON.parse(sale.items_json || '[]');
      const coffeeSold = items.filter((item: any) => item.category === "coffee").reduce((sum: number, item: any) => sum + item.quantity, 0);
      const foodSold = items.filter((item: any) => item.category === "food").reduce((sum: number, item: any) => sum + item.quantity, 0);
      
      return {
        coffeeCount: acc.coffeeCount + coffeeSold,
        foodCount: acc.foodCount + foodSold,
        totalSales: acc.totalSales + sale.total,
        transactions: acc.transactions + 1
      };
    }, {
      coffeeCount: 0,
      foodCount: 0,
      totalSales: 0,
      transactions: 0
    });
    
    setShiftStats(stats);
  };

  const addToOrder = (item: typeof menuItems[0]) => {
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

  // Updated handleCheckout to only register sales when the transaction is completed
  const handleCheckout = async () => {
    if (orderItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Добавьте товары в заказ"
      });
      return;
    }

    if (!shiftId) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Смена не открыта"
      });
      return;
    }

    // Default bonus percentage
    const bonusPercent = 5;
    const bonusEarned = customerPhone ? Math.floor(rawTotalAmount * bonusPercent / 100) : 0;

    // Готовим данные для списания ингредиентов
    const recipes: Recipe[] = [];
    const quantities: number[] = [];
    
    // Собираем рецепты для всех товаров в заказе
    for (const item of orderItems) {
      try {
        const recipe = await getRecipeByProductId(item.id);
        if (recipe) {
          recipes.push(recipe);
          quantities.push(item.quantity);
        }
      } catch (error) {
        console.error(`Error getting recipe for product ${item.id}:`, error);
      }
    }
    
    // Выполняем списание ингредиентов
    try {
      const { success, updatedItems, messages } = await deductIngredientsForSale(
        recipes,
        quantities,
        addNotification
      );
      
      if (!success) {
        toast({
          variant: "destructive",
          title: "Ошибка при списании ингредиентов",
          description: "Не удалось обновить данные об остатках"
        });
        return;
      }
      
      // Если есть сообщения о низком запасе, выводим их в консоль
      if (messages.length > 0) {
        console.log("Inventory notifications:", messages);
      }
    } catch (error) {
      console.error("Error deducting ingredients:", error);
    }

    // Отправляем данные в фискальную службу
    const fiscalResult = fiscalConnected ? 
      await sendReceiptToFiscal(orderItems, totalAmount) : 
      { success: false };

    // Create a sale record - only when the transaction is completed
    const saleRecord: SaleRecord = {
      id: `sale-${Date.now()}`,
      items: [...orderItems],
      total: totalAmount,
      timestamp: new Date(),
      bonusApplied: bonusApplied > 0 ? bonusApplied : undefined,
      customerPhone: customerPhone || undefined,
      bonusEarned: bonusEarned > 0 ? bonusEarned : undefined,
      inventoryUpdated: true,
      fiscalData: fiscalResult.success ? fiscalResult.fiscalData : undefined
    };

    // Store sale in Supabase
    try {
      const { data, error } = await supabase
        .from('sales')
        .insert([
          {
            shift_id: shiftId,
            items_json: JSON.stringify(orderItems),
            total: totalAmount,
            timestamp: new Date().toISOString(),
            bonus_applied: bonusApplied > 0 ? bonusApplied : null,
            customer_phone: customerPhone || null,
            bonus_earned: bonusEarned > 0 ? bonusEarned : null,
            inventory_updated: true,
            fiscal_data: fiscalResult.success ? JSON.stringify(fiscalResult.fiscalData) : null
          }
        ])
        .select();
        
      if (error) {
        console.error('Error storing sale in database:', error);
      }
    } catch (error) {
      console.error('Error storing sale in database:', error);
    }

    // Update sales records - only when the transaction is completed
    setSales(prevSales => [saleRecord, ...prevSales]);

    // Update shift statistics - only when the transaction is completed
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
    if (fiscalResult.success) {
      description += ", фискализировано ✓";
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

  const toggleShift = async () => {
    if (shiftOpen) {
      // Close the shift
      if (shiftId) {
        try {
          const { error } = await supabase
            .from('shifts')
            .update({ is_open: false, closed_at: new Date().toISOString() })
            .eq('id', shiftId);
            
          if (error) {
            console.error('Error closing shift:', error);
            toast({
              variant: "destructive",
              title: "Ошибка закрытия смены",
              description: "Не удалось обновить данные в базе"
            });
            return;
          }
        } catch (error) {
          console.error('Error closing shift:', error);
          return;
        }
      }
      
      toast({
        title: "Смена закрыта",
        description: `Итоги смены: ${shiftStats.totalSales} ₽, ${shiftStats.transactions} транзакций`
      });
      
      // Reset shift data when closing
      setSales([]);
      setShiftId(null);
      setShiftStats({
        coffeeCount: 0,
        foodCount: 0,
        totalSales: 0,
        transactions: 0
      });
    } else {
      // Open a new shift
      try {
        const { data, error } = await supabase
          .from('shifts')
          .insert([{ opened_at: new Date().toISOString(), is_open: true }])
          .select();
          
        if (error) {
          console.error('Error opening shift:', error);
          toast({
            variant: "destructive",
            title: "Ошибка открытия смены",
            description: "Не удалось создать новую смену в базе"
          });
          return;
        }
        
        if (data && data[0]) {
          setShiftId(data[0].id);
        }
      } catch (error) {
        console.error('Error opening shift:', error);
        return;
      }
      
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
          <div className="flex gap-2 items-center">
            {fiscalConnected && (
              <Badge variant="outline" className="bg-green-50 text-xs text-green-700">
                ЭВОТОР подключен
              </Badge>
            )}
            <Button onClick={toggleShift} variant={shiftOpen ? "destructive" : "default"} disabled={loading}>
              {shiftOpen ? "Закрыть смену" : "Открыть смену"}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-[400px] flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">Загрузка данных...</p>
          </div>
        ) : shiftOpen ? (
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
                    <ProductList items={menuItems} onAddToOrder={addToOrder} />
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
                    <OrderSummary 
                      orderItems={orderItems}
                      totalAmount={totalAmount}
                      rawTotalAmount={rawTotalAmount}
                      bonusApplied={bonusApplied}
                      onApplyBonus={handleApplyBonus}
                      onAddToOrder={addToOrder}
                      onRemoveFromOrder={removeFromOrder}
                      onCheckout={handleCheckout}
                    />
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
                  <SalesHistory sales={sales} formatTime={formatTime} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="stats">
              <ShiftStatsDisplay stats={shiftStats} />
            </TabsContent>
          </Tabs>
        ) : (
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
