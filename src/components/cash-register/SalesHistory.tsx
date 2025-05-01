
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SaleRecord } from "@/types/inventory";

interface SalesHistoryProps {
  sales: SaleRecord[];
  formatTime: (date: Date) => string;
}

const SalesHistory = ({ sales, formatTime }: SalesHistoryProps) => {
  return (
    <>
      {sales.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Время</TableHead>
              <TableHead>Товары</TableHead>
              <TableHead className="text-right">Сумма</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map(sale => (
              <TableRow key={sale.id}>
                <TableCell>{formatTime(sale.timestamp)}</TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    {sale.items.map((item, idx) => (
                      <div key={idx} className="text-sm">
                        {item.name} x{item.quantity}
                      </div>
                    ))}
                    {sale.customerPhone && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          Бонусная карта
                        </Badge>
                        {sale.bonusApplied ? (
                          <Badge variant="outline" className="bg-green-50 text-xs text-green-700">
                            -{sale.bonusApplied}₽ бонусами
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-50 text-xs text-blue-700">
                            +{sale.bonusEarned}₽ бонусов
                          </Badge>
                        )}
                      </div>
                    )}
                    {sale.inventoryUpdated && (
                      <Badge variant="outline" className="bg-purple-50 text-xs text-purple-700 w-fit">
                        Ингредиенты списаны
                      </Badge>
                    )}
                    {sale.fiscalData && (
                      <Badge variant="outline" className="bg-blue-50 text-xs text-blue-700 w-fit">
                        Фискализировано
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {sale.total} ₽
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          <p>Нет продаж за текущую смену</p>
        </div>
      )}
    </>
  );
};

export default SalesHistory;
