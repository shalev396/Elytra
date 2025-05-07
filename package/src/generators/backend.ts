import fs from "fs";
import path from "path";
import chalk from "chalk";
import { Config } from "../types";

/**
 * Generate backend code based on configuration
 */
export async function generateBackend(
  config: Config,
  targetDir: string
): Promise<void> {
  // Create backend directory if it doesn't exist
  fs.mkdirSync(targetDir, { recursive: true });

  console.log(chalk.blue(`Generating ${config.backend} backend...`));

  // Generate backend based on selected framework
  switch (config.backend) {
    case "Express.js":
      await generateExpressBackend(config, targetDir);
      break;
    case "NestJS":
      // @ts-ignore - will implement proper parameters later
      await generateNestBackend(config, targetDir);
      break;
    case "Fastify":
      // @ts-ignore - will implement proper parameters later
      await generateFastifyBackend(config, targetDir);
      break;
    case "Serverless Functions":
      // @ts-ignore - will implement proper parameters later
      await generateServerlessBackend(config, targetDir);
      break;
    default:
      throw new Error(`Unsupported backend framework: ${config.backend}`);
  }

  console.log(chalk.green(`Backend generated successfully!`));
}

/**
 * Generate Express.js backend
 */
async function generateExpressBackend(
  config: Config,
  targetDir: string
): Promise<void> {
  // To be implemented
  console.log(
    chalk.yellow("Express.js backend generation not yet implemented")
  );

  // Create the src directory
  const srcDir = path.join(targetDir, "src");
  fs.mkdirSync(srcDir, { recursive: true });

  // Create a basic package.json
  const packageJson: {
    name: string;
    version: string;
    private: boolean;
    scripts: Record<string, string>;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  } = {
    name: "backend",
    version: "0.1.0",
    private: true,
    scripts: {
      start: "node dist/index.js",
      dev: "nodemon src/index.js",
      build: "tsc",
    },
    dependencies: {
      express: "^4.18.2",
      cors: "^2.8.5",
      dotenv: "^16.3.1",
    },
    devDependencies: {
      nodemon: "^3.0.1",
    },
  };

  // Add TypeScript if selected
  if (config.useTypeScript) {
    packageJson.devDependencies["typescript"] = "^5.1.6";
    packageJson.devDependencies["@types/express"] = "^4.17.17";
    packageJson.devDependencies["@types/cors"] = "^2.8.13";
    packageJson.devDependencies["@types/node"] = "^20.4.5";
    packageJson.scripts["dev"] = "nodemon --exec ts-node src/index.ts";
    packageJson.devDependencies["ts-node"] = "^10.9.1";
  }

  // Write package.json
  fs.writeFileSync(
    path.join(targetDir, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  // Create a basic index file
  const indexFileName = config.useTypeScript ? "index.ts" : "index.js";
  const indexFileContent = `${
    config.useTypeScript
      ? 'import express from "express";\nimport cors from "cors";\nimport dotenv from "dotenv";\n\n'
      : 'const express = require("express");\nconst cors = require("cors");\nconst dotenv = require("dotenv");\n\n'
  }// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Start server
app.listen(port, () => {
  console.log(\`Server running on port \${port}\`);
});
${config.useTypeScript ? "\nexport default app;" : "\nmodule.exports = app;"}`;

  // Write index file
  fs.writeFileSync(path.join(srcDir, indexFileName), indexFileContent);
}

/**
 * Generate NestJS backend
 */
async function generateNestBackend(): Promise<void> {
// Commenting out unused parameters for now; will be used in future implementation
// config: Config,
// targetDir: string
  // To be implemented
  console.log(chalk.yellow("NestJS backend generation not yet implemented"));
}

/**
 * Generate Fastify backend
 */
async function generateFastifyBackend(): Promise<void> {
// Commenting out unused parameters for now; will be used in future implementation
// config: Config,
// targetDir: string
  // To be implemented
  console.log(chalk.yellow("Fastify backend generation not yet implemented"));
}

/**
 * Generate Serverless backend
 */
async function generateServerlessBackend(): Promise<void> {
// Commenting out unused parameters for now; will be used in future implementation
// config: Config,
// targetDir: string
  // To be implemented
  console.log(
    chalk.yellow("Serverless backend generation not yet implemented")
  );
}
