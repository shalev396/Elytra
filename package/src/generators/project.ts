import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { execSync } from "child_process";
import { ProjectConfig } from "../types";
import { generateFrontend } from "./frontend";
import { generateBackend } from "./backend";
import { generateDatabase } from "./database";
import { logger } from "../utils/logger";

/**
 * Generate a complete project based on configuration
 */
export async function generateProject(
  config: ProjectConfig,
  targetDir: string
): Promise<void> {
  logger.header("Generating Project Structure");

  try {
    // Create project directory
    fs.ensureDirSync(targetDir);

    console.log(chalk.blue("📁 Creating project structure..."));

    // Generate the basic project structure
    await generateProjectRoot(config, targetDir);

    // Generate frontend
    console.log(
      chalk.blue(`🎨 Setting up ${config.frontendFramework} frontend...`)
    );
    await generateFrontend(config, targetDir);

    // Generate backend
    console.log(
      chalk.blue(`⚙️ Setting up ${config.backendFramework} backend...`)
    );
    await generateBackend(config, targetDir);

    // Generate database configuration
    console.log(chalk.blue(`🗄️ Configuring ${config.database} database...`));
    await generateDatabase(config, targetDir);

    // Initialize git repository
    console.log(chalk.blue("🔄 Initializing git repository..."));
    initGitRepository(targetDir);

    logger.success(`Project generated successfully at ${targetDir}`);
  } catch (error) {
    logger.error("Failed to generate project", error);
    throw error;
  }
}

/**
 * Generate the project root structure
 */
async function generateProjectRoot(
  config: ProjectConfig,
  targetDir: string
): Promise<void> {
  try {
    // Create project README.md
    const readmeContent = `# ${config.projectName}

${config.projectDescription}

## Project Structure

- \`frontend/\`: ${config.frontendFramework} frontend application
- \`backend/\`: ${config.backendFramework} backend application
- \`database/\`: ${config.database} database configuration

## Getting Started

### Frontend

\`\`\`bash
cd frontend
npm install
npm start
\`\`\`

### Backend

\`\`\`bash
cd backend
npm install
npm start
\`\`\`

## Technologies

- Frontend: ${config.frontendFramework}
- Backend: ${config.backendFramework}
- Database: ${config.database}
`;

    fs.writeFileSync(path.join(targetDir, "README.md"), readmeContent);

    // Create .gitignore
    const gitignoreContent = `# Dependencies
node_modules/
.pnp/
.pnp.js

# Testing
coverage/

# Production
build/
dist/
out/

# Misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.idea/
.vscode/
*.swp
*.swo
`;

    fs.writeFileSync(path.join(targetDir, ".gitignore"), gitignoreContent);

    // Create package.json for the project root
    const packageJsonContent = {
      name: config.projectName,
      version: "0.1.0",
      description: config.projectDescription,
      private: true,
      scripts: {
        start:
          'echo "Please cd into frontend or backend directory to start the respective applications"',
      },
    };

    fs.writeFileSync(
      path.join(targetDir, "package.json"),
      JSON.stringify(packageJsonContent, null, 2)
    );

    logger.success("Project root structure generated");
  } catch (error) {
    logger.error("Failed to generate project root structure", error);
    throw error;
  }
}

/**
 * Initialize a git repository
 */
function initGitRepository(targetDir: string): void {
  try {
    // Initialize git repository
    execSync("git init", { cwd: targetDir, stdio: "ignore" });

    // Add all files and make initial commit
    execSync("git add .", { cwd: targetDir, stdio: "ignore" });
    execSync('git commit -m "Initial commit from Elytra CLI"', {
      cwd: targetDir,
      stdio: "ignore",
      env: {
        ...process.env,
        GIT_COMMITTER_NAME: "Elytra CLI",
        GIT_COMMITTER_EMAIL: "cli@elytra.dev",
      },
    });

    console.log(chalk.gray("Initialized git repository with initial commit"));
  } catch (error) {
    console.warn(
      chalk.yellow(
        "Warning: Could not initialize git repository. Please initialize it manually."
      )
    );
  }
}
