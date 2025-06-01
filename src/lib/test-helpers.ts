import type { insertTasksSchema, selectTasksSchema } from "@/db/schema";
import type { ClientResponse } from "hono/client";
import type { StatusCode } from "hono/utils/http-status";
import { expect } from "vitest";
import type { z } from "zod";

// 从 Zod schema 推断类型
export type Task = z.infer<typeof selectTasksSchema>;
export type CreateTaskInput = z.infer<typeof insertTasksSchema>;

// 标准错误响应类型
export interface ErrorResponse {
  message: string;
}

// 验证错误响应类型
export interface ValidationErrorResponse {
  error: {
    issues: Array<{
      code: string;
      path: (string | number)[];
      message: string;
    }>;
    name: string;
  };
  success?: boolean;
}

// 测试数据工厂
export const testDataFactory = {
  createTask: (overrides?: Partial<CreateTaskInput>): CreateTaskInput => ({
    name: "Test Task",
    done: false,
    ...overrides,
  }),
  
  createLongTaskName: (length = 501): string => {
    return "a".repeat(length);
  },
};

// Hono ClientResponse 类型辅助
type AnyClientResponse = ClientResponse<any, any, any>;

// 响应断言辅助函数
export async function expectSuccessResponse<T>(
  response: AnyClientResponse,
  expectedStatus: StatusCode = 200
): Promise<T> {
  expect(response.status).toBe(expectedStatus);
  return response.json() as Promise<T>;
}

export async function expectErrorResponse(
  response: AnyClientResponse,
  expectedStatus: StatusCode
): Promise<ErrorResponse> {
  expect(response.status).toBe(expectedStatus);
  return response.json() as Promise<ErrorResponse>;
}

export async function expectValidationError(
  response: AnyClientResponse
): Promise<ValidationErrorResponse> {
  expect(response.status).toBe(422);
  return response.json() as Promise<ValidationErrorResponse>;
}

// ID 类型转换辅助函数
export function toIdParam(id: number | string): { id: string } {
  return { id: String(id) };
}

// 创建带类型断言的参数对象
export function createIdParam(id: number | string): any {
  return { param: { id: String(id) } };
}

// 测试用例组织辅助
export interface TestContext {
  createdTaskId?: number;
  tasks: Task[];
}

export function createTestContext(): TestContext {
  return {
    tasks: [],
  };
} 