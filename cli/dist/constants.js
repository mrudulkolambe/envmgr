import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let version = '1.0.0';
try {
    const packageJsonPath = join(__dirname, '../package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    version = packageJson.version;
}
catch (error) {
    // Fallback in case of error, though expected to be compiled to dist/constants.js 
    // from where package.json is in the parent dir.
}
export const VERSION = version;
export const DEFAULT_API_URL = "https://envmgr.vercel.app";
