# Elytra

Elytra is a command-line interface (CLI) tool designed to streamline the initialization of full-stack projects. By prompting users with a series of questions regarding their preferred frontend and backend technologies, Elytra generates a tailored project structure equipped with the necessary configurations and dependencies.

<p align="center">
  <img src="assets/elytra-logo.png" alt="Elytra Logo" width="200" />
</p>

[![npm version](https://img.shields.io/npm/v/@shalev396/elytra.svg)](https://www.npmjs.com/package/@shalev396/elytra)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/shalev396/Elytra/blob/main/CONTRIBUTING.md)

## 🚀 Features

- **Interactive CLI**: User-friendly command-line interface that guides you through project setup
- **Technology Selection**: Choose from various frontend frameworks, backend technologies, and databases
- **Modular Templates**: Templates are modular and can be combined based on your selections
- **Authentication Options**: Set up authentication with email/password, OAuth, JWT, and more
- **Database Integration**: Configure your project with PostgreSQL, MySQL, MongoDB, or SQLite
- **Development Tools**: Automatically set up ESLint, Prettier, Jest, and other development tools
- **Deployment Configuration**: Generate deployment configurations for Vercel, Netlify, AWS, and more

## 📦 Installation

You can install Elytra globally using npm:

```bash
npm install -g @shalev396/elytra
```

Or use it directly with npx:

```bash
npx @shalev396/elytra
```

## 🛠️ Usage

To create a new project, simply run:

```bash
elytra create
```

You'll be prompted to answer a series of questions about your project:

1. Project name and description
2. Frontend framework (React, Vue, Angular, etc.)
3. Backend framework (Express, NestJS, Fastify, etc.)
4. Database (PostgreSQL, MySQL, MongoDB, SQLite)
5. Authentication methods
6. Additional features

After answering all questions, Elytra will generate your project structure with all the necessary files and dependencies.

### Command Options

- `elytra create`: Create a new project with interactive prompts
- `elytra create --template <path>`: Create a project from a saved template
- `elytra create --config <path>`: Create a project from a configuration file
- `elytra list`: List all available template options
- `elytra --help`: Show help information

## 🧩 Supported Technologies

### Frontend Frameworks

- React
- Vue.js
- Angular
- Svelte
- Next.js
- Nuxt.js

### UI Libraries

- Tailwind CSS
- Material UI
- Chakra UI
- Shadcn UI
- Vuetify
- Angular Material

### Backend Frameworks

- Express.js
- NestJS
- Fastify
- Serverless Functions

### Databases

- PostgreSQL
- MySQL
- MongoDB
- SQLite

### ORM/ODM

- Prisma
- TypeORM
- Mongoose
- Sequelize

### Authentication

- Email/Password
- OAuth 2.0 (Google, GitHub, etc.)
- JWT
- Auth0
- Firebase Authentication

## 📋 Project Structure

Elytra generates a project structure following best practices for your selected technologies. Here's an example of a generated Next.js project with Express backend:

```
my-project/
├── frontend/                  # Next.js frontend
│   ├── public/                # Static files
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   ├── components/        # React components
│   │   ├── lib/               # Utility functions
│   │   └── types/             # TypeScript types
│   ├── package.json
│   └── tsconfig.json
├── backend/                   # Express backend
│   ├── src/
│   │   ├── controllers/       # Route controllers
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Custom middleware
│   │   ├── utils/             # Utility functions
│   │   └── index.ts           # Entry point
│   ├── package.json
│   └── tsconfig.json
├── package.json               # Root package.json
└── README.md                  # Project README
```

## 🤝 Contributing

Contributions are welcome! Please check out our [contributing guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report issues, or suggest features.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Documentation

For more detailed documentation, please visit our [documentation site](https://elytra.dev).

## 👥 Community

- [GitHub Discussions](https://github.com/shalev396/Elytra/discussions)
- [Discord](https://discord.gg/elytra)
- [Twitter](https://twitter.com/elytra_dev)

## 🙏 Acknowledgements

Special thanks to all the [contributors](https://github.com/shalev396/Elytra/graphs/contributors) who have helped make Elytra better!

---

Made with ❤️ by [Shalev Lazarof](https://github.com/shalev396)
