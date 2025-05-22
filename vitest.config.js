// vitest.config.js
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    timeout: 30000, // CLI operations can be slow
    testTimeout: 30000,
    setupFiles: ["./tests/setup/test-helpers.js"],
    reporters: ["verbose"],
  },
});
