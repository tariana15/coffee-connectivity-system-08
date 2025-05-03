import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { updateProductsFromGoogleSheets } from "@/services/productService";

interface ImportProductsProps {
  onImportComplete?: () => void;
}

export const ImportProducts: React.FC<ImportProductsProps> = ({ onImportComplete }) => {
  const [sheetId, setSheetId] = useState("");
  const [range, setRange] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!sheetId || !range) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Заполните все поля"
      });
      return;
    }

    try {
      setLoading(true);
      await updateProductsFromGoogleSheets(sheetId, range);
      
      toast({
        title: "Успех",
        description: "Товары успешно импортированы"
      });
      
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      console.error("Ошибка при импорте товаров:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось импортировать товары"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">ID таблицы Google Sheets</label>
        <Input
          placeholder="Введите ID таблицы"
          value={sheetId}
          onChange={(e) => setSheetId(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Диапазон данных</label>
        <Input
          placeholder="Например: A1:E100"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        />
      </div>
      
      <Button
        onClick={handleImport}
        disabled={loading || !sheetId || !range}
        className="w-full"
      >
        {loading ? "Импорт..." : "Импортировать товары"}
      </Button>
    </div>
  );
}; 