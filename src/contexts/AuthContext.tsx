import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType, User, UserRole } from "@/types/auth";
import { getUserByEmail, verifyPassword, createUser, getShopEmployees as fetchShopEmployees, updateEmployeeCount } from "@/services/sqliteService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users
const demoUsers: User[] = [
  {
    id: 1,
    name: "Владелец Кофейни",
    email: "owner@example.com",
    role: "owner" as UserRole,
    avatarUrl: "/avatars/owner.png",
    coffeeShopName: "Уютная Кофейня",
    employeeCount: 5
  },
  {
    id: 2,
    name: "Бариста Анна",
    email: "employee@example.com",
    role: "employee" as UserRole,
    avatarUrl: "/avatars/employee.png",
    coffeeShopName: "Уютная Кофейня"
  },
  {
    id: 3,
    name: "Менеджер Иван",
    email: "manager@example.com",
    role: "manager" as UserRole,
    avatarUrl: "/avatars/owner.png",
    coffeeShopName: "Уютная Кофейня",
    employeeCount: 3
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем сохраненного пользователя
    const storedUser = localStorage.getItem("coffeeUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const foundUser = getUserByEmail(email);
      
      if (!foundUser) {
        throw new Error("Неверный email или пароль");
      }

      const isValidPassword = verifyPassword(password, foundUser.password_hash || '');
      if (!isValidPassword) {
        throw new Error("Неверный email или пароль");
      }
      
      localStorage.setItem("employeeId", foundUser.id.toString());
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
      const newUser = createUser(userData);
      
      localStorage.setItem("employeeId", newUser.id.toString());
      setUser(newUser);
      localStorage.setItem("coffeeUser", JSON.stringify(newUser));
      
      // const welcomeMessage = {
      //   id: `welcome-${newUser.coffeeShopName}`,
      //   userId: "system",
      //   userName: "Система",
      //   content: `Кофейня "${newUser.coffeeShopName}" создана! Приглашайте сотрудников присоединиться, указав то же название кофейни при регистрации.`,
      //   timestamp: Date.now(),
      //   coffeeShopName: newUser.coffeeShopName
      // };
      
      // await addMessageToDatabase(welcomeMessage);
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
      
      const newUser = createUser({
        ...userData,
        coffeeShopName: user.coffeeShopName,
      });
      
      if (user.role === "owner" || user.role === "manager") {
        const newCount = (user.employeeCount || 0) + 1;
        updateEmployeeCount(user.id, newCount);
        
        const updatedUser = {
          ...user,
          employeeCount: newCount
        };
        
        setUser(updatedUser);
        localStorage.setItem("coffeeUser", JSON.stringify(updatedUser));
      }
      
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
    
    return fetchShopEmployees(user.coffeeShopName);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("coffeeUser");
    localStorage.removeItem("employeeId");
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
