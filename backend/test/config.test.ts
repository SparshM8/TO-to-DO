import assert from 'node:assert/strict';
import test from 'node:test';
import { getJwtSecret, validateProductionConfig } from '../src/config';

const originalNodeEnv = process.env.NODE_ENV;
const originalJwtSecret = process.env.JWT_SECRET;

test.afterEach(() => {
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;
  if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = originalJwtSecret;
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

test('accepts a strong production JWT secret', () => {
  process.env.NODE_ENV = 'production';
  process.env.JWT_SECRET = 'a-production-secret-that-is-at-least-32-characters-long';

  assert.doesNotThrow(() => validateProductionConfig());
  assert.equal(getJwtSecret(), process.env.JWT_SECRET);
});
