import fs from "fs-extra";
import path from "path";
import { ProjectConfig, JSBackendFramework } from "../types";
import { logger } from "../utils/logger";

/**
 * Copy the backend files from templates to project directory
 */
export async function generateBackend(
  config: ProjectConfig,
  targetDir: string
): Promise<void> {
  logger.header("Generating Backend");

  try {
    const { projectType, backendLanguage, backendFramework } = config;

    // Define template paths
    const templateBase = path.join(__dirname, "..", "templates");
    const projectTypeDir = projectType.toLowerCase().replace(/\s+/g, "-");
    const backendLanguageDir = backendLanguage
      .toLowerCase()
      .replace(/\s+\/\s+/g, "-");

    // Build the path to the framework template
    const templateDir = path.join(
      templateBase,
      projectTypeDir,
      "backend",
      backendLanguageDir,
      getFrameworkId(backendFramework)
    );

    // Create backend directory in the target project
    const backendDir = path.join(targetDir, "backend");

    // Check if template exists
    if (!fs.existsSync(templateDir)) {
      // For now, copy placeholder file
      const placeholderPath = path.join(
        templateBase,
        `${getFrameworkId(backendFramework)}.txt`
      );

      // Create backend directory
      fs.ensureDirSync(backendDir);

      // Write placeholder content if real template doesn't exist
      if (fs.existsSync(placeholderPath)) {
        const content = fs.readFileSync(placeholderPath, "utf-8");
        fs.writeFileSync(path.join(backendDir, "README.md"), content);
        logger.success(`Generated backend with ${backendFramework}`);
      } else {
        // Create a simple README if no placeholder exists
        fs.writeFileSync(
          path.join(backendDir, "README.md"),
          `# ${backendFramework} Backend\n\nThis is a placeholder for the ${backendFramework} backend implementation.`
        );
        logger.warn(
          `No template found for ${backendFramework}. Created placeholder.`
        );
      }

      return;
    }

    // Copy template files to the target directory
    fs.copySync(templateDir, backendDir);

    logger.success(`Generated backend with ${backendFramework}`);
  } catch (error) {
    logger.error("Failed to generate backend", error);
    throw error;
  }
}

/**
 * Get framework ID from the framework name
 */
function getFrameworkId(framework: JSBackendFramework): string {
  const idMap: Record<JSBackendFramework, string> = {
    "Express.js": "express",
    "Koa.js": "koa",
    NestJS: "nestjs",
    Fastify: "fastify",
    "Hapi.js": "hapi",
    "Sails.js": "sails",
    "Feathers.js": "feathers",
    LoopBack: "loopback",
    "Total.js": "total",
    AdonisJS: "adonis",
    "Meteor.js": "meteor",
    "ActionHero.js": "actionhero",
  };

  return idMap[framework] || framework.toLowerCase().replace(/\s+|\.js$/g, "");
}
