import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./schema";

// 数据库类型
export type Database = DrizzleD1Database<typeof schema>;

// 创建 D1 数据库（用于生产环境）
export function createD1Database(d1: D1Database): Database {
  return drizzleD1(d1, { schema });
}

// 从 Hono context 获取数据库
export function getDatabaseFromContext(c: { env: any }): Database {
  // 如果是测试环境，使用注入的测试数据库
  if (c.env.__TEST_DB__) {
    return c.env.__TEST_DB__ as Database;
  }
  
  // 生产环境使用 D1
  if (!c.env.DB) {
    throw new Error("'DB'数据库绑定未找到");
  }
  
  return createD1Database(c.env.DB);
} 