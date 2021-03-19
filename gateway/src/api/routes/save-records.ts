import { FastifyReply, FastifyRequest, RouteOptions } from "fastify"

import { AppConfigInterface, configService } from "../../config"
import { ApiService } from "../api.service"
import { SaveRecordsRequest } from "./interfaces/save-records.request.interface"

const config = configService.get<AppConfigInterface["clickhouse"]>("clickhouse")

export function saveRecordsRoute(apiService: ApiService): RouteOptions {
  return {
    method: "POST",
    url: "/records",
    schema: {
      summary: "записать массив данных в clickhouse",
      description: "добавляет массив данных в буфер для записи",
      tags: ["api"],
      body: {
        type: "object",
        properties: {
          tableName: {
            type: "string",
            default: config.defaultTable,
          },
          records: { type: "array", items: [{type: "object"}] },
        },
        required: ["records"],
      },
      response: {
        202: {
          description: "данные добавлены в буфер для записи",
          type: "object",
          properties: { success: { type: "boolean" } },
        },
      },
    },
    handler: async function saveRecords(
      req: FastifyRequest,
      reply: FastifyReply,
    ) {
      await apiService.saveRecords(req.body as SaveRecordsRequest)

      reply.status(202)
      reply.send()
    },
  }
}
