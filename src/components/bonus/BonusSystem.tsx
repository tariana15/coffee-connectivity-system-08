
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BadgePercent, Wallet } from "lucide-react";

interface BonusSystemProps {
  orderAmount: number;
  onApplyBonus: (amount: number, phoneNumber: string) => void;
}

interface CustomerBonus {
  phoneNumber: string;
  bonusAmount: number;
  registrationDate: string;
}

export const BonusSystem: React.FC<BonusSystemProps> = ({ orderAmount, onApplyBonus }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isRegisteringNew, setIsRegisteringNew] = useState(false);
  const [bonusPercent] = useState(5); // Default bonus percentage
  const { toast } = useToast();
  
  // In a real app, this would come from a database
  const [customerBonuses, setCustomerBonuses] = useState<CustomerBonus[]>(() => {
    const saved = localStorage.getItem('customerBonuses');
    return saved ? JSON.parse(saved) : [];
  });

  const formatPhoneNumber = (input: string): string => {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, '');
    
    // Format as +7 (XXX) XXX-XX-XX for Russian numbers
    if (digits.length <= 1) return digits;
    if (digits.length <= 4) return `+7 (${digits.substring(1)}`;
    if (digits.length <= 7) return `+7 (${digits.substring(1, 4)}) ${digits.substring(4)}`;
    if (digits.length <= 9) return `+7 (${digits.substring(1, 4)}) ${digits.substring(4, 7)}-${digits.substring(7)}`;
    return `+7 (${digits.substring(1, 4)}) ${digits.substring(4, 7)}-${digits.substring(7, 9)}-${digits.substring(9, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatPhoneNumber(e.target.value));
  };

  const findCustomerBonus = (phone: string): CustomerBonus | undefined => {
    return customerBonuses.find(customer => customer.phoneNumber === phone);
  };

  const registerBonus = () => {
    if (phoneNumber.length < 18) { // +7 (XXX) XXX-XX-XX = 18 chars
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Введите полный номер телефона"
      });
      return;
    }

    const earnedBonus = Math.floor(orderAmount * bonusPercent / 100);
    const existingCustomer = findCustomerBonus(phoneNumber);

    if (existingCustomer) {
      // Update existing customer's bonus
      const updatedBonuses = customerBonuses.map(customer => 
        customer.phoneNumber === phoneNumber 
          ? { ...customer, bonusAmount: customer.bonusAmount + earnedBonus } 
          : customer
      );
      setCustomerBonuses(updatedBonuses);
      localStorage.setItem('customerBonuses', JSON.stringify(updatedBonuses));
      
      toast({
        title: "Бонусы начислены",
        description: `${earnedBonus} бонусных рублей добавлено на счет ${phoneNumber}`
      });
    } else {
      // Register new customer with 50 initial bonus points + earned bonus
      const initialBonus = 50;
      const newCustomer = { 
        phoneNumber, 
        bonusAmount: initialBonus + earnedBonus,
        registrationDate: new Date().toISOString()
      };
      const updatedBonuses = [...customerBonuses, newCustomer];
      setCustomerBonuses(updatedBonuses);
      localStorage.setItem('customerBonuses', JSON.stringify(updatedBonuses));
      
      toast({
        title: "Новый клиент добавлен",
        description: `${initialBonus + earnedBonus} бонусных рублей начислено (50₽ приветственный бонус + ${earnedBonus}₽ за покупку)`
      });
    }

    setIsRegisteringNew(false);
    setPhoneNumber("");
  };

  const applyBonus = () => {
    const customer = findCustomerBonus(phoneNumber);
    if (!customer) {
      toast({
        variant: "destructive",
        title: "Клиент не найден",
        description: "Этот номер не зарегистрирован в системе бонусов"
      });
      return;
    }

    if (customer.bonusAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Нет бонусов",
        description: "У клиента нет доступных бонусов"
      });
      return;
    }

    // Calculate how much bonus can be applied (up to order amount)
    const applicableBonus = Math.min(customer.bonusAmount, orderAmount);
    
    // Update customer's bonus balance
    const updatedBonuses = customerBonuses.map(c => 
      c.phoneNumber === phoneNumber 
        ? { ...c, bonusAmount: c.bonusAmount - applicableBonus } 
        : c
    );
    setCustomerBonuses(updatedBonuses);
    localStorage.setItem('customerBonuses', JSON.stringify(updatedBonuses));
    
    // Call the parent component's callback to apply the bonus
    onApplyBonus(applicableBonus, phoneNumber);
    setPhoneNumber("");
    
    toast({
      title: "Бонусы применены",
      description: `${applicableBonus} бонусных рублей использовано`
    });
  };

  const checkBonus = () => {
    const customer = findCustomerBonus(phoneNumber);
    if (!customer) {
      toast({
        variant: "destructive",
        title: "Клиент не найден",
        description: "Этот номер не зарегистрирован в системе бонусов"
      });
      return;
    }

    toast({
      title: "Доступные бонусы",
      description: `${customer.bonusAmount} бонусных рублей на счету`
    });
  };

  return (
    <div className="space-y-4 border p-4 rounded-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <BadgePercent className="mr-2 h-5 w-5 text-primary" />
          <h3 className="font-medium">Бонусная система</h3>
        </div>
        {!isRegisteringNew && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsRegisteringNew(true)}
          >
            Начислить бонусы
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="phone-number">Номер телефона клиента</Label>
          <Input
            id="phone-number"
            placeholder="+7 (___) ___-__-__"
            value={phoneNumber}
            onChange={handlePhoneChange}
          />
        </div>

        <div className="flex gap-2">
          {isRegisteringNew ? (
            <>
              <Button 
                className="flex-1" 
                onClick={registerBonus}
              >
                Начислить {Math.floor(orderAmount * bonusPercent / 100)} ₽
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsRegisteringNew(false);
                  setPhoneNumber("");
                }}
              >
                Отмена
              </Button>
            </>
          ) : (
            <>
              <Button 
                className="flex-1" 
                variant="outline" 
                onClick={checkBonus}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Проверить
              </Button>
              <Button 
                className="flex-1" 
                onClick={applyBonus}
              >
                Применить
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
