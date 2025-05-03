
export type ShiftType = 'full' | 'half';

export interface Shift {
  date: number; // day of month
  type: ShiftType;
}

export interface Employee {
  id: number;
  name: string;
  shifts: Shift[];
}

export interface ShiftAssignment {
  day: number;
  employees: {
    id: number;
    name: string;
    type: ShiftType;
  }[];
}
