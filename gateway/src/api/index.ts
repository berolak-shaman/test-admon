import { fastify, FastifyInstance } from "fastify"
import { fastifySwagger } from "fastify-swagger"

import { AppConfigInterface, configService } from "../config"
import { redisService } from "../redis"
import { ApiService } from "./api.service"
import { registerRoutes } from "./routes"

const appConfig = configService.get<AppConfigInterface["app"]>("app")

const appService = new ApiService(redisService)

const app = fastify()
registerSwagger(app)
registerRoutes(app, appService)
listen(app)

function registerSwagger(app: FastifyInstance) {
  app.register(fastifySwagger, {
    routePrefix: "/swagger",
    openapi: {
      info: {
        title: "Admon test",
        description: "application documentation",
        version: appConfig.version,
      },
    },
    exposeRoute: true,
  })
}

async function listen(app: FastifyInstance) {
  try {
    await app.listen(appConfig.port, "0.0.0.0")
    console.log("app started")
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}
