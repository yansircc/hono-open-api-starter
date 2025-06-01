import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { IdParamsSchema, createErrorSchema } from "stoker/openapi/schemas";

import { insertTasksSchema, patchTasksSchema, selectTasksSchema } from "@/db/schema";
import { notFoundSchema } from "@/lib/constants";

const tags = ["任务"];

export const list = createRoute({
  path: "/tasks",
  method: "get",
  summary: "获取任务列表",
  description: "获取所有任务",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectTasksSchema),
      "任务列表",
    ),
  },
});

export const create = createRoute({
  path: "/tasks",
  method: "post",
  summary: "创建任务",
  description: "创建一个新任务",
  request: {
    body: jsonContentRequired(
      insertTasksSchema,
      "创建任务",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectTasksSchema,
      "创建的任务",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertTasksSchema),
      "验证错误",
    ),
  },
});

export const getOne = createRoute({
  path: "/tasks/{id}",
  method: "get",
  summary: "获取单个任务",
  description: "根据 ID 获取任务",
  request: {
    params: IdParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectTasksSchema,
      "请求的任务",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "任务不存在",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "无效的 id 错误",
    ),
  },
});

export const patch = createRoute({
  path: "/tasks/{id}",
  method: "patch",
  summary: "更新任务",
  description: "根据 ID 更新任务",
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(
      patchTasksSchema,
      "任务更新",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectTasksSchema,
      "更新的任务",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "任务不存在",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchTasksSchema)
        .or(createErrorSchema(IdParamsSchema)),
      "验证错误",
    ),
  },
});

export const remove = createRoute({
  path: "/tasks/{id}",
  method: "delete",
  summary: "删除任务",
  description: "根据 ID 删除任务",
  request: {
    params: IdParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "任务已删除",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "任务不存在",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "无效的 id 错误",
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
