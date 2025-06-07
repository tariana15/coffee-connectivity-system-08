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
  updateShiftStatsAsync,
  Good,
  Sale,
  getCustomerByPhone,
  createOrGetCustomer,
  updateCustomerBonus,
  Customer
} from '@/services/dbService';

interface OrderItem extends Good {
  quantity: number;
}

export default function CashRegister() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Good[]>([]);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [currentShift, setCurrentShift] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bonusToUse, setBonusToUse] = useState(0);
  const [bonusEarned, setBonusEarned] = useState(0);

  useEffect(() => {
    loadProducts();
    checkShift();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProductsAsync();
      setProducts(data);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить товары",
        variant: "destructive",
      });
    }
  };

  const checkShift = async () => {
    try {
      const shift = await getCurrentShiftAsync();
      setCurrentShift(shift);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось проверить смену",
        variant: "destructive",
      });
    }
  };

  const handleOpenShift = async () => {
    try {
      setLoading(true);
      const shift = await openShiftAsync();
      setCurrentShift(shift);
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
    } finally {
      setLoading(false);
    }
  };

  const handleCloseShift = async () => {
    if (!currentShift) return;
    
    try {
      setLoading(true);
      // TODO: Implement closeShift functionality
      setCurrentShift(null);
      toast({
        title: "Смена закрыта",
        description: "Статистика сохранена",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось закрыть смену",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToOrder = (product: Good) => {
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

  const removeFromOrder = (productId: number) => {
    setOrder(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
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

  const handlePhoneChange = (phone: string) => {
    setCustomerPhone(phone);
    if (phone.length >= 10) {
      const found = getCustomerByPhone(phone);
      setCustomer(found || null);
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
      let client = customerPhone ? createOrGetCustomer(customerPhone) : null;
      const total = calculateTotal();
      const earned = Math.floor(total * 0.05);
      setBonusEarned(earned);
      if (client) updateCustomerBonus(client.phone, earned - bonusToUse);
      const sale: Omit<Sale, 'id' | 'created_at'> = {
        shift_id: currentShift.id,
        items: JSON.stringify(order.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        }))),
        total,
        payment_method: 'cash',
        status: 'completed',
        customer_phone: client ? client.phone : '',
        bonus_applied: bonusToUse,
        bonus_earned: earned
      };

      await addSaleAsync(sale);

      // Обновляем статистику смены
      const coffeeCount = order.filter(item => item.category === 'coffee').length;
      const foodCount = order.filter(item => item.category === 'food').length;
      
      await updateShiftStatsAsync(currentShift.id, {
        total_sales: currentShift.total_sales + total,
        transactions: currentShift.transactions + 1,
        coffee_count: currentShift.coffee_count + coffeeCount,
        food_count: currentShift.food_count + foodCount
      });

      setOrder([]);
      toast({
        title: "Успешно",
        description: "Заказ завершен",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось завершить заказ",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Управление сменой</CardTitle>
          </CardHeader>
          <CardContent>
            {currentShift ? (
              <div className="space-y-4">
                <p>Смена открыта: {new Date(currentShift.opened_at).toLocaleString()}</p>
                <p>Продажи: {currentShift.total_sales} ₽</p>
                <p>Транзакции: {currentShift.transactions}</p>
                <Button
                  onClick={handleCloseShift}
                  disabled={loading}
                  variant="destructive"
                >
                  Закрыть смену
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleOpenShift}
                disabled={loading}
              >
                Открыть смену
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Текущий заказ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p>{item.name}</p>
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
                <div className="mt-4">
                  <p className="text-lg font-bold">Итого: {calculateTotal()} ₽</p>
                  <Button
                    onClick={handleCompleteOrder}
                    disabled={loading}
                    className="mt-2"
                  >
                    Завершить заказ
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Товары</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map(product => (
              <Button
                key={product.id}
                variant="outline"
                onClick={() => addToOrder(product)}
                className="flex flex-col items-center p-4"
              >
                <span>{product.name}</span>
                <span className="text-sm text-gray-500">{product.price} ₽</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
