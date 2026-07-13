import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env.local (Next.js convention) so migrations use the same DATABASE_URL as the app.
config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
