import inquirer from "inquirer";
import chalk from "chalk";
import { ProjectConfig, ProjectType } from "../types";
import { logger } from "../utils/logger";

interface ProjectTypeOption {
  id: string;
  name: string;
  enabled: boolean;
}

// Define project type options with enabled flag
const projectTypeOptions: ProjectTypeOption[] = [
  { id: "ecommerce", name: "E-Commerce", enabled: true },
  { id: "saas", name: "SaaS", enabled: false },
  { id: "cms", name: "CMS", enabled: false },
  { id: "social", name: "Social Network", enabled: false },
  { id: "portfolio", name: "Portfolio", enabled: false },
];

interface ProjectTypeAnswers {
  projectType: ProjectType;
}

/**
 * Get project type from user
 * Second step in project creation that determines the type of project to generate
 *
 * @param _config Unused parameter kept for consistent function signature
 * @returns Object containing selected project type
 */
export async function getProjectType(
  _config?: Partial<ProjectConfig>
): Promise<Partial<ProjectConfig>> {
  logger.header("Project Type");

  // Format choices with colored disabled options
  const choices = projectTypeOptions.map((option) => ({
    name: option.enabled
      ? option.name
      : chalk.red(`${option.name} (coming soon)`),
    value: option.name as ProjectType,
    disabled: !option.enabled,
  }));

  const answers = await inquirer.prompt<ProjectTypeAnswers>([
    {
      type: "list",
      name: "projectType",
      message: "What type of project are you building?",
      choices,
    },
  ]);

  // Log information about selected project type
  if (answers.projectType === "E-Commerce") {
    logger.info("E-Commerce project template selected");
  }

  return answers;
}
