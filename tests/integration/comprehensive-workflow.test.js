// tests/integration/comprehensive-workflow.test.js
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TestEnvironment } from "../setup/enhanced-test-helpers.js";

describe("Comprehensive Uniweb Workflow", () => {
  let env;

  beforeEach(async () => {
    env = new TestEnvironment();
    await env.setup();
  });

  afterEach(async () => {
    await env.cleanup();
  });

  it("should create a complete portfolio using all helper functions", async () => {
    // Performance testing - time the entire operation
    const perf = env.performance();

    const { result, duration } = await perf.timeOperation(
      "full-portfolio-creation",
      async () => {
        // Use scenario builder to create basic structure
        await env.scenarios().createPortfolioScenario();

        // Create rich content using content builder
        const heroContent = env
          .buildContent()
          .component("HeroSection")
          .param("layout", "split")
          .param("theme", "gradient")
          .param("animation", "fadeIn")
          .title("Jane Smith")
          .paragraph(
            "Full-stack developer with a passion for creating beautiful, functional web experiences."
          )
          .link("View Portfolio", "/work", { "button-primary": true })
          .link("Contact Me", "/contact", { "button-secondary": true })
          .image("/images/hero-photo.jpg", "Jane Smith portrait")
          .build();

        const skillsContent = env
          .buildContent()
          .component("SkillsShowcase")
          .param("layout", "cards")
          .param("columns", 4)
          .title("Technical Skills")
          .paragraph("Technologies I work with on a daily basis")
          .heading(2, "Frontend")
          .list(["React", "Vue.js", "TypeScript", "CSS/SCSS"])
          .heading(2, "Backend")
          .list(["Node.js", "Python", "PostgreSQL", "GraphQL"])
          .heading(2, "Tools")
          .list(["Git", "Docker", "AWS", "Figma"])
          .build();

        // Use batch operations to set all content efficiently
        await env
          .batch()
          .setSection("hero", heroContent, { page: "index" })
          .setSection("skills", skillsContent, { page: "about" })
          .addSection("experience", { page: "about" })
          .addSection("testimonials", { page: "index" })
          .execute();

        return "portfolio-created";
      }
    );

    // Verify performance
    perf.expectOperationFasterThan("full-portfolio-creation", 5000); // Should complete in under 5 seconds

    // Use assertion chain for comprehensive verification
    await env
      .assert()
      .fileExists("pages/index/hero.md")
      .fileExists("pages/about/skills.md")
      .fileExists("pages/about/experience.md")
      .fileExists("pages/index/testimonials.md")
      .fileContains("pages/index/hero.md", "Jane Smith")
      .fileContains("pages/index/hero.md", "HeroSection")
      .fileContains("pages/about/skills.md", "SkillsShowcase")
      .yamlProperty("pages/index/page.yml", "sections", [
        "hero",
        "testimonials",
      ])
      .yamlProperty("pages/about/page.yml", "sections", [
        "skills",
        "experience",
      ])
      .verify();

    // Verify project structure matches portfolio type
    await env.expectProjectType("portfolio");
  });

  it("should handle multilingual e-commerce site with dynamic data", async () => {
    // Create e-commerce scenario
    await env.scenarios().createEcommerceScenario();

    // Add product listing content with dynamic data
    const productListContent = env
      .buildContent()
      .component("ProductGrid")
      .param("itemsPerPage", 12)
      .param("layout", "grid")
      .param("showFilters", true)
      .title("Our Products")
      .paragraph("Discover our carefully curated collection of premium items")
      .build();

    await env.setSection("product-list", productListContent, {
      page: "products",
    });

    // Verify JSON data was created
    const productData = await env.readJson("data/products.json");
    expect(productData.products).toHaveLength(2);
    expect(productData.products[0]).toHaveProperty("name", "Product 1");

    // Test multilingual functionality
    const frenchContent = env
      .buildContent()
      .component("ProductGrid")
      .param("itemsPerPage", 12)
      .param("layout", "grid")
      .title("Nos Produits")
      .paragraph(
        "Découvrez notre collection soigneusement sélectionnée d'articles premium"
      )
      .build();

    await env.setSection("product-list", frenchContent, {
      page: "products",
      locale: "fr",
    });

    // Verify multilingual structure
    await env
      .assert()
      .fileExists("pages/products/product-list.md")
      .fileExists("locales/fr/pages/products/product-list.md")
      .fileContains("pages/products/product-list.md", "Our Products")
      .fileContains("locales/fr/pages/products/product-list.md", "Nos Produits")
      .verify();
  });

  it("should handle complex nested content structure", async () => {
    await env.initProject("complex-site", { singleSite: true });

    // Create pages with hierarchical sections
    await env
      .addPage("services")
      .addSection("services-hero", { page: "services" })
      .addSection("service-tabs", { page: "services" })
      .addSection("web-development", {
        page: "services",
        position: "under:service-tabs",
      })
      .addSection("mobile-apps", {
        page: "services",
        position: "under:service-tabs",
      })
      .addSection("consulting", {
        page: "services",
        position: "under:service-tabs",
      });

    // Verify the hierarchical structure in page.yml
    const pageConfig = await env.readYaml("pages/services/page.yml");
    expect(pageConfig.sections).toEqual([
      "services-hero",
      {
        "service-tabs": ["web-development", "mobile-apps", "consulting"],
      },
    ]);

    // Use content builder for tab content
    const tabContainerContent = env
      .buildContent()
      .component("TabContainer")
      .param("defaultTab", 0)
      .param("style", "pills")
      .title("Our Services")
      .paragraph("We offer comprehensive digital solutions")
      .build();

    const webDevContent = env
      .buildContent()
      .component("ServiceDetail")
      .title("Web Development")
      .paragraph(
        "Custom websites and web applications built with modern technologies"
      )
      .list([
        "React & Vue.js Applications",
        "E-commerce Solutions",
        "CMS Development",
      ])
      .build();

    await env
      .batch()
      .setSection("service-tabs", tabContainerContent, { page: "services" })
      .setSection("web-development", webDevContent, { page: "services" })
      .execute();

    await env.expectFileContains(
      "pages/services/service-tabs.md",
      "TabContainer"
    );
    await env.expectFileContains(
      "pages/services/web-development.md",
      "Web Development"
    );
  });

  it("should handle bulk operations efficiently", async () => {
    await env.initProject("large-site", { singleSite: true });

    const perf = env.performance();

    // Test bulk page creation
    const pageMetrics = await perf.benchmarkBulkOperations(50); // Create 50 pages

    expect(pageMetrics.operationCount).toBe(50);
    expect(pageMetrics.avgTimePerOperation).toBeLessThan(100); // Less than 100ms per page

    // Verify all pages were created
    for (let i = 0; i < 50; i++) {
      await env.expectFileExists(`pages/test-page-${i}/page.yml`);
    }

    // Test batch section creation
    const { duration: batchDuration } = await perf.timeOperation(
      "batch-sections",
      async () => {
        const batch = env.batch();

        // Add 3 sections to each of the first 10 pages
        for (let i = 0; i < 10; i++) {
          batch
            .addSection("hero", { page: `test-page-${i}` })
            .addSection("content", { page: `test-page-${i}` })
            .addSection("footer", { page: `test-page-${i}` });
        }

        await batch.execute();
      }
    );

    perf.expectOperationFasterThan("batch-sections", 3000); // 30 sections in under 3 seconds

    // Verify batch operations worked
    for (let i = 0; i < 10; i++) {
      await env
        .assert()
        .fileExists(`pages/test-page-${i}/hero.md`)
        .fileExists(`pages/test-page-${i}/content.md`)
        .fileExists(`pages/test-page-${i}/footer.md`)
        .yamlProperty(`pages/test-page-${i}/page.yml`, "sections.length", 3)
        .verify();
    }

    console.log("Performance Metrics:", perf.getMetrics());
  });

  it("should test error handling and edge cases", async () => {
    await env.initProject("error-test", { singleSite: true });

    // Test invalid page names
    await env.expectCommandFailure(["add", "page", ""], "Invalid page name");
    await env.expectCommandFailure(
      ["add", "page", "invalid/\\name"],
      "Invalid page name"
    );

    // Test adding section to non-existent page
    await env.expectCommandFailure(
      ["add", "section", "hero", "--page", "non-existent"],
      "Page not found"
    );

    // Test setting content on non-existent section
    await env.expectCommandFailure(
      ["set", "section", "non-existent", "--body", "content"],
      "Section not found"
    );

    // Test context-aware error messages
    await env.addPage("test-page");
    await env.navigateToPage("test-page");

    // This should work (context-aware)
    await env.expectCommandSuccess(["add", "section", "hero"]);

    // This should fail (section already exists)
    await env.expectCommandFailure(
      ["add", "section", "hero"],
      "Section already exists"
    );
  });

  it("should validate CLI context awareness across different scenarios", async () => {
    await env.initProject("context-test", { singleSite: true });

    // Test project root context
    await env.expectCommandSuccess(["add", "page", "services"]);
    await env.expectFileExists("pages/services/page.yml");

    // Test page context
    await env.navigateToPage("services");
    await env.expectCommandSuccess(["add", "section", "overview"]);
    await env.expectFileExists("overview.md");

    // Test going back to project root
    await env.cd(".."); // Back to project root
    await env.expectCommandSuccess([
      "add",
      "section",
      "footer",
      "--page",
      "services",
    ]);
    await env.expectFileExists("pages/services/footer.md");

    // Verify both sections are in page.yml
    const pageConfig = await env.readYaml("pages/services/page.yml");
    expect(pageConfig.sections).toEqual(["overview", "footer"]);

    // Test multi-site context
    await env.cleanup();
    await env.setup();
    await env.initProject("multi-context-test");

    await env.expectCommandSuccess(["add", "site", "main"]);
    await env.navigateToSite("main");

    // Should work without --site flag when in site directory
    await env.expectCommandSuccess(["add", "page", "home"]);
    await env.expectFileExists("pages/home/page.yml");

    // Navigate to page and test section operations
    await env.navigateToPage("home");
    await env.expectCommandSuccess(["add", "section", "hero"]);
    await env.expectFileExists("hero.md");
  });

  it("should handle workspace-based multi-site projects", async () => {
    // Create a complex multi-site project
    await env.initProject("multi-site-project");

    // Add multiple sites
    await env.expectCommandSuccess(["add", "site", "marketing"]);
    await env.expectCommandSuccess(["add", "site", "documentation"]);
    await env.expectCommandSuccess(["add", "site", "support"]);

    // Verify workspace structure
    await env.expectFilesExist(
      "sites/marketing/site.yml",
      "sites/documentation/site.yml",
      "sites/support/site.yml"
    );

    // Test site-specific operations
    await env
      .addPage("pricing", { site: "marketing" })
      .addPage("api-reference", { site: "documentation" })
      .addPage("contact-us", { site: "support" });

    // Verify pages were added to correct sites
    await env
      .assert()
      .fileExists("sites/marketing/pages/pricing/page.yml")
      .fileExists("sites/documentation/pages/api-reference/page.yml")
      .fileExists("sites/support/pages/contact-us/page.yml")
      .verify();

    // Test cross-site content copying
    await env.expectCommandSuccess([
      "copy",
      "page",
      "contact-us",
      "--site",
      "support",
      "--to-site",
      "marketing",
      "--position",
      "contact",
    ]);

    await env.expectFileExists("sites/marketing/pages/contact/page.yml");
  });

  it("should validate exercise workflows end-to-end", async () => {
    // Exercise 1: Portfolio Creation
    await env
      .initProject("exercise-portfolio", { singleSite: true })
      .addPage("about")
      .addPage("projects")
      .addSection("hero", { page: "index" })
      .addSection("skills", { page: "about" });

    const portfolioContent = env
      .buildContent()
      .component("HeroSection")
      .title("John Doe")
      .paragraph("Creative developer passionate about user experience")
      .build();

    await env.setSection("hero", portfolioContent, { page: "index" });

    // Verify exercise completion
    await env
      .assert()
      .fileExists("pages/index/hero.md")
      .fileExists("pages/about/skills.md")
      .fileExists("pages/projects/page.yml")
      .fileContains("pages/index/hero.md", "John Doe")
      .verify();

    // Clean up and test Exercise 2: Blog Creation
    await env.cleanup();
    await env.setup();

    // Exercise 2: Multi-language Blog
    await env
      .initProject("exercise-blog", { singleSite: true })
      .addPage("blog")
      .addPage("about")
      .addLocale("fr,es")
      .addSection("post-list", { page: "blog" })
      .addSection("author-bio", { page: "about" });

    const blogContent = env
      .buildContent()
      .component("BlogPostList")
      .param("postsPerPage", 5)
      .param("showExcerpts", true)
      .title("Latest Articles")
      .paragraph("Stay updated with our latest thoughts and insights")
      .build();

    await env
      .batch()
      .setSection("post-list", blogContent, { page: "blog" })
      .setSection(
        "post-list",
        "Derniers Articles\n\nRestez à jour avec nos dernières réflexions",
        {
          page: "blog",
          locale: "fr",
        }
      )
      .execute();

    // Verify multilingual blog structure
    await env
      .assert()
      .fileExists("pages/blog/post-list.md")
      .fileExists("locales/fr/pages/blog/post-list.md")
      .fileContains("pages/blog/post-list.md", "Latest Articles")
      .fileContains("locales/fr/pages/blog/post-list.md", "Derniers Articles")
      .verify();
  });

  it("should test component library integration", async () => {
    await env.initProject("component-test", {
      module: "test-components",
      site: "demo",
    });

    // Mock a component library
    await env.mockComponentLibrary("test-components", [
      { name: "HeroSection", category: "Layout" },
      { name: "FeatureGrid", category: "Content" },
      { name: "ContactForm", category: "Forms" },
    ]);

    // Navigate to the demo site
    await env.navigateToSite("demo");

    // Test linking the component library
    await env.expectCommandSuccess(["link", "module", "test-components"]);

    // Verify site configuration was updated
    const siteConfig = await env.readYaml("site.yml");
    expect(siteConfig.modules).toContain("test-components");

    // Add content using the mocked components
    const heroContent = env
      .buildContent()
      .component("HeroSection")
      .param("layout", "centered")
      .title("Component Test Site")
      .paragraph("Testing component library integration")
      .build();

    await env
      .addSection("hero", { page: "index" })
      .setSection("hero", heroContent, { page: "index" });

    await env.expectFileContains("pages/index/hero.md", "HeroSection");
  });
});
