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
  // Safety check to ensure React is properly initialized before using hooks
  if (!React || !React.useState || !React.useEffect || !React.createContext) {
    console.warn('React not initialized in AuthProvider, returning children without auth context');
    return React.createElement('div', { className: 'auth-fallback' }, children);
  }

  // Additional check for React's internal state
  try {
    const reactInternals = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    if (!reactInternals || !reactInternals.ReactCurrentDispatcher) {
      console.warn('React internals not ready in AuthProvider, using fallback');
      return React.createElement('div', { className: 'auth-fallback' }, children);
    }
  } catch (error) {
    console.warn('AuthProvider initialization failed:', error);
    return React.createElement('div', { className: 'auth-fallback' }, children);
  }

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user
    const storedUser = localStorage.getItem("coffeeUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // First check if user exists in localStorage
      const users = localStorage.getItem("coffeeShopUsers");
      const allUsers = users ? JSON.parse(users) : [];
      
      // Check first in our regular users
      let foundUser = allUsers.find((u: User) => u.email === email);
      
      // If not found, check in demo users
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if we already have users registered with this coffee shop
      const allUsers = localStorage.getItem("coffeeShopUsers");
      let coffeeShopUsers = allUsers ? JSON.parse(allUsers) : [];
      
      // Assign a default avatar URL based on role
      const avatarUrl = userData.avatarUrl || 
        (userData.role === "owner" || userData.role === "manager" ? "/avatars/owner.png" : "/avatars/employee.png");
      
      const newUser: User = {
        ...userData,
        avatarUrl,
        id: Math.random().toString(36).substring(2, 11)
      };
      
      // Add user to coffee shop users list
      coffeeShopUsers.push(newUser);
      
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
      setLoading(false);
    }
  };

  const addEmployee = async (userData: Omit<User, "id" | "coffeeShopName"> & { password: string }): Promise<User> => {
    setLoading(true);
    try {
      if (!user) {
        throw new Error("Вы должны быть авторизованы для добавления сотрудников");
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get all users
      const allUsers = localStorage.getItem("coffeeShopUsers");
      let coffeeShopUsers = allUsers ? JSON.parse(allUsers) : [];
      
      // Check if user with this email already exists
      const existingUser = coffeeShopUsers.find((u: User) => u.email === userData.email);
      if (existingUser) {
        throw new Error("Пользователь с таким email уже существует");
      }
      
      // Create new user with same coffee shop name as current user
      const avatarUrl = userData.avatarUrl || 
        (userData.role === "manager" ? "/avatars/owner.png" : "/avatars/employee.png");
      
      const newUser: User = {
        ...userData,
        coffeeShopName: user.coffeeShopName,
        avatarUrl,
        id: Math.random().toString(36).substring(2, 11)
      };
      
      // Add user to coffee shop users list
      coffeeShopUsers.push(newUser);
      
      // Update employee count for owner
      if (user.role === "owner" || user.role === "manager") {
        const updatedUser = {
          ...user,
          employeeCount: (user.employeeCount || 0) + 1
        };
        
        // Update current user in state and storage
        setUser(updatedUser);
        localStorage.setItem("coffeeUser", JSON.stringify(updatedUser));
        
        // Update in the full list
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
    
    // Get all users
    const allUsers = localStorage.getItem("coffeeShopUsers");
    const coffeeShopUsers = allUsers ? JSON.parse(allUsers) : [];
    
    // Filter users by coffee shop name
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
