import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadFunctions(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      loadFunctions(fullPath);
    } else if (file.endsWith('.js') && file !== 'index.js') {
      // Convert Windows path to file:// URL
      const fileUrl = pathToFileURL(fullPath).href;
      import(fileUrl);
    }
  });
}

loadFunctions(__dirname);
