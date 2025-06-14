
import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import SalarySettings from "@/components/salary/SalarySettings";
import SalaryDashboard from "@/components/salary/SalaryDashboard";

const Salary = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const isOwnerOrManager = user?.role === "owner" || user?.role === "manager";

  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Заработная плата</h1>

        {isOwnerOrManager ? (
          <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dashboard">Зарплаты</TabsTrigger>
              <TabsTrigger value="settings">Настройки</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <SalaryDashboard />
            </TabsContent>
            
            <TabsContent value="settings">
              <SalarySettings />
            </TabsContent>
          </Tabs>
        ) : (
          <SalaryDashboard />
        )}
      </div>
    </MainLayout>
  );
};

export default Salary;
