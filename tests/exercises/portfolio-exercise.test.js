// tests/exercises/portfolio-exercise.test.js
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TestEnvironment } from "../setup/test-helpers.js";

describe("Portfolio Exercise", () => {
  let env;

  beforeEach(async () => {
    env = new TestEnvironment();
    await env.setup();
  });

  afterEach(async () => {
    await env.cleanup();
  });

  it("should complete Exercise 1: Build a Simple Portfolio", async () => {
    // This test validates that the exercise steps actually work
    // Using the fluent API makes it very clean and readable

    await env
      .initProject("my-portfolio", { singleSite: true })
      // .linkModule('portfolio-components')  // Would need mock registry
      .addPage("about")
      .addPage("projects")
      .addSection("hero", { page: "index" })
      .addSection("skills", { page: "about" });

    // Verify final structure with single assertion
    await env.expectFilesExist(
      "pages/index/hero.md",
      "pages/about/skills.md",
      "pages/projects/page.yml"
    );
  });

  it("should handle multilingual portfolio", async () => {
    await env
      .initProject("multilingual-portfolio", { singleSite: true })
      .addPage("about")
      .addSection("hero", { page: "about" })
      .setSection("hero", "# About Me\n\nWelcome to my portfolio", {
        page: "about",
      })
      .addLocale("fr,es")
      .setSection("hero", "# À Propos\n\nBienvenue sur mon portfolio", {
        page: "about",
        locale: "fr",
      });

    // Verify both original and translated content
    await env.expectFileContains(
      "pages/about/hero.md",
      "Welcome to my portfolio"
    );
    await env.expectFileContains(
      "locales/fr/pages/about/hero.md",
      "Bienvenue sur mon portfolio"
    );
  });
});
