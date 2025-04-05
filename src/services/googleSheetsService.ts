
import { MonthlyData, EmployeeSalary, SalaryConstants } from "@/types/salary";

// Google Sheets API endpoint would typically go here
// For demo purposes, we'll use mock data based on the spreadsheet image

const SALARY_CONSTANTS: SalaryConstants = {
  baseRate: 2300,
  hourlyRate: 250,
  revenueThreshold: 7000,
  percentageBelow: 0.05, // 5%
  percentageAbove: 0.06  // 6%
};

// Mock data based on the provided spreadsheet image
const mockAprilData: MonthlyData = {
  month: "Апрель",
  year: "2025",
  days: 30,
  revenues: [
    4541.00, 6524.00, 4578.00, 7297.00, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 8500.00, 9200.00, 8700.00, 9500.00, 8900.00,
    8600.00, 9100.00, 9300.00, 8800.00, 9400.00, 9600.00, 9700.00, 9800.00, 9900.00, 10000.00
  ],
  employees: [
    {
      name: "Василиса",
      shifts: generateMockShifts(30, ["раб", "", "раб", "раб", "раб", "", "", "раб", "раб", "", 
                                     "раб", "", "раб", "раб", "", "раб", "раб", "", "раб", "раб", 
                                     "", "раб", "раб", "раб", "", "раб", "", "раб", "раб", "раб"]),
      firstHalfTotal: 16464.85,
      secondHalfTotal: 18400.00,
      monthTotal: 34864.85
    },
    {
      name: "Александра",
      shifts: generateMockShifts(30, ["", "", "", "", "", "раб", "раб", "", "", "раб", 
                                     "", "раб", "", "", "раб", "", "", "раб", "", "", 
                                     "раб", "", "", "", "раб", "", "раб", "", "", ""]),
      firstHalfTotal: 9200.00,
      secondHalfTotal: 11500.00,
      monthTotal: 20700.00
    },
    {
      name: "Татьяна",
      shifts: generateMockShifts(30, ["", "0.5", "раб", "", "", "раб", "", "", "", "", 
                                     "", "", "", "раб", "", "", "", "", "", "раб", 
                                     "", "", "", "", "", "", "", "", "раб", ""],
                                true),
      firstHalfTotal: 7650.00,
      secondHalfTotal: 4600.00,
      monthTotal: 12250.00
    }
  ]
};

function generateMockShifts(days: number, workDays: string[], allowHours = false): EmployeeShift[] {
  return Array.from({ length: days }, (_, index) => {
    const day = index + 1;
    const worked = workDays[index] === "раб";
    const isHours = allowHours && !isNaN(parseFloat(workDays[index]));
    const hours = isHours ? parseFloat(workDays[index]) : undefined;
    
    return {
      date: `2025-04-${day.toString().padStart(2, '0')}`,
      worked: worked,
      percentage: worked ? Math.random() * 500 : 0,
      hours: hours,
      delivery: Math.random() > 0.8 ? Math.round(Math.random() * 1000) : 0
    };
  });
}

// Function to fetch salary data for a specific month
export const fetchSalaryData = async (month: string, year: string): Promise<MonthlyData> => {
  // In a real implementation, this would call the Google Sheets API
  // For demo purposes, we'll return mock data
  console.log(`Fetching salary data for ${month} ${year}`);
  
  // Here we would typically make an API call like:
  // const response = await fetch(`/api/sheets?month=${month}&year=${year}`);
  // const data = await response.json();
  
  return mockAprilData;
};

// Function to calculate employee salary based on provided rules
export const calculateSalary = (employee: EmployeeSalary, revenues: number[], constants: SalaryConstants): EmployeeSalary => {
  let firstHalfTotal = 0;
  let secondHalfTotal = 0;
  
  employee.shifts.forEach((shift, index) => {
    const revenue = revenues[index] || 0;
    let dailySalary = 0;
    
    // Base rate for showing up to work
    if (shift.worked) {
      dailySalary += constants.baseRate;
      
      // Percentage from revenue if above threshold
      if (revenue > constants.revenueThreshold) {
        dailySalary += revenue * (revenue > constants.revenueThreshold ? constants.percentageAbove : constants.percentageBelow);
      }
    }
    
    // Hourly work (for Tatiana)
    if (shift.hours) {
      dailySalary += shift.hours * constants.hourlyRate;
    }
    
    // Delivery bonus (minus 36%)
    if (shift.delivery) {
      dailySalary += shift.delivery * 0.64; // 100% - 36% = 64%
    }
    
    // Add to appropriate half-month total
    if (index < 15) {
      firstHalfTotal += dailySalary;
    } else {
      secondHalfTotal += dailySalary;
    }
  });
  
  return {
    ...employee,
    firstHalfTotal: Math.round(firstHalfTotal * 100) / 100,
    secondHalfTotal: Math.round(secondHalfTotal * 100) / 100,
    monthTotal: Math.round((firstHalfTotal + secondHalfTotal) * 100) / 100
  };
};

// Function to get salary constants
export const getSalaryConstants = (): SalaryConstants => {
  return SALARY_CONSTANTS;
};
