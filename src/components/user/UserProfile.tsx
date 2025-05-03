
import React, { useState } from "react";
import { LogOut, Users, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddEmployeeForm from "@/components/user/AddEmployeeForm";
import EmployeesList from "@/components/user/EmployeesList";

interface UserProfileProps {
  onClose?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  if (!user) return null;

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
  };

  const isOwnerOrManager = user.role === "owner" || user.role === "manager";

  return (
    <div className="p-4">
      {isOwnerOrManager ? (
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="profile">Профиль</TabsTrigger>
            <TabsTrigger value="employees">Сотрудники</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <ProfileContent user={user} onLogout={handleLogout} />
          </TabsContent>
          
          <TabsContent value="employees">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Управление сотрудниками</h3>
              <AddEmployeeForm onSuccess={() => setActiveTab("employees")} />
              <Separator className="my-4" />
              <h4 className="font-medium mb-2">Список сотрудников</h4>
              <EmployeesList />
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <ProfileContent user={user} onLogout={handleLogout} />
      )}
    </div>
  );
};

interface ProfileContentProps {
  user: any;
  onLogout: () => void;
}

const ProfileContent: React.FC<ProfileContentProps> = ({ user, onLogout }) => {
  return (
    <>
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.avatarUrl} />
          <AvatarFallback className="bg-coffee-purple text-lg text-white">
            {user.name.substring(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h3 className="font-medium">{user.name}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm">Кофейня:</span>
            <span className="font-medium">{user.coffeeShopName}</span>
          </div>
        </div>
        
        {(user.role === "owner" || user.role === "manager") && user.employeeCount !== undefined && (
          <div className="flex items-center space-x-2">
            <Users size={16} className="text-muted-foreground" />
            <span className="text-sm">{user.employeeCount} сотрудников</span>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <span className="rounded-full bg-coffee-purple-light px-2 py-1 text-xs text-coffee-purple-dark">
            {user.role === "owner" 
              ? "Владелец" 
              : user.role === "manager"
                ? "Менеджер"
                : "Сотрудник"}
          </span>
        </div>
      </div>

      <Separator className="my-4" />

      <Button variant="outline" className="w-full" onClick={onLogout}>
        <LogOut size={16} className="mr-2" />
        Выйти
      </Button>
    </>
  );
};
