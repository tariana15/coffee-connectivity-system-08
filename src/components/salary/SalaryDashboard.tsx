
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getEmployeeSalaries } from '@/services/dbService';

interface SalaryRecord {
  id: string;
  employee_name: string;
  work_date: string;
  revenue: number;
  hours_worked: number;
  shift_type: 'full' | 'half';
  calculated_salary: number;
  created_at: string;
}

const SalaryDashboard = () => {
  const { toast } = useToast();
  const [salaryData, setSalaryData] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadSalaryData();
  }, [selectedMonth, selectedYear]);

  const loadSalaryData = async () => {
    try {
      setLoading(true);
      const data = await getEmployeeSalaries(
        selectedMonth.toString(),
        selectedYear.toString()
      );
      setSalaryData(data);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные о зарплате",
        variant: "destructive",
      });
      console.error('Error loading salary data:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedByEmployee = salaryData.reduce((acc, record) => {
    if (!acc[record.employee_name]) {
      acc[record.employee_name] = [];
    }
    acc[record.employee_name].push(record);
    return acc;
  }, {} as Record<string, SalaryRecord[]>);

  const calculateEmployeeTotal = (records: SalaryRecord[]) => {
    return records.reduce((sum, record) => sum + record.calculated_salary, 0);
  };

  const calculateEmployeeShifts = (records: SalaryRecord[]) => {
    return records.length;
  };

  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="border rounded px-3 py-2"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="border rounded px-3 py-2"
            >
              {[2023, 2024, 2025].map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <Button onClick={loadSalaryData} disabled={loading}>
              {loading ? 'Загрузка...' : 'Обновить'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Зарплаты сотрудников за {months[selectedMonth - 1]} {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedByEmployee).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedByEmployee).map(([employeeName, records]) => (
                <div key={employeeName} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{employeeName}</h3>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Смен: {calculateEmployeeShifts(records)}
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        Итого: {calculateEmployeeTotal(records).toLocaleString()} ₽
                      </p>
                    </div>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Дата</TableHead>
                        <TableHead>Выручка за день</TableHead>
                        <TableHead>Часов</TableHead>
                        <TableHead>Тип смены</TableHead>
                        <TableHead className="text-right">Зарплата</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            {new Date(record.work_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{record.revenue.toLocaleString()} ₽</TableCell>
                          <TableCell>{record.hours_worked}ч</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${
                              record.shift_type === 'full' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {record.shift_type === 'full' ? 'Полная' : 'Половина'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {record.calculated_salary.toLocaleString()} ₽
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {loading ? 'Загрузка данных...' : 'Нет данных за выбранный период'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalaryDashboard;
