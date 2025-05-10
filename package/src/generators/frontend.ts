import fs from "fs-extra";
import path from "path";
import { ProjectConfig, SPAFramework } from "../types";
import { logger } from "../utils/logger";

/**
 * Copy the frontend files from templates to project directory
 */
export async function generateFrontend(
  config: ProjectConfig,
  targetDir: string
): Promise<void> {
  logger.header("Generating Frontend");

  try {
    const { projectType, platform, frontendType, frontendFramework } = config;

    // Define template paths
    const templateBase = path.join(__dirname, "..", "templates");
    const projectTypeDir = projectType.toLowerCase().replace(/\s+/g, "-");
    const platformDir = platform.toLowerCase();
    const frontendTypeDir = frontendType.toLowerCase();

    // Build the path to the framework template
    const templateDir = path.join(
      templateBase,
      projectTypeDir,
      platformDir,
      "frontend",
      frontendTypeDir,
      getFrameworkId(frontendFramework)
    );

    // Create frontend directory in the target project
    const frontendDir = path.join(targetDir, "frontend");

    // Check if template exists
    if (!fs.existsSync(templateDir)) {
      // For now, just create a placeholder README
      fs.ensureDirSync(frontendDir);
      fs.writeFileSync(
        path.join(frontendDir, "README.md"),
        `# ${frontendFramework} Frontend\n\nThis is a placeholder for the ${frontendFramework} frontend implementation.`
      );
      logger.warn(
        `No template found for ${frontendFramework}. Created placeholder.`
      );
      return;
    }

    // Copy template files to the target directory
    fs.copySync(templateDir, frontendDir);

    logger.success(`Generated frontend with ${frontendFramework}`);
  } catch (error) {
    logger.error("Failed to generate frontend", error);
    throw error;
  }
}

/**
 * Get framework ID from the framework name
 */
function getFrameworkId(framework: SPAFramework): string {
  const idMap: Record<SPAFramework, string> = {
    "React.js": "react",
    Angular: "angular",
    "Vue.js": "vue",
    Svelte: "svelte",
    "Ember.js": "ember",
    "Backbone.js": "backbone",
    "Mithril.js": "mithril",
    Preact: "preact",
    "Solid.js": "solid",
    "Alpine.js": "alpine",
    Lit: "lit",
    "Meteor.js": "meteor",
    "Knockout.js": "knockout",
    "Dojo Toolkit": "dojo",
    "Ext JS": "extjs",
    Avalonia: "avalonia",
    "Blazor WebAssembly": "blazor",
    "Flutter Web": "flutter",
    OpenSilver: "opensilver",
    "Uno Platform": "uno",
  };

  return idMap[framework] || framework.toLowerCase().replace(/\s+|\.js$/g, "");
}
