import { promises as fs } from 'fs';

export async function writeJSON(path, data) {
  await fs.writeFile(path, JSON.stringify(data, null, 2));
}

export async function readJSON(path, defaultValue = {}) {
  try {
    const data = await fs.readFile(path, 'utf-8');
    return JSON.parse(data);
  } catch {
    await writeJSON(path, defaultValue);
    return defaultValue;
  }
}
