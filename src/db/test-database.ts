// 这个文件只在测试环境中使用，不会被 Wrangler 构建
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

// 测试数据库类型
export type TestDatabase = BunSQLiteDatabase<typeof schema>;

// 创建测试数据库
export function createTestDatabase(dbPath = "./db.sqlite"): TestDatabase {
  const sqlite = new Database(dbPath);
  return drizzle(sqlite, { schema });
} 