
import React from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderItem } from "@/types/inventory";
import { BonusSystem } from "@/components/bonus/BonusSystem";
import { CreditCard, ShoppingBag } from "lucide-react";

interface OrderSummaryProps {
  orderItems: OrderItem[];
  totalAmount: number;
  rawTotalAmount: number;
  bonusApplied: number;
  onApplyBonus: (amount: number, phone: string) => void;
  onAddToOrder: (item: any) => void;
  onRemoveFromOrder: (id: number) => void;
  onCheckout: () => void;
}

const OrderSummary = ({
  orderItems,
  totalAmount,
  rawTotalAmount,
  bonusApplied,
  onApplyBonus,
  onAddToOrder,
  onRemoveFromOrder,
  onCheckout
}: OrderSummaryProps) => {
  return (
    <>
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
                        onClick={() => onRemoveFromOrder(item.id)}
                      >
                        -
                      </Button>
                      <span>{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={() => onAddToOrder(item)}
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
              onApplyBonus={onApplyBonus} 
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
            onClick={onCheckout}
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
    </>
  );
};

export default OrderSummary;
