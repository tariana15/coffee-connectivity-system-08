
export interface SalaryConstants {
  baseRate: number;
  hourlyRate: number;
  revenueThreshold: number;
  percentageBelow: number;
  percentageAbove: number;
}

export interface EmployeeShift {
  date: string;
  worked: boolean;
  percentage: number;
  hours?: number;
  delivery?: number;
  shiftType?: 'full' | 'half';
}

export interface EmployeeSalary {
  name: string;
  shifts: EmployeeShift[];
  firstHalfTotal: number;
  secondHalfTotal: number;
  monthTotal: number;
  shiftCount?: number;
}

export interface MonthlyData {
  month: string;
  year: string;
  days: number;
  revenues: number[];
  employees: EmployeeSalary[];
}

export interface ProductCategory {
  id: string;
  name: string;
  color: string;
}

export interface ProductIngredient {
  name: string;
  amount: number;
  unit: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  ingredients: ProductIngredient[];
}

export interface SalesData {
  categories: {
    name: string;
    value: number;
    color: string;
  }[];
  products: {
    id: string;
    name: string;
    quantity: number;
    category: string;
  }[];
}

export interface SalarySettings {
  shopName: string;
  constants: SalaryConstants;
}
