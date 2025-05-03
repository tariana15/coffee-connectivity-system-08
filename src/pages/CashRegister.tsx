import React, { useEffect, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProducts, addSale } from '@/services/supabaseService';
import { getCurrentShift, openShift, closeShift, updateShiftStats } from '@/services/supabaseService';
import { Product, Sale } from '@/lib/supabase';

interface OrderItem extends Product {
  quantity: number;
}

export default function CashRegister() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [currentShift, setCurrentShift] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
    checkShift();
    testSupabaseConnection();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
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
      const shift = await getCurrentShift();
      setCurrentShift(shift);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось проверить смену",
        variant: "destructive",
      });
    }
  };

  const testSupabaseConnection = async () => {
    try {
      const data = await getProducts();
      console.log('Подключение к Supabase успешно:', data);
      toast({
        title: "Подключение к Supabase",
        description: "Подключение успешно установлено",
      });
    } catch (error) {
      console.error('Ошибка подключения к Supabase:', error);
      toast({
        title: "Ошибка подключения к Supabase",
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
        variant: "destructive",
      });
    }
  };

  const handleOpenShift = async () => {
    try {
      setLoading(true);
      const shift = await openShift();
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
      await closeShift(currentShift.id);
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

  const handleCompleteOrder = async () => {
    if (!currentShift) {
      toast({
        title: "Ошибка",
        description: "Смена не открыта",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const sale: Omit<Sale, 'id' | 'created_at'> = {
        shift_id: currentShift.id,
        items: order.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total: calculateTotal(),
        payment_method: 'cash',
        status: 'completed'
      };

      await addSale(sale);

      // Обновляем статистику смены
      const coffeeCount = order.filter(item => item.category === 'coffee').length;
      const foodCount = order.filter(item => item.category === 'food').length;
      
      await updateShiftStats(currentShift.id, {
        total_sales: currentShift.total_sales + calculateTotal(),
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
