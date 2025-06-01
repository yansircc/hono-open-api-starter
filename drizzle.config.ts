import { defineConfig } from "drizzle-kit";

import env from "@/env-runtime";

// 确保必要的 Cloudflare 凭证存在
if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_DATABASE_ID || !env.CLOUDFLARE_D1_TOKEN) {
  throw new Error(
    "Cloudflare 凭证是 drizzle-kit 必需的。" +
    "请在 .env 文件中设置 CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, 和 CLOUDFLARE_D1_TOKEN"
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: env.CLOUDFLARE_ACCOUNT_ID,
    databaseId: env.CLOUDFLARE_DATABASE_ID,
    token: env.CLOUDFLARE_D1_TOKEN,
  },
});
