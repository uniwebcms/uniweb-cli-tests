// tests/exercises/exercise-validation.test.js
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TestEnvironment } from "../setup/enhanced-test-helpers.js";

describe("Exercise Validation Tests", () => {
  let env;

  beforeEach(async () => {
    env = new TestEnvironment();
    await env.setup();
  });

  afterEach(async () => {
    await env.cleanup();
  });

  describe("Exercise 1: Build a Simple Portfolio", () => {
    it("should complete all steps successfully", async () => {
      // Step 1: Initialize project
      await env.initProject("my-portfolio", { singleSite: true });
      await env.expectStandardProjectStructure("single-site");

      // Step 2: Link component library (mocked)
      await env.mockComponentLibrary("portfolio-components", [
        "HeroSection",
        "SkillsGrid",
        "ProjectCard",
        "ContactForm",
      ]);

      // Step 3: Create pages
      await env.addPage("about").addPage("projects");

      // Step 4: Add sections
      await env
        .addSection("hero", { page: "index" })
        .addSection("skills", { page: "about" });

      // Step 5: Add content
      const heroContent = env
        .buildContent()
        .component("HeroSection")
        .param("layout", "centered")
        .title("Welcome to My Portfolio")
        .paragraph(
          "I'm a passionate developer creating amazing digital experiences"
        )
        .link("View My Work", "/projects", { "button-primary": true })
        .build();

      await env.setSection("hero", heroContent, { page: "index" });

      // Verify exercise completion
      await env
        .assert()
        .fileExists("pages/index/hero.md")
        .fileExists("pages/about/skills.md")
        .fileExists("pages/projects/page.yml")
        .fileContains("pages/index/hero.md", "Welcome to My Portfolio")
        .yamlProperty("pages/index/page.yml", "sections", ["hero"])
        .verify();

      console.log("✅ Exercise 1 completed successfully!");
    });

    it("should handle common mistakes gracefully", async () => {
      await env.initProject("mistake-test", { singleSite: true });

      // Test forgetting to add page before adding section
      await env.expectCommandFailure(
        ["add", "section", "hero", "--page", "nonexistent"],
        "Page not found"
      );

      // Test adding duplicate sections
      await env.addPage("test");
      await env.addSection("hero", { page: "test" });
      await env.expectCommandFailure(
        ["add", "section", "hero", "--page", "test"],
        "Section already exists"
      );

      // Test invalid component names in content
      const invalidContent = env
        .buildContent()
        .component("NonExistentComponent")
        .title("Test")
        .build();

      // This should still create the file but with potentially unused component
      await env.setSection("hero", invalidContent, { page: "test" });
      await env.expectFileContains(
        "pages/test/hero.md",
        "NonExistentComponent"
      );
    });
  });

  describe("Exercise 2: Multi-language Marketing Site", () => {
    it("should build complete multilingual site", async () => {
      await env
        .initProject("marketing-site", { singleSite: true })
        .addPage("products")
        .addPage("about")
        .addPage("contact")
        .addLocale("fr,es,de");

      // Create structured content
      const productContent = env
        .buildContent()
        .component("ProductShowcase")
        .param("layout", "grid")
        .param("columns", 3)
        .title("Our Products")
        .paragraph("Discover our innovative solutions")
        .heading(2, "Product Alpha")
        .paragraph("Revolutionary software solution")
        .heading(2, "Product Beta")
        .paragraph("Next-generation platform")
        .build();

      await env.setSection("showcase", productContent, { page: "products" });

      // Add translations
      const frenchContent = env
        .buildContent()
        .component("ProductShowcase")
        .param("layout", "grid")
        .param("columns", 3)
        .title("Nos Produits")
        .paragraph("Découvrez nos solutions innovantes")
        .heading(2, "Produit Alpha")
        .paragraph("Solution logicielle révolutionnaire")
        .heading(2, "Produit Beta")
        .paragraph("Plateforme de nouvelle génération")
        .build();

      await env.setSection("showcase", frenchContent, {
        page: "products",
        locale: "fr",
      });

      // Verify multilingual structure
      await env
        .assert()
        .fileExists("pages/products/showcase.md")
        .fileExists("locales/fr/pages/products/showcase.md")
        .fileContains("pages/products/showcase.md", "Our Products")
        .fileContains("locales/fr/pages/products/showcase.md", "Nos Produits")
        .verify();

      console.log("✅ Exercise 2 completed successfully!");
    });

    it("should handle translation workflow edge cases", async () => {
      await env.initProject("translation-test", { singleSite: true });

      // Test adding locale before content exists
      await env.addLocale("fr");
      await env.expectFileExists("locales/fr");

      // Add content after locale is set up
      await env.addPage("test");
      await env.addSection("content", { page: "test" });

      const englishContent = env
        .buildContent()
        .title("English Content")
        .paragraph("This is in English")
        .build();

      await env.setSection("content", englishContent, { page: "test" });

      // Add translation
      const frenchContent = env
        .buildContent()
        .title("Contenu Français")
        .paragraph("Ceci est en français")
        .build();

      await env.setSection("content", frenchContent, {
        page: "test",
        locale: "fr",
      });

      // Verify both files exist and have correct content
      await env
        .assert()
        .fileExists("pages/test/content.md")
        .fileExists("locales/fr/pages/test/content.md")
        .fileContains("pages/test/content.md", "English Content")
        .fileContains("locales/fr/pages/test/content.md", "Contenu Français")
        .verify();
    });
  });

  describe("Exercise 3: Build a Component Library", () => {
    it("should create and test custom components", async () => {
      await env.initProject("design-system", {
        module: "ui-components",
        site: "demo",
      });

      // Mock component creation
      await env.mockComponentLibrary("ui-components", [
        { name: "Button", category: "Forms" },
        { name: "Card", category: "Layout" },
        { name: "Modal", category: "Overlays" },
      ]);

      // Navigate to demo site and test components
      await env.navigateToSite("demo");

      const testContent = env
        .buildContent()
        .component("Card")
        .param("variant", "elevated")
        .param("padding", "large")
        .title("Component Test")
        .paragraph("Testing our custom card component")
        .build();

      await env
        .addSection("card-test", { page: "index" })
        .setSection("card-test", testContent, { page: "index" });

      await env.expectFileContains("pages/index/card-test.md", "Card");

      console.log("✅ Exercise 3 completed successfully!");
    });

    it("should handle component development workflow", async () => {
      await env.initProject("component-dev", {
        module: "custom-components",
        site: "test-site",
      });

      // Verify development structure was created
      await env
        .assert()
        .fileExists("src/custom-components/module.yml")
        .fileExists("src/custom-components/components")
        .fileExists("sites/test-site/site.yml")
        .fileExists("sites/test-site/pages/index/page.yml")
        .verify();

      // Mock adding a component to the library
      await env.mockComponentLibrary("custom-components", [
        {
          name: "CustomHero",
          category: "Layout",
          description: "A custom hero component",
        },
      ]);

      // Test using the component in the test site
      await env.navigateToSite("test-site");

      const heroContent = env
        .buildContent()
        .component("CustomHero")
        .param("style", "modern")
        .param("showOverlay", true)
        .title("Testing Custom Component")
        .paragraph("This component was built specifically for our needs")
        .build();

      await env
        .addSection("custom-hero", { page: "index" })
        .setSection("custom-hero", heroContent, { page: "index" });

      await env.expectFileContains("pages/index/custom-hero.md", "CustomHero");
    });
  });

  describe("Advanced Exercise Scenarios", () => {
    it("should handle complex real-world workflow", async () => {
      // Simulate a real project with multiple team members
      await env.initProject("team-project", { singleSite: true });

      // Create a blog-style site with multiple content types
      const pages = ["blog", "about", "services", "contact"];
      for (const page of pages) {
        await env.addPage(page);
      }

      // Add multilingual support
      await env.addLocale("fr,es");

      // Create structured content for each page
      const blogContent = env
        .buildContent()
        .component("BlogList")
        .param("postsPerPage", 10)
        .param("showPagination", true)
        .title("Our Blog")
        .paragraph("Stay updated with our latest insights and news")
        .build();

      const servicesContent = env
        .buildContent()
        .component("ServiceGrid")
        .param("columns", 2)
        .param("showIcons", true)
        .title("Our Services")
        .heading(2, "Web Development")
        .paragraph("Custom websites and applications")
        .heading(2, "Consulting")
        .paragraph("Strategic technology guidance")
        .build();

      // Use batch operations for efficiency
      await env
        .batch()
        .setSection("post-list", blogContent, { page: "blog" })
        .setSection("service-grid", servicesContent, { page: "services" })
        .addSection("hero", { page: "index" })
        .addSection("contact-form", { page: "contact" })
        .execute();

      // Add French translations
      const frenchBlogContent = env
        .buildContent()
        .component("BlogList")
        .param("postsPerPage", 10)
        .param("showPagination", true)
        .title("Notre Blog")
        .paragraph("Restez informé de nos dernières idées et nouvelles")
        .build();

      await env.setSection("post-list", frenchBlogContent, {
        page: "blog",
        locale: "fr",
      });

      // Verify the complex structure
      await env
        .assert()
        .fileExists("pages/blog/post-list.md")
        .fileExists("pages/services/service-grid.md")
        .fileExists("pages/index/hero.md")
        .fileExists("pages/contact/contact-form.md")
        .fileExists("locales/fr/pages/blog/post-list.md")
        .fileContains("pages/blog/post-list.md", "Our Blog")
        .fileContains("locales/fr/pages/blog/post-list.md", "Notre Blog")
        .fileContains("pages/services/service-grid.md", "Web Development")
        .verify();

      console.log("✅ Complex workflow completed successfully!");
    });
  });
});
