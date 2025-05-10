import chalk from "chalk";
import path from "path";
import fs from "fs";
import { FrameworkOption } from "../types";

// Define frontend framework options with enabled flag
const frontendFrameworks: FrameworkOption[] = [
  { id: "react", name: "React.js", enabled: true },
  { id: "angular", name: "Angular", enabled: false },
  { id: "vue", name: "Vue.js", enabled: false },
  { id: "svelte", name: "Svelte", enabled: false },
  { id: "ember", name: "Ember.js", enabled: false },
  { id: "backbone", name: "Backbone.js", enabled: false },
  { id: "mithril", name: "Mithril.js", enabled: false },
  { id: "preact", name: "Preact", enabled: false },
  { id: "solid", name: "Solid.js", enabled: false },
  { id: "alpine", name: "Alpine.js", enabled: false },
  { id: "lit", name: "Lit", enabled: false },
  { id: "meteor", name: "Meteor.js", enabled: false },
  { id: "knockout", name: "Knockout.js", enabled: false },
  { id: "dojo", name: "Dojo Toolkit", enabled: false },
  { id: "extjs", name: "Ext JS", enabled: false },
  { id: "avalonia", name: "Avalonia", enabled: false },
  { id: "blazor", name: "Blazor WebAssembly", enabled: false },
  { id: "flutter", name: "Flutter Web", enabled: false },
  { id: "opensilver", name: "OpenSilver", enabled: false },
  { id: "uno", name: "Uno Platform", enabled: false },
];

// Define backend framework options with enabled flag
const backendFrameworks: FrameworkOption[] = [
  { id: "express", name: "Express.js", enabled: true },
  { id: "koa", name: "Koa.js", enabled: false },
  { id: "nestjs", name: "NestJS", enabled: false },
  { id: "fastify", name: "Fastify", enabled: false },
  { id: "hapi", name: "Hapi.js", enabled: false },
  { id: "sails", name: "Sails.js", enabled: false },
  { id: "feathers", name: "Feathers.js", enabled: false },
  { id: "loopback", name: "LoopBack", enabled: false },
  { id: "total", name: "Total.js", enabled: false },
  { id: "adonis", name: "AdonisJS", enabled: false },
  { id: "meteor", name: "Meteor.js", enabled: false },
  { id: "actionhero", name: "ActionHero.js", enabled: false },
];

// Define SQL database options with enabled flag
const sqlDatabases: FrameworkOption[] = [
  { id: "mysql", name: "MySQL", enabled: true },
  { id: "postgresql", name: "PostgreSQL", enabled: false },
  { id: "oracle", name: "Oracle Database", enabled: false },
  { id: "sqlserver", name: "Microsoft SQL Server", enabled: false },
  { id: "db2", name: "IBM Db2", enabled: false },
];

/**
 * Lists all available templates to the console
 * This function displays all frameworks and databases that are supported,
 * marking those that are currently enabled and available for use
 */
export function listTemplates(): void {
  console.log(chalk.bold("\nAvailable Frontend Frameworks:"));
  frontendFrameworks.forEach((framework) => {
    const name = framework.enabled
      ? chalk.cyan(framework.name)
      : chalk.red(`${framework.name} (coming soon)`);
    console.log(`  - ${name}`);
  });

  console.log(chalk.bold("\nAvailable Backend Frameworks:"));
  backendFrameworks.forEach((framework) => {
    const name = framework.enabled
      ? chalk.cyan(framework.name)
      : chalk.red(`${framework.name} (coming soon)`);
    console.log(`  - ${name}`);
  });

  console.log(chalk.bold("\nAvailable Databases:"));
  sqlDatabases.forEach((database) => {
    const name = database.enabled
      ? chalk.cyan(database.name)
      : chalk.red(`${database.name} (coming soon)`);
    console.log(`  - ${name}`);
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
