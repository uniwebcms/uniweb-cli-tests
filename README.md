# Uniweb CLI Testing Framework

A comprehensive testing framework for the Uniweb CLI tool that validates functionality, performance, and user experience through automated tests and exercise validation.

## Overview

This testing framework provides:

- **Comprehensive CLI Testing** - Tests all commands and workflows
- **Exercise Validation** - Ensures documentation tutorials actually work
- **Performance Monitoring** - Catches performance regressions early
- **User Experience Testing** - Validates error messages and context awareness
- **Fluent Test API** - Makes writing and maintaining tests enjoyable

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Uniweb CLI installed globally: `npm install -g @uniwebcms/toolkit`

### Installation

```bash
# Clone this testing repository
git clone <your-test-repo-url>
cd uniweb-cli-tests

# Install dependencies
npm install

# Run all tests
npm test
```

### Verify Installation

```bash
# Check that Uniweb CLI is available
uniweb --version

# Run a quick test
npm run test:unit
```

## Usage Examples

```bash
# Run all tests
npm test

# Run specific test categories
npm run test:unit
npm run test:integration
npm run test:exercises

# Run in watch mode during development
npm run test:watch

# Run with UI for visual debugging
npm run test:ui

# Validate that exercises work
npm run validate-exercises

# Run performance benchmarks
npm run benchmark
```

## File Structure

```
tests/
├── setup/
│   ├── test-helpers.js           # Base TestEnvironment class
│   ├── additional-helpers.js     # Extensions and helper classes
│   └── enhanced-test-helpers.js  # Simple loader that combines everything
├── unit/
│   └── init.test.js              # Individual command tests
├── integration/
│   └── comprehensive-workflow.test.js  # Full workflow tests
├── exercises/
│   └── exercise-validation.test.js     # Exercise validation
└── performance/
    └── benchmark.test.js         # Performance tests
package.json                      # Dependencies and scripts
vitest.config.js                  # Test configuration
```

## Key Features of This Testing Setup

### **1. Fluent API for Readable Tests**

```javascript
await env
  .initProject("my-portfolio", { singleSite: true })
  .addPage("about")
  .addSection("hero", { page: "about" })
  .setSection("hero", "# About Me\n\nContent here", { page: "about" });
```

### **2. Rich Content Building**

```javascript
const content = env
  .buildContent()
  .component("HeroSection")
  .param("theme", "dark")
  .title("Welcome")
  .paragraph("Great content")
  .link("Get Started", "/start", { "button-primary": true })
  .build();
```

### **3. Assertion Chaining**

```javascript
await env
  .assert()
  .fileExists("pages/index/hero.md")
  .fileContains("pages/index/hero.md", "Welcome")
  .yamlProperty("pages/index/page.yml", "sections", ["hero"])
  .verify();
```

### **4. Performance Testing**

```javascript
const perf = env.performance();
await perf.timeOperation("page-creation", () => env.addPage("test"));
perf.expectOperationFasterThan("page-creation", 1000);
```

### **5. Batch Operations**

```javascript
await env
  .batch()
  .addPage("about")
  .addSection("hero", { page: "about" })
  .setSection("hero", content, { page: "about" })
  .execute();
```

## Test Categories

### Unit Tests (`tests/unit/`)

Test individual CLI commands in isolation:

- `uniweb init` with various options
- `uniweb add` for pages, sections, locales
- `uniweb set` for content management
- Error handling and validation

### Integration Tests (`tests/integration/`)

Test complete workflows and complex scenarios:

- Full content creation workflows
- Multi-site project management
- Multilingual content handling
- Component library integration

### Exercise Validation (`tests/exercises/`)

Validate that documentation tutorials work:

- Portfolio creation exercise
- Multi-language marketing site
- Component library development
- Real-world scenarios

### Performance Tests (`tests/performance/`)

Monitor CLI performance and catch regressions:

- Bulk operations (creating many pages/sections)
- Large project handling
- Command execution speed
- Memory usage

## Writing Tests

### Basic Test Structure

```javascript
import { TestEnvironment } from "../setup/enhanced-test-helpers.js";

describe("My Test Suite", () => {
  let env;

  beforeEach(async () => {
    env = new TestEnvironment();
    await env.setup();
  });

  afterEach(async () => {
    await env.cleanup();
  });

  it("should test something", async () => {
    // Your test code here
  });
});
```

### Using the Fluent API

The testing framework provides a fluent API that makes tests readable and maintainable:

```javascript
// Create a complete project workflow
await env
  .initProject("my-portfolio", { singleSite: true })
  .addPage("about")
  .addPage("projects")
  .addSection("hero", { page: "index" })
  .addSection("skills", { page: "about" });

// Build rich content
const heroContent = env
  .buildContent()
  .component("HeroSection")
  .param("layout", "centered")
  .param("theme", "dark")
  .title("Welcome to My Site")
  .paragraph("I create amazing digital experiences")
  .link("View Work", "/projects", { "button-primary": true })
  .build();

// Set content efficiently
await env.setSection("hero", heroContent, { page: "index" });

// Verify results with assertion chaining
await env
  .assert()
  .fileExists("pages/index/hero.md")
  .fileExists("pages/about/skills.md")
  .fileContains("pages/index/hero.md", "Welcome to My Site")
  .yamlProperty("pages/index/page.yml", "sections", ["hero"])
  .verify();
```

### Batch Operations

For efficiency when creating multiple resources:

```javascript
await env
  .batch()
  .addPage("blog")
  .addPage("about")
  .addSection("hero", { page: "index" })
  .addSection("posts", { page: "blog" })
  .setSection("hero", welcomeContent, { page: "index" })
  .execute();
```

### Testing Scenarios

Use pre-built scenarios for common project types:

```javascript
// Create a complete portfolio scenario
await env.scenarios().createPortfolioScenario();

// Create an e-commerce site with sample data
await env.scenarios().createEcommerceScenario();

// Create a blog with multilingual content
await env.scenarios().createBlogScenario();
```

### Performance Testing

Monitor CLI performance:

```javascript
const perf = env.performance();

// Time an operation
const { duration } = await perf.timeOperation("page-creation", async () => {
  await env.addPage("test-page");
});

// Set performance expectations
perf.expectOperationFasterThan("page-creation", 1000); // Under 1 second

// Benchmark bulk operations
const metrics = await perf.benchmarkBulkOperations(50); // Create 50 pages
expect(metrics.avgTimePerOperation).toBeLessThan(100); // Under 100ms each
```

## Helper Functions Reference

### Project Management

- `env.initProject(name, options)` - Initialize a new project
- `env.addPage(name, options)` - Add a page
- `env.addSection(name, options)` - Add a section
- `env.setSection(name, content, options)` - Set section content
- `env.addLocale(locales, options)` - Add language support

### Navigation

- `env.navigateToProject(name)` - Change to project directory
- `env.navigateToSite(siteName)` - Change to site directory
- `env.navigateToPage(pageName)` - Change to page directory
- `env.cd(directory)` - Change to any directory

### Assertions

- `env.expectFileExists(path)` - Assert file exists
- `env.expectFileContains(path, content)` - Assert file contains text
- `env.expectFilesExist(...paths)` - Assert multiple files exist
- `env.expectYamlProperty(path, property, value)` - Assert YAML property
- `env.expectCommandSuccess(args)` - Assert command succeeds
- `env.expectCommandFailure(args, error)` - Assert command fails

### Content Building

- `env.buildContent()` - Start building markdown content
- `.component(name)` - Set component
- `.param(key, value)` - Add parameter
- `.title(text)` - Add title
- `.paragraph(text)` - Add paragraph
- `.heading(level, text)` - Add heading
- `.list(items)` - Add list
- `.image(src, alt)` - Add image
- `.link(text, url, attributes)` - Add link
- `.build()` - Generate final content

### Structure Verification

- `env.expectStandardProjectStructure(type)` - Verify project structure
- `env.expectStandardSiteStructure(path)` - Verify site structure
- `env.expectProjectType(type)` - Verify project matches type pattern

## Test Scripts

### Available Scripts

```bash
# Run all tests
npm test

# Run specific test categories
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:exercises      # Exercise validation only
npm run test:performance    # Performance tests only

# Development and debugging
npm run test:watch          # Watch mode for development
npm run test:ui             # Visual test interface
npm run test:coverage       # Generate coverage report

# Validation and reporting
npm run validate-exercises  # Validate documentation exercises
npm run benchmark          # Run performance benchmarks
npm run test:ci            # CI-friendly test run
```

### Running Specific Tests

```bash
# Run a specific test file
npx vitest tests/unit/init.test.js

# Run tests matching a pattern
npx vitest --grep "portfolio"

# Run tests with specific timeout
npx vitest --testTimeout=60000
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: CLI Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install CLI
        run: npm install -g @uniwebcms/toolkit

      - name: Install test dependencies
        run: npm install

      - name: Run tests
        run: npm run test:ci

      - name: Validate exercises
        run: npm run validate-exercises
```

## Advanced Usage

### Custom Scenarios

Create your own scenario builders:

```javascript
// In your test file
class CustomScenarioBuilder extends ScenarioBuilder {
  async createDocumentationSite() {
    await this.env
      .initProject("docs", { singleSite: true })
      .addPage("api")
      .addPage("guides")
      .addPage("examples");

    // Add structured content...
    return this.env;
  }
}

// Use in tests
const scenarios = new CustomScenarioBuilder(env);
await scenarios.createDocumentationSite();
```

### Mock Component Libraries

Test component library integration:

```javascript
// Mock a component library
await env.mockComponentLibrary("ui-components", [
  { name: "HeroSection", category: "Layout" },
  { name: "FeatureGrid", category: "Content" },
  { name: "ContactForm", category: "Forms" },
]);

// Test using the components
const content = env
  .buildContent()
  .component("HeroSection")
  .param("layout", "centered")
  .title("Test Component")
  .build();
```

### Testing Error Scenarios

Test error handling and edge cases:

```javascript
// Test invalid inputs
await env.expectCommandFailure(["add", "page", ""], "Invalid page name");

// Test missing dependencies
await env.expectCommandFailure(
  ["add", "section", "hero", "--page", "nonexistent"],
  "Page not found"
);

// Test context-specific errors
await env.navigateToPage("test");
await env.expectCommandFailure(
  ["add", "section", "duplicate"],
  "Section already exists"
);
```

## Troubleshooting

### Common Issues

**CLI Not Found**

```bash
# Install CLI globally
npm install -g @uniwebcms/toolkit

# Verify installation
uniweb --version
```

**Tests Timing Out**

```bash
# Increase timeout for slow operations
npx vitest --testTimeout=60000

# Or set in vitest.config.js
export default defineConfig({
  test: {
    timeout: 60000
  }
})
```

**Permission Errors**

```bash
# Ensure test cleanup is working
# Check beforeEach/afterEach in your tests
beforeEach(async () => {
  env = new TestEnvironment()
  await env.setup()
})

afterEach(async () => {
  await env.cleanup() // This is crucial
})
```

### Debug Mode

Enable verbose logging:

```bash
# Run with debug output
DEBUG=uniweb:* npm test

# Run specific test with full output
npx vitest tests/unit/init.test.js --reporter=verbose
```

### Test Data Inspection

Inspect test data during development:

```javascript
it("should debug test data", async () => {
  await env.initProject("debug-test", { singleSite: true });

  // Log directory structure
  const structure = await env.getDirectoryStructure();
  console.log("Project structure:", JSON.stringify(structure, null, 2));

  // Log file contents
  const config = await env.readYaml("site.yml");
  console.log("Site config:", config);

  // Use the test UI for visual inspection
  // npm run test:ui
});
```

## Contributing

### Adding New Tests

1. **Choose the right category** (unit/integration/exercises/performance)
2. **Use existing patterns** from similar tests
3. **Follow the fluent API** for consistency
4. **Add performance expectations** for new operations
5. **Test both success and failure cases**

### Adding New Helpers

1. **Add to appropriate helper class** in `additional-helpers.js`
2. **Follow the fluent API pattern** (return `this` for chaining)
3. **Include error handling** and validation
4. **Add JSDoc comments** for complex functions
5. **Update this README** with new helper documentation

### Testing Guidelines

- **Use descriptive test names** that explain what's being tested
- **Keep tests focused** - one concept per test
- **Use setup helpers** instead of repeating CLI commands
- **Test edge cases** and error conditions
- **Add performance expectations** for new operations
- **Mock external dependencies** appropriately

## License

This testing framework is part of the Uniweb project and follows the same license terms.

## Support

For questions about the testing framework:

1. Check this README first
2. Look at existing test examples
3. Review the helper function implementations
4. Open an issue in the main Uniweb repository

---

**Happy Testing!** 🧪✨
