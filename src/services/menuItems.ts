
// Данные о товарах из таблицы Google Sheets
// С обновленными ценами и ассортиментом

export const MENU_ITEMS = [
  // Кофейные напитки с обновленными ценами
  { id: 1, name: "Эспрессо", price: 120, category: "coffee" },
  { id: 2, name: "Американо", price: 150, category: "coffee" },
  { id: 3, name: "Капучино", price: 200, category: "coffee" },
  { id: 4, name: "Латте", price: 250, category: "coffee" },
  { id: 5, name: "Раф", price: 280, category: "coffee" },
  { id: 6, name: "Флэт Уайт", price: 250, category: "coffee" },
  { id: 7, name: "Мокко", price: 280, category: "coffee" },
  { id: 8, name: "Карамель Макиато", price: 300, category: "coffee" },
  
  // Еда с ценами из таблицы
  { id: 9, name: "Круассан", price: 150, category: "food" },
  { id: 10, name: "Сэндвич", price: 250, category: "food" },
  { id: 11, name: "Маффин", price: 180, category: "food" },
  { id: 12, name: "Чизкейк", price: 300, category: "food" },
  { id: 13, name: "Печенье", price: 120, category: "food" },
  { id: 14, name: "Донат", price: 170, category: "food" }
];

export const getMenuItems = () => MENU_ITEMS;
