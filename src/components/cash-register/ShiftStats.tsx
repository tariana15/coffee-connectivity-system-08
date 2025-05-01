
import React from 'react';
import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { Coffee, ShoppingBag, Clock, BanknoteIcon } from "lucide-react";
import { ShiftStats } from "@/types/inventory";

interface ShiftStatsProps {
  stats: ShiftStats;
}

const ShiftStatsDisplay = ({ stats }: ShiftStatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardDescription>Продано напитков</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center">
            <Coffee className="mr-2 h-5 w-5 text-muted-foreground" />
            <p className="text-2xl font-bold">{stats.coffeeCount}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardDescription>Продано еды</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5 text-muted-foreground" />
            <p className="text-2xl font-bold">{stats.foodCount}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardDescription>Выручка за смену</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center">
            <BanknoteIcon className="mr-2 h-5 w-5 text-muted-foreground" />
            <p className="text-2xl font-bold">{stats.totalSales} ₽</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardDescription>Кол-во транзакций</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
            <p className="text-2xl font-bold">{stats.transactions}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftStatsDisplay;
