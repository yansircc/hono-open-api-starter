import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { PinoLogger } from "hono-pino";

// 使用 Wrangler 生成的 Env 类型
export interface AppBindings {
  Bindings: Env;
  Variables: {
    logger: PinoLogger;
  };
}

export type AppOpenAPI = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;
