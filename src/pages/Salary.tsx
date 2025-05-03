
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
import { useAuth } from "@/contexts/AuthContext";
import SalarySettings from "@/components/salary/SalarySettings";

const Salary = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'MMMM', { locale: ru }));
  const [currentYear, setCurrentYear] = useState(format(new Date(), 'yyyy'));
  const [salaryData, setSalaryData] = useState<MonthlyData | null>(null);
  const [calculatedData, setCalculatedData] = useState<EmployeeSalary[]>([]);
  const [activeTab, setActiveTab] = useState("firstHalf");
  const [settingsTab, setSettingsTab] = useState("salary");
  const isOwnerOrManager = user?.role === "owner" || user?.role === "manager";

  useEffect(() => {
    const loadSalaryData = async () => {
      try {
        setLoading(true);
        const data = await fetchSalaryData(currentMonth, currentYear);
        setSalaryData(data);
        
        // Calculate salary for all employees
        const constants = getSalaryConstants(user?.coffeeShopName);
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
  }, [currentMonth, currentYear, toast, user?.coffeeShopName]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Для сотрудников показываем только их данные
  const filteredData = isOwnerOrManager 
    ? calculatedData 
    : calculatedData.filter(emp => emp.name === user?.name);

  const constants = getSalaryConstants(user?.coffeeShopName);

  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Заработная плата</h1>

        {isOwnerOrManager && (
          <Tabs defaultValue="salary" value={settingsTab} onValueChange={setSettingsTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="salary">Зарплата</TabsTrigger>
              <TabsTrigger value="settings">Настройки</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings">
              <SalarySettings />
            </TabsContent>
            
            <TabsContent value="salary">
              <SalaryDataContent 
                loading={loading}
                salaryData={salaryData}
                filteredData={filteredData}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                formatCurrency={formatCurrency}
                isOwnerOrManager={isOwnerOrManager}
                constants={constants}
              />
            </TabsContent>
          </Tabs>
        )}
        
        {!isOwnerOrManager && (
          <SalaryDataContent 
            loading={loading}
            salaryData={salaryData}
            filteredData={filteredData}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            formatCurrency={formatCurrency}
            isOwnerOrManager={isOwnerOrManager}
            constants={constants}
          />
        )}
      </div>
    </MainLayout>
  );
};

interface SalaryDataContentProps {
  loading: boolean;
  salaryData: MonthlyData | null;
  filteredData: EmployeeSalary[];
  activeTab: string;
  setActiveTab: (value: string) => void;
  formatCurrency: (amount: number) => string;
  isOwnerOrManager: boolean;
  constants: any;
}

const SalaryDataContent: React.FC<SalaryDataContentProps> = ({
  loading,
  salaryData,
  filteredData,
  activeTab,
  setActiveTab,
  formatCurrency,
  isOwnerOrManager,
  constants
}) => {
  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle>{salaryData?.month} {salaryData?.year}</CardTitle>
          <CardDescription>
            {isOwnerOrManager 
              ? "Информация о заработной плате сотрудников"
              : "Ваша заработная плата"}
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
                    employees={filteredData}
                    salaryField="firstHalfTotal"
                    formatCurrency={formatCurrency}
                    showShiftCount={true}
                  />
                </TabsContent>
                
                <TabsContent value="secondHalf">
                  <SalaryTable 
                    employees={filteredData}
                    salaryField="secondHalfTotal"
                    formatCurrency={formatCurrency}
                    showShiftCount={true}
                  />
                </TabsContent>
                
                <TabsContent value="month">
                  <SalaryTable 
                    employees={filteredData}
                    salaryField="monthTotal"
                    formatCurrency={formatCurrency}
                    showShiftCount={true}
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
            <p>• За выход на смену (полный день): <strong>{constants.baseRate}₽</strong></p>
            <p>• За выход на смену (пол дня): <strong>{constants.baseRate / 2}₽</strong></p>
            <p>• Процент от выручки: <strong>{constants.percentageBelow * 100}%</strong> от суммы выше {constants.revenueThreshold}₽</p>
            <p>• Оплата за час дополнительной работы: <strong>{constants.hourlyRate}₽</strong></p>
            <p>• За доставку: <strong>36%</strong> от суммы доставки</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

interface SalaryTableProps {
  employees: EmployeeSalary[];
  salaryField: keyof Pick<EmployeeSalary, 'firstHalfTotal' | 'secondHalfTotal' | 'monthTotal'>;
  formatCurrency: (amount: number) => string;
  showShiftCount?: boolean;
}

const SalaryTable: React.FC<SalaryTableProps> = ({ 
  employees, 
  salaryField, 
  formatCurrency,
  showShiftCount = false 
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Сотрудник</TableHead>
            {showShiftCount && <TableHead>Кол-во смен</TableHead>}
            <TableHead className="text-right">Зарплата</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.name}>
              <TableCell className="font-medium">{employee.name}</TableCell>
              {showShiftCount && (
                <TableCell>{employee.shiftCount || employee.shifts.filter(s => s.worked).length}</TableCell>
              )}
              <TableCell className="text-right">{formatCurrency(employee[salaryField])}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Salary;
