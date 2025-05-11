
import { supabase } from '../src/services/supabaseClient';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Function to import goods from CSV
async function importGoodsFromCSV(filePath: string) {
  try {
    console.log(`Importing goods from ${filePath}...`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse CSV content
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    // Prepare data for insertion
    const goods = records.map((record: any) => ({
      name: record.name,
      category: record.category,
      quantity: parseFloat(record.quantity),
      unit: record.unit,
      price: parseFloat(record.price)
    }));
    
    // Insert into goods table
    const { data, error } = await supabase
      .from('goods')
      .insert(goods)
      .select();
    
    if (error) {
      console.error('Error importing goods:', error);
      return;
    }
    
    console.log(`Successfully imported ${data.length} goods`);
  } catch (error) {
    console.error('Error importing goods from CSV:', error);
  }
}

// Function to import recipes from CSV
async function importRecipesFromCSV(filePath: string) {
  try {
    console.log(`Importing recipes from ${filePath}...`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse CSV content
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    // Prepare data for insertion
    const recipes = records.map((record: any) => {
      // Extract price and convert to number
      let priceStr = record['Цена'] || '0';
      priceStr = priceStr.replace(/[^\d.,]/g, '').replace(',', '.');
      const price = parseFloat(priceStr) || 0;
      
      return {
        drink_type: record['#Вид напитка'] || '',
        drink_name: record['#Название'] || '',
        ingredients: record['#Ингредиенты'] || '',
        preparation: record['#Приготовление'] || '',
        price: price
      };
    });
    
    // Insert into products table
    const { data, error } = await supabase
      .from('products')
      .insert(recipes)
      .select();
    
    if (error) {
      console.error('Error importing recipes:', error);
      return;
    }
    
    console.log(`Successfully imported ${data.length} recipes`);
  } catch (error) {
    console.error('Error importing recipes from CSV:', error);
  }
}

// Main function to run imports
async function runImports() {
  // Import goods
  const goodsCsvPath = path.resolve('./Товары - Лист1 (2).csv');
  if (fs.existsSync(goodsCsvPath)) {
    await importGoodsFromCSV(goodsCsvPath);
  } else {
    console.log(`Goods CSV file not found at ${goodsCsvPath}`);
  }
  
  // Import recipes
  const recipesCsvPath = path.resolve('./Технологическая карта Первомайская - Лист1 (3).csv');
  if (fs.existsSync(recipesCsvPath)) {
    await importRecipesFromCSV(recipesCsvPath);
  } else {
    console.log(`Recipes CSV file not found at ${recipesCsvPath}`);
  }
  
  console.log('Import process completed!');
}

// Run the imports if this script is executed directly
if (require.main === module) {
  runImports()
    .then(() => console.log('All imports completed successfully'))
    .catch(err => console.error('Import failed:', err));
}

export { importGoodsFromCSV, importRecipesFromCSV, runImports };
