--
-- Файл сгенерирован с помощью SQLiteStudio v3.4.17 в Сб июн 7 21:41:31 2025
--
-- Использованная кодировка текста: System
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Таблица: customers
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE NOT NULL,
    bonus_balance INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

-- Таблица: employees
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    position TEXT,
    hired_at DATETIME
);

-- Таблица: goods
CREATE TABLE IF NOT EXISTS goods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    unit TEXT,
    price REAL
);

-- Таблица: invoice_items
CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    good_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (good_id) REFERENCES goods(id)
);

-- Таблица: invoices
CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATETIME NOT NULL,
    employee_id INTEGER,
    total REAL,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Таблица: madbar
CREATE TABLE IF NOT EXISTS madbar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT
);

-- Таблица: product_goods
CREATE TABLE IF NOT EXISTS product_goods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    good_id INTEGER NOT NULL,
    quantity REAL NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (good_id) REFERENCES goods(id)
);

-- Таблица: products
CREATE TABLE IF NOT EXISTS products (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name TEXT NOT NULL,
       price REAL NOT NULL
   );

-- Таблица: sales
CREATE TABLE IF NOT EXISTS sales (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       shift_id INTEGER NOT NULL,
       product_id INTEGER NOT NULL,
       quantity INTEGER NOT NULL,
       total_price REAL NOT NULL,
       created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );

-- Таблица: sales_items
CREATE TABLE IF NOT EXISTS sales_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Таблица: shifts
CREATE TABLE IF NOT EXISTS shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    employee_id INTEGER,
    status TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Таблица: statistics
CREATE TABLE IF NOT EXISTS statistics (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       shift_id INTEGER NOT NULL,
       total_sales REAL NOT NULL,
       total_products INTEGER NOT NULL,
       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (shift_id) REFERENCES shifts(id)
   );

-- Индекс: idx_statistics_shift_id
CREATE INDEX IF NOT EXISTS idx_statistics_shift_id ON statistics(shift_id);

-- Представление: sales_details
CREATE VIEW IF NOT EXISTS sales_details AS
   SELECT 
       s.id as sale_id,
       s.shift_id,
       p.name as product_name,
       s.quantity,
       s.total_price,
       s.created_at
   FROM sales s
   JOIN products p ON s.product_id = p.id;

-- Триггер: update_statistics_after_sale
CREATE TRIGGER IF NOT EXISTS update_statistics_after_sale
   AFTER INSERT ON sales
   BEGIN
       UPDATE statistics 
       SET total_sales = total_sales + NEW.total_price,
           total_products = total_products + NEW.quantity
       WHERE shift_id = NEW.shift_id;
   END;

COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
