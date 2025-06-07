
#!/usr/bin/env node
require('dotenv').config();
const { execSync } = require('child_process');

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
  execSync('npx tsc --esModuleInterop scripts/import-data-from-csv.ts --outDir scripts/dist');
  console.log('Compilation successful!');
} catch (err) {
  console.error('Failed to compile TypeScript:', err.message);
  process.exit(1);
}

// Run the compiled JS file
console.log('Running import script...');
try {
  execSync('node scripts/dist/import-data-from-csv.js', { stdio: 'inherit' });
  console.log('Import completed successfully!');
} catch (err) {
  console.error('Import failed:', err.message);
  process.exit(1);
}
