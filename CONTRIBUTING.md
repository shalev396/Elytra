# Contributing to Elytra

Thank you for considering contributing to Elytra! We welcome contributions from everyone, whether it's fixing a bug, adding a feature, improving documentation, or sharing feedback.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Pull Request Process](#pull-request-process)
5. [Adding Templates](#adding-templates)
6. [Coding Standards](#coding-standards)
7. [Testing](#testing)
8. [Documentation](#documentation)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to <!--[maintainers@elytra.dev](mailto:maintainers@elytra.dev).-->

## Getting Started

To get started with contributing to Elytra:

1. Fork the repository
2. Clone your fork to your local machine
   ```bash
   git clone https://github.com/your-username/Elytra.git
   cd Elytra
   ```
3. Install dependencies
   ```bash
   npm install
   ```
4. Create a new branch for your changes
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. Make your changes to the code.
2. Build the project to verify your changes
   ```bash
   npm run build
   ```
3. Test your changes
   ```bash
   npm test
   ```
4. Run the CLI locally to test it end-to-end
   ```bash
   npm run dev
   # or
   npm link
   elytra create
   ```

## Pull Request Process

1. Update the README.md or documentation with details of changes if needed
2. Update the CHANGELOG.md with your changes
3. Ensure all tests are passing
4. Submit a pull request to the `main` branch of the original repository
5. The maintainers will review your PR and may request changes
6. Once approved, your PR will be merged

## Adding Templates

When adding new templates to Elytra:

1. Place frontend templates in `package/src/templates/frontend/`
2. Place backend templates in `package/src/templates/backend/`
3. Place database templates in `package/src/templates/database/`
4. Place authentication templates in `package/src/templates/auth/`
5. Place feature templates in `package/src/templates/features/`

Templates should follow these guidelines:

- Use placeholders for project-specific values (e.g., `{{projectName}}`)
- Include a README.md file with usage instructions
- Provide comments where necessary to explain complex logic
- Follow the established directory structure and naming conventions

## Coding Standards

We follow these coding standards:

- **TypeScript**: Use TypeScript for all new code
- **Naming Conventions**:
  - Use kebab-case for filenames (e.g., `user-service.ts`)
  - Use PascalCase for classes and types (e.g., `UserService`)
  - Use camelCase for variables and functions (e.g., `getUserData`)
- **Code Style**:
  - Use ESLint and Prettier for code formatting
  - Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
  - Write self-documenting code with clear variable and function names
- **Imports**:
  - Group imports by type: core modules, third-party modules, local modules
  - Sort imports alphabetically within each group

## Testing

All new features and bug fixes should include tests:

1. Unit tests should be placed in the `tests/unit/` directory
2. Integration tests should be placed in the `tests/integration/` directory
3. Tests should use Jest as the testing framework
4. Test files should be named `*.test.ts` to match the file they're testing

## Documentation

Documentation is crucial for the usability of Elytra:

1. Add JSDoc comments to all functions and classes
2. Update the README.md with any new features or changes
3. Create or update documentation in the `docs/` directory
4. Provide examples for new features or templates

Thank you for contributing to Elytra!
