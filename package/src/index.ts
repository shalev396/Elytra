#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import figlet from "figlet";
import { createProject } from "./cli";
import { listTemplates } from "./cli/actions";
import packageJson from "../package.json";

// Initialize the CLI
const program = new Command();

// Display the Elytra banner
console.log(
  chalk.cyan(figlet.textSync("Elytra", { horizontalLayout: "full" }))
);

// Set up the CLI program
program
  .name("elytra")
  .description("A CLI tool for scaffolding full-stack applications")
  .version(packageJson.version);

// Command to create a new project
program
  .command("create")
  .description("Create a new project")
  .option("-t, --template <path>", "Use a template from a file path")
  .option("-c, --config <path>", "Use a configuration file")
  .action(async (options) => {
    console.log(chalk.blue("🚀 Creating a new project..."));
    await createProject(options);
  });

// Command to list available templates
program
  .command("list")
  .description("List all available templates")
  .action(() => {
    console.log(chalk.blue("📋 Available templates:"));
    listTemplates();
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
