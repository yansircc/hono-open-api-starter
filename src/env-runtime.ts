import { isCloudflareWorkers, parseNodeEnv } from "./env";

// 在 Node.js 环境中，从 process.env 获取环境变量
// 在 Cloudflare Workers 中，环境变量会通过 context.env 传递
let nodeEnv: any = {};

if (!isCloudflareWorkers()) {
  // Node.js 环境：解析 process.env
  nodeEnv = parseNodeEnv(process.env);
}

export default nodeEnv;
