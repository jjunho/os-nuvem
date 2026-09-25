import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: [
    "./app/db/schema.ts",
    "./app/db/quadros-schema.ts",
    "./app/db/etapas-schema.ts",
  ],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgres://corealux@localhost:54329/corealux",
  },
});
