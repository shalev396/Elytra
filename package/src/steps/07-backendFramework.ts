import inquirer from "inquirer";
import chalk from "chalk";
import { JSBackendFramework, ProjectConfig, BackendLanguage } from "../types";
import { logger } from "../utils/logger";

interface FrameworkOption {
  id: string;
  name: string;
  language: string;
  enabled: boolean;
}

// Define backend framework options with enabled flag and language
const backendFrameworks: FrameworkOption[] = [
  // JavaScript/TypeScript Frameworks
  { id: "express", name: "Express.js", language: "javascript", enabled: true },
  { id: "koa", name: "Koa.js", language: "javascript", enabled: false },
  { id: "nestjs", name: "NestJS", language: "javascript", enabled: false },
  { id: "fastify", name: "Fastify", language: "javascript", enabled: false },
  { id: "hapi", name: "Hapi.js", language: "javascript", enabled: false },

  // Python Frameworks
  { id: "flask", name: "Flask", language: "python", enabled: true },
  { id: "django", name: "Django", language: "python", enabled: false },
  { id: "fastapi", name: "FastAPI", language: "python", enabled: false },

  // Java Frameworks
  { id: "spring", name: "Spring Boot", language: "java", enabled: true },
  { id: "quarkus", name: "Quarkus", language: "java", enabled: false },
];

interface BackendFrameworkAnswers {
  backendFramework: JSBackendFramework;
}

/**
 * Get backend framework from user
 * @param config Current partial configuration
 */
export async function getBackendFramework(
  config?: Partial<ProjectConfig>
): Promise<Partial<ProjectConfig>> {
  logger.header("Backend Framework");

  // Get the backend language from the config
  const backendLanguage = config?.backendLanguage || "JavaScript / TypeScript";

  // Convert the selected language to a simplified form for filtering
  const languageId = getLanguageId(backendLanguage);

  // Filter frameworks matching the selected language
  const filteredFrameworks = backendFrameworks.filter(
    (framework) => framework.language === languageId
  );

  // Format choices with colored disabled options
  const choices = filteredFrameworks.map((option) => ({
    name: option.enabled
      ? option.name
      : chalk.red(`${option.name} (coming soon)`),
    value: option.name as JSBackendFramework,
    disabled: !option.enabled,
  }));

  const answers = await inquirer.prompt<BackendFrameworkAnswers>([
    {
      type: "list",
      name: "backendFramework",
      message: `Which ${backendLanguage} framework would you like to use?`,
      choices,
    },
  ]);

  // Log information about selected backend framework
  logger.info(`${answers.backendFramework} selected as backend framework`);

  return answers;
}

/**
 * Convert backend language to simplified identifier
 */
function getLanguageId(language: BackendLanguage): string {
  const idMap: Record<BackendLanguage, string> = {
    "JavaScript / TypeScript": "javascript",
    Python: "python",
    Java: "java",
    PHP: "php",
    Ruby: "ruby",
    Go: "go",
    Other: "other",
  };

  return idMap[language] || "javascript";
}
