import fs from "fs";
import path from "path";
import chalk from "chalk";

/**
 * Check if a file exists
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Create a directory if it doesn't exist
 */
export function createDirIfNotExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Read a file as a string
 */
export function readFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    console.error(chalk.red(`Error reading file: ${filePath}`));
    throw error;
  }
}

/**
 * Write content to a file
 */
export function writeFile(filePath: string, content: string): void {
  try {
    createDirIfNotExists(path.dirname(filePath));
    fs.writeFileSync(filePath, content);
  } catch (error) {
    console.error(chalk.red(`Error writing file: ${filePath}`));
    throw error;
  }
}

/**
 * Copy a file from source to destination
 */
export function copyFile(sourcePath: string, destPath: string): void {
  try {
    createDirIfNotExists(path.dirname(destPath));
    fs.copyFileSync(sourcePath, destPath);
  } catch (error) {
    console.error(
      chalk.red(`Error copying file from ${sourcePath} to ${destPath}`)
    );
    throw error;
  }
}

/**
 * Copy a directory recursively
 */
export function copyDir(sourceDir: string, destDir: string): void {
  try {
    // Create destination directory
    createDirIfNotExists(destDir);

    // Read source directory
    const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

    // Process each entry
    for (const entry of entries) {
      const sourcePath = path.join(sourceDir, entry.name);
      const destPath = path.join(destDir, entry.name);

      if (entry.isDirectory()) {
        // Recursively copy directory
        copyDir(sourcePath, destPath);
      } else {
        // Copy file
        copyFile(sourcePath, destPath);
      }
    }
  } catch (error) {
    console.error(
      chalk.red(`Error copying directory from ${sourceDir} to ${destDir}`)
    );
    throw error;
  }
}

/**
 * Delete a file if it exists
 */
export function deleteFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(chalk.red(`Error deleting file: ${filePath}`));
    throw error;
  }
}

/**
 * Delete a directory recursively if it exists
 */
export function deleteDir(dirPath: string): void {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  } catch (error) {
    console.error(chalk.red(`Error deleting directory: ${dirPath}`));
    throw error;
  }
}

/**
 * Read a JSON file and parse it
 */
export function readJsonFile<T>(filePath: string): T {
  try {
    const content = readFile(filePath);
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(chalk.red(`Error reading JSON file: ${filePath}`));
    throw error;
  }
}

/**
 * Write an object as JSON to a file
 */
export function writeJsonFile(filePath: string, data: any, indent = 2): void {
  try {
    const content = JSON.stringify(data, null, indent);
    writeFile(filePath, content);
  } catch (error) {
    console.error(chalk.red(`Error writing JSON file: ${filePath}`));
    throw error;
  }
}

/**
 * Replace template placeholders in file content
 */
export function replaceTemplatePlaceholders(
  content: string,
  replacements: Record<string, string>
): string {
  let result = content;

  // Replace each placeholder
  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, value);
  }

  return result;
}

/**
 * Process a template file by replacing placeholders
 */
export function processTemplateFile(
  sourcePath: string,
  destPath: string,
  replacements: Record<string, string>
): void {
  try {
    // Read template file
    const content = readFile(sourcePath);

    // Replace placeholders
    const processedContent = replaceTemplatePlaceholders(content, replacements);

    // Write processed file
    writeFile(destPath, processedContent);
  } catch (error) {
    console.error(chalk.red(`Error processing template file: ${sourcePath}`));
    throw error;
  }
}
