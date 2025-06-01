import { createRouter } from "@/lib/create-app";

import * as handlers from "./env.handler";
import * as routes from "./env.routes";

const router = createRouter()
  .openapi(routes.envInfo, handlers.envInfo)
  .openapi(routes.testDb, handlers.testDb);

export default router; 