import "dotenv/config";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/index";
import { getDb as getDbInstance, initDatabase, type DatabaseConfig } from "./init";

// Auto-initialize if DATABASE_URL is available (for backward compatibility)
let autoInitialized = false;
let dbInstance: NodePgDatabase<typeof schema> | null = null;
let poolInstance: Pool | null = null;

// Try to auto-initialize from environment variable
// Delay initialization for tests to ensure environment variables are set
if (process.env.DATABASE_URL && !(process.env.NODE_ENV === "test" || process.env.VITEST === "true")) {
  poolInstance = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    min: 2,
  });
  dbInstance = drizzle(poolInstance, { schema });
  autoInitialized = true;
}

/**
 * Gets the database instance
 * Auto-initializes from DATABASE_URL if available, otherwise uses initDatabase()
 */
function getDb(): NodePgDatabase<typeof schema> {
  // For tests, initialize lazily to ensure environment variables are set
  const isTest = process.env.NODE_ENV === "test" || process.env.VITEST === "true";
  if (isTest && !autoInitialized && process.env.DATABASE_URL) {
    poolInstance = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Use single connection for tests to avoid isolation issues
      max: 1,
      min: 1,
      // Ensure immediate visibility of committed data
      idleTimeoutMillis: 0,
      connectionTimeoutMillis: 5000,
      // Use proper timeout for test queries
      statement_timeout: 10000,
    });
    dbInstance = drizzle(poolInstance, { schema });
    autoInitialized = true;
  }
  
  if (autoInitialized && dbInstance) {
    return dbInstance;
  }
  // Try to get from init system
  try {
    return getDbInstance() as unknown as NodePgDatabase<typeof schema>;
  } catch (error) {
    throw new Error(
      "Database not initialized. Call initDatabase() first or set DATABASE_URL environment variable."
    );
  }
}

// Export db as a Proxy that forwards all calls to getDb()
// This allows repositories to continue using `import { db } from "../db/db"`
export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop) {
    const instance = getDb();
    const value = instance[prop as keyof typeof instance];
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});

// Export schema for use in migrations and queries
export { schema };

// Re-export initialization functions
export { initDatabase, closeDatabase, isDatabaseInitialized, type DatabaseConfig } from "./init";

