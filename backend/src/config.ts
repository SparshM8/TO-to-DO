const DEVELOPMENT_JWT_SECRET = 'to2do-development-only-secret-change-me';

export function getJwtSecret(): string {
  const configuredSecret = process.env.JWT_SECRET?.trim();
  if (configuredSecret) return configuredSecret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured in production.');
  }

  return DEVELOPMENT_JWT_SECRET;
}

export function validateProductionConfig(): void {
  if (process.env.NODE_ENV !== 'production') return;

  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production.');
  }

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl || !/^mongodb(?:\+srv)?:\/\//.test(databaseUrl)) {
    throw new Error('DATABASE_URL must be a MongoDB connection string in production.');
  }

  const frontendOrigins = process.env.FRONTEND_URL
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (!frontendOrigins || frontendOrigins.length === 0) {
    throw new Error('FRONTEND_URL must be configured in production.');
  }
}
