import redis, { RedisClient } from "redis"
import { promisify } from "util"

import { AppConfigInterface, configService } from "../config"

type ClassMethodsNames<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never
}[keyof T]

type RedisClientMethodsNames = ClassMethodsNames<RedisClient>

type PromisifyFunction<T> = T extends (...args: infer A) => infer R
  ? (...args: A) => Promise<R>
  : T

// T extends (err: any, result: any) => any ?

type PromisifyRedisMethods = {
  [K in RedisClientMethodsNames]: PromisifyFunction<RedisClient[K]>
}

export class RedisService {
  private readonly config = configService.get<AppConfigInterface["redis"]>(
    "redis",
  )
  private client: RedisClient
  private db: PromisifyRedisMethods

  constructor() {
    const client = (this.client = redis.createClient({
      ...this.config,
      retry_strategy: function (options) {
        if (options.error && options.error.code === "ECONNREFUSED") {
          // End reconnecting on a specific error and flush all commands with
          // a individual error
          return new Error("The server refused the connection")
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          // End reconnecting after a specific timeout and flush all commands
          // with a individual error
          return new Error("Retry time exhausted")
        }
        if (options.attempt > 10) {
          // End reconnecting with built in error
          return undefined
        }
        // reconnect after
        return Math.min(options.attempt * 100, 3000)
      },
    }))

    this.db = this.promisifyRedisClient(client)
  }

  async addToSet(key: string, record: string): Promise<void> {}

  private promisifyRedisClient(
    redisClient: RedisClient,
  ): PromisifyRedisMethods {
    return Object.entries(redisClient).reduce(
      (obj, [key, val]: [string, unknown]) => {
        if (typeof val === "function") {
          obj[key as RedisClientMethodsNames] = promisify(val).bind(redisClient)
        }
        return obj
      },
      {} as PromisifyRedisMethods,
    )
  }
}
