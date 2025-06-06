import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import envInfo from "@/routes/env-info/env.index";
import index from "@/routes/index.route";
import tasks from "@/routes/tasks/tasks.index";
import { cors } from "hono/cors";

const app = createApp();

configureOpenAPI(app);

app.use("*", cors());

const routes = [
  index,
  tasks,
  envInfo,
] as const;

routes.forEach((route) => {
  app.route("/", route);
});

export type AppType = typeof routes[number];

export default app;
