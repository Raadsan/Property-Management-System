import "dotenv/config";
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client.ts';

/**
 * Helper to parse DATABASE_URL since the generated client
 * is currently forced to use an adapter.
 */
function getDbConfig() {
    if (process.env.DB_HOST && process.env.DB_USER) {
        return {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        };
    }

    if (process.env.DATABASE_URL) {
        try {
            const url = new URL(process.env.DATABASE_URL);
            return {
                host: url.hostname,
                port: Number(url.port) || 3306,
                user: url.username,
                password: decodeURIComponent(url.password),
                database: url.pathname.replace('/', ''),
            };
        } catch (e) {
            console.error("❌ Failed to parse DATABASE_URL", e);
        }
    }
    return null;
}

const config = getDbConfig();
let prisma;

if (config) {
    console.log(`🔗 Connecting to database at ${config.host}:${config.port}...`);
    const adapter = new PrismaMariaDb({
        ...config,
        connectionLimit: 5,
        connectTimeout: 30000, // 30s timeout for stability on Render
        acquireTimeout: 30000  // Added acquire timeout to match connect timeout
    });

    prisma = new PrismaClient({
        adapter,
        transactionOptions: {
            timeout: 60000,
            maxWait: 60000
        }
    });
} else {
    console.error("❌ Database configuration missing!");
    process.exit(1);
}

export { prisma };