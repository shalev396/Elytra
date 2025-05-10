import inquirer from "inquirer";
import { ProjectConfig } from "../types";
import { logger } from "../utils/logger";

interface ProjectInfoAnswers {
  projectName: string;
  projectDescription: string;
}

/**
 * Get project name and description from user
 * This is the first step in creating a new project
 *
 * @param _config Unused parameter kept for consistent function signature
 * @returns Object containing project name and description
 */
export async function getProjectInfo(
  _config?: Partial<ProjectConfig>
): Promise<Partial<ProjectConfig>> {
  logger.header("Project Information");

  const answers = await inquirer.prompt<ProjectInfoAnswers>([
    {
      type: "input",
      name: "projectName",
      message: "Project name:",
      validate: (input: string) => {
        if (input.trim() === "") {
          return "Project name is required";
        }

        if (!/^[a-z0-9-_]+$/.test(input)) {
          return "Project name can only contain lowercase letters, numbers, hyphens, and underscores";
        }

        return true;
      },
    },
    {
      type: "input",
      name: "projectDescription",
      message: "Project description:",
      validate: (input: string) => {
        if (input.trim() === "") {
          return "Project description is required";
        }
        return true;
      },
    },
  ]);

  return answers;
}
