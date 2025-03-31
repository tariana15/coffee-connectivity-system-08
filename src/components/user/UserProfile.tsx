
import React from "react";
import { LogOut, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface UserProfileProps {
  onClose?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
  };

  return (
    <div className="p-4">
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
        
        {user.role === "owner" && user.employeeCount !== undefined && (
          <div className="flex items-center space-x-2">
            <Users size={16} className="text-muted-foreground" />
            <span className="text-sm">{user.employeeCount} сотрудников</span>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <span className="rounded-full bg-coffee-purple-light px-2 py-1 text-xs text-coffee-purple-dark">
            {user.role === "owner" ? "Владелец" : "Сотрудник"}
          </span>
        </div>
      </div>

      <Separator className="my-4" />

      <Button variant="outline" className="w-full" onClick={handleLogout}>
        <LogOut size={16} className="mr-2" />
        Выйти
      </Button>
    </div>
  );
};
