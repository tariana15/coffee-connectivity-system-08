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
      setLoading(false);
    }
  };

  const register = async (userData: Omit<User, "id"> & { password: string }) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        ...userData,
        id: Math.random().toString(36).substring(2, 11)
      };
      
      setUser(newUser);
      localStorage.setItem("coffeeUser", JSON.stringify(newUser));
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("coffeeUser");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
