import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { fetchSalaryData, calculateSalary, getSalaryConstants } from "@/services/googleSheetsService";
import { MonthlyData, EmployeeSalary } from "@/types/salary";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const Salary = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'MMMM', { locale: ru }));
  const [currentYear, setCurrentYear] = useState(format(new Date(), 'yyyy'));
  const [salaryData, setSalaryData] = useState<MonthlyData | null>(null);
  const [calculatedData, setCalculatedData] = useState<EmployeeSalary[]>([]);
  const [activeTab, setActiveTab] = useState("firstHalf");

  useEffect(() => {
    const loadSalaryData = async () => {
      try {
        setLoading(true);
        const data = await fetchSalaryData(currentMonth, currentYear);
        setSalaryData(data);
        
        // Calculate salary for all employees
        const constants = getSalaryConstants();
        const calculated = data.employees.map(employee => 
          calculateSalary(employee, data.revenues, constants)
        );
        
        setCalculatedData(calculated);
      } catch (error) {
        toast({
          title: "Ошибка загрузки данных",
          description: "Не удалось загрузить данные о зарплате.",
          variant: "destructive"
        });
        console.error("Error loading salary data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSalaryData();
  }, [currentMonth, currentYear, toast]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Заработная плата</h1>
        
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle>{salaryData?.month} {salaryData?.year}</CardTitle>
            <CardDescription>
              Информация о заработной плате сотрудников
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="firstHalf" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="firstHalf">1-15 числа</TabsTrigger>
                <TabsTrigger value="secondHalf">15-{salaryData?.days || 30} числа</TabsTrigger>
                <TabsTrigger value="month">Весь месяц</TabsTrigger>
              </TabsList>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <p>Загрузка данных...</p>
                </div>
              ) : (
                <>
                  <TabsContent value="firstHalf">
                    <SalaryTable 
                      employees={calculatedData}
                      salaryField="firstHalfTotal"
                      formatCurrency={formatCurrency}
                    />
                  </TabsContent>
                  
                  <TabsContent value="secondHalf">
                    <SalaryTable 
                      employees={calculatedData}
                      salaryField="secondHalfTotal"
                      formatCurrency={formatCurrency}
                    />
                  </TabsContent>
                  
                  <TabsContent value="month">
                    <SalaryTable 
                      employees={calculatedData}
                      salaryField="monthTotal"
                      formatCurrency={formatCurrency}
                    />
                  </TabsContent>
                </>
              )}
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Информация о расчете</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>• За выход на смену (раб): <strong>2300₽</strong></p>
              <p>• Процент от выручки при сумме до 7000₽: <strong>5%</strong></p>
              <p>• Процент от выручки при сумме более 7000₽: <strong>5%</strong></p>
              <p>• Оплата за час дополнительной работы: <strong>250₽</strong></p>
              <p>• За доставку: <strong>36%</strong> от суммы доставки</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

interface SalaryTableProps {
  employees: EmployeeSalary[];
  salaryField: keyof Pick<EmployeeSalary, 'firstHalfTotal' | 'secondHalfTotal' | 'monthTotal'>;
  formatCurrency: (amount: number) => string;
}

const SalaryTable: React.FC<SalaryTableProps> = ({ employees, salaryField, formatCurrency }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Сотрудник</TableHead>
            <TableHead className="text-right">Зарплата</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.name}>
              <TableCell className="font-medium">{employee.name}</TableCell>
              <TableCell className="text-right">{formatCurrency(employee[salaryField])}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Salary;
