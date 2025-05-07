import inquirer from "inquirer";
import { Config } from "../types";

/**
 * Prompt the user for project configuration
 */
export async function promptUser(): Promise<Config> {
  // Basic project questions
  const basicAnswers = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "What is your project name?",
      validate: (input: string) =>
        input.trim() !== "" || "Project name is required",
    },
    {
      type: "input",
      name: "projectDescription",
      message: "What is your project description?",
      default: "A full-stack application",
    },
    {
      type: "list",
      name: "packageManager",
      message: "Which package manager would you like to use?",
      choices: ["npm", "yarn", "pnpm"],
      default: "npm",
    },
    {
      type: "confirm",
      name: "useTypeScript",
      message: "Would you like to use TypeScript?",
      default: true,
    },
  ]);

  // Frontend questions
  const frontendAnswers = await inquirer.prompt([
    {
      type: "list",
      name: "frontend",
      message: "Which frontend framework would you like to use?",
      choices: [
        "React",
        "Vue.js",
        "Angular",
        "Svelte",
        "Next.js",
        "Nuxt.js",
        "None (backend-only)",
      ],
    },
    {
      type: "list",
      name: "uiFramework",
      message: "Which UI framework would you like to use?",
      choices: (answers: any) => {
        if (answers.frontend === "React" || answers.frontend === "Next.js") {
          return [
            "Material UI",
            "Chakra UI",
            "Shadcn UI",
            "Tailwind CSS",
            "None",
          ];
        } else if (
          answers.frontend === "Vue.js" ||
          answers.frontend === "Nuxt.js"
        ) {
          return ["Vuetify", "Tailwind CSS", "None"];
        } else if (answers.frontend === "Angular") {
          return ["Angular Material", "Tailwind CSS", "None"];
        } else if (answers.frontend === "Svelte") {
          return ["Svelte Material UI", "Tailwind CSS", "None"];
        } else {
          return ["None"];
        }
      },
      when: (answers: any) => answers.frontend !== "None (backend-only)",
    },
  ]);

  // Backend questions
  const backendAnswers = await inquirer.prompt([
    {
      type: "list",
      name: "backend",
      message: "Which backend framework would you like to use?",
      choices: [
        "Express.js",
        "NestJS",
        "Fastify",
        "Serverless Functions",
        "None (frontend-only)",
      ],
    },
  ]);

  // Database questions
  const databaseAnswers: { database?: string; orm?: string } =
    await inquirer.prompt([
      {
        type: "list",
        name: "database",
        message: "Which database would you like to use?",
        choices: ["PostgreSQL", "MySQL", "MongoDB", "SQLite", "None"],
        when: () => backendAnswers.backend !== "None (frontend-only)",
      },
      {
        type: "list",
        name: "orm",
        message: "Which ORM/ODM would you like to use?",
        choices: (answers: any) => {
          if (answers.database === "MongoDB") {
            return ["Mongoose", "Prisma", "None"];
          } else if (
            answers.database === "PostgreSQL" ||
            answers.database === "MySQL" ||
            answers.database === "SQLite"
          ) {
            return ["Prisma", "TypeORM", "Sequelize", "None"];
          } else {
            return ["None"];
          }
        },
        when: () =>
          backendAnswers.backend !== "None (frontend-only)" &&
          databaseAnswers.database !== "None",
      },
    ]);

  // Authentication questions
  const authAnswers = await inquirer.prompt([
    {
      type: "list",
      name: "authentication",
      message: "Which authentication method would you like to use?",
      choices: [
        "Email/Password",
        "OAuth 2.0",
        "JWT",
        "Auth0",
        "Firebase Authentication",
        "None",
      ],
      when: () => backendAnswers.backend !== "None (frontend-only)",
    },
  ]);

  // Additional features
  const featureAnswers = await inquirer.prompt([
    {
      type: "checkbox",
      name: "features",
      message: "Which additional features would you like to add?",
      choices: [
        { name: "Role-based access control", value: "rbac" },
        { name: "Pricing/Subscription model", value: "pricing" },
        { name: "API Documentation (Swagger/OpenAPI)", value: "api-docs" },
        { name: "Docker setup", value: "docker" },
        { name: "CI/CD setup", value: "ci-cd" },
        { name: "ESLint and Prettier", value: "linting" },
        { name: "Testing setup (Jest, etc.)", value: "testing" },
      ],
    },
  ]);

  // Deployment questions
  const deploymentAnswers = await inquirer.prompt([
    {
      type: "list",
      name: "deployment",
      message: "Which deployment platform would you like to configure?",
      choices: [
        "Vercel",
        "Netlify",
        "AWS",
        "GCP",
        "Azure",
        "Digital Ocean",
        "Heroku",
        "Self-hosted",
        "None",
      ],
    },
  ]);

  // Confirmation
  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "Does this configuration look correct?",
      default: true,
    },
  ]);

  if (!confirm) {
    console.log("Configuration cancelled. Please try again.");
    return promptUser();
  }

  // Combine all answers into a single config object
  return {
    ...basicAnswers,
    ...frontendAnswers,
    ...backendAnswers,
    ...databaseAnswers,
    ...authAnswers,
    ...featureAnswers,
    ...deploymentAnswers,
  };
}
