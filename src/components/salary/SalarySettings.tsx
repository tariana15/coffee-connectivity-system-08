
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getSalaryConstants, saveSalarySettings } from "@/services/googleSheetsService";
import { SalaryConstants } from "@/types/salary";

const SalarySettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SalaryConstants>({
    baseRate: 2300,
    hourlyRate: 250,
    revenueThreshold: 7000,
    percentageBelow: 0.05,
    percentageAbove: 0.05
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.coffeeShopName) {
      const constants = getSalaryConstants(user.coffeeShopName);
      setSettings(constants);
    }
  }, [user?.coffeeShopName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.coffeeShopName) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      saveSalarySettings(user.coffeeShopName, settings);
      
      toast({
        title: "Настройки сохранены",
        description: "Параметры расчета заработной платы обновлены."
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof SalaryConstants, value: string) => {
    if (field === "percentageBelow" || field === "percentageAbove") {
      // Convert percentage from UI (e.g. 5) to decimal (0.05)
      const decimalValue = parseFloat(value) / 100;
      setSettings({
        ...settings,
        [field]: isNaN(decimalValue) ? 0 : decimalValue
      });
    } else {
      setSettings({
        ...settings,
        [field]: isNaN(parseFloat(value)) ? 0 : parseFloat(value)
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки расчета зарплаты</CardTitle>
        <CardDescription>
          Настройте параметры для расчета заработной платы сотрудников
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="baseRate">Ставка за полный день (₽)</Label>
            <Input
              id="baseRate"
              type="number"
              value={settings.baseRate}
              onChange={(e) => handleChange("baseRate", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Почасовая ставка (₽/час)</Label>
            <Input
              id="hourlyRate"
              type="number"
              value={settings.hourlyRate}
              onChange={(e) => handleChange("hourlyRate", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="revenueThreshold">Порог выручки для процента (₽)</Label>
            <Input
              id="revenueThreshold"
              type="number"
              value={settings.revenueThreshold}
              onChange={(e) => handleChange("revenueThreshold", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="percentageBelow">
              Процент от выручки свыше порога (%)
            </Label>
            <Input
              id="percentageBelow"
              type="number"
              value={settings.percentageBelow * 100}
              onChange={(e) => handleChange("percentageBelow", e.target.value)}
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Сохранение..." : "Сохранить настройки"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SalarySettings;
