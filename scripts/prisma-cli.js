import dotenv from "dotenv";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: resolve(root, "backend/.env") });
dotenv.config({ path: resolve(root, ".env") });

if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  const directUrl = new URL(process.env.DATABASE_URL);
  const directHost = directUrl.hostname.replace(/-pooler(?=\.|$)/, "");

  if (directHost === directUrl.hostname) {
    console.error("Set DIRECT_URL to the non-pooled Neon connection string.");
    process.exit(1);
  }

  directUrl.hostname = directHost;
  process.env.DIRECT_URL = directUrl.toString();
}

if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
  console.error("Set DATABASE_URL and DIRECT_URL in backend/.env.");
  process.exit(1);
}

const prismaCli = resolve(root, "node_modules/prisma/build/index.js");
const result = spawnSync(
  process.execPath,
  [prismaCli, ...process.argv.slice(2)],
  {
    cwd: root,
    env: process.env,
    stdio: "inherit",
  },
);

if (result.error) {
  console.error("Could not start Prisma CLI.");
  process.exit(1);
}

process.exit(result.status ?? 1);
