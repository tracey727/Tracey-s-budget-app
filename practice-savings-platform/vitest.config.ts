import { defineConfig } from "vitest/config";

// Each package's `test` script runs `vitest run` with its own directory as
// cwd (via `pnpm -r run test`). This config lives at the workspace root so
// Vite's upward config search finds it before it reaches the *outer*
// Tracey-s-budget-app repo's own vitest.config.mts (this package lives
// nested inside that repo as a self-contained subtree) — without this file,
// tests silently ran against the wrong project's config and found nothing.
// `include` is resolved relative to `root`, which defaults to cwd, so this
// one pattern correctly matches every package's own `test/**/*.test.ts`.
export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
