import fs from "fs";
import path from "path";
import chalk from "chalk";
import { execSync } from "child_process";
import { Config } from "../types";
import { generateFrontend } from "./frontend";
import { generateBackend } from "./backend";
import { generateDatabase } from "./database";
import { generateFeatures } from "./features";

/**
 * Generate a complete project based on configuration
 */
export async function generateProject(
  config: Config,
  targetDir: string
): Promise<void> {
  try {
    // Create project directory
    fs.mkdirSync(targetDir, { recursive: true });

    console.log(chalk.blue("📁 Creating project structure..."));

    // Generate the basic project structure
    generateBaseStructure(config, targetDir);

    // Generate frontend
    if (config.frontend !== "None (backend-only)") {
      console.log(chalk.blue(`🎨 Setting up ${config.frontend} frontend...`));
      await generateFrontend(config, path.join(targetDir, "frontend"));
    }

    // Generate backend
    if (config.backend !== "None (frontend-only)") {
      console.log(chalk.blue(`⚙️ Setting up ${config.backend} backend...`));
      await generateBackend(config, path.join(targetDir, "backend"));
    }

    // Generate database configuration
    if (config.database && config.database !== "None") {
      console.log(chalk.blue(`🗄️ Configuring ${config.database} database...`));
      await generateDatabase(
        config,
        config.backend !== "None (frontend-only)"
          ? path.join(targetDir, "backend")
          : targetDir
      );
    }

    // Generate additional features
    if (config.features && config.features.length > 0) {
      console.log(chalk.blue("✨ Adding additional features..."));
      await generateFeatures(config, targetDir);
    }

    // Generate root files
    generateRootFiles(config, targetDir);

    // Initialize git repository
    console.log(chalk.blue("🔄 Initializing git repository..."));
    initGitRepository(targetDir);

    console.log(chalk.green("✅ Project structure created successfully!"));
  } catch (error) {
    console.error(chalk.red("❌ Error generating project:"));
    console.error(error);
    throw error;
  }
}

/**
 * Generate the base structure for the project
 */
function generateBaseStructure(config: Config, targetDir: string): void {
  // Create directories
  const directories = ["frontend", "backend", "docs"];

  // Only create directories if needed
  if (config.frontend === "None (backend-only)") {
    directories.splice(directories.indexOf("frontend"), 1);
  }

  if (config.backend === "None (frontend-only)") {
    directories.splice(directories.indexOf("backend"), 1);
  }

  // Create each directory
  directories.forEach((dir) => {
    const dirPath = path.join(targetDir, dir);
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(chalk.gray(`Created directory: ${dir}`));
  });
}

/**
 * Generate root files for the project
 */
function generateRootFiles(config: Config, targetDir: string): void {
  // Generate package.json
  const packageJson = {
    name: config.projectName.toLowerCase().replace(/\s+/g, "-"),
    version: "0.1.0",
    description: config.projectDescription,
    private: true,
    scripts: {
      start: 'echo "Please check individual package scripts"',
    },
    workspaces: ["frontend", "backend"],
    author: "",
    license: "MIT",
  };

  // Adjust workspaces based on configuration
  if (config.frontend === "None (backend-only)") {
    packageJson.workspaces = packageJson.workspaces.filter(
      (ws) => ws !== "frontend"
    );
  }

  if (config.backend === "None (frontend-only)") {
    packageJson.workspaces = packageJson.workspaces.filter(
      (ws) => ws !== "backend"
    );
  }

  // Write package.json
  fs.writeFileSync(
    path.join(targetDir, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );
  console.log(chalk.gray("Created package.json"));

  // Generate README.md
  const readmeContent = `# ${config.projectName}

${config.projectDescription}

## Getting Started

### Prerequisites

- Node.js (v14+)
- ${config.packageManager}
${config.database && config.database !== "None" ? `- ${config.database}\n` : ""}

### Installation

1. Clone this repository
\`\`\`bash
git clone <repository-url>
cd ${config.projectName.toLowerCase().replace(/\s+/g, "-")}
\`\`\`

2. Install dependencies
\`\`\`bash
${config.packageManager} install
\`\`\`

3. Start development servers
\`\`\`bash
# In separate terminals:
${
  config.frontend !== "None (backend-only)"
    ? `# Frontend\n${config.packageManager} --filter=frontend run dev\n\n`
    : ""
}${
    config.backend !== "None (frontend-only)"
      ? `# Backend\n${config.packageManager} --filter=backend run dev`
      : ""
  }
\`\`\`

## Project Structure

\`\`\`
${config.projectName.toLowerCase().replace(/\s+/g, "-")}/
${
  config.frontend !== "None (backend-only)"
    ? "├── frontend/                # Frontend application\n"
    : ""
}${
    config.backend !== "None (frontend-only)"
      ? "├── backend/                 # Backend application\n"
      : ""
  }├── docs/                    # Documentation
├── package.json              # Root package.json
└── README.md                 # This file
\`\`\`

## License

This project is licensed under the MIT License
`;

  // Write README.md
  fs.writeFileSync(path.join(targetDir, "README.md"), readmeContent);
  console.log(chalk.gray("Created README.md"));

  // Generate .gitignore
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
.next/
.nuxt/

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

# Editor directories and files
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln
`;

  // Write .gitignore
  fs.writeFileSync(path.join(targetDir, ".gitignore"), gitignoreContent);
  console.log(chalk.gray("Created .gitignore"));
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
