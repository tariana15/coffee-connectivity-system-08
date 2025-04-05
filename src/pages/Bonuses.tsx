
import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BadgePercent, Search } from "lucide-react";

interface CustomerBonus {
  phoneNumber: string;
  bonusAmount: number;
  registrationDate: string;
}

const Bonuses = () => {
  const [customers, setCustomers] = useState<CustomerBonus[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalBonuses, setTotalBonuses] = useState(0);
  
  useEffect(() => {
    // Load customers from localStorage
    const saved = localStorage.getItem('customerBonuses');
    const loadedCustomers = saved ? JSON.parse(saved) : [];
    setCustomers(loadedCustomers);
    
    // Calculate total bonuses
    const total = loadedCustomers.reduce((sum: number, customer: CustomerBonus) => sum + customer.bonusAmount, 0);
    setTotalBonuses(total);
  }, []);

  const filteredCustomers = customers.filter(customer => 
    customer.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date to dd.mm.yyyy
  const formatDate = (dateString: string) => {
    if (!dateString) return "Н/Д";
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Бонусная программа</h1>
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
            <BadgePercent className="h-4 w-4" />
            <span>{totalBonuses} ₽</span>
          </Badge>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Клиенты с бонусами</CardTitle>
            <CardDescription>
              Всего клиентов: {customers.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Поиск по номеру телефона..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              {filteredCustomers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Телефон</TableHead>
                      <TableHead>Дата регистрации</TableHead>
                      <TableHead className="text-right">Бонусы</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer, index) => (
                      <TableRow key={index}>
                        <TableCell>{customer.phoneNumber}</TableCell>
                        <TableCell>{formatDate(customer.registrationDate)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {customer.bonusAmount} ₽
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
                  <BadgePercent className="mb-2 h-10 w-10 opacity-20" />
                  {searchQuery ? (
                    <p>Клиенты не найдены</p>
                  ) : (
                    <p>Нет зарегистрированных клиентов</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Bonuses;
