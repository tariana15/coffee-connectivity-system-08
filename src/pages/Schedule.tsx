
import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays, MessageSquare, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";

const Schedule = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState("calendar");
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const { user } = useAuth();

  // Demo data
  const employees = [
    { id: 1, name: "Анна", shifts: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29] },
    { id: 2, name: "Иван", shifts: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30] },
    { id: 3, name: "Мария", shifts: [1, 2, 5, 6, 9, 10, 13, 14, 17, 18, 21, 22, 25, 26, 29, 30] },
    { id: 4, name: "Алексей", shifts: [3, 4, 7, 8, 11, 12, 15, 16, 19, 20, 23, 24, 27, 28] }
  ];

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

  const getEmployeeForDay = (day: number) => {
    return employees.filter(employee => employee.shifts.includes(day)).map(e => e.name);
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">График смен</h1>
        
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
                  Выберите дату для просмотра и управления сменами
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-6">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
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
                      {getEmployeeForDay(date.getDate()).length > 0 ? (
                        getEmployeeForDay(date.getDate()).map((name, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-md border p-3"
                          >
                            <div className="flex items-center">
                              <Users className="mr-2 h-5 w-5 text-muted-foreground" />
                              <span>{name}</span>
                            </div>
                            <Button variant="ghost" size="sm">Изменить</Button>
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
                          {days.map(day => (
                            <TableCell key={day} className="p-0 text-center">
                              {employee.shifts.includes(day) ? (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coffee-purple bg-opacity-20 text-coffee-purple">
                                  ✓
                                </div>
                              ) : (
                                <div className="h-10 w-10"></div>
                              )}
                            </TableCell>
                          ))}
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
    </MainLayout>
  );
};

export default Schedule;
