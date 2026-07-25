import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup/env.ts"],
    include: ["tests/**/*.test.ts"],
    // RLS tests hit the real database over the network and sign in for
    // real each time — sequential and slower than unit tests, but this
    // suite is deliberately small and targeted, not exhaustive.
    fileParallelism: false,
    testTimeout: 15_000,
  },
});
