
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
}

export interface EmployeeSalary {
  name: string;
  shifts: EmployeeShift[];
  firstHalfTotal: number;
  secondHalfTotal: number;
  monthTotal: number;
}

export interface MonthlyData {
  month: string;
  year: string;
  days: number;
  revenues: number[];
  employees: EmployeeSalary[];
}
