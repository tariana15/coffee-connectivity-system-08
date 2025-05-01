
import React from 'react';
import { Button } from "@/components/ui/button";
import { Coffee, ShoppingBag } from "lucide-react";
import { OrderItem } from "@/types/inventory";

interface ProductListProps {
  items: {
    id: number;
    name: string;
    price: number;
    category: string;
  }[];
  onAddToOrder: (item: any) => void;
}

const ProductList = ({ items, onAddToOrder }: ProductListProps) => {
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
