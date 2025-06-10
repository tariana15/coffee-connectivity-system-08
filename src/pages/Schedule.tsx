import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays, MessageSquare, Users, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { EmployeeShiftDialog } from "@/components/schedule/EmployeeShiftDialog";
import { OwnerShiftDialog } from "@/components/schedule/OwnerShiftDialog";
import { Employee, ShiftAssignment, ShiftType } from "@/types/schedule";

const Schedule = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState("calendar");
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [ownerDialogOpen, setOwnerDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Initial state with demo data
  const [employees, setEmployees] = useState<Employee[]>([
    { 
      id: 1, 
      name: "Анна", 
      shifts: Array.from({ length: 15 }, (_, i) => ({ date: i * 2 + 1, type: 'full' as ShiftType }))
    },
    { 
      id: 2, 
      name: "Иван", 
      shifts: Array.from({ length: 15 }, (_, i) => ({ date: i * 2 + 2, type: 'full' as ShiftType }))
    },
    { 
      id: 3, 
      name: "Мария", 
      shifts: [1, 2, 5, 6, 9, 10, 13, 14, 17, 18, 21, 22, 25, 26, 29, 30].map(day => ({ date: day, type: 'full' as ShiftType }))
    },
    { 
      id: 4, 
      name: "Алексей", 
      shifts: [3, 4, 7, 8, 11, 12, 15, 16, 19, 20, 23, 24, 27, 28].map(day => ({ date: day, type: 'full' as ShiftType }))
    }
  ]);

  // Function to load schedule data
  useEffect(() => {
    // In a real app, you'd fetch this data from a backend/localStorage
    const savedSchedule = localStorage.getItem("coffeeShopSchedule");
    if (savedSchedule) {
      try {
        const parsedSchedule = JSON.parse(savedSchedule);
        if (Array.isArray(parsedSchedule)) {
          setEmployees(parsedSchedule);
        }
      } catch (error) {
        console.error("Error parsing schedule data:", error);
      }
    }
  }, []);

  // Function to save schedule data
  const saveScheduleData = (updatedEmployees: Employee[]) => {
    setEmployees(updatedEmployees);
    localStorage.setItem("coffeeShopSchedule", JSON.stringify(updatedEmployees));
  };

  const sendMessage = () => {
    toast({
      title: "Сообщение отправлено",
      description: "Ваше сообщение отправлено в чат кофейни"
    });
    
    addNotification({
      title: "Новое сообщение в чате",
      message: `${user?.name}: Изменения в графике на завтра`,
      type: "info"
    });
  };

  // Helper to generate current month days
  const getDaysInMonth = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const days = getDaysInMonth();

  const getEmployeeShiftForDay = (day: number) => {
    return employees
      .filter(employee => employee.shifts.some(shift => shift.date === day))
      .map(e => ({
        id: e.id,
        name: e.name,
        type: e.shifts.find(shift => shift.date === day)?.type || 'full'
      }));
  };

  const isEmployeeOnShift = (employeeId: number, day: number) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.shifts.some(shift => shift.date === day) || false;
  };

  const getShiftTypeForDay = (employeeId: number, day: number): ShiftType | null => {
    const employee = employees.find(e => e.id === employeeId);
    const shift = employee?.shifts.find(shift => shift.date === day);
    return shift ? shift.type : null;
  };

  // Handle date selection for employee
  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate && user?.role === 'employee') {
      const dayOfMonth = newDate.getDate();
      const userId = parseInt(user.id);
      
      // Check if employee has a shift on this day
      if (isEmployeeOnShift(userId, dayOfMonth)) {
        setSelectedDate(newDate);
        setEmployeeDialogOpen(true);
      }
    }
  };

  // Handle remove shift for employee
  const handleRemoveShift = (shiftDate: Date) => {
    if (!user) return;
    
    const dayOfMonth = shiftDate.getDate();
    const employeeId = parseInt(user.id);
    
    const updatedEmployees = employees.map(employee => {
      if (employee.id === employeeId) {
        return {
          ...employee,
          shifts: employee.shifts.filter(shift => shift.date !== dayOfMonth)
        };
      }
      return employee;
    });
    
    saveScheduleData(updatedEmployees);
  };

  // Handle transfer shift for employee
  const handleTransferShift = (oldDate: Date, newDate: Date) => {
    if (!user) return;
    
    const oldDay = oldDate.getDate();
    const newDay = newDate.getDate();
    const employeeId = parseInt(user.id);
    
    // Check if already has a shift on the new day
    if (isEmployeeOnShift(employeeId, newDay)) {
      toast({
        title: "Невозможно перенести смену",
        description: "У вас уже назначена смена на выбранную дату.",
        variant: "destructive",
      });
      return;
    }
    
    // Get the shift type from the old day
    const shiftType = getShiftTypeForDay(employeeId, oldDay);
    if (!shiftType) return;
    
    const updatedEmployees = employees.map(employee => {
      if (employee.id === employeeId) {
        const newShifts = employee.shifts.filter(shift => shift.date !== oldDay);
        newShifts.push({ date: newDay, type: shiftType });
        return {
          ...employee,
          shifts: newShifts
        };
      }
      return employee;
    });
    
    saveScheduleData(updatedEmployees);
  };

  // Handle assign shifts for owner
  const handleAssignShifts = (employeeId: number, dates: Date[], shiftType: 'full' | 'half') => {
    const newShiftDays = dates.map(date => date.getDate());
    
    // Handle case when less than 2 employees (only one employee should work per day)
    if (employees.length < 2) {
      // For each day, remove shifts for all other employees
      const updatedEmployees = employees.map(employee => {
        if (employee.id === employeeId) {
          // For selected employee, add new shifts
          const existingShiftDays = employee.shifts.map(s => s.date);
          const uniqueNewDays = newShiftDays.filter(day => !existingShiftDays.includes(day));
          const updatedShifts = [
            ...employee.shifts,
            ...uniqueNewDays.map(day => ({ date: day, type: shiftType }))
          ];
          return { ...employee, shifts: updatedShifts };
        } else {
          // For other employees, remove shifts on these days
          return {
            ...employee,
            shifts: employee.shifts.filter(shift => !newShiftDays.includes(shift.date))
          };
        }
      });
      saveScheduleData(updatedEmployees);
      
      // Update shifts count in localStorage for salary calculations
      updateShiftsCountForSalary(updatedEmployees);
    } else {
      // Normal case - just add the shifts to the selected employee
      const updatedEmployees = employees.map(employee => {
        if (employee.id === employeeId) {
          // Get current shift days
          const currentShiftDays = employee.shifts.map(s => s.date);
          
          // Add new shifts (excluding days where employee already has a shift)
          let updatedShifts = [...employee.shifts];
          
          for (const day of newShiftDays) {
            const existingShiftIndex = updatedShifts.findIndex(shift => shift.date === day);
            
            if (existingShiftIndex >= 0) {
              // Update existing shift type
              updatedShifts[existingShiftIndex] = { date: day, type: shiftType };
            } else {
              // Add new shift
              updatedShifts.push({ date: day, type: shiftType });
            }
          }
          
          return { ...employee, shifts: updatedShifts };
        }
        return employee;
      });
      
      saveScheduleData(updatedEmployees);
      
      // Update shifts count in localStorage for salary calculations
      updateShiftsCountForSalary(updatedEmployees);
    }
  };
  
  // Function to update shift counts for salary calculations
  const updateShiftsCountForSalary = (updatedEmployees: Employee[]) => {
    // Get the current month's salary data
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('ru-RU', { month: 'long' });
    const currentYear = currentDate.getFullYear().toString();
    
    // Create shifts count data
    const shiftsData = updatedEmployees.map(employee => ({
      name: employee.name,
      shiftCount: employee.shifts.length,
      shiftTypes: {
        full: employee.shifts.filter(shift => shift.type === 'full').length,
        half: employee.shifts.filter(shift => shift.type === 'half').length
      }
    }));
    
    // Store the shifts data in localStorage
    localStorage.setItem('coffeeShopShiftsCount', JSON.stringify({
      month: currentMonth,
      year: currentYear,
      employees: shiftsData
    }));
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">График смен</h1>
          
          {user?.role === 'owner' && (
            <Button onClick={() => setOwnerDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Назначить смены
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="calendar" value={view} onValueChange={setView}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar">Календарь</TabsTrigger>
            <TabsTrigger value="table">Таблица</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Календарь смен</CardTitle>
                <CardDescription>
                  {user?.role === 'owner' 
                    ? "Выберите дату для просмотра и назначения смен" 
                    : "Выберите свою смену для управления"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-6">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {date && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {date.toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </CardTitle>
                  <CardDescription>
                    Персонал в смене на этот день
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {getEmployeeShiftForDay(date.getDate()).length > 0 ? (
                        getEmployeeShiftForDay(date.getDate()).map((employee) => (
                          <div
                            key={employee.id}
                            className="flex items-center justify-between rounded-md border p-3"
                          >
                            <div className="flex items-center gap-2">
                              <Users className="h-5 w-5 text-muted-foreground" />
                              <span>{employee.name}</span>
                              {employee.type === 'half' && (
                                <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                                  пол дня
                                </span>
                              )}
                            </div>
                            {user?.role === 'owner' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedDate(date);
                                  setOwnerDialogOpen(true);
                                }}
                              >
                                Изменить
                              </Button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="flex h-[100px] flex-col items-center justify-center rounded-md border text-muted-foreground">
                          <CalendarDays className="mb-2 h-10 w-10 opacity-20" />
                          <p>Нет назначенных смен на этот день</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Button onClick={sendMessage}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Отправить сообщение в чат
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="table">
            <Card>
              <CardHeader>
                <CardTitle>Таблица смен</CardTitle>
                <CardDescription>Распределение смен на текущий месяц</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 bg-background">Сотрудник</TableHead>
                        {days.map(day => (
                          <TableHead key={day} className="text-center">
                            {day}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.map(employee => (
                        <TableRow key={employee.id}>
                          <TableCell className="sticky left-0 bg-background font-medium">
                            {employee.name}
                          </TableCell>
                          {days.map(day => {
                            const shift = employee.shifts.find(s => s.date === day);
                            return (
                              <TableCell key={day} className="p-0 text-center">
                                {shift ? (
                                  <div 
                                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                      shift.type === 'half' 
                                        ? 'bg-amber-100 text-amber-800' 
                                        : 'bg-coffee-purple bg-opacity-20 text-coffee-purple'
                                    }`}
                                  >
                                    {shift.type === 'half' ? '½' : '✓'}
                                  </div>
                                ) : (
                                  <div className="h-10 w-10"></div>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      {selectedDate && (
        <>
          <EmployeeShiftDialog
            isOpen={employeeDialogOpen}
            onClose={() => {
              setEmployeeDialogOpen(false);
              setSelectedDate(null);
            }}
            currentDate={selectedDate}
            onRemoveShift={handleRemoveShift}
            onTransferShift={handleTransferShift}
          />
        </>
      )}

      <OwnerShiftDialog
        isOpen={ownerDialogOpen}
        onClose={() => setOwnerDialogOpen(false)}
        employees={employees}
        onAssignShifts={handleAssignShifts}
      />
    </MainLayout>
  );
};

export default Schedule;
