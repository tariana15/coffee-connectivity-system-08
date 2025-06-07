
import { supabase } from '../src/services/supabaseClient';
import fs from 'fs';
import path from 'path';

// Tables to export
const TABLES = [
  'products',
  'goods',
  'shifts',
  'sales',
  'menu_items',
  'recipes',
  'inventory_items',
  'recipe_ingredients'
];

/**
 * Export data from Supabase to SQLite format
 */
async function exportToSQLite() {
  console.log('Starting export to SQLite...');
  
  let sqliteScript = '';
  
  // Add SQLite pragmas
  sqliteScript += 'PRAGMA foreign_keys=OFF;\n';
  sqliteScript += 'BEGIN TRANSACTION;\n\n';
  
  for (const table of TABLES) {
    try {
      console.log(`Exporting table: ${table}`);
      
      // Get table data
      const { data, error } = await supabase
        .from(table)
        .select('*');
      
      if (error) {
        console.error(`Error fetching ${table}:`, error);
        continue;
      }
      
      if (!data || data.length === 0) {
        console.log(`No data found in ${table}`);
        continue;
      }
      
      // Create table SQL
      sqliteScript += `-- Table: ${table}\n`;
      sqliteScript += `DROP TABLE IF EXISTS ${table};\n`;
      
      // Get columns from first row
      const columns = Object.keys(data[0]);
      const columnDefs = columns.map(col => {
        if (col === 'id') return 'id TEXT PRIMARY KEY';
        if (col.includes('_at')) return `${col} TEXT`;
        if (typeof data[0][col] === 'number') return `${col} NUMERIC`;
        if (typeof data[0][col] === 'boolean') return `${col} INTEGER`;
        if (typeof data[0][col] === 'object') return `${col} TEXT`; // JSON fields
        return `${col} TEXT`;
      });
      
      sqliteScript += `CREATE TABLE ${table} (${columnDefs.join(', ')});\n`;
      
      // Insert data
      for (const row of data) {
        const values = columns.map(col => {
          if (row[col] === null) return 'NULL';
          if (typeof row[col] === 'string') return `'${row[col].replace(/'/g, "''")}'`;
          if (typeof row[col] === 'object') return `'${JSON.stringify(row[col]).replace(/'/g, "''")}'`;
          if (typeof row[col] === 'boolean') return row[col] ? '1' : '0';
          return row[col];
        });
        
        sqliteScript += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
      }
      
      sqliteScript += '\n';
    } catch (err) {
      console.error(`Error processing table ${table}:`, err);
    }
  }
  
  // Commit transaction
  sqliteScript += 'COMMIT;\n';
  sqliteScript += 'PRAGMA foreign_keys=ON;\n';
  
  // Write to file
  const outputDir = path.resolve('./exports');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join(outputDir, `supabase-export-${timestamp}.sql`);
  
  fs.writeFileSync(outputFile, sqliteScript);
  console.log(`Export complete! File saved to: ${outputFile}`);
  
  return outputFile;
}

// Run the export if this script is executed directly
if (require.main === module) {
  exportToSQLite()
    .then(filePath => console.log(`Successfully exported to ${filePath}`))
    .catch(err => console.error('Export failed:', err));
}

export { exportToSQLite };
