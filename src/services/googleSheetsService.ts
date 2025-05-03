import { MonthlyData, EmployeeSalary, SalaryConstants, EmployeeShift, SalarySettings } from "@/types/salary";

// Default salary constants
const DEFAULT_SALARY_CONSTANTS: SalaryConstants = {
  baseRate: 2300,
  hourlyRate: 250,
  revenueThreshold: 7000,
  percentageBelow: 0.05, // 5%
  percentageAbove: 0.05  // 5%
};

// Function to fetch shifts count from localStorage
const getShiftsCountData = () => {
  try {
    const shiftsData = localStorage.getItem('coffeeShopShiftsCount');
    if (shiftsData) {
      return JSON.parse(shiftsData);
    }
    return null;
  } catch (error) {
    console.error("Error retrieving shifts data:", error);
    return null;
  }
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
      delivery: Math.random() > 0.8 ? Math.round(Math.random() * 1000) : 0,
      shiftType: worked ? 'full' : (isHours ? 'half' : undefined)
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
  
  // Try to get the shifts count data from localStorage
  const shiftsData = getShiftsCountData();
  
  // If we have shifts data for the current month, merge it with the mock data
  if (shiftsData && shiftsData.month === month && shiftsData.year === year) {
    // Map shifts count to the mock data employees
    const updatedEmployees = mockAprilData.employees.map(employee => {
      const employeeShifts = shiftsData.employees.find(e => e.name === employee.name);
      if (employeeShifts) {
        return {
          ...employee,
          shiftCount: employeeShifts.shiftCount
        };
      }
      return employee;
    });
    
    return {
      ...mockAprilData,
      employees: updatedEmployees
    };
  }
  
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
      // Adjust base rate based on shift type (full or half)
      const baseRate = shift.shiftType === 'half' ? constants.baseRate / 2 : constants.baseRate;
      dailySalary += baseRate;
      
      // Percentage from revenue - percentage from revenue above threshold
      if (revenue > constants.revenueThreshold) {
        dailySalary += constants.percentageBelow * (revenue - constants.revenueThreshold);
      }
    }
    
    // Hourly work (for Tatiana)
    if (shift.hours) {
      dailySalary += shift.hours * constants.hourlyRate;
    }
    
    // Delivery bonus - 36% of delivery amount
    if (shift.delivery) {
      dailySalary += shift.delivery * 0.36;
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

// Function to save salary settings for a shop
export const saveSalarySettings = (shopName: string, constants: SalaryConstants): void => {
  try {
    // Get existing settings
    const settingsData = localStorage.getItem('coffeeShopSalarySettings');
    let allSettings: SalarySettings[] = settingsData ? JSON.parse(settingsData) : [];
    
    // Find if settings for this shop already exist
    const shopIndex = allSettings.findIndex(setting => setting.shopName === shopName);
    
    if (shopIndex >= 0) {
      // Update existing settings
      allSettings[shopIndex].constants = constants;
    } else {
      // Add new settings
      allSettings.push({
        shopName,
        constants
      });
    }
    
    // Save back to localStorage
    localStorage.setItem('coffeeShopSalarySettings', JSON.stringify(allSettings));
  } catch (error) {
    console.error("Error saving salary settings:", error);
    throw error;
  }
};

// Function to get salary constants for a specific shop
export const getSalaryConstants = (shopName?: string): SalaryConstants => {
  try {
    if (!shopName) {
      return DEFAULT_SALARY_CONSTANTS;
    }
    
    // Get settings from localStorage
    const settingsData = localStorage.getItem('coffeeShopSalarySettings');
    if (!settingsData) {
      return DEFAULT_SALARY_CONSTANTS;
    }
    
    const allSettings: SalarySettings[] = JSON.parse(settingsData);
    const shopSettings = allSettings.find(setting => setting.shopName === shopName);
    
    return shopSettings?.constants || DEFAULT_SALARY_CONSTANTS;
  } catch (error) {
    console.error("Error retrieving salary constants:", error);
    return DEFAULT_SALARY_CONSTANTS;
  }
};

// Функция для импорта товаров из Google Sheets
export const importProductsFromSheet = async (sheetId: string, range: string): Promise<any[]> => {
  try {
    // Здесь будет реальный вызов Google Sheets API
    // Для демонстрации используем мок-данные
    const mockData = [
      { name: "Эспрессо", price: 150, category: "coffee" },
      { name: "Американо", price: 170, category: "coffee" },
      { name: "Капучино", price: 250, category: "coffee" }
    ];
    return mockData;
  } catch (error) {
    console.error("Ошибка при импорте товаров из Google Sheets:", error);
    throw error;
  }
};

// Функция для обновления товаров в кассе
export const updateCashRegisterProducts = async (products: any[]): Promise<void> => {
  try {
    // Сохраняем товары в localStorage
    localStorage.setItem('cashRegisterProducts', JSON.stringify(products));
  } catch (error) {
    console.error("Ошибка при обновлении товаров в кассе:", error);
    throw error;
  }
};

// Функция для сброса статистики продаж
export const resetSalesStatistics = (): void => {
  try {
    // Очищаем данные о продажах
    localStorage.removeItem('salesRecords');
    localStorage.removeItem('shiftStatistics');
  } catch (error) {
    console.error("Ошибка при сбросе статистики продаж:", error);
    throw error;
  }
};
