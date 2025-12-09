import dotenv from 'dotenv';
dotenv.config();

export function requireEnv(key) {
  if (!process.env[key]) {
    throw new Error(`환경 변수 누락: ${key}`);
  }
  return process.env[key];
}
