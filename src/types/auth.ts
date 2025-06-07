export type UserRole = "owner" | "manager" | "employee";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  coffeeShopName: string;
  employeeCount?: number;
  position?: string;
  hired_at?: string;
  password_hash?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<User, "id"> & { password: string }) => Promise<void>;
  logout: () => void;
  addEmployee: (userData: Omit<User, "id" | "coffeeShopName"> & { password: string }) => Promise<User>;
  getShopEmployees: () => Promise<User[]>;
}
