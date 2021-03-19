import { FastifyInstance, RouteOptions } from "fastify"

import { ApiService } from "../api.service"
import { saveRecordRoute } from "./save-record"

const routeList: Array<(apiService: ApiService) => RouteOptions> = [
  saveRecordRoute,
]

export function registerRoutes(
  fastifyInstance: FastifyInstance,
  appService: ApiService,
): void {
  routeList.forEach((routeFunc) => fastifyInstance.route(routeFunc(appService)))
}
