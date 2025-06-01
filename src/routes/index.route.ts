import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import { createRouter } from "@/lib/create-app";

const router = createRouter()
  .openapi(
    createRoute({
      tags: ["首页"],
      method: "get",
      summary: "首页",
      description: "首页",
      path: "/",
      responses: {
        [HttpStatusCodes.OK]: jsonContent(
          createMessageObjectSchema("Tasks API"),
          "首页",
        ),
      },
    }),
    (c) => {
      return c.json({
        message: "Tasks API on Cloudflare",
      }, HttpStatusCodes.OK);
    },
  );

export default router;
