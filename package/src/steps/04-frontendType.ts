import inquirer from "inquirer";
import chalk from "chalk";
import { FrontendType, ProjectConfig } from "../types";
import { logger } from "../utils/logger";

interface FrontendTypeOption {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

// Define frontend type options with enabled flag
const frontendTypeOptions: FrontendTypeOption[] = [
  {
    id: "spa",
    name: "SPA",
    description: "Single Page Application (React, Vue, Angular, etc.)",
    enabled: true,
  },
  {
    id: "ssr",
    name: "SSR",
    description: "Server-Side Rendering (Next.js, Nuxt, etc.)",
    enabled: true,
  },
  {
    id: "both",
    name: "Both",
    description: "Hybrid approach supporting both SPA and SSR",
    enabled: false,
  },
];

interface FrontendTypeAnswers {
  frontendType: FrontendType;
}

/**
 * Get frontend type from user
 * Fourth step in project creation that determines the frontend rendering approach
 *
 * @param _config Unused parameter kept for consistent function signature
 * @returns Object containing selected frontend type
 */
export async function getFrontendType(
  _config?: Partial<ProjectConfig>
): Promise<Partial<ProjectConfig>> {
  logger.header("Frontend Type");

  // Format choices with colored disabled options
  const choices = frontendTypeOptions.map((option) => ({
    name: option.enabled
      ? `${option.name} - ${option.description}`
      : chalk.red(`${option.name} - ${option.description} (coming soon)`),
    value: option.name as FrontendType,
    disabled: !option.enabled,
  }));

  const answers = await inquirer.prompt<FrontendTypeAnswers>([
    {
      type: "list",
      name: "frontendType",
      message: "What type of frontend are you building?",
      choices,
    },
  ]);

  // Log information about selected frontend type
  if (answers.frontendType === "SPA") {
    logger.info("Single Page Application (SPA) selected");
  } else if (answers.frontendType === "SSR") {
    logger.info("Server-Side Rendering (SSR) selected");
  }

  return answers;
}
