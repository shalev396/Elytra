import fs from "fs-extra";
import path from "path";
import { ProjectConfig, SQLDatabase } from "../types";
import { logger } from "../utils/logger";

/**
 * Generate database configuration based on user selection
 * Copies appropriate database templates to the user's project
 *
 * @param config - The project configuration containing database selection
 * @param targetDir - The target directory where the database files will be generated
 */
export async function generateDatabase(
  config: ProjectConfig,
  targetDir: string
): Promise<void> {
  logger.header("Generating Database");

  try {
    const { projectType, database } = config;

    // Define template paths
    const templateBase = path.join(__dirname, "..", "templates");
    const projectTypeDir = projectType.toLowerCase().replace(/\s+/g, "-");

    // Build the path to the database template
    const templateDir = path.join(
      templateBase,
      projectTypeDir,
      "db",
      getDatabaseId(database)
    );

    // Create database directory in the target project
    const dbDir = path.join(targetDir, "database");

    // Check if template exists
    if (!fs.existsSync(templateDir)) {
      // For now, copy placeholder file
      const placeholderPath = path.join(
        templateBase,
        `${getDatabaseId(database)}.txt`
      );

      // Create database directory
      fs.ensureDirSync(dbDir);

      // Write placeholder content if real template doesn't exist
      if (fs.existsSync(placeholderPath)) {
        const content = fs.readFileSync(placeholderPath, "utf-8");
        fs.writeFileSync(path.join(dbDir, "README.md"), content);
        logger.success(`Generated database configuration for ${database}`);
      } else {
        // Create a simple README if no placeholder exists
        fs.writeFileSync(
          path.join(dbDir, "README.md"),
          `# ${database} Database\n\nThis is a placeholder for the ${database} database configuration.`
        );
        logger.warn(`No template found for ${database}. Created placeholder.`);
      }

      return;
    }

    // Copy template files to the target directory
    fs.copySync(templateDir, dbDir);

    logger.success(`Generated database configuration for ${database}`);
  } catch (error) {
    logger.error("Failed to generate database configuration", error);
    throw error;
  }
}

/**
 * Get database ID from the database name
 * Converts a database name to a standardized ID format
 *
 * @param database - The SQL database name
 * @returns A lowercase, hyphen-separated ID for the database
 */
function getDatabaseId(database: SQLDatabase): string {
  const idMap: Record<SQLDatabase, string> = {
    MySQL: "mysql",
    PostgreSQL: "postgresql",
    "Oracle Database": "oracle",
    "Microsoft SQL Server": "sqlserver",
    "IBM Db2": "db2",
  };

  return idMap[database] || database.toLowerCase().replace(/\s+/g, "-");
}
