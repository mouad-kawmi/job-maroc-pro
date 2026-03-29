import 'server-only';

import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __jobMarocProContentPool: Pool | undefined;
}

export function hasContentDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function requireContentDatabaseUrl(): string {
  const value = process.env.DATABASE_URL?.trim();

  if (!value) {
    throw new Error('DATABASE_URL is not configured.');
  }

  return value;
}

export function getContentPool(): Pool {
  if (!global.__jobMarocProContentPool) {
    global.__jobMarocProContentPool = new Pool({
      connectionString: requireContentDatabaseUrl(),
      max: 5,
    });
  }

  return global.__jobMarocProContentPool;
}
