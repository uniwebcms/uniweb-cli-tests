// tests/setup/enhanced-test-helpers.js
import { TestEnvironment } from "./test-helpers.js";
import { TestEnvironmentExtensions } from "./additional-helpers.js";

// Extend the TestEnvironment class with all helper methods
Object.assign(TestEnvironment.prototype, TestEnvironmentExtensions);

export { TestEnvironment };
