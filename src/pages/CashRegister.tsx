
import React, { useEffect, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getProductsAsync,
  addSaleAsync,
  getCurrentShiftAsync,
  openShiftAsync,
  closeShiftAsync,
  updateShiftStatsAsync,
  Product,
  Sale,
  Shift,
  getCustomerByPhone,
  createOrGetCustomer,
  updateCustomerBonus,
  Customer,
  getSalesAsync,
  saveEmployeeSalary
} from '@/services/dbService';
import { useAuth } from '@/contexts/AuthContext';

interface OrderItem extends Product {
  quantity: number;
}

export default function CashRegister() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bonusToUse, setBonusToUse] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (currentShift) {
      loadSales();
    }
  }, [currentShift]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [productsData, shiftData] = await Promise.all([
        getProductsAsync(),
        getCurrentShiftAsync()
      ]);
      
      setProducts(productsData);
      setCurrentShift(shiftData);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные",
        variant: "destructive",
      });
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSales = async () => {
    if (!currentShift) return;
    
    try {
      const salesData = await getSalesAsync(currentShift.id);
      setSales(salesData);
    } catch (error) {
      console.error('Error loading sales:', error);
    }
  };

  const handleOpenShift = async () => {
    try {
      setLoading(true);
      const shift = await openShiftAsync();
      setCurrentShift(shift);
      setSales([]);
      toast({
        title: "Смена открыта",
        description: "Можно начинать работу",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось открыть смену",
        variant: "destructive",
      });
      console.error('Error opening shift:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseShift = async () => {
    if (!currentShift) return;
    
    try {
      setLoading(true);
      await closeShiftAsync(currentShift.id);
      
      // Сохраняем данные о зарплате для текущего пользователя
      if (user) {
        const today = new Date().toISOString().split('T')[0];
        const revenue = currentShift.total_sales;
        const hoursWorked = 8; // Стандартная смена
        
        // Простой расчет зарплаты: базовая ставка + процент от выручки
        const baseRate = 2000; // Базовая ставка за смену
        const percentageRate = 0.05; // 5% от выручки свыше 10000
        const threshold = 10000;
        
        let calculatedSalary = baseRate;
        if (revenue > threshold) {
          calculatedSalary += (revenue - threshold) * percentageRate;
        }
        
        await saveEmployeeSalary({
          employee_name: user.name || 'Unknown',
          work_date: today,
          revenue,
          hours_worked: hoursWorked,
          shift_type: hoursWorked >= 8 ? 'full' : 'half',
          calculated_salary: calculatedSalary
        });
      }

      setCurrentShift(null);
      setSales([]);
      toast({
        title: "Смена закрыта",
        description: "Статистика сохранена в базе данных",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось закрыть смену",
        variant: "destructive",
      });
      console.error('Error closing shift:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToOrder = (product: Product) => {
    setOrder(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromOrder = (productId: string) => {
    setOrder(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromOrder(productId);
      return;
    }
    setOrder(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const calculateTotal = () => {
    return order.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handlePhoneChange = async (phone: string) => {
    setCustomerPhone(phone);
    if (phone.length >= 10) {
      try {
        const found = await getCustomerByPhone(phone);
        setCustomer(found);
      } catch (error) {
        console.error('Error finding customer:', error);
      }
    }
  };

  const handleCompleteOrder = async () => {
    if (!currentShift) {
      toast({
        title: "Ошибка",
        description: "Смена не открыта",
        variant: "destructive",
      });
      return;
    }

    if (bonusToUse > (customer?.bonus_balance || 0)) {
      toast({
        title: "Ошибка",
        description: "Недостаточно бонусов для списания",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      let client = null;
      
      if (customerPhone) {
        client = await createOrGetCustomer(customerPhone);
      }
      
      const total = calculateTotal() - bonusToUse;
      const earned = Math.floor(calculateTotal() * 0.05);
      
      if (client) {
        await updateCustomerBonus(client.phone, earned - bonusToUse);
      }
      
      const sale: Omit<Sale, 'id' | 'created_at'> = {
        shift_id: currentShift.id,
        items: order.map(item => ({
          product_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          category: item.category
        })),
        total,
        payment_method: 'cash',
        status: 'completed',
        customer_phone: client?.phone,
        bonus_applied: bonusToUse,
        bonus_earned: earned
      };

      await addSaleAsync(sale);

      // Обновляем статистику смены
      const coffeeCount = order.filter(item => item.category === 'coffee').reduce((sum, item) => sum + item.quantity, 0);
      const foodCount = order.filter(item => item.category === 'food').reduce((sum, item) => sum + item.quantity, 0);
      
      const updatedShift = await updateShiftStatsAsync(currentShift.id, {
        total_sales: currentShift.total_sales + total,
        transactions: currentShift.transactions + 1,
        coffee_count: currentShift.coffee_count + coffeeCount,
        food_count: currentShift.food_count + foodCount
      });

      setCurrentShift(updatedShift);
      setOrder([]);
      setCustomerPhone('');
      setCustomer(null);
      setBonusToUse(0);
      
      // Перезагружаем продажи
      await loadSales();

      toast({
        title: "Успешно",
        description: "Заказ завершен и сохранен в базе данных",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось завершить заказ",
        variant: "destructive",
      });
      console.error('Error completing order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !products.length) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Управление сменой */}
      <Card>
        <CardHeader>
          <CardTitle>Управление сменой</CardTitle>
        </CardHeader>
        <CardContent>
          {currentShift ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Смена открыта:</p>
                  <p className="font-semibold">{new Date(currentShift.opened_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Выручка:</p>
                  <p className="font-semibold text-green-600">{currentShift.total_sales} ₽</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Транзакции:</p>
                  <p className="font-semibold">{currentShift.transactions}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Продано позиций:</p>
                  <p className="font-semibold">Кофе: {currentShift.coffee_count}, Еда: {currentShift.food_count}</p>
                </div>
              </div>
              <Button
                onClick={handleCloseShift}
                disabled={loading}
                variant="destructive"
                className="w-full"
              >
                Закрыть смену
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleOpenShift}
              disabled={loading}
              className="w-full"
            >
              Открыть смену
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Текущий заказ */}
        <Card>
          <CardHeader>
            <CardTitle>Текущий заказ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Бонусная система */}
              <div className="space-y-2">
                <Input
                  placeholder="Номер телефона клиента"
                  value={customerPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                />
                {customer && (
                  <div className="p-3 bg-green-50 rounded-md">
                    <p className="text-sm">Бонусов доступно: {customer.bonus_balance} ₽</p>
                    <Input
                      type="number"
                      placeholder="Использовать бонусы"
                      value={bonusToUse}
                      onChange={(e) => setBonusToUse(Number(e.target.value))}
                      max={customer.bonus_balance}
                      className="mt-2"
                    />
                  </div>
                )}
              </div>

              {/* Список товаров в заказе */}
              {order.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.price} ₽</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={e => updateQuantity(item.id, parseInt(e.target.value))}
                      className="w-20"
                      min="1"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFromOrder(item.id)}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
              ))}
              
              {order.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold mb-4">
                    <span>Итого:</span>
                    <span>{calculateTotal() - bonusToUse} ₽</span>
                  </div>
                  <Button
                    onClick={handleCompleteOrder}
                    disabled={loading || !currentShift}
                    className="w-full"
                  >
                    Завершить заказ
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* История продаж */}
        <Card>
          <CardHeader>
            <CardTitle>История продаж за смену</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sales.length > 0 ? (
                sales.map(sale => (
                  <div key={sale.id} className="p-3 border rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">
                          {new Date(sale.created_at).toLocaleTimeString()}
                        </p>
                        <div className="text-xs space-y-1">
                          {Array.isArray(sale.items) && sale.items.map((item: any, idx) => (
                            <div key={idx}>
                              {item.name} x{item.quantity}
                            </div>
                          ))}
                        </div>
                        {sale.customer_phone && (
                          <p className="text-xs text-blue-600">
                            Клиент: {sale.customer_phone}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{sale.total} ₽</p>
                        {sale.bonus_applied && (
                          <p className="text-xs text-green-600">
                            -{sale.bonus_applied}₽ бонусами
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">Нет продаж за текущую смену</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Товары */}
      <Card>
        <CardHeader>
          <CardTitle>Товары</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {products.map(product => (
              <Button
                key={product.id}
                variant="outline"
                onClick={() => addToOrder(product)}
                className="h-auto flex-col p-4"
                disabled={!currentShift}
              >
                <span className="font-medium text-center">{product.name}</span>
                <span className="text-sm text-gray-500">{product.price} ₽</span>
                <span className="text-xs text-gray-400">{product.category}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
