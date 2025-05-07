import chalk from "chalk";

/**
 * Logger utility for consistent logging
 */
export const logger = {
  /**
   * Log an info message
   */
  info: (message: string): void => {
    console.log(chalk.blue(`ℹ️ ${message}`));
  },

  /**
   * Log a success message
   */
  success: (message: string): void => {
    console.log(chalk.green(`✅ ${message}`));
  },

  /**
   * Log a warning message
   */
  warn: (message: string): void => {
    console.log(chalk.yellow(`⚠️ ${message}`));
  },

  /**
   * Log an error message
   */
  error: (message: string, error?: any): void => {
    console.log(chalk.red(`❌ ${message}`));
    if (error) {
      if (error instanceof Error) {
        console.log(chalk.red(error.stack || error.message));
      } else {
        console.log(chalk.red(String(error)));
      }
    }
  },

  /**
   * Log a debug message (only in development)
   */
  debug: (message: string, data?: any): void => {
    if (process.env["NODE_ENV"] === "development") {
      console.log(chalk.gray(`🔍 ${message}`));
      if (data) {
        console.log(data);
      }
    }
  },

  /**
   * Log a step in the process
   */
  step: (step: number, total: number, message: string): void => {
    console.log(chalk.cyan(`[${step}/${total}] ${message}`));
  },

  /**
   * Log a header section
   */
  header: (message: string): void => {
    console.log("\n" + chalk.bold.cyan("▶ " + message));
  },

  /**
   * Log a divider line
   */
  divider: (): void => {
    console.log(chalk.gray("─".repeat(50)));
  },

  /**
   * Log a command example
   */
  command: (command: string): void => {
    console.log(chalk.cyan(`$ ${command}`));
  },

  /**
   * Clear the console
   */
  clear: (): void => {
    console.clear();
  },
};
