import type { ClientResponse } from "hono/client";
import type { StatusCode } from "hono/utils/http-status";
import { expect } from "vitest";

// 简化的 API 测试辅助函数
export async function testApi(
  name: string,
  responsePromise: ClientResponse<any, any, any> | Promise<ClientResponse<any, any, any>>
) {
  const response = await responsePromise;
  
  return {
    // 期望成功并返回数据
    async expectSuccess<T>(expectedStatus: StatusCode = 200): Promise<T> {
      expect(response.status).toBe(expectedStatus);
      return response.json() as Promise<T>;
    },
    
    // 期望成功并验证数据
    async expectSuccessAndValidate<T>(
      validator: (data: T) => void | Promise<void>,
      expectedStatus: StatusCode = 200
    ): Promise<T> {
      expect(response.status).toBe(expectedStatus);
      const data = await response.json() as T;
      await validator(data);
      return data;
    },
    
    // 期望错误
    async expectError(expectedStatus: StatusCode, expectedMessage?: string) {
      expect(response.status).toBe(expectedStatus);
      const error = await response.json() as { message: string };
      if (expectedMessage) {
        expect(error.message).toBe(expectedMessage);
      }
      return error;
    },
    
    // 期望验证错误
    async expectValidationError(field: string, message: string) {
      expect(response.status).toBe(422);
      const error = await response.json() as any;
      
      if (field === "") {
        // 对于空字段（如空更新验证），检查第一个错误的消息
        expect(error.error.issues[0].message).toBe(message);
      } else {
        // 对于具体字段，检查路径和消息
        expect(error.error.issues[0].path[0]).toBe(field);
        expect(error.error.issues[0].message).toBe(message);
      }
      
      return error;
    },
    
    // 期望特定状态码（用于无内容响应）
    expectStatus(expectedStatus: StatusCode) {
      expect(response.status).toBe(expectedStatus);
    },
  };
}