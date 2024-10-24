import { drizzle } from "drizzle-orm/libsql";

import type { Environment } from "@/env";

import * as schema from "./schema";

export function createDb(env: Environment) {
  const db = drizzle({
    connection: {
      url: env.DATABASE_URL,
      authToken: env.DATABASE_AUTH_TOKEN,
    },
    casing: "snake_case",
    schema,
  });

  return { db };
}
