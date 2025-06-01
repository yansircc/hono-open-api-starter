import { getDatabaseFromContext } from "@/db/client-factory";
import { tasks } from "@/db/schema";
import { isCloudflareWorkers } from "@/env";
import type { AppRouteHandler } from "@/lib/types";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { EnvInfoRoute, TestDbRoute } from "./env.routes";

export const envInfo: AppRouteHandler<EnvInfoRoute> = async (c) => {
  const env = c.env;
  const runtime: "node" | "cloudflare-workers" = isCloudflareWorkers() ? "cloudflare-workers" : "node";
  
  // 检查数据库是否可用
  let hasDatabase = false;
  try {
    const db = getDatabaseFromContext(c);
    hasDatabase = !!db;
  } catch {
    hasDatabase = false;
  }
  
  // 构建响应
  const response = {
    runtime,
    nodeEnv: env.NODE_ENV,
    logLevel: env.LOG_LEVEL,
    hasDatabase,
    features: {
      port: env.PORT,
      cloudflareConfigured: !!(
        process.env?.CLOUDFLARE_ACCOUNT_ID &&
        process.env?.CLOUDFLARE_DATABASE_ID &&
        process.env?.CLOUDFLARE_D1_TOKEN
      ),
    },
  };
  
  return c.json(response, HttpStatusCodes.OK);
};

export const testDb: AppRouteHandler<TestDbRoute> = async (c) => {
  try {
    const db = getDatabaseFromContext(c);
    
    // 尝试查询 tasks 表的数量作为测试
    const result = await db.select().from(tasks).limit(1);
    
    return c.json({
      success: true,
      message: "数据库连接成功",
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.OK);
  } catch (error) {
    return c.json(
      { error: `数据库连接失败: ${error instanceof Error ? error.message : "未知错误"}` },
      HttpStatusCodes.BAD_REQUEST
    );
  }
};