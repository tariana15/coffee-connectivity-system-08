-- Проверяем существование таблицы
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    position TEXT,
    hired_at DATETIME,
    email TEXT UNIQUE,
    password_hash TEXT,
    role TEXT CHECK (role IN ('owner', 'manager', 'employee')),
    avatar_url TEXT,
    coffee_shop_name TEXT,
    employee_count INTEGER DEFAULT 0
);

-- Создаем индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_coffee_shop ON employees(coffee_shop_name);

-- Добавляем демо-пользователей только если их еще нет
INSERT INTO employees (
    name, 
    position, 
    email, 
    password_hash, 
    role, 
    avatar_url, 
    coffee_shop_name, 
    employee_count, 
    hired_at
)
SELECT 
    'Владелец Кофейни', 
    'owner', 
    'owner@example.com', 
    '$2a$10$X7UrH5YxX5YxX5YxX5YxX.5YxX5YxX5YxX5YxX5YxX5YxX5YxX', 
    'owner', 
    '/avatars/owner.png', 
    'Уютная Кофейня', 
    5, 
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM employees WHERE email = 'owner@example.com'
);

INSERT INTO employees (
    name, 
    position, 
    email, 
    password_hash, 
    role, 
    avatar_url, 
    coffee_shop_name, 
    employee_count, 
    hired_at
)
SELECT 
    'Бариста Анна', 
    'barista', 
    'employee@example.com', 
    '$2a$10$X7UrH5YxX5YxX5YxX5YxX.5YxX5YxX5YxX5YxX5YxX5YxX5YxX', 
    'employee', 
    '/avatars/employee.png', 
    'Уютная Кофейня', 
    NULL, 
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM employees WHERE email = 'employee@example.com'
);

INSERT INTO employees (
    name, 
    position, 
    email, 
    password_hash, 
    role, 
    avatar_url, 
    coffee_shop_name, 
    employee_count, 
    hired_at
)
SELECT 
    'Менеджер Иван', 
    'manager', 
    'manager@example.com', 
    '$2a$10$X7UrH5YxX5YxX5YxX5YxX.5YxX5YxX5YxX5YxX5YxX5YxX5YxX', 
    'manager', 
    '/avatars/owner.png', 
    'Уютная Кофейня', 
    3, 
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM employees WHERE email = 'manager@example.com'
); 