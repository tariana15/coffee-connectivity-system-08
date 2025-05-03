import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Loader2 } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { Product, ProductCategory } from "@/types/salary";
import { getAllProducts, productCategories } from "@/services/productService";
import { useIsMobile } from "@/hooks/use-mobile";
import { ImportProducts } from "@/components/import/ImportProducts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Импорт данных о накладных для расчета себестоимости
import invoiceData from "../../techcard/Nacladnay.json";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  // Мок-данные о себестоимости (в реальном приложении это должно прийти из базы данных)
  const [costData, setCostData] = useState<Record<string, {
    purchasePrice: number;
    ingredients: { name: string; cost: number }[];
    totalCost: number;
  }>>({});

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const allProducts = getAllProducts();
        setProducts(allProducts);
        
        // Генерируем данные о себестоимости на основе накладных
        const costDataMap: Record<string, any> = {};
        
        allProducts.forEach(product => {
          // Базовая закупочная цена (имитация данных из накладных)
          const baseIngredientCost = product.category === "coffee" ? 25 : 
                                    product.category === "author" ? 35 :
                                    product.category === "lemonade" ? 20 : 15;
          
          // Подсчет себестоимости на основе ингредиентов
          let ingredientsCost: { name: string; cost: number }[] = [];
          let totalCost = 0;
          
          if (product.ingredients && product.ingredients.length > 0) {
            ingredientsCost = product.ingredients.map(ingredient => {
              // Ищем ингредиент в накладных по имени (упрощенная логика)
              const matchCategory = 
                ingredient.name.toLowerCase().includes("молоко") ? "Молоко и сливки" :
                ingredient.name.toLowerCase().includes("стакан") ? "Стаканы" :
                ingredient.name.toLowerCase().includes("выпечка") ? "Выпечка" : 
                "Другое";
              
              // Находим средние расходы по категории
              const categoryInvoices = invoiceData.filter((inv: any) => 
                inv["Категория"] === matchCategory
              );
              
              const avgCost = categoryInvoices.length > 0 
                ? categoryInvoices.reduce((acc: number, inv: any) => {
                    return acc + parseFloat(inv["Сумма"].replace(/[^\d,.]/g, '').replace(',', '.'));
                  }, 0) / categoryInvoices.length / 100 // Делим на 100 для получения цены за единицу
                : baseIngredientCost / 5; // Если данных нет, используем базовую цену
              
              // Цена ингредиента в зависимости от количества
              const cost = avgCost * (ingredient.amount || 1);
              totalCost += cost;
              
              return {
                name: ingredient.name,
                cost
              };
            });
          } else {
            // Если ингредиентов нет, используем базовую стоимость товара
            totalCost = product.price * 0.4; // 40% от цены продажи как пример
          }
          
          // Добавляем стоимость тары и прочие расходы
          const packagingCost = product.category === "coffee" || 
                              product.category === "tea" || 
                              product.category === "lemonade" ? 10 : 5;
          
          totalCost += packagingCost;
          
          costDataMap[product.id] = {
            purchasePrice: totalCost * 0.7, // 70% общей себестоимости - закупочная цена
            ingredients: ingredientsCost,
            totalCost: totalCost
          };
        });
        
        setCostData(costDataMap);
        setFilteredProducts(allProducts);
      } catch (error) {
        console.error("Ошибка при загрузке продуктов:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Фильтрация продуктов по категории и поисковому запросу
  useEffect(() => {
    let filtered = products;
    
    // Фильтруем по категории если выбрана конкретная категория
    if (activeCategory !== "all") {
      filtered = filtered.filter(product => product.category === activeCategory);
    }
    
    // Фильтруем по поисковому запросу
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query)
      );
    }
    
    setFilteredProducts(filtered);
  }, [activeCategory, searchQuery, products]);

  const handleImportComplete = () => {
    // Перезагружаем товары после импорта
    const allProducts = getAllProducts();
    setProducts(allProducts);
    setFilteredProducts(allProducts);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-2">
        <div className="flex justify-between items-center mb-4">
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>Товары</h1>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>Импорт товаров</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Импорт товаров из Google Sheets</DialogTitle>
              </DialogHeader>
              <ImportProducts onImportComplete={handleImportComplete} />
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Поле поиска */}
        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск товара..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Табы с категориями */}
        <Tabs 
          value={activeCategory} 
          onValueChange={setActiveCategory} 
          className="mb-4"
        >
          <TabsList className={`${isMobile ? 'flex flex-wrap gap-1' : 'grid'} grid-cols-4 w-full mb-2 overflow-x-auto`}>
            <TabsTrigger 
              value="all" 
              className={`whitespace-nowrap ${isMobile ? 'text-xs px-2' : ''}`}
            >
              Все товары
            </TabsTrigger>
            
            {productCategories.slice(0, 3).map(category => (
              <TabsTrigger 
                key={category.id} 
                value={category.id} 
                className={`whitespace-nowrap ${isMobile ? 'text-xs px-2' : ''}`}
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {isMobile && (
            <TabsList className="flex flex-wrap gap-1 w-full mb-2 overflow-x-auto">
              {productCategories.slice(3).map(category => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id} 
                  className="whitespace-nowrap text-xs px-2"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          )}
          
          {!isMobile && (
            <TabsList className="grid grid-cols-4 w-full mb-2">
              {productCategories.slice(3).map(category => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="whitespace-nowrap"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          )}
          
          {/* Содержимое для вкладки "Все" */}
          <TabsContent value="all" className="mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  costInfo={costData[product.id]}
                />
              ))}
            </div>
          </TabsContent>
          
          {/* Динамически создаем содержимое для всех категорий */}
          {productCategories.map(category => (
            <TabsContent key={category.id} value={category.id} className="mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    costInfo={costData[product.id]}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Products;
