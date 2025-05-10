import inquirer from "inquirer";
import chalk from "chalk";
import { Platform, ProjectConfig } from "../types";
import { logger } from "../utils/logger";

interface PlatformOption {
  id: string;
  name: string;
  enabled: boolean;
}

// Define platform options with enabled flag
const platformOptions: PlatformOption[] = [
  { id: "web", name: "Web", enabled: true },
  { id: "desktop", name: "Desktop", enabled: false },
  { id: "mobile", name: "Mobile", enabled: false },
];

interface PlatformAnswers {
  platform: Platform;
}

/**
 * Get platform from user
 * Third step in project creation that determines the target platform
 *
 * @param _config Unused parameter kept for consistent function signature
 * @returns Object containing selected platform
 */
export async function getPlatform(
  _config?: Partial<ProjectConfig>
): Promise<Partial<ProjectConfig>> {
  logger.header("Platform");

  // Format choices with colored disabled options
  const choices = platformOptions.map((option) => ({
    name: option.enabled
      ? option.name
      : chalk.red(`${option.name} (coming soon)`),
    value: option.name as Platform,
    disabled: !option.enabled,
  }));

  const answers = await inquirer.prompt<PlatformAnswers>([
    {
      type: "list",
      name: "platform",
      message: "What platform are you targeting?",
      choices,
    },
  ]);

  // Log information about selected platform
  if (answers.platform === "Web") {
    logger.info("Web platform selected");
  }

  return answers;
}
