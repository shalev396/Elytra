/**
 * Frontend framework options
 */
export type Frontend =
  | "React"
  | "Vue.js"
  | "Angular"
  | "Svelte"
  | "Next.js"
  | "Nuxt.js"
  | "None (backend-only)";

/**
 * UI framework options
 */
export type UIFramework =
  | "Material UI"
  | "Chakra UI"
  | "Shadcn UI"
  | "Tailwind CSS"
  | "Vuetify"
  | "Angular Material"
  | "Svelte Material UI"
  | "None";

/**
 * Backend framework options
 */
export type Backend =
  | "Express.js"
  | "NestJS"
  | "Fastify"
  | "Serverless Functions"
  | "None (frontend-only)";

/**
 * Database options
 */
export type Database = "PostgreSQL" | "MySQL" | "MongoDB" | "SQLite" | "None";

/**
 * ORM/ODM options
 */
export type ORM = "Prisma" | "TypeORM" | "Sequelize" | "Mongoose" | "None";

/**
 * Authentication options
 */
export type Authentication =
  | "Email/Password"
  | "OAuth 2.0"
  | "JWT"
  | "Auth0"
  | "Firebase Authentication"
  | "None";

/**
 * Feature options
 */
export type Feature =
  | "rbac" // Role-based access control
  | "pricing" // Pricing/Subscription model
  | "api-docs" // API Documentation
  | "docker" // Docker setup
  | "ci-cd" // CI/CD setup
  | "linting" // ESLint and Prettier
  | "testing"; // Testing setup

/**
 * Deployment options
 */
export type Deployment =
  | "Vercel"
  | "Netlify"
  | "AWS"
  | "GCP"
  | "Azure"
  | "Digital Ocean"
  | "Heroku"
  | "Self-hosted"
  | "None";

/**
 * Package manager options
 */
export type PackageManager = "npm" | "yarn" | "pnpm";

/**
 * Project configuration
 */
export interface Config {
  projectName: string;
  projectDescription: string;
  packageManager: PackageManager;
  useTypeScript: boolean;
  frontend: Frontend;
  uiFramework?: UIFramework;
  backend: Backend;
  database?: Database;
  orm?: ORM;
  authentication?: Authentication;
  features?: Feature[];
  deployment: Deployment;
}
