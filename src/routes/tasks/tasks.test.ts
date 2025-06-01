import { execSync } from "node:child_process";
import fs from "node:fs";
import { testClient } from "hono/testing";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import env from "@/env-runtime";
import { testApi } from "@/lib/api-test-builder";
import { ZOD_ERROR_MESSAGES } from "@/lib/constants";
import { cleanupTestDatabase, createTestApp } from "@/lib/create-test-app";
import { 
  type Task,
  createIdParam,
  createTestContext, 
  testDataFactory 
} from "@/lib/test-helpers";

import router from "./tasks.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV 必须是 test");
}

const app = createTestApp().route("/", router);
const client = testClient(app);

describe("tasks routes", () => {
  const ctx = createTestContext();
  
  beforeAll(async () => {
    execSync("bun run db:push:test");
  });

  afterAll(async () => {
    cleanupTestDatabase();
    fs.rmSync("db.sqlite", { force: true });
  });

  describe("POST /tasks", () => {
    it("验证必填字段", async () => {
      const api = await testApi(
        "创建任务时验证必填字段",
        client.tasks.$post({
          json: { done: false } as any,
        })
      );
      
      await api.expectValidationError("name", "必填");
    });

    it("成功创建任务", async () => {
      const taskData = testDataFactory.createTask({ name: "Learn advanced testing" });
      
      const api = await testApi(
        "成功创建任务",
        client.tasks.$post({ json: taskData })
      );
      
      const task = await api.expectSuccessAndValidate<Task>(data => {
        expect(data.name).toBe(taskData.name);
        expect(data.done).toBe(taskData.done);
        expect(data.id).toBeDefined();
        expect(data.createdAt).toBeDefined();
        expect(data.updatedAt).toBeDefined();
      });
      
      ctx.createdTaskId = task.id;
      ctx.tasks.push(task);
    });

    it("验证名称约束", async () => {
      // 测试名称过长
      const api1 = await testApi(
        "验证名称长度限制",
        client.tasks.$post({
          json: testDataFactory.createTask({
            name: testDataFactory.createLongTaskName(501),
          }),
        })
      );
      await api1.expectValidationError("name", "名称不能超过500个字符");

      // 测试名称为空
      const api2 = await testApi(
        "验证名称不能为空",
        client.tasks.$post({
          json: testDataFactory.createTask({ name: "" }),
        })
      );
      await api2.expectValidationError("name", "名称不能为空");
    });
  });

  describe("GET /tasks", () => {
    it("获取所有任务列表", async () => {
      const api = await testApi(
        "获取所有任务列表",
        client.tasks.$get()
      );
      
      await api.expectSuccessAndValidate<Task[]>(tasks => {
        expect(Array.isArray(tasks)).toBe(true);
        expect(tasks.length).toBeGreaterThan(0);
        
        const createdTask = tasks.find(t => t.id === ctx.createdTaskId);
        expect(createdTask).toBeDefined();
        expect(createdTask?.name).toBe("Learn advanced testing");
      });
    });
  });

  describe("GET /tasks/:id", () => {
    it("获取特定任务", async () => {
      const api = await testApi(
        "获取特定任务",
        client.tasks[":id"].$get(createIdParam(ctx.createdTaskId!))
      );
      
      await api.expectSuccessAndValidate<Task>(task => {
        expect(task.id).toBe(ctx.createdTaskId);
        expect(task.name).toBe("Learn advanced testing");
        expect(task.done).toBe(false);
      });
    });

    it("获取不存在的任务返回404", async () => {
      const api = await testApi(
        "获取不存在的任务返回404",
        client.tasks[":id"].$get(createIdParam(99999))
      );
      
      await api.expectError(404, HttpStatusPhrases.NOT_FOUND);
    });
  });

  describe("PATCH /tasks/:id", () => {
    it("更新任务", async () => {
      const updateData = {
        name: "Learn advanced testing with Vitest",
        done: true,
      };
      
      const api = await testApi(
        "更新任务",
        client.tasks[":id"].$patch({
          ...createIdParam(ctx.createdTaskId!),
          json: updateData,
        })
      );
      
      await api.expectSuccessAndValidate<Task>(task => {
        expect(task.id).toBe(ctx.createdTaskId);
        expect(task.name).toBe(updateData.name);
        expect(task.done).toBe(updateData.done);
      });
    });

    it("验证空更新", async () => {
      const api = await testApi(
        "验证空更新",
        client.tasks[":id"].$patch({
          ...createIdParam(ctx.createdTaskId!),
          json: {},
        })
      );
      
      await api.expectValidationError("", ZOD_ERROR_MESSAGES.NO_UPDATES);
    });

    it("更新不存在的任务返回404", async () => {
      const api = await testApi(
        "更新不存在的任务返回404",
        client.tasks[":id"].$patch({
          ...createIdParam(99999),
          json: { name: "test" },
        })
      );
      
      await api.expectError(404, HttpStatusPhrases.NOT_FOUND);
    });
  });

  describe("DELETE /tasks/:id", () => {
    it("删除任务并验证删除", async () => {
      // 删除任务
      const deleteApi = await testApi(
        "删除任务",
        client.tasks[":id"].$delete(createIdParam(ctx.createdTaskId!))
      );
      deleteApi.expectStatus(204);
      
      // 验证删除
      const verifyApi = await testApi(
        "验证任务已被删除",
        client.tasks[":id"].$get(createIdParam(ctx.createdTaskId!))
      );
      await verifyApi.expectError(404, HttpStatusPhrases.NOT_FOUND);
    });

    it("删除不存在的任务返回404", async () => {
      const api = await testApi(
        "删除不存在的任务返回404",
        client.tasks[":id"].$delete(createIdParam(99999))
      );
      
      await api.expectError(404, HttpStatusPhrases.NOT_FOUND);
    });
  });
}); 