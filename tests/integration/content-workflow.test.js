// tests/integration/content-workflow.test.js
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TestEnvironment } from "../setup/test-helpers.js";

describe("Content Creator Workflow", () => {
  let env;

  beforeEach(async () => {
    env = new TestEnvironment();
    await env.setup();
  });

  afterEach(async () => {
    await env.cleanup();
  });

  it("should complete a full content creation workflow", async () => {
    // Step 1: Initialize single-site project
    await env.initProject("portfolio", { singleSite: true });

    // Step 2: Add pages and sections using fluent API
    await env
      .addPage("about")
      .addSection("hero", { page: "about" })
      .setSection("hero", "# About Me\n\nI am a creative professional...", {
        page: "about",
      });

    // Verify the final structure
    await env.expectStandardPageStructure("pages/about");
    await env.expectFileContains("pages/about/hero.md", "# About Me");
  });

  it("should handle context-aware commands", async () => {
    await env.initProject("context-test", { singleSite: true });

    // Add page from project root
    await env.addPage("services");

    // Navigate to page directory and add section
    await env.navigateToPage("services").addSection("overview"); // No --page needed due to context

    await env.expectFileExists("overview.md"); // We're in the page directory

    // Move section - should work from page context
    await env.expectCommandSuccess([
      "move",
      "section",
      "overview",
      "--position",
      "1",
    ]);
  });
});
