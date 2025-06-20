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
  },
  {
    id: "3",
    name: "Менеджер Иван",
    email: "manager@example.com",
    role: "manager" as UserRole,
    avatarUrl: "/avatars/owner.png",
    coffeeShopName: "Уютная Кофейня",
    employeeCount: 3
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Удалены все проверки на "инициализацию React"!
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("coffeeUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const users = localStorage.getItem("coffeeShopUsers");
      const allUsers = users ? JSON.parse(users) : [];
      let foundUser = allUsers.find((u: User) => u.email === email);
      if (!foundUser) {
        foundUser = demoUsers.find(u => u.email === email);
      }
      if (!foundUser) {
        throw new Error("Неверный email или пароль");
      }
      setUser(foundUser);
      localStorage.setItem("coffeeUser", JSON.stringify(foundUser));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Omit<User, "id"> & { password: string }) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const allUsers = localStorage.getItem("coffeeShopUsers");
      let coffeeShopUsers = allUsers ? JSON.parse(allUsers) : [];
      const avatarUrl = userData.avatarUrl || 
        (userData.role === "owner" || userData.role === "manager" ? "/avatars/owner.png" : "/avatars/employee.png");
      const newUser: User = {
        ...userData,
        avatarUrl,
        id: Math.random().toString(36).substring(2, 11)
      };
      coffeeShopUsers.push(newUser);
      localStorage.setItem("coffeeShopUsers", JSON.stringify(coffeeShopUsers));
      setUser(newUser);
      localStorage.setItem("coffeeUser", JSON.stringify(newUser));
      const savedMessages = localStorage.getItem("chatMessages");
      let allMessages = savedMessages ? JSON.parse(savedMessages) : [];
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
      setLoading(false);
    }
  };

  const addEmployee = async (userData: Omit<User, "id" | "coffeeShopName"> & { password: string }): Promise<User> => {
    setLoading(true);
    try {
      if (!user) {
        throw new Error("Вы должны быть авторизованы для добавления сотрудников");
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      const allUsers = localStorage.getItem("coffeeShopUsers");
      let coffeeShopUsers = allUsers ? JSON.parse(allUsers) : [];
      const existingUser = coffeeShopUsers.find((u: User) => u.email === userData.email);
      if (existingUser) {
        throw new Error("Пользователь с таким email уже существует");
      }
      const avatarUrl = userData.avatarUrl || 
        (userData.role === "manager" ? "/avatars/owner.png" : "/avatars/employee.png");
      const newUser: User = {
        ...userData,
        coffeeShopName: user.coffeeShopName,
        avatarUrl,
        id: Math.random().toString(36).substring(2, 11)
      };
      coffeeShopUsers.push(newUser);
      if (user.role === "owner" || user.role === "manager") {
        const updatedUser = {
          ...user,
          employeeCount: (user.employeeCount || 0) + 1
        };
        setUser(updatedUser);
        localStorage.setItem("coffeeUser", JSON.stringify(updatedUser));
        const userIndex = coffeeShopUsers.findIndex((u: User) => u.id === user.id);
        if (userIndex >= 0) {
          coffeeShopUsers[userIndex] = updatedUser;
        }
      }
      localStorage.setItem("coffeeShopUsers", JSON.stringify(coffeeShopUsers));
      return newUser;
    } catch (error) {
      console.error("Add employee error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getShopEmployees = async (): Promise<User[]> => {
    if (!user) {
      return [];
    }
    const allUsers = localStorage.getItem("coffeeShopUsers");
    const coffeeShopUsers = allUsers ? JSON.parse(allUsers) : [];
    return coffeeShopUsers.filter((u: User) => 
      u.coffeeShopName === user.coffeeShopName && u.id !== user.id
    );
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("coffeeUser");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      addEmployee, 
      getShopEmployees 
    }}>
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
