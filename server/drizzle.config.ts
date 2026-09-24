import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env') });

const host = process.env.POSTGRES_HOST || 'localhost';
const port = process.env.POSTGRES_PORT || '5432';
const database = process.env.POSTGRES_DB || 'openfamily';
const user = process.env.POSTGRES_USER || 'openfamily';
const password = process.env.POSTGRES_PASSWORD || 'changeme';

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './src/db',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL || `postgres://${user}:${password}@${host}:${port}/${database}`,
    },
    casing: 'snake_case',
    introspect: {
        casing: 'preserve'
    },
    migrations: {
        table: '__drizzle_migrations',
        schema: 'public',
    },
});
