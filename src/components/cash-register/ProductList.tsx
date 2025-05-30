
import React from 'react';
import { Button } from "@/components/ui/button";
import { Coffee, ShoppingBag, Loader2, AlertCircle, RefreshCcw } from "lucide-react";

interface ProductListProps {
  items: {
    id: number;
    name: string;
    price: number;
    category: string;
  }[];
  onAddToOrder: (item: any) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const ProductList = ({ items, onAddToOrder, isLoading = false, error = null, onRetry }: ProductListProps) => {
  if (isLoading) {
    return (
      <div className="col-span-2 flex h-40 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        <p>Загрузка товаров...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-2 flex flex-col h-40 items-center justify-center text-destructive">
        <AlertCircle className="mb-2 h-5 w-5" />
        <p className="text-center mb-4">Ошибка загрузки: {error}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Повторить загрузку
          </Button>
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="col-span-2 flex h-40 items-center justify-center text-muted-foreground">
        <p>Нет доступных товаров</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map(item => (
        <Button
          key={item.id}
          variant="outline"
          className="h-auto justify-start p-3 text-left"
          onClick={() => onAddToOrder(item)}
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
  );
};

export default ProductList;
