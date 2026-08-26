import assert from 'node:assert/strict';
import test from 'node:test';
import { getJwtSecret, validateProductionConfig } from '../src/config';

const originalNodeEnv = process.env.NODE_ENV;
const originalJwtSecret = process.env.JWT_SECRET;
const originalDatabaseUrl = process.env.DATABASE_URL;
const originalFrontendUrl = process.env.FRONTEND_URL;

test.afterEach(() => {
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;
  if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = originalJwtSecret;
  if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalDatabaseUrl;
  if (originalFrontendUrl === undefined) delete process.env.FRONTEND_URL;
  else process.env.FRONTEND_URL = originalFrontendUrl;
});

test('uses a development-only fallback when no JWT secret is configured', () => {
  process.env.NODE_ENV = 'development';
  delete process.env.JWT_SECRET;

  assert.equal(getJwtSecret(), 'to2do-development-only-secret-change-me');
  assert.doesNotThrow(() => validateProductionConfig());
});

test('fails fast for missing or weak production JWT secrets', () => {
  process.env.NODE_ENV = 'production';
  delete process.env.JWT_SECRET;
  assert.throws(() => validateProductionConfig(), /at least 32 characters/);

  process.env.JWT_SECRET = 'too-short';
  assert.throws(() => validateProductionConfig(), /at least 32 characters/);
});

test('rejects non-MongoDB production persistence configuration', () => {
  process.env.NODE_ENV = 'production';
  process.env.JWT_SECRET = 'a-production-secret-that-is-at-least-32-characters-long';
  process.env.DATABASE_URL = 'file:./dev.db';
  process.env.FRONTEND_URL = 'https://to2do.example.com';

  assert.throws(() => validateProductionConfig(), /MongoDB connection string/);
});

test('rejects missing production frontend origin', () => {
  process.env.NODE_ENV = 'production';
  process.env.JWT_SECRET = 'a-production-secret-that-is-at-least-32-characters-long';
  process.env.DATABASE_URL = 'mongodb://127.0.0.1:27017/to2do';
  delete process.env.FRONTEND_URL;

  assert.throws(() => validateProductionConfig(), /FRONTEND_URL/);
});

test('accepts a strong production secret and MongoDB configuration', () => {
  process.env.NODE_ENV = 'production';
  process.env.JWT_SECRET = 'a-production-secret-that-is-at-least-32-characters-long';
  process.env.DATABASE_URL = 'mongodb+srv://user:password@example.mongodb.net/to2do';
  process.env.FRONTEND_URL = 'https://to2do.example.com';

  assert.doesNotThrow(() => validateProductionConfig());
  assert.equal(getJwtSecret(), process.env.JWT_SECRET);
});
