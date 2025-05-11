
-- This migration file provides a full schema backup for your Supabase database
-- It can be used to recreate the database structure locally or in a new environment

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS shifts;
DROP TABLE IF EXISTS recipe_ingredients;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS goods;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS inventory_items;

-- Create inventory_items table
CREATE TABLE inventory_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'normal',
  min_threshold NUMERIC,
  critical_threshold NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create menu_items table
CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create goods table
CREATE TABLE goods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create products table (for recipes)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drink_type TEXT NOT NULL,
  drink_name TEXT NOT NULL,
  ingredients TEXT NOT NULL,
  preparation TEXT NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create recipes table
CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create recipe_ingredients table
CREATE TABLE recipe_ingredients (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  inventory_item_id INTEGER NOT NULL REFERENCES inventory_items(id),
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create shifts table
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  is_open BOOLEAN NOT NULL DEFAULT true,
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
  closed_at TIMESTAMP WITH TIME ZONE,
  shift_date DATE NOT NULL,
  total_sales INTEGER NOT NULL DEFAULT 0,
  transactions INTEGER NOT NULL DEFAULT 0,
  coffee_count INTEGER NOT NULL DEFAULT 0,
  food_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create sales table
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID NOT NULL REFERENCES shifts(id),
  items JSONB NOT NULL,
  total INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL,
  bonus_applied INTEGER,
  customer_phone TEXT,
  bonus_earned INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS sales_shift_id_idx ON sales (shift_id);
CREATE INDEX IF NOT EXISTS recipe_ingredients_recipe_id_idx ON recipe_ingredients (recipe_id);
CREATE INDEX IF NOT EXISTS shifts_is_open_idx ON shifts (is_open);
