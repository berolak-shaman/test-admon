import { FastifyReply, FastifyRequest, RouteOptions } from "fastify"

import { AppConfigInterface, configService } from "../../config"
import { ApiService } from "../api.service"
import { SaveRecordRequestInterface } from "./interfaces/save-record.request.interface"

const config = configService.get<AppConfigInterface["clickhouse"]>("clickhouse")

export function saveRecordRoute(appService: ApiService): RouteOptions {
  return {
    method: "POST",
    url: "/record",
    schema: {
      summary: "записать данные в clickhouse",
      description: "добавляет данные в буфер для записи",
      tags: ["api"],
      body: {
        type: "object",
        properties: {
          tableName: {
            type: "string",
            default: config.defaultTable,
          },
          record: { type: "object" },
        },
        required: ["record"],
      },
      response: {
        202: {
          description: "добавлено в буфер для записи",
          type: "object",
          properties: { success: { type: "boolean" } },
        },
      },
    },
    handler: async function saveRecord(
      req: FastifyRequest,
      reply: FastifyReply,
    ) {
      await appService.saveRecord(req.body as SaveRecordRequestInterface)

      reply.status(202)
      reply.send()
    },
  }
}
