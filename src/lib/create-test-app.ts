// 只在测试环境导入
import { createTestDatabase } from "@/db/test-database";
import { pinoLogger } from "@/middlewares/pino-logger";
import { OpenAPIHono } from "@hono/zod-openapi";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";
import type { AppBindings, AppOpenAPI } from "./types";

// 全局测试数据库实例
let testDb: any = null;

// 创建测试路由器
export function createTestRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
}

// 创建测试应用
export function createTestApp() {
  const app = createTestRouter();
  
  // 确保测试数据库实例
  if (!testDb) {
    testDb = createTestDatabase();
  }
  
  // 注入测试数据库到 context
  app.use(async (c, next) => {
    // 设置环境变量和数据库绑定
    c.env = {
      NODE_ENV: "test",
      LOG_LEVEL: "silent",
      PORT: "9999",
      __TEST_DB__: testDb, // 使用特殊标记传递测试数据库
      DB: null as any, // 满足类型检查
    } as unknown as AppBindings["Bindings"];
    
    return next();
  });
  
  app.use(serveEmojiFavicon("📝"));
  app.use(pinoLogger());
  app.notFound(notFound);
  app.onError(onError);
  
  return app;
}

// 创建带路由的测试应用
export function createTestAppWithRouter<R extends AppOpenAPI>(router: R) {
  return createTestApp().route("/", router);
}

// 清理测试数据库
export function cleanupTestDatabase() {
  if (testDb) {
    // @ts-ignore
    const client = testDb.$client;
    if (client && typeof client.close === 'function') {
      client.close();
    }
    testDb = null;
  }
} 