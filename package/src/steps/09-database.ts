import inquirer from "inquirer";
import chalk from "chalk";
import { ProjectConfig, SQLDatabase, DatabaseType } from "../types";
import { logger } from "../utils/logger";

interface DatabaseOption {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
}

// Define database options with enabled flag and database type
const databases: DatabaseOption[] = [
  // SQL Databases
  { id: "mysql", name: "MySQL", type: "sql", enabled: true },
  { id: "postgresql", name: "PostgreSQL", type: "sql", enabled: false },
  { id: "oracle", name: "Oracle Database", type: "sql", enabled: false },
  {
    id: "sqlserver",
    name: "Microsoft SQL Server",
    type: "sql",
    enabled: false,
  },
  { id: "db2", name: "IBM Db2", type: "sql", enabled: false },

  // Document-Oriented Databases
  { id: "mongodb", name: "MongoDB", type: "document", enabled: true },
  { id: "couchdb", name: "CouchDB", type: "document", enabled: false },
  {
    id: "firebase",
    name: "Firebase Firestore",
    type: "document",
    enabled: false,
  },

  // Key-Value Stores
  { id: "redis", name: "Redis", type: "key-value", enabled: true },
  { id: "memcached", name: "Memcached", type: "key-value", enabled: false },
];

interface DatabaseAnswers {
  database: SQLDatabase;
}

/**
 * Get database from user based on selected database type
 * @param config Current partial configuration
 */
export async function getDatabase(
  config?: Partial<ProjectConfig>
): Promise<Partial<ProjectConfig>> {
  logger.header("Database");

  // Get the database type from the config
  const databaseType = config?.databaseType || "SQL";

  // Convert the selected database type to a simplified form for filtering
  const typeId = getDatabaseTypeId(databaseType);

  // Filter databases matching the selected type
  const filteredDatabases = databases.filter(
    (database) => database.type === typeId
  );

  // Format choices with colored disabled options
  const choices = filteredDatabases.map((option) => ({
    name: option.enabled
      ? option.name
      : chalk.red(`${option.name} (coming soon)`),
    value: option.name as SQLDatabase,
    disabled: !option.enabled,
  }));

  const answers = await inquirer.prompt<DatabaseAnswers>([
    {
      type: "list",
      name: "database",
      message: `Which ${databaseType} would you like to use?`,
      choices,
    },
  ]);

  // Log information about selected database
  logger.info(`${answers.database} database selected`);

  return answers;
}

/**
 * Convert database type to simplified identifier
 */
function getDatabaseTypeId(databaseType: DatabaseType): string {
  const idMap: Record<DatabaseType, string> = {
    SQL: "sql",
    "Document-Oriented Databases": "document",
    "Key-Value Stores": "key-value",
    "Column-Oriented Databases": "column",
    "Graph Databases": "graph",
    "Time-Series Databases": "time-series",
    "Object-Oriented Databases": "object",
    "Hierarchical Databases": "hierarchical",
    "Network Databases": "network",
    "Cloud Databases": "cloud",
    "Multi-Model Databases": "multi-model",
    "NewSQL Databases": "newsql",
  };

  return idMap[databaseType] || "sql";
}
