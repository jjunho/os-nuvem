import { defineConfig } from "@playwright/test";
import { DATABASE_URL_TEST } from "./tests/e2e/ambiente";

const PORT = 5179;

// Vertical tests run against the production build and a real PostgreSQL,
// so the speed budgets in ADR-0003 are measured on what we ship.
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  webServer: {
    command: `pnpm build && DATABASE_URL=${DATABASE_URL_TEST} pnpm db:migrate && PORT=${PORT} TEST_MODE=1 DATABASE_URL=${DATABASE_URL_TEST} pnpm start`,
    url: `http://localhost:${PORT}/entrar`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
