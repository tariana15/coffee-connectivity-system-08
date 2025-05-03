import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarRange, Clipboard, CreditCard, Users, FileText, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isOwner = user?.role === "owner";
  const [period, setPeriod] = useState("today");

  // Demo data
  const metrics = {
    today: {
      revenue: "12500 ₽",
      profit: "6250 ₽",
      averageCheck: "350 ₽",
      checks: 35
    },
    week: {
      revenue: "85000 ₽",
      profit: "42500 ₽",
      averageCheck: "380 ₽",
      checks: 223
    },
    month: {
      revenue: "320000 ₽",
      profit: "160000 ₽",
      averageCheck: "375 ₽",
      checks: 853
    }
  };

  const currentMetrics = metrics[period as keyof typeof metrics];

  const tools = [
    {
      name: "Техкарта",
      icon: Clipboard,
      action: () => navigate("/recipe-cards"),
      allowedFor: ["owner", "employee"]
    },
    {
      name: "График смен",
      icon: CalendarRange,
      action: () => navigate("/schedule"),
      allowedFor: ["owner", "employee"]
    },
    {
      name: "Заработная плата",
      icon: CreditCard,
      action: () => navigate("/salary"),
      allowedFor: ["owner", "employee"]
    },
    {
      name: "Накладные",
      icon: FileText,
      action: () => navigate("/invoices"),
      allowedFor: ["owner", "employee"]
    },
    {
      name: "Чат сотрудников",
      icon: MessageSquare,
      action: () => navigate("/chat"),
      allowedFor: ["owner", "employee"]
    }
  ];

  // Force mobile layout even on desktop
  if (!isMobile) {
    return (
      <div className="max-w-md mx-auto border-x border-border h-screen overflow-y-auto bg-background">
        <MainLayout>
          <div className="space-y-4">
            <h1 className="text-xl font-semibold">Добро пожаловать, {user?.name}!</h1>
            
            {isOwner && (
              <>
                <div className="space-y-4">
                  <Tabs defaultValue="today" value={period} onValueChange={setPeriod}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="today">Сегодня</TabsTrigger>
                      <TabsTrigger value="week">Неделя</TabsTrigger>
                      <TabsTrigger value="month">Месяц</TabsTrigger>
                    </TabsList>
                    <TabsContent value="today">
                      <div className="grid grid-cols-2 gap-2">
                        <Card className="metric-card">
                          <CardHeader className="p-3 pb-0">
                            <CardDescription>Выручка</CardDescription>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <p className="text-2xl font-bold">{currentMetrics.revenue}</p>
                          </CardContent>
                        </Card>
                        <Card className="metric-card">
                          <CardHeader className="p-3 pb-0">
                            <CardDescription>Прибыль</CardDescription>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <p className="text-2xl font-bold">{currentMetrics.profit}</p>
                          </CardContent>
                        </Card>
                        <Card className="metric-card">
                          <CardHeader className="p-3 pb-0">
                            <CardDescription>Средний чек</CardDescription>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <p className="text-2xl font-bold">{currentMetrics.averageCheck}</p>
                          </CardContent>
                        </Card>
                        <Card className="metric-card">
                          <CardHeader className="p-3 pb-0">
                            <CardDescription>Кол-во чеков</CardDescription>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <p className="text-2xl font-bold">{currentMetrics.checks}</p>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                    <TabsContent value="week">
                      <div className="grid grid-cols-2 gap-2">
                        <Card className="metric-card">
                          <CardHeader className="p-3 pb-0">
                            <CardDescription>Выручка</CardDescription>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <p className="text-2xl font-bold">{currentMetrics.revenue}</p>
                          </CardContent>
                        </Card>
                        <Card className="metric-card">
                          <CardHeader className="p-3 pb-0">
                            <CardDescription>Прибыль</CardDescription>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <p className="text-2xl font-bold">{currentMetrics.profit}</p>
                          </CardContent>
                        </Card>
                        <Card className="metric-card">
                          <CardHeader className="p-3 pb-0">
                            <CardDescription>Средний чек</CardDescription>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <p className="text-2xl font-bold">{currentMetrics.averageCheck}</p>
                          </CardContent>
                        </Card>
                        <Card className="metric-card">
                          <CardHeader className="p-3 pb-0">
                            <CardDescription>Кол-во чеков</CardDescription>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <p className="text-2xl font-bold">{currentMetrics.checks}</p>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                    <TabsContent value="month">
                      <div className="grid grid-cols-2 gap-2">
                        <Card className="metric-card">
                          <CardHeader className="p-3 pb-0">
                            <CardDescription>Выручка</CardDescription>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <p className="text-2xl font-bold">{currentMetrics.revenue}</p>
                          </CardContent>
                        </Card>
                        <Card className="metric-card">
                          <CardHeader className="p-3 pb-0">
                            <CardDescription>Прибыль</CardDescription>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <p className="text-2xl font-bold">{currentMetrics.profit}</p>
                          </CardContent>
                        </Card>
                        <Card className="metric-card">
                          <CardHeader className="p-3 pb-0">
                            <CardDescription>Средний чек</CardDescription>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <p className="text-2xl font-bold">{currentMetrics.averageCheck}</p>
                          </CardContent>
                        </Card>
                        <Card className="metric-card">
                          <CardHeader className="p-3 pb-0">
                            <CardDescription>Кол-во чеков</CardDescription>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <p className="text-2xl font-bold">{currentMetrics.checks}</p>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            )}

            <div className="space-y-2">
              <h2 className="text-lg font-medium">Инструменты</h2>
              <div className="grid grid-cols-2 gap-2">
                {tools
                  .filter(tool => tool.allowedFor.includes(user?.role || ""))
                  .map(tool => (
                    <Button
                      key={tool.name}
                      variant="outline"
                      className="justify-start"
                      onClick={tool.action}
                    >
                      <tool.icon className="mr-2 h-5 w-5" />
                      {tool.name}
                    </Button>
                  ))}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Персонал кофейни</CardTitle>
                <CardDescription>
                  {isOwner
                    ? "Список ваших сотрудников"
                    : "Ваша команда"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span>
                    {isOwner
                      ? `${user?.employeeCount || 0} сотрудников`
                      : "Вы работаете в команде"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </MainLayout>
      </div>
    );
  }

  // Normal mobile view (when actually on mobile)
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Добро пожаловать, {user?.name}!</h1>
        
        {isOwner && (
          <>
            <div className="space-y-4">
              <Tabs defaultValue="today" value={period} onValueChange={setPeriod}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="today">Сегодня</TabsTrigger>
                  <TabsTrigger value="week">Неделя</TabsTrigger>
                  <TabsTrigger value="month">Месяц</TabsTrigger>
                </TabsList>
                <TabsContent value="today">
                  <div className="grid grid-cols-2 gap-2">
                    <Card className="metric-card">
                      <CardHeader className="p-3 pb-0">
                        <CardDescription>Выручка</CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-2xl font-bold">{currentMetrics.revenue}</p>
                      </CardContent>
                    </Card>
                    <Card className="metric-card">
                      <CardHeader className="p-3 pb-0">
                        <CardDescription>Прибыль</CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-2xl font-bold">{currentMetrics.profit}</p>
                      </CardContent>
                    </Card>
                    <Card className="metric-card">
                      <CardHeader className="p-3 pb-0">
                        <CardDescription>Средний чек</CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-2xl font-bold">{currentMetrics.averageCheck}</p>
                      </CardContent>
                    </Card>
                    <Card className="metric-card">
                      <CardHeader className="p-3 pb-0">
                        <CardDescription>Кол-во чеков</CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-2xl font-bold">{currentMetrics.checks}</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="week">
                  <div className="grid grid-cols-2 gap-2">
                    <Card className="metric-card">
                      <CardHeader className="p-3 pb-0">
                        <CardDescription>Выручка</CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-2xl font-bold">{currentMetrics.revenue}</p>
                      </CardContent>
                    </Card>
                    <Card className="metric-card">
                      <CardHeader className="p-3 pb-0">
                        <CardDescription>Прибыль</CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-2xl font-bold">{currentMetrics.profit}</p>
                      </CardContent>
                    </Card>
                    <Card className="metric-card">
                      <CardHeader className="p-3 pb-0">
                        <CardDescription>Средний чек</CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-2xl font-bold">{currentMetrics.averageCheck}</p>
                      </CardContent>
                    </Card>
                    <Card className="metric-card">
                      <CardHeader className="p-3 pb-0">
                        <CardDescription>Кол-во чеков</CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-2xl font-bold">{currentMetrics.checks}</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="month">
                  <div className="grid grid-cols-2 gap-2">
                    <Card className="metric-card">
                      <CardHeader className="p-3 pb-0">
                        <CardDescription>Выручка</CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-2xl font-bold">{currentMetrics.revenue}</p>
                      </CardContent>
                    </Card>
                    <Card className="metric-card">
                      <CardHeader className="p-3 pb-0">
                        <CardDescription>Прибыль</CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-2xl font-bold">{currentMetrics.profit}</p>
                      </CardContent>
                    </Card>
                    <Card className="metric-card">
                      <CardHeader className="p-3 pb-0">
                        <CardDescription>Средний чек</CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-2xl font-bold">{currentMetrics.averageCheck}</p>
                      </CardContent>
                    </Card>
                    <Card className="metric-card">
                      <CardHeader className="p-3 pb-0">
                        <CardDescription>Кол-во чеков</CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-2xl font-bold">{currentMetrics.checks}</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}

        <div className="space-y-2">
          <h2 className="text-lg font-medium">Инструменты</h2>
          <div className="grid grid-cols-2 gap-2">
            {tools
              .filter(tool => tool.allowedFor.includes(user?.role || ""))
              .map(tool => (
                <Button
                  key={tool.name}
                  variant="outline"
                  className="justify-start"
                  onClick={tool.action}
                >
                  <tool.icon className="mr-2 h-5 w-5" />
                  {tool.name}
                </Button>
              ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Персонал кофейни</CardTitle>
            <CardDescription>
              {isOwner
                ? "Список ваших сотрудников"
                : "Ваша команда"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span>
                {isOwner
                  ? `${user?.employeeCount || 0} сотрудников`
                  : "Вы работаете в команде"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
