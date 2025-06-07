
#!/usr/bin/env node
require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if TypeScript is installed
try {
  execSync('npx tsc --version', { stdio: 'ignore' });
} catch (err) {
  console.error('TypeScript is not installed. Please install it with: npm install -g typescript');
  process.exit(1);
}

// Compile the TypeScript file
console.log('Compiling TypeScript...');
try {
  execSync('npx tsc --esModuleInterop scripts/export-to-sqlite.ts --outDir scripts/dist');
  console.log('Compilation successful!');
} catch (err) {
  console.error('Failed to compile TypeScript:', err.message);
  process.exit(1);
}

// Run the compiled JS file
console.log('Running export script...');
try {
  execSync('node scripts/dist/export-to-sqlite.js', { stdio: 'inherit' });
  console.log('Export completed successfully!');
  console.log('\nYou can now import the generated SQL file in SQLiteStudio 3.4.17.');
  console.log('1. Open SQLiteStudio');
  console.log('2. Create a new database or open an existing one');
  console.log('3. Go to Tools > Import > SQL file');
  console.log('4. Select the exported SQL file from the "exports" folder');
  console.log('5. Follow the import wizard steps');
} catch (err) {
  console.error('Export failed:', err.message);
  process.exit(1);
}
