import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = sqliteTable("tasks", {
  id: integer("id", { mode: "number" })
    .primaryKey({ autoIncrement: true }),
  name: text("name")
    .notNull(),
  done: integer("done", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

// Pure Zod schemas for OpenAPI compatibility
export const selectTasksSchema = z.object({
  id: z.number(),
  name: z.string(),
  done: z.boolean(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export const insertTasksSchema = z.object({
  name: z.string({
    required_error: "必填",
    invalid_type_error: "必须是字符串",
  }).min(1, "名称不能为空").max(500, "名称不能超过500个字符"),
  done: z.boolean({
    required_error: "必填",
    invalid_type_error: "必须是布尔值",
  }).default(false),
});

export const patchTasksSchema = insertTasksSchema.partial();

// Keep drizzle-zod schemas for internal use if needed
export const drizzleSelectTasksSchema = createSelectSchema(tasks);
export const drizzleInsertTasksSchema = createInsertSchema(
  tasks,
  {
    name: schema => schema.min(1).max(500),
  },
).required({
  done: true,
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const drizzlePatchTasksSchema = drizzleInsertTasksSchema.partial();
