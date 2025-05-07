import chalk from "chalk";
import { promptUser } from "./prompts";
import { generateProject } from "../generators/project";
import { Config } from "../types";
import path from "path";
import fs from "fs";

interface CreateOptions {
  template?: string;
  config?: string;
}

/**
 * Create a new project based on user input or provided template/config
 */
export async function createProject(options: CreateOptions): Promise<void> {
  try {
    let config: Config;

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

      const configContent = fs.readFileSync(configPath, "utf-8");
      config = JSON.parse(configContent);
    } else if (options.template) {
      // Load template from file
      const templatePath = path.resolve(process.cwd(), options.template);
      console.log(chalk.blue(`📄 Loading template from ${templatePath}`));

      if (!fs.existsSync(templatePath)) {
        console.error(chalk.red(`❌ Template file not found: ${templatePath}`));
        process.exit(1);
      }

      const templateContent = fs.readFileSync(templatePath, "utf-8");
      config = JSON.parse(templateContent);
    } else {
      // Prompt user for configuration
      console.log(
        chalk.blue(
          "🔍 Please answer the following questions to set up your project:"
        )
      );
      config = await promptUser();
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
  } catch (error) {
    console.error(chalk.red("❌ An error occurred:"));
    console.error(error);
    process.exit(1);
  }
}
