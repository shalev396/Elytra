import fs from "fs";
import path from "path";
import chalk from "chalk";
import { Config } from "../types";

/**
 * Generate additional features based on user selection
 */
export async function generateFeatures(
  config: Config,
  targetDir: string
): Promise<void> {
  if (!config.features || config.features.length === 0) {
    return;
  }

  console.log(chalk.blue("Generating additional features..."));

  // Generate each selected feature
  for (const feature of config.features) {
    switch (feature) {
      case "rbac":
        await generateRBAC(config, targetDir);
        break;
      case "pricing":
        await generatePricing(config, targetDir);
        break;
      case "api-docs":
        await generateApiDocs(config, targetDir);
        break;
      case "docker":
        await generateDocker(config, targetDir);
        break;
      case "ci-cd":
        await generateCICD(config, targetDir);
        break;
      case "linting":
        await generateLinting(config, targetDir);
        break;
      case "testing":
        await generateTesting(config, targetDir);
        break;
      default:
        console.warn(chalk.yellow(`Unknown feature: ${feature}`));
    }
  }

  console.log(chalk.green("Additional features generated successfully!"));
}

/**
 * Generate Role-Based Access Control (RBAC)
 */
async function generateRBAC(config: Config, _targetDir: string): Promise<void> {
  console.log(chalk.blue("Setting up Role-Based Access Control..."));

  // Only applicable if we have backend and authentication
  if (
    config.backend === "None (frontend-only)" ||
    !config.authentication ||
    config.authentication === "None"
  ) {
    console.log(
      chalk.yellow("RBAC requires backend and authentication. Skipping.")
    );
    return;
  }

  // To be implemented
  console.log(chalk.yellow("RBAC implementation not yet available"));
}

/**
 * Generate Pricing/Subscription model
 */
async function generatePricing(
  config: Config,
  _targetDir: string
): Promise<void> {
  console.log(chalk.blue("Setting up Pricing/Subscription model..."));

  // Only applicable if we have backend and authentication
  if (
    config.backend === "None (frontend-only)" ||
    !config.authentication ||
    config.authentication === "None"
  ) {
    console.log(
      chalk.yellow(
        "Pricing model requires backend and authentication. Skipping."
      )
    );
    return;
  }

  // To be implemented
  console.log(chalk.yellow("Pricing model implementation not yet available"));
}

/**
 * Generate API Documentation
 */
async function generateApiDocs(
  config: Config,
  targetDir: string
): Promise<void> {
  console.log(chalk.blue("Setting up API Documentation..."));

  // Only applicable if we have a backend
  if (config.backend === "None (frontend-only)") {
    console.log(
      chalk.yellow("API Documentation requires a backend. Skipping.")
    );
    return;
  }

  const backendDir = path.join(targetDir, "backend");

  // To be implemented
  console.log(
    chalk.yellow("API Documentation implementation not yet available")
  );

  // Add swagger dependencies to package.json
  try {
    const packageJsonPath = path.join(backendDir, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

      // Add swagger dependencies
      packageJson.dependencies = packageJson.dependencies || {};

      if (config.backend === "Express.js") {
        packageJson.dependencies["swagger-ui-express"] = "^5.0.0";
        packageJson.dependencies["swagger-jsdoc"] = "^6.2.8";

        if (config.useTypeScript) {
          packageJson.devDependencies = packageJson.devDependencies || {};
          packageJson.devDependencies["@types/swagger-ui-express"] = "^4.1.2";
          packageJson.devDependencies["@types/swagger-jsdoc"] = "^6.0.1";
        }
      } else if (config.backend === "NestJS") {
        packageJson.dependencies["@nestjs/swagger"] = "^7.0.0";
      } else if (config.backend === "Fastify") {
        packageJson.dependencies["@fastify/swagger"] = "^8.4.0";
        packageJson.dependencies["@fastify/swagger-ui"] = "^1.9.0";
      }

      // Write updated package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }
  } catch (error) {
    console.warn(
      chalk.yellow(
        "Warning: Could not update package.json with API documentation dependencies"
      )
    );
  }
}

/**
 * Generate Docker setup
 */
async function generateDocker(
  config: Config,
  targetDir: string
): Promise<void> {
  console.log(chalk.blue("Setting up Docker..."));

  // Generate Dockerfile
  const dockerfileContent = `# Use Node.js LTS version as the base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package.json and lockfile
COPY package.json ./
${
  config.packageManager === "yarn"
    ? "COPY yarn.lock ./"
    : config.packageManager === "pnpm"
    ? "COPY pnpm-lock.yaml ./"
    : "COPY package-lock.json ./"
}

# Install dependencies
${
  config.packageManager === "yarn"
    ? "RUN yarn install --frozen-lockfile"
    : config.packageManager === "pnpm"
    ? "RUN npm install -g pnpm && pnpm install --frozen-lockfile"
    : "RUN npm ci"
}

# Copy the rest of the code
COPY . .

# Build the application
${
  config.packageManager === "yarn"
    ? "RUN yarn build"
    : config.packageManager === "pnpm"
    ? "RUN pnpm build"
    : "RUN npm run build"
}

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy built artifacts from base stage
COPY --from=base /app/dist ./dist
COPY --from=base /app/package.json ./

# Install only production dependencies
${
  config.packageManager === "yarn"
    ? "COPY --from=base /app/yarn.lock ./\nRUN yarn install --production --frozen-lockfile"
    : config.packageManager === "pnpm"
    ? "COPY --from=base /app/pnpm-lock.yaml ./\nRUN npm install -g pnpm && pnpm install --prod --frozen-lockfile"
    : "COPY --from=base /app/package-lock.json ./\nRUN npm ci --production"
}

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]`;

  fs.writeFileSync(path.join(targetDir, "Dockerfile"), dockerfileContent);

  // Generate docker-compose.yml
  let dockerComposeContent = `version: '3'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production`;

  // Add database service if applicable
  if (config.database && config.database !== "None") {
    switch (config.database) {
      case "PostgreSQL":
        dockerComposeContent += `
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/mydatabase
    depends_on:
      - postgres
  
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=mydatabase
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - '5432:5432'`;
        break;
      case "MySQL":
        dockerComposeContent += `
      - DATABASE_URL=mysql://root:mysql@mysql:3306/mydatabase
    depends_on:
      - mysql
  
  mysql:
    image: mysql:8
    environment:
      - MYSQL_ROOT_PASSWORD=mysql
      - MYSQL_DATABASE=mydatabase
    volumes:
      - mysql-data:/var/lib/mysql
    ports:
      - '3306:3306'`;
        break;
      case "MongoDB":
        dockerComposeContent += `
      - MONGODB_URI=mongodb://mongodb:27017/mydatabase
    depends_on:
      - mongodb
  
  mongodb:
    image: mongo:6
    volumes:
      - mongodb-data:/data/db
    ports:
      - '27017:27017'`;
        break;
    }

    // Add volumes section if using a database
    if (config.database !== "SQLite") {
      dockerComposeContent += `

volumes:
  ${
    config.database === "PostgreSQL"
      ? "postgres-data:"
      : config.database === "MySQL"
      ? "mysql-data:"
      : "mongodb-data:"
  }`;
    }
  }

  fs.writeFileSync(
    path.join(targetDir, "docker-compose.yml"),
    dockerComposeContent
  );

  console.log(chalk.green("Docker setup generated successfully!"));
}

/**
 * Generate CI/CD setup
 */
async function generateCICD(config: Config, targetDir: string): Promise<void> {
  console.log(chalk.blue("Setting up CI/CD..."));

  // Create GitHub Actions workflows directory
  const workflowsDir = path.join(targetDir, ".github", "workflows");
  fs.mkdirSync(workflowsDir, { recursive: true });

  // Create CI workflow file
  const ciWorkflowContent = `name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: '${config.packageManager}'
    
    - name: Install dependencies
      run: ${
        config.packageManager === "yarn"
          ? "yarn install --frozen-lockfile"
          : config.packageManager === "pnpm"
          ? "npm install -g pnpm && pnpm install --frozen-lockfile"
          : "npm ci"
      }
    
    ${
      config.features && config.features.includes("linting")
        ? `- name: Lint
      run: ${
        config.packageManager === "yarn"
          ? "yarn lint"
          : config.packageManager === "pnpm"
          ? "pnpm lint"
          : "npm run lint"
      }\n    `
        : ""
    }${
    config.features && config.features.includes("testing")
      ? `- name: Test
      run: ${
        config.packageManager === "yarn"
          ? "yarn test"
          : config.packageManager === "pnpm"
          ? "pnpm test"
          : "npm test"
      }\n    `
      : ""
  }
    - name: Build
      run: ${
        config.packageManager === "yarn"
          ? "yarn build"
          : config.packageManager === "pnpm"
          ? "pnpm build"
          : "npm run build"
      }`;

  fs.writeFileSync(path.join(workflowsDir, "ci.yml"), ciWorkflowContent);

  // Create CD workflow file based on deployment platform
  if (config.deployment && config.deployment !== "None") {
    let cdWorkflowContent = `name: CD

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: '${config.packageManager}'
    
    - name: Install dependencies
      run: ${
        config.packageManager === "yarn"
          ? "yarn install --frozen-lockfile"
          : config.packageManager === "pnpm"
          ? "npm install -g pnpm && pnpm install --frozen-lockfile"
          : "npm ci"
      }
    
    - name: Build
      run: ${
        config.packageManager === "yarn"
          ? "yarn build"
          : config.packageManager === "pnpm"
          ? "pnpm build"
          : "npm run build"
      }
    
`;

    // Add deployment steps based on platform
    switch (config.deployment) {
      case "Vercel":
        cdWorkflowContent += `    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: \${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'`;
        break;
      case "Netlify":
        cdWorkflowContent += `    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v2
      with:
        publish-dir: './dist'
        production-branch: main
        deploy-message: 'Deploy from GitHub Actions'
      env:
        NETLIFY_AUTH_TOKEN: \${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: \${{ secrets.NETLIFY_SITE_ID }}`;
        break;
      case "AWS":
        cdWorkflowContent += `    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: \${{ secrets.AWS_REGION }}
    
    - name: Deploy to AWS
      run: aws s3 sync ./dist s3://\${{ secrets.AWS_S3_BUCKET }}`;
        break;
      case "Heroku":
        cdWorkflowContent += `    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.14
      with:
        heroku_api_key: \${{ secrets.HEROKU_API_KEY }}
        heroku_app_name: \${{ secrets.HEROKU_APP_NAME }}
        heroku_email: \${{ secrets.HEROKU_EMAIL }}`;
        break;
      default:
        console.log(
          chalk.yellow(
            `No CD workflow template available for ${config.deployment}`
          )
        );
        return;
    }

    fs.writeFileSync(path.join(workflowsDir, "cd.yml"), cdWorkflowContent);
  }

  console.log(chalk.green("CI/CD setup generated successfully!"));
}

/**
 * Generate Linting setup
 */
async function generateLinting(
  config: Config,
  targetDir: string
): Promise<void> {
  console.log(chalk.blue("Setting up ESLint and Prettier..."));

  // Create ESLint configuration
  const eslintContent = config.useTypeScript
    ? `{
  "root": true,
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2021,
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }]
  }
}`
    : `{
  "root": true,
  "extends": [
    "eslint:recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 2021,
    "sourceType": "module"
  },
  "rules": {
    "no-console": "warn"
  }
}`;

  fs.writeFileSync(path.join(targetDir, ".eslintrc.json"), eslintContent);

  // Create Prettier configuration
  const prettierContent = `{
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true
}`;

  fs.writeFileSync(path.join(targetDir, ".prettierrc"), prettierContent);

  // Update root package.json to include linting scripts
  try {
    const packageJsonPath = path.join(targetDir, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

      // Add lint scripts
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts["lint"] = "eslint .";
      packageJson.scripts["lint:fix"] = "eslint . --fix";
      packageJson.scripts["format"] = "prettier --write .";

      // Add dev dependencies
      packageJson.devDependencies = packageJson.devDependencies || {};
      packageJson.devDependencies["eslint"] = "^8.45.0";
      packageJson.devDependencies["prettier"] = "^3.0.0";

      if (config.useTypeScript) {
        packageJson.devDependencies["@typescript-eslint/eslint-plugin"] =
          "^6.0.0";
        packageJson.devDependencies["@typescript-eslint/parser"] = "^6.0.0";
      }

      // Write updated package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }
  } catch (error) {
    console.warn(
      chalk.yellow(
        "Warning: Could not update package.json with linting dependencies"
      )
    );
  }

  console.log(chalk.green("Linting setup generated successfully!"));
}

/**
 * Generate Testing setup
 */
async function generateTesting(
  config: Config,
  targetDir: string
): Promise<void> {
  console.log(chalk.blue("Setting up testing framework..."));

  // Set up Jest configuration
  const jestConfigContent = config.useTypeScript
    ? `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};`
    : `module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};`;

  fs.writeFileSync(path.join(targetDir, "jest.config.js"), jestConfigContent);

  // Create tests directory
  const testsDir = path.join(targetDir, "tests");
  fs.mkdirSync(testsDir, { recursive: true });

  // Update package.json to include testing scripts and dependencies
  try {
    const packageJsonPath = path.join(targetDir, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

      // Add test scripts
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts["test"] = "jest";
      packageJson.scripts["test:watch"] = "jest --watch";
      packageJson.scripts["test:coverage"] = "jest --coverage";

      // Add test dependencies
      packageJson.devDependencies = packageJson.devDependencies || {};
      packageJson.devDependencies["jest"] = "^29.6.1";

      if (config.useTypeScript) {
        packageJson.devDependencies["ts-jest"] = "^29.1.1";
        packageJson.devDependencies["@types/jest"] = "^29.5.3";
      }

      // Write updated package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }
  } catch (error) {
    console.warn(
      chalk.yellow(
        "Warning: Could not update package.json with testing dependencies"
      )
    );
  }

  console.log(chalk.green("Testing setup generated successfully!"));
}
