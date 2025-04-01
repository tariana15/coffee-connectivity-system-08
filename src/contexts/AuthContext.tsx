
import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType, User, UserRole } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users
const demoUsers: User[] = [
  {
    id: "1",
    name: "Владелец Кофейни",
    email: "owner@example.com",
    role: "owner" as UserRole,
    avatarUrl: "/avatars/owner.png",
    coffeeShopName: "Уютная Кофейня",
    employeeCount: 5
  },
  {
    id: "2",
    name: "Бариста Анна",
    email: "employee@example.com",
    role: "employee" as UserRole,
    avatarUrl: "/avatars/employee.png",
    coffeeShopName: "Уютная Кофейня"
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user
    const storedUser = localStorage.getItem("coffeeUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundUser = demoUsers.find(u => u.email === email);
      if (!foundUser) {
        throw new Error("Неверный email или пароль");
      }
      
      setUser(foundUser);
      localStorage.setItem("coffeeUser", JSON.stringify(foundUser));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Omit<User, "id"> & { password: string }) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if we already have users registered with this coffee shop
      const allUsers = localStorage.getItem("coffeeShopUsers");
      let coffeeShopUsers = allUsers ? JSON.parse(allUsers) : [];
      
      const newUser: User = {
        ...userData,
        id: Math.random().toString(36).substring(2, 11)
      };
      
      // Add user to coffee shop users list
      coffeeShopUsers.push({
        id: newUser.id,
        name: newUser.name,
        role: newUser.role,
        coffeeShopName: newUser.coffeeShopName
      });
      
      localStorage.setItem("coffeeShopUsers", JSON.stringify(coffeeShopUsers));
      setUser(newUser);
      localStorage.setItem("coffeeUser", JSON.stringify(newUser));
      
      // If this is a first-time shop, add a welcome message to the chat
      const savedMessages = localStorage.getItem("chatMessages");
      let allMessages = savedMessages ? JSON.parse(savedMessages) : [];
      
      // Check if we have any messages for this coffee shop already
      const hasShopMessages = allMessages.some(
        (message: any) => message.coffeeShopName === newUser.coffeeShopName
      );
      
      if (!hasShopMessages) {
        const welcomeMessage = {
          id: `welcome-${newUser.coffeeShopName}`,
          userId: "system",
          userName: "Система",
          content: `Кофейня "${newUser.coffeeShopName}" создана! Приглашайте сотрудников присоединиться, указав то же название кофейни при регистрации.`,
          timestamp: Date.now(),
          coffeeShopName: newUser.coffeeShopName
        };
        
        allMessages.push(welcomeMessage);
        localStorage.setItem("chatMessages", JSON.stringify(allMessages));
      }
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("coffeeUser");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
