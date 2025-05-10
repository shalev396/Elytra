import inquirer from "inquirer";
import chalk from "chalk";
import { ProjectConfig, SPAFramework } from "../types";
import { logger } from "../utils/logger";

interface FrameworkOption {
  id: string;
  name: string;
  type: "spa" | "ssr" | "both";
  enabled: boolean;
}

// Define frontend framework options with enabled flag and framework type
const frontendFrameworks: FrameworkOption[] = [
  // SPA Frameworks
  { id: "react", name: "React.js", type: "spa", enabled: true },
  { id: "angular", name: "Angular", type: "spa", enabled: false },
  { id: "vue", name: "Vue.js", type: "spa", enabled: false },
  { id: "svelte", name: "Svelte", type: "spa", enabled: false },
  { id: "ember", name: "Ember.js", type: "spa", enabled: false },
  { id: "backbone", name: "Backbone.js", type: "spa", enabled: false },
  { id: "mithril", name: "Mithril.js", type: "spa", enabled: false },
  { id: "preact", name: "Preact", type: "spa", enabled: false },
  { id: "solid", name: "Solid.js", type: "spa", enabled: false },

  // SSR Frameworks
  { id: "nextjs", name: "Next.js", type: "ssr", enabled: true },
  { id: "nuxt", name: "Nuxt.js", type: "ssr", enabled: false },
  { id: "sveltekit", name: "SvelteKit", type: "ssr", enabled: false },
  { id: "remix", name: "Remix", type: "ssr", enabled: false },
  { id: "astro", name: "Astro", type: "ssr", enabled: false },
];

interface FrontendFrameworkAnswers {
  frontendFramework: SPAFramework;
}

/**
 * Get frontend framework from user based on selected frontend type
 * Fifth step in project creation that determines the frontend framework
 * Filters available options based on the previously selected frontend type
 *
 * @param config Current partial configuration containing frontendType
 * @returns Object containing selected frontend framework
 */
export async function getFrontendFramework(
  config?: Partial<ProjectConfig>
): Promise<Partial<ProjectConfig>> {
  logger.header("Frontend Framework");

  // Get the frontend type from the config
  const frontendType = config?.frontendType || "SPA";

  // Filter frameworks based on frontend type
  const frameworkType = frontendType.toLowerCase() === "ssr" ? "ssr" : "spa";

  // Filter frameworks matching the selected type
  const filteredFrameworks = frontendFrameworks.filter(
    (framework) => framework.type === frameworkType
  );

  // Format choices with colored disabled options
  const choices = filteredFrameworks.map((option) => ({
    name: option.enabled
      ? option.name
      : chalk.red(`${option.name} (coming soon)`),
    value: option.name as SPAFramework,
    disabled: !option.enabled,
  }));

  const answers = await inquirer.prompt<FrontendFrameworkAnswers>([
    {
      type: "list",
      name: "frontendFramework",
      message: `Which ${frameworkType.toUpperCase()} framework would you like to use?`,
      choices,
    },
  ]);

  // Log information about selected frontend framework
  logger.info(`${answers.frontendFramework} selected as frontend framework`);

  return answers;
}
