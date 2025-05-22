// tests/setup/test-helpers.js
import { execa } from "execa";
import fs from "fs-extra";
import path from "path";
import temporaryDirectory from "temp-dir";
import { fileURLToPath } from "url";
import yaml from "yaml";
import { expect } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class TestEnvironment {
  constructor() {
    this.tempDir = null;
    this.originalCwd = process.cwd();
  }

  async setup() {
    // Create a unique temp directory for this test
    const tempBase = temporaryDirectory;
    this.tempDir = await fs.mkdtemp(path.join(tempBase, "uniweb-test-"));
    process.chdir(this.tempDir);
    return this.tempDir;
  }

  async cleanup() {
    if (this.tempDir) {
      try {
        process.chdir(this.originalCwd);
        await fs.remove(this.tempDir);
      } catch (error) {
        console.warn(
          `Warning: Could not clean up temp directory ${this.tempDir}: ${error.message}`
        );
        // Don't throw - cleanup issues shouldn't fail tests
      }
    }
  }

  async runUniweb(args, options = {}) {
    try {
      const result = await execa("uniweb", args, {
        cwd: this.tempDir,
        ...options,
      });
      return {
        success: true,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
      };
    } catch (error) {
      return {
        success: false,
        stdout: error.stdout || "",
        stderr: error.stderr || "",
        exitCode: error.exitCode || 1,
        error: error.message,
      };
    }
  }

  async fileExists(filePath) {
    return fs.pathExists(path.join(this.tempDir, filePath));
  }

  async readFile(filePath) {
    return fs.readFile(path.join(this.tempDir, filePath), "utf8");
  }

  async readYaml(filePath) {
    const content = await this.readFile(filePath);
    return yaml.parse(content);
  }

  async getDirectoryStructure(dir = ".") {
    const structure = {};
    const fullPath = path.join(this.tempDir, dir);

    try {
      if (await fs.pathExists(fullPath)) {
        const items = await fs.readdir(fullPath);
        for (const item of items) {
          const itemPath = path.join(fullPath, item);
          try {
            const stats = await fs.stat(itemPath);

            if (stats.isDirectory()) {
              structure[item] = await this.getDirectoryStructure(
                path.join(dir, item)
              );
            } else {
              structure[item] = "file";
            }
          } catch (error) {
            // Skip files/directories we can't access (permission issues)
            console.warn(
              `Warning: Could not access ${itemPath}: ${error.message}`
            );
            structure[item] = "inaccessible";
          }
        }
      }
    } catch (error) {
      console.warn(
        `Warning: Could not read directory ${fullPath}: ${error.message}`
      );
    }

    return structure;
  }

  // === ASSERTION HELPERS ===

  async expectFileExists(filePath, message) {
    const exists = await this.fileExists(filePath);
    expect(exists, message || `Expected file ${filePath} to exist`).toBe(true);
  }

  async expectFileNotExists(filePath, message) {
    const exists = await this.fileExists(filePath);
    expect(exists, message || `Expected file ${filePath} to not exist`).toBe(
      false
    );
  }

  async expectFilesExist(...filePaths) {
    for (const filePath of filePaths) {
      await this.expectFileExists(filePath);
    }
  }

  async expectFileContains(filePath, content, message) {
    await this.expectFileExists(filePath);
    const fileContent = await this.readFile(filePath);
    expect(
      fileContent,
      message || `Expected ${filePath} to contain "${content}"`
    ).toContain(content);
  }

  async expectYamlProperty(filePath, property, expectedValue, message) {
    await this.expectFileExists(filePath);
    const yamlContent = await this.readYaml(filePath);
    const actualValue = this.getNestedProperty(yamlContent, property);
    expect(
      actualValue,
      message || `Expected ${filePath}.${property} to equal ${expectedValue}`
    ).toEqual(expectedValue);
  }

  async expectYamlContains(filePath, property, expectedValue, message) {
    await this.expectFileExists(filePath);
    const yamlContent = await this.readYaml(filePath);
    const actualValue = this.getNestedProperty(yamlContent, property);

    if (Array.isArray(actualValue)) {
      expect(
        actualValue,
        message ||
          `Expected ${filePath}.${property} to contain ${expectedValue}`
      ).toContain(expectedValue);
    } else {
      expect(
        actualValue,
        message ||
          `Expected ${filePath}.${property} to contain ${expectedValue}`
      ).toContain(expectedValue);
    }
  }

  // === COMMAND HELPERS ===

  async expectCommandSuccess(args, message) {
    const result = await this.runUniweb(args);
    expect(
      result.success,
      message ||
        `Expected 'uniweb ${args.join(" ")}' to succeed. Error: ${
          result.error || result.stderr
        }`
    ).toBe(true);
    return result;
  }

  async expectCommandFailure(args, expectedError, message) {
    const result = await this.runUniweb(args);
    expect(
      result.success,
      message || `Expected 'uniweb ${args.join(" ")}' to fail`
    ).toBe(false);
    if (expectedError) {
      expect(
        result.stderr || result.error,
        `Expected error to contain "${expectedError}"`
      ).toContain(expectedError);
    }
    return result;
  }

  // === WORKFLOW HELPERS ===

  async initProject(name, options = {}) {
    const args = ["init", name];
    if (options.singleSite) args.push("--single-site");
    if (options.module) args.push("--module", options.module);
    if (options.site) args.push("--site", options.site);

    await this.expectCommandSuccess(args);
    if (name !== ".") {
      process.chdir(name);
    }
    return this;
  }

  async addPage(name, options = {}) {
    const args = ["add", "page", name];
    if (options.site) args.push("--site", options.site);

    await this.expectCommandSuccess(args);

    // Verify standard page structure
    const pagePath = options.site
      ? `sites/${options.site}/pages/${name}`
      : `pages/${name}`;
    await this.expectFileExists(`${pagePath}/page.yml`);

    return this;
  }

  async addSection(name, options = {}) {
    const args = ["add", "section", name];
    if (options.page) args.push("--page", options.page);
    if (options.site) args.push("--site", options.site);
    if (options.position) args.push("--position", options.position);

    await this.expectCommandSuccess(args);

    // Verify section file and page.yml update
    const basePath = options.site ? `sites/${options.site}/pages` : "pages";
    const pagePath = options.page ? `${basePath}/${options.page}` : basePath;

    await this.expectFileExists(`${pagePath}/${name}.md`);
    await this.expectYamlContains(`${pagePath}/page.yml`, "sections", name);

    return this;
  }

  async setSection(name, content, options = {}) {
    const args = ["set", "section", name];
    if (options.page) args.push("--page", options.page);
    if (options.site) args.push("--site", options.site);
    if (options.locale) args.push("--locale", options.locale);
    args.push("--body", content);

    await this.expectCommandSuccess(args);

    // Verify content was set
    const basePath = options.site ? `sites/${options.site}/pages` : "pages";
    const pagePath = options.page ? `${basePath}/${options.page}` : basePath;
    const filePath = options.locale
      ? `locales/${options.locale}/${pagePath}/${name}.md`
      : `${pagePath}/${name}.md`;

    await this.expectFileContains(filePath, content.split("\n")[0]); // Check first line

    return this;
  }

  async addLocale(locales, options = {}) {
    const args = ["add", "locale", locales];
    if (options.site) args.push("--site", options.site);

    await this.expectCommandSuccess(args);

    // Verify locale directories
    const localeList = locales.split(",");
    for (const locale of localeList) {
      const localePath = options.site
        ? `sites/${options.site}/locales/${locale}`
        : `locales/${locale}`;
      await this.expectFileExists(localePath);
    }

    return this;
  }

  // === STRUCTURE VERIFICATION HELPERS ===

  async expectStandardProjectStructure(type = "minimal") {
    await this.expectFilesExist("package.json", "uniweb.config.js");

    if (type === "single-site") {
      await this.expectFilesExist("site.yml", "pages");
      await this.expectFileNotExists("sites");
    } else if (type === "workspace") {
      await this.expectFileExists("sites");
    }
  }

  async expectStandardSiteStructure(sitePath = ".") {
    const basePath = sitePath === "." ? "" : `${sitePath}/`;
    await this.expectFilesExist(`${basePath}site.yml`, `${basePath}pages`);
  }

  async expectStandardPageStructure(pagePath) {
    await this.expectFilesExist(`${pagePath}/page.yml`);
  }

  // === UTILITY METHODS ===

  getNestedProperty(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  // === FLUENT API HELPERS ===

  cd(directory) {
    process.chdir(path.join(this.tempDir, directory));
    return this;
  }

  async navigateToProject(name) {
    return this.cd(name);
  }

  async navigateToSite(siteName) {
    return this.cd(`sites/${siteName}`);
  }

  async navigateToPage(pageName, siteName) {
    const basePath = siteName ? `sites/${siteName}/pages` : "pages";
    return this.cd(`${basePath}/${pageName}`);
  }
}
