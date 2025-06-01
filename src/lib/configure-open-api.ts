import env from "@/env-runtime";
import { Scalar } from "@scalar/hono-api-reference";

import type { AppOpenAPI } from "./types";

import packageJSON from "../../package.json";

function getServerUrl() {
  return env.NODE_ENV === "production" ? "https://hono-starter-cloudflare.yansir.workers.dev" :  "http://localhost:8787";
}

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: packageJSON.version,
      title: "Tasks API",
      description: "API for managing tasks",
    },
    servers: [
      {
        url: getServerUrl(),
        description: env.NODE_ENV === "production" ? "生产环境" : "本地开发环境",
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