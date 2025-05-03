
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product, ProductIngredient } from "@/types/salary";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductCardProps {
  product: Product;
  costInfo?: {
    purchasePrice: number;
    ingredients: {
      name: string;
      cost: number;
    }[];
    totalCost: number;
  };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, costInfo }) => {
  const isMobile = useIsMobile();
  
  // Определяем цвет для значка категории
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "coffee":
        return "bg-green-100 text-green-800";
      case "nocoffee":
        return "bg-orange-100 text-orange-800";
      case "author":
        return "bg-purple-100 text-purple-800";
      case "lemonade":
        return "bg-yellow-100 text-yellow-800";
      case "dessert":
        return "bg-pink-100 text-pink-800";
      case "drinks":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Преобразуем имя категории в удобочитаемый формат
  const getCategoryName = (category: string) => {
    const categoryNames: Record<string, string> = {
      "coffee": "Кофе классический",
      "nocoffee": "Не кофе",
      "author": "Авторские напитки",
      "lemonade": "Лимонады",
      "dessert": "Десерты",
      "drinks": "Напитки",
      "extra": "Доп продукция"
    };
    
    return categoryNames[category] || category;
  };
  
  // Вычисляем маржу (прибыль)
  const calculateMargin = () => {
    if (!costInfo) return null;
    
    const margin = product.price - costInfo.totalCost;
    const marginPercent = (margin / product.price) * 100;
    
    return {
      amount: margin,
      percent: marginPercent
    };
  };
  
  const margin = calculateMargin();

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className={`${isMobile ? 'p-3 pb-2' : 'p-4'}`}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>{product.name}</CardTitle>
            <div className="flex flex-wrap gap-1 mt-1">
              <Badge className={`${getCategoryColor(product.category)} ${isMobile ? 'text-xs px-1 py-0' : ''}`}>
                {getCategoryName(product.category)}
              </Badge>
              <Badge variant="outline" className={isMobile ? 'text-xs px-1 py-0' : ''}>
                {product.price} ₽
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={`${isMobile ? 'p-3 pt-0' : 'p-4'} space-y-3`}>
        {product.ingredients && product.ingredients.length > 0 && (
          <div>
            <h3 className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'} mb-1`}>Ингредиенты:</h3>
            <ul className={`${isMobile ? 'text-xs' : 'text-sm'} list-disc pl-4`}>
              {product.ingredients.map((ingredient, index) => (
                <li key={index}>
                  {ingredient.name} {ingredient.amount > 0 && `(${ingredient.amount} ${ingredient.unit || 'шт.'})`}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {costInfo && (
          <div className="border-t pt-2 mt-2">
            <h3 className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'} mb-1`}>Себестоимость:</h3>
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-1' : 'grid-cols-2 gap-2'}`}>
              <div className={`${isMobile ? 'text-xs' : 'text-sm'} bg-gray-50 p-2 rounded`}>
                <span className="font-medium">Закупка:</span> {costInfo.purchasePrice.toFixed(2)} ₽
              </div>
              <div className={`${isMobile ? 'text-xs' : 'text-sm'} bg-gray-50 p-2 rounded`}>
                <span className="font-medium">Итого:</span> {costInfo.totalCost.toFixed(2)} ₽
              </div>
            </div>
            
            {margin && (
              <div className={`mt-2 ${isMobile ? 'text-xs' : 'text-sm'} bg-purple-50 p-2 rounded`}>
                <span className="font-medium">Маржа:</span> {margin.amount.toFixed(2)} ₽ ({margin.percent.toFixed(1)}%)
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
