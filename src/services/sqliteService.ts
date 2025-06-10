import Database from 'better-sqlite3';
import { DB_PATH } from './dbPath';
const db = new Database(DB_PATH);

export interface Good {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  created_at: string;
}

export interface Product {
  id: number;
  drink_type: string;
  drink_name: string;
  ingredients: string;
  preparation: string;
  price: number;
}

export interface Sale {
  id: number;
  shift_id: number;
  items: string; // JSON строка
  total: number;
  payment_method: string;
  status: string;
  created_at: string;
  customer_phone: string;
  bonus_applied: number;
  bonus_earned: number;
}

export interface Shift {
  id: number;
  is_open: boolean;
  opened_at: string;
  closed_at?: string;
  total_sales: number;
  transactions: number;
  coffee_count: number;
  food_count: number;
  created_at: string;
}

export interface Customer {
  id: number;
  phone: string;
  bonus_balance: number;
  created_at: string;
}

// SQL для создания таблицы customers:
// CREATE TABLE customers (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   phone TEXT UNIQUE NOT NULL,
//   bonus_balance INTEGER NOT NULL DEFAULT 0,
//   created_at DATETIME DEFAULT CURRENT_TIMESTAMP
// );

// GOODS
export function getGoods(): Good[] {
  return db.prepare('SELECT * FROM goods').all();
}

export function addGood(good: Omit<Good, 'id' | 'created_at'>): Good {
  const stmt = db.prepare(
    `INSERT INTO goods (name, category, quantity, unit, price, created_at)
     VALUES (@name, @category, @quantity, @unit, @price, datetime('now'))`
  );
  const info = stmt.run(good);
  return db.prepare('SELECT * FROM goods WHERE id = ?').get(info.lastInsertRowid);
}

// PRODUCTS
export function getProducts(): Product[] {
  return db.prepare('SELECT * FROM products').all();
}

export function addProduct(product: Omit<Product, 'id'>): Product {
  const stmt = db.prepare(
    `INSERT INTO products (drink_type, drink_name, ingredients, preparation, price)
     VALUES (@drink_type, @drink_name, @ingredients, @preparation, @price)`
  );
  const info = stmt.run(product);
  return db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid);
}

// SALES
export function getSales(shiftId: number): Sale[] {
  return db.prepare('SELECT * FROM sales WHERE shift_id = ?').all(shiftId);
}

export function addSale(sale: Omit<Sale, 'id' | 'created_at'>): Sale {
  const stmt = db.prepare(
    `INSERT INTO sales (shift_id, items, total, payment_method, status, created_at, customer_phone, bonus_applied, bonus_earned)
     VALUES (@shift_id, @items, @total, @payment_method, @status, datetime('now'), @customer_phone, @bonus_applied, @bonus_earned)`
  );
  const info = stmt.run(sale);
  return db.prepare('SELECT * FROM sales WHERE id = ?').get(info.lastInsertRowid);
}

// SHIFTS
export function getCurrentShift(): Shift | undefined {
  return db.prepare('SELECT * FROM shifts WHERE is_open = 1').get();
}

export function openShift(): Shift {
  const stmt = db.prepare(
    `INSERT INTO shifts (is_open, opened_at, total_sales, transactions, coffee_count, food_count, created_at)
     VALUES (1, datetime('now'), 0, 0, 0, 0, datetime('now'))`
  );
  const info = stmt.run();
  return db.prepare('SELECT * FROM shifts WHERE id = ?').get(info.lastInsertRowid);
}

export function updateShiftStats(shiftId: number, stats: {
  total_sales: number;
  transactions: number;
  coffee_count: number;
  food_count: number;
}): Shift {
  const stmt = db.prepare(
    `UPDATE shifts SET total_sales = @total_sales, transactions = @transactions, coffee_count = @coffee_count, food_count = @food_count WHERE id = @shiftId`
  );
  stmt.run({ ...stats, shiftId });
  return db.prepare('SELECT * FROM shifts WHERE id = ?').get(shiftId);
}

// CUSTOMERS
export function getCustomerByPhone(phone: string): Customer | undefined {
  return db.prepare('SELECT * FROM customers WHERE phone = ?').get(phone);
}

export function createOrGetCustomer(phone: string): Customer {
  let customer = getCustomerByPhone(phone);
  if (!customer) {
    db.prepare('INSERT INTO customers (phone, bonus_balance, created_at) VALUES (?, 0, datetime("now"))').run(phone);
    customer = getCustomerByPhone(phone);
  }
  return customer;
}

export function updateCustomerBonus(phone: string, delta: number): Customer {
  db.prepare('UPDATE customers SET bonus_balance = bonus_balance + ? WHERE phone = ?').run(delta, phone);
  return getCustomerByPhone(phone);
} 