import { FastifyInstance, RouteOptions } from "fastify"

import { ApiService } from "../api.service"
import { saveRecordRoute } from "./save-record"
import { saveRecordsRoute } from "./save-records"

const routeList: Array<(apiService: ApiService) => RouteOptions> = [
  saveRecordRoute,
  saveRecordsRoute,
]

export function registerRoutes(
  fastifyInstance: FastifyInstance,
  appService: ApiService,
): void {
  routeList.forEach((routeFunc) => fastifyInstance.route(routeFunc(appService)))
}
