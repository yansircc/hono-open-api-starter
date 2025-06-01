import { isCloudflareWorkers } from "@/env";
import { Scalar } from "@scalar/hono-api-reference";
import type { AppOpenAPI } from "./types";

import packageJSON from "../../package.json";

/**
 * 获取服务器 URL 和描述
 */
function getServerInfo() {
  // 在 Cloudflare Workers 环境中，默认为生产环境
  if (isCloudflareWorkers()) {
    return {
      url: "https://hono-starter-cloudflare.yansir.workers.dev",
      description: "生产环境",
    };
  }
  
  // 在 Node.js 环境中，根据 NODE_ENV 判断
  const isProduction = process.env.NODE_ENV === "production";
  return {
    url: isProduction 
      ? "https://hono-starter-cloudflare.yansir.workers.dev" 
      : "http://localhost:8787",
    description: isProduction ? "生产环境" : "本地开发环境",
  };
}

export default function configureOpenAPI(app: AppOpenAPI) {
  const serverInfo = getServerInfo();
  
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: packageJSON.version,
      title: "Tasks API",
      description: "API for managing tasks",
    },
    servers: [
      {
        url: serverInfo.url,
        description: serverInfo.description,
      },
    ],
  });

  app.get(
    "/reference",
    Scalar({
      theme: "kepler",
      layout: "classic",
      url: "/doc",
      defaultHttpClient: {
        targetKey: "js",
        clientKey: "fetch",
      },
    }),
  );
}