import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

export const ZOD_ERROR_MESSAGES = {
  REQUIRED: "必填",
  EXPECTED_NUMBER: "期望数字，收到 NaN",
  NO_UPDATES: "未提供更新",
};

export const ZOD_ERROR_CODES = {
  INVALID_UPDATES: "无效的更新",
};

export const notFoundSchema = createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND);
