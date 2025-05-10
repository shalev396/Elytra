import inquirer from "inquirer";
import chalk from "chalk";
import { DatabaseType, ProjectConfig } from "../types";
import { logger } from "../utils/logger";

interface DatabaseTypeOption {
  id: string;
  name: string;
  enabled: boolean;
}

// Define database type options with enabled flag - just keep SQL enabled for simplicity
const databaseTypeOptions: DatabaseTypeOption[] = [
  { id: "sql", name: "SQL", enabled: true },
  { id: "document", name: "Document-Oriented Databases", enabled: false },
  { id: "key-value", name: "Key-Value Stores", enabled: false },
  { id: "column", name: "Column-Oriented Databases", enabled: false },
  { id: "graph", name: "Graph Databases", enabled: false },
  { id: "time-series", name: "Time-Series Databases", enabled: false },
  { id: "object", name: "Object-Oriented Databases", enabled: false },
  { id: "hierarchical", name: "Hierarchical Databases", enabled: false },
  { id: "network", name: "Network Databases", enabled: false },
  { id: "cloud", name: "Cloud Databases", enabled: false },
  { id: "multi-model", name: "Multi-Model Databases", enabled: false },
  { id: "newsql", name: "NewSQL Databases", enabled: false },
];

interface DatabaseTypeAnswers {
  databaseType: DatabaseType;
}

/**
 * Get database type from user
 * Eighth step in project creation that determines the database type
 *
 * @param _config Unused parameter kept for consistent function signature
 * @returns Object containing selected database type
 */
export async function getDatabaseType(
  _config?: Partial<ProjectConfig>
): Promise<Partial<ProjectConfig>> {
  logger.header("Database Type");

  // Format choices with colored disabled options
  const choices = databaseTypeOptions.map((option) => ({
    name: option.enabled
      ? option.name
      : chalk.red(`${option.name} (coming soon)`),
    value: option.name as DatabaseType,
    disabled: !option.enabled,
  }));

  const answers = await inquirer.prompt<DatabaseTypeAnswers>([
    {
      type: "list",
      name: "databaseType",
      message: "What type of database would you like to use?",
      choices,
    },
  ]);

  // Log information about selected database type
  if (answers.databaseType === "SQL") {
    logger.info("SQL database type selected");
  }

  return answers;
}
