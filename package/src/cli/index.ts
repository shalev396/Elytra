import chalk from "chalk";
import { ProjectConfig } from "../types";
import { generateProject } from "../generators";
import path from "path";
import fs from "fs";
import {
  getProjectInfo,
  getProjectType,
  getPlatform,
  getFrontendType,
  getFrontendFramework,
  getBackendLanguage,
  getBackendFramework,
  getDatabaseType,
  getDatabase,
} from "../steps";

interface CreateOptions {
  template?: string;
  config?: string;
}

/**
 * Create a new project based on user input or provided template/config
 */
export async function createProject(options: CreateOptions): Promise<void> {
  try {
    let config: ProjectConfig;

    if (options.config) {
      // Load configuration from file
      const configPath = path.resolve(process.cwd(), options.config);
      console.log(chalk.blue(`📄 Loading configuration from ${configPath}`));

      if (!fs.existsSync(configPath)) {
        console.error(
          chalk.red(`❌ Configuration file not found: ${configPath}`)
        );
        process.exit(1);
      }

      try {
        const configContent = fs.readFileSync(configPath, "utf-8");
        config = JSON.parse(configContent);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          chalk.red(`❌ Error parsing configuration file: ${errorMessage}`)
        );
        process.exit(1);
      }
    } else if (options.template) {
      // Load template from file
      const templatePath = path.resolve(process.cwd(), options.template);
      console.log(chalk.blue(`📄 Loading template from ${templatePath}`));

      if (!fs.existsSync(templatePath)) {
        console.error(chalk.red(`❌ Template file not found: ${templatePath}`));
        process.exit(1);
      }

      try {
        const templateContent = fs.readFileSync(templatePath, "utf-8");
        config = JSON.parse(templateContent);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          chalk.red(`❌ Error parsing template file: ${errorMessage}`)
        );
        process.exit(1);
      }
    } else {
      // Prompt user for configuration
      console.log(
        chalk.blue(
          "🔍 Please answer the following questions to set up your project:"
        )
      );

      // Creating a partial config object that will be built up step by step
      let partialConfig: Partial<ProjectConfig> = {};

      // Get all configuration steps, passing the current config to each step
      partialConfig = {
        ...partialConfig,
        ...(await getProjectInfo()),
      };

      partialConfig = {
        ...partialConfig,
        ...(await getProjectType(partialConfig)),
      };

      partialConfig = {
        ...partialConfig,
        ...(await getPlatform(partialConfig)),
      };

      partialConfig = {
        ...partialConfig,
        ...(await getFrontendType(partialConfig)),
      };

      partialConfig = {
        ...partialConfig,
        ...(await getFrontendFramework(partialConfig)),
      };

      partialConfig = {
        ...partialConfig,
        ...(await getBackendLanguage(partialConfig)),
      };

      partialConfig = {
        ...partialConfig,
        ...(await getBackendFramework(partialConfig)),
      };

      partialConfig = {
        ...partialConfig,
        ...(await getDatabaseType(partialConfig)),
      };

      partialConfig = {
        ...partialConfig,
        ...(await getDatabase(partialConfig)),
      };

      // Convert the partial config to a full config
      config = partialConfig as ProjectConfig;
    }

    // Create project directory
    const projectDir = path.resolve(process.cwd(), config.projectName);

    if (fs.existsSync(projectDir)) {
      console.error(chalk.red(`❌ Directory already exists: ${projectDir}`));
      process.exit(1);
    }

    // Generate project files
    console.log(chalk.blue(`🛠️ Generating project in ${projectDir}`));
    await generateProject(config, projectDir);

    console.log(chalk.green("✅ Project generated successfully!"));
    console.log(chalk.blue(`\nTo get started:\n`));
    console.log(chalk.white(`  cd ${config.projectName}`));
    console.log(chalk.white(`  npm install`));
    console.log(chalk.white(`  npm run dev`));
  } catch (error: unknown) {
    console.error(chalk.red("❌ An error occurred:"));
    console.error(error);
    process.exit(1);
  }
}
