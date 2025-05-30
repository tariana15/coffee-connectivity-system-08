
/**
 * Сервис для фискализации платежей
 */

import { OrderItem } from "@/types/inventory";

interface FiscalReceipt {
  id: string;
  items: OrderItem[];
  total: number;
  timestamp: Date;
  fiscalData: {
    fiscalSign: string;
    fiscalDocumentNumber: string;
    fiscalDriveNumber: string;
  };
}

export async function sendReceiptToFiscal(
  items: OrderItem[], 
  total: number
): Promise<{ success: boolean; fiscalData?: FiscalReceipt["fiscalData"] }> {
  try {
    console.log("Sending receipt to fiscal service...", {
      items,
      total,
      timestamp: new Date()
    });
    
    // Имитация ответа от API фискального сервиса
    // В реальном приложении здесь был бы API-запрос к фискальному сервису
    
    // Имитируем задержку запроса
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Генерируем фиктивные фискальные данные для демонстрации
    const fiscalData = {
      fiscalSign: generateRandomString(16),
      fiscalDocumentNumber: generateRandomString(8),
      fiscalDriveNumber: generateRandomString(12)
    };
    
    // В реальном приложении проверяли бы ответ от API
    return { 
      success: true, 
      fiscalData
    };
  } catch (error) {
    console.error("Error sending receipt to fiscal service:", error);
    return { success: false };
  }
}

// Генерация случайной строки для демонстрации
function generateRandomString(length: number): string {
  const chars = '0123456789ABCDEF';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Проверка статуса соединения
export function checkFiscalServiceConnection(): Promise<boolean> {
  return new Promise(resolve => {
    setTimeout(() => resolve(true), 300);
  });
}
