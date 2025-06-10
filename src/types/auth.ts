
export type UserRole = "owner" | "employee" | "manager";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  coffeeShopName: string;
  employeeCount?: number;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Omit<User, "id"> & { password: string }) => Promise<void>;
  addEmployee: (userData: Omit<User, "id" | "coffeeShopName"> & { password: string }) => Promise<User>;
  getShopEmployees: () => Promise<User[]>;
}
