import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isEqual, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarClock, Clock, UserCheck, UserMinus } from "lucide-react";

// Типы для работы с сменами
interface Employee {
  id: string;
  name: string;
}

interface Shift {
  id: string;
  employeeId: string;
  date: string; // ISO string
  type: "full" | "half-morning" | "half-evening";
  status: "scheduled" | "pending-change" | "pending-delete";
  requestedDate?: string; // ISO string for when change is requested
  requestedType?: "full" | "half-morning" | "half-evening";
}

// We need to define our own extended props for DayContent
interface ExtendedDayContentProps {
  date: Date;
  displayMonth?: Date;
}

const Schedule = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  
  // Состояния
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedShiftType, setSelectedShiftType] = useState<"full" | "half-morning" | "half-evening">("full");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [requestDate, setRequestDate] = useState<Date | null>(null);
  const [requestType, setRequestType] = useState<"full" | "half-morning" | "half-evening">("full");

  // Загрузка данных при монтировании
  useEffect(() => {
    // Загрузка сотрудников из локального хранилища
    const savedEmployees = localStorage.getItem("coffeeShopUsers");
    if (savedEmployees) {
      const parsedEmployees = JSON.parse(savedEmployees).filter(
        (emp: any) => emp.coffeeShopName === user?.coffeeShopName
      );
      setEmployees(parsedEmployees);
    }

    // Загрузка смен из локального хранилища
    const savedShifts = localStorage.getItem(`shifts_${user?.coffeeShopName}`);
    if (savedShifts) {
      setShifts(JSON.parse(savedShifts));
    }
  }, [user]);

  // Сохранение смен в локальное хранилище
  const saveShifts = (updatedShifts: Shift[]) => {
    localStorage.setItem(`shifts_${user?.coffeeShopName}`, JSON.stringify(updatedShifts));
    setShifts(updatedShifts);
  };

  // Обработчик выбора даты на календаре
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    if (isOwner) {
      // Для владельца: добавление/удаление дат из выбранных
      setSelectedDates(prev => {
        const dateExists = prev.find(d => isEqual(d, date));
        if (dateExists) {
          return prev.filter(d => !isEqual(d, date));
        } else {
          return [...prev, date];
        }
      });
    } else {
      // Для сотрудника: открытие диалога для управления сменой
      const dateStr = date.toISOString().split('T')[0];
      const employeeShift = shifts.find(
        s => s.employeeId === user?.id && s.date.startsWith(dateStr)
      );
      
      if (employeeShift) {
        setSelectedShift(employeeShift);
        setDialogOpen(true);
      } else {
        toast({
          title: "Нет смены",
          description: "У вас нет смены на этот день",
          variant: "destructive"
        });
      }
    }
  };

  // Обработчик нажатия на сотрудника
  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployee(prev => prev === employeeId ? null : employeeId);
    setSelectedDates([]);
  };

  // Обработчик подтверждения смен для выбранного сотрудника
  const handleConfirmShifts = () => {
    if (!selectedEmployee || selectedDates.length === 0) {
      toast({
        title: "Ошибка",
        description: "Выберите сотрудника и даты смен",
        variant: "destructive"
      });
      return;
    }

    // Создание новых смен для выбранных дат
    const newShifts = selectedDates.map(date => ({
      id: `shift-${Date.now()}-${Math.random()}`,
      employeeId: selectedEmployee,
      date: date.toISOString(),
      type: selectedShiftType,
      status: "scheduled" as const
    }));

    // Удаление существующих смен на выбранные даты
    const filteredShifts = shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return !selectedDates.some(date => 
        isEqual(new Date(date.toISOString().split('T')[0]), new Date(shiftDate.toISOString().split('T')[0]))
      );
    });

    // Объединение смен и сохранение
    const updatedShifts = [...filteredShifts, ...newShifts];
    saveShifts(updatedShifts);
    
    toast({
      title: "Смены назначены",
      description: `Смены успешно назначены`
    });
    
    setSelectedDates([]);
  };

  // Обработчик запроса изменения смены
  const handleShiftChangeRequest = (action: "change" | "delete") => {
    if (!selectedShift) return;
    
    const updatedShifts = shifts.map(shift => {
      if (shift.id === selectedShift.id) {
        if (action === "change" && requestDate) {
          return {
            ...shift,
            status: "pending-change" as const,
            requestedDate: requestDate.toISOString(),
            requestedType: requestType
          };
        } else if (action === "delete") {
          return {
            ...shift,
            status: "pending-delete" as const
          };
        }
      }
      return shift;
    });
    
    saveShifts(updatedShifts);
    setDialogOpen(false);
    
    toast({
      title: action === "change" ? "Запрос на перенос смены отправлен" : "Запрос на удаление смены отправлен",
      description: "Ожидайте подтверждения от владельца"
    });
  };

  // Обработчик действий владельца по запросам
  const handleOwnerAction = (shiftId: string, action: "approve" | "reject") => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return;

    let updatedShifts: Shift[];

    if (action === "approve") {
      if (shift.status === "pending-delete") {
        // Удаление смены
        updatedShifts = shifts.filter(s => s.id !== shiftId);
      } else if (shift.status === "pending-change" && shift.requestedDate) {
        // Перенос смены
        updatedShifts = shifts.map(s => 
          s.id === shiftId ? 
          { 
            ...s, 
            date: shift.requestedDate!, 
            type: shift.requestedType || s.type,
            status: "scheduled",
            requestedDate: undefined,
            requestedType: undefined
          } : s
        );
      } else {
        updatedShifts = [...shifts];
      }
    } else {
      // Отклонение запроса
      updatedShifts = shifts.map(s => 
        s.id === shiftId ? 
        { 
          ...s, 
          status: "scheduled",
          requestedDate: undefined,
          requestedType: undefined
        } : s
      );
    }

    saveShifts(updatedShifts);
    
    toast({
      title: action === "approve" ? "Запрос одобрен" : "Запрос отклонен",
      description: action === "approve" ? 
        shift.status === "pending-delete" ? "Смена удалена" : "Смена перенесена" : 
        "Запрос отклонен, смена остается без изменений"
    });
  };

  // Функция для определения, работает ли более одного сотрудника в день
  const isDateOverloaded = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Если меньше двух сотрудников, то только один может работать в смену
    if (employees.length < 2) {
      const employeesOnShift = shifts.filter(
        shift => shift.date.startsWith(dateStr) && shift.status !== "pending-delete"
      );
      
      return employeesOnShift.length > 0;
    }
    
    return false;
  };
  
  // Проверка, запланирована ли смена на определенную дату для текущего пользователя
  const isUserShift = (date: Date) => {
    if (!user) return false;
    
    const dateStr = date.toISOString().split('T')[0];
    return shifts.some(
      shift => shift.employeeId === user.id && 
               shift.date.startsWith(dateStr) && 
               shift.status !== "pending-delete"
    );
  };
  
  // Проверка, есть ли ожидающие запросы для владельца
  const pendingRequests = shifts.filter(
    shift => shift.status === "pending-change" || shift.status === "pending-delete"
  );
  
  // Отображение значка на дате календаря
  const getDayClassNames = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Проверка, выбрана ли дата (для владельца при назначении смен)
    const isSelected = selectedDates.some(d => isEqual(new Date(d.toISOString().split('T')[0]), new Date(dateStr)));
    
    // Проверка, есть ли смены на эту дату
    const shiftsOnDate = shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate.toISOString().split('T')[0] === dateStr && shift.status !== "pending-delete";
    });
    
    // Проверка, есть ли запросы на изменение/удаление на эту дату
    const requestsOnDate = shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate.toISOString().split('T')[0] === dateStr && 
             (shift.status === "pending-change" || shift.status === "pending-delete");
    });
    
    if (isSelected) return "bg-primary text-primary-foreground rounded-md";
    if (user && !isOwner && isUserShift(date)) return "bg-secondary text-secondary-foreground rounded-md";
    if (shiftsOnDate.length > 0) return "bg-muted text-foreground rounded-md";
    if (requestsOnDate.length > 0) return "bg-amber-100 text-amber-900 rounded-md";
    
    return "";
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">График смен</h1>
          {isOwner && pendingRequests.length > 0 && (
            <Badge variant="outline" className="bg-amber-100 text-amber-900">
              {pendingRequests.length} запросов
            </Badge>
          )}
        </div>

        <Tabs defaultValue={isOwner ? "calendar" : "my-shifts"}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={isOwner ? "calendar" : "my-shifts"}>
              {isOwner ? "Календарь смен" : "Мои смены"}
            </TabsTrigger>
            <TabsTrigger value={isOwner ? "requests" : "calendar"}>
              {isOwner ? "Запросы" : "Календарь смен"}
            </TabsTrigger>
          </TabsList>

          {/* Вкладка "Календарь смен" для владельца */}
          {isOwner && (
            <TabsContent value="calendar" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Календарь</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="multiple"
                      selected={selectedDates}
                      onSelect={(dates) => {
                        if (dates === undefined) {
                          setSelectedDates([]);
                        } else if (Array.isArray(dates)) {
                          setSelectedDates(dates);
                        } else {
                          handleDateSelect(dates);
                        }
                      }}
                      className="rounded-md border"
                      locale={ru}
                      modifiers={{
                        selected: selectedDates
                      }}
                      modifiersClassNames={{
                        selected: "bg-primary text-primary-foreground rounded-md"
                      }}
                      components={{
                        DayContent: ({ date }: ExtendedDayContentProps) => (
                          <div className={`w-full h-full flex items-center justify-center ${getDayClassNames(date)}`}>
                            {date.getDate()}
                          </div>
                        )
                      }}
                      disabled={(date) => {
                        // Не позволять выбирать даты в прошлом
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today || isDateOverloaded(date);
                      }}
                    />
                  </CardContent>
                </Card>
                
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-base">Тип смены</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select 
                        value={selectedShiftType} 
                        onValueChange={(value) => setSelectedShiftType(value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Полный день</SelectItem>
                          <SelectItem value="half-morning">Первая половина дня</SelectItem>
                          <SelectItem value="half-evening">Вторая половина дня</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Сотрудники</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {employees.map(employee => (
                          <div 
                            key={employee.id}
                            className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                              selectedEmployee === employee.id ? "bg-muted" : ""
                            }`}
                            onClick={() => handleEmployeeSelect(employee.id)}
                          >
                            <div className="flex items-center">
                              <UserCheck className="h-5 w-5 mr-2" />
                              <span>{employee.name}</span>
                            </div>
                            {selectedEmployee === employee.id && (
                              <Button 
                                size="sm" 
                                disabled={selectedDates.length === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConfirmShifts();
                                }}
                              >
                                Подтвердить
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {selectedDates.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Выбранные даты</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1">
                          {selectedDates.map((date, index) => (
                            <Badge key={index} variant="outline">
                              {format(date, "d MMMM", { locale: ru })}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          )}

          {/* Вкладка "Запросы" для владельца */}
          {isOwner && (
            <TabsContent value="requests">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Запросы на изменение смен</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingRequests.length > 0 ? (
                    <div className="space-y-4">
                      {pendingRequests.map(request => {
                        const employee = employees.find(e => e.id === request.employeeId);
                        
                        return (
                          <div key={request.id} className="border rounded-md p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium">{employee?.name || "Сотрудник"}</p>
                                <p className="text-sm text-muted-foreground">
                                  {request.status === "pending-delete" ? (
                                    "Просит удалить смену"
                                  ) : (
                                    "Просит перенести смену"
                                  )}
                                </p>
                              </div>
                              <Badge variant={request.status === "pending-delete" ? "destructive" : "outline"}>
                                {request.status === "pending-delete" ? "Удаление" : "Перенос"}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <div>
                                <p className="text-xs text-muted-foreground">Текущая дата</p>
                                <p className="font-medium">{format(new Date(request.date), "d MMMM", { locale: ru })}</p>
                                <p className="text-xs">
                                  {request.type === "full" 
                                    ? "Полный день" 
                                    : request.type === "half-morning" 
                                      ? "Первая половина" 
                                      : "Вторая половина"}
                                </p>
                              </div>
                              
                              {request.status === "pending-change" && request.requestedDate && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Запрашиваемая дата</p>
                                  <p className="font-medium">{format(new Date(request.requestedDate), "d MMMM", { locale: ru })}</p>
                                  <p className="text-xs">
                                    {request.requestedType === "full" 
                                      ? "Полный день" 
                                      : request.requestedType === "half-morning" 
                                        ? "Первая половина" 
                                        : "Вторая половина"}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleOwnerAction(request.id, "reject")}
                              >
                                Отклонить
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleOwnerAction(request.id, "approve")}
                              >
                                Одобрить
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      Нет запросов на изменение смен
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Вкладка "Мои смены" для сотрудника */}
          {!isOwner && (
            <TabsContent value="my-shifts">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Мои смены</CardTitle>
                </CardHeader>
                <CardContent>
                  {shifts.filter(s => s.employeeId === user?.id && s.status !== "pending-delete").length > 0 ? (
                    <div className="space-y-2">
                      {shifts
                        .filter(s => s.employeeId === user?.id)
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map(shift => (
                          <div 
                            key={shift.id} 
                            className="flex items-center justify-between p-2 border rounded-md"
                            onClick={() => {
                              setSelectedShift(shift);
                              setDialogOpen(true);
                            }}
                          >
                            <div className="flex items-center">
                              <CalendarClock className="h-5 w-5 mr-2" />
                              <div>
                                <p>{format(new Date(shift.date), "d MMMM", { locale: ru })}</p>
                                <p className="text-xs text-muted-foreground">
                                  {shift.type === "full" 
                                    ? "Полный день" 
                                    : shift.type === "half-morning" 
                                      ? "Первая половина дня" 
                                      : "Вторая половина дня"}
                                </p>
                              </div>
                            </div>
                            {shift.status !== "scheduled" && (
                              <Badge variant="outline" className="bg-amber-100 text-amber-900">
                                {shift.status === "pending-change" ? "Запрошен перенос" : "Запрошено удаление"}
                              </Badge>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      У вас нет запланированных смен
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Вкладка "Календарь смен" для сотрудника */}
          {!isOwner && (
            <TabsContent value="calendar">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Календарь смен</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    onSelect={handleDateSelect}
                    className="rounded-md border"
                    locale={ru}
                    components={{
                      DayContent: ({ date }: ExtendedDayContentProps) => (
                        <div className={`w-full h-full flex items-center justify-center ${getDayClassNames(date)}`}>
                          {date.getDate()}
                        </div>
                      )
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Диалог для управления сменой (для сотрудника) */}
        {!isOwner && selectedShift && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Управление сменой</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="flex items-center space-x-2">
                  <CalendarClock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {format(new Date(selectedShift.date), "d MMMM", { locale: ru })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedShift.type === "full" 
                        ? "Полный день" 
                        : selectedShift.type === "half-morning" 
                          ? "Первая половина дня" 
                          : "Вторая половина дня"}
                    </p>
                  </div>
                </div>
                
                {selectedShift.status === "scheduled" ? (
                  <>
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Перенести смену</h4>
                      <Calendar
                        mode="single"
                        selected={requestDate || undefined}
                        onSelect={setRequestDate}
                        className="rounded-md border"
                        locale={ru}
                        disabled={(date) => {
                          // Не позволять выбирать даты в прошлом
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                      />
                      
                      {requestDate && (
                        <Select 
                          value={requestType} 
                          onValueChange={(value) => setRequestType(value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">Полный день</SelectItem>
                            <SelectItem value="half-morning">Первая половина дня</SelectItem>
                            <SelectItem value="half-evening">Вторая половина дня</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Отмена</Button>
                      </DialogClose>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleShiftChangeRequest("delete")}
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Отказаться от смены
                      </Button>
                      <Button 
                        disabled={!requestDate}
                        onClick={() => handleShiftChangeRequest("change")}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Запросить перенос
                      </Button>
                    </DialogFooter>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <p className="text-amber-600">
                      {selectedShift.status === "pending-change" 
                        ? "Запрос на перенос смены уже отправлен" 
                        : "Запрос на удаление смены уже отправлен"}
                    </p>
                    <p className="text-muted-foreground">Ожидайте ответа от руководителя</p>
                    
                    <DialogFooter className="mt-4">
                      <DialogClose asChild>
                        <Button>Закрыть</Button>
                      </DialogClose>
                    </DialogFooter>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
};

export default Schedule;
