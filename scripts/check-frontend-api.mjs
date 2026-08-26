import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('frontend/app');
const violations = [];

async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await visit(entryPath);
      continue;
    }

    if (!/\.(tsx?|jsx?)$/.test(entry.name)) continue;
    const content = await readFile(entryPath, 'utf8');
    if (content.includes('localhost:3001')) violations.push(path.relative(process.cwd(), entryPath));
  }
}

await visit(root);
if (violations.length > 0) {
  console.error(`Hardcoded backend URL found in: ${violations.join(', ')}`);
  process.exit(1);
}

console.log('Frontend API URL check passed.');
