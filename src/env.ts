import path from "node:path";
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { z } from "zod";

// 只在 Node.js 环境中加载 .env 文件
if (typeof process !== "undefined" && process.env) {
  expand(config({
    path: path.resolve(
      process.cwd(),
      process.env.NODE_ENV === "test" ? ".env.test" : ".env",
    ),
  }));
}

// 环境变量验证 schema（基于 Wrangler 生成的类型）
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(9999),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  
  // Cloudflare D1 配置（用于 drizzle-kit）
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_DATABASE_ID: z.string().optional(),
  CLOUDFLARE_D1_TOKEN: z.string().optional(),
});

// 验证 drizzle-kit 所需的环境变量
const DrizzleEnvSchema = EnvSchema.refine(
  (data) => {
    // 对于 drizzle-kit 命令，需要 Cloudflare 凭证
    if (typeof process !== "undefined" && process.argv.some(arg => arg.includes('drizzle-kit'))) {
      return !!(data.CLOUDFLARE_ACCOUNT_ID && data.CLOUDFLARE_DATABASE_ID && data.CLOUDFLARE_D1_TOKEN);
    }
    return true;
  },
  {
    message: "Cloudflare credentials (CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_D1_TOKEN) are required for drizzle-kit commands",
  }
);

// 导出类型（使用 Wrangler 生成的 Env 类型）
export type Environment = Env;

// 判断是否在 Cloudflare Workers 环境中
export function isCloudflareWorkers(): boolean {
  // 方法1: 检查 navigator.userAgent (最可靠)
  // Cloudflare Workers 的 navigator.userAgent 是 'Cloudflare-Workers'
  if (typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers") {
    return true;
  }

  // 方法2: 检查 process 对象不存在
  // Workers 环境中没有 Node.js 的 process 对象
  if (typeof process === "undefined") {
    return true;
  }

  // 方法3: 检查是否有 Cloudflare 特定的全局对象
  // Workers 环境中通常会有这些全局对象
  if (typeof caches !== "undefined" && typeof Request !== "undefined" && typeof Response !== "undefined") {
    // 进一步检查是否不在浏览器环境中（没有 window 对象）
    // @ts-ignore - window 可能不存在于 Workers 环境中
    if (typeof window === "undefined") {
      return true;
    }
  }

  // 方法4: 检查环境变量 (兜底方案)
  // 如果以上都不行，检查 process.env 是否存在但为空对象
  if (typeof process !== "undefined" && process.env && Object.keys(process.env).length === 0) {
    return true;
  }

  return false;
}

// 解析 Node.js 环境变量（本地开发时使用）
export function parseNodeEnv(data: any) {
  const { data: env, error } = DrizzleEnvSchema.safeParse(data);
  
  if (error) {
    const errorMessage = `❌ Invalid env - ${formatZodError(error)}`;
    throw new Error(errorMessage);
  }
  
  return env;
}

// 格式化 Zod 错误信息
function formatZodError(error: z.ZodError): string {
  const fieldErrors = error.flatten().fieldErrors;
  const formErrors = error.flatten().formErrors;
  
  const messages = [];
  
  if (Object.keys(fieldErrors).length > 0) {
    messages.push(
      Object.entries(fieldErrors)
        .map(([key, errors]) => `${key}: ${errors?.join(", ")}`)
        .join(" | ")
    );
  }
  
  if (formErrors.length > 0) {
    messages.push(formErrors.join(" | "));
  }
  
  return messages.join(" | ");
}
