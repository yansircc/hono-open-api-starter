import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

const tags = ["环境"];

export const envInfo = createRoute({
  method: "get",
  path: "/env-info",
  summary: "获取环境信息",
  description: "获取当前环境信息和配置",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        runtime: z.enum(["node", "cloudflare-workers"]),
        nodeEnv: z.string(),
        logLevel: z.string(),
        hasDatabase: z.boolean(),
        features: z.object({
          port: z.string().optional(),
          cloudflareConfigured: z.boolean(),
        }),
      }),
      "环境信息",
    ),
  },
});

export const testDb = createRoute({
  method: "get",
  path: "/test-db",
  summary: "测试数据库连接",
  description: "测试 D1 数据库连接",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        timestamp: z.string(),
      }),
      "数据库测试成功",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        error: z.string(),
      }),
      "数据库不可用",
    ),
  },
});

export type EnvInfoRoute = typeof envInfo;
export type TestDbRoute = typeof testDb;