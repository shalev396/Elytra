import chalk from "chalk";
import path from "path";
import fs from "fs";

/**
 * Available frontend frameworks
 */
const FRONTEND_FRAMEWORKS = [
  "React",
  "Vue.js",
  "Angular",
  "Svelte",
  "Next.js",
  "Nuxt.js",
];

/**
 * Available backend frameworks
 */
const BACKEND_FRAMEWORKS = [
  "Express.js",
  "NestJS",
  "Fastify",
  "Serverless Functions",
];

/**
 * Available databases
 */
const DATABASES = ["PostgreSQL", "MySQL", "MongoDB", "SQLite"];

/**
 * Lists all available templates
 */
export function listTemplates(): void {
  console.log(chalk.bold("\nAvailable Frontend Frameworks:"));
  FRONTEND_FRAMEWORKS.forEach((framework) => {
    console.log(`  - ${chalk.cyan(framework)}`);
  });

  console.log(chalk.bold("\nAvailable Backend Frameworks:"));
  BACKEND_FRAMEWORKS.forEach((framework) => {
    console.log(`  - ${chalk.cyan(framework)}`);
  });

  console.log(chalk.bold("\nAvailable Databases:"));
  DATABASES.forEach((database) => {
    console.log(`  - ${chalk.cyan(database)}`);
  });

  // Check if custom templates directory exists
  const templatesDir = path.resolve(__dirname, "../../templates");
  if (fs.existsSync(templatesDir)) {
    console.log(chalk.bold("\nCustom Templates:"));
    try {
      const templates = fs
        .readdirSync(templatesDir)
        .filter((file) => file.endsWith(".json"));

      if (templates.length === 0) {
        console.log("  No custom templates found");
      } else {
        templates.forEach((template) => {
          console.log(`  - ${chalk.cyan(template.replace(".json", ""))}`);
        });
      }
    } catch (error) {
      console.error("  Error reading templates directory");
    }
  }

  console.log("\n");
}
