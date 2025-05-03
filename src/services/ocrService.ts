
import { toast } from "sonner";

// Типы для результатов OCR
interface OCRResult {
  number?: string;
  date?: string;
  amount?: string;
  items?: {
    name: string;
    category: string;
    quantity: number;
    price: number;
  }[];
}

// Константы для тестового распознавания - в реальном приложении здесь будет интеграция с API
const CATEGORY_MAPPINGS: Record<string, string> = {
  "молоко": "Молоко и сливки",
  "сливки": "Молоко и сливки",
  "кофе": "Кофе",
  "стакан": "Стаканы",
  "крышка": "Стаканы",
  "сироп": "Сиропы",
  "сахар": "Продукты",
  "печенье": "Выпечка",
  "круассан": "Выпечка",
  "маффин": "Выпечка",
};

/**
 * Эмуляция распознавания накладной из изображения
 * В реальном приложении здесь будет интеграция с OCR-сервисом (Google ML Kit, Tesseract и т.д.)
 */
export const recognizeInvoiceFromImage = async (file: File): Promise<OCRResult> => {
  // Имитация запроса к OCR-сервису с задержкой
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        // Получаем имя файла
        const fileName = file.name.toLowerCase();
        
        // В реальной реализации здесь был бы анализ изображения с использованием ML
        // Пока используем заглушку с фиксированными данными, имитирующими распознавание реальной накладной
        
        // Данные фиксированной накладной №1 (можно расширить набор распознаваемых накладных)
        // Это имитация результатов OCR для накладной, которую пользователь загрузил
        const mockInvoiceData = {
          "PE00025108": {
            number: "PE00025108",
            date: "2025-04-13",
            amount: "3120.48",
            items: [
              {
                name: 'Молоко "МОЛОЧНАЯ РЕЧКА" 3,2%, 12шт/0,973л',
                category: "Молоко и сливки",
                quantity: 24,
                price: 2131.92
              },
              {
                name: 'Молоко ультрап. безлактозное "БМК" 1,8%, 975мл',
                category: "Молоко и сливки",
                quantity: 2,
                price: 196.56
              },
              {
                name: 'Сливки "МОЛОЧНАЯ РЕЧКА" 11%, 1л',
                category: "Молоко и сливки",
                quantity: 4,
                price: 792.00
              }
            ]
          },
          "default": {
            number: "3903",
            date: "2025-04-04",
            amount: "1754.11",
            items: [
              {
                name: "Сироп ванильный",
                category: "Сиропы",
                quantity: 1,
                price: 778
              },
              {
                name: "Кофе в зернах",
                category: "Кофе",
                quantity: 1,
                price: 316
              },
              {
                name: "Сливки 10%",
                category: "Молоко и сливки",
                quantity: 9,
                price: 1090
              },
              {
                name: "Маффины",
                category: "Выпечка",
                quantity: 4,
                price: 114
              }
            ]
          }
        };
        
        // Выбираем данные в зависимости от имени файла или метаданных
        // В реальном приложении здесь будет анализ содержимого файла через OCR
        let result: OCRResult;
        
        // По умолчанию используем второй набор данных
        result = mockInvoiceData.default;
        
        // Для демонстрации: если имя файла содержит "pe" или определенные цифры, 
        // используем первый набор данных (как будто OCR распознал номер накладной)
        if (fileName.includes("pe") || fileName.includes("25108")) {
          result = mockInvoiceData.PE00025108;
        }
        
        // Возвращаем результат распознавания
        resolve(result);
      } catch (error) {
        console.error("Error in OCR:", error);
        toast("Ошибка распознавания");
        // В случае ошибки возвращаем пустой результат
        resolve({});
      }
    }, 1500); // Имитация задержки 1.5 секунды для обработки
  });
};

/**
 * Функция для интеграции с Google ML Kit
 * Это заглушка, в реальном приложении здесь будет интеграция с нативным SDK
 */
export const setupGoogleMlKit = async () => {
  console.log("Google ML Kit initialization would happen here");
  // В реальном приложении здесь будет инициализация ML Kit
  
  // Для Android:
  // Добавить Google ML Kit в build.gradle и инициализировать распознаватель текста
  
  // Для iOS:
  // Добавить ML Kit в Podfile и инициализировать распознаватель текста
  
  return {
    isAvailable: true,
    version: "1.0.0"
  };
};

/**
 * Проверка существования накладной по номеру
 */
export const checkInvoiceExists = (invoiceNumber: string): boolean => {
  try {
    const savedInvoices = localStorage.getItem("invoices");
    if (!savedInvoices) return false;
    
    const invoices = JSON.parse(savedInvoices);
    return invoices.some((invoice: any) => invoice.number === invoiceNumber);
  } catch (error) {
    console.error("Error checking invoice existence:", error);
    return false;
  }
};

/**
 * Сохранение накладной в "базу данных" (localStorage)
 */
export const saveInvoiceToDatabase = (invoice: any): boolean => {
  try {
    const savedInvoices = localStorage.getItem("invoices") || "[]";
    const invoices = JSON.parse(savedInvoices);
    
    invoices.push({
      ...invoice,
      id: Date.now().toString(),
      verified: false
    });
    
    localStorage.setItem("invoices", JSON.stringify(invoices));
    return true;
  } catch (error) {
    console.error("Error saving invoice:", error);
    return false;
  }
};
