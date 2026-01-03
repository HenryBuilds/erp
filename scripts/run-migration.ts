import { readFileSync } from "fs";
import { join } from "path";
import { Pool } from "pg";
import "dotenv/config";

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const migrationPath = join(process.cwd(), "src/drizzle/0003_acoustic_lightspeed.sql");
    const migrationSQL = readFileSync(migrationPath, "utf-8");

    console.log("Running migration 0003_acoustic_lightspeed.sql...");
    
    // Split by statement-breakpoint and execute each statement
    // Also handle statements that span multiple lines
    const statements = migrationSQL
      .split("--> statement-breakpoint")
      .map((s) => {
        // Remove comments but keep SQL statements
        return s
          .split("\n")
          .filter((line) => {
            const trimmed = line.trim();
            // Keep lines that are SQL (not pure comments)
            return trimmed.length > 0 && 
                   !trimmed.match(/^--\s*$/) && 
                   !(trimmed.startsWith("--") && !trimmed.match(/^--\s*(DELETE|ALTER|CREATE|DROP)/i));
          })
          .join("\n")
          .trim();
      })
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        const shortStatement = statement.substring(0, 100).replace(/\n/g, " ");
        console.log(`Executing: ${shortStatement}...`);
        try {
          await pool.query(statement);
          console.log(`  ✓ Success`);
        } catch (error: any) {
          // Ignore errors for objects that already exist
          if (
            error.code === "42710" || // duplicate object
            error.code === "42P07" || // duplicate table
            error.code === "42723"    // duplicate constraint
          ) {
            console.log(`  ⚠ Skipping (already exists): ${error.message}`);
            continue;
          }
          // Re-throw other errors
          console.error(`  ✗ Error: ${error.message}`);
          throw error;
        }
      }
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration().catch(console.error);

