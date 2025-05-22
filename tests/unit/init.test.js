// tests/unit/init.test.js
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TestEnvironment } from "../setup/test-helpers.js";

describe("uniweb init", () => {
  let env;

  beforeEach(async () => {
    env = new TestEnvironment();
    await env.setup();
  });

  afterEach(async () => {
    await env.cleanup();
  });

  it("should create a minimal project", async () => {
    await env.initProject("test-project");
    await env.expectStandardProjectStructure("minimal");

    const packageJson = JSON.parse(await env.readFile("package.json"));
    expect(packageJson.name).toBe("test-project");
  });

  it("should create a single-site project", async () => {
    await env.initProject("single-site-project", { singleSite: true });
    await env.expectStandardProjectStructure("single-site");
    await env.expectStandardSiteStructure();
  });

  it("should create a development project with module and site", async () => {
    await env.initProject("dev-project", {
      module: "test-components",
      site: "demo",
    });

    await env.expectStandardProjectStructure("workspace");

    // Check component module structure
    await env.expectFilesExist(
      "src/test-components/module.yml",
      "src/test-components/components"
    );

    // Check site structure
    await env.expectStandardSiteStructure("sites/demo");
  });

  it("should handle invalid project names gracefully", async () => {
    await env.expectCommandFailure(
      ["init", "invalid@name"],
      "Invalid project name"
    );
  });
});
