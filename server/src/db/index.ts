import { loadEnv } from '../config/loadEnv';
import logger from '../lib/logger';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { SQL, sql } from 'drizzle-orm';
import { Pool, PoolClient, QueryResult } from 'pg';
import * as schema from './schema';

loadEnv();

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT || 5432),
    database: process.env.POSTGRES_DB || 'openfamily',
    user: process.env.POSTGRES_USER || 'openfamily',
    password: process.env.POSTGRES_PASSWORD || 'changeme',
});

export const db = drizzle({ client: pool, schema });

/** Temporary Drizzle-backed SQL adapter for routes being migrated incrementally. */
export const query = async (text: string, params: any[] = []): Promise<QueryResult<any>> => {
    const startedAt = Date.now();
    const chunks: Array<SQL<unknown> | string> = [];
    let cursor = 0;
    const placeholder = /\$(\d+)/g;
    let match: RegExpExecArray | null;

    while ((match = placeholder.exec(text))) {
        chunks.push(text.slice(cursor, match.index));
        const value = params[Number(match[1]) - 1] ?? null;
        chunks.push(sql.param(value) as unknown as SQL<unknown>);
        cursor = match.index + match[0].length;
    }
    chunks.push(text.slice(cursor));

    const statement = sql.join(chunks.map((chunk) => typeof chunk === 'string' ? sql.raw(chunk) : chunk), sql.raw(''));
    try {
        const result = await db.execute(statement) as unknown as QueryResult<any>;
        logger.debug('db.query', {
            operation: text.trim().split(/\s+/)[0]?.toUpperCase() || 'UNKNOWN',
            durationMs: Date.now() - startedAt,
            rows: result.rowCount ?? 0,
            hasParams: params.length > 0,
        });
        return result;
    } catch (error) {
        logger.error('db.query_error', {
            operation: text.trim().split(/\s+/)[0]?.toUpperCase() || 'UNKNOWN',
            error: error instanceof Error ? error.message : String(error),
        });
        throw error;
    }
};

export const getClient = async () => {
    const client = await pool.connect();
    return client as PoolClient;
};

export const runMigrations = async () => {
    await migrate(db, {
        migrationsFolder: process.env.DRIZZLE_MIGRATIONS_FOLDER || './src/db',
    });
};

export default db;
