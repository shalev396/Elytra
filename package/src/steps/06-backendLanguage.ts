import inquirer from "inquirer";
import chalk from "chalk";
import { BackendLanguage, ProjectConfig } from "../types";
import { logger } from "../utils/logger";

interface LanguageOption {
  id: string;
  name: string;
  enabled: boolean;
}

// Define backend language options with enabled flag - just keep JS/TS enabled for simplicity
const backendLanguages: LanguageOption[] = [
  { id: "javascript", name: "JavaScript / TypeScript", enabled: true },
  { id: "python", name: "Python", enabled: false },
  { id: "java", name: "Java", enabled: false },
  { id: "php", name: "PHP", enabled: false },
  { id: "ruby", name: "Ruby", enabled: false },
  { id: "go", name: "Go", enabled: false },
  { id: "other", name: "Other", enabled: false },
];

interface BackendLanguageAnswers {
  backendLanguage: BackendLanguage;
}

/**
 * Get backend language from user
 * Sixth step in project creation that determines the backend programming language
 *
 * @param _config Unused parameter kept for consistent function signature
 * @returns Object containing selected backend language
 */
export async function getBackendLanguage(
  _config?: Partial<ProjectConfig>
): Promise<Partial<ProjectConfig>> {
  logger.header("Backend Language");

  // Format choices with colored disabled options
  const choices = backendLanguages.map((option) => ({
    name: option.enabled
      ? option.name
      : chalk.red(`${option.name} (coming soon)`),
    value: option.name as BackendLanguage,
    disabled: !option.enabled,
  }));

  const answers = await inquirer.prompt<BackendLanguageAnswers>([
    {
      type: "list",
      name: "backendLanguage",
      message: "What backend language would you like to use?",
      choices,
    },
  ]);

  // Log information about selected backend language
  if (answers.backendLanguage === "JavaScript / TypeScript") {
    logger.info("JavaScript / TypeScript selected as backend language");
  }

  return answers;
}
